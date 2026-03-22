# Rewardz Board Minutes

- Session Summary: check the economics of 03_Rewardz_Business_Model_Unit_Economics
- Agenda: Open floor
- Minutes Session ID: ec56a492-a3d4-47bf-9da1-fed882da8cd7
- Saved At: 20/03/2026, 10:22:10

## Board Health

- Deadlock: 5/10
- Consensus: 8/10
- Evidence: 10/10
- Execution: 10/10

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

- Fine. Then I am not waiting for a polished model; I am defining the minimum financeable sheet structure now: per-merchant CAC, onboarding cost, activation rate, time-to-activation, monthly merchant churn, average active customers per merchant, transactions per active customer, average basket, take rate or merchant fee, reward funding split, processing/support cost, gross contribution, and payback period on a cohort basis. I also want three explicit scenarios only: base case, downside case, and failure-to-density, where customer participation stalls and cross-merchant usage never compounds.

For each scenario, show who carries each cash exposure: merchant discount, platform-funded rewards, refund/fraud leakage, support burden, and any deferred reward liability. Then calculate whether one activated merchant is cash-contributive within a defined period, whether retained gross contribution exceeds replacement cost from churn, and what burn looks like if activation lags by 30, 60, and 90 days. If you cannot populate those inputs with evidence ranges rather than ambition language, then the correct board conclusion is not “promising”; it is “financially unproven.”
- Use this as the minimum financeable input sheet; do not fill it with single-point guesses, fill each cell with an evidence range and source note. If a line cannot be evidenced, mark it `unproven` rather than smoothing over the risk.

| Metric | Definition | Base Case | Downside Case | Failure-to-Density Case | Exposure Owner | Evidence / Source |
|---|---|---:|---:|---:|---|---|
| Merchant CAC | Sales and marketing cost per signed merchant |  |  |  | Rewardz |  |
| Onboarding Cost | Internal setup, training, support, materials per merchant |  |  |  | Rewardz |  |
| Activation Rate | % of signed merchants becoming genuinely live |  |  |  | Rewardz |  |
| Time to Activation | Days from signed to first live customer usage |  |  |  | Rewardz |  |
| Monthly Merchant Churn | % of activated merchants lost per month |  |  |  | Rewardz |  |
| Active Customers per Merchant | Monthly participating customers per activated merchant |  |  |  | Shared / demand-side risk |  |
| Transactions per Active Customer | Monthly frequency through network |  |  |  | Shared / behaviour risk |  |
| Average Basket Value | Gross transaction value per purchase |  |  |  | Merchant-side economic base |  |
| Merchant Fee / Take Rate | Revenue retained by platform per transaction or per merchant |  |  |  | Merchant |  |
| Reward Funding Split | % funded by merchant vs platform |  |  |  | Split explicitly |  |
| Processing Cost | Payment / QR / infra cost per transaction |  |  |  | Rewardz |  |
| Support Cost | Ongoing account and customer support cost per merchant/month |  |  |  | Rewardz |  |
| Fraud / Refund Leakage | Losses from misuse, reversals, disputes |  |  |  | Explicitly assign |  |
| Deferred Reward Liability | Unredeemed rewards sitting on balance sheet |  |  |  | Explicitly assign |  |
| Gross Contribution per Merchant | Revenue less rewards, processing, support, leakage |  |  |  | Rewardz |  |
| Payback Period | Months from onboarding cash out to recovered contribution |  |  |  | Rewardz |  |
| Retained Contribution vs Replacement Cost | Cohort contribution after churn versus CAC to replace losses |  |  |  | Rewardz |  |
| Burn if Activation Delayed 30 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |
| Burn if Activation Delayed 60 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |
| Burn if Activation Delayed 90 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |

Add one final row beneath this: `Financeable?` with only `yes`, `no`, or `unproven` per scenario. My test remains unchanged: if one activated merchant does not become cash-contributive inside a defensible period, or if retained cohort contribution does not clear replacement cost under downside assumptions, then this is not a growth model yet, it is an exposure model.

