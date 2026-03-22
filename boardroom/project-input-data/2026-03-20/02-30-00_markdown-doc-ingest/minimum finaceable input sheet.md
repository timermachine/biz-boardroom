# Minimum Financeable Input Sheet

Use this as the minimum financeable input sheet.

- Do not fill it with single-point guesses.
- Fill each cell with an evidence range and source note.
- If a line cannot be evidenced, mark it `unproven` rather than smoothing over the risk.

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
| Financeable? | Use only `yes`, `no`, or `unproven` per scenario |  |  |  |  |  |

My test remains unchanged:

If one activated merchant does not become cash-contributive inside a defensible period, or if retained cohort contribution does not clear replacement cost under downside assumptions, then this is not a growth model yet, it is an exposure model.
