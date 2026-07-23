# BIBLE v1.1 — Red-Team Revision Plan

**Date:** 2026-07-23 · **Status:** PROPOSED — awaiting owner approval. Nothing below is applied yet; no production code changes. On approval, BIBLE.md is revised to v1.1 and ARCHITECTURE.md gets companion edits.

Output order follows the owner's mandate: 1 Gap analysis · 2 Proposed BIBLE.md changes · 3 Proposed ARCHITECTURE.md changes · 4 Contradiction list · 5 Owner decisions required · 6 Execution backlog · 7 Exact files that would change.

---

## 1. Gap analysis

**G1 — Unproven claims presented as "Truths" (Bible §0).** "Fear is the dominant emotion," "the window is open now," "valuation+provenance+settlement owns the category" are strategic *hypotheses* with zero measured evidence from our own product. Risk: we build multi-quarter roadmaps on beliefs we never test. Fix: §2.1 below.

**G2 — "Escrow" is a legal exposure, live today.** The Stripe separate-charges-and-transfers flow is a *delayed seller payout* controlled by us; it is not a regulated escrow service, and neither we nor (to our knowledge) Stripe are licensed escrow agents for this. The **live app currently says "held safely in escrow"** in EN and FA strings, and BIBLE/ARCHITECTURE use "escrow" throughout. Unlicensed use of "escrow" is restricted in several states (e.g., California Financial Code). This is the highest-priority correction in the plan. Fix: §2.3; code sweep is Phase 0 task P0.1 (needs approval since it touches production strings).

**G3 — Single trust ladder conflates three different questions.** "Is the item what it claims?" (item confidence), "is the seller honest?" (seller trust), and "is my money safe?" (transaction protection) are independent. A T2-verified item from a fraudulent seller is still fraud. Also, T0 labeled "AI Estimate" on a badge can read as authentication. Fix: §2.4 three-axis model; "AI-Assessed — Not Authenticated" wording rule.

**G4 — Item Passport has no governance.** v1 defines transfer-on-sale but not: duplicate passports (two people scan the same rug), ownership disputes, stolen-item reports, transfer acceptance (buyer must accept, not auto-assigned silently), correction/appeal, public/private field split, redaction (receipts, addresses, serials), pseudonymous provenance, deletion vs. append-only history (tombstoning), and financial-record retention that overrides deletion. A self-created passport must never be represented as legal proof of title. Fix: §2.5 with explicit state machine.

**G5 — Event-sourcing overreach.** v1 §6 says "current state is a projection" — that is full event sourcing, operationally heavy for a solo operator (rebuild bugs, projection lag, debugging complexity). What we actually need now: append-only *audit log* (item_events) + append-only *money ledger*, with ordinary transactional current-state tables remaining authoritative. Fix: §2.6.

**G6 — Vision-model output treated as a valuation.** A model's number without market evidence is an educated guess. Missing: comparable-sales layer, abstention path, per-category accuracy metrics, calibration, and full versioning of the methodology. Also missing: honest sourcing plan for comps (our own outcomes are the only unencumbered source at first; third-party sold-price data has licensing/ToS constraints — marked legal/BD dependency). Fix: §2.7.

**G7 — Data rights absent.** No defined consent for storing scan photos, for using scans/outcomes to improve models, no training opt-out, no retention/deletion rules, no protection rules for sensitive evidence (receipts contain names/addresses). We operate from California (CCPA/CPRA applies to us as we grow; being under thresholds today is not a design excuse). Fix: §2.8.

**G8 — Legal/financial/operations blind spots.** No marketplace terms, appraisal disclaimer policy (exists in-app but not as governed policy), marketplace-facilitator sales tax posture, 1099-K awareness, returns/INAD policy, partial refunds, chargeback handling, payout reserves, new-seller payout delays (mentioned in ARCHITECTURE but not policy), lost/damaged shipments, shipping insurance, prohibited goods policy doc, counterfeit/stolen-property reporting, moderation appeals, support channel, admin dispute console, expert-review SLAs, seller suspension/appeal. Fix: §2.9 — with items requiring counsel explicitly marked rather than invented.

