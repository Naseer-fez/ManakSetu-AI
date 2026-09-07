# BIS-SpecAI Page Content Specification

This file defines **what each new page must contain**. It is intentionally independent of the legacy frontend so implementation can be designed from content, user tasks, and API data rather than copied markup.

## Shared page rules

- Every page uses the new command rail/dock, view title, concise task description, primary content region, and contextual inspector only when useful.
- A page must have a useful empty state, loading state, error state, keyboard focus order, and reduced-motion presentation.
- Use the same semantic states everywhere: `Compliant`, `Needs verification`, `Non-compliant`, `Review required`, `Draft`, and `Approved`.
- A recommendation, confidence score, or generated clause is never presented as legal compliance confirmation.
- Workspace/document context is available to the global assistant, but the assistant must not hide primary approvals or export controls.

## 1. Workspace — default page

### Purpose

Give a procurement officer one clear place to create a tender workspace, audit a source, inspect evidence, approve a proposed revision, and export the right output.

### What must be present

1. **Workspace identity**
   - Workspace name, short ID, creation/restoration status, and uploaded document summary.
   - Clear empty state: “Create a workspace to begin.”

2. **Source stage**
   - Two source choices: upload a PDF/DOCX/TXT/image or paste raw tender text.
   - Selected source name, file type, source-preserved message, and one `Run audit` action.
   - Busy/progress state while the file is analysed.

3. **Review stage**
   - Coverage percentage, dataset version, export gate, and count of findings.
   - Findings ordered by state/severity; each includes state, category, plain-language message, corrective action, and evidence location.
   - Original document/evidence timeline so the officer can understand where the finding came from.
   - Selected-finding inspector with the full evidence and the corrective action.

4. **Revision stage**
   - Immutable revision ID, revision status, and each proposed change.
   - Explicit `Approve revision` action; approval does not silently edit the original source.

5. **Template and export stage**
   - Template mapping status and field-review result.
   - Separate actions for `Create draft PDF/DOCX` and `Export reviewed PDF/DOCX`.
   - Reviewed export remains disabled with a clear reason when template approval, revision approval, OCR mapping, or compliance state blocks it.

6. **Grounded workspace chat**
   - Question field, answer area, grounded/unavailable state, and copy action.
   - The answer is scoped to the current workspace/document.

### Must not be present

- No generic dashboard metrics unrelated to the tender.
- No green compliance presentation when `NEEDS_VERIFICATION` or `export_blocked` is returned.
- No legacy-style stack of floating cards as the page structure.

## 2. Standards — recommendation page

### Purpose

Find BIS standards from a procurement description and turn the result into an evidence-backed standard/tender-clause review.

### What must be present

1. **Radiant search composer**
   - Free-text product/specification query.
   - Division filter: All, Civil, Electrical, Electronics, Solar, plus backend-supported divisions.
   - Search/submit action, keyboard Enter support, loading response, and no-results guidance.

2. **Result rail**
   - Match count, standard code, title, relevance score, QCO requirement, and selected-result state.
   - Results remain scannable; selecting one changes the detail canvas without a full route change.

3. **Standard detail canvas**
   - Standard title/code, scope, status, division, key parameters, test methods, amendments, and supersession warning.
   - Mandatory QCO details when present: scheme, order number, ministry, effective date, and clause requirement.
   - Normative references, safety/installation standards, and allied standards.

4. **AI explanation and clause**
   - Progressive explanation stream with explicit loading/error state.
   - Proposed tender clause with copy action and a “proposal only” label.

### Must not be present

- No claim that a high relevance score equals compliance.
- No full-screen visual effect that makes the query text hard to read.

## 3. Auditor — single-document audit page

### Purpose

Allow a user to run a fast, document-focused tender audit without creating a full workspace.

### What must be present

1. **Document intake**
   - Drop/select PDF or DOCX, accepted formats, selected document name, and analyse action.
   - Extracting/parsing state and clear upload failure state.

2. **Document reading view**
   - Document name, extracted item count, and source text where available.
   - Parsed line items with cited/outdated/recommended standards.

3. **Compliance findings**
   - High/Medium/Low severity, issue text, corrective action, and source/item reference.
   - QCO coverage and generated tender clause.

4. **Next actions**
   - Send the extracted document text to the global assistant.
   - Clear path to continue the same document in Workspace.

### Must not be present

- No revision approval/export controls; those belong only to Workspace.

