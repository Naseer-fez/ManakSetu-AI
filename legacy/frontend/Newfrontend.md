# BIS-SpecAI New Frontend — Build Specification

## 1. Non-negotiable direction

This is a **new product interface**, not a restyle of `legacy/frontend`.

- Use the legacy folder only to preserve service calls, TypeScript payloads, and backend behaviour.
- Do not copy its page shell, top pill navigation, Tailwind utility compositions, card layouts, background treatment, or component markup.
- Rebuild all views from the component references in `frontend/component` and the behaviour/API requirements in `frontend.md`.
- The visual target is **calm premium**: a precise, tactile procurement instrument with immersive moments only around search, AI, voice, and graph exploration. Compliance work must remain clear and low-distraction.

The current implementation should be treated as a temporary behaviour baseline. The visual rebuild replaces its shell and feature view composition.

## 2. Design language

### Theme and styling

- `src/styles/theme.css` is the only source of colour values. It exposes semantic CSS variables for canvas, elevated surface, panel, border, primary, Ruby-red, success, warning, danger, text, and muted text.
- Tailwind may use those variables, but no component may introduce a literal colour value or a separate colour palette.
- Use a near-black graphite canvas with dim blue-white highlights and a restrained Ruby-red accent for the ₹ companion cursor and AI activity. Compliance colours are semantic, never decorative.
- Typography uses the system SF-style stack. Headings are compact and editorial; dense procurement data uses smaller, tabular-friendly text.

### Global shell

- Replace the legacy fixed top pill with a **spatial command rail**: a compact vertical navigation dock on desktop and a bottom command dock on mobile.
- The current destination is represented by a soft 3D lens that springs between destinations. The navigation labels appear in an adjacent contextual panel on hover/focus, not as a permanent row of pills.
- The content area is a broad editorial canvas with a view header, a primary task region, and an optional contextual inspector panel. It must not resemble the legacy centered glass-card stack.
- The global assistant becomes a contextual side sheet opened from the rail. It receives the active workspace/document context but never obscures an approval or export state.

### ₹ cursor companion

- On fine-pointer desktop devices, keep the system pointer and render a small Ruby-red glass ₹ blob that follows with a slight transform-only lag.
- It expands gently over actionable controls and becomes static/hidden for text editing, coarse pointers, and `prefers-reduced-motion`.
- It is an enhancement only: every action remains discoverable and fully usable without it.

## 3. Reference component map

| Reference | Production implementation | Where it is used |
| --- | --- | --- |
| `navbar.html` | Command rail with a shared Framer Motion `layoutId` lens, spring movement, tooltips, keyboard focus, and mobile bottom dock. | All views |
| `search.html` | `RadiantSearchComposer`: real input, subtle Ruby/cream caret bloom, query suggestion layer, division selector, and a single explicit submit action. No full-screen particle field. | Standards search; optional contextual search in Auditor |
| `button.html` | `MotionButton`: transform-only hover/tap motion and short specular edge response. Do not use always-on OGL/WebGL for ordinary buttons. | Primary actions, exports, approval, graph controls |
| `copybutton.html` | `CopyAction`: copies clauses, evidence, revision changes, and AI answers; changes icon/text to “Copied” and announces the result. | Clause, assistant, workspace, GeM result |
| `textaniamtion.html` | `TextReveal`: one-time word/line entrance for view titles and short AI response sections. Never animate finding rows or table data. | View headers, empty states, streamed response headings |
| `thinkingmodel.html` | Thinking indicator/toggle. It shows the selected model mode and a short processing state; it is not a decorative theme switch. | Voice and global assistant |
| `aimodeswitch.html` | Accessible segmented Fast / Thinking selector with a moving selected surface and persistent request-mode label. | Voice and global assistant |
| `agentbar.html` | Lazy-loaded audio-reactive agent sphere. Idle is monochrome; microphone amplitude drives saturation and zoom through `requestAnimationFrame`. | Voice Assistant only |
| `graphanimation to startwith.html` | Radial graph entry/loading composition using local semantic icon nodes, never remote avatar images. | Knowledge Graph empty/loading state |
| `graphantimatio.html` | Animated evidence beams that explain User → AI → BIS/QCO evidence relationships. They supplement, not replace, real graph edges. | Knowledge Graph inspector and AI provenance states |

Reference snippets describe the intended interaction; production components must be implemented locally in TypeScript/React and themed through CSS variables.

## 4. Page composition

### Workspace — default route

The primary screen is a two-stage evidence workspace, not a legacy upload card.

1. **Source stage**: workspace name/status, a drop zone or text-source tab, source integrity summary, and one “Run audit” action.
2. **Review stage**: left evidence timeline; centre findings/revision canvas; right inspector for selected finding, source location, dataset provenance, and corrective action.
3. **Decision footer**: revision status, template mapping state, draft/export gate, and explicitly separate `Create draft` from `Export reviewed` actions.
4. **Grounded assistant sheet**: asks questions against the current source and stores the answer in the workspace session.

