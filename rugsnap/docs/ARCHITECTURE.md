# RugSnap — Architecture & Strategy Document

**Owner:** LoveJan, Inc. · **Author:** drafted with Claude (CEO-advisor mode) · **Date:** 2026-07-23
**Status:** Living document. Update on every architectural decision; each major change gets a dated entry in the Decision Log.

---

## 1. Executive summary

RugSnap is two products that feed each other:

1. **The Appraiser** — point a camera at a rug, artwork, antique, electronic, or collectible; Claude vision returns identification, era, materials, and a value range in ~20 seconds. Free hook (2 scans), then subscription ($49/yr with trial, $4.99/wk).
2. **The Bazaar** — a marketplace where the appraisal card *is* the listing. Stripe Connect escrow (10% fee, 7% for Pro), buyer-confirms-receipt release.

The strategic bet: **appraisal-backed trust** is the wedge that lets a tiny marketplace compete with eBay/Facebook Marketplace in high-value secondhand categories where buyers fear fakes and sellers fear lowballs. Nobody else attaches a structured AI appraisal + provenance attestation + escrow to every listing.

Five-year ambition: **the trust layer for secondhand valuables** — starting with Persian/oriental rugs (a community we understand, concentrated in Southern California), expanding category by category, accumulating a proprietary dataset no competitor has: *estimated value vs. realized sale price*.

---

## 2. Strategy: why this can win

### The moats we are building (in order of durability)

| Moat | What it is | Why it compounds |
|---|---|---|
| **Outcome data** | Every sale records estimate vs. realized price | Feedback loop makes our valuations better than any model-only competitor; after ~10k sales this is unreplicable without our history |
| **Trust infrastructure** | Appraisal card + attestation + escrow + (future) verified shipping | Marketplaces are trust businesses; features are copyable, earned trust is not |
| **Community brand** | Rugs first, Farsi-native UX | Niche dominance beats broad mediocrity; the Persian rug community is tight-knit and referral-driven |

### Revenue evolution (deliberate sequencing)

1. **Now:** Subscriptions (live today) — funds operations, validates willingness to pay.
2. **Next:** Marketplace take rate (10%/7%) — the real business; GMV compounds.
3. **Later:** Premium services — human expert review upsell (~$29), authentication certificates, shipping margin, insurance referrals, "RugSnap Price Index" data products.

**Why this order:** subscriptions monetize the appraiser before liquidity exists; take rate needs listings×buyers; premium services need brand authority. Each stage funds the next.

### The liquidity cold-start plan

A marketplace with no inventory dies quietly. Mitigations, cheapest first:
- Seed listings from our own network (done — demo seeds; replace with real consignments).
- **Consignment partnerships with LA/OC rug dealers** — they have inventory and no tech; we have tech and no inventory. Their stock becomes our supply overnight.
- Share-loop: every appraisal generates a share card ("my rug is worth $X") — the appraiser is the top of the marketplace funnel.
- Do NOT spend on paid acquisition until scan→listing conversion is measured and acceptable.

---

## 3. Current architecture (v1 — honest inventory)

```
┌─ Browser / PWA (app.html, single file, EN+FA) ──────────────┐
│  camera → /api/analyze → result card → sell → Bazaar        │
└──────────────────────────────────────────────────────────────┘
        │                      │                       │
   Vercel functions       Supabase (rwloxdnjfwsgetzkuras)   Stripe (LoveJan acct)
   /api/analyze (Claude   listings, offers, orders,     Payment Links (subs)
     opus vision)         seller_accounts + Storage     Connect Express (market)
   /api/checkout, webhook  (listing-photos, public)     separate charges+transfers
   /api/orders/* (escrow)  RLS on, service key server   = soft escrow, 10% fee
   /api/connect/* (onboard)
```

- **Hosting:** Vercel (rugsnap project), domains rugsnap.app (canonical www) + rugsnap.com (308 redirect). Firewall on, AI bots allowed, robots.txt + sitemap live.
- **Identity:** anonymous `device_id` in localStorage. No accounts.
- **Payments state:** Stripe account fully activated; subscriptions live; marketplace webhook (live) configured; env keys swap to live pending.
- **Mobile:** Capacitor iOS wrapper scaffolded (server.url → rugsnap.app), TestFlight pending.
- **What is intentionally primitive and fine for now:** single-file frontend (zero build step = fastest iteration for a solo founder + AI pair); no framework; localStorage quotas; manual shipping.

