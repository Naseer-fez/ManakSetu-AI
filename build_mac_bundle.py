import os
import shutil
import zipfile
from pathlib import Path

def copy_tree(src, dst):
    if not os.path.exists(src):
        print(f"Warning: Source {src} does not exist. Skipping.")
        return
    if not os.path.exists(dst):
        os.makedirs(dst)
    
    for item in os.listdir(src):
        s = os.path.join(src, item)
        d = os.path.join(dst, item)
        if os.path.isdir(s):
            copy_tree(s, d)
        else:
            if not os.path.exists(d):
                shutil.copy2(s, d)

def bundle():
    print("Starting Mac bundle preparation...")
    
    root_dir = os.path.dirname(os.path.abspath(__file__))
    mac_dir = os.path.join(root_dir, "Mac")
    
    # Define models to copy
    llm_src = os.path.join(root_dir, "llm", "Qwen2.5-7B-Instruct-Q4_K_M.gguf")
    embed_src = os.path.join(root_dir, "llm", "paraphrase-multilingual-MiniLM-L12-v2")
    rerank_src = os.path.join(root_dir, "llm", "bge-reranker-v2-m3")
    db_src = os.path.join(root_dir, "vectordb", "data", "chroma")
    
    # Define destinations
    llm_dst_dir = os.path.join(mac_dir, "models", "llm")
    embed_dst = os.path.join(mac_dir, "models", "embedding", "paraphrase-multilingual-MiniLM-L12-v2")
    rerank_dst = os.path.join(mac_dir, "models", "reranker", "bge-reranker-v2-m3")
    db_dst = os.path.join(mac_dir, "vectordb", "data", "chroma")
    
    # Create dirs
    os.makedirs(llm_dst_dir, exist_ok=True)
    os.makedirs(os.path.dirname(embed_dst), exist_ok=True)
    os.makedirs(os.path.dirname(rerank_dst), exist_ok=True)
    os.makedirs(os.path.dirname(db_dst), exist_ok=True)
    
    # Copy LLM
    print("Copying LLM...")
    if os.path.exists(llm_src):
        dst_path = os.path.join(llm_dst_dir, os.path.basename(llm_src))
        if not os.path.exists(dst_path):
            shutil.copy2(llm_src, dst_path)
    else:
        print(f"Warning: {llm_src} not found.")

    # Copy Embeddings
    print("Copying Embedding Model...")
    copy_tree(embed_src, embed_dst)
    
    # Copy Reranker
    print("Copying Reranker Model...")
    copy_tree(rerank_src, rerank_dst)
    
    # Copy DB
    print("Copying Vector Database...")
    copy_tree(db_src, db_dst)
    
    print("Copy complete! You can now zip the 'Mac' directory and transfer it to the Mac machine.")
    print("To zip, you can use: Compress-Archive -Path Mac -DestinationPath Mac_Environment.zip")

if __name__ == "__main__":
    bundle()
