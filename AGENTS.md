# AGENTS.md — Pluto Agent Rules

This file governs how AI agents (and contributors acting as agents) must behave when working in this repository.

---

## 🚫 Never Run Servers

**Do not start any server, dev server, or long-running process.** This includes but is not limited to:

- `npm run dev` / `vite` / `vite preview`
- `python app.py`, `uvicorn`, `fastapi`, `flask`, `gunicorn`
- `node server.js` or any equivalent
- `pluto-bridge start` or any bridge daemon
- Any command that binds to a port and blocks the terminal

> If you need to verify code correctness, **run tests or builds instead** (see [Verification](#verification) below).

---

## 🐍 Python Rules

### Environment Isolation — Always Use `.env`

- Every Python script or module **must** load configuration from a `.env` file using `python-dotenv`.
- **Never** hard-code secrets, API keys, file paths, or environment-specific values.
- A `.env.example` should be kept up to date with all required keys (no real values).
- Scripts must gracefully error if a required env var is missing.

```python
# Required pattern at the top of every Python entry point
from dotenv import load_dotenv
load_dotenv()
```

- Use `pip` for dependency management and virtual environments where possible.
- Keep a `requirements.txt` or `pyproject.toml` up to date for every Python component.

### Code Quality — Ruff

All Python code **must** pass [Ruff](https://docs.astral.sh/ruff/) linting and formatting before being committed.

```bash
# Lint
ruff check .

# Auto-fix
ruff check --fix .

# Format
ruff format .
```

- Ruff config lives in `pyproject.toml` (preferred) or `ruff.toml`.
- Do not bypass ruff with `# noqa` unless there is a documented reason in a comment.
- Target Python 3.11+ unless otherwise specified.

---

## 🌐 Frontend (TypeScript / React) Rules

### Code Quality — oxlint

The frontend uses [oxlint](https://oxc.rs/docs/guide/usage/linter) for linting.

```bash
cd frontend
npm run lint        # runs oxlint
```

- Config lives in `frontend/.oxlintrc.json`.
- Fix all lint errors before committing. Do not disable rules without a comment explaining why.

### Type Checking

```bash
cd frontend
npx tsc --noEmit   # type-check without emitting files
```

---

## ✅ Verification

When you need to verify that code works, use **builds and tests only** — never run a server.

### Frontend

```bash
cd frontend
npm run build       # TypeScript compile + Vite production build
npm run lint        # oxlint
```

A successful `npm run build` is sufficient proof that the frontend compiles and is type-safe.

### Python (bridge / scripts)

```bash
# Lint & format check
ruff check .
ruff format --check .

# Run tests (pytest)
pytest              # or: uv run pytest

# Type check (if mypy / pyright is configured)
mypy .
```

> Never use `python -m http.server`, `uvicorn`, or similar to "test" that code works. Write a proper test instead.

---

## 📁 Project Structure Reference

```
pluto/
├── AGENTS.md               ← this file
├── frontend/               ← React 19 + TypeScript (Vite 8)
│   ├── src/
│   │   ├── types/          ← shared TS types
│   │   ├── lib/            ← firebase, nodeRegistry, codegen
│   │   ├── store/          ← Zustand stores (graph, app, project)
│   │   ├── hooks/          ← useCodegen, useBridge, useKeyboardShortcuts
│   │   └── components/     ← auth, canvas, nodes, sidebar, panels, ui
│   ├── .oxlintrc.json      ← oxlint config
│   ├── tailwind.config.js
│   └── vite.config.ts
└── bridge/                 ← Python execution bridge (planned)
    ├── .env.example        ← required env vars (no secrets)
    └── ...
```

---

## 🔑 Secrets & Environment Variables

| Location       | Rule                                                    |
| -------------- | ------------------------------------------------------- |
| `.env`         | Real values — **never commit**, already in `.gitignore` |
| `.env.example` | Template with placeholder values — **always commit**    |
| Source code    | **No hard-coded secrets, ever**                         |

---

## 📋 Commit Checklist

Before finishing any task, verify:

- [ ] No servers were started
- [ ] Python files pass `ruff check` and `ruff format --check`
- [ ] Any new Python entry point uses `load_dotenv()`
- [ ] `.env.example` is updated if new env vars were added
- [ ] Frontend passes `npm run build` and `npm run lint`
- [ ] No secrets or real credentials appear in any tracked file
