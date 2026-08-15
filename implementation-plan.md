# Pluto v2 — Implementation Checklist

A node-based visual editor that generates real, runnable Python code. Users build a graph of nodes (Python primitives, data pipelines, ML/DL, AI agents, math, visualization), the app always compiles the graph to a Python script the user can inspect, edit, run locally via a bridge to their own Python install, or save to their account.

Stack: React (frontend, node editor), Firebase (auth + Firestore + storage), a local Python execution bridge (small local server the user runs), code generation engine that turns the node graph into a linear/topologically-sorted Python script.

---

## Phase 0 — Project Setup

- [ ] Init React app (Vite, not CRA)
- [ ] Set up TypeScript
- [ ] Install node editor library: React Flow (xyflow) — confirm it supports custom node types, custom edges, minimap, zoom/pan, programmatic layout
- [ ] Set up state management (Zustand recommended — React Flow's own docs use it, keeps node/edge state + app state separate and simple)
- [ ] Set up styling approach (Tailwind recommended for speed)
- [ ] Set up Firebase project (Auth, Firestore, Storage)
- [ ] Set up basic CI (lint, typecheck, build) even if solo — catches breakage early since an AI agent will be committing a lot of code
- [x] Decide monorepo vs single app — likely single app is fine unless the local execution bridge becomes its own publishable package, then split into a workspace (frontend/, bridge/)
      ANSWER : i want the frontend to be its own thing and python bridge to be seperae . However they both will go in the same repo. use /frontend for frontend and /bridge for python

---

## Phase 1 — Core Node Editor (canvas only, no codegen yet)

- [ ] Canvas with pan/zoom (React Flow default)
- [ ] Node sidebar / palette — categorized, searchable list of available node types
- [ ] Drag-from-palette to canvas to create a node
- [ ] Node component shell: title, category color, input handles, output handles, inline config fields (varies per node type)
- [ ] Edge creation by dragging handle to handle
- [ ] Edge validation — prevent connecting incompatible types (e.g. a DataFrame output into a "string" input) — define a simple type system for handles now, it's much harder to retrofit later
- [ ] Node deletion, edge deletion
- [ ] Multi-select + bulk delete/move
- [ ] Copy/paste nodes
- [ ] Undo/redo (needed early — painful to add later)
- [ ] Node grouping / subgraph / "frame" (visual grouping, not necessarily functional at first)
- [ ] Zoom-to-fit, minimap
- [ ] Graph JSON schema defined (nodes, edges, positions, per-node config, graph-level metadata like name/description)
- [ ] Serialize graph to JSON / deserialize JSON back into canvas state

---

## Phase 2 — Code Generation Engine

This is the core differentiator — get the architecture right before adding many node types.

- [ ] Define the node type registry: each node type declares its inputs, outputs, config schema, AND a code-generation function/template
- [ ] Topological sort of the graph (handle branches, merges, and detect cycles — reject cycles with a clear UI error)
- [ ] Variable naming strategy — each node's output becomes a deterministic, readable Python variable name (avoid `node_1234_out`, prefer something like `df_1`, `model_1`, derived from node type + index)
- [ ] Code emission per node — each node type emits one or more lines/blocks of Python using its config + input variable names
- [ ] Import aggregation — each node type declares what it needs (`import pandas as pd`, `from sklearn... import ...`); dedupe and sort imports at the top of the generated file
- [ ] Full-script assembly: imports → setup → node code in topological order → optional entrypoint/main block
- [ ] Live codegen preview panel — updates as the graph changes (debounce this, don't regenerate on every keystroke)
- [ ] Syntax highlighting for the generated code panel (e.g. CodeMirror or Monaco)
- [ ] "Copy code" and "Download .py" from the preview panel
- [ ] Validate generated code before run (basic — e.g. run through a linter/AST parse client-side if feasible, or catch syntax errors from the execution bridge)
- [ ] Requirements generation: each node type declares its pip package dependency(ies); aggregate, dedupe, and emit both a `requirements.txt` (for actual pip install) and a `requirements.md` (human-readable, grouped by node/category, as requested)

---

## Phase 3 — Node Library (build incrementally, in this order)

### 3a. Python primitives (build first — this is the foundation everything else sits on)

- [ ] Variable / literal node (string, number, bool, list, dict)
- [ ] Print / debug output node
- [ ] Function definition node (or: allow any node to be wrapped as a reusable function)
- [ ] If / conditional node
- [ ] For loop / iterator node
- [ ] Custom Python code node (raw code block, freeform inputs/outputs) — critical escape hatch, do not skip
- [ ] Import / library node (in case a user needs a package not covered by any prebuilt node)
- [ ] File read/write node (local file, generic)

### 3b. Data pipeline nodes

- [ ] CSV / Excel / JSON loader
- [ ] SQL query node (connection config + query)
- [ ] API fetch node (REST, method/headers/body config)
- [ ] DataFrame filter / query node
- [ ] Column select / drop node
- [ ] Missing value imputer
- [ ] Encoders (one-hot, label)
- [ ] Scalers (standard, min-max, robust)
- [ ] Train/test split, stratified split
- [ ] Merge/join node
- [ ] Group-by / aggregate node
- [ ] Sort node

### 3c. Math (mostly via Python block, per your call — keep this section minimal)

- [ ] Confirm the Custom Python Code node handles arbitrary math well (numpy/mathjs-equivalent operations) — likely no dedicated math nodes needed beyond this
- [ ] Optional: a couple of very common convenience nodes (e.g. "aggregate stat" — mean/median/std on a column) if they turn out to be used constantly

### 3d. Classical ML nodes

- [ ] Linear/logistic regression
- [ ] Decision tree, random forest
- [ ] SVM, KNN
- [ ] Gradient boosting / XGBoost / LightGBM
- [ ] K-means, DBSCAN
- [ ] Model trainer node (generic — takes any sklearn-style estimator + data, fits it)
- [ ] Cross-validator
- [ ] Hyperparameter tuner (grid/random search)

### 3e. Deep learning nodes

- [ ] Framework choice config (PyTorch vs TF/Keras — pick one first, likely PyTorch given ecosystem momentum, add the other later if needed)
- [ ] Basic feedforward network builder (layers config)
- [ ] CNN block
- [ ] RNN/LSTM block
- [ ] Training loop node (epochs, optimizer, loss config)
- [ ] Inference/predict node
- [ ] Model save/load node

### 3f. AI agent nodes (the wedge — prioritize once primitives + basic data nodes exist)

- [ ] LLM call node (provider/model config, API key handling via user settings, not hardcoded)
- [ ] Prompt template node (variables interpolated into a prompt string)
- [ ] Prompt chain node (sequence multiple prompt/LLM steps)
- [ ] Tool/function-calling node (define a tool schema the LLM can call)
- [ ] Memory/context node (conversation history, simple vector store, or file-based memory)
- [ ] Agent loop node (basic ReAct-style loop: think → act → observe, bounded iterations)
- [ ] Structured output / JSON-mode node (constrain LLM output to a schema)
- [ ] Web search / retrieval node (optional, later)

### 3g. Evaluation & visualization nodes

- [ ] Classification report, confusion matrix
- [ ] ROC/AUC, precision-recall curve
- [ ] Regression metrics (MAE/RMSE/R2)
- [ ] Generic plot node (matplotlib/seaborn/plotly — pick one default, e.g. plotly for interactivity in the UI)
- [ ] DataFrame preview/table node (show data, not just plots)

---

## Phase 4 — Local Python Execution Bridge

This is the part that makes the tool actually useful, not just a code generator.

- [ ] Design the bridge as a small standalone local server (Python, e.g. FastAPI) the user installs/runs once (`pip install pluto-bridge && pluto-bridge start`, or a simple downloadable script)
- [ ] Bridge exposes a local HTTP/WebSocket endpoint (e.g. `http://localhost:8765`)
- [ ] In the app's settings, user enters their local bridge URL (default to `localhost:8765`, editable in case of custom port/remote tunneling)
- [ ] Connection check / "ping" in UI — show connected/disconnected status clearly, don't let the user try to run without knowing the bridge is offline
- [ ] Security: bridge should only accept connections from localhost by default, and/or require a token shown once in the terminal on bridge startup that the user pastes into the app — treat this as arbitrary code execution and design accordingly, this is the highest-risk part of the whole system
- [ ] Run request: app sends generated code (or a reference to a saved script) to the bridge
- [ ] Bridge executes the script in a subprocess (not in-process — isolate it, capture stdout/stderr, allow kill/cancel)
- [ ] Streaming output back to the app: use WebSocket (or Server-Sent Events) so stdout/progress streams live, not just returned at the end
- [ ] Capture and relay: text output (print statements), errors/tracebacks, and generated visualizations (matplotlib figures saved to temp files/base64, or plotly JSON, sent back to the app to render inline)
- [ ] Handle long-running scripts (training a model) — need a way to show "still running" state and support cancel
- [ ] Auto-install missing packages on first run, or at minimum, detect missing packages and prompt the user (surface `requirements.txt` clearly, offer a one-click "install requirements" action that runs `pip install -r requirements.txt` via the bridge)
- [ ] Bridge should report basic environment info back to the app (Python version, installed packages) so the UI can warn about mismatches before running

---

## Phase 5 — Execution UI

- [ ] "Run" button (run full pipeline)
- [ ] Optional: "Run to this node" (partial execution up to a selected node — useful for debugging, but complex, can be a later addition)
- [ ] Live progress indicator — per-node status (pending / running / done / error), reflected visually on the node itself (e.g. colored border or spinner)
- [ ] Console/log panel — streamed stdout, scrollable, clearly separated from errors
- [ ] Output panel — structured display of node outputs: DataFrames as tables, images/plots rendered inline, plain values as text
- [ ] Error display — when a node fails, show the traceback, and visually flag which node failed on the canvas
- [ ] Re-run from a specific node (rerun only downstream of a change, not the whole graph — nice-to-have, not required for v1)

---

## Phase 6 — Save / Load / Export

- [ ] Save graph locally — download the graph JSON file
- [ ] Load graph from a local JSON file (drag-and-drop or file picker)
- [ ] Download generated Python script (`.py`)
- [ ] Download `requirements.txt` and `requirements.md`
- [ ] "Export project" — bundle graph JSON + generated `.py` + requirements into a single zip
- [ ] Save online to account (see Phase 7 for backend) — save graph JSON to Firestore, tied to user ID
- [ ] Project list / dashboard view — user's saved projects, rename, delete, duplicate
- [ ] Autosave (debounced, to Firestore if logged in, or localStorage as a fallback draft if not)

---

## Phase 7 — Backend (Firebase)

- [ ] Firebase Auth — email/password + at least one OAuth provider (Google, easiest given the ecosystem)
- [ ] Firestore schema:
    - `users/{uid}` — profile, settings (default bridge URL, theme, API key references — never store raw provider API keys in plaintext, see note below)
    - `users/{uid}/projects/{projectId}` — graph JSON, name, created/updated timestamps, description
- [ ] Firestore security rules — users can only read/write their own documents, validate document shape server-side where possible
- [ ] Firebase Storage — for any larger assets (e.g. uploaded CSVs used as pipeline inputs, exported bundles) if you don't want to store those inline in Firestore documents
- [ ] Settings page — bridge URL config, theme, default LLM provider config
- [ ] API key handling for AI agent nodes — do not store user's LLM provider keys in Firestore in plaintext; either have the user paste their key client-side only (kept in browser storage / passed straight to the bridge, never touching your backend) or use a proper secrets manager if you ever proxy calls server-side
- [ ] Basic account management (delete account, export all data)

---

## Phase 8 — Polish / Cross-Cutting

- [ ] Onboarding — a first-run template graph so a new user sees a working pipeline immediately, not a blank canvas
- [ ] Node search/command palette (type to find a node type quickly, not just scroll the sidebar)
- [ ] Keyboard shortcuts (delete, copy/paste, undo/redo, run)
- [ ] Dark/light theme
- [ ] Responsive/desktop-first — this is not a mobile use case, don't burn time on mobile layouts early
- [ ] Error boundaries so one bad node doesn't crash the whole canvas
- [ ] Basic analytics/telemetry (optional, privacy-respecting) to see which node types actually get used — useful for deciding where to invest node-library effort later

---

## Suggested Build Order Summary

1. Phase 0–1: get a working empty canvas with draggable nodes and edges
2. Phase 2 + Phase 3a: prove the codegen engine works with just Python primitives
3. Phase 4 (bridge) + Phase 5 (execution UI): get run/output working end-to-end on the simplest possible graph — this is the riskiest technical piece, validate it early rather than last
4. Phase 3b–3e: expand the node library (data → classical ML → DL)
5. Phase 3f: AI agent nodes — the differentiating wedge, but needs the primitives + data nodes solid first since agent pipelines usually touch data too
6. Phase 6–7: save/load and Firebase backend (can actually be built in parallel with node library expansion, once Phase 0 auth scaffolding is in place)
7. Phase 8: polish once the core loop (build graph → generate code → run locally → see output) works reliably

---

## Open Decisions To Make Before/During Build

- [x] PyTorch vs TensorFlow/Keras as the DL default
      ANSWER : PyTorch
- [x] Plotting library default (plotly recommended for inline interactivity vs matplotlib static images)
      ANSWER : plotly
- [x] Bridge distribution method (pip package vs standalone downloadable executable)
      ANSWER : pip package
- [x] Whether partial/incremental re-run (only downstream of a changed node) is a v1 requirement or a later optimization
      ANSWER : later
- [x] Whether node "type system" for edges is strict (hard validation) or advisory (warning only) — strict is safer but slower to build node-by-node
      ANSWER : advisory
