// Shared helpers for the Bazaar's real-money endpoints (Stripe Connect + soft escrow).
// Everything is gated on env vars so the endpoints stay dormant (503) until the
// owner adds the keys — the live app is unaffected before then.
import Stripe from "stripe";

export const SITE = process.env.PUBLIC_SITE_URL || "https://rugsnap.app";
export const SUPA_URL = "https://rwloxdnjfwsgetzkuras.supabase.co";
export const FEE_RATE = 0.10; // RugSnap take-rate (Pro-discount is a later refinement)

let _stripe = null;
export function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

// Marketplace is "on" only when both Stripe and the Supabase service role are configured.
export function marketConfigured() {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function supaHeaders() {
  const k = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { apikey: k, Authorization: `Bearer ${k}`, "Content-Type": "application/json" };
}

export async function supaSelect(pathAndQuery) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${pathAndQuery}`, { headers: supaHeaders() });
  if (!res.ok) throw new Error(`supabase select ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function supaInsert(table, row) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: { ...supaHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(row),
  });
  if (!res.ok) throw new Error(`supabase insert ${res.status}: ${await res.text()}`);
  return (await res.json())[0];
}

export async function supaUpdate(table, matchQuery, patch) {
  const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${matchQuery}`, {
    method: "PATCH",
    headers: { ...supaHeaders(), Prefer: "return=representation" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) throw new Error(`supabase update ${res.status}: ${await res.text()}`);
  return (await res.json())[0];
}

// Vercel Node functions parse JSON by default; the Stripe webhook needs the raw bytes.
export function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

export function nowIso() {
  return new Date().toISOString();
}
