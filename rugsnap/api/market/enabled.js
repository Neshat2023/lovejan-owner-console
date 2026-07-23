import { cors, marketConfigured } from "../../lib/marketplace.js";

// Public flag the app checks on load to decide whether to show Buy / payout UI.
export default function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") return res.status(204).end();
  res.status(200).json({ enabled: marketConfigured() });
}