**Verdict:** correct architecture for month one. Sections below define what changes, *when*, and *why* — most upgrades are triggered by thresholds, not dates.

---

## 4. Guiding principles

1. **Buy trust, build differentiation.** Stripe does money custody, Supabase does data, Vercel does infra. We build only what makes us different: appraisal quality, listing trust, escrow UX.
2. **Boring tech, few moving parts.** One person operates this. Every new system must be justified against "can the owner debug it at 2am."
3. **Data is the product.** Never discard an appraisal, a sale outcome, or a user correction. Schema decisions favor append-only history.
4. **Web is canonical; apps are wrappers.** One codebase serves web/iOS/Android. Native-only features (push, camera polish) come through the wrapper, not a fork.
5. **Rewrite triggers, not rewrite dates.** We migrate architecture when a measurable threshold is crossed (below), not because a pattern is fashionable.

---

## 5. Domain architecture (current → target, with reasoning)

### 5.1 Identity & accounts — **the #1 strategic debt**

- **Current:** `device_id` only. Lose the phone → lose listings, orders, Pro status. Cannot build reputation, disputes, or cross-device sync. Acceptable pre-revenue; unacceptable once real money flows.
- **Target:** Supabase Auth — email OTP first (lowest friction, no passwords), then Sign in with Apple (required for App Store anyway) and Google. `users` table; `device_id` becomes a *session attribute*, with a one-time merge flow ("claim this device's history").
- **Why Supabase Auth and not a third party (Clerk/Auth0):** already in our stack, free tier generous, RLS integrates natively (`auth.uid()` in policies), one fewer vendor. Trade-off: fewer enterprise features — irrelevant for consumer.
- **UX notes:** never gate the appraiser behind signup (the wow moment must stay frictionless). Require auth only at the money moments: publishing a listing, buying, subscribing. Prompt: "Save your appraisals — add your email."
- **API impact:** all `/api/orders/*` and `/api/checkout` switch from trusting `deviceId` in the body to verifying a Supabase JWT. Backwards-compat window where both are accepted, then device-only is read-only.
- **Data model impact:** `users(id, email, created_at)`; add `user_id` FK (nullable during migration) to `listings`, `orders`, `seller_accounts`, `scans`. Migration backfills by device merge.
- **Test plan:** unit-test the merge (two devices → one account; conflicting Pro states pick the more generous); RLS tests that user A cannot read user B's orders; E2E: signup → publish → buy from second account.
- **Trigger to start:** immediately after live payments are verified. This precedes everything else in §5.

### 5.2 Appraisal engine — the moat

- **Current:** one Claude vision call, JSON-schema output, five categories, results stored inside listings only.
- **Target (phased):**
  1. **Store every scan** in a `scans` table (input photo hash, model, prompt version, full JSON result, latency, cost) — even non-listed ones. This is the dataset.
  2. **Outcome capture:** when an order completes, record `realized_price` next to the estimate. When a listing sells fast/slow, that's signal too.
  3. **Eval harness:** a fixed set of ~100 reference items with known values; every prompt/model change runs the eval before deploy. Prevents silent quality regressions — valuation accuracy *is* the brand.
  4. **Human-in-the-loop premium:** "Expert review — $29" queues the scan for a human appraiser (marketplace of vetted appraisers, we take a cut). Differentiator + revenue + training data.
- **Why not fine-tune now:** volume too low; prompt+eval iteration is cheaper and reversible. Revisit at ~10k outcome-labeled scans.
- **Cost/abuse control (urgent):** `/api/analyze` is an open, expensive endpoint. Move free-scan quota server-side: key on device_id now, user_id post-auth; hard per-IP rate limit at the edge; daily spend alarm. A scraper hammering this endpoint is a real financial risk today.
- **API impact:** `/api/analyze` gains quota check + `scan_id` in response; new `/api/scans` (history).
- **Data model impact:** `scans` table as above; `listings.scan_id` FK.
- **Test plan:** golden-set eval in CI (assert schema validity + value-range sanity); quota tests (3rd free scan blocked, Pro unblocked); load test at 10 rps.

### 5.3 Marketplace & money — correctness over features

