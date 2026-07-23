import { getStripe, readRawBody, supaUpdate, nowIso } from "../lib/marketplace.js";

// Stripe needs the raw request body to verify the signature.
export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return res.status(503).end();

  let event;
  try {
    const raw = await readRawBody(req);
    event = stripe.webhooks.constructEvent(raw, req.headers["stripe-signature"], secret);
  } catch (e) {
    console.error("webhook signature verification failed", e.message);
    return res.status(400).send(`Webhook Error: ${e.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const s = event.data.object;
      const orderId = s.metadata?.order_id;
      if (orderId) {
        await supaUpdate("orders", `id=eq.${orderId}`, {
          status: "paid",
          stripe_payment_intent_id: s.payment_intent || null,
          updated_at: nowIso(),
        });
      }
    } else if (event.type === "checkout.session.expired") {
      const orderId = event.data.object.metadata?.order_id;
      if (orderId) {
        await supaUpdate("orders", `id=eq.${orderId}&status=eq.pending`,
          { status: "canceled", updated_at: nowIso() });
      }
    }
    res.status(200).json({ received: true });
  } catch (e) {
    console.error("webhook handler failed", e);
    res.status(500).end();
  }
}
