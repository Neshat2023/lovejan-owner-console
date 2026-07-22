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
- **Biggest risk:** our flagship category (Persian/Iranian rugs) sits on top of **live US
  sanctions** — a legal question before it's a payments question. Appraising is low-risk;
  *transacting* is where the risk concentrates.

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

- **⚠️ Iranian/Persian rugs & US sanctions:** importing new Persian rugs is illegal (OFAC,
  reimposed 2018); domestic resale of rugs already lawfully in the US is provenance-dependent
  and legally murky; eBay/Etsy ban them regardless of age. **Decision needed before enabling
  rug checkout:** domestic-only + provenance attestation + OFAC SDN screening, or exclude
  Iranian-origin from the *marketplace* (appraisal stays available). Get sanctions-aware legal
  sign-off.
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
