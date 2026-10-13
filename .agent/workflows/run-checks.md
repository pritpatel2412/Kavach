---
description: Run all offline checks
---
1. Run `make test`.
2. Run `make eval` and compare against the last numbers recorded in `STATUS.md`.
3. If UI changed, run `make dev-mock` and check `http://localhost:8000/?mock=1&judge=1` reaches risk level 3 with interventions at L2 and L3.
4. Report failures with file and line; do not mask them.
