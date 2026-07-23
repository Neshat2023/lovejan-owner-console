# The LoveJan Bible — Product & Architecture

**Company:** LoveJan, Inc. · **First brand:** RugSnap · **Date:** 2026-07-23 · **Status:** Master document.
**Rule:** every product and technical decision either follows this document or amends it (with a dated entry in §14). The technical deep-dive companion is [`ARCHITECTURE.md`](./ARCHITECTURE.md); where they conflict, the Bible wins.

---

## 0. First principles — and every assumption challenged

We start from what is physically true about the problem, not from what we happen to have built.

**Truths:**
1. The world is full of physical valuables whose owners don't know what they're worth — rugs, art, antiques, watches, jewelry, coins, collectibles, furniture, instruments, memorabilia.
2. The dominant emotion in secondhand valuables is **fear** — sellers fear being lowballed, buyers fear fakes. Fear is why high-value items rot in closets instead of trading.
3. Valuation + provenance + safe settlement remove that fear. Whoever owns those three owns the category.
4. Vision AI made instant, cheap, good-enough valuation possible for the first time (~2024). The window is open now; it will not stay open.

**Assumptions we inherited from v1 — challenged one by one:**

| # | Inherited assumption | Challenge | Verdict |
|---|---|---|---|
| A1 | "The appraisal is the product" | The appraisal is a *trust primitive*. The product is the **confident transaction**, and the durable asset is the **item's permanent record** | **Reframe.** Core entity becomes the **Item Passport** (§6) — the appraisal, listing, and sale are events in an item's life, not the center of the model |
| A2 | "This is a rug app" | Rugs are the wedge, not the walls. Every mechanism (valuation, trust ladder, escrow, passport) is identical across categories; only per-category knowledge differs | **Platform is category-agnostic by design** (§6 category configs); rugs remain the go-to-market wedge (§3) |
| A3 | "AI alone can appraise" | Photo-only AI has a fraud ceiling that varies wildly by category (low for furniture, extreme for watches/jewelry) | **Trust ladder** (§9): AI is tier 0 of a four-tier verification system; categories launch only at the tier their fraud level demands |
| A4 | "Marketplace take-rate is the business" | It's the *first* business. The valuation dataset and passport network have independent B2B value (insurers, estates, dealers, auction houses) | Take-rate stays primary; architecture is **API-first** (§7) so B2B is configuration, not a rewrite |
| A5 | "One consumer persona" | The highest-intent moment for valuables is **inheritance/estate** ("what is all of this worth?"), plus dealers sitting on inventory with no tech | Journeys (§4) cover five personas; estate batch-scan is a first-class flow, not an edge case |
| A6 | "RugSnap is the company name" | A rug brand selling watches creates dissonance | Brand architecture decision in §2 — wedge brand now, umbrella decision deferred to an explicit trigger |

---

## 1. Long-term company strategy

**Mission:** remove fear from owning and trading physical valuables.
**Ten-year ambition:** the **trust layer for physical valuables** — the default answer to "what is this worth, is it real, and how do I sell it safely?" — the way Carfax became the default answer for used cars.

**Strategy in one sentence:** dominate one fear-heavy niche (Persian/oriental rugs), perfect the trust machinery there, then replicate category-by-category on the same platform, compounding a proprietary dataset (estimate vs. realized price, per category) that no entrant can copy.

**Why niche-first (alternatives considered):**
- *All-categories-at-once* (a "Google Lens for value"): maximal TAM, zero depth; valuation quality would be mediocre everywhere, and marketplaces die without liquidity density. **Rejected.**
- *B2B-first* (appraisal API for insurers): revenue sooner, but no consumer brand, no data flywheel from sales outcomes. **Rejected as first move; kept as year 2–3 expansion.**
- *Niche-first consumer* (chosen): slow TAM, but achievable liquidity, real outcome data, defensible brand. History sides with this (eBay via collectibles, Amazon via books, StockX via sneakers).

**Category expansion sequence** (each gated by the §9 trust ladder and §5.2 eval quality, not by calendar):
1. **Rugs & carpets** (now) — high value, low counterfeiting sophistication, community density, we have unfair distribution advantage.
2. **Art & antiques + furniture** (already in the appraiser) — same buyer psychology, moderate fraud tier.
3. **Coins & collectibles** — huge community, grading standards already exist (PCGS/NGC) to anchor against.
4. **Watches & jewelry** — highest value density and the biggest prize, but extreme counterfeit risk: launches **only** with tier-2+ verification (expert review) mandatory above a price threshold.
5. **Electronics** stays a traffic/utility category (high scan volume, thin margins, low emotional moat) — it feeds the funnel, we don't build depth there.

