# REWARDZ
## Concept Brief & Venture Proposition

**CONFIDENTIAL | FOR C-LEVEL REVIEW ONLY | MARCH 2026**

---

## 1. Background & Genesis

Rewardz originated from a simple observation: the loyalty gap between independent merchants and major chains is not a product problem — it is an infrastructure problem. Independent businesses lack the development resource, technical expertise, and operational bandwidth to build loyalty programmes that compete with those operated by chains such as Costa, Starbucks, and Tesco.

The initial concept emerged from examining the coffee shop sector, where the most common customer retention tool remains the paper stamp card. This is not a technology limitation — it is a deployment and economic model limitation. The merchant cannot justify the cost of a proprietary loyalty platform for a business turning over £80,000–£150,000 per year.

The insight driving Rewardz is that the solution is not a per-merchant loyalty app, but a **shared network infrastructure** — analogous to how Visa and Mastercard solved the problem of merchant payment acceptance by creating shared rails that any merchant could join at marginal cost.

---

## 2. The Problem Statement

### For Merchants

- Paper stamp cards are frictionless but generate zero data, zero analytics, and zero customer relationship.
- Proprietary digital loyalty apps cost £5,000–£50,000+ to build and require ongoing maintenance.
- Existing coalition platforms (e.g., Miconex) require BID or council-led activation — not available to individual businesses.
- Major chain loyalty programmes create habitual customer behaviour that independent operators cannot replicate.
- Independent merchants have no visibility of which customers are loyal, how frequently they visit, or when they churn.

### For Customers

- Loyalty cards fragment across multiple merchants — customers carry 8–12 cards and engage with fewer than 3 regularly.
- Rewards are slow to accumulate on a per-merchant basis — no incentive to discover new independent businesses.
- No cross-merchant value: being loyal to one independent shop generates no benefit at the independent shop next door.

---

## 3. The Rewardz Solution

Rewardz proposes a shared QR-based loyalty network in which any participating independent merchant can offer customers a standardised reward mechanism. Customers earn stamps or cash wallet credits **across all network merchants simultaneously**, creating a network effect that rewards loyalty to the independent sector as a whole rather than to any single business.

### 3.1 How It Works — Merchant Perspective

1. Merchant downloads the Rewardz merchant app on their existing smartphone (BYOD — no hardware cost).
2. A cryptographic QR code is displayed on the merchant's device at point of sale. The code cycles automatically every 30 seconds and is invalidated after each scan — preventing replay attacks and fraud.
3. Each customer scan triggers a micropayment from the merchant account (approximately 20p or 1% of transaction value). This is processed via Stripe Connect — the platform never holds merchant funds.
4. Weekly settlement: net payouts and charges are reconciled weekly, providing merchants with a clear, low-friction billing cycle.

### 3.2 How It Works — Customer Perspective

1. Customer scans the merchant's QR code using the Rewardz app (or browser link for first-time users).
2. A stamp is added to the customer's digital wallet. Stamps accumulate across all Rewardz merchants.
3. Upon reaching 10 stamps, the customer may redeem a free item at any participating merchant, or receive a cash wallet payout — the preferred model for platform liability reasons.
4. The cash wallet model eliminates the complexity of pooled free-item liability while preserving customer value perception.

---

## 4. Technology Overview

The platform is designed around a containerised microservices architecture deployed on cloud infrastructure (DigitalOcean DOKS — managed Kubernetes — is the recommended POC and launch platform).

| Component | Description | Key Technical Decision |
|---|---|---|
| **QR Token Service** | Generates cryptographic QR codes with 30-second HMAC-SHA256 time windows, post-scan invalidation, and replay protection. | HMAC cycling prevents static QR fraud; server-side invalidation prevents double-scan. |
| **Merchant App (BYOD)** | Native or PWA application for iOS/Android enabling NFC/QR display, scan logging, and settlement reporting. | Designed for existing staff devices; no proprietary hardware required. |
| **Customer Wallet App** | Customer-facing application for stamp accumulation, wallet balance, and reward redemption. | Supports first-scan onboarding via browser deep-link; no app pre-required. |
| **Payment Rail** | All merchant-to-platform financial flows routed via Stripe Connect. Platform operates as a marketplace facilitator. | Stripe Connect routing maintains FCA compliance; platform never holds funds as principal. |
| **Fraud Engine** | Real-time fraud detection on every scan event: velocity checks, device fingerprinting, anomaly detection. | Placed architecturally between QR validation and wallet earn — fraud check is structural, not optional. |
| **Cloud Infrastructure** | DigitalOcean DOKS (Kubernetes) for POC through launch. UK data centre. Portable to AWS/GCP at Series A. | Free control plane; CNCF-certified; £200 sign-up credit covers ~3 months. |

---

## 5. Market Positioning

Rewardz is positioned as **infrastructure for independent commerce**, not as a consumer loyalty app. The distinction is important: the target sales motion is B2B (merchant acquisition), the consumer experience is the product that retains the merchant, and the data layer is a future premium revenue stream.

### 5.1 Competitive Differentiation

| Factor | Rewardz | Paper Stamp Card | Proprietary App | Miconex / Coalition |
|---|---|---|---|---|
| **Merchant Cost** | ~1% per transaction | Near zero | £5k–£50k+ | BID/council fee |
| **Hardware Required** | None (BYOD) | Card printing only | Often yes | Varies |
| **Customer Data** | Rich (all transactions) | None | Yes | Limited |
| **Cross-merchant** | Yes — network effect | No | No | Yes |
| **Independent focus** | Yes — structural | N/A | No — chain focus | Partial |
| **Setup Time** | ~5 minutes | Immediate | Weeks–months | Months |

---

## 6. The Ethical Foundation

The founding team has codified **seven Covenants** — binding commitments that anchor the platform to its founding purpose as it scales. These are not marketing statements; they are proposed governance constraints designed to prevent the platform from evolving in ways that undermine the independent merchant community it serves.

- **Covenant I:** The platform will always prioritise independent merchants over chains and franchises.
- **Covenant II:** Merchant data will never be sold to third parties without explicit consent.
- **Covenant III:** Pricing changes will be communicated with a minimum 90-day notice period.
- **Covenant IV:** Early adopter pricing locks will be honoured in full.
- **Covenant V:** The platform will publish an annual community impact report.
- **Covenant VI:** Governance will include merchant representation at board level.
- **Covenant VII:** The platform will not accept investment from entities whose interests materially conflict with the independent merchant community.

The Covenants are documented in full in the Ethical Covenants Charter included in this document suite.

---

*Rewardz Ltd (Concept) | Confidential — Not for Distribution | March 2026*
