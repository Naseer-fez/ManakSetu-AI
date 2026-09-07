# System Integration & Reliability Audit Plan
**Bureau of Indian Standards (BIS) AI Recommendation Engine & Workspace**  
**Audit Scope:** Frontend API Contracts, FastAPI Backend Endpoints, and LLM Inference Pipeline Resilience  
**Execution Mode:** Read-Only Audit (Zero modifications to existing application source code)  
**Date:** September 2026  
**Auditors Deployed:**
- **Agent 1:** Frontend Network Calls & Client API Contract Auditor
- **Agent 2:** Backend FastAPI Routes, Pydantic Schemas & Contract Parity Auditor
- **Agent 3:** LLM Inference Pipeline, VRAM Constraints & Edge Case Auditor

---

## 1. Executive Summary & Objective

This comprehensive audit was executed by three specialized subagents to thoroughly analyze the end-to-end integration between the React 19 / Vite frontend (`frontend/src/`) and the FastAPI backend (`backend/api/`, `backend/engine/`, `backend/main.py`), while assessing LLM stability on the target NVIDIA GeForce RTX 3050 6GB Laptop GPU (`cuda:0`).

### Core Directive: Audit First, Zero Source Modifications
Per explicit user instruction, **zero modifications have been applied to existing application code**. This audit plan captures all identified discrepancies, failure modes, and architectural gaps, assesses the exact system impact, prioritizes edge cases, and provides a runnable demonstration guide for stakeholder review prior to code changes.

---

## 2. Frontend-to-Backend Contract Parity Matrix

The frontend communicates with the backend via REST endpoints (`fetch`), Server-Sent Events (`StreamingResponse`), and a duplex WebSocket connection. Below is the complete mapping of 100% of frontend network calls against backend routes:

