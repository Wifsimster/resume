#!/bin/bash
set -euo pipefail

COMPOSE_DIR="${RESUME_COMPOSE_DIR:-/opt/resume}"

cd "$COMPOSE_DIR"

echo "Pulling latest images..."
docker compose pull resume

echo "Restarting services..."
docker compose up -d resume

echo "Cleaning up old images..."
docker image prune -f

echo "Deploy complete!"
