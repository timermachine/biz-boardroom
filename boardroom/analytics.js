function clamp(number, min, max) {
  return Math.max(min, Math.min(max, number));
}

export function computeBoardHealth(transcript) {
  const text = transcript.map((entry) => entry.text || '').join(' ').toLowerCase();
  const messageCount = Math.max(transcript.length, 1);
  const blockerHits = (text.match(/\b(blocked|blocker|stuck|impasse|can't|cannot|won't|waiting|dependency)\b/g) || []).length;
  const actionHits = (text.match(/\b(next step|owner|assign|decide|decision|action|ship|build|test|proceed)\b/g) || []).length;
  const dataHits = (text.match(/\b(data|metric|number|projection|model|evidence|\d+%|£|\$)\b/g) || []).length;
  const challengeHits = (text.match(/\b(risk|problem|issue|assumption|missing|unproven|wrong)\b/g) || []).length;
  const agreeHits = (text.match(/\b(agree|aligned|yes|proceed|support)\b/g) || []).length;

  return {
    deadlock: clamp(Math.round((blockerHits / messageCount) * 10) + 1, 1, 10),
    consensus: clamp(6 + agreeHits - challengeHits, 1, 10),
    evidence: clamp(Math.round((dataHits / messageCount) * 12) + 1, 1, 10),
    execution: clamp(Math.round((actionHits / messageCount) * 12) + 1, 1, 10),
  };
}

export function extractSessionMap(transcript) {
  const blockers = [];
  const decisions = [];
  const actions = [];

  for (const entry of transcript.slice(-30)) {
    const text = entry.text || '';
    if (/\b(blocked|blocker|stuck|waiting|dependency|can't|cannot|before proceeding)\b/i.test(text)) {
      blockers.push(text);
    }
    if (/\b(decide|decision|we will|proceed with|ship|go with)\b/i.test(text)) {
      decisions.push(text);
    }
    if (/\b(next step|owner|assign|action|follow up|need to)\b/i.test(text)) {
      actions.push(text);
    }
  }

  return {
    blockers: blockers.slice(-4),
    decisions: decisions.slice(-4),
    actions: actions.slice(-4),
  };
}