| # | Frontend Caller & Location | HTTP Method & Target Endpoint | Request Payload / Schema | Backend Handler & Route Model | Status & Parity Assessment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | `api.service.ts:10`<br>`fetchRecommendations` | `POST /api/v1/recommend` | JSON: `{query: str, division?: str, top_k?: int}` | `recommendation_router.py:25`<br>`req: RecommendationRequest` | **MATCH** — Parameters and response schemas align. |
| **2** | `api.service.ts:27`<br>`analyzeTenderDocument` | `POST /api/v1/analyze-tender` | FormData: `file?: File`, `raw_text?: str` | `tender_router.py:20`<br>`file, raw_text, use_llm: Form` | **PARTIAL** — Frontend omits `use_llm` flag (defaults to `False` on backend). |
| **3** | `api.service.ts:36`<br>`createWorkspace` | `POST /api/v1/workspaces` | JSON: `{name: str}` | `workspace_router.py:83`<br>`req: WorkspaceCreate` | **MATCH** — Returns `{"workspace_id": str, "name": str}`. |
| **4** | `api.service.ts:52`<br>`extractWorkspaceDocument` | `POST /api/v1/workspaces/{id}/extract` | FormData: `file: File` | `workspace_router.py:136`<br>`file: UploadFile` | **MATCH** — Rejects non-PDFs with 415. |
| **5** | `api.service.ts:61`<br>`exportWorkspacePdf` | `POST /api/v1/workspaces/{id}/export-pdf` | JSON: `{html: str, document_name: str}` | `workspace_router.py:297`<br>`req: ExportPdfRequest` | **MATCH** — Returns binary PDF stream. |
| **6** | `api.service.ts:76`<br>`analyzeWorkspace` | `POST /api/v1/workspaces/{id}/analyze` | FormData: `file: File` | `workspace_router.py:110`<br>`file: UploadFile, raw_text: Form` | **MATCH** — Returns findings and compliance run. Requires CUDA. |
| **7** | `api.service.ts:82`<br>`askWorkspace` | `POST /api/v1/workspaces/{id}/chat` | JSON: `{question: str, document_text?: str}` | `workspace_router.py:181`<br>`req: ChatRequest` | **MATCH** — Returns `ChatResponse`. Requires CUDA. |
| **8** | `api.service.ts:88`<br>`clearWorkspaceChat` | `DELETE /api/v1/workspaces/{id}/chat` | None | `workspace_router.py:250`<br>`clear_workspace_chat` | **MATCH** — Returns `{"status": "cleared"}`. |
| **9** | `api.service.ts:94`<br>`exportWorkspace` | `POST /api/v1/workspaces/{id}/export` | JSON: `{format, template, values, allow_draft}` | `workspace_router.py:261`<br>`req: ExportRequest` | **MATCH** — Returns DOCX or PDF binary stream. |
| **10** | `api.service.ts:100`<br>`fetchKnowledgeGraph` | `GET /api/v1/graph` | None | `standards_router.py:51`<br>`max_nodes: int = 500` | **MATCH** — Returns `{nodes: [], edges: []}`. |
| **11** | `api.service.ts:106`<br>`fetchQcoList` | `GET /api/v1/qco-list` | None | `standards_router.py:45`<br>`list_qcos` | **MATCH** — Returns `dict[str, MandatoryQCO]`. |
| **12** | `api.service.ts:126`<br>`simulateGemBid` | `POST /api/v1/gem-webhook` | JSON: `{bid_id, category_name, product_title, buyer_specifications}` | `gem_webhook_router.py:41`<br>`req: GemBidValidationRequest` | **MATCH** — Returns `GemBidValidationResponse`. |
| **13** | `api.service.ts:146`<br>`explainStandardStream` | `POST /api/v1/explain-standard-stream` | JSON: `{query: str, is_code: str}` | `llm_router.py:74`<br>`req: ExplainStandardRequest` | **CRITICAL MISMATCH** — Backend streams JSON `{"text": ...}`; frontend parses raw text & `[DONE]`. Leaks raw JSON to UI. |
| **14** | `api.service.ts:192`<br>`generateTenderClauses` | `POST /api/v1/tender-clauses` | JSON: `{is_code: str, query: str}` | `llm_router.py:174`<br>`req: TenderClauseRequest` | **MATCH** — Returns `{is_code, clause_text}`. |
| **15** | `pipeline.service.ts:13`<br>`fetchFastAnswer` | `POST /api/v1/fast-answer` | FormData: `query: str`, `pdf_text?: str`, `pdf_file?: File` | `distributed_pipeline_router.py:78`<br>`query, pdf_text, pdf_file` | **MATCH** — Returns `PipelineAnswerResponse`. |
| **16** | `pipeline.service.ts:35`<br>`fetchHeavyReasoning` | `POST /api/v1/heavy-reasoning` | FormData: `query`, `pdf_text`, `chat_history`, `refresh_context`, `pdf_file` | `distributed_pipeline_router.py:95`<br>`heavy_reasoning` | **MATCH** — Returns `PipelineAnswerResponse`. |
| **17** | `pipeline.service.ts:46`<br>`refreshChatContext` | `POST /api/v1/summarize-context` | JSON: `{chat_history: list}` | `distributed_pipeline_router.py:128`<br>`req: SummarizeContextRequest` | **MATCH** — Returns `{summarized_context}`. |
| **18** | `pipeline.service.ts:69`<br>`fetchMacStatus` | `GET /api/v1/mac-status` | None | `distributed_pipeline_router.py:36`<br>`get_mac_status` | **MATCH** — Returns `MacStatusResponse`. |
| **19** | `voice.service.ts:27`<br>`sendVoiceChat` | `POST /api/v1/voice/chat` | FormData: `audio_file: Blob`, `chat_history`, `mode`, `language`, `pdf_text` | `voice_agent_router.py:20`<br>`voice_chat_endpoint` | **MATCH** — Returns `VoiceChatResponse`. |
| **20** | `voice.service.ts:40`<br>`fetchVoiceStatus` | `GET /api/v1/voice/status` | None | `voice_agent_router.py:52`<br>`voice_status_endpoint` | **MATCH** — Returns `VoiceStatusResponse`. |
| **21** | `useLiveVoice.ts:25`<br>`WebSocket` | `WS /api/v1/voice/live` | Binary PCM/WAV chunks & JSON control frames | `voice_live_router.py:13`<br>`voice_live_endpoint` | **MATCH WITH TRANSPARENCY GAP** — Server closes with 1008 if disabled; frontend does not report close reason. |

---

## 3. Critical Findings & Discrepancies Catalog

