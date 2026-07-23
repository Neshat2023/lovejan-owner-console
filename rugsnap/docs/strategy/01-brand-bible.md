# Brand Bible — Book 1: Company Strategy, Brand Architecture, Positioning & Naming

**Company:** LoveJan, Inc. · **Current product:** RugSnap (rugsnap.app / rugsnap.com) · **Version:** 1.0 · **Research timestamp:** 2026-07-23 (all live domain checks 20:15–21:05 UTC)
**Companions:** operational strategy in [`../BIBLE.md`](../BIBLE.md) + [`../ARCHITECTURE.md`](../ARCHITECTURE.md); naming workstream detail in [`../brand/01–06`](../brand/); pending governance revision in [`../BIBLE-v1.1-REVISION-PLAN.md`](../BIBLE-v1.1-REVISION-PLAN.md). This document does not repeat their full text; it decides.

**Version history:** 1.0 (2026-07-23) — initial Book 1, produced under the founder's master assignment; no production code, payments, deployment, or schema changed.

---

## Executive summary

We are building a **trusted commerce platform for physical valuables**: instant AI appraisal → permanent item record → protected transaction. RugSnap stays as the rug-market wedge product; the platform underneath is category-neutral and already built that way. Recommended architecture: **endorsed hybrid converging to one universal parent brand** — never a family of "-Snap" apps. Recommended parent-name path: **Veluma** (primary, conditional on trademark clearance and .com acquisition), **Aestima** (backup; `aestima.app` verified available $9.99), **Valyt** (low-cost alternative; `valyt.ai` $160 + `valyt.app` $9.99 verified available). No purchase, rename, or rebrand now — the umbrella decision executes at a defined trigger (second vertical launch or institutional raise). The single most important strategic risk is not naming: it is proving unit economics and trust mechanics in the rug wedge before spending anything on breadth.

## Repository observations (Phase 1) — implementation status, honestly classified

Inspected: full source (`app.html`, `api/*`, `lib/`, `mobile/`, `docs/`, `vercel.json`, `package.json`), Supabase schema, Stripe wiring, deploy config. No code modified.

| Capability | Status |
|---|---|
| AI appraiser (Claude vision, 5 categories: rug/art/antique/electronics/collectible, JSON-schema output, EN/FA) | **Fully implemented** (live) |
| PWA + landing + i18n EN/FA (RTL) + share cards | **Fully implemented** |
| Listings with multi-photo (6), offers, Bazaar UI | **Fully implemented** |
| Subscriptions (Stripe Payment Links, yearly + weekly) | **Fully implemented, LIVE mode** |
| Marketplace money flow (checkout → delayed seller payout → buyer-confirm release; webhook + reconciliation-by-sync) | **Implemented & E2E-verified in Stripe TEST mode** |
| LIVE marketplace keys | **Configured but unverified** — live webhook exists; env-key swap awaits the founder |
| Shipping | **Partially implemented** — manual "mark as shipped" + tracking string; no labels/tracking webhooks |
| Scan quotas / abuse control | **Prototype-grade** — client-side only (flagged as gap G-cost in v1.1 plan) |
| Accounts/auth, item passports, ledger, disputes, comps, expert review | **Planned (documented), not implemented** |
| iOS (Capacitor wrapper) | **Scaffolded, not submitted** |
| Seed listings | **Mock/demo content** |

**Mismatch analysis:** the name says *rugs*; the code is already category-plural; the vision says *trust layer*; the implementation's trust ceiling is real (no accounts, no item verification, "escrow" wording legally overstated — correction pending founder approval D2). The gap between vision and build is known, sequenced, and documented — which is the healthy version of this mismatch.

**Assumptions & limitations declared:** this sandbox has no open web access (verified 2026-07-23: all outbound fetches except MCP tools return 403). Therefore: competitive facts = model knowledge (early-2026 cutoff), labeled *knowledge-based, currency unverified*; trademark/app-store/social status = **UNVERIFIED**; live-verified facts = repo contents + 50 registrar domain checks via Vercel API (timestamped). Nothing else is claimed as verified.