**G9 — No unit economics.** Nobody has computed whether a $1,000 sale makes money. Preliminary honest math (must be finalized in v1.1 with real Stripe pricing):
- GMV $1,000 · take 10% = **$100 gross revenue**
- Card processing on the full charge (platform pays it under separate charges): ≈ 2.9% + $0.30 ≈ **−$29.30**
- If buyer uses BNPL (Affirm/Klarna ≈ 6% + $0.30): ≈ **−$60.30** → take shrinks to ≈ **$39.40** before anything else
- Refund/chargeback/fraud reserve ≈ 1–2% GMV ≈ −$10–20 · AI inference ≈ −$0.15 · support amortized ≈ −$5
- **Contribution margin with BNPL can approach zero or go negative.** This was invisible until now. Fix: §2.10 with launch guardrails and stop-loss thresholds (e.g., review BNPL exposure when BNPL share > 30% of GMV or blended payment cost > 4.5%).

**G10 — North-star without guardrails.** "Confident Transactions" alone can be gamed by ignoring disputes/refunds. Fix: §2.11 guardrail set.

**G11 — No execution plan with acceptance criteria.** v1 has triggers but tasks lack acceptance criteria, rollback plans, and sizes. Fix: §6.

**G12 — Brand names assumed available.** Bible §2 casually names CoinSnap/WatchSnap/Neshat.AI as future options; none are verified for trademark or domain availability, and the "Snap" element itself carries adjacency risk to Snap Inc.'s SNAP marks for camera-centric software (preliminary, UNVERIFIED — needs counsel). Fix: §2.2 formal workstream; live findings in `/docs/brand/04`.

---

## 2. Proposed BIBLE.md changes (v1.0 → v1.1)

**2.1 §0 "Truths" → "Strategic Hypotheses."** Each gets: evidence-now / evidence-missing / validation experiment / success metric / failure signal / decision-that-changes. The four hypotheses:
- **H1 (Latent demand):** owners don't know values and want to. *Evidence now:* our own scan volume (small), search demand for "rug value" queries. *Experiment:* SEO landing + scan funnel for 60 days. *Success:* ≥1k organic scans/mo, scan→save ≥40%. *Failure:* scans stall despite traffic. *If false:* appraiser is a feature, not a wedge → pivot to B2B appraisal tooling.
- **H2 (Fear blocks trade):** trust surface is the marketplace's differentiator. *Experiment:* A/B listing pages with/without appraisal card + protection panel; measure buyer conversion. *Success:* trust surface lifts conversion ≥25% relative. *Failure:* price/photos dominate, trust surface irrelevant → invest in inventory/price tooling instead of trust ladder depth.
- **H3 (Trust trio owns category):* valuation+provenance+protected settlement compounds into a moat. *Experiment:* repeat-usage of passports (insurance doc exports, re-listing) in first 6 months. *Failure signal:* passports are write-once-never-read → passport becomes internal plumbing, not a product.
- **H4 (AI window):** instant vision valuation is newly possible and undefended. *Evidence now:* model quality (internal evals), absence of incumbent instant-appraisal products (verified only by market scan, dated). *Failure signal:* platform incumbents (eBay/Google) ship equivalent inline valuation → niche depth + outcome data is the only defense; accelerate category depth, abandon breadth.

**2.2 §2 Brand — add the Umbrella Brand Naming & Domain Workstream.** RugSnap remains the public wedge brand; platform stays category-neutral internally; **no umbrella name is selected in the Bible.** The workstream (now instantiated in `/docs/brand/01–06`) governs: naming criteria; .com availability (live-verified only); defensive domains; preliminary trademark screening with counsel sign-off required; App Store + social handle checks; EN/FA pronunciation; global-expansion linguistic risk; and the **selection trigger**: umbrella decision is made before (a) the second vertical's public launch or (b) the first institutional fundraise — whichever comes first. All names (including RugSnap derivatives and Neshat.AI) are treated as unverified until screened.

**2.3 Payment language — non-negotiable terminology rule (new, top-level).** The word **"escrow"** is banned from UI, marketing, docs, and code identifiers for the current Stripe implementation unless qualified counsel and the payment provider confirm otherwise in writing. Approved vocabulary: **"Protected payment"**, **"payment held until you confirm delivery"**, **"delayed seller payout"**, **"released after confirmed delivery."** FA equivalents: «پرداخت حفاظت‌شده»، «پول تا تأیید تحویل نزد سیستم می‌ماند» — not «اسکرو». Applies retroactively: Phase 0 sweep of app strings, BIBLE, ARCHITECTURE, MARKETPLACE.md, and PR/commit language going forward.