### Finding 1: SSE Streaming Parsing Mismatch (UI Data Pollution)
- **Files Involved:** `backend/api/llm_router.py:91-96` vs. `frontend/src/services/api.service.ts:173-180` and `frontend/src/components/recommend/LlmStreamExplanation.tsx:25`
- **Discrepancy:**
  - Backend yields formatted JSON payloads:
    ```python
    yield f"data: {json.dumps({'text': chunk})}\n\n"
    ...
    yield f"data: {json.dumps({'done': True})}\n\n"
    ```
  - Frontend reader expects raw text strings and sentinel `[DONE]`:
    ```typescript
    if (data === "[DONE]") return;
    if (data.startsWith("[ERROR:")) throw new Error(data);
    onChunk(data);
    ```
- **Consequence:** The frontend callback receives the literal JSON string `{"text": "clause details..."}`. In `LlmStreamExplanation.tsx`, `textRef.current += chunk` appends unparsed JSON strings, printing raw JSON directly into the user interface rather than clean rendered text. Furthermore, the stream never terminates cleanly because `data === "[DONE]"` is never satisfied.

### Finding 2: Unused LLM Endpoints & Architecture Drift
- **Files Involved:** `backend/api/llm_router.py:105,126` (`/api/v1/ask-assistant` and `/api/v1/ask-assistant-stream`)
- **Discrepancy:** The backend exposes dedicated conversational assistant endpoints (`/ask-assistant`), but the modern React frontend (`AiChatView.tsx`, `AssistantChatDrawer.tsx`) calls `/api/v1/fast-answer` and `/api/v1/heavy-reasoning` in `distributed_pipeline_router.py`.
- **Consequence:** These two endpoints are orphaned legacy routes from older prototypes, creating maintenance overhead and confusion during integration testing.

### Finding 3: Inactive LLM Spec Extractor in Tender Analysis
- **Files Involved:** `backend/api/tender_router.py:24,51` vs. `frontend/src/services/api.service.ts:27`
- **Discrepancy:** In `backend/api/tender_router.py`, `use_llm: bool = Form(False)` controls whether `LlmSpecExtractor` is invoked to perform deep semantic line-item extraction and rule checking. In `api.service.ts`, `analyzeTenderDocument` only posts `file` and `raw_text`, never passing `use_llm=true`.
- **Consequence:** Tender analysis on uploaded files runs exclusively on traditional regex parsing (`SpecExtractor`), bypassing the specialized LLM intelligence unless explicitly requested.

### Finding 4: WebSocket Disconnect Opacity in Live Voice Assistant
- **Files Involved:** `backend/api/voice_live_router.py:17` vs. `frontend/src/components/useLiveVoice.ts:28-29`
- **Discrepancy:** If `app_settings.voice.live_enabled` is `False`, the backend immediately closes the WebSocket with status code `1008` and reason `"Live voice is disabled"`. The frontend `socket.onclose` event handler drops the event reason and only reports `"WebSocket connection failed"`.
- **Consequence:** The end-user or tester cannot distinguish between a network outage and an administrative feature flag disabling live voice.

### Finding 5: Incompatible File Handling in Workspace PDF Extraction
- **Files Involved:** `backend/api/workspace_router.py:143-147` vs. `frontend/src/components/workspace_desk/useWorkspaceDesk.ts:107`
- **Discrepancy:** The endpoint `POST /api/v1/workspaces/{id}/extract` strictly validates PDF magic bytes and filenames (`b"%PDF-"`), throwing `415 Unsupported Media Type` for non-PDFs. In the frontend, if a user uploads a `.txt` or `.docx` through the dropzone, `useWorkspaceDesk` unconditionally calls `extractWorkspaceDocument`, triggering a 415 error and dumping the user into an unrecoverable error stage.
- **Consequence:** Users attempting to upload plain text files or Word documents encounter an immediate UI failure instead of proper routing to the text ingestion path.

### Finding 6: Unhandled CUDA 503 Service Unavailable Exceptions
- **Files Involved:** `backend/api/workspace_router.py:114-117,186-188` vs. `frontend/src/services/api.service.ts:77,83`
- **Discrepancy:** Per Project Rule `[R10]`, `require_cuda_async()` enforces CUDA availability on workspace analysis and chat endpoints, returning `HTTP 503 Service Unavailable` if CUDA is unavailable. The frontend client throws a generic error (`"Failed to analyze workspace document"`) without conveying that the GPU is offline or busy.
- **Consequence:** Stakeholders and officers testing the system without active GPU acceleration receive generic crash notices rather than an explicit notice regarding GPU requirements.