## First-principles business definition (Phase 3)

Six plausible definitions, scored (1–5) on customer urgency, revenue clarity, defensibility, ops burden (5=light), brand strength, fundraising story:

| Definition | Urg | Rev | Def | Ops | Brand | Fund | Σ/30 | Fatal weakness |
|---|---|---|---|---|---|---|---|---|
| AI identification tool | 3 | 2 | 1 | 5 | 2 | 2 | 15 | Commoditized by foundation models; no transaction |
| AI valuation assistant | 4 | 3 | 2 | 5 | 3 | 3 | 20 | Value estimate without market = opinion |
| Trusted appraisal platform (human+AI) | 4 | 3 | 3 | 3 | 4 | 3 | 20 | Services business economics |
| Vertical rug marketplace | 4 | 4 | 3 | 3 | 4 | 3 | 21 | TAM ceiling as end-state |
| Multi-category recommerce platform (day one) | 3 | 4 | 2 | 1 | 3 | 4 | 17 | Thin everywhere; liquidity death |
| **Trusted commerce platform for physical valuables** (AI appraisal + item records + protected transactions; rugs first) | 5 | 5 | 4 | 3 | 5 | 5 | **27** | Must earn trust claims operationally |

**Recommendation (High confidence):** the last definition. It answers the mandate's central questions: we are an AI company *in method*, a marketplace *in mechanism*, and a **trust company in essence**; we own the *trust and settlement* part of the value chain (identification alone is indefensible — Q14: when image AI is free everywhere, what remains is outcome-corrected valuation data, item records/provenance, protected settlement, and brand); the wedge is rugs; expansion-readiness lives in the platform, not the brand promise.

## Focus vs. expansion (Phase 4) — weighted matrix

Weights: trust/brand clarity 15 · liquidity/CAC 15 · AI accuracy & data quality 15 · operational burden (fraud/auth/shipping/insurance/returns) 20 · engineering complexity 10 · cross-category network effects 10 · fundraising story 5 · five-year defensibility 10 = 100.

| Strategy | Score/100 | Verdict |
|---|---|---|
| A — Rugs forever | 58 | Trust ✓, ceiling ✗ — TAM and estate-journey mismatch |
| B — Rugs → adjacent categories under one universal brand | 82 | Strong; requires parent brand at expansion time |
| C — Parent + Snap-family vertical apps | 47 | Fragmented equity, multiplied TM exposure, N-apps ops for a solo team, breaks estate UX |
| D — One platform, endorsed verticals | 80 | Strong; endorsement adds transition safety |
| **E — Hybrid: D now → B at scale** (rugs wedge on a category-neutral platform; endorsed transition; single universal brand end-state) | **86** | **Recommended (High confidence)** |

**Expansion gates (all must hold before any category launches):** per-category golden-set MdAPE ≤ 25% and calibrated confidence; trust-axis minimums configured (see three-axis model in v1.1 plan §2.4); moderation fixtures passing; one full staged transaction; rug-wedge health floor (dispute <2%, contribution margin ≥ $0). **Stop-metrics:** category MdAPE >35% for 60 days, dispute >4%, or fraud loss >2% GMV → freeze that category.

## Category expansion sequence (Phase 4b) — ranked with reasoning

Criteria: photo-identifiability, comps availability, avg. transaction value, fraud/auth tier, shipping difficulty, adjacency to current users, revenue potential.

