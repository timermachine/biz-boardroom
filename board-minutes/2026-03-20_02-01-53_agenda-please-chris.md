# Rewardz Board Minutes

- Session Summary: agenda please chris
- Agenda: Open floor
- Minutes Session ID: 108b484b-ee02-4c13-8817-88ebf7d6ad2f
- Saved At: 20/03/2026, 02:08:57

## Board Health

- Deadlock: 7/10
- Consensus: 6/10
- Evidence: 10/10
- Execution: 8/10

## Attendees

- Edward - CEO [Mood 6/10]
  Archetype: Integrator
  Driver: Survival and trajectory
  Threat: Loss of confidence in direction, stalled momentum, visible uncertainty.
- Terry - CTO [Mood 5/10]
  Archetype: Capability builder
  Driver: Capability and future-state integrity
  Threat: Commitments made without technical grounding or sequencing discipline.
- Frank - CFO [Mood 5/10]
  Archetype: Brake
  Driver: Certainty and downside control
  Threat: Weak attribution, hidden liabilities, or capital deployed without protection.
- Des - Chief Designer [Mood 5/10]
  Archetype: Adoption steward
  Driver: Product clarity and adoption flow
  Threat: Complexity disguised as product value.
- Pritchard - Chief Pitcher [Mood 5/10]
  Archetype: Narrative shaper
  Driver: Compelling, coherent demand and persuasion
  Threat: Diffuse narrative, weak contrast, or messaging that does not travel.
- Mat - Math & Physics [Mood 5/10]
  Archetype: Model validator
  Driver: Coherence of assumptions and scaling logic
  Threat: Loose numbers presented as inevitabilities.
- Henry - Lead Investor [Mood 1/10]
  Archetype: Capital protector
  Driver: ROI and capital protection
  Threat: Valuation inflation without defensible leverage or exit path.
- Chris - Project Coordinator [Mood 1/10]
  Archetype: Facilitated progress catalyst
  Driver: Project progress through dependency resolution
  Threat: Analysis paralysis, circular waits, and blocked execution.
- Psy - Psychology Expert [Mood 5/10]
  Archetype: Behaviour interpreter
  Driver: Behavioural adoption and trust formation
  Threat: Product plans that ignore motivation, perception or habit mechanics.
- Archie - Technology Architect [Mood 5/10]
  Archetype: System shaper
  Driver: System coherence across components and time horizons
  Threat: Local delivery decisions that create long-term structural fragility.
- Reaf - Frontend Architect [Mood 5/10]
  Archetype: Client-side structure steward
  Driver: Sustainable frontend structure and fast iteration
  Threat: UI entropy, state sprawl, or rushed decisions that poison maintainability.

## Blockers

- Before anyone promises “network effects,” I want the technical survival conditions stated plainly: one merchant can onboard in under 15 minutes, one consumer can scan and accrue value in under 10 seconds on a mediocre mobile connection, and every scan is attributable, deduplicated, and fraud-scored well enough that finance trusts the ledger. If those are not true, the pilot data is noise because we will be measuring operator workarounds, QR abuse, and merchant tolerance for broken flows rather than product demand.

So the minimum pilot is not “all of East Sussex”; it is a tightly bounded architecture with maybe 8-12 merchants, one loyalty rule model, one merchant console, one consumer identity method, and instrumentation from day one on scan success, time-to-reward, repeat rate, and suspicious-event rate. The immediate blockers are QR token design, offline/poor-connectivity behaviour, merchant support tooling, and an event model that lets us reconstruct disputes without manual spreadsheet archaeology. If we cannot sequence those in the next two weeks, then six-month proof is already being undermined by unpriced technical debt.
- Breakouts need to kill dependencies, not create side conversations. Pair Terry with Archie to lock the pilot’s technical boundary and event model; pair Frank with Mat to set the minimum KPI thresholds, attribution standard, and what counts as financially credible evidence; put Des, Psy, and Pritchard together to strip the consumer and merchant journey down to the lowest-friction proposition that can actually be explained and adopted. Edward stays floating across all three because any unresolved tradeoff on scope, proof standard, or market claim is his call, not something to be “brought back later.”

