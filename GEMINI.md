# GEMINI.md (Antigravity overrides)
Follow [`AGENTS.md`](./AGENTS.md) fully; it is the source of truth. Antigravity-specific guidance:
- **Parallel agents (Manager view):** give each agent a disjoint file area to avoid merge conflicts.
  Agent A = `apps/api/`, `scripts/`. Agent B = `apps/web/`, `packages/detector/`, `eval/`. Docs/`STATUS.md` are updated by whoever finishes a task.
- Verify UI changes against `http://localhost:8000/?mock=1&judge=1` (run `make dev-mock`), never against live credits.
- Finish every task by running `make test` and pasting the pass/fail summary into `STATUS.md`.
- Workflows are in `.agent/workflows/`; rules in `.agent/rules/`.
