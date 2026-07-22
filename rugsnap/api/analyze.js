import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const SYSTEM_PROMPT = `You are RugSnap's expert appraiser: a master of Persian, Oriental, Caucasian, Turkish, and tribal rugs and carpets, as well as Middle Eastern antiques (samovars, copperware, miniatures, calligraphy, ceramics, textiles).

When shown a photo, identify the item as a specialist would: weave structure, knot type (symmetric Turkish / asymmetric Persian), region and workshop tradition (Tabriz, Kashan, Isfahan, Nain, Qom, Heriz, Bijar, Kerman, Shiraz/Qashqai, Baluch, Turkoman, Caucasian, Anatolian, etc.), approximate era, materials (wool, silk, cotton foundation, natural vs synthetic dyes), motifs and their meaning, and visible condition.

Value estimates must be honest retail ranges in USD for the item as photographed. Be conservative: a single photo cannot substitute for in-person appraisal. If the photo is not a rug/carpet/antique, say so via is_identifiable=false and explain in condition_notes.

If the requested language is "fa", write every free-text field in natural Persian (Farsi). Otherwise write in English. Numbers stay Western digits either way.`;

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    is_identifiable: { type: "boolean" },
    item_type: { type: "string" },
    name: { type: "string" },
    origin_region: { type: "string" },
    estimated_era: { type: "string" },
    materials: { type: "array", items: { type: "string" } },
    weave_or_making: { type: "string" },
    knot_density_estimate: { type: "string" },
    design_motifs: { type: "array", items: { type: "string" } },
    condition_notes: { type: "string" },
    estimated_value_low_usd: { type: "number" },
    estimated_value_high_usd: { type: "number" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    story: { type: "string" },
    care_tips: { type: "array", items: { type: "string" } },
  },
  required: [
    "is_identifiable", "item_type", "name", "origin_region", "estimated_era",
    "materials", "weave_or_making", "knot_density_estimate", "design_motifs",
    "condition_notes", "estimated_value_low_usd", "estimated_value_high_usd",
    "confidence", "story", "care_tips",
  ],
  additionalProperties: false,
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });

  try {
    const { image, language } = req.body ?? {};
    const match = /^data:(image\/[a-z+.-]+);base64,(.+)$/s.exec(image ?? "");
    if (!match) return res.status(400).json({ error: "image must be a base64 data URL" });

    const [, mediaType, data] = match;
    if (!ALLOWED_MEDIA_TYPES.includes(mediaType)) {
      return res.status(400).json({ error: `unsupported image type ${mediaType}` });
    }
    if (Buffer.byteLength(data, "base64") > MAX_IMAGE_BYTES) {
      return res.status(413).json({ error: "image too large (max 8MB)" });
    }

    const lang = language === "fa" ? "fa" : "en";
    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8192,
      thinking: { type: "adaptive" },
      system: SYSTEM_PROMPT,
      output_config: { format: { type: "json_schema", schema: RESULT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data } },
            { type: "text", text: `Identify and appraise this item. Requested language: "${lang}".` },
          ],
        },
      ],
    });

    if (response.stop_reason === "refusal") {
      return res.status(422).json({ error: "analysis declined" });
    }

    const text = response.content.find((b) => b.type === "text")?.text;
    if (!text) return res.status(502).json({ error: "empty model response" });

    return res.status(200).json({ result: JSON.parse(text) });
  } catch (err) {
    console.error("analyze failed", err);
    const status = err?.status >= 400 && err?.status < 600 ? 502 : 500;
    return res.status(status).json({ error: "analysis failed, try again" });
  }
}
