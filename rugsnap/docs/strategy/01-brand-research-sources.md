# 01 — Brand Research Sources & Methods

**Assignment:** Book 1 (Company Strategy, Brand Architecture, Positioning, Naming) · **Compiled:** 2026-07-23

## Verified sources (live, timestamped)

| Source / method | Date & time (UTC) | Supports | Reliability notes |
|---|---|---|---|
| Vercel registrar availability API (`check_domain_availability_and_price`), 5 batches, 50 domains | 2026-07-23 20:15–21:05 | Every "Registered/unavailable" and "AVAILABLE $x" domain claim in the Bible, doc brand/04, and the CSV | Registrar-backed, real-time. Detects standard-registration availability + price only. **Cannot** reveal owner, parked status, resale listing, or premium pricing — those are labeled "could not verify" |
| Full repository inspection (app.html, api/*, lib/, docs/, mobile/, vercel.json, package.json; Supabase schema via MCP; Stripe wiring as coded) | 2026-07-23 | The implementation-status table (fully/partially/prototype/configured-unverified/planned) and every product-capability claim | First-party; strongest evidence class in this document |
| Network-egress probe (curl + WebFetch against example.com and target domains → all 403 via sandbox proxy) | 2026-07-23 ~18:5x | The declared limitation that no open-web research was possible | Conclusively demonstrates the sandbox cannot reach the public web |
| Vercel project/deployment/firewall data via MCP; Stripe dashboard facts relayed by the founder's browser session earlier the same day | 2026-07-23 | Deployment, domain-portfolio (rugsnap.com/.app), firewall, and payments-status statements | First-party accounts; browser-relayed items are second-hand but same-day |

## Knowledge-based content (model knowledge, cutoff ~Jan 2026 — currency UNVERIFIED)

| Claim area | Where used | Conflicting-evidence risk |
|---|---|---|
| Competitive landscape (Google Lens, eBay, Etsy, WorthPoint, ValueMyStuff/Mearto, Sotheby's/Christie's/Heritage, 1stDibs, Chairish, Chrono24, Rebag, TheRealReal, Collectors/PSA, StockX) | Bible §Competitive; positioning | Companies pivot; fee figures ("20–45% all-in") are directional, not quoted; re-verify before external use |
| Trademark adjacencies (Snap Inc. "Snap" marks; Axia companies; Provena Health; Toyota Estima; Veritas/Verisign; Mercury Verado; Origyn Foundation; Valora Group; Talis; Kenna Security; 4RF Aprisa; Fujifilm Provia) | CSV TrademarkRisk column; screening rounds | **Preliminary and non-legal.** No database was queried. Counsel knockout search required for any adopted name |
| Linguistic screen (12 languages incl. FA ولایت homophone for Valyt; ویترین loanword status for Vitrine) | Bible §Linguistic; brand/04 | Machine screening; native-speaker review mandatory before selection |
| Market-structure claims (marketplace history: eBay via collectibles, StockX single-brand generalization) | Architecture scoring | Historical, low-drift, but still knowledge-based |

## Explicitly unverifiable from this environment (no claims made)

USPTO / WIPO / EUIPO / UKIPO records · WHOIS/RDAP ownership · domain resale listings & premium prices · Apple App Store / Google Play name conflicts · social-handle availability (Instagram, TikTok, YouTube, X, LinkedIn, Facebook, GitHub) · current competitor traffic/revenue/market sizes. Each appears in the documents only as **UNVERIFIED** or "could not verify," with the manual checklist recorded in brand/04 and Bible §Final-Recommendation item 11.

## Integrity notes

- No domain was called available from a failed page load; availability claims come solely from the registrar API rows above.
- No purchase, registration, rename, or production change was made during this assignment.
- Scores in the CSV cap at 69/100 while trademark status is unverified — by design, to avoid false precision.