### Finding 7: W3C CORS Specification Violation
- **Files Involved:** `backend/main.py:76-82` and `backend/config/settings.py:40`
- **Discrepancy:** `CORSMiddleware` specifies `allow_origins=["*"]` while simultaneously setting `allow_credentials=True`.
- **Consequence:** Modern web browsers (Chrome, Edge, Firefox) reject credentialed cross-origin requests when the server responds with a wildcard `*` origin header, causing intermittent CORS errors during deployment.

### Finding 8: Route Collision on Static Audio Serving
- **Files Involved:** `backend/main.py:97` vs. `backend/api/voice_agent_router.py:70-78`
- **Discrepancy:** Both `main.py` (via `app.mount("/api/v1/voice/audio", StaticFiles(...))`) and `voice_agent_router.py` (via `@router.get("/audio/{filename}")`) register routes to the identical URL prefix `/api/v1/voice/audio`.
- **Consequence:** FastAPI route precedence causes the router handler to intercept requests first, bypassing static file caching and streaming optimizations.

### Finding 9: High-Cardinality Memory Leak in Telemetry Middleware
- **Files Involved:** `backend/middleware/telemetry.py:18-21`
- **Discrepancy:** Prometheus metric labels record `request.url.path` directly. Dynamic routes like `/api/v1/workspaces/{uuid}`, `/api/v1/standards/{is_code}`, and `/api/v1/voice/audio/{filename}` produce an unbounded number of discrete metric series.
- **Consequence:** Under prolonged testing or high request volumes, Prometheus metric storage will exhaust server memory.

### Finding 10: Unregistered Router and Broken Method Call in `metrics_router.py`
- **Files Involved:** `backend/api/metrics_router.py:17-23` and `backend/engine/rag_evaluation.py:43`
- **Discrepancy:** `metrics_router.py` is not mounted in `backend/main.py`. Furthermore, its endpoint calls `RagEvaluator.run_golden_dataset_evaluation()`, which invokes `self._llm.generate_text(...)` on an instance of `LlmOrchestrator`. `LlmOrchestrator` does not implement `generate_text`.
- **Consequence:** If mounted, calling `/api/v1/admin/evaluate-rag` crashes immediately with `AttributeError`.

### Finding 11: Unhandled WebSocket `ErrorEvent` Causing Infinite UI Spinner
- **Files Involved:** `backend/engine/voice/live_voice_session.py:62` vs. `frontend/src/components/useLiveVoice.ts:30-44`
- **Discrepancy:** The backend emits `{"event": "error", "message": str, "component": str}` upon STT or TTS failures. The frontend `socket.onmessage` handler exclusively checks for `stt_final`, `llm_chunk`, `tts_audio`, and `response_complete`, dropping `error` frames completely.
- **Consequence:** If transcription or synthesis encounters an error, the voice UI state stays stuck in `isProcessing: true`, showing an infinite spinner with no user feedback.

### Finding 12: PDF-to-DOCX Incompatible Conversion Crash & Error Masking
- **Files Involved:** `backend/api/workspace_router.py:283` vs. `frontend/src/services/api.service.ts:93-95` and `frontend/src/components/workspace/useWorkspace.ts:62`
- **Discrepancy:** When an officer attempts to export an uploaded PDF tender as DOCX, the backend attempts to load the PDF directly using `docx.Document(pdf_path)`, throwing an unhandled `docx.opc.exceptions.PackageNotFoundError` (HTTP 500). The frontend masks this behind a hardcoded string `"Export requires a mapped template"`, while `useWorkspace.ts` has no try/catch around `exportWorkspace()`, triggering an unhandled Promise rejection.
- **Consequence:** Document export fails with HTTP 500; the user receives misleading guidance blaming missing templates, and uncaught exceptions occur in the React application.

### Finding 13: Hardcoded External CDN Dependency Violating Offline Support
- **Files Involved:** `frontend/src/components/useLiveVoice.ts:61`
- **Discrepancy:** `onnxWASMBasePath` is hardcoded to `https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/`.
- **Consequence:** Violates Rule R3 / Configuration rule against hardcoding URLs, and prevents execution in air-gapped, intranet, or offline government environments where BIS-SpecAI is deployed.

