import os
import yaml
import logging
from typing import Any, AsyncGenerator, List, Dict
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import uvicorn
from llama_cpp import Llama
from sentence_transformers import SentenceTransformer, CrossEncoder
import chromadb

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mac_server")

# Load config
CONFIG_PATH = os.path.join(os.path.dirname(__file__), "config.yaml")
with open(CONFIG_PATH, "r") as f:
    config = yaml.safe_load(f)

try:
    from mac_prompts import MAC_SERVER_MASTER_PERSONA_PROMPT
except ImportError:
    MAC_SERVER_MASTER_PERSONA_PROMPT = ""

app = FastAPI(
    title="Mac Extension Node",
    description="Dedicated Mac node for LLM inference and Vector Search.",
    version="1.0.0",
)

# Global variables for models
llm: Llama | None = None
lora_loaded: bool = False
embed_model: SentenceTransformer | None = None
rerank_model: CrossEncoder | None = None
chroma_client: chromadb.PersistentClient | None = None
collection = None

def get_absolute_path(relative_path: str) -> str:
    """Resolve paths relative to this script directory."""
    return os.path.abspath(os.path.join(os.path.dirname(__file__), relative_path))

@app.on_event("startup")
def load_models():
    global llm, lora_loaded, embed_model, rerank_model, chroma_client, collection
    
    # Load LLM
    llm_rel_path = os.environ.get("MODEL_PATH", config["llm"].get("model_path"))
    llm_path = get_absolute_path(llm_rel_path) if llm_rel_path else ""

    lora_rel_path = os.environ.get("LORA_PATH", config["llm"].get("lora_path"))
    lora_path = get_absolute_path(lora_rel_path) if lora_rel_path else None
    lora_scale = float(os.environ.get("LORA_SCALE", config["llm"].get("lora_scale", 1.0)))

    if os.path.exists(llm_path):
        logger.info(f"Loading LLM from {llm_path}")
        llm_kwargs = {
            "model_path": llm_path,
            "n_ctx": int(os.environ.get("N_CTX", config["llm"].get("n_ctx", 32768))),
            "n_gpu_layers": int(os.environ.get("N_GPU_LAYERS", config["llm"].get("n_gpu_layers", -1))),
            "verbose": False,
        }
        if lora_path and os.path.exists(lora_path):
            logger.info(f"Attaching LoRA adapter from {lora_path} (scale: {lora_scale})")
            llm_kwargs["lora_path"] = lora_path
            llm_kwargs["lora_scale"] = lora_scale
            lora_loaded = True
        elif lora_path:
            logger.warning(f"LoRA adapter file not found at {lora_path}, loading base model only")

        llm = Llama(**llm_kwargs)
        logger.info(f"LLM loaded successfully with active context: {llm.n_ctx()} (LoRA active: {lora_loaded})")
    else:
        logger.warning(f"LLM model not found at {llm_path}")

    # Load Embedding Model
    emb_path = get_absolute_path(config["embedding"]["model_path"])
    if os.path.exists(emb_path):
        logger.info(f"Loading Embedding Model from {emb_path}")
        embed_model = SentenceTransformer(emb_path, device=config["embedding"]["device"])
    else:
        logger.warning(f"Embedding model not found at {emb_path}")
        
    # Load Reranker Model
    rerank_path = get_absolute_path(config["reranker"]["model_path"])
    if os.path.exists(rerank_path):
        logger.info(f"Loading Reranker Model from {rerank_path}")
        rerank_model = CrossEncoder(rerank_path, device=config["reranker"]["device"])
    else:
        logger.warning(f"Reranker model not found at {rerank_path}")
        
    # Load Vector DB
    db_path = get_absolute_path(config["vectordb"]["path"])
    if os.path.exists(db_path):
        logger.info(f"Loading ChromaDB from {db_path}")
        chroma_client = chromadb.PersistentClient(path=db_path)
        try:
            collection = chroma_client.get_collection(config["vectordb"]["collection_name"])
            logger.info("ChromaDB collection loaded.")
        except Exception as e:
            logger.error(f"Error loading collection: {e}")
    else:
        logger.warning(f"Vector DB not found at {db_path}")