Outputs are due back in one pass: Terry and Archie return with pilot scope, system constraints, and blocker list; Frank and Mat return with hard proof metrics, reporting cadence, and failure thresholds; Des, Psy, and Pritchard return with the single onboarding and usage flow we are willing to test. If anyone comes back with options instead of a recommendation, they have not done the job.
- Archie and I are the right pair, but the remit needs tightening or we waste a day debating abstractions. We should come back with one recommended pilot architecture, not a menu: QR token scheme, scan validation path, identity binding method, event ledger shape, failure handling for poor connectivity, and the minimum merchant tooling needed to resolve disputes without engineering intervention. We also need explicit kill criteria, because if scan attribution, deduplication, or fraud scoring cannot be made finance-trustworthy inside the pilot window, then expanding merchant count is theatre. Keep the pilot to 8-12 merchants, one accrual model, and one consumer flow; anything broader contaminates the data with implementation variance rather than demand signal.
- Chris’s structure is broadly right, but I want one adjustment: breakouts must map to exposure ownership, not just function. Put me with Mat and Henry on the proof-standard group, because KPI thresholds without investor downside tolerances and capital gating are incomplete; we need one view on what level of merchant retention, repeat scan rate, gross margin potential, and fraud leakage would justify further spend versus trigger a stop. Keep Terry with Archie as the technical containment cell, and Des with Psy and Pritchard on adoption and proposition clarity, but require each group to return not just a recommendation, but a quantified downside case, named assumptions, and the cost of being wrong.

I do not want Edward floating loosely across all groups unless he is making live scope decisions; otherwise that becomes ambiguity disguised as leadership. Better that Edward chairs the readout and resolves cross-group conflicts once the assumptions, exposures, and decision thresholds are explicit. If a breakout cannot state what evidence would falsify its recommendation, it has not produced something finance can underwrite.

## Decisions

- Agenda is not a talking shop; it is a dependency sort. First, define the six-month proof condition in hard terms: merchant count, active consumer rate, repeat scan behaviour, and retention thresholds by week, not slogans about “first-mover position.” Second, surface blockers by owner: what product, tech, merchant acquisition, legal/commercial, and measurement work is waiting on a prior decision, and what can run in parallel now.

Third, force decision order: we do not debate brand, scale, or fundraising narrative before we know the minimum viable pilot design and instrumentation. Fourth, assign immediate outputs from this meeting: one pilot scope, one KPI set, one operating cadence, and named owners with dates. If anyone wants something “proven” before work starts, name exactly what evidence they need and who produces it.
- Before anyone promises “network effects,” I want the technical survival conditions stated plainly: one merchant can onboard in under 15 minutes, one consumer can scan and accrue value in under 10 seconds on a mediocre mobile connection, and every scan is attributable, deduplicated, and fraud-scored well enough that finance trusts the ledger. If those are not true, the pilot data is noise because we will be measuring operator workarounds, QR abuse, and merchant tolerance for broken flows rather than product demand.

So the minimum pilot is not “all of East Sussex”; it is a tightly bounded architecture with maybe 8-12 merchants, one loyalty rule model, one merchant console, one consumer identity method, and instrumentation from day one on scan success, time-to-reward, repeat rate, and suspicious-event rate. The immediate blockers are QR token design, offline/poor-connectivity behaviour, merchant support tooling, and an event model that lets us reconstruct disputes without manual spreadsheet archaeology. If we cannot sequence those in the next two weeks, then six-month proof is already being undermined by unpriced technical debt.
- Chris’s structure is broadly right, but I want one adjustment: breakouts must map to exposure ownership, not just function. Put me with Mat and Henry on the proof-standard group, because KPI thresholds without investor downside tolerances and capital gating are incomplete; we need one view on what level of merchant retention, repeat scan rate, gross margin potential, and fraud leakage would justify further spend versus trigger a stop. Keep Terry with Archie as the technical containment cell, and Des with Psy and Pritchard on adoption and proposition clarity, but require each group to return not just a recommendation, but a quantified downside case, named assumptions, and the cost of being wrong.

