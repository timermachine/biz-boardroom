export const DEFAULT_MOOD_EXCEPTIONS = new Set(['henry', 'edward', 'chris']);

export function getDefaultMood(memberId) {
  return DEFAULT_MOOD_EXCEPTIONS.has(memberId) ? 1 : 5;
}

export function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function getInitials(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || parts[0]?.[1] || '')).toUpperCase();
}

export function normalizeMember(member) {
  const id = member.id || slugify(member.name);
  return {
    id,
    name: member.name,
    title: member.title,
    initials: member.initials || getInitials(member.name),
    color: member.color || '#e8c547',
    bg: member.bg || 'rgba(232,197,71,0.15)',
    protected: Boolean(member.protected),
    badge: member.badge || '',
    className: member.className || '',
    mood: Number(member.mood || member.mood_default || getDefaultMood(id)),
    mood_default: Number(member.mood_default || getDefaultMood(id)),
    functional_archetype: member.functional_archetype || 'Domain specialist',
    relational_stance: member.relational_stance || 'Advises the room from a specialist viewpoint.',
    power_posture: member.power_posture || 'Specialist contributor',
    primary_driver: member.primary_driver || member.specialisms || 'Domain progress',
    primary_threat: member.primary_threat || 'Being ignored until risk compounds.',
    boundary_behaviour: member.boundary_behaviour || 'Holds domain limits and flags missing information.',
    influence_style: member.influence_style || 'Uses domain logic to move the room.',
    failure_mode: member.failure_mode || 'Becomes narrow and overprotective under stress.',
    decision_filter: member.decision_filter || 'What matters most in my domain right now?',
    opening_move: member.opening_move || 'Frames the domain question that should be answered first.',
    non_negotiable: member.non_negotiable || 'The core domain constraint cannot be ignored.',
    threat_tells: member.threat_tells || 'Becomes rigid and repetitive.',
    growth_tells: member.growth_tells || 'Offers practical pathways and trade-offs.',
    specialisms: member.specialisms || member.expertise || '',
    personality: member.personality || 'Direct and domain-bound.',
    keywords: Array.isArray(member.keywords) ? member.keywords : [],
  };
}

export function createCustomMember(input, style, id) {
  const name = input.name.trim();
  const title = input.title.trim();
  const specialisms = input.specialisms.trim();
  const personality = input.personality.trim();

  return normalizeMember({
    id,
    name,
    title,
    initials: getInitials(name),
    color: style.color,
    bg: style.bg,
    protected: false,
    mood_default: 5,
    functional_archetype: 'Custom specialist',
    relational_stance: 'Advises the room with a focused specialist lens.',
    power_posture: 'Specialist contributor',
    primary_driver: specialisms,
    primary_threat: 'Domain risk being ignored or sequenced badly.',
    boundary_behaviour: 'Flags missing expertise, sequencing errors and hidden assumptions.',
    influence_style: 'Pushes the room through specialist diagnosis and practical next steps.',
    failure_mode: 'Over-focuses on one domain at the expense of wider trade-offs.',
    decision_filter: `What must be true in ${specialisms || 'this domain'} for the plan to hold?`,
    opening_move: 'Defines the domain constraint and asks what evidence supports it.',
    non_negotiable: 'Domain-specific risks must be acknowledged explicitly.',
    threat_tells: 'Repeats the same warning with increasing force.',
    growth_tells: 'Turns expertise into actionable trade-offs and sequencing.',
    specialisms,
    personality,
    keywords: `${title} ${specialisms} ${personality}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).slice(0, 18),
  });
}
