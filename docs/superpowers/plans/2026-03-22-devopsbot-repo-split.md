# DevOpsBot Repo Split Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split `timermachine/cicd1` into `timermachine/DevOpsBot` (versioned infra base) and `timermachine/biz-boardroom` (first consumer app), connected via `git subtree`.

**Architecture:** Remove `biz/` from cicd1, update its identity to DevOpsBot, publish as a new GitHub repo tagged `v0.1.0`. Extract `biz/` history via `git subtree split`, push as a new biz-boardroom repo, then pull DevOpsBot back in as a subtree under `devopsbot/`.

**Tech Stack:** git, GitHub CLI (`gh`), git subtree (built into git)

---

## Files Modified/Created in DevOpsBot (cicd1)

| File | Action | Notes |
|---|---|---|
| `biz/` | Delete | `git rm -r biz/` |
| `README.md` | Modify | Rewrite for DevOpsBot identity |
| `AGENTS.md` | Modify | Update repo name and overview |
| `CHANGELOG.md` | Create | keepachangelog format, v0.1.0 entry |

## Files Created in biz-boardroom (new repo)

| File | Action | Notes |
|---|---|---|
| all `biz/` contents | Seeded via git subtree split | Lands at repo root |
| `devopsbot/` | Created via git subtree add | DevOpsBot @ v0.1.0 |
| `README.md` | Create | Explains app + subtree relationship |
| `AGENTS.md` | Create | AI agent instructions for this repo |

---

## Task 1: Remove biz/ from cicd1

**Files:** Delete `biz/` tree

- [ ] **Step 1: Stage biz/ for deletion**

```bash
cd "/Users/steve/dev/--26 Projects/spikes/ci-cd/cicd1"
git rm -r biz/
```

Expected: long list of `rm 'biz/...'` lines, no errors.

- [ ] **Step 2: Verify biz/ is gone from working tree**

```bash
ls biz 2>/dev/null && echo "STILL EXISTS" || echo "REMOVED OK"
```

Expected: `REMOVED OK`

---

## Task 2: Rewrite README.md for DevOpsBot

**Files:** Modify `README.md`

- [ ] **Step 1: Replace README.md content**

Replace the full content of `README.md` with:

```markdown
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
```

- [ ] **Step 2: Verify README looks right**

```bash
head -5 README.md
```

Expected: `# DevOpsBot`

---

## Task 3: Update AGENTS.md for DevOpsBot

**Files:** Modify `AGENTS.md`

- [ ] **Step 1: Update the Project Overview and repo name in AGENTS.md**

Make two targeted edits using the Edit tool (read the file first):

**Edit A** — replace the overview paragraph (lines ~7-8):

old: `Node.js/Express monorepo serving as a reference CI/CD pipeline implementation. Single service (`myapp`) with PostgreSQL, Docker Compose environments, and GitHub Actions workflows.`

new: `DevOpsBot is a versioned infrastructure base for Node.js/Express apps. It provides Docker Compose stacks, GitHub Actions CI/CD workflows, Terraform (OCI), nginx, and a Playwright e2e harness. Consumer apps pull it via \`git subtree\`. The \`app/\` directory is a reference consumer example.`

**Edit B** — replace the repo name in the layout block (line ~13):

old: `cicd1/`

new: `DevOpsBot/`

- [ ] **Step 2: Verify AGENTS.md updated**

```bash
head -12 AGENTS.md
```

Expected: "DevOpsBot is a versioned infrastructure base" in the overview.

---

## Task 4: Add CHANGELOG.md

**Files:** Create `CHANGELOG.md`

- [ ] **Step 1: Create CHANGELOG.md**

Create `CHANGELOG.md` with this content:

```markdown
# Changelog

All notable changes to DevOpsBot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-03-22

### Added
- Initial versioned infrastructure base extracted from `timermachine/cicd1`
- Node/Express + PostgreSQL + nginx Docker Compose stack (dev, prod, sandbox variants)
- GitHub Actions workflows: CI, deploy, infra provisioning, sandbox access, Codacy, Snyk
- OpenTofu/Terraform definitions for OCI ARM A1 sandbox environment
- Playwright e2e test harness
- Reference consumer example in `app/`
- `git subtree` consumer pattern documented in README

### Breaking Changes

None — initial release.

[0.1.0]: https://github.com/timermachine/DevOpsBot/releases/tag/v0.1.0
```

- [ ] **Step 2: Verify CHANGELOG.md**

```bash
head -3 CHANGELOG.md
```

Expected: `# Changelog`

---

## Task 5: Commit the v0.1.0 release

**Files:** Stage all changes and commit

- [ ] **Step 1: Verify staged changes**

```bash
git status
```

Expected: deleted `biz/` files, modified `README.md`, modified `AGENTS.md`, new `CHANGELOG.md`.

- [ ] **Step 2: Stage remaining files and commit**

