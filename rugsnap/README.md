# 🧿 RugSnap — AI Rug, Art & Antique Appraisal + Bazaar

Snap a photo of a Persian/Oriental rug, a painting or calligraphy, or an
antique → AI identifies the category, origin, era, technique, materials, and
maker's marks, and estimates a market value range. Same proven formula as
CoinSnap (photo → identify → value → 7-day trial → subscription), plus a
built-in marketplace ("the Bazaar") where the appraisal card becomes the
listing and RugSnap takes a commission on sales.

Fully bilingual **English / فارسی** (RTL supported).

## Categories

- **Rugs & carpets** — weave, knot type, density, regional tradition
- **Art & painting** — Qajar oils, miniatures, nastaliq calligraphy, Western
  paintings; medium, school, signature (with print/reproduction caution)
- **Antiques** — samovars, metalwork, ceramics, khatam, jewelry

## The Bazaar (marketplace)

Phase 0 ships in the app today: scan → "List it in the Bazaar" (price
prefilled from the appraisal) → listing feed with category filters →
buyers send offers. Fee model: **10% of the sale (7% for Pro)**, shown
transparently on the sell form. Offers/listings are stored on-device for now.

| Phase | Scope |
|---|---|
| 0 (shipped) | Listings + offers UI, fee preview, seeded inventory |
| 1 | Supabase backend (auth, listings, offers) + Stripe Connect payouts with `application_fee_amount`, delivery-confirm escrow, Shippo labels |
| 2 | Best-offer/auctions, saved-search alerts, verified-dealer badges, human review for items over $5k |

⚖️ Compliance notes for launch: US-located items only (importing rugs from
Iran into the US is prohibited under current sanctions; selling pieces already
in the US is legal), Stripe handles seller KYC/1099-K, ban AI-generated photos
in listings.

## What's here

| File | Purpose |
|---|---|
| `index.html` | Marketing landing page (bilingual, pricing, CTA) |
| `app.html` | The app: camera/upload → analysis → appraisal report → paywall |
| `api/analyze.js` | Vercel serverless function — calls the Claude API (vision + structured output) |
| `package.json` / `vercel.json` | Deploy config |

## Cinematic hero video

Both the landing hero and the app home screen have a wired-in video slot:
drop a clip at **`rugsnap/video/hero.mp4`** (16:9 or 4:5, ~8s loop, muted)
and it plays automatically — no code changes. Until the file exists, the
landing falls back to the generative rug with a drone-style flyover and the
app hides the banner. Generate the clip in Higgsfield/ChatGPT with the
drone-style prompt from the launch notes.

## Deploy (5 minutes)

1. Install the [Vercel CLI](https://vercel.com/docs/cli) and log in.
2. From this directory:
   ```sh
   cd rugsnap
   vercel deploy --prod
   ```
3. In the Vercel project settings, add the environment variable:
   - `ANTHROPIC_API_KEY` — get one at https://platform.claude.com
4. Open the deployed URL. `index.html` is the landing page, `/app` is the app.

The backend uses `claude-opus-4-8` with vision + structured outputs, so every
analysis returns validated JSON. Free-text fields come back in Farsi when the
user has the app in Farsi.

## Monetization model (as built)

- **2 free scans** per device (tracked in `localStorage`).
- Paywall after that: **$39.99/year with a 7-day free trial** (highlighted) or
  **$4.99/week**.
- ⚠️ **Payments are stubbed.** The "Start free trial" button currently just
  unlocks locally. Before launch, wire up:
  - Web: [Stripe Checkout](https://stripe.com/docs/payments/checkout) or
    [RevenueCat Web Billing](https://www.revenuecat.com/docs/web/web-billing)
  - iOS/Android: wrap with [Capacitor](https://capacitorjs.com) and use
    RevenueCat for StoreKit/Play Billing subscriptions.

## Unit economics (rough)

- One analysis ≈ 1 image (~1.6k tokens) + ~1k output tokens on Opus 4.8
  ≈ **$0.03–$0.05 per scan**.
- A yearly subscriber at $39.99 doing even 200 scans/year costs < $10 to serve.
- Free scans are capped at 2 per device to bound acquisition cost.

## Launch checklist

- [ ] Wire real payments (RevenueCat/Stripe) — replace the TODO in `app.html`.
- [ ] Add server-side scan metering (device token + count) so the free limit
      can't be bypassed by clearing `localStorage`.
- [ ] Buy a domain (e.g. `rugsnap.app`) and point Vercel at it.
- [ ] App Store: wrap with Capacitor, add App Tracking Transparency + privacy
      manifest, submit as "RugSnap: Rug Identifier".
- [ ] ASO keywords: rug identifier, persian rug value, oriental rug appraisal,
      antique identifier, carpet value.
- [ ] Content marketing: TikTok/IG reels of scans of family rugs
      ("I found out grandma's rug is worth $12,000") — this is the exact
      channel that made CoinSnap and Cal AI work.
- [ ] Legal: the in-app disclaimer already states estimates are not certified
      appraisals — keep it visible on every result.

## Roadmap ideas

- Counterfeit/machine-made detection ("is this handmade?") — high-value query.
- Persian carpet knot counter from macro photos.
- Marketplace: connect sellers with dealers (take a commission).
- Expand to adjacent verticals: samovars, miniatures, calligraphy, tribal jewelry.
