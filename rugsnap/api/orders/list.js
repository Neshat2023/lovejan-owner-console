import { cors, marketConfigured, supaSelect } from "../../lib/marketplace.js";

// Orders where this device is buyer or seller, so the app can show "My orders".
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!marketConfigured()) return res.status(503).json({ error: "marketplace not configured yet" });

  try {
    const { deviceId } = req.body ?? {};
    if (!deviceId) return res.status(400).json({ error: "deviceId required" });
    const d = encodeURIComponent(deviceId);
    const rows = await supaSelect(
      `orders?or=(buyer_device_id.eq.${d},seller_device_id.eq.${d})` +
      `&select=id,listing_id,status,amount_usd,fee_usd,buyer_device_id,seller_device_id,shipping_tracking,created_at` +
      `&order=created_at.desc&limit=50`,
    );
    res.status(200).json({ orders: rows });
  } catch (e) {
    console.error("orders/list failed", e);
    res.status(500).json({ error: "could not load orders" });
  }
}
