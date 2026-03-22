# REWARDZ
## Business Model & Unit Economics

**CONFIDENTIAL | FOR C-LEVEL REVIEW ONLY | MARCH 2026**

---

## 1. Revenue Model

The Rewardz revenue model is transaction-based, with a small per-scan fee payable by the merchant on each customer loyalty interaction. This aligns platform revenue directly with merchant activity — the platform earns when merchants earn.

### 1.1 Core Transaction Fee

| Field | Detail |
|---|---|
| **Fee Structure** | ~1% of transaction value per scan; approximately 3p–20p per scan at typical coffee shop price points |
| **Platform Margin** | ~5p retained per scan after customer reward allocation and payment processing costs |
| **Merchant Cost** | ~20p per scan or 1% of transaction value (merchant-facing price, not platform margin) |
| **Settlement Cadence** | Weekly — minimises float exposure and simplifies merchant cash flow management |
| **Payment Rail** | Stripe Connect — platform is marketplace facilitator; no principal fund-holding |

### 1.2 Pricing Rationale

The 1% pricing model is deliberately positioned to be **structurally unbeatable** for any well-capitalised competitor. Major loyalty platforms charge 1.5–3% of transaction value or require upfront hardware and SaaS fees that price out independent operators entirely. Rewardz's 1% model is sustainable at scale but inaccessible to incumbents without cannibalising their existing revenue structures.

The early adopter lock-in programme offers 1–3 year pricing guarantees to founding merchants, creating an installed base that is expensive to displace and generates compounding network value as the merchant count grows.

### 1.3 Premium Revenue Streams (Future)

| Stream | Description | Stage |
|---|---|---|
| **Merchant Analytics Dashboard** | Premium tier providing transaction frequency, customer retention, churn alerts, competitor benchmarking. | Year 1–2 |
| **Promotional Placement** | Paid visibility within the customer app — double-stamp promotions, featured merchant placement. | Year 1 |
| **Roaster / Supplier Partnerships** | Revenue share from supply partnerships introduced through the platform network. | Year 2 |
| **White-Label Infrastructure** | Licencing the platform infrastructure to BIDs, councils, or international operators. | Year 2–3 |
| **Data Insights (Aggregated)** | Anonymised, aggregate market intelligence sold to CPG brands and urban planners — never individual merchant or customer data. | Year 3+ |
| **Tourism Integration** | Visitor loyalty pass products — cross-sector (accommodation, food, attractions) for destination markets. | Year 2 |

---

## 2. Unit Economics Model

### 2.1 Per-Transaction Economics (Coffee Shop Baseline)

| Item | Amount | Notes |
|---|---|---|
| Average coffee transaction | £3.00 | Conservative mid-market estimate; UK average £3.00–£3.50 |
| Merchant fee (1% of transaction) | ~3p | Payable by merchant on each scan |
| Platform processing cost | ~0.5p | Stripe Connect + infrastructure cost per transaction |
| Platform net margin per scan | ~2.5p | Before reward allocation |
| Reward liability per scan | ~0p | Reward triggered at 10th scan only; amortised across 10 scans |
| Reward cost amortised per scan | ~0.5p | Assuming £0.30 cash wallet payout per 10-stamp cycle |
| **Platform net margin (fully loaded)** | **~2p** | Illustrative; subject to validation |

### 2.2 Single Town Model (Beachhead)

| Metric | Conservative | Base Case | Optimistic |
|---|---|---|---|
| Participating merchants | 15 | 20 | 30 |
| Active users | 250 | 400 | 700 |
| Average scans per user per week | 1.5 | 2.0 | 2.5 |
| Total scans per week | 375 | 800 | 1,750 |
| Gross revenue per week | ~£75 | ~£160 | ~£350 |
| Gross revenue per year | ~£3,900 | ~£8,320 | ~£18,200 |
| Platform margin per year (~30%) | ~£1,200 | ~£2,500 | ~£5,460 |

> **Note:** The higher gross revenue estimates cited in previous analysis (£26k gross / £6.5k margin for 20 merchants / 400 users) reflect a broader interpretation of transaction values and may include food and non-coffee purchases. The above model applies a conservative coffee-only baseline for conservative scenario planning. The business case strengthens materially as the platform expands beyond coffee into restaurants, barbers, and retail where average transaction values are higher.

### 2.3 National Scale Model

| Phase | Timeframe | Merchants | Annual Gross Revenue | Platform Margin |
|---|---|---|---|---|
| **Pilot** | Months 1–6 | 20–40 | ~£52,700 | ~£13,000 |
| **Regional** | Months 7–18 | ~400 | ~£330,000 | ~£85,000 |
| **Major Cities** | Months 19–36 | ~2,000 | ~£2.7M | ~£700k |
| **National Scale** | Months 37–60 | ~13,000 | ~£25.4M | ~£6.4M |

Breakeven is estimated at approximately **350–400 active merchants nationally**, with strong positive unit economics beyond that threshold. Phase 1 (pilot) is expected to operate at a net loss absorbed by seed funding. Phases 2–3 should reach contribution margin breakeven. Phase 4 represents the intended scaled revenue model.

---

## 3. Cost Structure

### 3.1 Technology Infrastructure (Annual Estimates)

| Item | POC (Month 0–6) | Launch (Month 6–18) | Scale (Month 18+) |
|---|---|---|---|
| Cloud infrastructure (DOKS) | £500–£800 | £2,000–£5,000 | £15,000–£50,000 |
| Payment processing (Stripe) | Variable ~0.5% | Variable ~0.5% | Volume-negotiated |
| Development (MVP build) | £40,000–£80,000 | Maintenance | Feature investment |
| Security / pen testing | £5,000–£10,000 | Annual | Annual |
| FCA compliance / legal | £10,000–£20,000 | Ongoing | Ongoing |

---

## 4. Financial Risks

| Risk | Description | Mitigation |
|---|---|---|
| **Pooled liability** | Free-item redemption across network creates complex multi-merchant liability. | Cash wallet model preferred — eliminates free-item pooling; each payout is a direct cash credit. |
| **Low adoption rate** | Unit economics require sufficient scan volume to cover platform costs. | Beachhead strategy — deep penetration in one geography before scaling; early adopter incentives. |
| **Stripe fee erosion** | At very low transaction values, Stripe minimum fees may erode margin. | Minimum transaction floor and/or batch payment model to be investigated in technical phase. |
| **Regulatory cost** | FCA SPI registration and ongoing compliance may exceed estimates. | Conservative budget allocation; Stripe Connect significantly reduces regulatory burden versus holding funds directly. |
| **Pricing pressure** | Competitor entry may compress fee rates. | Early adopter lock-ins provide 1–3 year protection; network effect creates switching cost. |

---

*Rewardz Ltd (Concept) | Confidential — Not for Distribution | March 2026*
