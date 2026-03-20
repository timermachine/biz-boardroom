import { computeBoardHealth, extractSessionMap } from './analytics.js';
import { createCustomMember, getDefaultMood, normalizeMember, slugify } from './member-factory.js';
import { loadCustomMembers, loadMemberOverrides, saveCustomMembers, saveMemberOverrides } from './storage.js';

const MEMBER_STYLES = [
  { color: '#e8c547', bg: 'rgba(232,197,71,0.15)' },
  { color: '#4fc3a1', bg: 'rgba(79,195,161,0.15)' },
  { color: '#e88a47', bg: 'rgba(232,138,71,0.15)' },
  { color: '#47a8e8', bg: 'rgba(71,168,232,0.15)' },
  { color: '#e847a8', bg: 'rgba(232,71,168,0.15)' },
  { color: '#a8e847', bg: 'rgba(168,232,71,0.15)' },
  { color: '#c4a0f0', bg: 'rgba(196,160,240,0.15)' },
  { color: '#ffb347', bg: 'rgba(255,179,71,0.15)' },
  { color: '#7dd3a7', bg: 'rgba(125,211,167,0.15)' },
  { color: '#6ec1ff', bg: 'rgba(110,193,255,0.15)' },
  { color: '#ff8fb1', bg: 'rgba(255,143,177,0.15)' }
];

const INTRO_TEXT = `Board is convened. We have six months to prove first-mover position in QR-based shared loyalty across East Sussex.
Henry has capital on the table. We are not here for validation - we are here to identify what breaks this model before the market does.
Floor is open. Evidence on the table, assumptions challenged. Let's start.`;

const BOARD_HEALTH_DESCRIPTIONS = {
  deadlock: 'How stuck the room is. Higher means more conflict, unresolved objections, or repeated circular challenge with no decision path.',
  consensus: 'How aligned the board is around the current direction. Higher means clearer shared position and less fragmentation.',
  evidence: 'How grounded the discussion is in numbers, proof, concrete examples, or explicit assumptions rather than opinion alone.',
  execution: 'How much the session is moving toward decisions, owners, and next actions instead of staying at abstract strategy level.',
};

const state = {
  members: {},
  memberOrder: [],
  protectedIds: new Set(),
  expandedMembers: new Set(),
  breakoutRooms: [],
  hoverCardMemberId: null,
  hoverCardTimer: null,
  boardHealthTooltipKey: null,
  boardHealthTooltipPart: null,
  boardHealthTooltipTimer: null,
  currentFocus: 'edward',
  currentAgenda: '',
  transcript: [],
  saveTimer: null,
  minutesSessionId: (window.crypto?.randomUUID?.() || `session-${Date.now()}`),
  minutesFilePath: '',
  memberOverrides: {},
};

function qs(id) {
  return document.getElementById(id);
}