- **Current:** separate charges + transfers ("soft escrow"), webhook + sync fallback, buyer-confirms release with `source_transaction`. Sound design; missing the operational hardening around it.
- **Target:**
  1. **Ledger table (append-only):** every money event (charge, fee, transfer, refund, dispute) written as an immutable row with Stripe IDs. The `orders.status` column becomes a *projection* of the ledger, never the source of truth. **Why:** five years of financial questions ("why did seller X get $Y in March?") are answerable only with a ledger; retrofitting one later is archaeology.
  2. **Daily reconciliation cron:** compare Stripe's records against ours; alert on any drift (stuck pending > 24h, transfer without order, amount mismatch). Catches the bugs webhooks miss.
  3. **Idempotency keys** on every Stripe mutation (checkout create, transfer) keyed on order id — retries must never double-pay.
  4. **Refund & dispute flow:** buyer "item not as described" → freeze release → owner dashboard decision (refund buyer / release to seller / partial). Stripe handles the money mechanics; we need the state machine: `disputed → refunded | released`.
  5. **Auto-release timer:** if buyer neither confirms nor disputes within N days of delivery (once tracking exists), release automatically. Without this, forgetful buyers strand seller money — the #1 support burden of escrow marketplaces.
  6. **Risk posture:** high-ticket rugs = chargeback exposure. Keep Stripe Radar on, delay first-sale payouts for new sellers (e.g., release+3 days for first 3 sales), cap listing price for unverified sellers.
- **Trade-off considered — destination charges vs. separate charges:** destination charges simplify refunds but put the platform fee logic inside Stripe's model and complicate multi-currency later; separate charges (current) keep custody explicit and support the escrow narrative. Staying with separate charges.
- **API impact:** `/api/orders/dispute` (new), `/api/admin/*` (owner console, auth-gated), cron endpoints (Vercel cron).
- **Data model impact:** `ledger(id, order_id, type, amount, currency, stripe_ref, created_at)`; `orders` gains `disputed_at`, `auto_release_at`.
- **Test plan:** state-machine unit tests (every legal/illegal transition); reconciliation test with seeded drift; idempotency test (double-fire webhook → single ledger row); full E2E in test mode monthly.

### 5.4 Shipping — the missing half of escrow

- **Current:** honor system ("mark as shipped" + optional tracking string). Escrow without delivery proof is half-built: release decisions rest on memory and goodwill.
- **Target:** Shippo (or EasyPost) integration: seller buys a label in-app (we pass through cost or take small margin), tracking number auto-attached, webhook updates order to `delivered`, auto-release timer starts from delivery.
- **Why Shippo first:** better multi-carrier pricing for consumer parcels, simple API, no monthly minimum. Trade-off: EasyPost has better international coverage — revisit when cross-border volume exists.
- **UX notes:** rugs are heavy/odd-sized; label flow must support weight/dimensions with sensible category defaults (a 9×12 rug ≈ 40 lb, rolled). Insurance option surfaced by default above $500 value.
- **API impact:** `/api/shipping/rates`, `/api/shipping/label`, Shippo webhook receiver.
- **Data model impact:** `shipments(order_id, carrier, tracking, label_url, cost, insured_value, status, delivered_at)`.
- **Test plan:** Shippo test mode E2E; delivered-webhook → auto-release-timer unit test; oversize/overweight edge cases.

### 5.5 Trust & safety — table stakes before scale

- **Listing moderation:** we already run Claude on every listed item (the appraisal) — extend the same call to flag: counterfeit indicators, prohibited categories (ivory, protected antiquities, weapons), stolen-goods signals, sanctioned-origin issues. Zero extra API cost; it's one more output field. Flagged listings → owner review queue, not auto-publish.
- **Sanctions scope:** "anywhere without sanctions" is enforced primarily by Stripe (they block sanctioned geographies at onboarding/payment). Our layer: block listing locations in sanctioned regions at publish time. Do not build custom sanctions logic — mirror Stripe's capability list.
- **Reputation (post-auth):** seller rating = delivered orders, dispute rate, response time. Shown as a simple badge tier, not raw stars (small marketplaces get poisoned by single bad ratings).
- **Test plan:** prohibited-item fixture set through the moderation prompt; policy regression tests whenever the prompt changes.

### 5.6 Discovery, SEO, and sharing — the free growth engine

