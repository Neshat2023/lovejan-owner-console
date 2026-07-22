# RugSnap → TestFlight & the App Store (LoveJan, Inc.)

This folder wraps the live RugSnap web app (`https://rugsnap.app/app`) in a native
iOS shell with **Capacitor**, so it can be distributed through **TestFlight** and the
**App Store** under the **LoveJan, Inc.** Apple Developer account.

## What this is

A thin native iOS app that loads the real RugSnap web app inside a full-screen
native web view. Camera capture, scanning, results, and the Bazaar all work exactly
like the website — because it *is* the website, running inside an app the App Store
can distribute. Every web deploy you push to `main` is instantly live in the app too,
with **no re-submission** needed for web-only changes.

## Before you start — you need

- A **Mac** with **Xcode 16 or newer** (free, Mac App Store).
- **Node 20+** and **CocoaPods** (`sudo gem install cocoapods`).
- **LoveJan, Inc. enrolled in the Apple Developer Program** ($99/yr).

## Step 0 — confirm the Apple Developer membership

Sign in at <https://developer.apple.com/account> with the LoveJan Apple ID. You should
see the **LoveJan, Inc.** team with an **active** membership. If it says "Enroll," the
membership isn't active yet — finish enrollment first (company enrollment with D-U-N-S
verification can take 24–48h).

## Step 1 — build the native project (on your Mac)

```bash
cd rugsnap/mobile
npm install
npx cap add ios
npx cap sync ios
```

This creates the `ios/` folder (not committed — it's machine-generated).

## Step 2 — open in Xcode

```bash
npx cap open ios
```

## Step 3 — signing (LoveJan team)

In Xcode, select the **App** target → **Signing & Capabilities**:

- **Team:** LoveJan, Inc.
- **Bundle Identifier:** `app.rugsnap` (already set; change only if it's taken)
- Check **Automatically manage signing**.

## Step 4 — camera & photo permissions (REQUIRED)

Without these the app crashes the moment you tap to scan. Open
`ios/App/App/Info.plist` and add:

```xml
<key>NSCameraUsageDescription</key>
<string>RugSnap uses your camera to photograph rugs, art, antiques and gadgets for appraisal.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>RugSnap lets you choose a photo from your library to appraise.</string>
```

## Step 5 — app icon

Drag `../icons/icon-1024.png` into Xcode's **Assets → AppIcon** (Single Size / 1024pt slot).
App Store icons can't have transparency — if you hit error **ITMS-90717 (alpha channel)**,
open the PNG in Preview → **File → Export → uncheck "Alpha"**, or regenerate via an icon tool.

## Step 6 — archive & upload

- Set the run destination to **Any iOS Device (arm64)**.
- **Product → Archive**.
- In the Organizer: **Distribute App → App Store Connect → Upload**.

## Step 7 — TestFlight (get it on your phone)

1. In **App Store Connect** (<https://appstoreconnect.apple.com>), create the app record:
   **My Apps → + → New App**, platform iOS, bundle ID `app.rugsnap`.
2. Open the **TestFlight** tab. Once the build finishes processing (~10–30 min):
   - **Internal Testing** — fastest, **NO review**: add yourself as an internal tester,
     open the **TestFlight** app on your iPhone, install RugSnap. ✅ You can test the same day.
   - **External Testing** — up to 10,000 testers, requires a quick Beta App Review.

## ⚠️ Before a PUBLIC App Store release — two things to change

1. **In-app subscriptions must use Apple In-App Purchase, not Stripe.** Apple guideline
   3.1.1 forbids the current Stripe paywall for iOS digital subscriptions. For internal
   TestFlight testing it's fine; for public release we switch the iOS paywall to
   **StoreKit via RevenueCat** (the web keeps Stripe). Planned follow-up.
2. **"Minimum functionality" (guideline 4.2).** A pure web wrapper can be rejected. Our
   mitigation: real native camera use + genuine appraisal value. If review pushes back,
   we bundle the web assets locally and add the native camera plugin (already planned).

## How updates work

- **Web / app changes** (features, copy, the appraiser): push to `main` — Vercel deploys
  and the native app shows them instantly. No new build needed.
- **Native changes** (icon, permissions, plugins, IAP): rebuild in Xcode and upload a new
  TestFlight build.
