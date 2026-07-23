# RugSnap Bazaar — payments, escrow, shipping & compliance roadmap

How "offers are just messages" becomes real, money-moving transactions. This is a plan,
not shipped code. Sources were current as of research in July 2026.

## TL;DR

- **Payments:** Stripe **Connect (Express)** + **separate charges & transfers** + an
  **application fee** (RugSnap's 10% / 7% Pro). This keeps buyer money inside Stripe's
  regulated balance and out of RugSnap's own bank account — which is what keeps us from
  being classified as an unlicensed **money transmitter**.
- **Escrow:** No licensed escrow service for v1. Build **"soft escrow"**: hold the buyer's
  payment in the platform balance, release the transfer to the seller only after tracking
  shows **delivered** + a per-category **inspection window** closes.
- **Shipping:** **Shippo** for labels + tracking webhooks; **third-party insurance**
  (Shipsurance / U-PIC) for rugs and art, because FedEx/UPS cap art/antique liability
  around $1,000.
- **Cross-listing:** eBay Sell APIs work for **electronics/collectibles** only — **eBay and
  Etsy ban Iranian/Persian-origin rugs outright**. Best Buy's marketplace is invite-only
  (Mirakl); its Products API is useful only as an electronics **pricing reference**.
- **Scope (owner decision):** global — **everywhere Stripe supports, which excludes sanctioned
  countries**. Rugs are **included**; Stripe Connect enforces the non-sanctioned-country rule and
  OFAC screening for us, and a seller "origin & authenticity" attestation is captured at listing
  time. Importing *new* Iranian-origin rugs into the US stays off the table; appraisal is
  unrestricted.

## Payment model (Stripe Connect)

| Account type | Fit |
| --- | --- |
| Standard | Weak — seller is merchant of record, we lose fee/escrow control |
| **Express** ⭐ | **Best** — Stripe-hosted seller KYC, light build, we control fee + hold |
| Custom | Overkill for a solo founder |

- **Charge pattern:** *separate charges + transfers* — buyer pays the platform account,
  funds sit in our Stripe balance, we create a `Transfer` to the seller later. This is what
  gives real hold-and-release control.
- **Application fee:** our take-rate (10% / 7% Pro).
- **Chargeback liability:** with this model, **RugSnap owns chargeback risk** — the
  delivery-gated release window below is the main defense against "item not received" /
  "not as described."
- **Payout timing:** first seller payout ~7–14 days after their first charge, then 2-day
  rolling (US).

## Soft escrow — when each side gets paid & gets the goods

1. Buyer pays → funds **held** in the platform balance (not a card auth hold; a captured
   charge with a delayed transfer — card auths only last ~7 days).
2. Seller ships within N days (auto-cancel + refund otherwise).
3. Shipping webhook flips to **delivered**.
4. **Inspection window** opens — short for a used console, longer for an antique rug/painting.
5. Window closes clean → `Transfer` to seller (minus fee). Dispute → funds stay held.

Escrow.com's licensed API is a **later** upgrade for very-high-value antiques ($10k+), not v1.

## Shipping

- **Shippo** (cheaper/simpler than EasyPost for a small marketplace; native Stripe hook;
  insurance built in at ~0.5%).
- **High-value/fragile:** offer third-party insurance on the listing; carriers cap
  art/antique declared value low.
- **Oversized** (large rolled rugs, crated art): manual/freight path in v1.
- **Delivery = the escrow trigger:** `delivered` webhook starts the inspection timer.

## Cross-listing & reference data

- **eBay:** Sell APIs (Inventory / Offer / Fulfillment / Account) allow programmatic
  cross-listing — **electronics/collectibles only**. Not our rugs. It's a growth lever, not v1.
- **Best Buy:** curated Mirakl marketplace (not open); Products API = electronics pricing
  reference (business-email-gated; confirm 2026 signup).
- **Reference-price APIs to sharpen AI valuations:** Reverb (clean OAuth API + price guides),
  StockX (approval-gated seller API), card-pricing alternatives (JustTCG / PriceCharting) since
  TCGplayer closed new dev access. 1stDibs / Chairish / LiveAuctioneers have no open API.

## Legal / tax / compliance (US)

- **Iranian/Persian rugs & US sanctions — owner decision (made):** the Bazaar operates
  **globally, everywhere except sanctioned jurisdictions**, and rugs are **included**. The
  sanctioned act is *importing* Iranian-origin goods; RugSnap facilitates sales between people
  who are already outside the embargo (a rug already lawfully in the US/elsewhere, or a sale
  between two non-embargoed parties), which is a different matter. We rely on Stripe Connect to
  **enforce supported (non-sanctioned) countries and run OFAC screening** during seller
  onboarding — so we don't maintain a sanctions list ourselves — and we keep a lightweight
  **seller "origin & authenticity" attestation** at listing time for a clean record. Importing
  new rugs from Iran into the US stays off the table. (Appraisal is unrestricted regardless.)
- **Marketplace facilitator sales tax:** once RugSnap lists goods **and** processes payment,
  RugSnap is the facilitator and must collect/remit after crossing a state's economic nexus
  (commonly $100k/200 txns; CA/NY $500k). Turn on **Stripe Tax (marketplace mode)** from day one.
- **1099-K:** federal threshold restored to **>$20,000 AND >200 transactions** (2025+); CA
  conforms. Confirm whether Stripe (Express) files these for connected accounts.
- **INFORM Consumers Act:** collect/verify high-volume seller info (Stripe Express onboarding
  covers most of it).
- **Antique ivory, counterfeits (sneakers/cards):** category-specific rules; lean on grading
  partners + the inspection window rather than guaranteeing authenticity ourselves.

## Phased build

**v1 (~3–5 focused weeks):** Stripe Connect Express → separate charges + transfers + app fee →
soft escrow (delivery-gated `Transfer`) → Shippo labels + tracking webhooks → optional insurance
→ Stripe Tax on → written policies (return/inspection windows, prohibited items incl. the Iran
decision, INFORM seller data).

**Defer:** Escrow.com (high-value only), eBay/StockX cross-listing (electronics growth lever),
reference-price APIs, freight automation.

**Highest-leverage first step:** stand up **Stripe Connect Express + a charge with an application
fee + a delayed transfer.** It turns messages into real checkout, inherits Stripe's licenses
(no money-transmitter registration), captures our take-rate, and is the foundation escrow,
shipping-gated release, and tax all attach to.

## Going live — owner setup (the code is already written)

The whole engine is built and merged: seller onboarding (`/api/connect/onboard`,
`/api/connect/status`), checkout (`/api/checkout`), the Stripe webhook (`/api/webhook`), and
escrow ship/confirm/list (`/api/orders/*`), plus the app UI (Buy button, "set up payouts", the
origin/authenticity checkbox) — all gated by `/api/market/enabled` so it stays invisible until:

1. **Stripe → enable Connect:** Dashboard → Connect → Get started → platform, **Express** accounts.
2. **Add environment variables in Vercel** (rugsnap project → Settings → Environment Variables),
   then redeploy:
   - `STRIPE_SECRET_KEY` — Stripe → Developers → API keys (Secret key).
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Project Settings → API (service_role key).
   - `STRIPE_WEBHOOK_SECRET` — from step 3.
3. **Create the Stripe webhook:** Stripe → Developers → Webhooks → Add endpoint
   `https://rugsnap.app/api/webhook`, events `checkout.session.completed` and
   `checkout.session.expired`; copy its **Signing secret** into `STRIPE_WEBHOOK_SECRET`.
4. **First live test together:** list an item, set up payouts, buy it from another device,
   confirm receipt → verify the seller transfer lands and the fee stays on the platform.

**Built now vs deferred:** soft escrow releases when the **buyer confirms receipt** (v1);
automatic delivery detection + auto-release via a **Shippo** tracking webhook, shipping-label
purchase, and the Pro fee discount are the next phase.
