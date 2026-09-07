# BIS-SpecAI Frontend Integration & Redesign Guide

This document serves as the complete guide for the frontend of the BIS-SpecAI project. It details the architecture, file structure, available pages (views), backend connections (services), and endpoints. Use this guide to completely redesign or modify the frontend.

---

## 1. Architecture & Tech Stack
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS (`tailwind.config.js`)
- **Language**: TypeScript (`tsconfig.json`)
- **State Management**: React `useState` / `useEffect` (No complex Redux/Zustand overhead for basic routing; routing is managed via `activeTab` state in `App.tsx`).
- **Base API URL**: `http://localhost:8000/api/v1` (configured via `VITE_API_BASE_URL` in `.env` or defaults to `/api/v1`).

---

## 2. Directory Structure (`frontend/src`)

- `App.tsx` / `main.tsx`: Entry points and simple state-based router.
- `/components`: Contains all UI views, pages, and reusable components.
- `/services`: Contains all API integration layers connecting the UI to the Python FastAPI backend.
- `/types`: Contains TypeScript interfaces aligning with backend Pydantic models.
- `/lib`: Utility functions and helpers.

---

## 3. Pages & Views (Routing)

The application uses a simple tab-based routing system in `App.tsx`. Here are the primary views available to redesign:

### 3.1 Recommendation Tab (`RecommendationTab.tsx`)
- **Purpose**: Primary search interface to find Indian Standards based on procurement queries or descriptions.
- **Features**: Text search, division filtering (e.g., ETD, CED), displaying standard cards with relevance scores, mandatory QCO flags, and allied standard relations.
- **Backend Connection**: `fetchRecommendations`, `fetchStandards`.

### 3.2 Tender Analyzer (`TenderAnalyzerView.tsx`)
- **Purpose**: Interface for users to upload Tender PDFs, DOCX, or paste raw specifications for compliance auditing.
- **Features**: File upload, displaying parsed document items, compliance violations (High/Medium/Low), QCO coverage percentage, and an auto-generated legally sound tender clause.
- **Backend Connection**: `analyzeTenderDocument`.

### 3.3 Voice Assistant (`VoiceAssistantView.tsx`)
- **Purpose**: Multimodal chat interface designed for voice-first interactions.
- **Features**: Push-to-talk button, voice transcription display, text-to-speech audio player, handling "fast" vs "thinking" LLM modes.
- **Backend Connection**: `sendVoiceChat`, `fetchVoiceStatus`, multimodal pipeline endpoints.

### 3.4 Voice Live Panel (`VoiceLivePanel.tsx`)
- **Purpose**: A real-time dashboard displaying live transcriptions and extracted insights from continuous voice input.
- **Features**: Live transcript stream, audio visualizers, and immediate insight extraction.
- **Backend Connection**: Uses `useLiveVoice.ts` hook and related voice services.

### 3.5 Knowledge Graph (`KnowledgeGraphView.tsx`)
- **Purpose**: Interactive network visualization of Indian Standards and their dependencies.
- **Features**: Nodes and edges showing normative references, safety standards, and hierarchy.
- **Backend Connection**: `fetchKnowledgeGraph`.

### 3.6 QCO Explorer (`QcoExplorerView.tsx`)
- **Purpose**: A tabular or list database registry of all active Mandatory Quality Control Orders in India.
- **Features**: Searching, filtering by ministry/order number, and viewing strict compliance dates.
- **Backend Connection**: `fetchQcoList`.

### 3.7 GeM Simulator (`GemSimulatorView.tsx`)
- **Purpose**: Simulates the Government e-Marketplace (GeM) bid validation webhook before a tender goes live.
- **Features**: Form to input bid ID, category, and specs. Displays compliance score, primary standards, and recommended clauses.
- **Backend Connection**: `simulateGemBid`.

### 3.8 Global Components
- **Navbar (`Navbar.tsx`)**: Top navigation bar to switch between the active tabs.
- **Assistant Chat Drawer (`AssistantChatDrawer.tsx`)**: A floating or slide-out drawer available globally. It provides a conversational procurement assistant aware of the current context (e.g., currently uploaded Tender PDF). Connected via `askProcurementAssistantStream`.