- **Problem:** listings render client-side → invisible to Google and unfurl as blank cards in iMessage/WhatsApp. For a marketplace, listing pages *are* the SEO surface (see: every eBay item ranking).
- **Target:** server-rendered listing pages `/l/{id}` — an edge function that reads Supabase and returns full HTML with OG image (the item photo), title ("Heriz rug, c.1940 — $3,200 on RugSnap"), and JSON-LD `Product` schema. The interactive app links in; crawlers and link previews get real content.
- **Why an edge function and not a framework migration:** ~100 lines, no build-system change, delivers 90% of the SEO value. Full framework migration is a separate decision (§10).
- **Also:** sitemap.xml becomes dynamic (listing URLs), `llms.txt` describing the site for AI assistants, share cards for appraisals (`/a/{scan_id}` public opt-in page) — every share is an acquisition channel.
- **Test plan:** Lighthouse SEO ≥ 95 on listing pages; unfurl checks in Slack/iMessage/WhatsApp; Search Console monitoring.

### 5.7 Notifications — the retention layer

- **Current:** none. An offer arrives → seller never knows. This silently kills marketplace liquidity.
- **Target (in order):** transactional email first (Resend; offer received, item sold, shipment updates, release reminders) — email exists pre-auth via seller_email. Then web push (PWA) and APNs via the wrapper. SMS only for shipping-critical events, later.
- **Why email first:** highest deliverability-to-effort ratio; every marketplace event already has an email address attached.
- **Test plan:** template snapshot tests; event→email unit tests; unsubscribe compliance (CAN-SPAM).

### 5.8 Mobile

