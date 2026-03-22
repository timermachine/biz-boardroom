FROM mcr.microsoft.com/devcontainers/javascript-node:24-bullseye

# Dev tooling: psql client, curl, jq
RUN apt-get update && apt-get install -y --no-install-recommends \
    postgresql-client \
    curl \
    jq \
    && rm -rf /var/lib/apt/lists/*

# AI tooling
RUN npm install -g @anthropic-ai/claude-code @openai/codex @finos/calm-cli

# Security tooling
RUN npm install -g snyk