**2.4 §9 Trust — replace the single ladder with three independent axes.**
- **A. Item Confidence:** AI-assessed → evidence-backed → expert-reviewed → physically authenticated. Badge copy for the base tier is exactly **"AI-Assessed — Not Authenticated."**
- **B. Seller Trust:** identity/KYC status (Stripe-verified), completed transactions, dispute rate, account age, response/fulfillment history. Displayed as seller badge tiers.
- **C. Transaction Protection:** protected payment, tracked delivery, insurance, return/dispute eligibility, release status. Displayed as a protection panel on every checkout.
Listings show all three axes independently; no axis ever substitutes for another. Category launch gates reference axis A minimums; marketplace eligibility references axis B minimums; checkout always displays axis C.

**2.5 §6 Item Passport — governance model.** Explicit states: `unclaimed → self_claimed → evidence_backed → expert_reviewed`, orthogonal flags/transitions: `ownership_disputed`, `reported_stolen`, `transferred`, `archived`. Rules: passports are **records, never legal proof of title** (displayed disclaimer); duplicate detection by perceptual photo hash + attribute similarity with a merge flow (both claimants notified; unresolved → `ownership_disputed`, listing blocked); stolen-item reports freeze listing/transfer and follow a documented law-enforcement cooperation process (counsel-reviewed); transfers require buyer acceptance; corrections are append-only amendments with appeal path; every field classified public/private at schema level — receipts, addresses, serials, and personal data are private-by-default and redacted from public views; provenance chains display pseudonyms ("Owner #2, California") unless the owner opts into named display; deletion = tombstoning (public view removed, private personal fields erased/anonymized) while financial records required by law (orders, ledger) are retained for their statutory period (default 7 years, counsel to confirm).

**2.6 §5/§6 Events — audit log, not event sourcing.** `ledger` stays immutable append-only (money). `item_events` is an immutable **audit/history log**; `items`, `listings`, `orders`, `shipments` remain ordinary transactional current-state tables and are authoritative. Writes update state and append the event in the same transaction. Full event sourcing (state as projection) requires a future ADR demonstrating a need current tables cannot meet. Trade-off recorded: dual-write discipline vs. operational simplicity; chosen because replay/projection infrastructure has real failure modes and zero present benefit.

**2.7 §8 AI — evidence pipeline, abstention, and quality metrics.** Add stage **[2b] Comparable Sales & Market Evidence**: recent sold comparables with source + timestamp + geography, condition adjustment, rarity adjustment, evidence count, and per-estimate confidence derived from evidence density. Comps sourcing ladder: (1) our own realized sales (clean, owned), (2) licensed datasets/partnerships, (3) public auction records where legally permissible — scraping marketplaces against ToS is **not** a permitted source (legal dependency marked). The engine must support **abstention**: "Insufficient evidence to estimate reliably" with an expert-review path — abstention is a feature, not a failure. Per-category quality metrics tracked from day one: MdAPE, interval coverage, over/under-valuation bias, confidence calibration, expert disagreement rate, estimate-vs-realized, accuracy by price band. Versioned together: model, prompt, category schema, methodology, comps-source. A scan records all five versions.

**2.8 New §: Data Rights.** Explicit consent at scan-save for photo storage; separate, non-bundled consent for model-improvement use of scans/outcomes with opt-out honored everywhere it's legally required (and offered globally as policy); private-by-default appraisals (public only on explicit listing/passport publication); retention schedule per data class; sensitive evidence (receipts, IDs, addresses) encrypted at rest, never in public views, never in training data; deletion honored via §2.5 tombstoning with statutory-retention carve-outs.

**2.9 New §: Legal, Financial & Operations register.** A table of ~19 obligations (marketplace ToS; appraisal disclaimer; marketplace-facilitator sales tax; 1099-K (Stripe-issued for connected accounts — verify); returns; INAD disputes; partial refunds; chargebacks; payout reserves; new-seller payout delay policy; lost/damaged shipments; shipping insurance; prohibited goods; counterfeit/stolen reporting; moderation appeals; support channel + SLA; admin dispute console; expert-review SLAs; seller suspension/appeal). Each row: owner-policy vs. **REQUIRES COUNSEL/TAX REVIEW** flag — the Bible does not invent legal answers, it tracks that they are obtained.

**2.10 New §: Unit economics.** Per-transaction model with the variables from G9, computed at three GMV points ($100/$1,000/$5,000) × payment mix (card/BNPL). Launch guardrails: contribution margin per completed order must be ≥ $0 at blended payment mix by day 60 of live operation; stop-loss triggers: BNPL share >30% of GMV or blended payment cost >4.5% → payment-mix review; dispute+refund loss >3% GMV for 30 days → pause paid growth, tighten seller gates; support cost >15% of take for 60 days → automation sprint before scale.

