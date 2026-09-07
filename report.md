# BIS-SpecAI — Complete Frontend Architecture Report

> **Purpose**: This document is a complete blueprint of the current frontend — every tab, every component, every backend API call, every feature, and every data flow. Use this as a contract to rebuild the frontend from scratch while preserving 100% of the business logic and improvements.

---

## Table of Contents

1. [Tech Stack & Configuration](#1-tech-stack--configuration)
2. [Application Shell & Routing](#2-application-shell--routing)
3. [Global State (RemembranceContext)](#3-global-state-remembrancecontext)
4. [Service Layer (API Clients)](#4-service-layer-api-clients)
5. [Tab 1 — Standards (Recommendation Search)](#5-tab-1--standards-recommendation-search)
6. [Tab 2 — Tender Radar (Auditor Page)](#6-tab-2--tender-radar-auditor-page)
7. [Tab 3 — Workspace](#7-tab-3--workspace)
8. [Tab 4 — AI Chat (Dual-Mode Reasoning)](#8-tab-4--ai-chat-dual-mode-reasoning)
9. [Tab 5 — Speak to AI (Voice)](#9-tab-5--speak-to-ai-voice)
10. [Tab 6 — Knowledge Graph](#10-tab-6--knowledge-graph)
11. [Tab 7 — QCOs (Quality Control Orders)](#11-tab-7--qcos-quality-control-orders)
12. [Tab 8 — GeM (Webhook Simulator)](#12-tab-8--gem-webhook-simulator)
13. [Floating Component — Assistant Chat Drawer](#13-floating-component--assistant-chat-drawer)
14. [Shared / Reusable Components](#14-shared--reusable-components)
15. [Cross-Tab Data Flow & Interconnections](#15-cross-tab-data-flow--interconnections)
16. [Design System & Theming](#16-design-system--theming)
17. [TypeScript Data Contracts](#17-typescript-data-contracts)
18. [Complete Backend API Reference](#18-complete-backend-api-reference)

---

## 1. Tech Stack & Configuration

### Frontend Stack
| Technology | Version | Purpose |
|---|---|---|
| React | 19.0 | UI framework |
| TypeScript | 5.7 | Type safety |
| Vite | 6.1 | Build tool / dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| Framer Motion | 12.4 | Animations & transitions |
| Lucide React | 0.475 | Icon library |
| clsx + tailwind-merge | latest | Conditional classnames |
| marked | 18.0 | Markdown rendering |
| @ricky0123/vad-react | 0.0.36 | Voice Activity Detection (browser) |
| @ricky0123/vad-web | 0.0.30 | WebAudio VAD |
| onnxruntime-web | 1.29 | ONNX inference for VAD in browser |

### Environment Variables
| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_URL` | `/api/v1` | Backend API base URL |
| `VITE_API_BASE_URL` | `/api/v1` | Fallback API base URL |
| `VITE_WS_URL` | Auto-detected from `window.location` | WebSocket base URL for live voice |

### Build Commands
- `npm run dev` → Vite dev server (default port 5173)
- `npm run build` → `tsc && vite build` → outputs to `frontend/dist/`
- `npm run preview` → preview production build

---

## 2. Application Shell & Routing

### Architecture
The app uses a **single-page, tab-based architecture** — no React Router. All tabs are mounted simultaneously and toggled via `display: block/hidden` CSS classes. This preserves component state when switching tabs (no remounting).

### Tab Definitions (from Navbar)
| Tab ID | Label | Icon | Component Rendered |
|---|---|---|---|
| `recommend` | Standards | `BookOpen` | `<RecommendationTab />` |
| `tender` | Tender Radar | `FileCheck` | `<TenderAnalyzerView />` → wraps `<WorkspaceView tabId="tender" viewMode="audit" />` (workspace/) |
| `workspace` | Workspace | `FolderOpen` | `<WorkspaceDesk />` (workspace_desk/) — **new staged desk architecture** |
| `chat` | AI Chat | `MessageSquare` | `<ChatView />` |
| `speak_to_ai` | Speak to AI | `Mic` | `<SpeakToAiView />` |
| `graph` | Graph | `Share2` | `<KnowledgeGraphView />` |
| `qco` | QCOs | `Scale` | `<QcoExplorerView />` |
| `gem` | GeM | `ShoppingCart` | `<GemSimulatorView />` |

### Layout Behavior
- **Default tabs** (`recommend`, `speak_to_ai`, `qco`, `gem`): Scrollable `min-h-screen`, `max-w-7xl` centered, with `pt-24` padding.
- **Document Station tabs** (`tender`, `workspace`): Full-width, full-height (`h-screen`), flex column, `overflow-hidden`.
- **Chat tab**: `max-w-6xl`, full-height, flex column, `overflow-hidden`.
- **Graph tab**: Full-width, full-height, no padding, `overflow-hidden`.

### Navbar
- Renders as a **floating pill bar** fixed at `top-6`, centered horizontally with `backdrop-blur-2xl` glassmorphism.
- Each tab is a `NavPill` component with icon + label. Active pill has animated highlight with `layoutId="activeTabPill"` (Framer Motion spring).
- Tabs `tender` and `workspace` show a **data indicator dot** when a file is loaded (via `rem.tabs["tender"]?.file`).
- Logo: `ShieldCheck` icon with a green pulsing status dot (`BIS-SpecAI` label, hidden on small screens).

### Floating Assistant
- `<AssistantChatDrawer />` appears on **all tabs except** `tender`, `workspace`, and `chat`.
- Fixed position: `bottom-6 right-6`.

### Provider Wrapper
The entire app is wrapped in `<RemembranceProvider>` which provides the global state context.

---

## 3. Global State (RemembranceContext)

The `RemembranceContext` is the **single source of truth** for cross-tab shared state.

### State Slots

| State | Type | Purpose |
|---|---|---|
| `file` | `File \| null` | Currently loaded tender PDF file |
| `pdfBlobUrl` | `string \| null` | Object URL for rendering the PDF |
| `pdfText` | `string` | Extracted text from uploaded PDF |
| `analysis` | `WorkspaceAnalysis \| null` | Full compliance analysis result |
| `tabs` | `Record<string, TabData>` | Per-tab cached state (file, pdfBlobUrl, pdfText, analysis, chatMessages) |
| `isPdfConnectedToAiChat` | `boolean` | Whether PDF text is injected as context into AI Chat queries |
| `chatMessages` | `ChatMessage[]` | AI Chat tab conversation history |
| `chatInput` | `string` | Current AI Chat input value |
| `chatMode` | `"fast" \| "heavy"` | Current AI Chat reasoning mode |
| `issueChats` | `Record<string, ChatMessage[]>` | Per-issue chat threads (for compliance finding discussions) |
| `activeIssueModal` | `IssueModalTarget \| null` | Currently open issue detail modal |
| `gemSimItem` | `ExtractedLineItem \| null` | Tender line item forwarded to GeM Simulator |
| `graphFocusTender` | `boolean` | Whether knowledge graph focuses on tender-related standards |

### Key Methods
| Method | What It Does |
|---|---|
| `setTenderData(file, analysis, blobUrl, text?)` | Sets global tender state and enables PDF→AI Chat connection |
| `clearTenderData()` | Clears all tender state, revokes blob URL |
| `setTabData(tabId, data)` | Cache per-tab state (file/analysis/pdf/chat) |
| `clearTabData(tabId)` | Clear a specific tab's cached state |
| `updateIssueChat(key, msgs)` | Persist per-issue chat threads |

### Initial State
- `chatMessages` starts with: `"Welcome to **BIS Intelligence**. Ask me anything regarding BIS specifications, QCO orders, or GeM compliance."`
- `chatMode` defaults to `"fast"`
- `isPdfConnectedToAiChat` defaults to `true`
- `graphFocusTender` defaults to `true`

---

## 4. Service Layer (API Clients)

### Primary Service: `services/api.service.ts`

| Function | Backend Endpoint | Method | Request | Response |
|---|---|---|---|---|
| `fetchRecommendations(query, division?, top_k)` | `POST /recommend` | JSON | `{query, division, top_k}` | `RecommendationResponse` |
| `analyzeTenderDocument(file?, rawText?)` | `POST /analyze-tender` | FormData | file + raw_text | `TenderAnalysisReport` |
| `createWorkspace(name)` | `POST /workspaces` | JSON | `{name}` | `{workspace_id, name}` |
| `analyzeWorkspace(workspaceId, file)` | `POST /workspaces/{id}/analyze` | FormData | file | `WorkspaceAnalysis` |
| `askWorkspace(workspaceId, question, documentText?)` | `POST /workspaces/{id}/chat` | JSON | `{question, document_text}` | `{question, answer}` |
| `exportWorkspace(workspaceId, format, templateId?)` | `POST /workspaces/{id}/export` | JSON | `{format, template, values, allow_draft}` | `Blob` (file download) |
| `fetchKnowledgeGraph()` | `GET /graph` | — | — | `GraphData` |
| `fetchQcoList()` | `GET /qco-list` | — | — | `Record<string, MandatoryQCO>` |
| `simulateGemBid(bidId, category, title, spec)` | `POST /gem-webhook` | JSON | `{bid_id, category_name, product_title, buyer_specifications}` | GemBidValidationResponse |
| `explainStandardStream(query, isCode, onChunk, signal?)` | `POST /explain-standard-stream` | JSON + SSE | `{query, is_code}` | Streaming text chunks via SSE |
| `generateTenderClauses(isCode, query?)` | `POST /tender-clauses` | JSON | `{is_code, query}` | `{is_code, clause_text}` |

### Pipeline Service: `services/pipeline.service.ts`

| Function | Backend Endpoint | Method | Request | Response |
|---|---|---|---|---|
| `fetchFastAnswer(query, pdfFile?, pdfText?)` | `POST /fast-answer` | FormData | query + pdf_text + pdf_file | `{query, answer, source_tier}` |
| `fetchHeavyReasoning(query, pdfFile?, pdfText?, chatHistory?, refreshContext?)` | `POST /heavy-reasoning` | FormData | query + pdf_text + pdf_file + chat_history + refresh_context | `{query, answer, source_tier, synthesized_context?, summarized_history?}` |
| `refreshChatContext(chatHistory)` | `POST /summarize-context` | JSON | `{chat_history}` | `summarized_context` string |
| `fetchMacStatus()` | `GET /mac-status` | — | — | `MacStatus` (online, latency_ms, device_info) |

### Voice Service: `services/voice.service.ts`

| Function | Backend Endpoint | Method | Request | Response |
|---|---|---|---|---|
| `sendVoiceChat(audioBlob, chatHistory, mode, language, pdfText?)` | `POST /voice/chat` | FormData | audio_file + chat_history + mode + language + pdf_text | `VoiceChatResponse` |
| `fetchVoiceStatus()` | `GET /voice/status` | — | — | `VoiceStatusResponse` |

### Legacy Services: `legacy_services/workspace.service.ts`
Used by the Workspace tab (legacy_workspace components):

| Function | Backend Endpoint | Method |
|---|---|---|
| `createWorkspace(name)` | `POST /workspaces` | JSON |
| `getWorkspace(id)` | `GET /workspaces/{id}` | — |
| `analyzeWorkspace(id, file?, rawText?)` | `POST /workspaces/{id}/analyze` | FormData |
| `registerTemplate(id, template)` | `POST /workspaces/{id}/templates` | JSON |
| `approveRevision(id, revisionId)` | `POST /workspaces/{id}/revisions/{revisionId}/approve` | POST |
| `chatWorkspace(id, question, documentText)` | `POST /workspaces/{id}/chat` | JSON |
| `chatWorkspaceStream(id, question, documentText, onChunk, signal?)` | `POST /workspaces/{id}/chat-stream` | SSE |
| `exportWorkspace(id, req)` | `POST /workspaces/{id}/export` | JSON → Blob |

### Additional Legacy Services
| Service File | Endpoints Called |
|---|---|
| `legacy_services/tender.service.ts` | `POST /analyze-tender` |
| `legacy_services/standards.service.ts` | `GET /standards`, `GET /standards/{is_code}` |
| `legacy_services/qco.service.ts` | `GET /qco-list` |
| `legacy_services/gem.service.ts` | `POST /gem-webhook` |
| `legacy_services/pipeline.service.ts` | `POST /fast-answer`, `POST /heavy-reasoning`, `POST /summarize-context` |
| `legacy_services/voice.service.ts` | `POST /voice/chat`, `GET /voice/status` |

---

## 5. Tab 1 — Standards (Recommendation Search)

### Tab ID: `recommend`
### Purpose
Primary standards discovery interface. Users search for materials, equipment, or products to find matching BIS Indian Standards with compliance information.

### Component Hierarchy
```
RecommendationTab
├── SpotlightSearch          — Mac-style animated search input with radiant glow, breathing caret, optical rays, and particle sparkles
│                              Debounced 2-second auto-search OR instant on Enter keypress
├── DivisionFilterPills      — Horizontal pill buttons: All, Civil, Electrical, Electronics, Solar
└── Results Area
    ├── Empty State          — BookOpen icon + "Indian Standards Search" description text
    ├── Loading State        — Spinning Sparkles icon + "Analyzing procurement query..." message
    └── GlassSpecCard[]      — One card per recommendation result
        ├── IS Code + Title
        ├── Mandatory/Voluntary Badge (ShieldAlert for ISI Mark vs ShieldCheck for Voluntary)
        ├── Division Badge
        ├── Match Percentage Badge (relevance_score × 100)
        ├── TenderClauseBox          — Monospaced clause preview with one-click copy + .txt download
        │   └── ClauseGeneratorView  — LLM-generated expanded clauses (via POST /tender-clauses)
        ├── LlmExplanationCard       — On-demand streaming explanation (via POST /explain-standard-stream)
        └── AlliedStandardsAccordion — Expandable accordion with normative refs, test methods, safety codes
```

### Backend API Calls
| Action | Endpoint | When Called |
|---|---|---|
| Search for standards | `POST /recommend` | On search submit or division filter change |
| Generate tender clause (per card) | `POST /tender-clauses` | When user expands clause section in a card |
| Explain standard (streaming) | `POST /explain-standard-stream` | When user clicks "Explain" on a card |

### Key Features
1. **Multilingual Search**: Backend automatically detects Hindi/Indic script and translates via `MultilingualProcessor` (e.g. "सरिया" → "IS 1786 TMT steel rebar reinforcement").
2. **Division Filtering**: 4 BIS divisions (Civil, Electrical, Electronics/Solar, Mechanical/Safety) + "All".
3. **Hybrid Retrieval**: Dense vector (ChromaDB) + BM25 lexical + BGE Reranker. Alpha weighting 0.65. Direct code numbers (e.g. "1786" in query) boost lexical score to >= 0.95.
4. **LLM Auditor Filtering**: Post-retrieval LLM-as-auditor filters irrelevant results using Qwen2.5-3B model.
5. **Normative Graph Resolution**: Allied standards, test methods, safety codes resolved via in-memory graph traversal.
6. **QCO Compliance Badges**: Each card shows Mandatory ISI Mark (red) or Voluntary Scheme (green) status.
7. **Tender Clause Copy**: One-click copy of formatted 4-part technical specification clauses (Technical Compliance, Key Specifications, Testing & QA, Statutory Mandate/Inspection).
8. **Streaming LLM Explanation**: Click "Explain" on any card to get a streaming, real-time technical justification from the LLM with document chunk evidence.
9. **Match Score**: Percentage-based relevance score displayed on each card.
10. **Latency Display**: Shows search latency in milliseconds.
11. **Quick Query Chips**: Pre-built search suggestions (e.g. "सौर पैनल व इनवर्टर", "TMT Rebars Fe 500D") via the alternate `SearchBar` component.
12. **Smart Standard Hyperlinking**: Markdown renderer auto-detects `IS XXXX` patterns in AI responses and converts them to clickable navigational buttons.

### Data Flow
```
User types query → SpotlightSearch.onSearch() (2s debounce or Enter)
  → fetchRecommendations(query, division)
  → POST /recommend
  → Backend Pipeline:
      1. MultilingualProcessor.translate_and_expand()
      2. HybridRetriever.search_with_evidence() [ChromaDB + BM25 + Reranker]
      3. RecommendationAuditor.audit_candidates() [LLM filtering]
      4. NormativeResolver.resolve_allied() [graph traversal]
      5. NormativeResolver.check_deprecation() [supersession check]
      6. CertificationAdvisor.get_certification_alert()
      7. TenderClauseGenerator.generate_clause()
  → Response: RecommendationResponse
  → Render GlassSpecCard[] with results
```

---

## 6. Tab 2 — Tender Radar (via TenderAnalyzerView → WorkspaceView)

### Tab ID: `tender` (also matches `radar`)
### Purpose
Upload and analyze tender documents for BIS compliance. Now uses the unified `WorkspaceView` component in `audit` mode, providing a resizable split-pane layout with inline PDF viewer and embedded AI copilot panel.

### Architecture Change
The Tender Radar tab was previously powered by `AuditorPage` (legacy_auditor). It is now a thin wrapper:
- `TenderAnalyzerView` renders `<WorkspaceView tabId="tender" viewMode="audit" title="Tender Radar & Statutory Compliance" icon={FileCheck} />`
- This reuses the same unified workspace infrastructure as the Workspace tab's modern architecture.

### Component Hierarchy
```
TenderAnalyzerView
└── WorkspaceView (tabId="tender", viewMode="audit")
    ├── WorkspaceToolbar              — Title ("Tender Radar & Statutory Compliance"), FileCheck icon, New Session button
    ├── WorkspaceDropzone             — Drag-and-drop file intake (pre-analysis)
    ├── WorkspaceLoadingView          — Animated analysis skeleton (during analysis)
    └── WorkspaceLayout (post-analysis)
        ├── UnifiedAuditWorkspace     — Left pane: audit matrix + PDF toggle
        │   ├── UnifiedAuditHeader    — Document info, view switcher (Audit Matrix / Original PDF), export buttons
        │   ├── UnifiedAuditMatrix    — Full audit matrix
        │   │   ├── UnifiedAuditMetrics — 4 KPI cards (QCO Coverage, Audit Gate, Items, Findings)
        │   │   ├── TenderGemQcoSection — Ministry radar table + "Simulate in GeM" button
        │   │   ├── UnifiedItemsList    — Line items with cited + recommended standards
        │   │   └── UnifiedFindingsList — Findings with per-finding "AI Assistant" button
        │   └── WorkspacePdfContent   — iframe PDF viewer
        ├── WorkspaceResizeHandle     — Draggable resize with snap presets (50%/60%/70%)
        └── WorkspaceAiPanel          — Right pane: embedded AI chat copilot
    ├── WorkspaceFloatingAiButton     — Floating button to re-open AI panel (when closed)
    └── IndependentIssueChatModal     — Per-finding focused AI chat dialog
```

### Backend API Calls
| Action | Endpoint | Request |
|---|---|---|
| Create workspace | `POST /workspaces` | `{name}` |
| Analyze document | `POST /workspaces/{id}/analyze` | FormData: `file` |
| Chat within workspace | `POST /workspaces/{id}/chat` | `{question, document_text}` |
| Export workspace | `POST /workspaces/{id}/export` | `{format, template, values, allow_draft}` → Blob |

### Key Features
1. **Unified Architecture**: Same `WorkspaceView` / `useWorkspace` hook as the Workspace tab — shared codebase.
2. **Multi-format Upload**: Accepts PDF, DOCX, TXT, images via drag-and-drop.
3. **Resizable Split Pane**: Draggable divider between audit/PDF view and AI copilot, with quick-snap presets.
4. **Inline PDF Viewer**: iframe-based PDF display with `#view=FitH&toolbar=1`.
5. **4 KPI Metrics**: QCO Coverage %, Audit Gate (Ready/Action Required), Extracted Items Count, Total Findings Count.
6. **GeM Radar Integration**: "Simulate in GeM" button pre-loads line items into GeM tab via `gemSimItem`.
7. **Per-Finding AI Chat**: "AI Assistant" button on each finding opens an independent AI conversation modal.
8. **Embedded AI Panel**: Right-side chat panel with fast/heavy mode, grounded in workspace documents.
9. **Export**: PDF and DOCX export buttons.
10. **Cross-tab Data Broadcast**: Analysis results populate data in QCO tab, Graph tab, GeM tab, and AI Chat tab via RemembranceContext.

### Data Flow
```
User drops file → WorkspaceDropzone.onFileSelected()
  → useWorkspace.handleFileSelected(file)
  → createWorkspace(name) → POST /workspaces → {workspace_id}
  → analyzeWorkspace(workspace_id, file) → POST /workspaces/{id}/analyze
  → Backend Pipeline:
      1. require_cuda_async() — enforces GPU availability
      2. ArtifactStore.save(workspace_id, name, content)
      3. DocumentParser.extract_text_from_file(path)
      4. WorkspaceStore.add_document(workspace_id, ...)
      5. ComplianceEngine.analyze(text, document_name) → (report, compliance_run)
      6. WorkspaceStore.save_run(workspace_id, compliance_run)
      7. RevisionEngine.propose(text, report, run) → revision
      8. WorkspaceStore.save_revision(workspace_id, revision)
  → Response: WorkspaceAnalysis
  → setTenderData(file, analysis, blobUrl, rawText) — broadcasts to RemembranceContext
  → Render WorkspaceLayout (UnifiedAuditWorkspace + WorkspaceAiPanel)
```

---

## 7. Tab 3 — Workspace (WorkspaceDesk — New Staged Architecture)

### Tab ID: `workspace`
### Purpose
A multi-stage compliance review desk for uploading tender documents, running statutory audits, reviewing findings with apply/ignore/AI-assist actions, and exporting compliance reports. Now uses a completely new **staged desk architecture** (`workspace_desk/`).

### Architecture Change
The Workspace tab was previously powered by `legacy_workspace/WorkspacePage.tsx` (staged: SourceStage → ReviewStage). It now uses `workspace_desk/WorkspaceDesk.tsx` — a ground-up redesign with 4 explicit stages, per-finding resolution workflow, integrated AI review copilot, sample data preview mode, and a dedicated export actions bar.

### Stage Lifecycle
| Stage | State | Component Rendered | Description |
|---|---|---|---|
| `empty` | No document | `WorkspaceEmptyState` | Upload drop zone + paste text input |
| `uploaded` | Document staged | `WorkspaceUploadedState` | File details banner + preview + "Run Audit" button |
| `auditing` | Analysis in progress | `WorkspaceAuditingState` | Animated progress bar (3-step simulation) |
| `review` | Audit complete | `WorkspaceReviewDesk` | 3-column review layout with findings + AI chat |
| `error` | Error state | (handled by stage badges) | Error indicator in header |

### Component Hierarchy
```
WorkspaceDesk
├── WorkspaceHeader                    — Editable title, stage badge, "New Workspace" reset button
│   ├── Inline Title Editor            — Click to edit workspace name, Enter to save
│   └── Stage Badge                    — Color-coded: Draft (white), Document Staged (blue), Auditing (amber), Review Desk Active (mint), Error (red)
│
├── Stage: "empty" → WorkspaceEmptyState
│   ├── Mode Selector Tabs             — Upload Document (blue) / Paste Text (blue)
│   ├── WorkspaceUploadDropzone        — Drag-and-drop with isDragOver animation, accepts PDF/DOCX/TXT/images
│   │   └── Hidden file input          — accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
│   ├── WorkspacePasteBox              — Textarea with word/char count, "Load sample tender clause" button, clear button
│   │   └── Sample tender text         — Pre-built 4-clause sample for demo testing
│   └── "Run Audit" button             — Disabled until text is entered (paste mode only)
│
├── Stage: "uploaded" → WorkspaceUploadedState
│   ├── File Details Banner            — FileText icon, name, type badge, file size
│   ├── Replace button (RefreshCw)     — Returns to empty state for re-upload
│   ├── Remove button (Trash2)         — Returns to empty state
│   ├── Document Preview Placeholder   — Monospaced content snippet display
│   │   └── Note: "Real OCR/parsing is bypassed in UI preview mode"
│   └── "Run Audit" button (Play icon) — Transitions to auditing stage
│
├── Stage: "auditing" → WorkspaceAuditingState
│   ├── ShieldCheck + Loader2 animation — Spinning audit icon overlay
│   ├── 3-Step Animated Progress Bar   — Auto-advances through stages:
│   │   ├── 15% → "Reading document structure & clauses..."      (0ms)
│   │   ├── 45% → "Identifying cited standards & quality orders..." (700ms)
│   │   ├── 80% → "Synthesizing compliance evaluation matrix..."    (1400ms)
│   │   └── 100% → "Audit preparation complete. Opening review desk..." (2100ms)
│   ├── Auto-transition to "review"    — After 2600ms total
│   └── "Cancel Audit" button          — Returns to uploaded state
│
└── Stage: "review" → WorkspaceReviewDesk
    ├── 3-Column Layout (responsive: stacked on mobile, grid on lg+)
    │   ├── Column 1 (lg:col-span-3): DocumentSourcePanel
    │   │   ├── Document Overview Header — File icon, name, type badge, size
    │   │   ├── Clause Navigator        — 5 predefined document sections (Scope, General, Material, Inspection, Warranty)
    │   │   └── Source Excerpt Preview   — Monospaced text from contentSnippet or rawText
    │   │
    │   ├── Column 2 (lg:col-span-5): FindingsPanel
    │   │   ├── Sample UI Disclaimer Banner — Amber warning: "Sample UI — connect audit service"
    │   │   ├── Filter Tabs              — All | Critical | Warning | Passed | Verify
    │   │   └── FindingCard[] (scrollable)
    │   │       ├── Clause Location (monospaced) + Category heading
    │   │       ├── FindingStatusBadge   — critical (red/AlertOctagon), warning (amber/AlertTriangle), passed (mint/CheckCircle2), needs_verification (indigo/HelpCircle)
    │   │       ├── Explanation text
    │   │       ├── Suggested Correction box (mint accent)
    │   │       └── Action Buttons:
    │   │           ├── Apply (✓)        — Marks finding as applied (green border)
    │   │           ├── Ignore (✗)       — Marks finding as ignored (dim/opacity)
    │   │           ├── Undo             — Resets resolution back to pending
    │   │           └── Ask AI (💬)      — Pre-fills AI input with finding-specific prompt
    │   │
    │   └── Column 3 (lg:col-span-4): AskAiPanel
    │       ├── Header: Sparkles icon + "Ask AI (Review Copilot)" + Clear button
    │       ├── AskAiMessageList        — Auto-scrolling chat bubbles with Bot/User avatars, timestamps
    │       └── Chat Input Bar          — Text input + Send button (Enter to send)
    │
    ├── FinalActionsBar                 — Sticky export footer
    │   ├── Info notice: "Exports are in UI preview mode"
    │   └── Export Buttons:
    │       ├── Create PDF (FileDown)
    │       ├── View PDF (Eye)
    │       ├── Create Standard DOCX (FileText)
    │       └── Download Compliance Report (Download)
    │
    └── ExportNoticeToast               — Fixed bottom-right toast notification
        └── Shows "UI Prototype: {action}" message when export button clicked
```

### Custom Types (`workspace_desk/types.ts`)
```
WorkspaceStage        = "empty" | "uploaded" | "auditing" | "review" | "error"
FindingStatus         = "critical" | "warning" | "passed" | "needs_verification"
FindingResolution     = "pending" | "applied" | "ignored"

DocumentSource {
  name: string;          // File name or "Pasted Tender Clauses.txt"
  type: string;          // File extension
  sizeBytes: number;
  wordCount: number;
  contentSnippet: string; // First 500 chars preview
  rawText?: string;       // Full pasted text (paste mode only)
  file?: File;            // Original File object (upload mode only)
}

ComplianceFindingItem {
  id: string;
  clauseLocation: string; // e.g. "Section 3.2, Cl. 3.2.4"
  status: FindingStatus;
  resolution: FindingResolution;
  explanation: string;
  suggestedCorrection: string;
  standardReference?: string;
  category: string;       // e.g. "QCO Statutory Order", "Standard Reaffirmation"
}

WorkspaceChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
  relatedFindingId?: string;
}

AuditProgressStage {
  step: number;
  label: string;
  description: string;
}
```

### Custom Hook: `useWorkspaceDesk`
Manages all workspace desk state and handlers:

| State / Method | Type | Purpose |
|---|---|---|
| `title` | `string` | Editable workspace name (default: "New Workspace") |
| `stage` | `WorkspaceStage` | Current stage in lifecycle |
| `document` | `DocumentSource \| null` | Currently loaded document |
| `findings` | `ComplianceFindingItem[]` | Compliance findings (initialized with `SAMPLE_WORKSPACE_FINDINGS`) |
| `aiInput` | `string` | Current AI copilot input text |
| `aiMessages` | `WorkspaceChatMessage[]` | AI copilot conversation history |
| `handleFileSelect(file)` | method | Creates `DocumentSource` from file, transitions to "uploaded" |
| `handleTextSubmit(text)` | method | Creates `DocumentSource` from pasted text, transitions to "uploaded" |
| `handleApplyFinding(id)` | method | Sets finding resolution to "applied" |
| `handleIgnoreFinding(id)` | method | Sets finding resolution to "ignored" |
| `handleResetFinding(id)` | method | Resets finding resolution to "pending" |
| `handleAskAiForFinding(finding)` | method | Pre-fills AI input with: `"Regarding {clauseLocation}: The audit notes "{explanation}". How should I redraft this tender clause?"` |
| `handleSendAiMessage()` | method | Adds user message + placeholder reply to AI chat (frontend-only preview mode) |
| `handleResetWorkspace()` | method | Resets all state to initial values |

### Backend API Calls
Currently the WorkspaceDesk operates in **UI preview mode** — AI chat sends a local placeholder response: _"Local UI Notice: This is a front-end preview desk. LLM synthesis will activate when backend services are connected."_

When connected to the backend, it should call:
| Action | Endpoint | Request |
|---|---|---|
| Create workspace | `POST /workspaces` | `{name}` |
| Analyze document | `POST /workspaces/{id}/analyze` | FormData: file or raw_text |
| Chat within workspace | `POST /workspaces/{id}/chat` | `{question, document_text}` |
| Stream chat | `POST /workspaces/{id}/chat-stream` | SSE stream |
| Export workspace | `POST /workspaces/{id}/export` | `{format, template, values, allow_draft}` → Blob |
| Approve revision | `POST /workspaces/{id}/revisions/{revId}/approve` | POST |

### Key Features
1. **4-Stage Lifecycle**: Clear state machine: empty → uploaded → auditing → review, with cancel/reset at any point.
2. **Dual Input Modes**: Upload file (drag-and-drop, click-to-browse) OR paste raw text with word/char count.
3. **Sample Tender Text**: One-click "Load sample tender clause" button provides a 4-clause demo tender for testing.
4. **Animated Audit Progress**: 3-step animated progress bar simulating clause reading → standards identification → compliance matrix synthesis.
5. **3-Column Review Desk**: Document source panel (25%) + Findings panel (42%) + AI copilot panel (33%).
6. **Per-Finding Resolution Workflow**: Each finding can be individually Applied (green), Ignored (dimmed), or reset via Undo — with visual state tracking.
7. **Finding Status Badges**: Color-coded with distinct Lucide icons: Critical (red/AlertOctagon), Warning (amber/AlertTriangle), Passed (mint/CheckCircle2), Needs Verification (indigo/HelpCircle).
8. **Finding Filters**: Filter buttons for All, Critical, Warning, Passed, Verify — with live count.
9. **AI Review Copilot**: Built-in chat panel for asking questions about findings. "Ask AI" button on each finding auto-generates a contextual prompt.
10. **Suggested Corrections**: Each finding card shows a suggested correction with mint accent styling.
11. **Document Section Navigator**: Left panel shows 5 predefined tender sections (Scope, General, Material, Inspection, Warranty) with page ranges.
12. **Export Actions Bar**: 4 export buttons (Create PDF, View PDF, Create Standard DOCX, Download Compliance Report) — currently in UI preview mode with informational toast.
13. **Editable Title**: Click workspace title to rename inline. Enter to confirm, revert on empty.
14. **Stage Badges**: Color-coded header badges showing current workflow stage.
15. **Reset / New Workspace**: One-click "New Workspace" button resets all state.
16. **Sample Findings**: Pre-loaded with 4 sample compliance findings (QCO Statutory Order, Standard Reaffirmation, Inspection Protocols, Marking Requirements) for UI demonstration.

### Utility Functions (`workspace.utils.ts`)
| Function | Purpose |
|---|---|
| `formatFileSize(bytes)` | Human-readable file size (B/KB/MB/GB) |
| `countWords(text)` | Word count from whitespace splitting |
| `filterFindings(findings, statusFilter)` | Filter findings by status type |
| `generateAiPromptForFinding(finding)` | Generate contextual AI prompt from finding |
| `getStatusLabel(status)` | Convert status enum to display label |

### Data Flow
```
Stage: empty
  User uploads file → handleFileSelect(file)
    → Creates DocumentSource {name, type, sizeBytes, contentSnippet}
    → setStage("uploaded")
  OR
  User pastes text → handleTextSubmit(text)
    → Creates DocumentSource {name: "Pasted Tender Clauses.txt", wordCount, contentSnippet}
    → setStage("uploaded")

Stage: uploaded
  User clicks "Run Audit" → setStage("auditing")

Stage: auditing
  → WorkspaceAuditingState auto-progresses:
    0ms:    15% "Reading document structure & clauses..."
    700ms:  45% "Identifying cited standards & quality orders..."
    1400ms: 80% "Synthesizing compliance evaluation matrix..."
    2100ms: 100% "Audit preparation complete. Opening review desk..."
    2600ms: → onComplete() → setStage("review")
  User can cancel → setStage("uploaded")

Stage: review
  → WorkspaceReviewDesk renders 3-column layout
  → Findings loaded from SAMPLE_WORKSPACE_FINDINGS (4 items)
  → User interacts with findings:
    Apply  → resolution="applied" (green card border)
    Ignore → resolution="ignored" (dimmed card)
    Undo   → resolution="pending" (default card)
    Ask AI → pre-fills AI input with finding context
  → AI chat: frontend-only placeholder responses (backend not yet connected)
  → Export buttons: show ExportNoticeToast (UI preview mode)
```

### Note: Legacy Workspace Components
The `legacy_workspace/` directory still exists with the old staged components (SourceStage, ReviewStage, EvidenceTimeline, FindingsCanvas, FindingInspector, WorkspaceChat, DecisionFooter, RevisionStage, TemplateExportStage) but is **no longer mounted** in App.tsx.

---

## 8. Tab 4 — AI Chat (Dual-Mode Reasoning)

### Tab ID: `chat`
### Purpose
Full-screen conversational AI assistant with dual reasoning modes (Fast local + Heavy distributed), PDF context injection, file attachment, and multi-turn history.

### Component Hierarchy
```
ChatView
├── ChatViewHeader
│   ├── Mode Toggle (Fast ⚡ / Heavy 🧠)
│   ├── MacStatusIndicator    — Shows remote Mac M-series node status
│   │   └── Displays: IP (10.118.237.94:5008), latency in ms, online/offline, device info
│   │   └── Ping button for manual status check
│   └── Clear Chat button
├── ChatPdfContextBanner      — Shows when a PDF is connected from tender analysis
│   ├── Document name + "PDF Connected" indicator
│   ├── Connect/Disconnect PDF toggle
│   └── "Transfer Findings" button — Sends top 5 compliance findings into chat
├── Message Area (scrollable, auto-scrolls to bottom)
│   ├── ChatMessageItem[]     — User and assistant message bubbles
│   │   ├── Avatar icons (user vs AI)
│   │   ├── Streaming indicator (pulsing for loading state)
│   │   └── MarkdownRenderer  — Renders markdown in assistant responses
│   │       ├── MarkdownBlock — Headings, paragraphs, lists, blockquotes, CodeBlock, TableBlock
│   │       └── MarkdownInline — Auto-links IS XXXX citations and .md filenames as clickable buttons
│   └── ChatSuggestedTopics   — Starter prompt buttons (shown when only welcome message exists)
│       └── Defined in chat.constants.ts (STARTER_PROMPTS array)
└── ChatInputBar
    ├── File Attachment button (📎) — accepts .pdf, .md, .txt
    ├── Text Input
    ├── Attached File Preview (if file attached)
    └── Send button
```

### Backend API Calls
| Action | Endpoint | Mode |
|---|---|---|
| Fast answer (local GGUF) | `POST /fast-answer` | `"fast"` mode |
| Heavy reasoning (distributed) | `POST /heavy-reasoning` | `"heavy"` mode |
| Mac status check | `GET /mac-status` | Periodic poll from MacStatusIndicator |

### Key Features
1. **Dual Reasoning Modes**:
   - **Fast (⚡)**: Uses local 2B/3B GGUF model (`Qwen2.5-3B-Instruct-Q4_K_M.gguf`). Low latency, runs on local NVIDIA RTX 3050 GPU. Includes optional web search via DuckDuckGo. Max 256 tokens. Uses `FAST_MODEL_DIRECT_QA_PROMPT`.
   - **Heavy (🧠)**: Dispatches to remote Mac M-series node for deep reasoning with larger model. Falls back to local 7B if Mac is offline. Includes: PDF chunk reranking via `DocumentChunkReranker`, context synthesis via `FAST_MODEL_PDF_SYNTHESIZER_PROMPT`, DuckDuckGo web search, conversation history summarization if context exceeds threshold. Uses `THINKING_MODEL_DEEP_AUDITOR_PROMPT`.
2. **PDF Context Injection**: When `isPdfConnectedToAiChat` is true, the extracted tender PDF text is sent with every query as `pdf_text` parameter. Users can toggle this on/off.
3. **Transfer Findings**: One-click button sends the top 5 compliance findings from tender analysis into the chat as a structured query asking for resolution guidance.
4. **File Attachment**: Users can attach a PDF file directly to a chat message. The file is sent via FormData to the backend.
5. **Multi-turn History**: Full conversation history is sent to the heavy reasoning endpoint for context-aware responses. History is summarized by the LLM when it exceeds the context window.
6. **Mac Status Indicator**: Shows whether the remote Mac reasoning node is online, its latency, and device info. Manual ping button available.
7. **Starter Prompts**: When the chat is empty (only welcome message), suggested topic buttons are shown from `STARTER_PROMPTS`.
8. **Markdown Rendering**: Full markdown support including headings, lists, code blocks with language pills and copy buttons, tables with alternating rows, blockquotes. Custom inline parsing auto-detects `IS XXXX` standard citations.
9. **Auto-scroll**: Messages area auto-scrolls to bottom on new messages.
10. **Query Guardrails**: Backend blocks greetings, adversarial inputs, and out-of-context queries via `QueryGuardrails.evaluate()`.
11. **Web Search Integration**: Both modes can optionally augment responses with live DuckDuckGo web search results (domain-whitelisted to `bis.gov.in`, `gem.gov.in`, etc.).

### Data Flow
```
User types query → handleSend()
  → Mode check:
    Fast:  fetchFastAnswer(query, attachedFile, pdfText)
           → POST /fast-answer (FormData)
           → Backend: QueryGuardrails → DocumentChunkReranker (if PDF)
             → local GGUF (256 tokens) → optional web search → response
    Heavy: fetchHeavyReasoning(query, attachedFile, pdfText, chatHistory, refreshContext)
           → POST /heavy-reasoning (FormData)
           → Backend: QueryGuardrails → history summarization (if needed)
             → top-5 PDF chunk reranking → context synthesis
             → web search (500 token budget) → dispatch to Mac node
             → fallback to local 7B if Mac unavailable
  → Response: {answer, source_tier, synthesized_context?, summarized_history?}
  → Update messages array → render ChatMessageItem
```

### State Persistence
- `chatMessages`, `chatInput`, `chatMode` are stored in RemembranceContext, so they persist across tab switches.

---

## 9. Tab 5 — Speak to AI (Voice)

### Tab ID: `speak_to_ai`
### Purpose
Voice-first AI assistant with two sub-modes: Interactive (push-to-talk) and Live (continuous streaming via WebSocket).

### Component Hierarchy
```
SpeakToAiView
├── SpeakToAiSidebar (lg:col-span-4)     — Left sidebar with mode toggle + AudioStatusCard
│   ├── Mode Selection Cards (Interactive Voice / Real-Time Streaming)
│   └── AudioStatusCard                    — STT/TTS provider info, device status
├── Main Area (lg:col-span-8) — AnimatePresence mode="wait"
│   ├── VoiceAssistantView (Interactive mode, Framer Motion slide transition)
│   │   ├── VoiceControlsToolbar     — Mode toggle (Fast 3B/Thinking 7B), language picker (Auto/English/हिन्दी), status, clear
│   │   └── Voice Chat Panel (apple-glass rounded-3xl)
│   │       ├── VoiceChatThread      — Message list (user transcriptions + AI responses)
│   │       │   └── Messages with detected language badges + inline audio play/pause controls
│   │       └── PushToTalkButton     — Circular animated button with mic icon, ripple pulse during recording
│   │           └── MicVisualizer    — Multi-layer concentric radar pulse visualization
│   └── VoiceLivePanel (Live mode, Framer Motion slide transition)
│       ├── Header with Connect/Disconnect button
│       ├── MicVisualizer            — Real-time audio visualization (listening vs processing states)
│       ├── LiveTranscript           — Auto-scrolling streaming transcript display
│       │   ├── Current partial transcript (SttPartialEvent)
│       │   ├── Current streaming response (LlmChunkEvent)
│       │   └── Completed turn history
│       ├── Error display (if WebSocket error)
│       └── Start/Stop Listening toggle button
```

### Backend API Calls

#### Interactive Mode
| Action | Endpoint | Request |
|---|---|---|
| Send voice query | `POST /voice/chat` | FormData: `audio_file` (WAV blob), `chat_history` (JSON), `mode` (fast/thinking), `language`, `pdf_text` |
| Check voice status | `GET /voice/status` | — |

#### Live Mode
| Action | Endpoint | Protocol |
|---|---|---|
| Start live session | `WEBSOCKET /voice/live` | WebSocket binary + JSON |

### Key Features
1. **Interactive Mode (Push-to-Talk)**:
   - User presses and holds button to record audio via `MediaRecorder` API.
   - Audio captured as WAV blob.
   - Sent to `POST /voice/chat` with mode selection and language preference.
   - Backend pipeline: Faster-Whisper STT (int8 quantization) → LLM reasoning (fast or heavy) → MMS-VITS TTS.
   - Response includes: transcribed text, LLM answer text, audio URL for playback, detected language, processing time in ms.
   - Audio response auto-plays in browser. Previous audio is paused before playing new response.
   - Supports English, Hindi, and auto-detect languages.

2. **Live Mode (Continuous Streaming)**:
   - WebSocket connection to `/api/v1/voice/live`.
   - Uses `@ricky0123/vad-react` with ONNX Silero VAD model running in WebAssembly for client-side voice activity detection.
   - Audio processing: float samples → 16kHz 16-bit mono PCM WAV buffers.
   - Audio chunks streamed to backend via WebSocket as raw bytes.
   - Backend processes in real-time pipeline:
     - STT partial transcripts → `SttPartialEvent` (real-time partial text)
     - STT final transcript → `SttFinalEvent` (complete utterance)
     - LLM streaming tokens → `LlmChunkEvent` (word-by-word)
     - Sentence chunking → `SentenceBuffer` (natural sentence boundaries)
     - TTS audio chunks → `TtsAudioEvent` (base64 WAV) → gapless Web Audio API queue playback
     - `ResponseCompleteEvent` when full response is done.
   - JSON control commands: `{"action": "ping"}`, `{"action": "reset"}`.
   - `useLiveVoice` custom hook manages WebSocket lifecycle, audio processing, and event handling.
   - Closes with code 1008 if live voice is disabled in config.

3. **Voice Status Display**: Shows STT/TTS provider availability (faster-whisper/mms-vits), device (CPU/CUDA), and language support.
4. **Language Selection**: Dropdown for English, Hindi, or Auto-detect.
5. **Mode Selection**: Fast (local GGUF) vs Thinking (Mac distributed reasoning).
6. **PDF Context**: `pdf_text` can be sent with voice queries when a tender is loaded.

### Data Flow (Interactive)
```
User holds PushToTalkButton → MediaRecorder captures audio → WAV blob
  → sendVoiceChat(blob, chatHistory, mode, language, pdfText)
  → POST /voice/chat (FormData)
  → Backend: VoiceAgentOrchestrator.process_voice_query()
      1. FasterWhisperProvider.transcribe() [faster-whisper-tiny, int8, CPU/CUDA]
      2. LLM reasoning (fast or heavy path, same as Chat tab)
      3. MmsVitsProvider.synthesize() [mms-tts-eng or mms-tts-hin]
      4. WAV file saved to TTS_CACHE_DIR
  → Response: {transcribed_text, llm_response, audio_url, detected_language, processing_time_ms, document_evidences}
  → Add user + assistant messages to VoiceChatThread
  → Auto-play audio via new Audio(audio_url).play()
```

---

## 10. Tab 6 — Knowledge Graph

### Tab ID: `graph`
### Purpose
Interactive visualization of the Indian Standards normative reference graph. Shows standards as nodes and their relationships (normative references, test methods, supersession) as directed edges.

### Component Hierarchy
```
KnowledgeGraphView
├── Background layers (CSS — dark space theme)
│   ├── Radial gradient: apple-indigo/15 → black/80 → black
│   └── Dot grid pattern: #ffffff0a 1px dots, 24px spacing
├── GraphHeaderFilter          — Division filter dropdown + search input (top overlay)
├── GraphZoomControls          — Zoom in/out/reset/reload buttons (side overlay)
├── GraphTenderBanner          — Floating banner showing count of tender-related standards
├── GraphLegend                — Collapsible color legend for node types
├── GraphCanvas                — SVG container with pan/zoom transform
│   ├── SVG Blur Filters       — Glow effects for selected/hovered nodes
│   ├── GraphEdgesLayer        — All edge lines rendered as SVG paths
│   │   └── GraphEdge[]        — Individual directed edges
│   │       ├── Solid/dashed lines (depending on relationship type)
│   │       └── Relationship label badges ("Normative", "Test Method", "Superseded By")
│   └── GraphNode[]            — Individual node circles
│       ├── Division-colored circle (different color per BIS division)
│       ├── Pulsating halo rings (when selected)
│       ├── Label text
│       ├── Mandatory QCO indicator (red ring for mandatory)
│       └── Tender-cited indicator (if standard appears in uploaded tender)
└── GraphInspectorPanel (right side, appears on node selection)
    ├── GraphInspectorHeader   — IS Code + Full Title
    └── Relation List          — All edges from/to selected node with clickable navigation
```

### Backend API Calls
| Action | Endpoint | Response |
|---|---|---|
| Load graph data | `GET /graph?max_nodes=500` | `{nodes: [...], edges: [...]}` |

### Key Features
1. **Custom Force-directed Physics Engine**: 150-iteration clustering simulation with:
   - Radial division anchors (nodes cluster by BIS division).
   - Attractive edge springs (connected nodes pull together).
   - Repulsion forces (nodes push apart to prevent overlap).
   - Relaxation collision checks.
   - Computed in `graph-physics.utils.ts`.
2. **Division Clustering**: Nodes grouped by BIS division with distinct colors.
3. **Three Edge Types**: "Normative Reference", "Test Method", "Superseded By" — each with distinct visual style.
4. **Interactive Camera** (`useGraphCamera` hook):
   - Pan (mouse drag).
   - Zoom (buttons or scroll wheel).
   - Focus-on-node (click a node → camera smoothly zooms and centers on it + neighbors).
   - Reset view (Escape key or reset button).
   - Movement tracking to distinguish click from drag.
5. **Node Selection**: Click a node to:
   - Focus camera on the node and its 1st-degree neighbors.
   - Open the InspectorPanel with standard details.
   - Highlight direct neighbors (bright) and secondary neighbors (dim).
   - Fade unrelated nodes.
6. **Search & Filter**: Text search filters nodes by IS code or title. Division dropdown filters by BIS division.
7. **Tender Integration**: When a tender is loaded, shows a banner with the count of tender-related standards. `graphFocusTender` flag enables filtering graph to show only standards cited or recommended in the tender.
8. **Network Neighborhoods**: `getNetworkNeighborIds()` computes 1st-degree (direct) and 2nd-degree (secondary) neighbor sets for visual highlighting.
9. **Auto-focus Camera**: `computeFocusCamera()` calculates optimal zoom and pan to frame selected node + neighbors.
10. **Reload**: Manual reload button re-fetches data from backend.

### Custom Hooks
- `useGraphData()`: Fetches `/graph`, runs physics layout, manages node positions, filtering, selection, neighbor computation, tender standard marking.
- `useGraphCamera()`: Manages pan/zoom/focus state, mouse drag handlers, Escape key, camera reset, auto-focus.

### Data Flow
```
Component mounts → useGraphData().loadData()
  → fetchKnowledgeGraph() → GET /graph
  → Backend: StandardsLoader.get_all_standards()
      → Traverses all standards and their relationships
      → Builds nodes: {id, label, title, division, is_mandatory, status}
      → Builds directed edges: {source, target, relation}
      → Edge types: "Normative Reference", "Test Method", "Superseded By"
  → Response: {nodes: [...], edges: [...]}
  → computeClusteredLayout(nodes, edges) → 150-iteration physics simulation
  → Mark tender-cited nodes (isTenderStandard flag)
  → Apply division/search/tender filters
  → Render SVG: GraphEdgesLayer + GraphNode[]
```

---

## 11. Tab 7 — QCOs (Quality Control Orders)

### Tab ID: `qco`
### Purpose
Browse all mandatory Quality Control Orders (QCOs) — Indian standards under compulsory BIS ISI Mark, CRS, BEE Star Rating, or Hallmarking certification.

### Component Hierarchy
```
QcoExplorerView
├── Header Card (apple-glass)
│   ├── Scale icon + Title: "Mandatory Quality Control Orders (QCO)"
│   ├── Description text
│   ├── "Tender QCOs" Filter Toggle (only visible when tender is loaded)
│   │   └── Shows count of tender-related standards
│   └── Search/Filter Input (text filter by code, ministry, order number)
└── QcoTable (apple-glass, overflow-hidden)
    └── Table Rows — IS Code, Scheme, Order Number, Issuing Ministry, Effective Date, Clause Requirement
```

### Backend API Calls
| Action | Endpoint | Response |
|---|---|---|
| Load all QCOs | `GET /qco-list` | `Record<string, MandatoryQCO>` (map of IS code → QCO record) |

### Key Features
1. **Full QCO Registry**: Displays all mandatory QCO records from `qco_registry.json`.
2. **Search Filter**: Text filter by IS code, issuing ministry, or order number.
3. **Tender Integration**: When a tender is loaded (via RemembranceContext `analysis`):
   - Extracts all cited standards and recommended standards from tender line items.
   - "Tender QCOs" toggle appears showing count.
   - Clicking it filters to show only QCOs for standards relevant to the tender.
4. **Table Display**: Each QCO shows:
   - IS Code
   - Certification Scheme (ISI Mark Scheme I, CRS, BEE Star Rating, Hallmarking, Voluntary)
   - Order Number
   - Issuing Ministry
   - Effective Date
   - Clause Requirement text
5. **Auto-load**: Data fetched on component mount via `useEffect`.

### Data Flow
```
Component mounts → useEffect()
  → fetchQcoList() → GET /qco-list
  → Backend: QcoRegistry.get_all_qcos()
  → Response: {is_code: MandatoryQCO, ...}
  → Client-side filtering by:
    1. Search text (code, ministry, order number)
    2. Tender filter (if tenderOnly=true, only show QCOs matching tender standards)
  → Render QcoTable with filtered entries
```

---

## 12. Tab 8 — GeM (Webhook Simulator)

### Tab ID: `gem`
### Purpose
Simulates the GeM (Government e-Marketplace) webhook integration. Tests how the system validates a product bid against BIS standards during procurement on the GeM portal.

### Component Hierarchy
```
GemSimulatorView (max-w-3xl centered)
├── Header Card (apple-glass)
│   ├── ShoppingCart icon + Title: "GeM Webhook Simulator"
│   ├── Description text
│   ├── Tender Item Selector (dropdown, visible when tender is loaded)
│   │   └── Dropdown listing all tender line items (#{item_id}: {product_title})
│   │   └── Selecting auto-fills form fields via gemSimItem context
│   └── Form Fields (2-column grid)
│       ├── GeM Bid ID (default: "GEM-2026-B-882910")
│       ├── Product Category (default: "Power Distribution")
│       ├── Product Title (default: "Distribution Transformer 2500 kVA")
│       └── Technical Specs textarea (default: "Outdoor 33kV 3-phase oil immersed transformer...")
├── "Dispatch GeM Validation Webhook" button (apple-mint accent, Send icon)
└── GemResultCard (shown after simulation)
    ├── Status Badge (COMPLIANT / VERIFIED / WARNING)
    ├── Compliance Score
    ├── Primary Standard (matched IS code)
    ├── QCO Mandatory Status (is_qco_mandatory)
    ├── QCO Order Number
    ├── Recommended Tender Clause (auto-generated)
    └── Allied Standards List
```

### Backend API Calls
| Action | Endpoint | Request |
|---|---|---|
| Simulate GeM bid validation | `POST /gem-webhook` | `{bid_id, category_name, product_title, buyer_specifications}` |

### Key Features
1. **Form-based Input**: Users fill in GeM bid details (ID, category, title, specs). Default values pre-filled for quick testing.
2. **Tender Auto-fill**: When a tender is loaded, users can select a line item from a dropdown. The form auto-fills:
   - `id` → `GEM-TENDER-ITEM-{item_id}`
   - `cat` → first recommended standard's division or "General Procurement"
   - `title` → line item's `product_title`
   - `spec` → line item's `spec_summary`
3. **Webhook Simulation**: Sends the bid data to the backend exactly as the real GeM portal webhook would.
4. **Compliance Result Display**: Shows:
   - **Status**: `COMPLIANT` (QCO mandatory + standard found), `VERIFIED` (standard found, not QCO), or `WARNING` (no matching standard).
   - **Compliance Score**: Numeric relevance score.
   - **Primary Standard**: The matched IS code.
   - **QCO Status**: Whether ISI Mark/CRS/BEE certification is mandatory.
   - **QCO Order**: The specific order number.
   - **Recommended Tender Clause**: Auto-generated 4-part specification clause for GeM listing.
   - **Allied Standards**: Related normative references, test methods.
5. **Cross-tab Data**: Uses `gemSimItem` from RemembranceContext. Can be set from:
   - Tender Radar analysis (line item selection)
   - Workspace audit (TenderGemQcoSection "Simulate in GeM" button)

### Data Flow
```
User fills form (or auto-fills from tender line item) → handleSimulate()
  → simulateGemBid(bidId, category, title, spec)
  → POST /gem-webhook
  → Backend:
      1. HybridRetriever.search(query="{category} {product} {specs}", top_k=1)
      2. NormativeResolver.resolve_allied(std) [normative refs, test methods, safety codes]
      3. TenderClauseGenerator.generate_clause(std) [4-part clause]
      4. QCO check → status assignment:
         - QCO mandatory + found → "COMPLIANT"
         - Found but not QCO mandatory → "VERIFIED"
         - No match → "WARNING"
  → Response: {bid_id, status, compliance_score, primary_standard, is_qco_mandatory, qco_order, recommended_clause, allied_standards}
  → Render GemResultCard
```

---

## 13. Floating Component — Assistant Chat Drawer

### Purpose
A floating, collapsible AI chat widget available on most tabs (hidden on Tender Radar, Workspace, and Chat tabs to avoid duplication with those tabs' built-in chat).

### Visibility Rule
```tsx
{!isDocStation && activeTab !== "chat" && <AssistantChatDrawer />}
// isDocStation = tender || workspace tabs
// Hidden on: tender, workspace, chat
// Visible on: recommend, speak_to_ai, graph, qco, gem
```

### Component Hierarchy
```
AssistantChatDrawer (fixed bottom-6 right-6, z-50)
├── Collapsed State: Sparkles icon button (apple-indigo, hover:rotate-12)
│   └── Opens drawer on click
└── Expanded State (400×560px, apple-glass-dark, rounded-3xl)
    ├── ChatHeaderToolbar
    │   ├── Mode Toggle (Fast ⚡ / Heavy 🧠)
    │   ├── "Refresh Context" button — Compresses chat history via LLM
    │   ├── "Clear Chat" button
    │   └── Close button (X)
    ├── Message Area (scrollable)
    │   └── ChatMessageItem[] — Same component as main Chat tab
    ├── Speaking Indicator (animated horizontal bar at bottom during response)
    └── Input Area
        ├── Text Input (placeholder changes based on mode)
        └── Send button (apple-blue)
```

### Backend API Calls
| Action | Endpoint |
|---|---|
| Fast answer | `POST /fast-answer` |
| Heavy reasoning | `POST /heavy-reasoning` |
| Context compression | `POST /summarize-context` |

### Key Features
1. **Dual Mode**: Same Fast/Heavy toggle as the main Chat tab.
2. **Context Compression**: "Refresh Context" button summarizes the entire conversation history into a compressed context string using `POST /summarize-context`. Replaces all messages with `[Context Compressed]: {summary}`.
3. **PDF Context**: If `isPdfConnectedToAiChat` is true, the drawer sends `pdfText` with every query.
4. **Independent State**: The drawer maintains its own separate messages, input, and mode state (not shared with the main Chat tab). Managed by `useAssistantChatDrawer` hook.
5. **Speaking Animation**: A horizontal `motion.div` bar animates at the bottom during response generation with `scaleX: [0, 1, 0.5, 1, 0]` repeating.
6. **Framer Motion Transitions**: `AnimatePresence` with `opacity: 0→1`, `y: 20→0`, `scale: 0.95→1` animation.
7. **Loading Glow**: When loading, the drawer gets a purple glow shadow: `shadow-[0_0_40px_rgba(94,92,230,0.3)]`.

### Custom Hook: `useAssistantChatDrawer`
Encapsulates all drawer logic:
- `isOpen`, `mode`, `messages`, `input`, `loading`, `speaking`, `refreshing` state
- `handleSend()` — sends query via `fetchFastAnswer` or `fetchHeavyReasoning`
- `handleClear()` — resets messages to welcome
- `handleRefresh()` — compresses history via `refreshChatContext`

---

## 14. Shared / Reusable Components

### UI Components (Top-level)
| Component | File | Purpose | Used In |
|---|---|---|---|
| `NavPill` | `NavPill.tsx` | Individual nav tab button with icon + label + Framer Motion spring layoutId | Navbar |
| `SpotlightSearch` | `SpotlightSearch.tsx` | Mac-style animated search input with radiant glow, radiant-search.css styles | RecommendationTab |
| `SearchBar` | `SearchBar.tsx` | Standard search input with division dropdown + quick query chips | Alternative to SpotlightSearch |
| `MarkdownRenderer` | `MarkdownRenderer.tsx` | Tokenizes markdown via `marked.lexer`, delegates to `MarkdownBlock` | ChatMessageItem |
| `ChatMessageItem` | `ChatMessageItem.tsx` | Single chat bubble (user/assistant) with avatar, streaming indicator, markdown | ChatView, AssistantChatDrawer |
| `MicVisualizer` | `MicVisualizer.tsx` | Multi-layer concentric animated radar pulses (listening vs processing) | VoiceAssistantView, VoiceLivePanel |
| `PushToTalkButton` | `PushToTalkButton.tsx` | Hold-to-record button with ripple pulse animations, MediaRecorder | VoiceAssistantView |
| `VoiceChatThread` | `VoiceChatThread.tsx` | Scrollable voice message list with language badges + audio controls | VoiceAssistantView |
| `VoiceControlsToolbar` | `VoiceControlsToolbar.tsx` | Mode/language/status controls | VoiceAssistantView |
| `LiveTranscript` | `LiveTranscript.tsx` | Auto-scrolling streaming transcript (partial + final + response) | VoiceLivePanel |
| `LlmExplanationCard` | `LlmExplanationCard.tsx` | Streaming LLM explanation with pulsing cursor | GlassSpecCard (Standards tab) |
| `ClauseGeneratorView` | `ClauseGeneratorView.tsx` | LLM-generated tender clause with copy + download | Standards cards |
| `AlliedStandardsView` | `AlliedStandardsView.tsx` | Full-page allied standards with 4 tabs (Normative/Test/Safety/Installation) | Standards detail |
| `ViolationCard` | `ViolationCard.tsx` | Compliance violation card with document snippet modal | Tender analysis |
| `RecommendationCard` | `RecommendationCard.tsx` | Alternative recommendation card with progress bar, amendments badge | Various |

### Chat Sub-components (`chat/`)
| Component | Purpose |
|---|---|
| `ChatViewHeader` | Title, status badge, Mac node indicator, mode toggle, clear button |
| `MacStatusIndicator` | Live Mac Studio node monitor (IP, latency, ping) |
| `ChatPdfContextBanner` | PDF connection status, document name, toggle, transfer findings |
| `ChatInputBar` | File attachment handler, text input, send button |
| `ChatSuggestedTopics` | Starter prompt button grid |
| `chat.constants.ts` | `STARTER_PROMPTS` array definition |
| `useAssistantChatDrawer.ts` | Hook for floating drawer logic |

### Markdown Sub-components (`markdown/`)
| Component | Purpose |
|---|---|
| `MarkdownBlock` | Renders block elements: headings, paragraphs, lists, blockquotes, code, tables |
| `MarkdownInline` | Auto-links `IS XXXX` citations and `.md` filenames as clickable buttons |
| `CodeBlock` | Syntax block with language pill and copy button |
| `TableBlock` | Responsive bordered HTML table with alternating row highlights |

### Graph Sub-components (`graph/`)
| Component | Purpose |
|---|---|
| `GraphCanvas` | SVG container with pan/zoom transform and blur filters |
| `GraphNode` | Individual node circle with division color, halo, label |
| `GraphEdge` | Directed edge line with relationship label |
| `GraphEdgesLayer` | Container for all edges |
| `GraphHeaderFilter` | Division filter + search in graph |
| `GraphInspectorPanel` | Right-side detail panel for selected node |
| `GraphInspectorHeader` | Node detail header |
| `GraphLegend` | Collapsible color legend overlay |
| `GraphTenderBanner` | Tender standards count banner |
| `GraphZoomControls` | Zoom in/out/reset/reload buttons |
| `graph-physics.utils.ts` | Force-directed layout algorithm, neighbor computation, camera focus |
| `useGraphData.ts` | Graph data fetching, filtering, selection, physics simulation |
| `useGraphCamera.ts` | Pan/zoom/focus camera management |

### QCO Sub-components (`qco/`)
| Component | Purpose |
|---|---|
| `QcoTable` | Full-width QCO data table |

### GeM Sub-components (`gem/`)
| Component | Purpose |
|---|---|
| `GemResultCard` | Compliance result display with status badge and standard info |

### Voice Sub-components (`voice/`)
| Component | Purpose |
|---|---|
| `SpeakToAiSidebar` | Mode selection cards + AudioStatusCard |
| `AudioStatusCard` | STT/TTS provider info and device status |
| `useLiveVoice.ts` | WebSocket lifecycle, VAD integration, audio processing hook |

### Standards Sub-components (`standards/`)
| Component | Purpose |
|---|---|
| `DivisionFilterPills` | BIS division filter pill buttons |
| `AlliedStandardsAccordion` | Collapsible accordion for normative refs, test methods, safety codes |
| `TenderClauseBox` | Monospaced clause preview with copy + download |
| `useDebouncedSearch.ts` | 2-second debounced search hook |

### Legacy Primitives (`legacy_primitives/`)
| Component | Purpose |
|---|---|
| `MotionButton` | Framer Motion button with spring scaling, variants (ruby/primary/secondary/outline/ghost), loading spinner |
| `StatusToken` | Compliance status badge (COMPLIANT, NON_COMPLIANT, NEEDS_VERIFICATION, REVIEW_REQUIRED, APPROVED, EXPORT_BLOCKED) |
| `AiModeSelector` | Keyboard-accessible radio pill selector (Fast/Thinking) |
| `CopyAction` | Animated copy button with spring checkmark + aria announcements |
| `EmptyState` | Empty state placeholder with customizable icon + action button |
| `ErrorState` | Error container with error code, message, retry button |
| `LoadingState` | Glowing spinner with pulsing halo + screen-reader text |
| `TextReveal` | Staggered letter/word-by-word text entrance with `prefers-reduced-motion` detection |

### Workspace Sub-components (`legacy_workspace/`) — *No longer mounted in App.tsx*
| Component | Purpose |
|---|---|
| `SourceStage` | File upload / text paste intake with mode toggle |
| `ReviewStage` | 3-column compliance findings review (20%/50%/30%) |
| `EvidenceTimeline` | Vertical chronological timeline of findings |
| `FindingsCanvas` | Scrollable grid of compliance findings |
| `FindingRow` | Single finding row with StatusToken |
| `FindingInspector` | Finding detail panel with evidence, corrective actions |
| `WorkspaceChat` | In-workspace AI chat with copy support |
| `DecisionFooter` | Export gate status + Discard/Proceed actions |
| `RevisionStage` | Diff viewer (original vs proposed) with approval button |
| `TemplateExportStage` | Template selection + export triggering |

### Workspace Desk Sub-components (`workspace_desk/`) — **Active, mounted in App.tsx**
| Component | Purpose |
|---|---|
| `WorkspaceDesk` | Root orchestrator with stage-based rendering (empty/uploaded/auditing/review) |
| `WorkspaceHeader` | Editable title, stage badge, "New Workspace" reset button |
| `WorkspaceEmptyState` | Upload/paste mode selector with dropzone and paste box |
| `WorkspaceUploadDropzone` | Drag-and-drop file upload with isDragOver animation |
| `WorkspacePasteBox` | Textarea for pasting text with word/char count and sample text loader |
| `WorkspaceUploadedState` | File details banner, preview, replace/remove buttons, "Run Audit" button |
| `WorkspaceAuditingState` | 3-step animated progress bar with auto-transition to review |
| `WorkspaceReviewDesk` | 3-column review layout (DocumentSourcePanel + FindingsPanel + AskAiPanel) + FinalActionsBar |
| `DocumentSourcePanel` | Document overview, 5-section clause navigator, source text preview |
| `FindingsPanel` | Filterable (All/Critical/Warning/Passed/Verify) findings list with disclaimer banner |
| `FindingCard` | Individual finding card with explanation, suggested correction, Apply/Ignore/Undo/Ask AI actions |
| `FindingStatusBadge` | Color-coded status badge (Critical/Warning/Passed/Needs Verification) with icons |
| `AskAiPanel` | AI review copilot chat with message list, input bar, clear button |
| `AskAiMessageList` | Auto-scrolling chat bubbles with Bot/User avatars and timestamps |
| `FinalActionsBar` | Export footer with 4 buttons (Create PDF, View PDF, Create DOCX, Download Report) |
| `ExportNoticeToast` | Fixed bottom-right toast for UI prototype export notices |
| `useWorkspaceDesk.ts` | Stage lifecycle, document, findings, AI chat, and resolution management hook |
| `types.ts` | WorkspaceStage, FindingStatus, FindingResolution, DocumentSource, ComplianceFindingItem, WorkspaceChatMessage |
| `workspace.utils.ts` | formatFileSize, countWords, filterFindings, generateAiPromptForFinding, getStatusLabel |
| `sampleFindings.ts` | 4 sample ComplianceFindingItem records for demo/preview mode |

### Modern Workspace Sub-components (`workspace/`) — Used by TenderAnalyzerView (Tender tab)
| Component | Purpose |
|---|---|
| `UnifiedAuditWorkspace` | Main audit view with header + matrix/PDF toggle |
| `UnifiedAuditHeader` | Document info, view switcher, export buttons |
| `UnifiedAuditMatrix` | Full audit matrix: metrics + items + findings + GeM radar |
| `UnifiedAuditMetrics` | 4 KPI cards (QCO Coverage, Audit Gate, Items, Findings) |
| `UnifiedFindingsList` | Findings list with per-finding "AI Assistant" button |
| `UnifiedItemsList` | Line items with cited + recommended standards |
| `TenderGemQcoSection` | Ministry radar table + "Simulate in GeM" button |
| `WorkspaceAiPanel` | Embedded AI chat panel (right pane) |
| `WorkspacePdfContent` | iframe PDF viewer |
| `WorkspaceDropzone` | Drag-and-drop file intake |
| `WorkspaceLoadingView` | Animated analysis skeleton |
| `WorkspaceLayout` | Resizable split-pane container |
| `WorkspaceResizeHandle` | Drag handle with snap presets (50%/60%/70%) |
| `WorkspaceFloatingAiButton` | Floating button to re-open AI panel when closed |
| `IndependentIssueChatModal` | Per-finding focused AI chat dialog |
| `WorkspaceToolbar` | Title bar with new session button |
| `WorkspaceAiInput` | AI panel input component |
| `WorkspaceAiLoading` | AI panel loading state |
| `WorkspaceAuditContent` | Audit content wrapper |
| `WorkspaceComplianceCard` | Compliance summary card |
| `WorkspacePdfCard` | PDF card wrapper |
| `WorkspacePdfHeader` | PDF viewer header |
| `useWorkspace.ts` | Workspace session management hook |
| `useLayoutDrag.ts` | Horizontal drag resize hook (35%-80% bounds) |

---

## 15. Cross-Tab Data Flow & Interconnections

### Tender → All Tabs
When a tender is analyzed (Tab 2 or Tab 3), the analysis results propagate across tabs:

| Source Action | Target Tab | Data Transferred | Mechanism |
|---|---|---|---|
| Tender analysis complete | QCOs (Tab 7) | List of cited + recommended standard codes | `analysis.report.items[].cited_standards` + `recommended_standards` via RemembranceContext |
| Tender analysis complete | Graph (Tab 6) | Focus on tender-related standards, tender banner count | `graphFocusTender` flag + tender std codes marking `isTenderStandard` on nodes |
| Tender analysis complete | GeM (Tab 8) | Line items available for webhook simulation dropdown | `gemSimItem` via dropdown selector + `analysis.report.items` |
| Tender analysis complete | AI Chat (Tab 4) | PDF text injected as context + findings transferable | `pdfText` via `isPdfConnectedToAiChat` + "Transfer Findings" button |
| Tender analysis complete | Assistant Drawer | PDF text injected as context | `isPdfConnectedToAiChat` + `pdfText` via RemembranceContext |
| Tender analysis complete | Navbar | Data indicator dot on Tender/Workspace tabs | `rem.tabs["tender"]?.file` / `rem.tabs["workspace"]?.file` |
| Tender Radar → Workspace | Navigate to workspace tab | Tab switch | `onNavigate("workspace")` changes `activeTab` |
| Workspace findings → GeM | Simulate individual finding in GeM | Pre-fill GeM form | `setGemSimItem(lineItem)` from TenderGemQcoSection |

### Tab State Caching
Each tab can cache its state via `tabs` record in RemembranceContext:
- `tabs["tender"]` → `{file, pdfBlobUrl, pdfText, analysis, chatMessages}`
- `tabs["workspace"]` → same structure
- Data persists across tab switches because components use `display:hidden` (not unmount).

### PDF ↔ AI Chat Connection
- `isPdfConnectedToAiChat` (default: `true`): When true, the extracted tender PDF text is sent with every AI Chat and Assistant Drawer query as additional context.
- `ChatPdfContextBanner` shows this connection status in the Chat tab with toggle control.
- Users can disconnect PDF context if they want general (non-tender-specific) responses.

### Issue-Level Chat Threads
- `issueChats: Record<string, ChatMessage[]>`: Stores independent chat threads per compliance finding.
- `activeIssueModal: IssueModalTarget`: Controls which finding's chat modal is open.
- Allows focused AI conversations about specific compliance violations without polluting the main chat.

---

## 16. Design System & Theming

### Two Overlapping Design Systems
The frontend uses **two design systems** that coexist:

#### 1. Apple-style Glassmorphism (Primary — modern components)
- **Background**: Near-black `#08090a` (`apple-bg`) with radial gradient overlays.
- **Glass cards**: `apple-glass` class = `rgba(255,255,255,0.04)` background + `backdrop-blur-2xl` + `border border-white/10`.
- **Dark glass**: `apple-glass-dark` = `rgba(0,0,0,0.4)` + blur.
- **Color palette**:
  - Blue: `#0071E3` (primary actions, send buttons)
  - Mint/Green: `#30D158` (success, voluntary schemes, GeM accent)
  - Amber: `#FF9F0A` (warnings, QCO accent)
  - Red: `#FF453A` (mandatory ISI Mark, errors, danger)
  - Indigo: `#5E5CE6` (AI/LLM accent, sparkles, loading glows)
- **Border radius**: `rounded-3xl` (24px) for cards, `rounded-full` for pills/buttons.
- **Shadows**: `shadow-2xl` with colored glows (e.g. `shadow-apple-blue/20`, `shadow-apple-mint/20`).
- **Text**: White at various opacities (`text-white/95`, `text-white/70`, `text-white/50`, `text-white/40`).
- **Selection**: `selection:bg-apple-blue selection:text-white`.

#### 2. Ruby/Surface Theme (Legacy — workspace/auditor components)
- **CSS Variables** defined in `styles/theme.css`:
  - Layout: `--color-canvas` (background), `--color-surface` (card bg), `--color-panel`, `--color-subtle`
  - Borders: `--color-border`, `--color-border-subtle`, `--color-border-highlight`
  - Text: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
  - Ruby accent: `--color-ruby` (primary action), `--color-ruby-hover`, `--color-ruby-glow`, `--color-ruby-subtle`
  - Status: `--color-status-compliant` (green), `--color-status-warning` (amber), `--color-status-danger` (red), `--color-status-draft` (gray)
  - Glass: `--glass-shadow`, `--glass-backdrop-blur`
- **Dark mode**: `#0a0e14` canvas with warm surface colors.
- **Light mode**: `#faf5ef` warm cream canvas (defined but dark mode is primary).
- **Border radius**: `rounded-xl` (12px) for cards.
- **BIS-specific colors**: `bis-navy (#0a192f)`, `bis-blue (#1e3a8a)`, `bis-amber (#d97706)`, `bis-emerald (#059669)`, `bis-slate (#0f172a)`, `bis-card (#1e293b)`, `bis-border (#334155)`.

### Typography
- System font stack (`font-sans`) — no custom font files loaded.
- `tracking-tight` for headings.
- Size scale: `text-[11px]`, `text-xs` (12px), `text-sm` (14px), `text-lg` (18px), `text-xl` (20px), `text-2xl`.
- Font weights: `font-medium`, `font-semibold`, `font-bold`.

### CSS Custom Styles
| File | Key Styles |
|---|---|
| `index.css` | Radial background gradients, frosted glass utilities (`apple-glass`, `apple-glass-dark`), dark scrollbars |
| `styles/theme.css` | Full CSS variable system for dark/light modes with semantic tokens |
| `styles/globals.css` | Tailwind layers, font features |
| `styles/radiant-search.css` | Radiant glowing search box with dynamic breathing caret, optical rays, light blooms, particle sparkles |

### Animation
- **Framer Motion**:
  - `AnimatePresence` for drawer/modal enter/exit.
  - `motion.div` with opacity/y/scale transitions.
  - `layoutId="activeTabPill"` for animated tab pill sliding.
  - Spring physics on `MotionButton` (tap/hover scale).
  - Speaking indicator bar: `scaleX: [0, 1, 0.5, 1, 0]` repeating.
- **CSS Animations**:
  - `animate-pulse` (loading states, status dots).
  - `animate-spin` (loading spinners).
- **Tailwind Transitions**: `transition-all`, `transition-colors`, `transition-transform`.
- **Accessibility**: `TextReveal` respects `prefers-reduced-motion`.

---

## 17. TypeScript Data Contracts

### Core Types (`types/index.ts`)

```typescript
// ===== Standards & Recommendations =====
IndianStandard {
  is_code: string;           // e.g. "IS 1786"
  title: string;             // Full standard title
  division: string;          // BIS division name
  status: string;            // Active, Superseded, Withdrawn
  superseded_by?: string;    // IS code of superseding standard
  year: number;              // Publication year
  reaffirmation_year?: number;
  amendments: string[];      // List of amendment identifiers
  scope: string;             // Standard scope description
  key_parameters: string[];  // Performance parameters
  test_methods: string[];    // IS codes for test methods
  normative_references: string[];  // IS codes for normative refs
  safety_standards: string[];
  installation_standards: string[];
  mandatory_qco: MandatoryQCO;
  category_keywords: string[];
  gem_categories: string[];
}

MandatoryQCO {
  is_mandatory: boolean;
  scheme: string;            // ISI Mark (Scheme I), CRS, BEE Star Rating, Hallmarking, Voluntary
  order_number: string;
  issuing_ministry: string;
  effective_date: string;
  clause_requirement: string;
}

AlliedStandardItem {
  is_code: string;
  title: string;
  relation_type: string;     // Normative Reference, Test Method, Safety, Installation
  status: string;
  is_mandatory: boolean;
  details: string;
}

StandardRecommendation {
  standard: IndianStandard;
  relevance_score: number;   // 0.0 - 1.0
  match_reasons: string[];
  allied_standards: AlliedStandardItem[];
  certification_alert: string;
  deprecation_warning?: string;
  sample_tender_clause: string;
}

RecommendationResponse {
  query: string;
  detected_language: string;
  translated_query: string;
  total_matches: number;
  recommendations: StandardRecommendation[];
  latency_ms: number;
  message?: string;
}

// ===== Tender =====
ExtractedLineItem {
  item_id: number;
  product_title: string;
  spec_summary: string;
  cited_standards: string[];
  outdated_citations: string[];
  recommended_standards: StandardRecommendation[];
}

ComplianceIssue {
  severity: "HIGH" | "MEDIUM" | "LOW";
  category: string;
  issue_text: string;
  corrective_action: string;
}

TenderAnalysisReport {
  document_name: string;
  extracted_items_count: number;
  items: ExtractedLineItem[];
  compliance_issues: ComplianceIssue[];
  mandatory_qco_coverage: number;    // 0-100
  complete_spec_clause_text: string;
  raw_text?: string;
}

// ===== Workspace =====
WorkspaceAnalysis {
  report: TenderAnalysisReport;
  compliance_run: {
    dataset_version: string;
    coverage: number;           // 0-100
    export_blocked: boolean;
    findings: Array<{
      severity: string;
      state: string;            // COMPLIANT, NON_COMPLIANT, NEEDS_VERIFICATION
      category: string;
      message: string;
    }>;
  };
  revision: {
    revision_id: string;
    status: string;             // DRAFT, APPROVED
    changes: string[];
  };
}

// ===== Graph =====
GraphData {
  nodes: Array<{
    id: string;                 // IS code
    label: string;
    title: string;
    division: string;
    is_mandatory: boolean;
    status: string;
  }>;
  edges: Array<{
    source: string;             // IS code
    target: string;             // IS code
    relation: string;           // "Normative Reference", "Test Method", "Superseded By"
  }>;
}

// ===== LLM =====
LlmStandardizedResponse {
  query: string;
  primary_is_code: string;
  primary_title: string;
  technical_justification: string;
  qco_compliance_verdict: string;
  mandatory_test_methods: string[];
  allied_standards_summary: string[];
  confidence_score: number;
  source_tier: string;
}

DocumentChunkEvidence {
  file_name: string;
  page_number: number;
  clause?: string;
  snippet: string;
  score?: number;
}

// ===== Voice =====
VoiceChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  audioUrl?: string;
  detectedLanguage?: string;
  timestamp: string;
}

VoiceChatResponse {
  transcribed_text: string;
  detected_language: string;
  llm_response: string;
  audio_url: string;
  mode: "fast" | "thinking";
  document_evidences?: DocumentChunkEvidence[];
  processing_time_ms: number;
}

VoiceStatusResponse {
  stt_available: boolean;
  stt_provider: string;
  tts_available: boolean;
  tts_provider: string;
  stt_device: string;
  tts_device: string;
  default_language: string;
}

// ===== Chat (internal) =====
ChatMessage {
  role: "user" | "assistant";
  text: string;
}

// ===== Context State =====
TabData {
  file: File | null;
  pdfBlobUrl: string | null;
  pdfText: string;
  analysis: WorkspaceAnalysis | null;
  chatMessages: ChatMessage[];
}

IssueModalTarget {
  key: string;
  title: string;
  category: string;
  severity: string;
  message: string;
  correctiveAction?: string;
  standards?: string[];
}
```

---

## 18. Complete Backend API Reference

### Health & Metrics
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/health` | System health: CUDA status, GPU device, LLM model status, embedding model status |
| `GET` | `/metrics` | Prometheus metrics: REQUEST_COUNT, REQUEST_LATENCY, RAG triad scores |
| `POST` | `/api/v1/admin/evaluate-rag` | Run RAG Triad evaluation (Context Relevance, Groundedness, Answer Relevance) on golden dataset |

### Standards & Recommendations
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/recommend` | Full hybrid recommendation pipeline (multilingual → ChromaDB + BM25 → BGE Reranker → LLM Auditor → Normative Graph → QCO → Clause) |
| `GET` | `/api/v1/standards` | List/search standards (params: division, query, limit, offset) |
| `GET` | `/api/v1/standards/{is_code}` | Get single standard by code |
| `GET` | `/api/v1/qco-list` | Get all mandatory QCO records |
| `GET` | `/api/v1/graph` | Get standards normative graph (nodes + edges, max_nodes param) |

### LLM / AI
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/explain-standard` | Non-streaming standard explanation with document evidence |
| `POST` | `/api/v1/explain-standard-stream` | **SSE** streaming standard explanation |
| `POST` | `/api/v1/ask-assistant` | Non-streaming assistant Q&A with guardrails |
| `POST` | `/api/v1/ask-assistant-stream` | **SSE** streaming assistant Q&A |
| `POST` | `/api/v1/tender-clauses` | Generate 4-part tender specification clauses |

### Distributed Reasoning
| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/mac-status` | Check remote Mac M-series node (health ping, latency, device info) |
| `POST` | `/api/v1/fast-answer` | Fast local GGUF Q&A (Qwen2.5-3B, max 256 tokens, optional PDF reranking + web search) |
| `POST` | `/api/v1/heavy-reasoning` | Heavy distributed reasoning (history summarization → PDF chunk reranking → context synthesis → web search → Mac node dispatch → local fallback) |
| `POST` | `/api/v1/summarize-context` | Compress multi-turn chat history into dense summary |

### Tender Analysis
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/analyze-tender` | Analyze tender document: item extraction, standards mapping, QCO verification, compliance findings, export gate |

### Workspace
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/workspaces` | Create new workspace (SQLite record) |
| `GET` | `/api/v1/workspaces/{id}` | Get workspace details + documents |
| `POST` | `/api/v1/workspaces/{id}/analyze` | Full compliance audit: parse → standards matching → QCO → findings → revision proposal |
| `POST` | `/api/v1/workspaces/{id}/templates` | Register DOCX/PDF export template |
| `POST` | `/api/v1/workspaces/{id}/revisions/{rid}/approve` | Approve proposed revision |
| `POST` | `/api/v1/workspaces/{id}/chat` | AI chat grounded in workspace documents |
| `POST` | `/api/v1/workspaces/{id}/chat-stream` | **SSE** streaming workspace chat |
| `POST` | `/api/v1/workspaces/{id}/export` | Export as DOCX (token replacement) or PDF (form fill / coordinate imprint) |

### Voice
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/voice/chat` | Voice conversation: Faster-Whisper STT → LLM reasoning → MMS-VITS TTS |
| `GET` | `/api/v1/voice/status` | Voice subsystem status (STT/TTS provider, device, language) |
| `GET` | `/api/v1/voice/audio/{filename}` | Serve cached synthesized WAV audio file |
| `WEBSOCKET` | `/api/v1/voice/live` | Real-time streaming: audio bytes → STT → LLM tokens → TTS chunks |

### Pipeline (Multi-modal)
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/pipeline/process` | Full multi-modal pipeline: text + PDF + image + audio → recommendations + LLM analysis + voice |
| `POST` | `/api/v1/voice/transcribe` | Audio-only transcription |
| `POST` | `/api/v1/voice/synthesize` | Text-to-speech synthesis → WAV response |
| `POST` | `/api/v1/image/classify` | Image classification/OCR |

### GeM Integration
| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/gem-webhook` | Simulate GeM bid validation: standards matching → normative resolution → clause generation → QCO check |

---

## Summary: What Each Tab Needs from the Backend

| Tab | Primary Endpoints | Key Backend Services |
|---|---|---|
| **Standards** | `POST /recommend`, `POST /tender-clauses`, `POST /explain-standard-stream` | HybridRetriever, RecommendationAuditor, NormativeResolver, CertificationAdvisor, TenderClauseGenerator, LlmService |
| **Tender Radar** | `POST /analyze-tender` | ComplianceEngine, DocumentParser, HybridRetriever, QcoRegistry, SpecExtractor |
| **Workspace** | `POST /workspaces`, `POST .../analyze`, `POST .../chat`, `POST .../chat-stream`, `POST .../export`, `POST .../templates`, `POST .../revisions/.../approve` | WorkspaceStore, ComplianceEngine, RevisionEngine, TemplateEngine, LlmService, HybridRetriever, ArtifactStore |
| **AI Chat** | `POST /fast-answer`, `POST /heavy-reasoning`, `GET /mac-status` | LlmOrchestrator, QueryGuardrails, DocumentChunkReranker, WebSearchService |
| **Speak to AI** | `POST /voice/chat`, `GET /voice/status`, `WS /voice/live` | VoiceAgentOrchestrator, FasterWhisperProvider, MmsVitsProvider, LlmOrchestrator, SentenceBuffer |
| **Graph** | `GET /graph` | StandardsLoader, NormativeResolver |
| **QCOs** | `GET /qco-list` | QcoRegistry |
| **GeM** | `POST /gem-webhook` | HybridRetriever, NormativeResolver, TenderClauseGenerator, QcoRegistry |
| **Assistant Drawer** | `POST /fast-answer`, `POST /heavy-reasoning`, `POST /summarize-context` | LlmOrchestrator, QueryGuardrails |

---

> **End of Report** — This document captures the complete frontend architecture: every tab's purpose, component hierarchy, backend interactions, features, data flows, cross-tab state management, design system, TypeScript contracts, and reusable component inventory. Use this as the definitive contract for rebuilding the frontend.