function escapeHtml(text) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getTime() {
  return new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function updateClock() {
  qs('clock').textContent = getTime();
}

function getStyleForMember(index) {
  return MEMBER_STYLES[index % MEMBER_STYLES.length];
}

function applyOverrides(member) {
  const override = state.memberOverrides[member.id] || {};
  return { ...member, ...override, mood: Number(override.mood || member.mood || getDefaultMood(member.id)) };
}

function persistCustomState() {
  const customMembers = state.memberOrder
    .filter((id) => !state.protectedIds.has(id))
    .map((id) => state.members[id]);
  saveCustomMembers(customMembers);
  saveMemberOverrides(state.memberOverrides);
}

function setSaveStatus(text) {
  qs('saveStatus').textContent = text;
}

function recordTranscript(entry) {
  state.transcript.push({ time: getTime(), ...entry });
  renderTranscript();
  renderBoardHealth();
  renderSessionMap();
  renderInspector();
}

function initialTranscript() {
  state.transcript = [{
    kind: 'member',
    memberId: 'edward',
    speaker: 'Edward',
    title: 'CEO',
    text: INTRO_TEXT,
    tags: ['OPEN']
  }];
}

function renderMembers() {
  qs('memberList').innerHTML = state.memberOrder.map((id) => {
    const member = state.members[id];
    const badge = member.badge ? `<div class="investor-badge">${escapeHtml(member.badge)}</div>` : '';
    const active = state.currentFocus === id ? 'active' : '';
    const expanded = state.expandedMembers.has(id) ? 'expanded' : '';
    const hovercard = state.hoverCardMemberId === id ? 'show-hovercard' : '';
    const summary = `<div class="member-summary"><span class="member-name">${escapeHtml(member.name)}</span> - <span class="role">${escapeHtml(member.title)}</span></div>`;
    const note = member.specialisms ? `<div class="member-note">${escapeHtml(member.specialisms)}</div>` : '<div class="member-note">No remit summary recorded.</div>';
    const detailRows = [
      ['Operating Style', member.personality],
      ['Functional Archetype', member.functional_archetype],
      ['Primary Driver', member.primary_driver],
      ['Primary Threat', member.primary_threat],
      ['Decision Filter', member.decision_filter],
      ['Influence Style', member.influence_style],
    ].filter(([, value]) => value);
    const detailHtml = detailRows.map(([label, value]) => `
      <div class="member-detail-item">
        <span class="member-detail-label">${escapeHtml(label)}</span>
        <div class="member-detail-copy">${escapeHtml(value)}</div>
      </div>`).join('');
    return `
      <div class="member ${escapeHtml(member.className || '')} ${active} ${expanded} ${hovercard}" data-member="${id}">
        <button class="member-toggle" type="button" data-member-toggle="${id}" aria-expanded="${state.expandedMembers.has(id) ? 'true' : 'false'}">
          <div class="member-toggle-head">
            <div class="member-toggle-main">
              ${summary}
              ${badge}
            </div>
            <span class="member-chevron" aria-hidden="true">›</span>
          </div>
        </button>
        <div class="member-details">
          ${note}
        </div>
        <div class="member-hovercard">
          <div class="member-detail-grid">${detailHtml}</div>
        </div>
      </div>`;
  }).join('');
}

function renderTargetOptions() {
  const previous = qs('targetSelect').value || 'board';
  qs('targetSelect').innerHTML = ['<option value="board">Full Board</option>']
    .concat(state.memberOrder.map((id) => {
      const member = state.members[id];
      return `<option value="${id}">${escapeHtml(member.name)} (${escapeHtml(member.title)})</option>`;
    })).join('');
  qs('targetSelect').value = state.memberOrder.includes(previous) || previous === 'board' ? previous : 'board';
}

function renderBreakoutMemberChoices() {
  qs('breakoutMemberChoices').innerHTML = state.memberOrder.map((id) => {
    const member = state.members[id];
    return `<label class="breakout-member"><input type="checkbox" value="${id}"> <span>${escapeHtml(member.name)} - ${escapeHtml(member.title)}</span></label>`;
  }).join('');
}

function renderBreakoutRooms() {
  if (!state.breakoutRooms.length) {
    qs('breakoutRooms').innerHTML = '<div class="detail-copy">No active breakout rooms.</div>';
    return;
  }
  qs('breakoutRooms').innerHTML = `<div class="breakout-list">${state.breakoutRooms.map((room) => `
    <div class="breakout-room">
      <div class="breakout-room-head">
        <div class="breakout-room-title">${escapeHtml(room.issue)}</div>
        <div class="breakout-room-status">OPEN</div>
      </div>
      <div class="breakout-room-copy">${escapeHtml(room.members.map((memberId) => state.members[memberId]?.name || memberId).join(', '))}</div>
      <div class="breakout-room-copy">${escapeHtml(room.note)}</div>
      <button class="mini-btn breakout-close" type="button" data-close-breakout="${room.id}">Close</button>
    </div>`).join('')}</div>`;
}

function renderTranscript() {
  qs('messages').innerHTML = state.transcript.map((entry) => {
    if (entry.kind === 'user') {
      return `
        <div class="message">
          <div class="avatar" style="background:rgba(255,255,255,0.06);color:#888">YOU</div>
          <div class="msg-content">
            <div class="msg-header">
              <span class="msg-name" style="color:#999">You</span>
              <span class="msg-title">FLOOR</span>
              <span class="msg-time">${entry.time}</span>
            </div>
            <div class="msg-text" style="color:#aaa">${escapeHtml(entry.text)}</div>
          </div>
        </div>`;
    }

    const member = state.members[entry.memberId];
    const tagHtml = (entry.tags || []).map((tag) => `<span class="tag tag-question">${escapeHtml(tag)}</span>`).join('');
    const initials = member?.initials || 'SYS';
    const bg = member?.bg || 'rgba(255,255,255,0.08)';
    const color = member?.color || '#aaa';
    return `
      <div class="message">
        <div class="avatar" style="background:${bg};color:${color}">${escapeHtml(initials)}</div>
        <div class="msg-content">
          <div class="msg-header">
            <span class="msg-name" style="color:${color}">${escapeHtml(entry.speaker)}</span>
            <span class="msg-title">${escapeHtml(entry.title)}</span>
            <span class="msg-time">${entry.time}</span>
          </div>
          <div class="msg-text">${tagHtml}${formatReply(entry.text)}</div>
        </div>
      </div>`;
  }).join('');
  qs('messages').scrollTop = qs('messages').scrollHeight;
}

function formatReply(text) {
  return escapeHtml(text)
    .replace(/£[\d,.]+[kKmMbB]?/g, '<strong>$&</strong>')
    .replace(/\$[\d,.]+[kKmMbB]?/g, '<strong>$&</strong>')
    .replace(/\b\d+%/g, '<strong>$&</strong>')
    .replace(/\b\d{1,3}(,\d{3})+(\.\d+)?\b/g, '<strong>$&</strong>');
}

function getMemberContext(memberId) {
  return state.transcript
    .filter((entry) => entry.memberId === memberId)
    .slice(-3);
}

function describeMood(level) {
  if (level <= 2) return 'Strict, evidence-first, low agreeableness, minimal flexibility.';
  if (level <= 4) return 'Firm and challenging, but willing to explore alternatives briefly.';
  if (level <= 6) return 'Balanced between rigor and flexibility, somewhat more agreeable.';
  if (level <= 8) return 'Noticeably more agreeable and adaptive, still anchored in role expertise.';
  return 'Highly agreeable and flexible, prioritises progress and collaborative exploration.';
}

function describeBoardHealthScore(metric, score) {
  if (metric === 'deadlock') {
    if (score <= 2) return 'This score indicates low friction and little sign of the room getting stuck.';
    if (score <= 5) return 'This score indicates manageable disagreement, but some drag is emerging.';
    if (score <= 7) return 'This score indicates meaningful blockage that is slowing the board down.';
    return 'This score indicates the board is heavily jammed and needs explicit resolution.';
  }

  if (score <= 2) return 'This score indicates the trait is mostly absent in the current discussion.';
  if (score <= 5) return 'This score indicates the trait is present, but uneven or weak.';
  if (score <= 7) return 'This score indicates the trait is showing up consistently.';
  return 'This score indicates the trait is strongly shaping the session.';
}

function summarizeMetricIssue(metric) {
  const issuePatterns = {
    deadlock: /\b(blocked|blocker|stuck|impasse|can't|cannot|won't|waiting|dependency|risk|problem|issue)\b/i,
    consensus: /\b(agree|aligned|support|disagree|challenge|assumption|wrong|concern)\b/i,
    evidence: /\b(data|metric|number|projection|model|evidence|proof|assumption|unproven|figure|£|\$|\d+%)\b/i,
    execution: /\b(next step|owner|assign|decide|decision|action|ship|build|test|proceed|follow up|need to)\b/i,
  };
  const relevant = state.transcript
    .filter((entry) => entry.kind === 'member' && issuePatterns[metric].test(entry.text || ''))
    .slice(-3);

  if (!relevant.length) {
    return 'No clear supporting exchanges have been logged yet.';
  }

  return relevant
    .map((entry) => entry.text)
    .join(' ')
    .slice(0, 280);
}

function summarizeMetricAttendees(metric) {
  const issuePatterns = {
    deadlock: /\b(blocked|blocker|stuck|impasse|can't|cannot|won't|waiting|dependency|risk|problem|issue)\b/i,
    consensus: /\b(agree|aligned|support|disagree|challenge|assumption|wrong|concern)\b/i,
    evidence: /\b(data|metric|number|projection|model|evidence|proof|assumption|unproven|figure|£|\$|\d+%)\b/i,
    execution: /\b(next step|owner|assign|decide|decision|action|ship|build|test|proceed|follow up|need to)\b/i,
  };
  const participants = [...new Set(state.transcript
    .filter((entry) => entry.memberId && issuePatterns[metric].test(entry.text || ''))
    .map((entry) => entry.memberId))]
    .slice(0, 3);

  if (!participants.length) {
    return 'No board members are strongly implicated by the current transcript.';
  }

  return participants.map((memberId) => {
    const member = state.members[memberId];
    return `${member.name} (${member.title}, mood ${member.mood}/10)`;
  }).join(', ');
}

function buildBoardHealthTooltip(metric, score, part) {
  if (part === 'label') {
    return `${BOARD_HEALTH_DESCRIPTIONS[metric]} ${describeBoardHealthScore(metric, score)}`;
  }

  return `Current score: ${score}/10. Likely driver: ${summarizeMetricIssue(metric)} Attendees most involved: ${summarizeMetricAttendees(metric)}.`;
}

function renderInspector() {
  const member = state.members[state.currentFocus];
  if (!member) {
    qs('memberInspector').innerHTML = '<div class="detail-copy">Select a board member.</div>';
    return;
  }
  const context = getMemberContext(member.id);
  const deletable = !state.protectedIds.has(member.id);
  qs('memberInspector').innerHTML = `
    <div class="detail-name" style="color:${member.color}">${escapeHtml(member.name)}</div>
    <div class="detail-role">${escapeHtml(member.title)}</div>
    <div class="detail-block">
      <span class="detail-label">Moodometer</span>
      <div class="mood-row">
        <input id="moodSlider" class="mood-slider" type="range" min="1" max="10" value="${member.mood}">
        <span class="mood-value">${member.mood}</span>
      </div>
      <div class="detail-copy">${escapeHtml(describeMood(member.mood))}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Functional Archetype</span>
      <div class="detail-copy">${escapeHtml(member.functional_archetype)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Relational Stance</span>
      <div class="detail-copy">${escapeHtml(member.relational_stance)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Power Posture</span>
      <div class="detail-copy">${escapeHtml(member.power_posture)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Primary Driver</span>
      <div class="detail-copy">${escapeHtml(member.primary_driver)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Primary Threat</span>
      <div class="detail-copy">${escapeHtml(member.primary_threat)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Boundary Behaviour</span>
      <div class="detail-copy">${escapeHtml(member.boundary_behaviour)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Influence Style</span>
      <div class="detail-copy">${escapeHtml(member.influence_style)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Failure Mode</span>
      <div class="detail-copy">${escapeHtml(member.failure_mode)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Decision Filter</span>
      <div class="detail-copy">${escapeHtml(member.decision_filter)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Conflict Opening Move</span>
      <div class="detail-copy">${escapeHtml(member.opening_move)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Non-Negotiable</span>
      <div class="detail-copy">${escapeHtml(member.non_negotiable)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Threat Tell</span>
      <div class="detail-copy">${escapeHtml(member.threat_tells)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Growth Tell</span>
      <div class="detail-copy">${escapeHtml(member.growth_tells)}</div>
    </div>
    <div class="detail-block">
      <span class="detail-label">Accrued Context</span>
      <div class="context-list">
        ${context.length ? context.map((entry) => `<div class="context-item"><div class="context-head">${escapeHtml(entry.time)} · ${escapeHtml(entry.title)}</div><div class="detail-copy">${escapeHtml(entry.text)}</div></div>`).join('') : '<div class="detail-copy">No accrued context yet.</div>'}
      </div>
    </div>
    ${deletable ? '<button id="deleteMemberBtn" class="danger-btn" type="button">Delete Member</button>' : ''}`;

  qs('moodSlider').addEventListener('input', (event) => {
    const mood = Number(event.target.value);
    state.members[member.id].mood = mood;
    state.memberOverrides[member.id] = { ...(state.memberOverrides[member.id] || {}), mood };
    persistCustomState();
    renderInspector();
    queueMinutesSave();
  });

  if (deletable) {
    qs('deleteMemberBtn').addEventListener('click', () => deleteCurrentMember());
  }
}

function renderBoardHealth() {
  const health = computeBoardHealth(state.transcript);
  const metrics = [
    { key: 'deadlock', label: 'Deadlock', value: health.deadlock, valueClass: 'metric-val bad' },
    { key: 'consensus', label: 'Consensus', value: health.consensus, valueClass: 'metric-val' },
    { key: 'evidence', label: 'Evidence', value: health.evidence, valueClass: 'metric-val' },
    { key: 'execution', label: 'Execution', value: health.execution, valueClass: 'metric-val' },
  ];
  qs('boardHealth').innerHTML = `
    ${metrics.map((metric) => `
      <div class="metric" data-health-metric="${metric.key}">
        <span class="metric-trigger ${state.boardHealthTooltipKey === metric.key && state.boardHealthTooltipPart === 'label' ? 'show-tooltip' : ''}" tabindex="0" data-health-trigger="${metric.key}" data-health-part="label">
          <span class="metric-label">${metric.label}</span>
          <div class="metric-tooltip">${escapeHtml(buildBoardHealthTooltip(metric.key, metric.value, 'label'))}</div>
        </span>
        <span class="metric-trigger ${state.boardHealthTooltipKey === metric.key && state.boardHealthTooltipPart === 'value' ? 'show-tooltip' : ''}" tabindex="0" data-health-trigger="${metric.key}" data-health-part="value">
          <span class="${metric.valueClass}">${metric.value}/10</span>
          <div class="metric-tooltip">${escapeHtml(buildBoardHealthTooltip(metric.key, metric.value, 'value'))}</div>
        </span>
      </div>`).join('')}`;
}

function renderSessionMap() {
  const map = extractSessionMap(state.transcript);
  qs('sessionMap').innerHTML = `
    <div class="detail-block"><span class="detail-label">Blockers</span><div class="detail-copy">${map.blockers.length ? map.blockers.map(escapeHtml).join('\n\n') : 'No clear blockers logged.'}</div></div>
    <div class="detail-block"><span class="detail-label">Decisions</span><div class="detail-copy">${map.decisions.length ? map.decisions.map(escapeHtml).join('\n\n') : 'No decisions captured yet.'}</div></div>
    <div class="detail-block"><span class="detail-label">Actions</span><div class="detail-copy">${map.actions.length ? map.actions.map(escapeHtml).join('\n\n') : 'No actions captured yet.'}</div></div>`;
}

function setFocus(memberId) {
  state.currentFocus = memberId;
  renderMembers();
  renderTargetOptions();
  renderInspector();
}

function toggleMember(memberId) {
  if (state.expandedMembers.has(memberId)) {
    state.expandedMembers.delete(memberId);
  } else {
    state.expandedMembers.add(memberId);
  }
  renderMembers();
}

function showHoverCard(memberId) {
  clearTimeout(state.hoverCardTimer);
  if (state.hoverCardMemberId === memberId) return;
  state.hoverCardMemberId = memberId;
  renderMembers();
}

function queueHoverCard(memberId) {
  clearTimeout(state.hoverCardTimer);
  state.hoverCardTimer = setTimeout(() => showHoverCard(memberId), 1400);
}

function hideHoverCard(memberId) {
  clearTimeout(state.hoverCardTimer);
  if (memberId && state.hoverCardMemberId !== memberId) return;
  if (state.hoverCardMemberId === null) return;
  state.hoverCardMemberId = null;
  renderMembers();
}

function showBoardHealthTooltip(metricKey, part) {
  clearTimeout(state.boardHealthTooltipTimer);
  if (state.boardHealthTooltipKey === metricKey && state.boardHealthTooltipPart === part) return;
  state.boardHealthTooltipKey = metricKey;
  state.boardHealthTooltipPart = part;
  renderBoardHealth();
}

function queueBoardHealthTooltip(metricKey, part) {
  clearTimeout(state.boardHealthTooltipTimer);
  state.boardHealthTooltipTimer = setTimeout(() => showBoardHealthTooltip(metricKey, part), 1400);
}

function hideBoardHealthTooltip(metricKey, part) {
  clearTimeout(state.boardHealthTooltipTimer);
  if (metricKey && (state.boardHealthTooltipKey !== metricKey || state.boardHealthTooltipPart !== part)) return;
  if (state.boardHealthTooltipKey === null) return;
  state.boardHealthTooltipKey = null;
  state.boardHealthTooltipPart = null;
  renderBoardHealth();
}

function inferTags(text) {
  const tags = [];
  if (/\?/.test(text)) tags.push('QUESTION');
  if (/risk|gap|missing|no evidence|unproven|assumption|concern|problem|issue|wrong|incorrect|doesn't|won't|can't/i.test(text)) tags.push('CHALLENGE');
  if (/£|\$|\d+%|data|metric|number|figure|model|projection/i.test(text)) tags.push('DATA');
  return tags.slice(0, 2);
}

function memberKeywords(member) {
  return `${member.name} ${member.title} ${member.specialisms} ${member.personality} ${member.primary_driver} ${member.primary_threat} ${(member.keywords || []).join(' ')}`.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function computeRelevance(member, text) {
  const keywordSet = new Set(memberKeywords(member));
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean).reduce((score, word) => score + (keywordSet.has(word) ? 2 : 0), 1);
}

function pickBoardRespondents(text) {
  return [...state.memberOrder]
    .sort((a, b) => computeRelevance(state.members[b], text) - computeRelevance(state.members[a], text))
    .slice(0, 3);
}

async function sendMessage() {
  const input = qs('userInput');
  const text = input.value.trim();
  if (!text) return;
  qs('sendBtn').disabled = true;
  input.value = '';
  input.style.height = '44px';
  recordTranscript({ kind: 'user', speaker: 'You', title: 'Floor', text, tags: [] });

  const target = qs('targetSelect').value;
  const respondents = target === 'board' ? pickBoardRespondents(text) : [target];

  for (const memberId of respondents) {
    const member = state.members[memberId];
    qs('typingName').textContent = `${member.name} is responding...`;
    qs('typingIndicator').classList.add('visible');

    try {
      const response = await fetch('/api/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          member,
          activeMembers: state.memberOrder.map((id) => state.members[id]),
          breakoutRooms: state.breakoutRooms.map((room) => ({
            issue: room.issue,
            members: room.members.map((memberId) => state.members[memberId]).filter(Boolean),
            note: room.note,
          })),
          userText: text,
          currentAgenda: state.currentAgenda,
          transcript: state.transcript.slice(-18),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
      recordTranscript({
        kind: 'member',
        memberId,
        speaker: member.name,
        title: member.title,
        text: data.content || '[No response]',
        tags: inferTags(data.content || '')
      });
    } catch (error) {
      recordTranscript({
        kind: 'member',
        memberId,
        speaker: member.name,
        title: member.title,
        text: `[Connection error - ${error.message}]`,
        tags: ['ERROR']
      });
    } finally {
      qs('typingIndicator').classList.remove('visible');
    }
  }

  qs('sendBtn').disabled = false;
  input.focus();
  queueMinutesSave();
}

function deriveSummary() {
  if (state.currentAgenda) return state.currentAgenda;
  const firstUser = state.transcript.find((entry) => entry.kind === 'user');
  return firstUser?.text || 'board-session';
}

async function saveMinutes() {
  const saveBtn = qs('saveBtn');
  saveBtn.disabled = true;
  setSaveStatus('Saving minutes...');
  try {
    const response = await fetch('/api/minutes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.minutesSessionId,
        summary: deriveSummary(),
        session: {
          agenda: state.currentAgenda,
          members: state.memberOrder.map((id) => state.members[id]),
          breakoutRooms: state.breakoutRooms.map((room) => ({
            ...room,
            memberNames: room.members.map((memberId) => state.members[memberId]?.name || memberId),
          })),
          transcript: state.transcript,
          boardHealth: computeBoardHealth(state.transcript),
          sessionMap: extractSessionMap(state.transcript),
        },
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    state.minutesFilePath = data.filePath || state.minutesFilePath;
    setSaveStatus(state.minutesFilePath ? `Saved to ${state.minutesFilePath}` : 'Minutes saved.');
  } catch (error) {
    setSaveStatus(`Save failed: ${error.message}`);
  } finally {
    saveBtn.disabled = false;
  }
}

function queueMinutesSave() {
  clearTimeout(state.saveTimer);
  setSaveStatus('Minutes pending save...');
  state.saveTimer = setTimeout(() => saveMinutes(), 900);
}

function deleteCurrentMember() {
  const member = state.members[state.currentFocus];
  if (!member || state.protectedIds.has(member.id)) return;
  delete state.members[member.id];
  delete state.memberOverrides[member.id];
  state.memberOrder = state.memberOrder.filter((id) => id !== member.id);
  state.currentFocus = state.memberOrder[0];
  persistCustomState();
  recordTranscript({
    kind: 'member',
    memberId: 'chris',
    speaker: 'Clerk',
    title: 'Session Admin',
    text: `Removed board member ${member.name} (${member.title}) from the session.`,
    tags: ['ADMIN']
  });
  renderMembers();
  renderTargetOptions();
  renderInspector();
  queueMinutesSave();
}

function addMember() {
  const formValues = {
    name: qs('newMemberName').value,
    title: qs('newMemberTitle').value,
    specialisms: qs('newMemberExpertise').value,
    personality: qs('newMemberPersonality').value,
  };
  if (!formValues.name.trim() || !formValues.title.trim() || !formValues.specialisms.trim() || !formValues.personality.trim()) {
    setSaveStatus('Add member requires name, title, expertise, and personality.');
    return;
  }
  let id = slugify(formValues.name) || `member-${state.memberOrder.length + 1}`;
  while (state.members[id]) id = `${id}-${state.memberOrder.length + 1}`;
  state.members[id] = createCustomMember(formValues, getStyleForMember(state.memberOrder.length), id);
  state.memberOrder.push(id);
  persistCustomState();
  qs('newMemberName').value = '';
  qs('newMemberTitle').value = '';
  qs('newMemberExpertise').value = '';
  qs('newMemberPersonality').value = '';
  setFocus(id);
  recordTranscript({
    kind: 'member',
    memberId: 'chris',
    speaker: 'Clerk',
    title: 'Session Admin',
    text: `Added board member ${state.members[id].name} (${state.members[id].title}) with remit: ${state.members[id].specialisms}.`,
    tags: ['ADMIN']
  });
  queueMinutesSave();
}

function createBreakoutRoom() {
  const issue = qs('breakoutIssue').value.trim();
  const selected = [...qs('breakoutMemberChoices').querySelectorAll('input:checked')].map((input) => input.value);
  if (!issue) {
    setSaveStatus('Breakout room requires an issue to resolve.');
    return;
  }
  if (selected.length < 2) {
    setSaveStatus('Breakout room requires at least two attendees.');
    return;
  }
  const note = `Chris can use this room to push ${selected.map((memberId) => state.members[memberId]?.name || memberId).join(', ')} into a focused side-thread on ${issue}.`;
  const room = {
    id: window.crypto?.randomUUID?.() || `breakout-${Date.now()}`,
    issue,
    members: selected,
    note,
  };
  state.breakoutRooms.push(room);
  qs('breakoutIssue').value = '';
  qs('breakoutMemberChoices').querySelectorAll('input').forEach((input) => { input.checked = false; });
  renderBreakoutRooms();
  recordTranscript({
    kind: 'member',
    memberId: 'chris',
    speaker: 'Chris',
    title: 'Project Coordinator',
    text: `I am opening a breakout room on ${issue} for ${selected.map((memberId) => state.members[memberId]?.name || memberId).join(', ')} to iron it out off the main thread and return with a cleaner recommendation.`,
    tags: ['ADMIN']
  });
  queueMinutesSave();
}

function closeBreakoutRoom(roomId) {
  const room = state.breakoutRooms.find((entry) => entry.id === roomId);
  if (!room) return;
  state.breakoutRooms = state.breakoutRooms.filter((entry) => entry.id !== roomId);
  renderBreakoutRooms();
  recordTranscript({
    kind: 'member',
    memberId: 'chris',
    speaker: 'Chris',
    title: 'Project Coordinator',
    text: `Closing breakout room on ${room.issue} for ${room.members.map((memberId) => state.members[memberId]?.name || memberId).join(', ')}. Bring conclusions back to the main board.`,
    tags: ['ADMIN']
  });
  queueMinutesSave();
}

function bindEvents() {
  qs('boardHealth').addEventListener('mouseover', (event) => {
    const triggerEl = event.target.closest('[data-health-trigger]');
    if (!triggerEl || !qs('boardHealth').contains(triggerEl)) return;
    if (triggerEl.contains(event.relatedTarget)) return;
    queueBoardHealthTooltip(triggerEl.dataset.healthTrigger, triggerEl.dataset.healthPart);
  });
  qs('boardHealth').addEventListener('mouseout', (event) => {
    const triggerEl = event.target.closest('[data-health-trigger]');
    if (!triggerEl || !qs('boardHealth').contains(triggerEl)) return;
    if (triggerEl.contains(event.relatedTarget)) return;
    hideBoardHealthTooltip(triggerEl.dataset.healthTrigger, triggerEl.dataset.healthPart);
  });
  qs('boardHealth').addEventListener('focusin', (event) => {
    const triggerEl = event.target.closest('[data-health-trigger]');
    if (!triggerEl) return;
    queueBoardHealthTooltip(triggerEl.dataset.healthTrigger, triggerEl.dataset.healthPart);
  });
  qs('boardHealth').addEventListener('focusout', (event) => {
    const triggerEl = event.target.closest('[data-health-trigger]');
    if (!triggerEl) return;
    if (triggerEl.contains(event.relatedTarget)) return;
    hideBoardHealthTooltip(triggerEl.dataset.healthTrigger, triggerEl.dataset.healthPart);
  });
  qs('memberList').addEventListener('click', (event) => {
    const memberEl = event.target.closest('.member');
    if (!memberEl) return;
    const memberId = memberEl.dataset.member;
    if (event.target.closest('[data-member-toggle]')) {
      toggleMember(memberId);
    }
    setFocus(memberId);
  });
  qs('memberList').addEventListener('mouseover', (event) => {
    const memberEl = event.target.closest('.member');
    if (!memberEl || !qs('memberList').contains(memberEl)) return;
    if (memberEl.contains(event.relatedTarget)) return;
    queueHoverCard(memberEl.dataset.member);
  });
  qs('memberList').addEventListener('mouseout', (event) => {
    const memberEl = event.target.closest('.member');
    if (!memberEl || !qs('memberList').contains(memberEl)) return;
    if (memberEl.contains(event.relatedTarget)) return;
    hideHoverCard(memberEl.dataset.member);
  });
  qs('memberList').addEventListener('focusin', (event) => {
    const memberEl = event.target.closest('.member');
    if (!memberEl) return;
    queueHoverCard(memberEl.dataset.member);
  });
  qs('memberList').addEventListener('focusout', (event) => {
    const memberEl = event.target.closest('.member');
    if (!memberEl) return;
    if (memberEl.contains(event.relatedTarget)) return;
    hideHoverCard(memberEl.dataset.member);
  });
  qs('targetSelect').addEventListener('change', (event) => {
    if (event.target.value !== 'board') setFocus(event.target.value);
  });
  qs('sendBtn').addEventListener('click', sendMessage);
  qs('saveBtn').addEventListener('click', saveMinutes);
  qs('userInput').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  });
  qs('userInput').addEventListener('input', (event) => {
    event.target.style.height = 'auto';
    event.target.style.height = `${Math.min(event.target.scrollHeight, 120)}px`;
  });
  qs('addMemberBtn').addEventListener('click', addMember);
  qs('createBreakoutBtn').addEventListener('click', createBreakoutRoom);
  qs('breakoutRooms').addEventListener('click', (event) => {
    const button = event.target.closest('[data-close-breakout]');
    if (!button) return;
    closeBreakoutRoom(button.dataset.closeBreakout);
  });
  document.querySelectorAll('[data-agenda]').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.focus-chip').forEach((chip) => chip.classList.remove('active'));
      button.classList.add('active');
      state.currentAgenda = button.dataset.agenda;
      qs('agendaLabel').textContent = state.currentAgenda;
      queueMinutesSave();
    });
  });
}

async function bootstrap() {
  const response = await fetch('/api/bootstrap');
  const data = await response.json();
  const overrides = loadMemberOverrides();
  state.memberOverrides = overrides;

  for (const member of Object.values(data.builtinMembers)) {
    const normalized = applyOverrides(normalizeMember(member));
    state.members[normalized.id] = normalized;
    state.memberOrder.push(normalized.id);
    state.protectedIds.add(normalized.id);
  }

  for (const member of loadCustomMembers()) {
    const normalized = applyOverrides(normalizeMember(member));
    state.members[normalized.id] = normalized;
    state.memberOrder.push(normalized.id);
  }

  initialTranscript();
  updateClock();
  setInterval(updateClock, 60000);
  renderMembers();
  renderTargetOptions();
  renderBreakoutMemberChoices();
  renderTranscript();
  renderBoardHealth();
  renderBreakoutRooms();
  renderSessionMap();
  renderInspector();
  bindEvents();
}

bootstrap().catch((error) => {
  setSaveStatus(`Bootstrap failed: ${error.message}`);
});
