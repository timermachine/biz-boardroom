# REWARDZ
## Risk Register

**CONFIDENTIAL | FOR C-LEVEL REVIEW ONLY | MARCH 2026**

---

## Risk Assessment Framework

| Parameter | Scale |
|---|---|
| **Likelihood** | 1 = Unlikely · 2 = Possible · 3 = Probable |
| **Impact** | 1 = Low · 2 = Significant · 3 = Critical |
| **Risk Rating** | Likelihood × Impact: 1–2 = Low · 3–4 = Medium · 6 = High · 9 = Critical |

---

## 1. Regulatory & Legal Risks

| ID | Risk | L | I | Rating | Mitigation |
|---|---|---|---|---|---|
| **R01** | FCA SPI registration rejected or delayed, preventing legal fund handling. | 2 | 3 | **6 — HIGH** | Engage specialist FCA counsel at Day 0. Stripe Connect routing reduces principal fund-holding exposure significantly. Assess Small Payment Institution vs Registered Account Information Service Person pathway. |
| **R02** | GDPR breach through inadequate data handling architecture. | 2 | 3 | **6 — HIGH** | Privacy-by-design: PII classification on all customer data nodes at architecture level. Data minimisation policy. DPO appointed or contracted before launch. |
| **R03** | Merchant agreement inadequacy — terms unenforceable or ambiguous on pooled liability. | 2 | 2 | **4 — MEDIUM** | Standardised merchant agreement drafted by legal counsel. Covers: transaction fees, settlement terms, data usage, termination, early adopter lock-in mechanics. |
| **R04** | Consumer credit / e-money regulation triggered by cash wallet model. | 2 | 2 | **4 — MEDIUM** | Legal opinion commissioned on cash wallet classification. 0.001p nominal cash value mechanism used by all major UK loyalty platforms as legal protection — assess applicability. |

---

## 2. Technology & Security Risks

| ID | Risk | L | I | Rating | Mitigation |
|---|---|---|---|---|---|
| **T01** | QR code replay attack — customer presents previously scanned code to earn unauthorised stamps. | 2 | 2 | **4 — MEDIUM** | Cryptographic QR cycling: 30-second HMAC-SHA256 time window + immediate post-scan server-side invalidation. Used token list maintained server-side. |
| **T02** | BYOD merchant device loss — staff phone with authenticated merchant session falls into third-party hands. | 2 | 2 | **4 — MEDIUM** | Session timeout (15-minute inactivity); remote session revocation via admin panel; transaction velocity alerts on merchant account; biometric lock requirement for merchant app. |
| **T03** | Customer app spoofing — customer device mounts fake merchant scan responses to earn stamps fraudulently. | 2 | 3 | **6 — HIGH** | All stamp earn events validated server-side against known merchant QR token state. Client app cannot self-grant stamps — all events are server-authorised. |
| **T04** | Infrastructure outage — cloud provider downtime prevents merchant scanning. | 2 | 2 | **4 — MEDIUM** | Multi-availability-zone deployment; offline grace mode (stamps queued locally, synced on reconnect with server-side deduplication); SLA monitoring. |
| **T05** | API key or credential compromise. | 1 | 3 | **3 — MEDIUM** | Secrets management (Kubernetes secrets / Vault); no credentials in source code; automated credential rotation; penetration testing pre-launch. |

---

## 3. Commercial & Market Risks

| ID | Risk | L | I | Rating | Mitigation |
|---|---|---|---|---|---|
| **C01** | Merchant cold-start failure — insufficient merchants to create network value at launch. | 2 | 3 | **6 — HIGH** | Minimum 20 committed merchants before consumer app launch. Founder-led acquisition. 90-day free period for founding cohort reduces adoption risk. |
| **C02** | Consumer adoption below viable threshold. | 2 | 2 | **4 — MEDIUM** | Frictionless first-scan (browser deep-link, 30-second signup). Founder-led in-venue activation. Social proof campaign. Network effect value proposition ('earn everywhere'). |
| **C03** | Well-capitalised competitor enters market within 6 months. | 2 | 3 | **6 — HIGH** | First-mover speed strategy. Early adopter lock-ins prevent displacement. Merchant installed base is sticky — switching has operational cost. Data advantage compounds with time. |
| **C04** | Unit economics validation failure — model does not perform as projected. | 2 | 2 | **4 — MEDIUM** | Week 15 Go/No-Go gate based on research programme. Minimum viable economics defined pre-research. Pivot optionality maintained: platform architecture is vertical-agnostic. |
| **C05** | International expansion failure (US/China) by Month 6 target. | 3 | 1 | **3 — MEDIUM** | International entry by Month 6 is aspiration with risk. Define minimum viable international presence — a signed partner agreement qualifies. Full operational entry may require Month 12+. |

---

## 4. Operational Risks

| ID | Risk | L | I | Rating | Mitigation |
|---|---|---|---|---|---|
| **O01** | Key person dependency — platform critically exposed to individual founder departure. | 2 | 3 | **6 — HIGH** | Role documentation from Day 0. IP assignment agreements. Vesting schedule with cliff. Identify and recruit at least one additional technical co-founder before MVP build. |
| **O02** | Merchant churn post-lock-in expiry. | 2 | 2 | **4 — MEDIUM** | Build platform value that exceeds lock-in obligation. Analytics dashboard, promotional tools, and network value should make renewal the default decision. |
| **O03** | Negative press / brand incident (e.g., data breach, fraud event). | 1 | 3 | **3 — MEDIUM** | Incident response plan before launch. Data breach notification procedure (ICO 72-hour requirement). PR / crisis communications protocol. |

---

## 5. Risk Summary Matrix

| Rating | Risks |
|---|---|
| 🔴 **6 — HIGH** | R01, R02, T03, C01, C03, O01 |
| 🟡 **4 — MEDIUM** | R03, R04, T01, T02, T04, C02, C04, O02 |
| 🟢 **3 — MEDIUM-LOW** | T05, C05, O03 |

No risks are currently rated **Critical (9)**. Six risks are rated **High** and require active mitigation before launch.

---

*Rewardz Ltd (Concept) | Confidential — Not for Distribution | March 2026*