1. **Rugs & carpets (now):** high identifiability, moderate fraud, heavy-but-solvable shipping, community distribution advantage — the wedge stays.
2. **Art & paintings:** same buyer psychology and estate co-occurrence; attribution risk handled by range+abstention; ships flat.
3. **Antiques & ceramics:** natural adjacency; ceramics gated on packaging/damage playbook (damage-claim flow is the real feature).
4. **Coins & currency + collectibles/memorabilia:** superb comps (graded populations exist), small parcels; counterfeit tier means slabs/graded items first, raw coins later.
5. **Furniture & vintage/designer objects:** demand exists (estate flows), but freight/white-glove logistics gate it — enter after a freight partner, not before.
6. **Watches (year 2+):** high value density, extreme counterfeit economics — only with expert-review mandatory above threshold + authentication partner.
7. **Jewelry (last):** stone verification is physical by nature; enters only with T3-equivalent partners.
**Not early:** anything requiring licenses (ivory/protected antiquities are prohibited outright), vehicles, real estate — different industries wearing similar clothes.
**Electronics:** stays an appraiser-funnel category; marketplace-gated on stolen-serial checking (v1.1 decision D5).

## Competitive landscape (Phase 8) — *knowledge-based, currency unverified; verify before external use*

| Group (examples) | Their strength | Their gap we exploit | Learn / avoid |
|---|---|---|---|
| Visual search (Google Lens) | Free, instant ID | No value, no market, no trust chain | Learn: zero-friction capture. Avoid: being a feature, not a company |
| Price databases (WorthPoint) | Data depth | Look-up ≠ transaction; dated UX | Learn: data compounding. Avoid: subscription-walled dead ends |
| Online human appraisal (ValueMyStuff, Mearto) | Credibility | Days + $$ + no marketplace | Learn: expert network as supply. Avoid: pure services margins |
| Auction houses (Sotheby's, Christie's, Heritage) | Ultimate trust, high end | 20–45% all-in fees, gatekeeping, weeks | Learn: provenance ritual. Avoid: intimidation UX |
| Vertical marketplaces (1stDibs, Chairish, Chrono24, Rebag, TheRealReal, Collectors/PSA) | Category trust mechanics | Dealer/consignment-oriented; the *individual inheritor* is unserved; take rates 20–50% | Learn: authentication-as-product (StockX/PSA lesson). Avoid: multi-app fragmentation |
| Horizontal (eBay, Etsy, FB Marketplace) | Liquidity | Zero item-level trust for valuables | Learn: liquidity gravity. Avoid: trust-free race to the bottom |

**Unoccupied position (the answer to "what should we become known for"):** *the ordinary owner/inheritor of a valuable object* — too small for Sotheby's, too fearful for eBay — served with instant valuation, an item record, and a protected sale at ~10%. No mapped competitor owns "know what it's worth, sell it safely" for individuals.

## Defensibility & data moat (Phase 9)

Ranked by durability when foundation models are commodity: (1) **confirmed transaction outcomes** (estimate vs. realized, per category) — collect from day one, we alone have it; (2) **expert-verified corrections** — every T2 review is labeled training data; (3) **item records/provenance chains** — switching cost that grows per sale; (4) seller reputation + fraud signals; (5) category taxonomies/condition grading; (6) liquidity + brand. **Not defensible:** raw scan photo piles (everyone has images), generic model access.
Consent split (binding, from v1.1 §2.8): storage consent at save; separate model-improvement consent with opt-out; sensitive evidence never public, never in training; anonymized aggregates for the price index. Legally collectible ≠ automatically collected — collect what compounds, not what accumulates.

## Brand architecture (Phase 5) — decision

Full option analysis in [`../brand/02`](../brand/02-brand-architecture-options.md) (scored 35/40 universal, 33/40 endorsed-hybrid, 15/40 Snap-family). **Decision: endorsed hybrid now → branded house at scale.** "Snap" is **not** retained as a naming convention (fragmentation + preliminary Snap Inc. adjacency risk — UNVERIFIED, in counsel scope). Trust transfers up (RugSnap earns → parent inherits); reputation risk also transfers — hence category launch gates.

```
<Parent — to be cleared & acquired at trigger>
├── RugSnap  (rugs wedge; later "RugSnap — by <Parent>"; kept indefinitely)
├── Categories inside the parent platform (art, antiques, coins, …) — never new -Snap apps
└── Shared infrastructure: Appraisal Engine · Item Records · Protected Payments · Bazaar
```

