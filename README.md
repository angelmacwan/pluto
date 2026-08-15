# Pluto

**Visual Python. Real Code.**

Pluto is a node-based visual editor that generates real, runnable Python code. Build data pipelines, train ML models, and orchestrate AI agents by connecting nodes on a canvas — Pluto compiles your graph into a clean, inspectable Python script you can run locally, download, or save to your account.

---

## What it does

- **Drag nodes onto a canvas** — choose from 54 built-in node types across 7 categories
- **Connect them** — Pluto tracks data flow and types between nodes
- **Watch code generate live** — a Monaco-powered code panel updates in real time as you build
- **Run locally** — send the generated script to a local Python bridge and see streamed output right in the app
- **Save to your account** — projects are stored in Firestore, tied to your Google account

---

## Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 18 + TypeScript (Vite) |
| Node editor | React Flow (`@xyflow/react`) |
| State management | Zustand + Immer |
| Styling | Tailwind CSS v3 (dark theme) |
| Code editor | Monaco Editor |
| Icons | Lucide React |
| Auth | Firebase Authentication (Google Sign-In) |
| Database | Cloud Firestore |
| Routing | React Router v6 |

---

## Project structure

```
pluto/
├── frontend/          # React app
│   ├── src/
│   │   ├── types/             # Shared TypeScript types
│   │   ├── lib/
│   │   │   ├── firebase.ts    # Firebase init
│   │   │   ├── nodeRegistry.ts  # 54 node type definitions + code generators
│   │   │   └── codegen.ts     # Topological sort → Python script assembly
│   │   ├── store/
│   │   │   ├── graphStore.ts  # Nodes/edges, undo/redo, copy/paste
│   │   │   ├── appStore.ts    # UI state, bridge connection, console output
│   │   │   └── projectStore.ts  # Firestore CRUD for projects
│   │   ├── hooks/
│   │   │   ├── useCodegen.ts          # Debounced live code generation
│   │   │   ├── useKeyboardShortcuts.ts
│   │   │   └── useBridge.ts           # Local Python bridge (HTTP + WebSocket)
│   │   ├── components/
│   │   │   ├── auth/          # LoginPage, AuthProvider
│   │   │   ├── canvas/        # React Flow canvas with drag-and-drop
│   │   │   ├── nodes/         # BaseNode renderer, NodeFactory
│   │   │   ├── sidebar/       # NodePalette (searchable, categorised)
│   │   │   ├── panels/        # CodePanel (Monaco), OutputPanel (console)
│   │   │   └── ui/            # TopBar, Toast notifications
│   │   └── pages/
│   │       ├── EditorPage.tsx   # Main editor layout
│   │       └── ProjectsPage.tsx # Project dashboard
│   ├── firestore.rules          # Firestore security rules
│   └── firebase.json
└── bridge/            # Local Python execution bridge (planned)
```

---

## Node library (54 nodes)

| Category | Nodes |
|---|---|
| **Primitives** | Variable, Print/Debug, If/Conditional, For Loop, Custom Python, File Read/Write, Import Library |
| **Data** | CSV/Excel/JSON Loader, API Fetch, DataFrame Filter/Sort/Merge/GroupBy, Column Select/Drop, Missing Imputer, Scaler, Encoder, Train/Test Split |
| **Machine Learning** | Linear/Logistic Regression, Decision Tree, Random Forest, SVM, KNN, Gradient Boosting, XGBoost, K-Means, DBSCAN, Model Trainer/Predict, Cross-Validator, Hyperparameter Tuner |
| **Deep Learning** | Linear Layer, Sequential Model, Training Loop (PyTorch), Model Save/Load/Inference |
| **AI Agents** | LLM Call (OpenAI / Anthropic / Google), Prompt Template, Memory/Context, Agent Loop, Structured Output |
| **Evaluation** | Classification Report, Confusion Matrix, ROC/AUC, Regression Metrics, Plotly Chart, DataFrame Preview, Aggregate Stat |

---

## Getting started

### Prerequisites

- Node.js 18+
- A Google account (for Firebase Auth)

### Run locally

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

Sign in with Google — your projects are stored in Firestore automatically.

### Build for production

```bash
cd frontend
npm run build
```

---

## Code generation

Every node declares a `generateCode()` function and lists its `imports` and `pipPackages`. When you connect nodes:

1. Pluto **topologically sorts** the graph (cycles are rejected with a clear error)
2. Each node's output becomes a **deterministic Python variable name** (e.g. `csv_loader_0`, `model_trainer_2`)
3. Node code is emitted in order, with inputs resolved to upstream variable names
4. All imports are **deduplicated** and placed at the top
5. A `requirements.txt` is derived from the aggregated `pipPackages` list

The generated code is always valid, standalone Python — no Pluto runtime dependency.

---

## Local Python bridge

> Planned — see `bridge/`

A small FastAPI server the user runs locally (`pip install pluto-bridge && pluto-bridge start`). The frontend connects to it at `http://localhost:8765`, sends generated code, and streams stdout/stderr back via WebSocket. The bridge executes scripts in isolated subprocesses and supports cancel.

---

## Firebase

- **Project:** `pluto-d0d5e`
- **Console:** https://console.firebase.google.com/u/0/project/pluto-d0d5e/overview
- **Auth:** Google Sign-In
- **Firestore schema:**
  ```
  users/{uid}/
    projects/{projectId}   ← graph JSON, name, timestamps
  ```
- **Security rules:** Users can only read/write their own documents (`request.auth.uid == userId`)
