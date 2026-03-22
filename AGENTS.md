# AGENTS.md

Instructions for AI agents working in this repository.

## Project Overview

DevOpsBot is a versioned infrastructure base for Node.js/Express apps. It provides Docker Compose stacks, GitHub Actions CI/CD workflows, Terraform (OCI), nginx, and a Playwright e2e harness. Consumer apps pull it via `git subtree`. The `app/` directory is a reference consumer example.

## Repository Layout

```
DevOpsBot/
├── app/                    # Node.js Express application
│   ├── src/
│   │   ├── app.js         # Express app (routes: /health, /db-health, /hello-new-world)
│   │   └── index.js       # Server entry point
│   ├── test/
│   │   └── app.test.js    # Integration tests (native Node test runner)
│   ├── Dockerfile         # Multi-stage build: deps → builder → production
│   └── package.json       # Scripts: start, dev, test, coverage, lint
├── nginx/nginx.conf        # Reverse proxy to app:3000
├── docker-compose.yml      # Base services (app, db with healthchecks)
├── docker-compose.dev.yml  # Dev: build from source, node --watch, expose db:5432
├── docker-compose.prod.yml # Prod: pull from GHCR, nginx, restart: always
├── .github/workflows/
│   ├── ci.yml             # PR workflow: lint → test → coverage → push image
│   └── deploy.yml         # Main workflow: build/push image → SSH deploy
└── .env.example           # Required env vars template
```

## Tech Stack

- **Runtime:** Node.js 24 (Alpine)
- **Framework:** Express.js ^4.18.2
- **Database:** PostgreSQL 16 (Alpine)
- **Testing:** Node.js native `test` module + `assert`
- **Coverage:** c8 (V8-based)
- **Linting:** ESLint ^8.57.0 (ES2024, Node env, single quotes, semicolons required)
- **Proxy:** Nginx Alpine (prod only)
- **Registry:** GitHub Container Registry (GHCR)

## Running the App

### Development
```bash
# Copy env file first
cp .env.example .env

# Start dev stack (live reload via node --watch + volume mount)
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Run tests inside container
docker compose exec app npm test

# Run linting
docker compose exec app npm run lint

# Run coverage
docker compose exec app npm run coverage
```

### Production
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Application Endpoints

| Endpoint | Method | Response |
|----------|--------|----------|
| `/` | GET | `{ message: "Hello from myapp" }` — defined in `index.js` |
| `/health` | GET | `{ status: "ok", env: NODE_ENV }` |
| `/db-health` | GET | DB connectivity result or 503 if `DATABASE_URL` unset |
| `/hello-new-world` | GET | `{ message: "Hello new world" }` |

## CI/CD Workflows

### ci.yml (PRs to main)
Path filter: `app/**`, `docker-compose*.yml`, `.github/workflows/**`

1. Copy `.env.example` → `.env`
2. `docker compose up -d --build --wait`
3. `npm run lint` (via compose exec)
4. `npm test` (via compose exec)
5. `npm run coverage` (via compose exec)
6. Login to GHCR → build & push image tagged `sha-{SHA}` and `pr-{number}`
7. Teardown

### deploy.yml (push to main or manual dispatch)
Path filter same as ci.yml

**Job 1: build-and-push**
- Docker Buildx with GitHub Actions cache
- Tags: `latest`, `sha-{SHA}`

**Job 2: deploy** (depends on job 1)
- SSH into server via appleboy/ssh-action
- Pull new image from GHCR
- `docker compose up -d --no-build`

**Required Secrets:** `SERVER_HOST`, `SERVER_USER`, `SSH_PRIVATE_KEY`

## Sandbox Environment (Oracle Cloud)

Pre-production pen-test sandbox on OCI ARM A1, triggered by the `staging` branch.

### Infrastructure
- **Provisioned by:** `infra/` (OpenTofu) — run via `infra.yml` workflow
- **Compute:** OCI ARM A1 Flex, 2 OCPU / 12 GB RAM, Ubuntu 22.04
- **Orchestration:** Docker Swarm single-node
- **Stack file:** `docker-stack.yml` (single-node, no placement constraints)

### Sandbox Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `infra.yml` | `workflow_dispatch` (apply/destroy) | Provision or tear down OCI infrastructure |
| `deploy-sandbox.yml` | Push to `staging` | Build arm64 image + deploy Swarm stack |
| `sandbox-access.yml` | `workflow_dispatch` (open/close, ip, ports) | Add/remove NSG rules for pen testers |

### GitHub Secrets (sandbox-specific)

| Secret | Purpose |
|--------|---------|
| `OCI_TENANCY_OCID` | OCI auth |
| `OCI_USER_OCID` | OCI auth |
| `OCI_FINGERPRINT` | OCI auth |
| `OCI_PRIVATE_KEY` | OCI auth (PEM content) |
| `OCI_REGION` | e.g. `us-ashburn-1` |
| `OCI_COMPARTMENT_OCID` | Where resources are created |
| `OCI_NSG_OCID` | NSG for pen-test firewall rules (output from `infra.yml`) |
| `OCI_STORAGE_ACCESS_KEY` | OCI Customer Secret Key ID (Terraform S3 backend) |
| `OCI_STORAGE_SECRET_KEY` | OCI Customer Secret Key value (Terraform S3 backend) |
| `OCI_STORAGE_NAMESPACE` | Tenancy object storage namespace (`oci os ns get`) |
| `TF_VAR_SSH_PUBLIC_KEY` | Public key injected into VM |
| `SANDBOX_HOST` | VM public IP — update after each `tofu apply` |
| `SANDBOX_SSH_KEY` | Private key matching `TF_VAR_SSH_PUBLIC_KEY` |

### Networking
- SSH/22: open to world, key-only auth (GitHub Actions runner IPs are dynamic)
- HTTP/80: default-deny; opened per pen test via `sandbox-access.yml`
- HTTP only — no TLS configured

## Development Rules

- **Codex auth persistence:** For devcontainer login behavior and shared auth cache setup (`~/.codex` bind/volume mounts), see `docs/codex-auth.md`.

- **Node.js version:** Always use Node 24 (Alpine base image)
- **Linting:** Code must pass `eslint` before committing — single quotes, semicolons required, ES2024 target
- **Tests:** Use Node's native `test` module (no Jest/Mocha). Tests run as integration tests against the running Express server.
- **Docker:** Multi-stage builds only. Production image must use non-root `nodejs` user.
- **GitHub Actions:** Pin all third-party actions to full SHA (not tags) for security.
- **Env vars:** Never commit `.env`. Always update `.env.example` when adding new variables.
- **docker-compose:** Dev/prod split via override files — don't collapse into one file.

## Key Constraints

- Database port (5432) is **not** exposed in production compose — dev only.
- `DATABASE_URL` being unset is a handled case — `/db-health` returns 503, app still starts.
- App Dockerfile `HEALTHCHECK` uses `wget` (Alpine has no `curl` by default).
- `package-lock.json` is committed and required — CI uses `npm ci`.

## Environment Variables

See `.env.example` for the full list. Key vars:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NODE_ENV` | `development` or `production` |
| `REGISTRY` | Container registry (default: `ghcr.io`) |
| `IMAGE_NAME` | Image name for GHCR pushes |
| `SERVER_HOST` | Deployment target (used in deploy workflow) |