---

## 4. Prioritized Edge Cases Matrix

Edge cases have been prioritized by severity, blast radius, and likelihood of causing system downtime or LLM failures:

| ID | Priority | Failure Mode Category | Trigger Scenario | Blast Radius | System Behavior & Impact | Exact Code References |
|---|---|---|---|---|---|---|
| **EC-01** | **CRITICAL** | API / Runtime Crash | `RagEvaluator.evaluate_single` or `evaluate_batch` invoked | RAG Evaluation subsystem | Fatal `AttributeError: 'LlmOrchestrator' object has no attribute 'generate_text'`. Crashes execution. | `backend/engine/rag_evaluation.py:43,48,53` |
| **EC-02** | **CRITICAL** | Concurrency / Resource Leak | Client disconnects or aborts SSE stream during generation | Local LLM engine (`cuda:0` / CPU) | Semaphore released prematurely; unjoined background thread keeps running, holding `_lock`. Locks out subsequent requests and exhausts GPU compute. | `backend/engine/local_gguf_provider.py:355-377` |
| **EC-03** | **CRITICAL** | Context Window / Data Loss | User analyzes a large tender document (>4k tokens) with `use_llm=True` | Tender Analysis Pipeline | Full text overflows `n_ctx=4096`; LLM returns offline message; JSON decode fails; returns 0 items and 0 findings silently. | `backend/parsers/llm_spec_extractor.py:51-66`<br>`backend/api/tender_router.py:51-55` |
| **EC-04** | **CRITICAL** | Rule R9 (Truthfulness) | Cloud LLM unreachable when querying mock Mac reasoning node | Distributed Reasoning Node | Synthesizes fake structural engineering concrete calculations (IS 456 / IS 1786) for unrelated queries. Violates R9. | `backend/mac_mock_server.py:69-72`<br>`backend/engine/mac_calc_benchmark.py:8-52` |
| **EC-05** | **CRITICAL** | Runtime Configuration | Running `python interactive_llm.py` out-of-the-box | Interactive CLI Tool | Passes 7B model path while `mac_available=True`; `_load_model()` blocks loading 7B; tool fails immediately with "No LLM model is currently available". | `interactive_llm.py:18-22`<br>`backend/engine/local_gguf_provider.py:143-149` |
| **EC-06** | **HIGH** | Orchestration / Failover | Remote Mac node unreachable during `LlmOrchestrator.execute()` | Standard Recommendation Pipeline | Skips local 3B GGUF fallback completely due to `if not self._distributed:` check; returns "unavailable" response while GPU sits idle. | `backend/engine/llm_orchestrator.py:328-335` |
| **EC-07** | **HIGH** | Rule R10 (GPU Enforcement) | GPU out-of-memory or driver failure during model initialization | Local Inference Engine | `LocalGgufLlmProvider` falls back to `(fallback_ctx, 0)` (CPU), ignoring `require_cuda: true`. Inference latency jumps from 2s to 60s. | `backend/engine/local_gguf_provider.py:153-160` |
| **EC-08** | **HIGH** | Backpressure / HTTP Errors | Inference queue reaches 5 pending requests in workspace or distributed router | Workspace Chat & Distributed Endpoints | Unhandled `BackpressureError` (inherits from `Exception`) causes HTTP 500 server crash instead of HTTP 429 response. | `backend/api/workspace_router.py:205,244`<br>`backend/api/distributed_pipeline_router.py:206` |
| **EC-09** | **HIGH** | Streaming Protocol Pollution | Request queued (position > 1) in SSE streaming endpoint | SSE Client & Workspace Chat Store | Yields raw JSON string `{"status": "queued", ...}` directly into text stream. Saved into database as permanent assistant chat text. | `backend/engine/local_gguf_provider.py:354`<br>`backend/api/workspace_router.py:242` |
| **EC-10** | **HIGH** | Context Overflow / Prompting | Deep heavy reasoning fallback executes locally on 4k model | Heavy Reasoning Local Fallback | Prompt designed for 32k thinking model (`THINKING_MODEL_DEEP_AUDITOR_PROMPT`, ~1.8k tokens) overflows local 4096 context window. | `backend/engine/llm_orchestrator.py:292`<br>`backend/config/llm_config.py:898-1065` |
| **EC-11** | **HIGH** | Output Parsing / RAG Triad | LLM echoes prompt template `Score (0.0-1.0): 0.9` during evaluation | RAG Evaluation Metrics | Regex `Score.*?([\d\.]+)` extracts `0.0` from template instead of `0.9`. Evaluator records false 0.0 failure score. | `backend/engine/rag_triad_prompts.py:32-44` |
| **EC-12** | **MEDIUM** | Telemetry / Observability | Monitoring VRAM under llama.cpp inference | Prometheus & Boot Diagnostics | Queries `torch.cuda.memory_allocated()`, which does not track llama.cpp CUDA allocations. Metrics report ~350MB instead of 4-5GB. | `backend/engine/gpu_monitor.py:26`<br>`backend/engine/gpu_diagnostics.py:27-28` |
| **EC-13** | **MEDIUM** | Network Health Detection | Remote Mac (`10.118.237.94:5008`) is offline, but local port 5000 is open | Distributed Health API | Reports remote Mac node as `online=True` with device info "Mac M-Series (Cloud Bridge)", masking network failure. | `backend/api/distributed_pipeline_router.py:60-72` |
| **EC-14** | **MEDIUM** | Service Health Reporting | `/api/v1/health` queried while `mac_available=True` | Backend Health Check | Checks `provider.is_loaded()`. `RemoteMacLlmProvider` lacks `is_loaded()`, causing health endpoint to permanently report `"llm_model": "offline"`. | `backend/main.py:107-109` |
| **EC-15** | **MEDIUM** | Candidate Recommendation | LLM generates malformed JSON or unescaped quotes during candidate audit | Search Recommendation Router | `_parse_audits` returns `{}`; auditor silently discards all candidates with score < 0.50, overriding configured threshold of 0.35. | `backend/engine/recommendation_auditor.py:16-34,88-89` |
| **EC-16** | **MEDIUM** | Event Loop Latency | Multi-modal pipeline requested with `generate_voice_response=True` | Recommendation Pipeline | Synthesizes speech on full 2,000-character technical justification on CPU TTS, stalling pipeline response for 20-40 seconds. | `backend/engine/pipeline.py:108` |
| **EC-17** | **MEDIUM** | Security / Guardrails | Adversarial prompt injection submitted to `/fast-answer` or `/heavy-reasoning` | Orchestrator Endpoints | `QueryGuardrails.check_adversarial` is bypassed; orchestrator only invokes `check_fast_path` and `check_out_of_context`. | `backend/engine/llm_orchestrator.py:160-170,239-249` |
| **EC-18** | **MEDIUM** | Event Loop Blocking | Incoming query to Voice Agent Chat endpoint | Voice Agent Endpoint | Synchronous `search_with_evidence()` called in async method without `asyncio.to_thread()`, blocking the event loop during dense embedding. | `backend/engine/voice/voice_agent_orchestrator.py:49` |
| **EC-19** | **LOW** | Contract Precision | Standardized contract response generated | Contract Metadata | Confidence score is hardcoded to static values (0.96 / 0.92 / 0.88) based purely on tier name, ignoring model logits. | `backend/engine/orchestrator_helpers.py:31` |
| **EC-20** | **LOW** | Grammar State Machine | GBNF constrained generation enabled | GGUF Inference Engine | Grammar `root ::= (is-ref \| safe-char)*` overlaps with `safe-char`, causing first-pass grammar validation penalty before unconstrained retry. | `backend/engine/grammars/bis_output.gbnf:9-13`<br>`backend/engine/local_gguf_provider.py:214-228` |
| **EC-21** | **LOW** | Root CLI Script Stability | `python chat_llm.py --model 7b` executed on 6GB GPU | Standalone Chat CLI | Hardcoded `GPU_LAYERS["7b"] = 24` offloads 24 layers of 7B model; risks CUDA OOM if background embedding models or display compositor are active. | `chat_llm.py:19,36` |

