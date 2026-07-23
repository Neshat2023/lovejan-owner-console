import { cors, getStripe, marketConfigured, supaSelect, supaInsert, supaUpdate, FEE_RATE, SITE, nowIso } from "../lib/marketplace.js";

// Start a purchase. Charges the buyer to the PLATFORM balance (separate charges
// + transfers = "soft escrow"); funds are held until the buyer confirms receipt,
// then transferred to the seller minus the RugSnap fee.
export default async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  if (!marketConfigured()) return res.status(503).json({ error: "marketplace not configured yet" });

  try {
    const { listingId, buyerEmail, buyerDeviceId } = req.body ?? {};
    if (!listingId) return res.status(400).json({ error: "listingId required" });

    const listings = await supaSelect(
      `listings?id=eq.${encodeURIComponent(listingId)}&select=id,device_id,title,price_usd,photo_url,status`,
    );
    const listing = listings[0];
    if (!listing) return res.status(404).json({ error: "listing not found" });
    if (listing.status && listing.status !== "active") return res.status(409).json({ error: "listing is not available" });
    if (buyerDeviceId && listing.device_id === buyerDeviceId) return res.status(400).json({ error: "you can't buy your own listing" });

    const sellers = await supaSelect(
      `seller_accounts?device_id=eq.${encodeURIComponent(listing.device_id)}&select=stripe_account_id,charges_enabled`,
    );
    const seller = sellers[0];
    if (!seller?.stripe_account_id || !seller.charges_enabled) {
      return res.status(409).json({ error: "seller hasn't finished setting up payouts yet" });
    }

    const amount = Number(listing.price_usd);
    if (!(amount > 0)) return res.status(400).json({ error: "invalid price" });
    const fee = Math.round(amount * FEE_RATE * 100) / 100;
    const amountCents = Math.round(amount * 100);

    const stripe = getStripe();
    const order = await supaInsert("orders", {
      listing_id: listing.id,
      seller_device_id: listing.device_id,
      seller_account_id: seller.stripe_account_id,
      buyer_device_id: buyerDeviceId || null,
      buyer_email: buyerEmail || null,
      amount_usd: amount,
      fee_usd: fee,
      status: "pending",
    });

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(buyerEmail ? { customer_email: buyerEmail } : {}),
      line_items: [{
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: amountCents,
          product_data: {
            name: listing.title || "RugSnap listing",
            ...(listing.photo_url ? { images: [listing.photo_url] } : {}),
          },
        },
      }],
      payment_intent_data: { metadata: { order_id: order.id } },
      metadata: { order_id: order.id, listing_id: listing.id, seller_account_id: seller.stripe_account_id },
      success_url: `${SITE}/app?order=success&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE}/app?order=cancel`,
    });

    await supaUpdate("orders", `id=eq.${order.id}`,
      { stripe_checkout_session_id: session.id, updated_at: nowIso() });

    res.status(200).json({ url: session.url, orderId: order.id });
  } catch (e) {
    console.error("checkout failed", e);
    res.status(500).json({ error: "checkout failed, try again" });
  }
}