---

## 4. Services & Backend Connections (`src/services/`)

The frontend communicates with the backend via three primary service files. All functions handle JSON mapping and `FormData` encoding for file uploads.

### 4.1 `api.service.ts` (Core App Endpoints)
- **`fetchRecommendations(query, division, top_k)`** $\rightarrow$ `POST /api/v1/recommend`
- **`analyzeTenderDocument(file, rawText)`** $\rightarrow$ `POST /api/v1/analyze-tender`
- **`fetchStandards(division, query)`** $\rightarrow$ `GET /api/v1/standards`
- **`fetchKnowledgeGraph()`** $\rightarrow$ `GET /api/v1/graph`
- **`fetchQcoList()`** $\rightarrow$ `GET /api/v1/qco-list`
- **`simulateGemBid(bidId, category, title, spec)`** $\rightarrow$ `POST /api/v1/gem-webhook`
- **`explainStandard(query, isCode)`** $\rightarrow$ `POST /api/v1/explain-standard`
- **`explainStandardStream(query, isCode, onChunk)`** $\rightarrow$ `POST /api/v1/explain-standard-stream` (Server-Sent Events)
- **`askProcurementAssistant(question, pdfText, chatHistory)`** $\rightarrow$ `POST /api/v1/ask-assistant`
- **`askProcurementAssistantStream(question, onChunk, pdfText, chatHistory)`** $\rightarrow$ `POST /api/v1/ask-assistant-stream` (Server-Sent Events)

### 4.2 `pipeline.service.ts` (LLM & Multimodal Processing)
- **`processMultimodalPipeline(formData)`** $\rightarrow$ `POST /api/v1/pipeline/process` (Handles Voice + Image + Text)
- **`transcribeVoiceAudio(audioBlob)`** $\rightarrow$ `POST /api/v1/voice/transcribe`
- **`synthesizeSpeechAudio(text)`** $\rightarrow$ `POST /api/v1/voice/synthesize`
- **`classifyTechnicalImage(imageFile)`** $\rightarrow$ `POST /api/v1/image/classify`
- **`fetchFastAnswer(query, pdfFile, pdfText)`** $\rightarrow$ `POST /api/v1/fast-answer` (Tier 1 LLM: Qwen 2.5 7B)
- **`fetchHeavyReasoning(query, pdfFile, pdfText, chatHistory, refreshContext)`** $\rightarrow$ `POST /api/v1/heavy-reasoning` (Tier 2 LLM: DeepSeek R1 14B)
- **`refreshChatContext(chatHistory)`** $\rightarrow$ `POST /api/v1/summarize-context`

### 4.3 `voice.service.ts` (Dedicated Voice Chat Endpoints)
- **`sendVoiceChat(audioBlob, chatHistory, mode, language, pdfText)`** $\rightarrow$ `POST /api/v1/voice/chat`
- **`fetchVoiceStatus()`** $\rightarrow$ `GET /api/v1/voice/status`

---

## 5. Design & Redesign Recommendations

When redesigning the UI, keep the following data flows in mind:
1. **Streaming Responses**: The assistant drawer and explanation cards rely on Server-Sent Events (SSE). UI components must be capable of rendering markdown progressively as chunks arrive.
2. **File Uploads**: The Tender Analyzer and Pipeline routes use `multipart/form-data`. Ensure file dropzones and inputs correctly capture `File` objects to append to `FormData`.
3. **State Sharing**: The `App.tsx` lifts the `pdfText` state up so that if a user parses a tender in `TenderAnalyzerView`, the `AssistantChatDrawer` can use that context to answer questions about the document. Maintain this shared state logic in your redesign.
4. **Modularity**: Components like `GlassSpecCard`, `ViolationCard`, and `RecommendationCard` are highly reusable. Redesign them as atomic elements that can be slotted into various tabs.

---

## 6. Current Frontend Direction: Simple Workspace-First UX

The redesign should stay backend-first and utilitarian. The officer should be able to move from an uploaded tender to an evidence-backed review without navigating a complex dashboard.

### Primary workflow

