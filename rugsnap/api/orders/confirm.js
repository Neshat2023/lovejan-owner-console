import { cors, getStripe, marketConfigured, supaSelect, supaUpdate, nowIso } from "../../lib/marketplace.js";

// Buyer confirms they received the item as described. This closes the soft-escrow
// hold: the seller's share (price minus the RugSnap fee) is transferred to their
// connected account; the fee stays on the platform.
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!marketConfigured()) return res.status(503).json({ error: "marketplace not configured yet" });

  try {
    const { orderId, deviceId } = req.body ?? {};
    if (!orderId || !deviceId) return res.status(400).json({ error: "orderId and deviceId required" });

    const rows = await supaSelect(`orders?id=eq.${encodeURIComponent(orderId)}&select=*`);
    const order = rows[0];
    if (!order) return res.status(404).json({ error: "order not found" });
    if (order.buyer_device_id !== deviceId) return res.status(403).json({ error: "not your order" });
    if (!["paid", "shipped"].includes(order.status)) {
      return res.status(409).json({ error: `can't release an order that is ${order.status}` });
    }
    if (!order.seller_account_id) return res.status(409).json({ error: "no seller account on file" });

    const sellerCents = Math.round((Number(order.amount_usd) - Number(order.fee_usd)) * 100);
    const stripe = getStripe();
    const transfer = await stripe.transfers.create({
      amount: sellerCents,
      currency: order.currency || "usd",
      destination: order.seller_account_id,
      metadata: { order_id: order.id },
    });

    const updated = await supaUpdate("orders", `id=eq.${encodeURIComponent(orderId)}`, {
      status: "released",
      stripe_transfer_id: transfer.id,
      delivered_at: nowIso(),
      updated_at: nowIso(),
    });
    res.status(200).json({ ok: true, status: updated.status });
  } catch (e) {
    console.error("orders/confirm failed", e);
    res.status(500).json({ error: "could not release funds" });
  }
}
