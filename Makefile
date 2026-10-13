PY=.venv/bin/python
.PHONY: setup test dev dev-mock eval clips

setup:            ## create venv, install deps
	python3 -m venv .venv
	.venv/bin/pip install -q -r apps/api/requirements.txt -e packages/detector
	@test -f .env || cp .env.example .env
	@echo "Setup done. Edit .env, then: make dev-mock"

test:             ## ALL tests, fully offline (no credits)
	$(PY) -m pytest -q

dev-mock:         ## run server with scripted transcripts (zero credits) -> http://localhost:8000/?mock=1&judge=1
	KAVACH_MOCK_STT=1 .venv/bin/uvicorn app.main:app --app-dir apps/api --reload --port 8000

dev:              ## run server against live Prisma (uses credits!) -> http://localhost:8000/?judge=1
	KAVACH_MOCK_STT=0 .venv/bin/uvicorn app.main:app --app-dir apps/api --reload --port 8000

eval:             ## replay saved transcripts through detector (zero credits)
	$(PY) eval/run_eval.py --transcripts eval/fixtures

clips:            ## pre-render default warning clips (uses a few credits)
	$(PY) scripts/prerender_clips.py
