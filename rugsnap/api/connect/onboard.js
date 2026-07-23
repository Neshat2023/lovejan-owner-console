import { cors, getStripe, marketConfigured, supaSelect, supaInsert, supaUpdate, SITE, nowIso } from "../../lib/marketplace.js";

// Create (or reuse) the seller's Stripe Express account and return a hosted
// onboarding link. Stripe collects KYC + bank details and enforces supported
// (non-sanctioned) countries for us.
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!marketConfigured()) return res.status(503).json({ error: "marketplace not configured yet" });

  try {
    const { deviceId, country } = req.body ?? {};
    if (!deviceId) return res.status(400).json({ error: "deviceId required" });
    const stripe = getStripe();

    const rows = await supaSelect(`seller_accounts?device_id=eq.${encodeURIComponent(deviceId)}&select=*`);
    let row = rows[0];
    let accountId = row?.stripe_account_id;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        ...(country ? { country } : {}),
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_profile: {
          product_description: "Rugs, art, antiques, electronics and collectibles sold on RugSnap",
        },
      });
      accountId = account.id;
      if (row) {
        await supaUpdate("seller_accounts", `device_id=eq.${encodeURIComponent(deviceId)}`,
          { stripe_account_id: accountId, updated_at: nowIso() });
      } else {
        row = await supaInsert("seller_accounts",
          { device_id: deviceId, stripe_account_id: accountId, country: country || "US" });
      }
    }

    const link = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${SITE}/app?connect=refresh`,
      return_url: `${SITE}/app?connect=done`,
      type: "account_onboarding",
    });
    res.status(200).json({ url: link.url });
  } catch (e) {
    console.error("connect/onboard failed", e);
    res.status(500).json({ error: "onboarding failed, try again" });
  }
}