## Positioning (Phase 6)

- **Primary segments:** owners/inheritors of valuables (estate moment = highest intent); collectors; secondhand-valuables buyers. **Secondary:** dealers (consignment supply), appraisers (paid reviewers), later insurers (records/API).
- **Jobs:** functional — identify, value, sell, buy without loss; emotional — relief from fear of being cheated / of not knowing; trust — "prove this is real and my money is safe."
- **Alternatives & insufficiency:** guessing (free, terrifying), eBay (liquid, trustless), appraisers (credible, slow/$$), auction houses (trusted, exclusionary).
- **Category language:** "trusted commerce platform for physical valuables." **Value prop:** "Know what it's worth. Sell it safely." **Differentiation:** appraisal-backed listings, item records, three-axis trust, protected payment. **Reasons to believe:** the visible appraisal card, the attestation, delayed payout mechanics, published accuracy metrics (once earned — not claimed before).
- **Explanations —** 10-second: "Point your camera at a rug or an heirloom; we tell you what it is and what it's worth, and you can sell it safely on the spot." 30-second: adds how (AI + market evidence + protected payment) and for whom (inheritors, collectors, sellers). Investor: "Trust layer for the multi-hundred-billion-dollar valuables resale market: proprietary outcome data compounds into valuation authority; take-rate + verification revenue." Seller: "Free appraisal becomes your listing; you're paid when the buyer confirms delivery." Buyer: "Every listing carries its analysis; your money is held until you confirm." Expert: "We route paid reviews to you — your expertise, our demand."
- **Trust-language law (non-negotiable, inherits v1.1 §2.3):** *AI estimate* ≠ *market-price range* ≠ *expert appraisal* ≠ *authentication* ≠ *certified valuation* ≠ *final sale price* — each named exactly; banned unqualified words: "accurate," "guaranteed," "verified" (unless axis-specific and true), "escrow," "instant" for anything not actually instant. Base badge: **"AI-Assessed — Not Authenticated."**

## Mission, vision, principles (Phase 6b)

**Mission candidates scored** (clarity/emotion/decision-guidance/durability, 5 each): M1 "Remove fear from owning and trading physical valuables" **18/20 — selected** (names the emotion and the two acts; guides decisions: anything that adds fear is off-mission). M2 "Help the world know what its objects are worth" 14 (knowledge without safety). M3 "Make every valuable identifiable, valued, safely tradable" 16 (list-like). M4 "Bring truth to the value of things" 13 (abstract). M5 "Turn hidden value into confident trade" 14 (jargon edge).
**Vision candidates scored:** V1 "The trust layer for physical valuables" 16 (strategy shorthand, kept internally). V2 **"A world where no valuable object is unknown, unvalued, or unsafe to trade" — 18/20, selected** (a world-state, 10–20yr). V3 "Every object carries its verified story" 15. V4 "Global standard for valuing and trading valuables" 14 (standard-speak). V5 "Carfax for valuables" 12 (borrowed brand).
**Operating principles (8)** — each with meaning → violation-example → trade-off → implication, condensed: (1) **Trust before volume** — reject growth that imports fraud; slower GMV accepted; gates over growth-hacks. (2) **Explainability before certainty** — abstention is a feature; fewer wow-numbers; UI shows reasoning. (3) **Evidence over speculation** — comps or silence; costs coverage breadth; appraisals cite their basis. (4) **Human expertise where AI confidence ends** — appraisers are partners, not costs; margin shared; escalation paths built-in. (5) **Depth before expansion** — category gates enforced; TAM-envy resisted. (6) **Privacy by design** — evidence private-by-default; some virality sacrificed. (7) **Data quality before quantity** — labeled outcomes over scan piles; smaller numbers reported honestly. (8) **Reputation before revenue** — refund when wrong; short-term margin sacrificed; support empowered.

## Personality & voice (Phase 6c) — with required examples