1. **Create workspace** - create a local tender workspace and retain its ID in React state.
2. **Upload and check** - send a PDF, DOCX, TXT, or image as multipart form data.
3. **Review result** - show QCO coverage, blocking findings, evidence, and the automatically proposed revision.
4. **Chat with assistant** - ask questions about the uploaded tender or a BIS clause.
5. **Approve revision** - explicitly approve the proposed revision after reviewing changes.
6. **Create PDF / Create Document** - export a reviewed template or a clearly marked draft.

The existing `WorkspaceView.tsx` is the starter implementation for this flow. Keep it visually plain: one workspace panel, one upload control, a findings list, a chat input, and two export buttons. Avoid a new visual design system or a large multi-page shell.

### Suggested screen layout

```text
Navbar
  Standards | Auditor | Workspace | QCOs | Graph | GeM | Voice

Workspace screen
  [Create workspace] [Choose file] [Upload and check]
  Workspace status and short ID
  ┌ Compliance summary ─────────────────────────┐
  │ QCO coverage | Dataset version | Export gate │
  │ Findings: severity, category, action         │
  │ Proposed revision changes                    │
  └──────────────────────────────────────────────┘
  [Ask about this tender................................] [Chat]
  [Create PDF] [Create Document]
```

For each finding, lead with a plain-language state (`Needs verification`, `Non-compliant`, or `Compliant`), then show category, corrective action, and evidence location. Never show a green compliance badge when the API says `NEEDS_VERIFICATION` or `export_blocked: true`.

## 7. Workspace API Contract

The workspace API base is the same `API_BASE` used by the other services: `VITE_API_BASE_URL` when supplied, otherwise `/api/v1`.

### Create and inspect a workspace

`POST /api/v1/workspaces`

```json
{ "name": "New tender workspace" }
```

Response:

```json
{ "workspace_id": "uuid", "name": "New tender workspace" }
```

`GET /api/v1/workspaces/{workspace_id}` returns the workspace name, creation time, and uploaded document summaries (`id`, `name`, `sha256`). Use this to restore a workspace view after a refresh.

### Upload and analyse

`POST /api/v1/workspaces/{workspace_id}/analyze`

Send `multipart/form-data` with a `file` field. For pasted text, send a `raw_text` form field instead. Do not set the `Content-Type` header manually when using `FormData`.

The response contains:

- `report`: the existing `TenderAnalysisReport` shape (`items`, `compliance_issues`, `mandatory_qco_coverage`, `complete_spec_clause_text`, and `raw_text`).
- `compliance_run`: `dataset_version`, `coverage`, `findings`, and `export_blocked`.
- `revision`: an immutable proposed revision with `revision_id`, `status`, and `changes`.

Important UI rules:

- Treat the bundled standards/QCO data as hackathon guidance and display the returned `dataset_version`.
- A finding with `state: NON_COMPLIANT` or `NEEDS_VERIFICATION` must remain visible until resolved.
- `export_blocked: true` means the officer may inspect a draft but must not be told that the tender is compliant.

### Template registration

`POST /api/v1/workspaces/{workspace_id}/templates`

Use this when the officer supplies a template profile or when a built-in template is selected. The request matches `TemplateProfile`:

```json
{
  "template_id": "gem-static-v1",
  "name": "GeM tender template",
  "source": "officer-uploaded",
  "version": "1",
  "format": "static_pdf",
  "approved": false,
  "fields": [
    {
      "field_id": "technical_clause",
      "label": "Technical clause",
      "value_type": "text",
      "required": true,
      "page": 2,
      "x": 72,
      "y": 180,
      "width": 420,
      "height": 80,
      "max_chars": 600,
      "font_size": 9
    }
  ]
}
```

The frontend should provide a small “Template mapping review” step before setting `approved: true`. Unmapped PDF coordinates, missing fields, or overflow are backend errors, not reasons to silently truncate text in the UI.

### Chat

`POST /api/v1/workspaces/{workspace_id}/chat`

```json
{
  "question": "Which QCO evidence is missing for item 1?",
  "document_text": "optional extracted tender text"
}
```

Response:

```json
{
  "question": "Which QCO evidence is missing for item 1?",
  "answer": "...",
  "grounded": true
}
```

Persist the answer in the current workspace view. Show a clear unavailable state for HTTP 429/503 rather than fabricating an answer.

