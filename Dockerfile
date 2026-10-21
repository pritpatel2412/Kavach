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

# Copy dependency specifications and local detector package
COPY pyproject.toml ./
COPY packages/detector ./packages/detector

# Install python dependencies including psycopg for PostgreSQL/Neon
RUN pip install --no-cache-dir \
    fastapi \
    "uvicorn[standard]" \
    pydantic \
    "psycopg[binary]" \
    python-dotenv \
    websockets \
    httpx \
    openpyxl \
    pyotp \
    pyyaml \
    ./packages/detector

# Copy application source code and runtime assets
COPY apps/api ./apps/api
COPY assets ./assets
COPY fixtures ./fixtures

# Set permissions
RUN chown -R kavach:kavach /app

USER kavach

EXPOSE 8000

# Health check verifies /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Start container: run idempotent migrations first, then launch uvicorn
CMD ["sh", "-c", "python -c 'from apps.api.app.db import init_db; init_db()' && uvicorn apps.api.app.main:app --host 0.0.0.0 --port ${PORT} --proxy-headers --forwarded-allow-ips='*' --workers ${WEB_CONCURRENCY}"]