`NON_COMPLIANT`, `NEEDS_VERIFICATION`, and `export_blocked` must always remain visible. A green status is allowed only when the backend compliance run permits it.

### Standards

- Use the radiant composer as the hero interaction.
- Results appear as a compact relevance rail, with the selected standard shown in an editorial detail canvas containing QCO status, scope, references, explanation stream, related standards, and tender clause.
- A copied clause must always be labelled as a proposal, not legal/compliance confirmation.

### Auditor

- A focused source-analysis route for single document audit. It uses the same source stage visual language as Workspace but does not expose workspace approval/export controls.
- Parsed items become a structured reading view with inline issue annotations, not the legacy list of translucent cards.

### Voice and Live Voice

- Voice is a conversation stage: agent sphere, Fast/Thinking selector, transcription timeline, answer, playable generated audio, and evidence citations.
- Live Voice is a monitoring surface: connection control, continuous transcript, insight cards, and an amplitude visualizer. It uses the same semantic states as Voice without duplicating the normal chat layout.
- Load visualizer/agent-sphere code only when either voice route opens.

### Knowledge Graph

- Use a full-canvas interactive graph with pan, zoom, node focus, keyboard node navigation, and a details inspector.
- Show actual backend nodes and edges. The radial intro and animated beams are only transitional/provenance effects.
- When motion/canvas is unavailable, show a searchable relationship list with the same data.

### QCOs and GeM

- QCOs is a data ledger with sticky filters, status/date emphasis, and an inspector drawer for the selected order.
- GeM is a compact bid-validation workbench: input form on the left, returned score/standards/QCO requirements on the right, and copied recommended clause below. Do not present a score as legal compliance.

## 5. Architecture and data boundaries

- Keep React + Vite + TypeScript, Framer Motion, Lucide, native `fetch`, and Tailwind. Avoid adding a component framework or a global state library.
- Keep all endpoint logic in `src/services`, all payloads/type guards in `src/types`, and shared UI primitives in `src/components/ui`.
- Create new layout/feature components rather than editing legacy-shaped components in place:
  - `src/components/layout/CommandRail.tsx`, `AppShell.tsx`, `ContextSheet.tsx`
  - `src/components/ui/RadiantSearchComposer.tsx`, `MotionButton.tsx`, `CopyAction.tsx`, `StatusToken.tsx`
  - `src/components/workspace/*`, `src/components/voice/*`, `src/components/graph/*`
- Preserve `VITE_API_BASE_URL`; never hardcode an API origin.
- Keep `pdfText`/current workspace context available to the global assistant. Preserve SSE parsing (`data:` chunks, `[DONE]`, inline `[ERROR]`) and multipart `FormData` upload behaviour.
- Workspace API remains: create/restore → analyse file or `raw_text` → chat → approve immutable revision → export Blob. Template mapping must be confirmed before a reviewed export.

## 6. Animation and performance rules

- Framer Motion is used for route transitions, rail lens movement, staged content entrance, and tap/hover feedback.
- CSS/Framer animations are restricted to `transform`, `opacity`, and bounded `filter`; never animate layout dimensions repeatedly.
- The agent sphere/audio visualizer uses one animation frame loop only while active, is lazy-loaded, caps DPR at 2, and pauses when the route is hidden.
- Graph motion is data-driven and has a list fallback. Use reduced detail/fewer active particles on constrained devices.
- `prefers-reduced-motion` disables persistent motion, cursor lag, staggered text, pulsing controls, and graph-entry effects.
- Each route is lazy-loaded. Voice/graph dependencies must not increase the initial Workspace bundle.

## 7. Rebuild order and acceptance criteria

1. Remove legacy visual shell/component composition from the active frontend while retaining service/type code.
2. Build theme tokens, new app shell, command rail, responsive dock, ₹ cursor, and shared primitives.
3. Rebuild Workspace fully with source/review/decision regions and compliance truth states.
4. Rebuild Standards, Auditor, QCOs, and GeM using the new layout system.
5. Rebuild Voice, Live Voice, and Knowledge Graph with their reserved high-performance effects and fallbacks.
6. Add empty, loading, error, and reduced-motion states for every route; add visual fixtures for clean, blocked, and verification-required workspace runs.
7. Run `npm run build`, verify each route at desktop and mobile widths, test keyboard-only navigation, and manually complete upload → audit → chat → approve → export against a running backend.

The rebuild is accepted only when a side-by-side comparison with `legacy/frontend` shows different navigation placement, content hierarchy, page composition, typography rhythm, panels, and state presentation. Sharing API behaviour is allowed; sharing visual structure is not.