**2.11 §12 Analytics — guardrail metrics around the north star.** Confident Transactions stays the north-star *candidate*, paired with: dispute rate, refund rate, chargeback rate, fraud-loss rate, delivery success, payout-release time, appraisal calibration, listing sell-through, time-to-first-offer, repeat buyer rate, repeat seller rate, scan→passport conversion, passport→listing conversion. A north-star move that degrades two or more guardrails is treated as a regression.

**2.12 New §: Execution plan** — summary in the Bible, full backlog in §6 of this plan.

---

## 3. Proposed ARCHITECTURE.md changes

1. Global terminology sweep: "escrow"/"soft escrow" → "protected payment (delayed seller payout)"; add the §2.3 rule as a hard constraint with a pointer to the Bible.
2. §5.3: add idempotency-keys task detail (already partially present), reference the unit-economics guardrails, and remove any "escrow" framing from the money narrative.
3. §5.2/§9: incorporate the comps layer, abstention path, metric suite, and five-way versioning from §2.7.
4. §6 data model: item_events described as audit log (not projection source); add passport states and public/private field classification; note duplicate-detection (photo perceptual hash) index.
5. §5.5: electronics policy — appraiser yes; marketplace listing for electronics gated on serial/IMEI stolen-device check integration (or excluded from marketplace until then) — resolves contradiction C4.
6. §8: add admin dispute console and support tooling to the ops roadmap; add SEO programmatic-page gate constant (N≥25 owned data points per page) — resolves C5.

## 4. Contradiction list (v1.0 internal)

- **C1:** "Escrow" everywhere vs. unlicensed reality → resolved by §2.3.
- **C2:** §6 event-sourcing ("state is a projection") vs. §5 "one mental model" simplicity → resolved by §2.6.
- **C3:** Trust ladder implies item verification at T0 vs. honesty-by-design principle → resolved by §2.4 wording rule.
- **C4:** Electronics as "traffic category" vs. trust-gated category doctrine (electronics = highest stolen-goods risk) → resolved by ARCH change 5.
- **C5:** Programmatic SEO "gated on data density ≥N" with N undefined → N=25 sold data points (initial value, tunable).
- **C6:** "No paid acquisition pre-unit-economics" vs. no unit-economics model existing → resolved by §2.10.
- **C7:** Automatic passport transfer vs. seller privacy (purchase history exposure) → resolved by §2.5 redaction + buyer-acceptance.
- **C8:** Bible API-first vs. ARCH "migrate opportunistically" → not a contradiction; precedence note added (Bible governs the principle, ARCH the pace).
- **C9:** §2 names Snap-family/Neshat.AI as if available vs. nothing verified → resolved by §2.2 workstream; preliminary Snap Inc. adjacency risk flagged (UNVERIFIED, counsel required).

## 5. Owner decisions required

| # | Decision | Default recommendation | Blocking |
|---|---|---|---|
| D1 | Approve this v1.1 plan (Bible+ARCH doc edits) | Approve | All doc edits |
| D2 | Approve Phase 0 production sweep of "escrow" strings (EN+FA) in app.html + api error copy | Approve — legal exposure is live | P0.1 |
| D3 | BNPL policy pending unit economics | Keep enabled, add >$2k BNPL review threshold, monitor guardrails | §2.10 |
| D4 | iOS subscription route (IAP vs external-link entitlement) | IAP on iOS, Stripe on web | TestFlight |
| D5 | Electronics on marketplace | Appraise-only until serial-check integration | ARCH change 5 |
| D6 | Umbrella-brand acquisition budget ceiling (informs which .com candidates are realistic) | Set a number (e.g., $5k / $20k / $50k) | brand/05 finalization |
| D7 | Engage counsel (marketplace ToS + payment terminology + CA compliance) | Yes — before Phase 2 ships disputes | §2.9 register |

## 6. Execution backlog