- **Current:** Capacitor wrapper pointing at production web. Right call: one codebase.
- **⚠️ App Store risk to resolve before submission:** Apple requires In-App Purchase for digital subscriptions purchased *in-app*. Our Stripe Payment Links inside the iOS wrapper risk rejection (guideline 3.1.1). Options: (a) US External Purchase Link entitlement (post-2024 rules; Apple still takes a reduced commission and the UX is clunky), (b) implement IAP for the sub on iOS only (StoreKit via Capacitor plugin; Apple's 15% Small Business rate) and keep Stripe on web, (c) make the iOS app appraisal-free + marketplace-only, monetizing subs on web. **Recommendation: (b)** — cleanest approval odds; the marketplace's *physical goods* checkout may legitimately use Stripe (physical goods are exempt from IAP).
- **Android:** later; PWA install covers Android acceptably meanwhile.

---

## 6. Data model — target state

```
users(id, email, created_at, pro_until, locale)
scans(id, user_id?, device_id, category, result_json, model, prompt_ver, photo_hash, created_at)
listings(id, user_id?, device_id, scan_id, category, title, price_usd, photos jsonb,
         city, note, meta, facts, appraisal jsonb, status, flagged, created_at)
offers(id, listing_id, amount_usd, buyer_email, status, created_at)
orders(id, listing_id, buyer/seller ids, amount_usd, fee_usd, status,
       stripe_* ids, disputed_at, auto_release_at, timestamps…)
ledger(id, order_id, type, amount, currency, stripe_ref, created_at)   -- append-only
shipments(id, order_id, carrier, tracking, label_url, cost, status, delivered_at)
seller_accounts(device_id/user_id, stripe_account_id, charges_enabled, …)
```

Migration discipline: every change via `apply_migration` with a named migration; never destructive edits; nullable-first, backfill, then constrain.

---

## 7. Security architecture

| Layer | Now | Required next |
|---|---|---|
| Secrets | Vercel env vars only; never in code or AI context (established boundary: owner personally handles `sk_live_`/`whsec_`) | Quarterly key rotation ritual; separate restricted Stripe key for read-only jobs |
| Data access | RLS on; service role server-side only | RLS audit via Supabase advisors after auth lands; policy tests in CI |
| Endpoints | Open `/api/analyze` (cost risk) | Server-side quotas + per-IP rate limits (edge middleware) |
| Money | Webhook signature verified; sync fallback | Idempotency keys; ledger; reconciliation alerts |
| Platform | Vercel firewall (DDoS + malicious-client rules working — verified via traffic log); no secrets in deploy dir (verified) | Attack-mode runbook; admin console behind auth + 2FA |
| Compliance | Stripe = PCI + KYC + sanctions | Privacy policy & ToS pages (required for App Store + Stripe); data-deletion endpoint (CCPA — we're in California) |

---

## 8. DevOps & reliability

- **Environments:** today prod-only with Stripe test/live switch by env var. Add a `staging` Vercel project pointing at a Supabase branch + Stripe test keys — E2E tests run there, not against production. Trade-off: slight duplication vs. sleeping at night; worth it once real money flows.
- **CI (GitHub Actions):** on PR — schema-validate app.html JS (a smoke Playwright run like our headless verifications), API unit tests, appraisal golden-set eval. Merge blocked on green. Today's manual Playwright verification becomes the CI script.
- **Backups/DR:** enable Supabase PITR; weekly storage snapshot of listing-photos; documented restore drill (do it once, time it).
- **Observability:** Vercel logs + a tiny `/api/health` (checks Supabase, Stripe, quota spend) polled by a free uptime service; alerts to email. Metrics that matter weekly: scans, scan→listing %, listings, GMV, stuck orders, analyze cost, error rates.
- **Runbooks in `/docs`:** webhook outage, stuck order, Stripe dispute, key rotation, restore-from-backup. Written when calm, used when not.

---

## 9. Performance & cost

- Static-first frontend on CDN — already excellent (single HTML, no framework payload). Keep total JS < 150KB as a budget.
- Photos: client-side downscale exists for extras; apply the same ≤1600px pipeline to the appraisal cover; Supabase image transforms (`?width=`) for grid thumbnails so the Bazaar grid doesn't pull full-size images. This is the #1 real-world load cost as listings grow.
- Claude cost: opus vision per scan is the dominant COGS. Levers in order: quota enforcement (§5.2), model right-sizing (evaluate Sonnet for first pass + Opus only for high-value categories — *only* if the golden-set eval shows parity), prompt caching for the fixed system prompt.
- Supabase: current free/low tier fine to ~10k listings; index `listings(status, created_at)` and `orders(status)` before they matter.

---

## 10. Rewrite triggers (thresholds, not dates)

| Migration | Trigger | Target |
|---|---|---|
| Single-file app.html → framework (Next.js on Vercel) | 2nd developer joins, OR file > ~8k lines, OR SSR needs outgrow the `/l/{id}` edge function | Incremental: keep app.html serving `/app`, build new surfaces in Next, migrate screen-by-screen |
| Anonymous → accounts | **Now** (post live-keys) | §5.1 |
| Manual shipping → Shippo | First 10 real sales | §5.4 |
| No CI → CI | Before accounts migration (it touches money paths) | §8 |
| Email → push notifications | iOS app approved | §5.7 |
| Prompt-only appraiser → eval-gated | Before any model/prompt change post-launch | §5.2 |

---

## 11. Open decisions (owner input needed)

1. **iOS subscription monetization** — recommend IAP-on-iOS/Stripe-on-web (§5.8b). Alternative: US external-link entitlement. Decide before TestFlight submission.
2. **Expert-review marketplace** (human appraisers) — high differentiation, real ops burden (vetting, SLAs). Recommend: pilot manually (owner routes to 1–2 known appraisers by email) before building anything.
3. **Category expansion pace** — five categories already strain valuation quality. Recommend: measure per-category accuracy via outcomes before adding more; better to be *the* rug authority than mediocre at everything.
4. **International seller payouts** — Stripe Connect supports ~45 payout countries; expanding beyond US sellers multiplies KYC/tax complexity (1099-K handling is US-only today). Recommend: US sellers / worldwide buyers until GMV justifies the ops.

---

## 12. Test strategy (summary)

- **Unit:** order state machine, fee math, quota logic, merge logic.
- **Golden-set eval:** appraisal quality gate in CI (§5.2).
- **E2E (staging):** scan → list → buy → ship → release, in Stripe test mode, monthly and pre-release.
- **Visual:** headless Playwright screenshots per PR (already our practice) for the app's key screens, EN + FA/RTL.
- **Chaos drills (quarterly):** kill the webhook secret in staging → verify sync fallback; restore a backup; replay a duplicate webhook.

## 13. Decision log

- **2026-07:** Separate charges + transfers over destination charges (custody clarity). Payment Links for subs (speed over API elegance). Vercel+Supabase+Stripe stack. Single-file frontend retained deliberately. Domains: rugsnap.app canonical, rugsnap.com redirect. Firewall verified healthy; robots/sitemap shipped. Multi-photo listings (6 max, client-side compression).
