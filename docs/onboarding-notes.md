# Onboarding notes — new developer experience

Recorded 2026-03-17. Honest account of first contact with this codebase.

## What worked well

- README quickstart is three commands — clear and runnable immediately
- Decision tree (devcontainer vs Swarm vs prod) removes ambiguity
- App code is minimal and easy to understand in one read
- Docker Compose override pattern (base + dev + prod) is clean
- CI/CD workflows are well-commented and do what they say

## Gaps found and fixed

| Gap | Status |
|-----|--------|
| AGENTS.md claimed `/` route lived in `app.js` — it's actually in `index.js` | Fixed |
| AGENTS.md endpoint table missing `/hello-new-world` | Fixed |
| devcontainer.json had no Codespaces port labels or Docker availability warning | Fixed |
| README had no Codespaces section | Fixed |

## Codespaces — first real test run (2026-03-17)

### What failed on first attempt

**Error:** `unable to find user vscode: no matching entries in passwd file`

**Root cause:** `devcontainer.json` had `"remoteUser": "vscode"` but the base image
`mcr.microsoft.com/vscode/devcontainers/javascript-node:24-bullseye` is the old
deprecated image whose non-root user is `node`, not `vscode`. Codespaces tried to
start the container as `vscode`, couldn't find it, and fell into recovery mode.

**Fix:** Updated Dockerfile base image to `mcr.microsoft.com/devcontainers/javascript-node:24-bullseye`
(the current non-deprecated image) which has the `vscode` user. Also removed unused `ARG USERNAME`.

### What still needs validating after the fix

- [ ] Rebuild Codespace and confirm it starts without recovery mode
- [ ] Wait for postCreateCommand — record how long it takes
- [ ] Run `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
- [ ] Hit the forwarded port 3000 URL
- [ ] Run `npx playwright test`
- [ ] Update this file with actual results

## Things that would trip up a new developer

1. **`postCreateCommand` takes 3–5 minutes in Codespaces.** Don't close the terminal.
   The command installs npm deps at root, inside `app/`, and Playwright browsers.
   Wait for it before running anything.

2. **The root `/` route is in `index.js`, not `app.js`.** Core API routes live in
   `app.js`; the entry-point route and server startup live in `index.js`. This
   is deliberate (testability — `app.js` is importable without starting a server)
   but not obvious.

3. **E2E tests need the stack running first.** `npx playwright test` assumes
   `http://localhost:3000` is up. Run `docker compose ... up` first.
   The `--profile e2e` Docker service is an alternative but isn't the default path.

4. **Visual snapshot baselines are platform-suffixed** (`-darwin.png`).
   If you regenerate them on Linux (e.g. in CI or Codespaces) you'll get
   a `-linux.png` file. Both can coexist but the file names will differ.

## Adding a new route — worked example

This session added `GET /hello-new-world → { message: "Hello new world" }`.

Files changed:
- `app/src/app.js` — add the route handler
- `app/test/app.test.js` — add a unit test
- `e2e/app.spec.js` — add an API e2e test
- `AGENTS.md` — update endpoint table

Pattern to follow for any new route:
1. Add handler to `app/src/app.js` (or `index.js` if entry-point-only)
2. Add unit test to `app/test/app.test.js`
3. Add e2e test to `e2e/app.spec.js`
4. Update AGENTS.md endpoint table