## 4. QCO Explorer

### Purpose

Search and inspect active mandatory Quality Control Orders without making the page feel like a raw database dump.

### What must be present

1. **Ledger filters**
   - Search by IS code, ministry, order number, scheme, and effective date.
   - Active filter count and clear-filter action.

2. **QCO ledger**
   - Standard code, scheme, order number, ministry, effective date, and mandatory status.
   - Sortable/readable columns with a mobile card/list alternative.

3. **Order inspector**
   - Full clause requirement, issuing ministry, effective date, and linked standard context.
   - Copy action for the clause requirement.

4. **States**
   - Loading, no matching order, and service unavailable states.

### Must not be present

- No green “compliant” status merely because an order exists.

## 5. Knowledge Graph

### Purpose

Explore how standards, normative references, safety requirements, and QCO obligations relate.

### What must be present

1. **Graph stage**
   - Actual API nodes and edges, pan/zoom/reset controls, node focus, and semantic node/edge labels.
   - Radial introduction/loading state before graph data becomes available.

2. **Node inspector**
   - Selected standard code/title, division, mandatory state, current status, and connected relationships.
   - Relationship explanations: normative reference, safety standard, hierarchy, allied relation.

3. **Evidence flow**
   - Animated beams only when explaining User → AI → BIS/QCO evidence provenance.
   - Motion is supplementary; data stays readable when it is disabled.

4. **Fallback**
   - Searchable relationship list for reduced-motion, small screens, or unavailable canvas/WebGL capability.

### Must not be present

- No placeholder-only node graph or remote profile images.

## 6. GeM Simulator

### Purpose

Simulate the BIS/GeM bid-validation webhook using procurement inputs and return an auditable result.

### What must be present

1. **Input workbench**
   - Bid ID, category, product title, and buyer technical specifications.
   - Validate action, request loading state, and field-level error messages.

2. **Validation result**
   - Bid status, compliance score, primary standard, QCO mandatory state/order, allied standards, and recommended clause.
   - Copy action for the generated clause.

3. **Truth label**
   - Explain that the webhook result is a recommendation/validation response and does not replace a final compliance decision.

### Must not be present

- No “Bid compliant” declaration from the numeric score alone.

## 7. Voice Assistant

### Purpose

Run an evidence-aware procurement conversation through spoken input and a selectable reasoning mode.

### What must be present

1. **Conversation stage**
   - Push-to-talk control, microphone availability/error state, transcript, assistant response, evidence citations, and optional synthesized audio playback.

2. **Mode controls**
   - Fast/Thinking segmented selector with the active mode visible before recording begins.
   - Language selector: Auto, English, Hindi.

3. **Agent sphere**
   - Monochrome idle state.
   - Saturation/zoom reacts to current audio amplitude while the user is speaking.
   - Processing state after speech is submitted.

4. **Conversation tools**
   - Clear conversation action, current voice/STT/TTS availability, and copy action for assistant text.

### Must not be present

- No permanent high-intensity animation while the page is idle.

## 8. Live Voice

### Purpose

Monitor an ongoing voice session and expose immediate transcript/insight feedback.

### What must be present

1. **Session control**
   - Connection status, Connect/Disconnect action, Start/Stop listening action, and reconnect/error state.

2. **Live visualizer**
   - Audio level visualization that clearly distinguishes listening, processing, and idle states.

3. **Transcript stream**
   - Current interim transcription, completed user turns, completed assistant turns, timestamps, and extracted insights.

4. **Failure handling**
   - Clear microphone, websocket, and server-unavailable messages without losing completed transcript turns.

### Must not be present

- No duplicated Voice Assistant chat layout; this is a monitoring workspace.

## 9. Global Assistant side sheet

### Purpose

Offer an always-available AI assistant that knows the current document context without becoming the main page.

### What must be present

- Open/close control in the command rail.
- Current context indicator: no document, active audit, or active workspace.
- Fast/Thinking mode selector, compact chat history, streaming answer state, inline error state, and copy action.
- Context refresh/compression action for long chats.

### Must not be present

- The sheet must not cover final export/approval controls or claim answers are legal advice.

## Page completion checklist

A page is complete only when it has:

- The content listed above.
- Loading, empty, error, mobile, keyboard, and reduced-motion states.
- Semantic status messaging that matches backend truth.
- No copied legacy layout, navigation, card composition, or visual hierarchy.
