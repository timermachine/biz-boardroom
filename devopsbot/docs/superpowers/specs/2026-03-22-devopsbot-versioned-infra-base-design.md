# DevOpsBot: Versioned Infrastructure Base

**Date:** 2026-03-22
**Status:** Approved

## Overview

Split `timermachine/cicd1` into two repositories:

- **`timermachine/DevOpsBot`** — versioned infrastructure base (this repo, renamed)
- **`timermachine/biz-boardroom`** — first consumer app (seeded from `biz/`)

Consumer apps pull DevOpsBot content via `git subtree`, pinned to a semver tag. When DevOpsBot evolves, consumers update by pulling the new tag and reviewing `CHANGELOG.md` for breaking changes.

## Repository Structure

### DevOpsBot

```
DevOpsBot/
  app/                          # reference consumer example (stays)
  infra/                        # Terraform
  nginx/
  docker-compose.yml
  docker-compose.dev.yml
  docker-compose.prod.yml
  docker-stack.yml
  docker-stack.prod.yml
  .github/
    workflows/                  # reusable CI/CD workflows
    instructions/
  scripts/
  e2e/                          # infra-level Playwright tests
  playwright.config.js          # infra test harness config
  docs/                         # architecture, onboarding, auth docs
  AGENTS.md
  CHANGELOG.md                  # new — semver entries, keepachangelog.com format
  README.md                     # updated: describes DevOpsBot as infra base
  package.json                  # Playwright/test runner dependencies
  package-lock.json
```

`biz/` is removed before tagging `v0.1.0`. `node_modules/` is gitignored and not committed.

### biz-boardroom

All contents of the current `biz/` directory transfer to the new repo root. Nothing is discarded.

```
biz-boardroom/
  devopsbot/                            # git subtree from DevOpsBot @ v0.1.0
  board-minutes/                        # from biz/board-minutes/
  boardroom/                            # from biz/boardroom/
    analytics.js
    app.js
    board-rules.md
    builtin-members.json
    example-biz-input-docs/
    how-to-use-boardroom.md
    member-factory.js
    project-context.md
    project-input-data/
    review-orchestration.json
    review-orchestration.md
    server-helpers.cjs
    storage.js
  docs/                                 # from biz/docs/
  test/                                 # from biz/test/
  playwright.config.js                  # consumer's own Playwright config
  rewardz-boardroom.html
  serve.cjs
  README.md                             # new
  AGENTS.md                             # new (copy from DevOpsBot, adjust as needed)
```

Excluded (generated artefacts, not committed): `playwright-report/`, `test-results/`, `.DS_Store`.

**Note on two `playwright.config.js` files:** DevOpsBot ships its own `playwright.config.js` at `devopsbot/playwright.config.js` — this is the infra-level test harness and is not used by the consumer. The `playwright.config.js` at the biz-boardroom root is the consumer's own config and is the one that runs in CI.

## Seeding biz-boardroom

Use `git subtree split` on cicd1 to produce a branch containing only the `biz/` history, then push that as biz-boardroom's `main`. This preserves `git log` and `git blame` history for all boardroom files.

```bash
# In cicd1:
git subtree split --prefix=biz --branch biz-split
# Create biz-boardroom repo on GitHub, then:
cd /path/to/biz-boardroom
git init
git fetch /path/to/cicd1 biz-split
git checkout -b main FETCH_HEAD
git remote add origin https://github.com/timermachine/biz-boardroom.git
git push -u origin main
```

## Adding DevOpsBot as a Subtree in a Consumer

```bash
# Add a named remote to avoid repeating the URL:
git remote add devopsbot https://github.com/timermachine/DevOpsBot

# Bootstrap (first time):
git subtree add --prefix=devopsbot devopsbot v0.1.0 --squash

# Update later:
git subtree pull --prefix=devopsbot devopsbot v0.2.0 --squash
```

DevOpsBot content is physically embedded under `devopsbot/` — not a symlink or reference. The consumer's own files sit alongside it and are never touched by subtree pulls.

## Consumer Layout Pattern

```
my-app/
  devopsbot/                    # DevOpsBot infra — pull updates here, don't edit
  src/                          # consumer's own code
  docker-compose.override.yml   # consumer-specific Docker overrides
  playwright.config.js          # consumer's own test config
  .env
```

**Docker Compose usage with overrides:**
```bash
docker compose -f devopsbot/docker-compose.yml -f docker-compose.override.yml up
```

## Consumer Update Flow

```bash
# 1. Read CHANGELOG.md at the target tag — check ### Breaking Changes section
# 2. Pull the update
git subtree pull --prefix=devopsbot devopsbot v0.2.0 --squash
# 3. Resolve any conflicts in consumer overrides, test, commit
```

## Versioning Contract

Tags on DevOpsBot use `vMAJOR.MINOR.PATCH`. `CHANGELOG.md` follows [keepachangelog.com](https://keepachangelog.com) format. Each release entry includes a `### Breaking Changes` section (empty if none).

| Change Type | Version Bump |
|---|---|
| Terraform variable renamed or removed | major |
| Docker environment variable interface changed | major |
| GitHub Actions workflow input/output changed | major |
| New optional script, workflow, or feature | minor |
| Bug fix, documentation update | patch |

**Tagging discipline:** `main` in DevOpsBot is branch-protected. Tags are never force-pushed. A tag represents an immutable, reviewed release.

## Implementation Steps

1. Remove `biz/` from cicd1 (`git rm -r biz/`)
2. Update `README.md` to describe DevOpsBot purpose and the subtree consumer pattern
3. Add `CHANGELOG.md` with `v0.1.0` entry (keepachangelog.com format)
4. Commit — this commit is the `v0.1.0` release commit
5. Push to new GitHub repo `timermachine/DevOpsBot` (rename remote or create new repo)
6. Tag `v0.1.0` on that commit and push the tag
7. Use `git subtree split` on cicd1 to extract `biz/` history → push as `timermachine/biz-boardroom` main
8. Add DevOpsBot as a named remote in biz-boardroom and run `git subtree add --prefix=devopsbot devopsbot v0.1.0 --squash`
9. Add `README.md` and `AGENTS.md` to biz-boardroom

## What Stays in DevOpsBot

| Path | Stays | Notes |
|---|---|---|
| `app/` | Yes | Reference consumer example |
| `infra/` | Yes | Terraform |
| `nginx/` | Yes | Infra |
| `docker-compose*.yml` | Yes | Infra |
| `docker-stack*.yml` | Yes | Infra |
| `.github/workflows/` | Yes | Reusable CI/CD |
| `.github/instructions/` | Yes | AI coding instructions |
| `scripts/` | Yes | Tooling |
| `e2e/` + `playwright.config.js` | Yes | Infra test harness |
| `docs/` | Yes | Architecture, onboarding, auth docs |
| `package.json` + `package-lock.json` | Yes | Test runner dependencies |
| `AGENTS.md` | Yes | AI agent instructions for DevOpsBot |
| `biz/` | No | Moves to biz-boardroom |