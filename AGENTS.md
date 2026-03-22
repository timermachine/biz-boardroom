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