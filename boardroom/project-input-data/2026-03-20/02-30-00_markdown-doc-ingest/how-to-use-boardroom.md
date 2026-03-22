# How To Use The Rewardz Boardroom App

## Purpose

The boardroom app is a structured challenge environment for Rewardz.
It is designed to pressure-test assumptions, surface missing evidence, resolve dependency deadlocks, and improve decision quality before documents or plans are promoted.

The app is not a source of truth on its own.
It should be used to interrogate working documents, assumptions, and proposals.

## Core Inputs

The board operates using several layers of context:

- `project-context.md`
  The current working venture proposition and assumptions.
- `board-rules.md`
  The behavioral standard for board discussion.
- `review-orchestration.md`
  Guidance on when to use the full board, individuals, pairs, or breakout rooms.
- `builtin-members.json`
  The attendee profiles, including roles, drivers, threats, and personalities.

Later, these should sit inside dated meeting input packs.

## What The Attendees Are For

Each attendee is not just a speaker.
Each one is a pressure source with a different role logic.

Use them in four ways:

- individually
  for first-pass domain critique
- in pairs
  for tension-based review
- in trios or breakout rooms
  for blocked or cross-functional issues
- as a full board
  for integrated review and final challenge

## Recommended Workflow

### 1. Set The Topic

Choose a quick topic if one exists, or raise the issue directly in the main input box.
Keep the input concrete.
Good prompts are:

- review this funding assumption
- test whether the QR fraud model is credible
- challenge the rollout plan for East Sussex
- what breaks in this pricing logic

### 2. Start Narrow

Do not begin with the whole board unless the issue is already integrated and mature.

Prefer this sequence:

1. individual reviewer
2. tension pair
3. trio or breakout room if blocked
4. full board integration review

Example:

- start with Frank for unit economics
- escalate to Frank + Henry for capital exposure
- bring Edward + Frank + Mat together if it affects venture coherence

### 3. Use The Attendees Deliberately

Examples:

- `Edward + Frank`
  ambition vs economic realism
- `Terry + Des`
  technical feasibility vs usability
- `Frank + Henry`
  funding, valuation, downside, investor defensibility
- `Des + Psy`
  trust, onboarding, and adoption behavior
- `Chris + blockers`
  sequencing, dependencies, and deadlock clearing

Use the review orchestration file as the default guide.

### 4. Use Breakout Rooms When The Room Loops

Breakout rooms are for issues that are too detailed or blocked for plenary discussion.

Create a breakout room when:

- the same disagreement keeps repeating
- the issue requires a narrower group
- sequencing is blocked by unresolved specialist conflict
- Chris would realistically intervene

Each breakout room should have:

- a specific issue
- the minimum viable attendee set
- a clear expectation to return with a narrowed recommendation

### 5. Save The Meeting

Use `Save Minutes` when the meeting has produced useful challenge, decisions, blockers, or breakout structure.

The save flow snapshots the meeting into a dated folder under:

- `biz/boardroom/project-input-data/<date>/<meeting-id>/`

That snapshot includes:

- `minutes.md`
- `project-context.md`
- `board-rules.md`
- `review-orchestration.md`
- `review-orchestration.json`
- `builtin-members.json`

This creates a meeting-by-meeting record of the context used at the time.

## What Good Use Looks Like

Good use of the app means:

- asking for challenge, not validation
- keeping issues specific
- routing issues to the right attendee mix
- using Chris to resolve deadlock and sequencing problems
- saving snapshots only when the meeting meaningfully changes the working state

## What Not To Do

- Do not treat attendee output as factual market evidence.
- Do not use the full board for every early-stage question.
- Do not keep debating the same unresolved issue in plenary if a breakout room is cleaner.
- Do not let project context drift without saving a new meeting snapshot.

## Suggested Output Style For Reviews

When using the board against a document or issue, aim to extract:

- strongest objection
- missing evidence
- required revision
- dependency created
- owner
- next step
- kill criterion

That keeps the board useful as a decision tool rather than a conversation toy.
