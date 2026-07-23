import { cors, marketConfigured, supaSelect, supaUpdate, nowIso } from "../../lib/marketplace.js";

// Seller marks an order shipped and records tracking. (Automatic delivery
// detection via a shipping-provider webhook is a later phase.)
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!marketConfigured()) return res.status(503).json({ error: "marketplace not configured yet" });

  try {
    const { orderId, deviceId, carrier, tracking } = req.body ?? {};
    if (!orderId || !deviceId) return res.status(400).json({ error: "orderId and deviceId required" });

    const rows = await supaSelect(`orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
    const order = rows[0];
    if (!order) return res.status(404).json({ error: "order not found" });
    if (order.seller_device_id !== deviceId) return res.status(403).json({ error: "not your sale" });
    if (order.status !== "paid") return res.status(409).json({ error: `can't ship an order that is ${order.status}` });

    const updated = await supaUpdate("orders", `id=eq.${encodeURIComponent(orderId)}`, {
      status: "shipped",
      shipping_carrier: carrier || null,
      shipping_tracking: tracking || null,
      updated_at: nowIso(),
    });
    res.status(200).json({ ok: true, status: updated.status });
  } catch (e) {
    console.error("orders/ship failed", e);
    res.status(500).json({ error: "could not update order" });
  }
}
