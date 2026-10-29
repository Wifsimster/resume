#!/bin/bash
set -euo pipefail

COMPOSE_DIR="${RESUME_COMPOSE_DIR:-/opt/docker/resume}"

cd "$COMPOSE_DIR"

SERVICES="resume chat"

echo "Pulling latest images..."
docker compose pull $SERVICES

echo "Restarting services..."
docker compose up -d $SERVICES

echo "Cleaning up old images..."
docker image prune -f

echo "Deploy complete!"
