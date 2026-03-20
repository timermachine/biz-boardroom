const fs = require('fs');
const path = require('path');

const BOARDROOM_DIR = __dirname;
const PROJECT_INPUT_DATA_DIR = path.join(BOARDROOM_DIR, 'project-input-data');
const DEFAULT_MEMBERS_FILE = path.join(BOARDROOM_DIR, 'builtin-members.json');
const DEFAULT_PROJECT_CONTEXT_FILE = path.join(BOARDROOM_DIR, 'project-context.md');
const DEFAULT_BOARD_RULES_FILE = path.join(BOARDROOM_DIR, 'board-rules.md');
const DEFAULT_REVIEW_ORCHESTRATION_FILE = path.join(BOARDROOM_DIR, 'review-orchestration.md');
const DEFAULT_REVIEW_ORCHESTRATION_JSON_FILE = path.join(BOARDROOM_DIR, 'review-orchestration.json');

function getLatestMeetingPackDir() {
  if (!fs.existsSync(PROJECT_INPUT_DATA_DIR)) return null;
  const dateDirs = fs.readdirSync(PROJECT_INPUT_DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (!dateDirs.length) return null;
  const latestDateDir = dateDirs[dateDirs.length - 1];
  const datedPath = path.join(PROJECT_INPUT_DATA_DIR, latestDateDir);
  const packDirs = fs.readdirSync(datedPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  if (!packDirs.length) return null;
  return path.join(datedPath, packDirs[packDirs.length - 1]);
}

function resolvePackFile(filename, fallbackPath) {
  const packDir = getLatestMeetingPackDir();
  if (!packDir) return fallbackPath;
  const packFile = path.join(packDir, filename);
  return fs.existsSync(packFile) ? packFile : fallbackPath;
}

function loadBuiltinMembers() {
  return JSON.parse(fs.readFileSync(resolvePackFile('builtin-members.json', DEFAULT_MEMBERS_FILE), 'utf8'));
}

function loadProjectContext() {
  return fs.readFileSync(resolvePackFile('project-context.md', DEFAULT_PROJECT_CONTEXT_FILE), 'utf8').trim();
}

function loadBoardRules() {
  return fs.readFileSync(resolvePackFile('board-rules.md', DEFAULT_BOARD_RULES_FILE), 'utf8').trim();
}

function loadReviewOrchestration() {
  return fs.readFileSync(resolvePackFile('review-orchestration.md', DEFAULT_REVIEW_ORCHESTRATION_FILE), 'utf8').trim();
}

function loadReviewOrchestrationJson() {
  return JSON.parse(fs.readFileSync(resolvePackFile('review-orchestration.json', DEFAULT_REVIEW_ORCHESTRATION_JSON_FILE), 'utf8'));
}

function moodInstruction(level) {
  if (level <= 2) return 'Stay strict, low-agreeableness, evidence-first, and minimally flexible.';
  if (level <= 4) return 'Stay firm and challenging, but allow limited exploration of alternatives.';
  if (level <= 6) return 'Balance rigor with moderate agreeableness and practical flexibility.';
  if (level <= 8) return 'Be more adaptive and collaborative while still anchored to your role.';
  return 'Be notably agreeable, flexible and collaborative, but do not abandon role logic.';
}

function renderMemberLine(member) {
  return `- ${member.name} (${member.title}) | archetype: ${member.functional_archetype} | driver: ${member.primary_driver} | threat: ${member.primary_threat} | power posture: ${member.power_posture} | mood: ${member.mood}/10`;
}

function renderBreakoutRoomLine(room) {
  const memberNames = (room.members || []).map((member) => `${member.name} (${member.title}, mood ${member.mood}/10)`).join(', ');
  return `- Issue: ${room.issue} | Attendees: ${memberNames || 'None listed'} | Note: ${room.note || 'No note.'}`;
}

function buildRespondPrompt(payload) {
  const { member, activeMembers, breakoutRooms = [], userText, currentAgenda, transcript } = payload;
  const projectContext = loadProjectContext();
  const boardRules = loadBoardRules();
  const reviewOrchestration = loadReviewOrchestration();
  const reviewOrchestrationJson = loadReviewOrchestrationJson();
  const memberContext = transcript
    .filter((entry) => entry.memberId === member.id)
    .slice(-3)
    .map((entry) => `${entry.time}: ${entry.text}`)
    .join(' | ');

  return `You are simulating a hard-edged stakeholder board meeting for Rewardz.

PROJECT CONTEXT:
${projectContext}

BOARD RULES:
${boardRules}

REVIEW ORCHESTRATION:
${reviewOrchestration}

REVIEW ORCHESTRATION JSON:
${JSON.stringify(reviewOrchestrationJson, null, 2)}

ACTIVE BOARD:
${activeMembers.map(renderMemberLine).join('\n')}

ACTIVE BREAKOUT ROOMS:
${breakoutRooms.length ? breakoutRooms.map(renderBreakoutRoomLine).join('\n') : '- No active breakout rooms.'}

CURRENT AGENDA:
${currentAgenda || 'Open floor'}

TARGET MEMBER PROFILE:
Name: ${member.name}
Role: ${member.title}
Functional archetype: ${member.functional_archetype}
Relational stance: ${member.relational_stance}
Power posture: ${member.power_posture}
Primary driver: ${member.primary_driver}
Primary threat: ${member.primary_threat}
Boundary behaviour: ${member.boundary_behaviour}
Influence style: ${member.influence_style}
Failure mode: ${member.failure_mode}
Decision filter: ${member.decision_filter}
Characteristic opening move: ${member.opening_move}
Non-negotiable: ${member.non_negotiable}
Threat tell: ${member.threat_tells}
Growth tell: ${member.growth_tells}
Specialisms: ${member.specialisms}
Personality: ${member.personality}
Moodometer: ${member.mood}/10
Mood instruction: ${moodInstruction(member.mood)}
Recent context: ${memberContext || 'No recent direct context.'}

RECENT TRANSCRIPT:
${transcript.map((entry) => `${entry.time} ${entry.speaker} (${entry.title}): ${entry.text}`).join('\n')}

USER INPUT:
${userText}

Respond only as ${member.name}. No markdown headers. No meta commentary.`;
}

function renderMinutesMarkdown(session, summary, sessionId) {
  const members = session.members || [];
  const breakoutRooms = session.breakoutRooms || [];
  const transcript = session.transcript || [];
  const health = session.boardHealth || {};
  const map = session.sessionMap || {};

  const attendeeLines = members.map((member) => (
    `- ${member.name} - ${member.title} [Mood ${member.mood}/10]\n` +
    `  Archetype: ${member.functional_archetype}\n` +
    `  Driver: ${member.primary_driver}\n` +
    `  Threat: ${member.primary_threat}`
  )).join('\n');

  const transcriptLines = transcript.map((entry) => (
    `### ${entry.time} - ${entry.speaker} (${entry.title})\n\n${entry.text}\n`
  )).join('\n');

  const breakoutLines = breakoutRooms.length
    ? breakoutRooms.map((room) => (
      `- ${room.issue}\n  Attendees: ${(room.memberNames || []).join(', ')}\n  Note: ${room.note || 'None'}`
    )).join('\n')
    : '- None active when minutes were saved';

  return `# Rewardz Board Minutes

- Session Summary: ${summary}
- Agenda: ${session.agenda || 'Open floor'}
- Minutes Session ID: ${sessionId}
- Saved At: ${new Date().toLocaleString('en-GB')}

## Board Health

- Deadlock: ${health.deadlock || 0}/10
- Consensus: ${health.consensus || 0}/10
- Evidence: ${health.evidence || 0}/10
- Execution: ${health.execution || 0}/10

## Attendees

${attendeeLines}

## Breakout Rooms

${breakoutLines}

## Blockers

${(map.blockers || []).length ? map.blockers.map((item) => `- ${item}`).join('\n') : '- None logged'}

## Decisions

${(map.decisions || []).length ? map.decisions.map((item) => `- ${item}`).join('\n') : '- None logged'}

## Actions

${(map.actions || []).length ? map.actions.map((item) => `- ${item}`).join('\n') : '- None logged'}

## Transcript

${transcriptLines}`;
}

module.exports = {
  buildRespondPrompt,
  getLatestMeetingPackDir,
  loadBuiltinMembers,
  loadReviewOrchestration,
  loadReviewOrchestrationJson,
  renderMinutesMarkdown,
};