# Request Models
class ReasonRequest(BaseModel):
    prompt: str
    system_prompt: str = ""
    stream: bool = False

class EmbedRequest(BaseModel):
    texts: List[str]

class RerankRequest(BaseModel):
    query: str
    documents: List[str]

class RagRequest(BaseModel):
    query: str
    top_k: int = 5
    system_prompt: str = ""

@app.get("/health")
def health():
    return {
        "status": "online",
        "llm_loaded": llm is not None,
        "lora_loaded": lora_loaded,
        "embedding_loaded": embed_model is not None,
        "reranker_loaded": rerank_model is not None,
        "vectordb_loaded": collection is not None
    }

@app.post("/reason")
def reason(req: ReasonRequest):
    if not llm:
        raise HTTPException(status_code=503, detail="LLM not loaded")
    
    messages = []
    effective_system_prompt = req.system_prompt.strip() if req.system_prompt and req.system_prompt.strip() else MAC_SERVER_MASTER_PERSONA_PROMPT
    if effective_system_prompt:
        messages.append({"role": "system", "content": effective_system_prompt})
    messages.append({"role": "user", "content": req.prompt})
    
    if req.stream:
        def stream_gen():
            stream = llm.create_chat_completion(
                messages=messages,
                max_tokens=config["llm"]["max_tokens"],
                temperature=config["llm"]["temperature"],
                stream=True
            )
            for chunk in stream:
                if 'choices' in chunk and len(chunk['choices']) > 0:
                    delta = chunk['choices'][0].get('delta', {})
                    if 'content' in delta:
                        yield delta['content']
        return StreamingResponse(stream_gen(), media_type="text/plain")
    else:
        res = llm.create_chat_completion(
            messages=messages,
            max_tokens=config["llm"]["max_tokens"],
            temperature=config["llm"]["temperature"]
        )
        return {
            "response": res["choices"][0]["message"]["content"],
            "source": "mac_m4",
            "lora_active": lora_loaded
        }

@app.post("/embed")
def embed(req: EmbedRequest):
    if not embed_model:
        raise HTTPException(status_code=503, detail="Embedding model not loaded")
    embeddings = embed_model.encode(req.texts).tolist()
    return {"embeddings": embeddings}

@app.post("/rerank")
def rerank(req: RerankRequest):
    if not rerank_model:
        raise HTTPException(status_code=503, detail="Reranker model not loaded")
    pairs = [[req.query, doc] for doc in req.documents]
    scores = rerank_model.predict(pairs).tolist()
    return {"scores": scores}

@app.post("/rag")
def rag(req: RagRequest):
    if not all([llm, embed_model, rerank_model, collection]):
        raise HTTPException(status_code=503, detail="Missing required models/db for RAG")
    
    # 1. Embed query
    query_emb = embed_model.encode([req.query]).tolist()[0]
    
    # 2. Retrieve from ChromaDB
    results = collection.query(
        query_embeddings=[query_emb],
        n_results=15
    )
    docs = results['documents'][0] if results['documents'] else []
    
    # 3. Rerank
    if not docs:
        context = "No relevant information found."
    else:
        pairs = [[req.query, doc] for doc in docs]
        scores = rerank_model.predict(pairs)
        ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
        top_docs = [doc for doc, score in ranked[:req.top_k]]
        context = "\n\n".join(top_docs)
    
    # 4. Generate
    prompt = f"Context information is below.\n---------------------\n{context}\n---------------------\nGiven the context information, answer the following query: {req.query}"
    
    reason_req = ReasonRequest(prompt=prompt, system_prompt=req.system_prompt, stream=False)
    return reason(reason_req)


if __name__ == "__main__":
    uvicorn.run(
        app,
        host=config["server"]["host"],
        port=config["server"]["port"]
    )
