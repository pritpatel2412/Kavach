# Production Dockerfile for Kavach API Backend Container
# Uses official Python slim base image and non-root user
FROM python:3.12-slim

# System setup & security hardening
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    WEB_CONCURRENCY=1

# Document single-instance constraint:
# Real-time WebSocket sessions and live audio intercom relays operate in-memory.
# Multiple workers or multi-instance clustering without Redis will drop intercom calls.
# WEB_CONCURRENCY is strictly pinned to 1.

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user for security
RUN groupadd -g 1001 kavach && \
    useradd -u 1001 -g kavach -m -s /bin/bash kavach

# Copy dependency specifications and local packages
COPY apps/api/requirements.txt ./requirements.txt
COPY packages/detector ./packages/detector
COPY packages/api-contract ./packages/api-contract

# Install python dependencies including psycopg for PostgreSQL/Neon
RUN pip install --no-cache-dir \
    -r requirements.txt \
    "psycopg[binary]" \
    ./packages/detector

# Copy application source code and runtime assets
COPY apps/api ./apps/api
COPY apps/web ./apps/web
COPY assets ./assets
COPY fixtures ./fixtures

# Create data directory for local fallback storage and set ownership
RUN mkdir -p /app/data && chown -R kavach:kavach /app

USER kavach

EXPOSE 8000

# Health check verifies /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start container: run idempotent migrations first, then launch uvicorn
CMD ["sh", "-c", "PYTHONPATH=/app/apps/api:/app python -c 'from app.db import init_db; init_db()' && uvicorn app.main:app --app-dir apps/api --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips='*' --workers ${WEB_CONCURRENCY}"]
