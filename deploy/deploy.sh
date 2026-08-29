#!/bin/bash
set -euo pipefail

COMPOSE_DIR="${RESUME_COMPOSE_DIR:-/opt/docker/resume}"

cd "$COMPOSE_DIR"

# Both services ship from the same commit: `resume` (nginx + the built SPA) and
# `chat` (the LLM backend behind the /api/ proxy). Deploying only the frontend
# leaves the site serving a new UI against a stale backend — that is how
# v1.13.17 ended up live with a backend predating the /api/chat/feedback
# endpoint it calls. release.yml publishes both images, so deploy both.
SERVICES="resume chat"

echo "Pulling latest images..."
docker compose pull $SERVICES

echo "Restarting services..."
docker compose up -d $SERVICES

echo "Cleaning up old images..."
docker image prune -f

echo "Deploy complete!"