## Decisions

- ok, make a markdown grid of these, and we will get real value/ranges

## Actions

- Use this as the minimum financeable input sheet; do not fill it with single-point guesses, fill each cell with an evidence range and source note. If a line cannot be evidenced, mark it `unproven` rather than smoothing over the risk.

| Metric | Definition | Base Case | Downside Case | Failure-to-Density Case | Exposure Owner | Evidence / Source |
|---|---|---:|---:|---:|---|---|
| Merchant CAC | Sales and marketing cost per signed merchant |  |  |  | Rewardz |  |
| Onboarding Cost | Internal setup, training, support, materials per merchant |  |  |  | Rewardz |  |
| Activation Rate | % of signed merchants becoming genuinely live |  |  |  | Rewardz |  |
| Time to Activation | Days from signed to first live customer usage |  |  |  | Rewardz |  |
| Monthly Merchant Churn | % of activated merchants lost per month |  |  |  | Rewardz |  |
| Active Customers per Merchant | Monthly participating customers per activated merchant |  |  |  | Shared / demand-side risk |  |
| Transactions per Active Customer | Monthly frequency through network |  |  |  | Shared / behaviour risk |  |
| Average Basket Value | Gross transaction value per purchase |  |  |  | Merchant-side economic base |  |
| Merchant Fee / Take Rate | Revenue retained by platform per transaction or per merchant |  |  |  | Merchant |  |
| Reward Funding Split | % funded by merchant vs platform |  |  |  | Split explicitly |  |
| Processing Cost | Payment / QR / infra cost per transaction |  |  |  | Rewardz |  |
| Support Cost | Ongoing account and customer support cost per merchant/month |  |  |  | Rewardz |  |
| Fraud / Refund Leakage | Losses from misuse, reversals, disputes |  |  |  | Explicitly assign |  |
| Deferred Reward Liability | Unredeemed rewards sitting on balance sheet |  |  |  | Explicitly assign |  |
| Gross Contribution per Merchant | Revenue less rewards, processing, support, leakage |  |  |  | Rewardz |  |
| Payback Period | Months from onboarding cash out to recovered contribution |  |  |  | Rewardz |  |
| Retained Contribution vs Replacement Cost | Cohort contribution after churn versus CAC to replace losses |  |  |  | Rewardz |  |
| Burn if Activation Delayed 30 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |
| Burn if Activation Delayed 60 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |
| Burn if Activation Delayed 90 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |

Add one final row beneath this: `Financeable?` with only `yes`, `no`, or `unproven` per scenario. My test remains unchanged: if one activated merchant does not become cash-contributive inside a defensible period, or if retained cohort contribution does not clear replacement cost under downside assumptions, then this is not a growth model yet, it is an exposure model.

## Transcript

### undefined - Edward (CEO)

Board is convened. We have six months to prove first-mover position in QR-based shared loyalty across East Sussex.
Henry has capital on the table. We are not here for validation - we are here to identify what breaks this model before the market does.
Floor is open. Evidence on the table, assumptions challenged. Let's start.

### 10:19 - You (Floor)

check the economics of 03_Rewardz_Business_Model_Unit_Economics

### 10:19 - Frank (CFO)

I need the actual model inputs before I’ll endorse any conclusion. Show me merchant acquisition cost, activation rate, monthly merchant churn, average participating customers per merchant, reward funding mix, gross margin after payment/processing/support, and the cash timing between onboarding spend and payback. If `03_Rewardz_Business_Model_Unit_Economics` assumes network effects, I want a base case, downside case, and failure-to-density case, because shared loyalty models usually die in the gap between local merchant enthusiasm and repeated consumer usage.

The specific financial test is simple: does one activated merchant become cash-contributive inside a defensible period, and does cohort retention stay above the cost of replacing losses? If attribution is fuzzy, if reward liability sits implicitly on us, or if usage assumptions rely on merchant behavior we do not control, then the model is overstating certainty and understating exposure. Bring me the sheet and I’ll tell you which assumptions are financeable and which are fiction.