Persona: *the expert friend* — knowledgeable, calm, honest about uncertainty, warm, never hype, never condescending, never falsely certain; authority medium-high, warmth high, sophistication worn lightly. Uncertainty is spoken plainly; disappointment delivered with dignity; fraud warnings are firm and specific; legal contexts drop warmth, never clarity.
Examples (EN; FA parity required in product): **Good result:** "Heriz carpet, Northwest Persia, c. 1940s. Similar rugs have sold for $2,800–$3,600. Confidence: high — the medallion, weave density, and palette all match." **Low confidence:** "This is a hand-knotted tribal rug, but these photos don't settle the region. We'd rather say 'not sure' than guess: add a photo of the back and fringe, or ask a human expert ($29)." **Listing prompt:** "Your appraisal card becomes the listing — buyers see the full analysis." **Buyer trust:** "Your payment is held until you confirm the item arrived as described." **Seller warning:** "List only what's yours to sell. False provenance leads to removal and payout holds." **Shipping risk:** "Rugs this size ship at ~40 lb. For items over $500 we recommend insurance — one lost parcel shouldn't end your story with us." **Dispute:** "The buyer reported a problem. Your payout is paused, not gone. Here is exactly what happens next, step by step." **Short ad:** "That rug in your living room? It might pay for your vacation. Find out in 30 seconds." **App-store description:** "Point your camera at a rug, painting, or antique. Learn what it is and what it's worth — then sell it safely, if you choose." **Homepage headline:** "Know what it's worth. Sell it safely."

## Naming framework (Phase 7) — weights defended, total 100%

| Criterion | Weight | Defense |
|---|---|---|
| Trademark defensibility | 12 | One-way door; a conflict later costs everything |
| Strategic alignment (trust+value+expansion) | 12 | The name must survive category ten |
| Distinctiveness | 12 | Search page-one and mental availability derive from it |
| Memorability | 10 | Spoken recommendation is our cheapest channel |
| Pronunciation & spelling (hear→type) | 10 | Voice/word-of-mouth loss is invisible and permanent |
| Trust/premium credibility | 10 | We handle money and heirlooms |
| Domain feasibility | 10 | Down-weighted from 15: the screen proved all strong .coms are held — this is a budget problem, not a filter |
| Category-expansion potential | 8 | Wedge-neutrality of the parent |
| Global/multilingual safety | 8 | EN/FA core + expansion markets |
| Search & app discoverability | 5 | Brand SEO accrues to any distinctive name |
| Visual/verbal identity potential | 3 | Real but designable around |

**Hard rejection rules:** famous-mark collision; direct same-space conflict; impossible spell-from-hearing; negative meaning in a core language; rug-locked semantics for a parent; generic-descriptive unprotectable; implies certified appraisal/authentication falsely; requires unrealistic domain acquisition; fails spoken-word test; trend-dependent (e.g., "-AI" suffix as identity). "Snap," "AI," "Labs," "Hub," "Market" suffixes: only with explicit strategic justification (none found).

## Names: generation, screening, results (Phases 8–10)

- **Longlist:** 78 serious candidates across 15 territories — full table in [`../brand/03`](../brand/03-name-longlist.md); scored inventory in [`01-brand-name-scorecard.csv`](./01-brand-name-scorecard.csv).
- **Screening rounds:** R1 strategic/linguistic rejections (famous-mark, slang, generic — 20 eliminated); R2 competitive/search collisions (Origyn, Worthy-adjacent, Trove-noise — 14); R3 domain feasibility (50 live registrar checks, 2026-07-23, method: Vercel registrar API; results below); R4 preliminary TM screen (**all UNVERIFIED** — knowledge-based risk tiers only); R5 founder-usability/pronunciation (FA spoken test applied); R6 architecture compatibility (parent-neutrality); R7 red-team (doc [`../brand/05`](../brand/05-final-name-decision.md) §red-team).
- **Semifinalists (12):** Veluma, Aestima, Valyt, Vitrine, Appra, Troveo, Bazara, Worthen, Heirly, Curion, Attesta, Veris — sub-scores in the CSV.
- **Finalists (3):** **Veluma · Aestima · Valyt.**

