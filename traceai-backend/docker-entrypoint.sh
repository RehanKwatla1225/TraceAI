#!/bin/sh
set -e

echo "Running database seed..."
python -m app.seed

echo "Starting TraceAI Backend..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000