**Five-year effects of this strategy:** the dataset moat (§8) compounds only if outcomes are captured from day one — which is why the Item Passport and event log are non-negotiable foundations even while the product looks like a simple scanner today.

---

## 2. Brand architecture

**The tension:** RugSnap is a superb wedge name (memorable, does-what-it-says, SEO-exact for the niche) and a terrible umbrella name (a watch collector will not trust "RugSnap").

**Options:**

| Option | Pros | Cons | Long-term effect |
|---|---|---|---|
| (a) Stretch RugSnap to everything | One brand, no migration | Dissonance outside rugs; caps the ceiling | Brand becomes the bottleneck at exactly the moment of success |
| (b) **House of brands on one platform** — RugSnap, CoinSnap, WatchSnap… same engine, same account, per-vertical skins | Each vertical gets a native-feeling brand; "Snap" family is coherent; platform cost is shared | More marketing surfaces to maintain; cross-brand trust must be engineered (shared passport/reputation) | Each vertical can dominate its niche; the family converges under a quiet parent later |
| (c) New umbrella now (e.g., Neshat.AI, or a new name) | Clean slate | Throws away RugSnap's momentum pre-traction; umbrella naming before product-market fit is vanity | Premature abstraction — the branding equivalent of microservices on day one |

**Decision:** **(b)**, executed lazily. RugSnap remains the only public brand until a second vertical earns launch (trigger: first category passing eval-quality + trust-tier gates with ≥ pilot demand). The platform, code, schema, and internal naming are brand-neutral **starting now** (`Item Passport`, `Appraisal Engine`, `Bazaar` as the marketplace layer). Corporate parent stays LoveJan, Inc. The `Neshat.AI` domain is held in reserve as a possible parent-brand asset, not used yet.
**Consequence for engineering:** no user-visible string, table name, or API path may assume "rug" — category is data, not code (§6).

---

## 3. Product strategy

**The product ladder** (each rung monetizes and feeds the next):

1. **Instant Appraisal** (live) — the wow moment and top of funnel. Free×2, then subscription. *Job-to-be-done: "tell me what this is and what it's worth, in 30 seconds, without judgment."*
2. **Item Passport** (build next) — every scan becomes a permanent, private item record: photos, appraisal history, evidence, documents. *JTBD: "keep proof of what I own"* — unlocks insurance documentation and estate use cases with zero marginal AI cost.
3. **Bazaar** (live, hardening) — passport-backed listings with escrow. *JTBD: "sell it without being cheated / buy it without being fooled."*
4. **Verification services** (later) — expert review, authentication, condition reports as paid upgrades on any passport (§9).
5. **B2B & data** (year 2+) — dealer consignment tooling, appraisal API, valuation index licensing.

**Positioning against alternatives:**

| Alternative | Their weakness | Our wedge |
|---|---|---|
| eBay / Facebook Marketplace | Zero trust infrastructure for valuables; listing is a photo + hope | Every listing carries a structured appraisal + attestation + escrow |
| Auction houses / dealers | 20–50% total take, weeks of friction, intimidating | 10% and 30 seconds to a valuation; dealers become partners (consignment), not only competitors |
| Human appraisers | $150+, days, scarce | We're free-to-cheap and instant — and we *hire the appraisers* into tier-2 review instead of fighting them |
| Google Lens / generic AI | Identifies, doesn't value, no marketplace, no trust chain | Depth per category + transaction rails + outcome-corrected valuations |

**Pricing philosophy:** subscriptions price the *utility* (appraisals); take-rate prices the *outcome* (a safe sale); verification prices *certainty*. Never charge for trust basics (escrow, passports) — those are the moat, not the margin.

---

## 4. The complete user journeys

The emotional spine of every journey is the same: **suspicion → evidence → confidence → action**. Every screen must answer "why should I trust this?" before it asks anything.