I do not want Edward floating loosely across all groups unless he is making live scope decisions; otherwise that becomes ambiguity disguised as leadership. Better that Edward chairs the readout and resolves cross-group conflicts once the assumptions, exposures, and decision thresholds are explicit. If a breakout cannot state what evidence would falsify its recommendation, it has not produced something finance can underwrite.

## Actions

- Agenda is not a talking shop; it is a dependency sort. First, define the six-month proof condition in hard terms: merchant count, active consumer rate, repeat scan behaviour, and retention thresholds by week, not slogans about “first-mover position.” Second, surface blockers by owner: what product, tech, merchant acquisition, legal/commercial, and measurement work is waiting on a prior decision, and what can run in parallel now.

Third, force decision order: we do not debate brand, scale, or fundraising narrative before we know the minimum viable pilot design and instrumentation. Fourth, assign immediate outputs from this meeting: one pilot scope, one KPI set, one operating cadence, and named owners with dates. If anyone wants something “proven” before work starts, name exactly what evidence they need and who produces it.
- Breakouts need to kill dependencies, not create side conversations. Pair Terry with Archie to lock the pilot’s technical boundary and event model; pair Frank with Mat to set the minimum KPI thresholds, attribution standard, and what counts as financially credible evidence; put Des, Psy, and Pritchard together to strip the consumer and merchant journey down to the lowest-friction proposition that can actually be explained and adopted. Edward stays floating across all three because any unresolved tradeoff on scope, proof standard, or market claim is his call, not something to be “brought back later.”

Outputs are due back in one pass: Terry and Archie return with pilot scope, system constraints, and blocker list; Frank and Mat return with hard proof metrics, reporting cadence, and failure thresholds; Des, Psy, and Pritchard return with the single onboarding and usage flow we are willing to test. If anyone comes back with options instead of a recommendation, they have not done the job.

## Transcript

### undefined - Edward (CEO)

Board is convened. We have six months to prove first-mover position in QR-based shared loyalty across East Sussex.
Henry has capital on the table. We are not here for validation - we are here to identify what breaks this model before the market does.
Floor is open. Evidence on the table, assumptions challenged. Let's start.

### 02:01 - You (Floor)

agenda please chris

### 02:01 - Chris (Project Coordinator)

Agenda is not a talking shop; it is a dependency sort. First, define the six-month proof condition in hard terms: merchant count, active consumer rate, repeat scan behaviour, and retention thresholds by week, not slogans about “first-mover position.” Second, surface blockers by owner: what product, tech, merchant acquisition, legal/commercial, and measurement work is waiting on a prior decision, and what can run in parallel now.

Third, force decision order: we do not debate brand, scale, or fundraising narrative before we know the minimum viable pilot design and instrumentation. Fourth, assign immediate outputs from this meeting: one pilot scope, one KPI set, one operating cadence, and named owners with dates. If anyone wants something “proven” before work starts, name exactly what evidence they need and who produces it.

### 02:01 - Edward (CEO)

Good. We use that structure and we keep it hard-edged: in six months I want proof that this is not a gimmick but a defensible local network effect, which means signed merchants, weekly active consumers, repeat cross-merchant scans, and measurable merchant retention with dates attached. The immediate question is not “is the idea interesting,” it is what sequence gets us to credible market evidence fastest without building a fragile mess.