Note: the `biz/` deletions from Task 1 are already staged in the index — `git rm` stages immediately.

```bash
git add README.md AGENTS.md CHANGELOG.md
git commit -m "$(cat <<'EOF'
feat: establish DevOpsBot as versioned infra base

Remove biz/ (moves to timermachine/biz-boardroom), rewrite README and
AGENTS.md for DevOpsBot identity, add CHANGELOG.md at v0.1.0.

This commit is the v0.1.0 release.

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

- [ ] **Step 3: Note the commit SHA**

```bash
git log --oneline -1
```

Save this SHA — it's the v0.1.0 release commit.

---

## Task 6: Create DevOpsBot on GitHub and push

**Files:** GitHub remote config

- [ ] **Step 1: Create the DevOpsBot repo on GitHub**

```bash
gh repo create timermachine/DevOpsBot \
  --public \
  --description "Versioned infrastructure base for Node.js/Express apps"
```

Expected: URL printed, e.g. `https://github.com/timermachine/DevOpsBot`

- [ ] **Step 2: Update the remote to point to DevOpsBot**

```bash
git remote set-url origin https://github.com/timermachine/DevOpsBot.git
git remote -v
```

Expected: both fetch and push show `timermachine/DevOpsBot.git`

- [ ] **Step 3: Push main**

```bash
git push -u origin main
```

Expected: `Branch 'main' set up to track remote branch 'main' of 'origin'.`

---

## Task 7: Tag v0.1.0 and push

- [ ] **Step 1: Create the tag**

```bash
git tag v0.1.0
```

- [ ] **Step 2: Push the tag**

```bash
git push origin v0.1.0
```

Expected: `* [new tag]         v0.1.0 -> v0.1.0`

- [ ] **Step 3: Verify tag on GitHub**

```bash
gh release create v0.1.0 \
  --title "v0.1.0 — Initial release" \
  --notes "Initial versioned infrastructure base. See [CHANGELOG.md](https://github.com/timermachine/DevOpsBot/blob/main/CHANGELOG.md) for details."
```

Expected: release URL printed.

---

## Task 8: Extract biz/ history with git subtree split

**Working directory:** `/Users/steve/dev/--26 Projects/spikes/ci-cd/cicd1`

Note: `git subtree split` runs against committed history only. Any uncommitted or unstaged changes to `biz/` files that existed before Task 1 (e.g. modified `biz/boardroom/app.js`) will not appear in the split — only committed content is captured. This is expected. The split reads all commits that touched the `biz/` prefix and produces a new branch where those paths are at the root. This works even though `biz/` was deleted in Task 5 — the history is intact.

- [ ] **Step 1: Run the split**

```bash
cd "/Users/steve/dev/--26 Projects/spikes/ci-cd/cicd1"
git subtree split --prefix=biz --branch biz-split
```

Expected: SHA printed for the tip of the new `biz-split` branch.

- [ ] **Step 2: Verify the split branch**

```bash
git log --oneline biz-split | head -5
```

Expected: commits whose messages relate to biz/boardroom work (e.g. "Add boardroom orchestration", "barely passable c level Biz simluation").

- [ ] **Step 3: Check the split branch root looks right**

```bash
git show biz-split:playwright.config.js | head -3
```

Expected: the `biz/playwright.config.js` content (import statements for Playwright).

---

## Task 9: Create biz-boardroom local repo from the split

- [ ] **Step 1: Create the local biz-boardroom directory**

```bash
mkdir -p "/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom"
cd "/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom"
git init
```

Expected: `Initialized empty Git repository in .../biz-boardroom/.git/`

- [ ] **Step 2: Fetch the split branch from cicd1**

```bash
git fetch "/Users/steve/dev/--26 Projects/spikes/ci-cd/cicd1" biz-split
```

Expected: fetch completes, objects counted.

- [ ] **Step 3: Checkout as main**

```bash
git checkout -b main FETCH_HEAD
```

Expected: `Switched to a new branch 'main'`

- [ ] **Step 4: Verify the root contents**

```bash
ls
```

Expected: `board-minutes  boardroom  docs  playwright.config.js  rewardz-boardroom.html  serve.cjs  test`

---

## Task 10: Create biz-boardroom on GitHub and push

- [ ] **Step 1: Create the GitHub repo**

```bash
cd "/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom"
gh repo create timermachine/biz-boardroom \
  --public \
  --description "Boardroom simulation app — consumer of timermachine/DevOpsBot"
```

- [ ] **Step 2: Add remote and push**

```bash
git remote add origin https://github.com/timermachine/biz-boardroom.git
git push -u origin main
```

Expected: push succeeds, main branch created.

- [ ] **Step 3: Verify on GitHub**

```bash
gh repo view timermachine/biz-boardroom --web
```

Confirm commits visible and match biz/ history.

---

## Task 11: Add DevOpsBot as a subtree in biz-boardroom