**J1 — Curious owner (the wedge):** sees a share card or searches "what is my rug worth" → lands (SEO/SSR page) → scans in <30s, no signup → result card with *range not point* (a point estimate reads as fake precision; a range with reasoning reads as honest) → share card offered → 3rd scan hits paywall.
*UX notes:* camera-first, zero forms pre-wow; Farsi/RTL first-class. *Failure mode to design against:* a wildly wrong valuation screenshot going viral — confidence display and "AI estimate, not a certified appraisal" framing are product features, not legal fine print.

**J2 — Seller:** result card → "List it" → photos (label/back/close-ups), price anchored by the range → attestation checkbox (deliberate friction: signing something changes behavior) → Stripe onboarding (the hardest step — do it *after* the listing is composed, sunk-cost keeps completion up) → offers/sale notifications → ship with label (§ARCHITECTURE 5.4) → escrow release → **realized price recorded into the passport** (the moment the data moat grows).

**J3 — Buyer:** discovers listing (SSR page from search/share) → trust surface: appraisal card, trust-tier badge, seller signals, escrow explainer ("your money is held until you confirm") → checkout (Stripe, BNPL enabled) → tracked delivery → confirm/dispute window → passport *transfers* to buyer, provenance chain +1. The transfer is the retention hook: buyers become users automatically.

**J4 — Estate/inheritance (highest-intent moment in the category):** batch mode — walk the house, scan 30 items in one session → a valuation report (PDF/share link) of everything → per-item: sell / keep / get expert review. *Why first-class:* one estate event = dozens of scans, several listings, and an emotionally grateful user; executors are also the natural buyers of expert review.

**J5 — Dealer/consignor (B2B seed of liquidity):** bulk import inventory → passports + listings at scale → dashboard of offers/sales → negotiated fee tier. Solves the marketplace cold-start with professional supply (§ARCHITECTURE 2).

---

## 5. System architecture

**Chosen shape: modular monolith on managed services, API-first, event-logged.**

```
Clients:  Web/PWA (canonical) · iOS/Android wrappers · future B2B dashboard
             │  (all through the same versioned API — no private paths)
API:      /api/v1/* on Vercel functions — auth, quotas, idempotency at the edge
Modules:  Identity · Passport · Appraisal Engine · Marketplace · Trust ·
          Shipping · Notifications   (folders/modules, ONE deployable)
Events:   append-only item_events + ledger (money) — the audit spine
Data:     Supabase (Postgres + RLS + Storage) · Stripe (custody/KYC) ·
          model-agnostic AI gateway (§8)
Public:   SSR edge pages for listings/passports/price pages (SEO, §10)
```

**Why, alternatives, trade-offs:**
- *Microservices:* *rejected* — a solo-operated company gains nothing from distributed systems except distributed failures. Long-term effect of the monolith: one deploy, one log stream, one mental model; module boundaries (not network boundaries) keep a future split possible if a real team arrives.
- *Full framework rewrite now (Next.js):* *deferred* — thresholds in ARCHITECTURE §10 govern this; the single-file app is still an iteration-speed asset. SSR needs are met by small edge functions.
- *Own auth/payments/search infra:* *rejected permanently* — buy trust, build differentiation (ARCHITECTURE §4.1).
- *Event log:* *accepted despite being "extra" for today's size* — passports, provenance, reconciliation, and analytics all read from it; retrofitting an audit spine after money and provenance disputes exist is archaeology. This is the single most future-load-bearing choice in the document.

---

## 6. Data model — the Item Passport at the center

**The reframe (from A1):** v1's chain was `scan → listing`. The Bible's model:

```
users ─┬─ items (THE PASSPORT: owner, category, attributes jsonb, status)
       │     └─ item_events (append-only: created, scanned, evidence_added,
       │          listed, price_changed, sold, transferred, verified, disputed)
       │     └─ scans (model, prompt_ver, result jsonb, confidence, cost)
       │     └─ evidence (photos, receipts, certificates, serials)
       ├─ listings (item_id, price, status)         ── a sale-intent view of an item
       ├─ orders → ledger (append-only money events) + shipments
       └─ reputation (derived, never stored as raw truth)
categories (config rows: attribute schema, prompt module, fraud tier,
            trust-tier requirements, shipping profile, fee structure)
```

