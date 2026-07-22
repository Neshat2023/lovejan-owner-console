import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const ALLOWED_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const SYSTEM_PROMPT = `You are RugSnap's expert appraiser across five categories:

1. RUGS & CARPETS — master knowledge of Persian, Oriental, Caucasian, Turkish, and tribal weaving: weave structure, knot type (symmetric Turkish / asymmetric Persian), regional workshop traditions (Tabriz, Kashan, Isfahan, Nain, Qom, Heriz, Bijar, Kerman, Shiraz/Qashqai, Baluch, Turkoman, Caucasian, Anatolian), era, materials, dyes, motifs.

2. ART & PAINTING — Persian and Islamic art (miniatures, Qajar oil painting, nastaliq and other calligraphy, illuminated manuscripts, lacquer papier-mache) as well as Western oils, watercolors, and works on paper. Read medium and technique, style and school, signatures or inscriptions, and framing.

3. ANTIQUES — Middle Eastern and general antiques: samovars, copperware and metalwork, ceramics, textiles, wood inlay (khatam), jewelry.

4. ELECTRONICS & GADGETS — game consoles (PlayStation, Xbox, Nintendo, and retro/vintage systems), cameras and lenses, watches and smartwatches, phones, headphones and audio gear, drones, and similar consumer electronics. Read the model and generation from visible markings, the edition (standard / special / limited), included accessories, and physical condition.

5. COLLECTIBLES — sneakers, trading cards (sports, Pokémon, and the like), sealed or vintage video games, action figures, LEGO sets, vinyl records, and pop-culture memorabilia. Edition, sealed/graded state, and completeness dominate value.

Classify the item into exactly one category: "rug", "art", "antique", "electronics", or "collectible".

Report technique precisely (e.g. "Hand-knotted, asymmetric Persian knot", "Oil on canvas, impasto highlights", or "Home console, 8th generation"). In maker_marks report what identifies the maker or model: knot density for rugs, signature/inscription/stamp for art and antiques, and the model number, generation, or serial for electronics and collectibles ("No visible model markings" is a valid answer). In maker name the artist, workshop tradition, brand, or manufacturer if attributable, otherwise "Unknown".

Attribution humility is mandatory: a single photo cannot authenticate or verify working condition. For art, if the work could be a print or reproduction rather than an original, say so plainly in condition_notes and value it as such; never attribute to a named master with high confidence from one photo. For electronics and collectibles, value is model-, condition-, and market-driven and moves fast: a used console or gadget is worth far less than its original retail, while a sealed, boxed, or professionally graded item is worth far more — say which case applies in condition_notes, note that you cannot confirm the item powers on or is authentic, and give a conservative resale range. Value estimates are honest retail/resale ranges in USD for the item as photographed, conservative by default. If the photo fits none of these categories, set is_identifiable=false and explain in condition_notes.

If the requested language is "fa", write every free-text field in natural Persian (Farsi). Otherwise write in English. Numbers stay Western digits either way.`;

const RESULT_SCHEMA = {
  type: "object",
  properties: {
    is_identifiable: { type: "boolean" },
    category: { type: "string", enum: ["rug", "art", "antique", "electronics", "collectible"] },
    item_type: { type: "string" },
    name: { type: "string" },
    maker: { type: "string" },
    origin_region: { type: "string" },
    estimated_era: { type: "string" },
    materials: { type: "array", items: { type: "string" } },
    technique: { type: "string" },
    maker_marks: { type: "string" },
    design_motifs: { type: "array", items: { type: "string" } },
    condition_notes: { type: "string" },
    estimated_value_low_usd: { type: "number" },
    estimated_value_high_usd: { type: "number" },
    confidence: { type: "string", enum: ["low", "medium", "high"] },
    story: { type: "string" },
    care_tips: { type: "array", items: { type: "string" } },
  },
  required: [
    "is_identifiable", "category", "item_type", "name", "maker", "origin_region",
    "estimated_era", "materials", "technique", "maker_marks", "design_motifs",
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