- [ ] **Step 1: Add the DevOpsBot remote**

```bash
cd "/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom"
git remote add devopsbot https://github.com/timermachine/DevOpsBot.git
git fetch devopsbot
```

Expected: fetches DevOpsBot tags and branches.

- [ ] **Step 2: Add the subtree at v0.1.0**

```bash
git subtree add --prefix=devopsbot devopsbot v0.1.0 --squash
```

Expected: `Added dir 'devopsbot'`

- [ ] **Step 3: Verify devopsbot/ contents**

```bash
ls devopsbot/
```

Expected: `app  docker-compose.yml  docker-compose.dev.yml  docker-compose.prod.yml  docker-stack.yml  docker-stack.prod.yml  e2e  infra  nginx  package.json  package-lock.json  playwright.config.js  scripts  .github  AGENTS.md  CHANGELOG.md  README.md`

- [ ] **Step 4: Push the subtree commit**

```bash
git push origin main
```

---

## Task 12: Add README.md and AGENTS.md to biz-boardroom

**Files:** Create `README.md`, `AGENTS.md`

- [ ] **Step 1: Create README.md**

Create `/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom/README.md`:

```markdown
# biz-boardroom

AI-powered boardroom simulation app. A panel of C-suite AI directors reviews business documents and conducts board sessions.

This repo is a consumer of [timermachine/DevOpsBot](https://github.com/timermachine/DevOpsBot) — the infrastructure base lives under `devopsbot/` as a git subtree.

## Running

```bash
node serve.cjs
```

Then open `rewardz-boardroom.html` in a browser, or run the Playwright tests:

```bash
npx playwright test --config=playwright.config.js
```

## Updating DevOpsBot infra

```bash
# 1. Check CHANGELOG.md at the target version for breaking changes
# 2. Pull the update:
git subtree pull --prefix=devopsbot devopsbot v0.2.0 --squash
# 3. Resolve conflicts, test, commit
```

## Project structure

```
biz-boardroom/
  devopsbot/          # DevOpsBot infra (don't edit here — update via subtree pull)
  board-minutes/      # Exported board session minutes
  boardroom/          # App source: board logic, AI members, storage
  docs/               # Usage guides
  test/               # Playwright test specs
  serve.cjs           # Dev server
  playwright.config.js
  rewardz-boardroom.html
```
```

- [ ] **Step 2: Create AGENTS.md**

Create `/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom/AGENTS.md`:

```markdown
# AGENTS.md

Instructions for AI agents working in this repository.

## Project Overview

biz-boardroom is an AI-powered boardroom simulation. A panel of C-suite AI directors (CEO, CFO, CTO, etc.) reviews business documents and conducts structured board sessions. It is a consumer of [timermachine/DevOpsBot](https://github.com/timermachine/DevOpsBot) — infra lives under `devopsbot/`.

## Repository Layout

```
biz-boardroom/
├── devopsbot/                  # DevOpsBot infra subtree — do not edit directly
├── board-minutes/              # Exported board session minutes (markdown)
├── boardroom/
│   ├── app.js                  # Main boardroom orchestration
│   ├── analytics.js            # Session analytics
│   ├── member-factory.js       # AI board member creation
│   ├── storage.js              # Session persistence
│   ├── server-helpers.cjs      # Dev server helpers
│   ├── builtin-members.json    # Default board member definitions
│   ├── review-orchestration.json / .md  # Orchestration config
│   ├── example-biz-input-docs/ # Example business documents for review
│   └── project-input-data/     # Runtime input document storage
├── docs/
│   └── csuite_simulation_guide.md
├── test/
│   └── boardroom.spec.js       # Playwright tests
├── serve.cjs                   # Dev server (serves on PORT env var or 4173)
├── playwright.config.js        # Consumer test config (uses serve.cjs)
└── rewardz-boardroom.html      # Main browser UI
```

## Development Rules

- Do not edit files under `devopsbot/` directly. To update DevOpsBot, use `git subtree pull`.
- The `playwright.config.js` at the repo root is the consumer config — it points to `./test`. The one at `devopsbot/playwright.config.js` is the infra harness and is not used here.
```

- [ ] **Step 3: Commit and push**

```bash
cd "/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom"
git add README.md AGENTS.md
git commit -m "$(cat <<'EOF'
docs: add README and AGENTS.md

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
git push origin main
```

- [ ] **Step 4: Final verification**

```bash
gh repo view timermachine/DevOpsBot --json name,url,latestRelease
gh repo view timermachine/biz-boardroom --json name,url
```

Expected: both repos exist. DevOpsBot shows a `v0.1.0` latest release.

```bash
cd "/Users/steve/dev/--26 Projects/spikes/ci-cd/biz-boardroom"
git log --oneline | head -8
```

Expected: most recent commit is "docs: add README and AGENTS.md", then the devopsbot subtree merge, then the original biz/ commits.
