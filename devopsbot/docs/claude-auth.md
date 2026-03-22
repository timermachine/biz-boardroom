# Claude Code auth persistence in dev containers

Short answer: **yes, mostly**.

You can get the same practical outcome as the Codex approach (authenticate once, reuse after dev container restart, reuse in other dev containers) by persisting Claude Code auth/state files with mounts.

## What is possible

### OAuth / Claude.ai login reuse (closest match to Codex)

Mount Claude state from host into the container:

```json
"mounts": [
  "source=${localEnv:HOME}/.claude,target=/home/node/.claude,type=bind",
  "source=${localEnv:HOME}/.claude.json,target=/home/node/.claude.json,type=bind"
]
```

Why these paths:
- Anthropic docs describe `~/.claude.json` as global state and include OAuth account info there.
- Anthropic docs describe `~/.claude/` as Claude Code settings/metadata location.

Result:
- Login once in a dev container.
- Reuse the same login across restarts/rebuilds.
- Reuse in other dev containers that mount the same host paths.

### API key-based auth (no interactive login)

You can also use `ANTHROPIC_API_KEY` (or `apiKeyHelper`) so containers start without `/login`.

This can be good for automation, but it is not identical to Claude.ai OAuth/subscription login behavior.

## What is not guaranteed / caveats

- Anthropic explicitly documents secure credential storage in macOS Keychain on macOS. In that host-native case, credentials are OS-keychain managed and not simply file-mounted.
- For Linux dev containers, persisting `~/.claude.json` and `~/.claude/` is the practical way to retain state, but keychain semantics are different from macOS native.
- Sharing one host auth cache across many repos is convenient but broadens blast radius if that machine account is compromised.

## Security notes

- Treat `~/.claude.json` and `~/.claude/` as sensitive.
- Do not commit either path.
- Prefer per-user host mounts, not shared team mounts.

## References

- Anthropic Claude Code quickstart (credentials are stored so you typically do not log in every time): https://docs.anthropic.com/en/docs/claude-code/quickstart
- Anthropic Claude Code settings (global state at `~/.claude.json`, user settings at `~/.claude/`): https://docs.anthropic.com/en/docs/claude-code/settings
- Anthropic Claude Code IAM/team (credential management, supported auth methods, keychain note): https://docs.anthropic.com/en/docs/claude-code/team
- Anthropic Claude Code troubleshooting (`~/.claude.json` includes account/auth state): https://docs.anthropic.com/en/docs/claude-code/troubleshooting
