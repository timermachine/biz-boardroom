# DevOpsBot

Versioned infrastructure base for Node.js/Express apps. Provides Docker Compose stacks, GitHub Actions CI/CD workflows, Terraform (OCI), nginx, and a Playwright e2e test harness.

Consumer apps pull this repo as a `git subtree` pinned to a semver tag. See [CHANGELOG.md](CHANGELOG.md) before updating.

## Using DevOpsBot in a new app

```bash
# Add a named remote (do this once):
git remote add devopsbot https://github.com/timermachine/DevOpsBot

# Pull in the infra at a specific version:
git subtree add --prefix=devopsbot devopsbot v0.1.0 --squash
```

Your repo layout after adding:

```
my-app/
  devopsbot/                    # DevOpsBot infra — update via subtree pull, don't edit here
  src/                          # your app code
  docker-compose.override.yml   # your overrides
  playwright.config.js          # your test config
  .env
```

Run with overrides:

```bash
docker compose -f devopsbot/docker-compose.yml -f docker-compose.override.yml up
```

## Updating to a new version

```bash
# 1. Read CHANGELOG.md at the target version — check ### Breaking Changes
# 2. Pull the update:
git subtree pull --prefix=devopsbot devopsbot v0.2.0 --squash
# 3. Resolve any conflicts, test, commit
```

## Versioning

Tags use `vMAJOR.MINOR.PATCH`. Breaking changes (Terraform var renamed, Docker env interface changed, GitHub Actions workflow input changed) bump MAJOR. New optional features bump MINOR. Bug fixes bump PATCH.

## Reference example

`app/` is a complete consumer example: Node/Express + Postgres + nginx wired to the DevOpsBot stack.

## Host requirements

VS Code + Docker Desktop. All tooling runs in the devcontainer.

## Tech stack

- **Runtime:** Node.js 24 (Alpine)
- **Framework:** Express.js
- **Database:** PostgreSQL 16 (Alpine)
- **Proxy:** Nginx Alpine (prod)
- **Registry:** GitHub Container Registry (GHCR)
- **Infra:** OpenTofu / Terraform (OCI ARM A1)
- **CI/CD:** GitHub Actions
- **Testing:** Playwright (e2e)