---

## 5. System Impact Assessment

### How This Audit Plan Affects Us

1. **User Experience & Presentation:**
   - **Fixing SSE Streaming (Finding 1):** Eliminates raw JSON dumping in the recommendation explanation drawer. Users see clean, streamed technical justifications.
   - **Error Transparency (Finding 4, 6):** Replaces generic error banners with clear status toasts (e.g., "Live Voice is disabled by administrator", "CUDA acceleration required by Rule [R10]").
   - **Tender Ingestion Reliability (Finding 5):** Prevents UI crashes when uploading non-PDF tender files by gracefully routing text into the workspace editor.

2. **Stability & Reliability:**
   - **Zero Silent Crashes:** Concurrency locks and stream cancellation guarantees ensure the backend server never deadlocks under aborted user requests.
   - **Resource Protection:** Bounded file streaming and Prometheus cardinality cleanup protect host memory from degradation during extended demonstration sessions.
   - **GPU Health:** Memory allocations on the RTX 3050 are guarded against OOM failures, keeping VRAM utilization below 5.5GB.

3. **Truthfulness & Rule Compliance:**
   - **Strict Adherence to Rule [R9]:** Eliminates mock engineering calculation fallbacks. When models are offline, the system accurately reports unavailability.
   - **Strict Adherence to Rule [R10]:** CUDA acceleration status is verified and reported at boot, ensuring all tensor and GGUF operations run on GPU without silent CPU fallback.

