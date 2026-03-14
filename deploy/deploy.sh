#!/bin/bash
set -euo pipefail

cd "$(dirname "$0")/.."

echo "Pulling latest images..."
docker compose pull resume

echo "Restarting services..."
docker compose up -d resume

echo "Cleaning up old images..."
docker image prune -f

echo "Deploy complete!"