**Key decisions:**
- **Category as configuration** — per-category attributes live in `items.attributes jsonb`, validated against the category's JSON schema. *Alternatives:* rigid columns per category (schema migration per vertical — unscalable); EAV tables (query hell). *Trade-off accepted:* JSONB is less queryable than columns; mitigated with generated columns/indexes for the few hot fields (price, era, maker). *Long-term:* launching "watches" = inserting a category row + prompt module + eval set. No fork.
- **Passport transfer on sale** — ownership history becomes a provenance chain. *Long-term:* the second sale of the same item on-platform is the network effect made visible.
- **Append-only discipline** — `item_events` and `ledger` are never updated or deleted; current state is a projection. *Trade-off:* more rows, slightly harder queries; *why it wins:* disputes, audits, and the valuation index are all replayable history questions.
- **Migration path from v1:** current `listings` rows become `items` + `listings` retroactively; `device_id` merges into `users` per ARCHITECTURE §5.1. No data thrown away.

---

## 7. API design

**Principles:** one versioned surface (`/api/v1/`), resource-oriented, JWT (Supabase) auth, idempotency-key required on all money mutations, cursor pagination, uniform error envelope (`{error: {code, message, hint}}`), webhooks *out* for B2B later. Internal clients use the public API — dogfooding guarantees the B2B product already works.

Core resources: `scans`, `items`, `items/{id}/events`, `items/{id}/evidence`, `listings`, `offers`, `orders` (+ `/ship`, `/confirm`, `/dispute`), `sellers`, `categories`, `me`.

