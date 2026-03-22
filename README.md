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