#!/usr/bin/env bash
# Reads a Claude Code UserPromptSubmit hook payload from stdin and appends to ai-log.jsonl
set -euo pipefail

LOG="$(git rev-parse --show-toplevel)/docs/ai-log.jsonl"

# Parse the JSON payload from stdin
PAYLOAD=$(cat)
PROMPT=$(echo "$PAYLOAD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('prompt',''))" 2>/dev/null || echo "")
MODEL=$(echo "$PAYLOAD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('model','unknown'))" 2>/dev/null || echo "unknown")
SESSION=$(echo "$PAYLOAD" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('session_id',''))" 2>/dev/null || echo "")

# Skip empty prompts
[ -z "$PROMPT" ] && exit 0

ENTRY=$(python3 -c "
import json, sys
from datetime import datetime, timezone
print(json.dumps({
    'ts': datetime.now(timezone.utc).isoformat(),
    'agent': 'claude-code',
    'model': sys.argv[1],
    'session': sys.argv[2],
    'prompt': sys.argv[3],
}, ensure_ascii=False))
" "$MODEL" "$SESSION" "$PROMPT")

echo "$ENTRY" >> "$LOG"