**Phase 0 — protect the current live product** *(days; all S/M)*
| Task | Reason | Dep | Schema | API | UX | Risk | Acceptance | Test | Rollback | Size |
|---|---|---|---|---|---|---|---|---|---|---|
| P0.1 Terminology sweep (app strings EN/FA, docs) | Live legal exposure (G2) | D2 | — | — | copy only | legal | zero "escrow" occurrences in UI/docs | grep + visual EN/FA | revert commit | S |
| P0.2 /api/analyze server-side quota + IP rate limit | Open costly endpoint | — | scans_quota or KV | analyze 429 path | quota msg | cost abuse | 3rd free scan blocked server-side; >N/min/IP throttled | unit + load | flag off | M |
| P0.3 Idempotency keys (checkout, transfers) | Double-pay prevention | — | — | headers | — | money | duplicate webhook/retry → single effect | replay test | keys are additive | S |
| P0.4 Daily reconciliation cron + stuck-order alert | Catch webhook gaps | P0.3 | — | cron route | — | money | seeded drift detected & emailed <24h | fixture drift | disable cron | M |
| P0.5 ToS / Privacy / Disclaimer pages | Store + Stripe + CCPA baseline | D7 (counsel-marked) | — | — | footer links | legal | pages live, linked, versioned | copy review | static revert | M |
| P0.6 Supabase PITR + storage backup + restore drill | DR | — | — | — | — | data loss | documented restore < 60 min, drilled once | drill | n/a | S |

**Phase 1 — identity, scans, financial integrity, notifications** *(weeks)*
| Task | Reason | Dep | Size | Key acceptance |
|---|---|---|---|---|
| P1.1 Supabase Auth (email OTP + Apple) + device-merge | Everything downstream | P0 | L | two-device merge works; RLS user-isolation tests pass; money endpoints JWT-verified |
| P1.2 `scans` table + history UI | Data moat starts | P1.1 | M | every analyze writes scan row (5 versions recorded, §2.7) |
| P1.3 `ledger` append-only + backfill | Money truth (G5-safe scope) | P0.4 | M | every past+new money event has ledger row; reconciliation reads ledger |
| P1.4 Transactional email (offer/sold/shipped/release-reminder) | Liquidity leak (offers unseen) | P1.1 | M | events → emails in staging; unsubscribe works |
| P1.5 analytics_events table + guardrail dashboard v0 | §2.11 | — | S | weekly query pack runs |

**Phase 2 — shipping, disputes, passport foundations** *(weeks)*
| Task | Dep | Size | Key acceptance |
|---|---|---|---|
| P2.1 Shippo labels + tracking webhook + delivery state | P1 | L | staging label→delivered→auto-release-timer E2E |
| P2.2 Dispute state machine + INAD flow + admin console v1 | P1.3, D7 | L | all transitions tested; illegal transitions rejected; console actions audited |
| P2.3 `items` + `item_events` + passport states + migration from listings | P1.1 | L | old listings become items losslessly; states enforced; duplicate-detect flags seeded dupes |
| P2.4 New-seller payout delay + reserves policy engine | P1.3 | M | first-3-sales delay enforced; configurable |

**Phase 3 — trust axes & expert review** *(weeks)*
| Task | Dep | Size | Key acceptance |
|---|---|---|---|
| P3.1 Three-axis trust UI (badges + protection panel) | P2.3 | M | axis independence rendered; "AI-Assessed — Not Authenticated" copy exact |
| P3.2 Evidence upload (private-by-default) + redaction | P2.3 | M | public views never leak private fields (test suite) |
| P3.3 Expert-review pilot (manual routing, SLA tracked) | P3.2 | S–M | 10 paid reviews completed; disagreement rate recorded |
| P3.4 Comps layer v0 (own outcomes only) + abstention | P1.2 | L | abstention fires below evidence threshold; MdAPE dashboard live |

**Phase 4 — category expansion & umbrella trigger** *(quarter+)*
Category launch gates (eval ≥ target, trust-axis minimums, moderation fixtures, staging transaction) applied to art/antiques first; umbrella-brand decision executes per §2.2 trigger; electronics marketplace revisited per D5.

## 7. Exact files that would change

**On D1 approval (docs):** `rugsnap/docs/BIBLE.md` (→ v1.1), `rugsnap/docs/ARCHITECTURE.md` (companion edits), `rugsnap/docs/MARKETPLACE.md` (terminology).
**On D2 approval (production):** `rugsnap/app.html` (i18n strings EN/FA), `rugsnap/api/orders/*.js` + `rugsnap/api/checkout.js` (user-facing copy only), later Phase-0/1 files per backlog.
**Already created (this workstream, docs-only):** `rugsnap/docs/BIBLE-v1.1-REVISION-PLAN.md` (this file), `rugsnap/docs/brand/01…06` (naming workstream).
