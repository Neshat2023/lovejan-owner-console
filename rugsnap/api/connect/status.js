import { cors, getStripe, marketConfigured, supaSelect, supaUpdate, nowIso } from "../../lib/marketplace.js";

// Report whether this device's seller account can accept charges & payouts.
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!marketConfigured()) return res.status(503).json({ error: "marketplace not configured yet" });

  try {
    const { deviceId } = req.body ?? {};
    if (!deviceId) return res.status(400).json({ error: "deviceId required" });

    const rows = await supaSelect(`seller_accounts?device_id=eq.${encodeURIComponent(deviceId)}&select=*`);
    const row = rows[0];
    if (!row?.stripe_account_id) return res.status(200).json({ onboarded: false });

    const acct = await getStripe().accounts.retrieve(row.stripe_account_id);
    await supaUpdate("seller_accounts", `device_id=eq.${encodeURIComponent(deviceId)}`, {
      charges_enabled: acct.charges_enabled,
      payouts_enabled: acct.payouts_enabled,
      details_submitted: acct.details_submitted,
      updated_at: nowIso(),
    });
    res.status(200).json({
      onboarded: true,
      chargesEnabled: acct.charges_enabled,
      payoutsEnabled: acct.payouts_enabled,
      detailsSubmitted: acct.details_submitted,
    });
  } catch (e) {
    console.error("connect/status failed", e);
    res.status(500).json({ error: "status check failed" });
  }
}