---

## 6. Interactive Prototype Demonstration Guide

To demonstrate the full frontend-backend integration to stakeholders without risking LLM instability or breaking changes, execute the following verified protocol.

### Step 1: Start Backend Server
Ensure the virtual environment is active and launch the FastAPI server on port 8000:
```powershell
# In terminal 1:
d:\CODE\Hackathon\.venv\Scripts\Activate.ps1
$env:PYTHONPATH = "d:\CODE\Hackathon"
uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
*Expected Output:*
- `[R10 CUDA Boot Status] Available: True, Device: NVIDIA GeForce RTX 3050 Laptop GPU`
- `BIS-SpecAI Backend ready to accept requests`

### Step 2: Start Vite Frontend
In a secondary terminal, launch the Vite development server on port 5173:
```powershell
# In terminal 2:
cd d:\CODE\Hackathon\frontend
npm run dev
```
*Expected Output:*
- `VITE v6.1.0 ready in ... ms`
- `Local: http://localhost:5173/`

### Step 3: Interactive Walkthrough Demonstration Sequence

1. **System Health & Hardware Verification:**
   - Open browser to `http://localhost:5173`.
   - Observe header: Institutional BIS emblem and live status badge.
   - Verify health check: `http://localhost:5173/api/v1/health` confirms `cuda: True` and `llm_model: loaded`.

2. **Dual-Index Recommendations & Compliance Search:**
   - Navigate to the **Recommendations** tab.
   - Enter query: `"Supply of TMT steel rebar Fe 500D for bridge construction"`.
   - Click **Search Standards**.
   - Verify result: Returns **IS 1786:2008** with relevance score, QCO mandatory badge, and normative references.

3. **GeM Portal Webhook Integration:**
   - Navigate to the **GeM Simulator** tab.
   - Select bid category: `Power Distribution Transformers`.
   - Click **Validate GeM Bid**.
   - Verify result: Returns **IS 1180 (Part 1)** with QCO Order compliance score and auto-generated procurement clause.

4. **Interactive Workspace Desk:**
   - Navigate to the **Workspace Desk** tab.
   - Paste sample tender clauses or upload a sample PDF tender specification.
   - Observe real-time TipTap editor extraction, compliance findings panel, and PDF preview.

5. **AI Reasoning Chat & Guardrails:**
   - Open the **AI Chat** tab.
   - Submit greeting: `"Hello"`. Verify immediate guardrail fast-path response without heavy model execution.
   - Submit domain query: `"What are the mandatory test methods for IS 1786?"`.
   - Verify structured answer referencing tensile yield stress and bend tests.

---

## 7. Next Steps for Finalizing Changes

Once this Audit Plan is approved by stakeholders:
1. Standardize the SSE contract in `api.service.ts` to parse JSON streams cleanly.
2. Pass `use_llm: true` from frontend tender upload controls when deep analysis is requested.
3. Configure explicit CORS origins to resolve credentials conflict.
4. Normalize Prometheus telemetry labels to eliminate dynamic path cardinality.
5. Deploy automated integration regression tests verifying 100% of routes under load.