So I want the room to attack four things in order: the minimum pilot shape, the exact KPIs that would justify more capital, the blockers that stop launch, and the owners who remove them. If anyone thinks the model breaks on unit economics, adoption friction, merchant onboarding, or technical operability, say it plainly now and say what evidence would settle it.

### 02:01 - Terry (CTO)

Before anyone promises “network effects,” I want the technical survival conditions stated plainly: one merchant can onboard in under 15 minutes, one consumer can scan and accrue value in under 10 seconds on a mediocre mobile connection, and every scan is attributable, deduplicated, and fraud-scored well enough that finance trusts the ledger. If those are not true, the pilot data is noise because we will be measuring operator workarounds, QR abuse, and merchant tolerance for broken flows rather than product demand.

So the minimum pilot is not “all of East Sussex”; it is a tightly bounded architecture with maybe 8-12 merchants, one loyalty rule model, one merchant console, one consumer identity method, and instrumentation from day one on scan success, time-to-reward, repeat rate, and suspicious-event rate. The immediate blockers are QR token design, offline/poor-connectivity behaviour, merchant support tooling, and an event model that lets us reconstruct disputes without manual spreadsheet archaeology. If we cannot sequence those in the next two weeks, then six-month proof is already being undermined by unpriced technical debt.

### 02:06 - You (Floor)

chris, suggest breakout room pairs or threes

### 02:06 - Chris (Project Coordinator)

Breakouts need to kill dependencies, not create side conversations. Pair Terry with Archie to lock the pilot’s technical boundary and event model; pair Frank with Mat to set the minimum KPI thresholds, attribution standard, and what counts as financially credible evidence; put Des, Psy, and Pritchard together to strip the consumer and merchant journey down to the lowest-friction proposition that can actually be explained and adopted. Edward stays floating across all three because any unresolved tradeoff on scope, proof standard, or market claim is his call, not something to be “brought back later.”

Outputs are due back in one pass: Terry and Archie return with pilot scope, system constraints, and blocker list; Frank and Mat return with hard proof metrics, reporting cadence, and failure thresholds; Des, Psy, and Pritchard return with the single onboarding and usage flow we are willing to test. If anyone comes back with options instead of a recommendation, they have not done the job.

### 02:07 - Terry (CTO)

Archie and I are the right pair, but the remit needs tightening or we waste a day debating abstractions. We should come back with one recommended pilot architecture, not a menu: QR token scheme, scan validation path, identity binding method, event ledger shape, failure handling for poor connectivity, and the minimum merchant tooling needed to resolve disputes without engineering intervention. We also need explicit kill criteria, because if scan attribution, deduplication, or fraud scoring cannot be made finance-trustworthy inside the pilot window, then expanding merchant count is theatre. Keep the pilot to 8-12 merchants, one accrual model, and one consumer flow; anything broader contaminates the data with implementation variance rather than demand signal.

### 02:07 - Frank (CFO)

Chris’s structure is broadly right, but I want one adjustment: breakouts must map to exposure ownership, not just function. Put me with Mat and Henry on the proof-standard group, because KPI thresholds without investor downside tolerances and capital gating are incomplete; we need one view on what level of merchant retention, repeat scan rate, gross margin potential, and fraud leakage would justify further spend versus trigger a stop. Keep Terry with Archie as the technical containment cell, and Des with Psy and Pritchard on adoption and proposition clarity, but require each group to return not just a recommendation, but a quantified downside case, named assumptions, and the cost of being wrong.

I do not want Edward floating loosely across all groups unless he is making live scope decisions; otherwise that becomes ambiguity disguised as leadership. Better that Edward chairs the readout and resolves cross-group conflicts once the assumptions, exposures, and decision thresholds are explicit. If a breakout cannot state what evidence would falsify its recommendation, it has not produced something finance can underwrite.

### 02:08 - Chris (Project Coordinator)

I am opening a breakout room on hard proof metrics, reporting cadence, and failure thresholds for Frank, Mat to iron it out off the main thread and return with a cleaner recommendation.
