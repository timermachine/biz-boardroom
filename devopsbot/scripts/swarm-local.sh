#!/usr/bin/env bash
set -euo pipefail

# local swarm convenience deploy
cd "$(dirname "$0")/.."

POSTGRES_USER=${POSTGRES_USER:-myuser}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-mypassword}
POSTGRES_DB=${POSTGRES_DB:-mydb}
IMAGE=${IMAGE:-local/myapp}
TAG=${TAG:-latest}

# init swarm if needed
if [ "$(docker info --format '{{.Swarm.LocalNodeState}}' 2>/dev/null || echo inactive)" != "active" ]; then
  echo "Initializing Docker Swarm..."
  docker swarm init --advertise-addr 127.0.0.1
fi

# create secrets idempotently
for secret in postgres_user postgres_password postgres_db; do
  if ! docker secret ls --format '{{.Name}}' | grep -qx "$secret"; then
    echo "Creating secret: $secret"
    case "$secret" in
      postgres_user) echo "$POSTGRES_USER" | docker secret create "$secret" - ;;
      postgres_password) echo "$POSTGRES_PASSWORD" | docker secret create "$secret" - ;;
      postgres_db) echo "$POSTGRES_DB" | docker secret create "$secret" - ;;
    esac
  else
    echo "Secret exists: $secret"
  fi
done

echo "Building app image: ${IMAGE}:${TAG}"
docker build -t "${IMAGE}:${TAG}" app

echo "Deploying swarm stack"
IMAGE="${IMAGE}:${TAG}" TAG="${TAG}" docker stack deploy -c docker-stack.yml myapp --with-registry-auth

sleep 5

echo "Services status:"
docker stack services myapp

echo "Tasks status:"
docker stack ps myapp