### 10:20 - You (Floor)

you make the sheet

### 10:20 - Frank (CFO)

Fine. Then I am not waiting for a polished model; I am defining the minimum financeable sheet structure now: per-merchant CAC, onboarding cost, activation rate, time-to-activation, monthly merchant churn, average active customers per merchant, transactions per active customer, average basket, take rate or merchant fee, reward funding split, processing/support cost, gross contribution, and payback period on a cohort basis. I also want three explicit scenarios only: base case, downside case, and failure-to-density, where customer participation stalls and cross-merchant usage never compounds.

For each scenario, show who carries each cash exposure: merchant discount, platform-funded rewards, refund/fraud leakage, support burden, and any deferred reward liability. Then calculate whether one activated merchant is cash-contributive within a defined period, whether retained gross contribution exceeds replacement cost from churn, and what burn looks like if activation lags by 30, 60, and 90 days. If you cannot populate those inputs with evidence ranges rather than ambition language, then the correct board conclusion is not “promising”; it is “financially unproven.”

### 10:21 - You (Floor)

ok, make a markdown grid of these, and we will get real value/ranges

### 10:22 - Frank (CFO)

Use this as the minimum financeable input sheet; do not fill it with single-point guesses, fill each cell with an evidence range and source note. If a line cannot be evidenced, mark it `unproven` rather than smoothing over the risk.

| Metric | Definition | Base Case | Downside Case | Failure-to-Density Case | Exposure Owner | Evidence / Source |
|---|---|---:|---:|---:|---|---|
| Merchant CAC | Sales and marketing cost per signed merchant |  |  |  | Rewardz |  |
| Onboarding Cost | Internal setup, training, support, materials per merchant |  |  |  | Rewardz |  |
| Activation Rate | % of signed merchants becoming genuinely live |  |  |  | Rewardz |  |
| Time to Activation | Days from signed to first live customer usage |  |  |  | Rewardz |  |
| Monthly Merchant Churn | % of activated merchants lost per month |  |  |  | Rewardz |  |
| Active Customers per Merchant | Monthly participating customers per activated merchant |  |  |  | Shared / demand-side risk |  |
| Transactions per Active Customer | Monthly frequency through network |  |  |  | Shared / behaviour risk |  |
| Average Basket Value | Gross transaction value per purchase |  |  |  | Merchant-side economic base |  |
| Merchant Fee / Take Rate | Revenue retained by platform per transaction or per merchant |  |  |  | Merchant |  |
| Reward Funding Split | % funded by merchant vs platform |  |  |  | Split explicitly |  |
| Processing Cost | Payment / QR / infra cost per transaction |  |  |  | Rewardz |  |
| Support Cost | Ongoing account and customer support cost per merchant/month |  |  |  | Rewardz |  |
| Fraud / Refund Leakage | Losses from misuse, reversals, disputes |  |  |  | Explicitly assign |  |
| Deferred Reward Liability | Unredeemed rewards sitting on balance sheet |  |  |  | Explicitly assign |  |
| Gross Contribution per Merchant | Revenue less rewards, processing, support, leakage |  |  |  | Rewardz |  |
| Payback Period | Months from onboarding cash out to recovered contribution |  |  |  | Rewardz |  |
| Retained Contribution vs Replacement Cost | Cohort contribution after churn versus CAC to replace losses |  |  |  | Rewardz |  |
| Burn if Activation Delayed 30 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |
| Burn if Activation Delayed 60 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |
| Burn if Activation Delayed 90 Days | Incremental cash burn from delay |  |  |  | Rewardz |  |

Add one final row beneath this: `Financeable?` with only `yes`, `no`, or `unproven` per scenario. My test remains unchanged: if one activated merchant does not become cash-contributive inside a defensible period, or if retained cohort contribution does not clear replacement cost under downside assumptions, then this is not a growth model yet, it is an exposure model.