**Verified domain status (live, 2026-07-23, Vercel registrar API):**

| Finalist | .com | .ai | .app | Verified-available assets |
|---|---|---|---|---|
| Veluma | Registered (owner/status beyond registration: could not verify) | Registered | Registered | `getveluma.com` $11.25 |
| Aestima | Registered (same caveat) | Registered | **AVAILABLE $9.99** | `aestima.app` |
| Valyt | Registered (same caveat) | **AVAILABLE $160/2yr** | **AVAILABLE $9.99** | `valyt.ai`, `valyt.app` |

Labels per mandate: everything marked "Registered" = *registered; active-use/parked/resale status could not be verified from this environment*. No purchase initiated.

**Trademark knockout — LIVE, corrected with direct-domain visits (2026-07-23; full trail in brand/04 CORRECTION pass):** a first keyword pass wrongly cleared Valyt; visiting each domain directly overturned it. **All three finalists have active same-or-adjacent-space occupants:** **Valyt** → valyt.com = active ESG/financial-analytics consultancy; **Aestima** → active valuation surveyors + fintech (direct appraisal-space collision; "aestima" = Latin "to appraise"); **Veluma** → active branding creative lab. **No umbrella finalist survives clean.** Revised posture: adopt/spend on none; keep RugSnap; run a fresh naming sprint (professional namer + attorney, coined-word bias, screened on keyword search + direct-domain visit + TESS/WIPO) at the trigger. Method lesson recorded: a keyword-search miss is never "clean" — always visit the domain.

**Linguistic:** Veluma clean across the 12-language screen; Aestima drifts to "estima" in typing; Valyt collides orally with ولایت in FA/AR (needs native sign-off). Machine screening limits declared; native review mandatory.

## SEO & discoverability strategy (Phase 8b)

One domain, **subdirectories** (not subdomains — authority consolidates), structure: `parent.com/rugs` (RugSnap front door), `/l/{id}` listings (SSR + Product JSON-LD), `/p/{id}` opt-in item records, `/value/{category}/{type}` programmatic price guides **gated on ≥25 owned sold-data points per page** (thin-content rule), `/learn` editorial. RugSnap equity preserved via rugsnap.com/.app remaining live as the rugs door with staged 301s only at convergence (migration mechanics: [`../brand/06`](../brand/06-brand-migration-plan.md)). Branded search: distinctive parent owns page one in months (Veluma-class uniqueness); non-branded: category keywords belong to product/guide pages, never to the company name — exact-match domains explicitly de-prioritized. ASO: one app, parent-named at convergence, "rug appraisal" keywords retained in the listing copy. Rebrand quantification rule: any rename must project ≥12-month payback on migration cost (SEO dip + confusion) — which is why it waits for the trigger.

## Final recommendation (Phase 10) — and Founder Decisions

