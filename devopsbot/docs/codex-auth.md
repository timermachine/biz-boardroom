# Codex auth persistence in dev containers

Codex stores login credentials in `~/.codex/auth.json`.

If your dev container home directory is ephemeral, you will be asked to authenticate again after container rebuild/restart.

## Current repo setup

This repository's dev container mounts your host `~/.codex` directory into the container:

```json
"mounts": [
  "source=${localEnv:HOME}/.codex,target=/home/node/.codex,type=bind"
]
```

Result:
- Authenticate once with `codex` in one dev container.
- Reuse the same auth in this repo after restart/rebuild.
- Reuse the same auth in other dev containers that use the same bind mount.

## How to use in other repositories

Add the same `mounts` entry to each repo's `.devcontainer/devcontainer.json`, then rebuild the container.

## Alternative: shared named Docker volume

If you do not want a host bind mount, use a shared named volume instead:

```json
"mounts": [
  "source=codex-auth,target=/home/node/.codex,type=volume"
]
```

Any dev container that references the same volume name (`codex-auth`) can reuse the auth cache.

## Security note

Treat `~/.codex/auth.json` as sensitive. Do not commit it to git and avoid sharing it across users.

## Reference

OpenAI Codex authentication docs: https://developers.openai.com/codex/auth