### Approve and export

`POST /api/v1/workspaces/{workspace_id}/revisions/{revision_id}/approve` marks the generated revision as `APPROVED` without changing its text.

`POST /api/v1/workspaces/{workspace_id}/export`

```json
{
  "format": "pdf",
  "template": { "...": "TemplateProfile" },
  "values": { "technical_clause": "Generated clause text" },
  "revision_id": "approved-revision-uuid",
  "allow_draft": false
}
```

The response is a file download. Use `Blob`, create an object URL, trigger a temporary anchor download, and revoke the URL. Use `allow_draft: true` only for a visibly labelled draft action. Compliance-checked export is rejected when the template, revision, OCR mapping, or compliance run is blocked.

## 8. TypeScript State and Service Boundaries

Keep API types in `frontend/src/types/index.ts` and all HTTP calls in `frontend/src/services/api.service.ts`. The workspace state can remain local to `WorkspaceView` for the first release:

```ts
type WorkspaceState = {
  workspaceId: string | null;
  selectedFile: File | null;
  analysis: WorkspaceAnalysis | null;
  question: string;
  answer: string;
  busy: boolean;
  error: string | null;
};
```

Recommended component split, keeping every component below 100 lines:

- `WorkspaceView`: orchestration and state only.
- `WorkspaceToolbar`: create, file selection, upload, and export actions.
- `ComplianceSummary`: coverage, dataset provenance, and export gate.
- `FindingList` / `FindingRow`: severity, state, message, action, and evidence.
- `RevisionReview`: proposed changes and approve action.
- `WorkspaceChat`: question input and grounded answer.
- `TemplateMappingReview`: field map confirmation before template approval.

Use `unknown` plus type guards for unexpected API payloads. Keep `fetch` error handling centralized where practical, but preserve endpoint-specific messages such as “Template approval is required” and “Resolve blocking compliance findings before export.”

## 9. Existing API Tabs to Preserve

The workspace flow is additive. Existing tabs remain available:

| View | Service function | Endpoint |
|---|---|---|
| Standards search | `fetchRecommendations` | `POST /api/v1/recommend` |
| Tender auditor | `analyzeTenderDocument` | `POST /api/v1/analyze-tender` |
| Standards list | `fetchStandards` | `GET /api/v1/standards` |
| Knowledge graph | `fetchKnowledgeGraph` | `GET /api/v1/graph` |
| QCO explorer | `fetchQcoList` | `GET /api/v1/qco-list` |
| GeM simulator | `simulateGemBid` | `POST /api/v1/gem-webhook` |
| Standard explanation | `explainStandard` / stream variant | `POST /api/v1/explain-standard` |
| Global assistant | `askProcurementAssistant` / stream variant | `POST /api/v1/ask-assistant` |
| Voice | `sendVoiceChat`, `fetchVoiceStatus` | `/api/v1/voice/*` |

The global assistant and standard explanation streams currently use SSE. Parse `data:` events, stop on `[DONE]`, and surface `[ERROR: ...]` as an inline error. A future cleanup can expose async iterators from the service layer, but it should not change the backend contract.

## 10. Implementation Order

1. Finish the workspace toolbar and typed API calls using the existing `WorkspaceView`.
2. Extract compliance summary, findings, revision review, and chat into focused components.
3. Add workspace restore (`GET /workspaces/{id}`) and loading/error/empty states.
4. Add template mapping review and register the profile before enabling compliance export.
5. Add approve-revision and Blob download flows for PDF and DOCX.
6. Add visual regression fixtures for a clean report, blocking QCO finding, low-confidence template, and successful draft export.
7. Run `npm run build` and manually verify the complete upload → audit → chat → approve → export journey.

## 11. Frontend Constraints

- Keep the interface simple and understandable to non-technical procurement officers.
- Do not hardcode an API URL; use `VITE_API_BASE_URL`.
- Do not claim legal compliance from a recommendation or score alone; rely on `compliance_run` state and evidence.
- Preserve original uploaded files conceptually in the UI; corrections are revisions, not destructive edits.
- Keep React components under 100 lines, use stable keys for mapped findings, avoid `any`, and keep async work promise-based with explicit error handling.