1. **What we are:** trusted commerce platform for physical valuables. 2. **First market:** rugs (unchanged). 3. **RugSnap:** remains the product/wedge name — **do not rename now**. 4. **Parent brand now?** No — prepare, don't launch; trigger = vertical #2 or institutional raise. 5. **Architecture:** endorsed hybrid → branded house. 6–8. Positioning/mission/vision as above. 9. **Parent name (revised twice 2026-07-23 after direct-domain visits — see brand/04 CORRECTION):** **none of the three finalists** — Valyt (active ESG-finance firm on valyt.com), Aestima (active valuation surveyors — direct collision), and Veluma (active creative lab) all have occupied names/domains. Keep RugSnap; run a fresh coined-word naming sprint with a professional namer + attorney at the trigger. 10. **Primary domain:** none acquired now; decided in that sprint. 11. **Defensive set:** parent .com/.ai/.app + valuma/velumah misspellings + getveluma.com. 12. **Alternatives:** Aestima, Valyt, Vitrine. 13. **Why Veluma wins:** only candidate simultaneously high on distinctiveness, breadth, premium-trust, and 12-language safety; rivals each carry a structural flaw (spelling tax / FA homophone / genericness), Veluma carries only an *unverified* one. 14. **What kills it:** an unfound prior commerce-class mark; an unreachable .com owner at any sane price. 15. **Legal verification required:** knockout searches + counsel opinion + Snap-adjacency review of RugSnap itself. 16. **Do immediately:** counsel engagement (bundle with D7), budget decision D6, keep collecting outcome data. 17. **Deliberately wait:** any purchase, any public umbrella use, any rename. 18. **Never do:** Snap-family expansion; buying a name before clearance; claiming "certified/authenticated" without the machinery. 19. **Evidence that changes this:** clearance failure (→ Aestima), zero brand budget reality (→ Vitrine's built-in FA meaning re-enters), estate-journey pivot (→ estate-territory naming). 20. **Confidence:** moderate (68/100 cap while trademarks unverified).

**FOUNDER DECISIONS REQUIRED:** FD1 approve strategy E + architecture (endorsed→universal); FD2 approve "prepare-don't-launch" umbrella posture; FD3 set domain-acquisition budget ceiling (D6); FD4 approve counsel engagement scope (D7 + naming knockout); FD5 confirm RugSnap continuity; FD6 (optional, ~$20 total, low-regret) approve defensive registration of `aestima.app` + `valyt.app` to hold both fallback paths — flagged as the only near-term spend proposed, **not executed without approval**.

## Red-team (Phase 11) — 16 mandated scenarios, one line each

Marketplace copies AI feature → our moat was never the model: outcomes+records+settlement survive. Model costs crash → margin improves; moat unchanged. Image ID commoditized → same. Estimates frequently wrong → abstention + calibration metrics + expert tier absorb; brand survives only if we published honesty first (principle 2). Fraud rises → three-axis trust + reserves + gates are the design for exactly this. Shipping claims rise → insurance default-on >$500 + damage playbook (ceramics gate). Users distrust AI prices → the range+evidence+abstention framing is the countermeasure; if it fails, human-review-first pivot (services margin accepted). Slow liquidity → dealer consignment + estate wedge; subscriptions fund patience. Domain expensive → launch on verified-available asset, broker in background (precedent: we ran on .app before owning .com). Attorney rejects Veluma → Aestima path pre-verified ($9.99 .app in hand if FD6). Expanded too early → stop-metrics trigger freeze; wedge unaffected. Too narrow too long → estate journey is the pressure valve (multi-category by nature). Rug buyers ≠ other buyers → per-category gates assume nothing transfers. Experts resist → they're paid supply (T2 revenue share), not displaced. Search engines demote AI content → our SEO is data-backed pages + transactional listings, not generated prose. App stores restrict claims → trust-language law already bans the words that trigger rejection.
**Weakest assumption:** H2 — that trust surfaces (not price/photos) drive buyer conversion. It is measurable within weeks of live GMV; if false, the trust ladder becomes back-office instead of front-of-store, and positioning shifts to convenience+protection.
**Fallback stack:** name → Aestima → Valyt → stay RugSnap-only longer; architecture → remain endorsed-hybrid indefinitely (never forced to converge).

## Open questions
Owner budget (FD3); counsel selection (FD4); native FA/AR review verdict on Valyt; veluma.com owner disposition (broker, at trigger); whether estate journey outperforms scan-share loop (analytics will answer).

## Sources & research method
See [`01-brand-research-sources.md`](./01-brand-research-sources.md). Live-verified: 50 domain checks (Vercel registrar API, 2026-07-23 20:15–21:05 UTC) + full repository inspection. Knowledge-based (currency unverified): competitive landscape, trademark adjacencies, linguistic screen. Unreachable from environment: USPTO/WIPO/EUIPO, app stores, social platforms, WHOIS/RDAP, web at large.