*Alternatives:* GraphQL (*rejected:* caching/complexity cost exceeds benefit for our shapes); RPC-style ad-hoc endpoints, which is what v1 has (*accepted short-term, migrated opportunistically* — each endpoint moves to `/v1` as it's next touched; a hard mass-rename ships nothing user-visible and risks everything).
*Long-term effect:* versioning from day one means the iOS app, B2B clients, and old PWA caches never break on evolution.

---

## 8. AI architecture

**Pipeline, not a prompt:**

```
photo(s) → [1 Triage]  cheap model: category, photo quality, retake guidance
         → [2 Specialist appraisal]  per-category prompt module (versioned) + schema output
         → [3 Safety/moderation]  counterfeit signals, prohibited items (same call)
         → [4 Confidence & routing]  low confidence or high fraud-tier → human review queue
```

**Decisions & trade-offs:**
- **Model-agnostic gateway:** all calls through one internal interface with model name, prompt version, cost, and latency logged per scan. *Why:* over five years, models will change many times; the durable assets are the **prompt modules, eval sets, and outcome data** — never the model choice. *Trade-off:* a thin abstraction to maintain; kept to one file's worth of discipline.
- **Right-sizing:** triage on a small model, appraisal on the best vision model *per category as proven by evals* — never downgraded on cost alone. Appraisal quality is the brand; COGS levers are quotas and caching first (ARCHITECTURE §9).
- **Eval-gated changes:** golden set per category (~100 items with expert-known values) + regression run on every prompt/model change; deploy blocked on quality drop. *Long-term:* the eval corpus + realized-price feedback is the beginning of proprietary model advantage — at ~10k outcome-labeled sales, fine-tuning becomes a real option with data no one else has.
- **Honesty by design:** output is a range + reasoning + explicit confidence; the UI never renders fake precision. Low confidence is shown, and *is the upsell* to expert review.

---

## 9. Trust & verification strategy — the heart of the company

**The Trust Ladder** (badge on every listing and passport):

| Tier | Name | What it means | Cost to user | Required for |
|---|---|---|---|---|
| T0 | AI Estimate | Vision appraisal, confidence shown | Free | Any listing |
| T1 | Evidence-backed | Serials, hallmarks, receipts, certificates attached & AI-cross-checked | Free | High-value listings (threshold per category) |
| T2 | Expert-reviewed | Vetted human appraiser reviews the passport | ~$29–79 by category | Watches/jewelry above threshold; optional elsewhere |
| T3 | Physically authenticated | Partner lab/authenticator inspects the item | Category-priced | Ultra-high-value; year 2+ |

**Why a ladder and not one bar:** a single verification standard is either too weak for watches or too heavy for furniture. Fraud economics differ per category; the ladder prices trust to risk. *Long-term:* T2/T3 turn appraisers/authenticators from threatened incumbents into supply-side partners earning on our platform (the StockX lesson).

**The rest of the trust surface:** escrow with delivery-proof auto-release; dispute state machine; seller reputation from delivered/disputed history (badge tiers, not raw stars); AI moderation on every listing (prohibited/counterfeit/sanctions signals → human queue); provenance chain from passport transfers; the attestation signature. Sanctions compliance mirrors Stripe's supported-country list — we never hand-roll sanctions logic (ARCHITECTURE §5.5).

---

## 10. SEO & discoverability

**Thesis:** in valuables, search intent is *pre-transactional* ("heriz rug value", "how to sell inherited persian rug", "is my rolex real"). Owning those questions feeds every journey — and increasingly the searcher is an AI assistant, not a person.

**Program (in order of leverage):**
1. **SSR listing pages** `/l/{id}` + **opt-in public passports** `/p/{id}` with `Product`/JSON-LD markup — the transactional surface (ARCHITECTURE §5.6).
2. **Programmatic value pages** from our own data: per category × type × era ("Heriz rugs, 1940s — sold range on RugSnap"), generated from real outcomes; thin-content risk managed by only publishing pages backed by ≥N data points.
3. **AI-assistant optimization:** llms.txt, clean semantic markup, being *citable* — five-year bet: assistants answering "what's my rug worth?" should answer "RugSnap says…". Our robots.txt already welcomes AI crawlers (deliberate, decided 2026-07).
4. **Editorial authority** (care guides, buying guides) — last, because it's the least defensible.
*Trade-off:* programmatic SEO before outcome-data volume risks thin content penalties — hence gated on data density, not on ambition.

---

## 11. Growth

**Loops before channels; density before breadth.**

| Loop | Mechanism | Why it compounds |
|---|---|---|
| Share-card | Every appraisal mints a shareable "worth $X" card | The wow moment is inherently social; CAC ≈ 0 |
| Passport transfer | Every buyer automatically becomes a passport-holding user | Marketplace transactions *create* users |
| Estate moment | J4 batch scans → one event seeds dozens of items + several sellers | Highest-LTV entry point; SEO-ownable ("inherited rug worth") |
| Dealer consignment | One partnership = shelf-fulls of trusted supply | Solves cold-start; dealers bring their own buyers |

**Geographic density strategy:** valuables + shipping anxiety = local trust matters. Win LA/Orange County (Persian community, our home turf) before spending a dollar on breadth. *Alternative rejected:* paid acquisition pre-unit-economics — burns cash to learn what loops teach for free.
**Guardrail metric:** scan→listing conversion. If scans grow and listings don't, we have a toy, not a marketplace — fix supply UX before buying demand.

---

## 12. Analytics

- **North-star: Confident Transactions** — count and GMV of escrow-completed sales. Everything else is an input: scans → passports → listings → orders → releases.
- **Event taxonomy** mirroring the journeys (`scan_started/completed`, `paywall_viewed/converted`, `listing_published`, `offer_made`, `order_paid/shipped/released/disputed`, `passport_transferred`) written to our own `analytics_events` table (append-only, like everything else).
- **Stack:** own events table + Vercel analytics now; PostHog when funnels/cohorts outgrow SQL. *GA4 rejected:* privacy weight and trust-brand dissonance for a product whose story is "we don't play games with you." *Trade-off:* owning events means owning retention queries — acceptable; the weekly owner dashboard (ARCHITECTURE §8) is the consumer.
- **Per-category accuracy tracking** (estimate vs. realized) is both an analytics view and the AI feedback loop — one pipeline, two customers.

## 13. Testing

Inherits ARCHITECTURE §12 wholesale (unit on money/state machines, golden-set evals, staging E2E in Stripe test mode, Playwright visual EN+FA/RTL, quarterly chaos drills), extended by Bible-scope gates:
- **Category launch gate:** a vertical ships only with its golden-set eval ≥ target, trust-tier rules configured, moderation fixtures passing, and one full staging transaction in that category.
- **Journey regression:** J1–J3 as scripted E2E; J4 batch flow when built.
- **Trust-surface tests:** badge correctness per tier, dispute transitions, provenance chain integrity after transfer.

## 14. Decision log

- **2026-07-23 — Bible v1.** Item Passport reframe (A1); category-as-configuration (A2); trust ladder (A3); API-first for B2B (A4); estate journey first-class (A5); brand: house-of-brands deferred behind wedge trigger (A6); modular monolith + event log; analytics stack owns its events; category launch gates defined. Companion ARCHITECTURE.md remains the technical deep-dive.
