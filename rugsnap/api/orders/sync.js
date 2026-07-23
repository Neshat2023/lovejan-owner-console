import { cors, getStripe, marketConfigured, supaSelect, supaUpdate, nowIso } from "../../lib/marketplace.js";

// Webhook-independent payment confirmation: verify a pending order directly with
// Stripe (by checkout session) and mark it paid. Called on the success return and
// when opening "My orders", so a missed/misconfigured webhook never strands funds.
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!marketConfigured()) return res.status(503).json({ error: "marketplace not configured yet" });

  try {
    const { sid, orderId, deviceId } = req.body ?? {};

    let order;
    if (sid) {
      const rows = await supaSelect(`orders?stripe_checkout_session_id=eq.${encodeURIComponent(sid)}&select=*`);
      order = rows[0];
    } else if (orderId) {
      const rows = await supaSelect(`orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
      order = rows[0];
      // When looked up by id, require the caller to be a party to the order.
      if (order && deviceId && order.buyer_device_id !== deviceId && order.seller_device_id !== deviceId) {
        return res.status(403).json({ error: "not your order" });
      }
    } else {
      return res.status(400).json({ error: "sid or orderId required" });
    }

    if (!order) return res.status(404).json({ error: "order not found" });
    if (order.status !== "pending") return res.status(200).json({ status: order.status });
    if (!order.stripe_checkout_session_id) return res.status(200).json({ status: order.status });

    const session = await getStripe().checkout.sessions.retrieve(order.stripe_checkout_session_id);
    if (session.payment_status === "paid") {
      const updated = await supaUpdate("orders", `id=eq.${order.id}`, {
        status: "paid",
        stripe_payment_intent_id: session.payment_intent || null,
        updated_at: nowIso(),
      });
      return res.status(200).json({ status: updated.status });
    }
    return res.status(200).json({ status: order.status });
  } catch (e) {
    console.error("orders/sync failed", e);
    res.status(500).json({ error: "could not sync order" });
  }
}
