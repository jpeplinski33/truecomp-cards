# Card Value App — Product Brief
**Date:** 2026-08-06  
**Source audio:** `research/4913 Heath Gate Dr 21.m4a` + Jordan product brief  
**Work root:** `~/Projects/card-value-app/`

---

## 1. What Charlie actually said (audio truth)

From Gemini transcript of noisy outdoor memo (~1:50, kids/hose noise):

| Charlie named | Role |
|---------------|------|
| **Card Ladder** | Peer comps tool (with 130point) |
| **130point** | Main multi-marketplace sold/active comps |
| **eBay** | Marketplace 130point pulls from |
| **Golden** | **Marketplace source inside 130point** (almost certainly **Goldin** auctions — hobby speech “Golden”) |

Key Charlie lines:
- “They’re called **Card Ladder**… and **130point**.”
- “They’re both for **anything**” (not sports-only).
- “**130point** takes everything from… **eBay, Golden, and all the other places** and puts them into one.”
- “Pretty good… **but you have to type it**.” ← product gap: no scanner / typing friction.

Jordan asked about TCGplayer for Pokémon; Charlie didn’t know.

**Implication for product naming of sources:**
- Do **not** treat “Golden” as a second comps app equal to 130point unless we confirm another product.
- User-facing dual methodology should map to:
  1. **Liquidity comps** (eBay-heavy multi-venue — “130point-style”)
  2. **Premium auction comps** (Goldin/Heritage-style — “Golden-style”)
  3. **Blend** of the two
- Optional third: **Card Ladder-style** verified pro comps if we can license (Charlie’s other named tool).

Full transcript: `research/TRANSCRIPT-21.md`

---

## 2. Product vision (Jordan)

**What:** Web + mobile app for **all sports cards + Pokémon**.  
**Core loop:** Scan → identify → value → save to logged-in collection.  
**Pricing:** User chooses **130point-style | Golden/Goldin-style | combination**.  
**Hard requirement:** Scanner that is **fast and accurate** (prior scanner: slow, often wrong, often fails).

---

## 3. Competitive reality (research)

| Tool | Notes |
|------|--------|
| **130 Point** | Free-ish web + paid app tiers; 15M+ solds; eBay, PWCC, **Goldin**, Heritage, MySlabs… **No public third-party API found.** |
| **Goldin (“Golden”)** | High-end auction marketplace — **source of sales**, not a parallel price-guide app. |
| **Card Ladder** | Pro paid comps (~$20/mo); hobby “industry standard” for many dealers; **no public API**. |
| **CollX / Ludex / PSA app / Collectr** | Scanner + portfolio competitors; accuracy varies. |

**Critical legal constraint:** Scraping 130point or Goldin to power a commercial app is **high risk** and brittle. Build:
- Licensed APIs / partner data where possible
- Methodology labels that describe **how** we compute value
- Deep-links “Open on 130point / eBay / Goldin” as honest fallback
- Contact 130point (`admin@130point.com`) for white-label/data license

---

## 4. Value blend methodology (v1 — shippable)

Each sale event: `{price, date, venue, grade, grader, match_score, lot_flag}`

### User modes
| Mode | Implementation |
|------|----------------|
| **Liquidity (130-style)** | Multi-marketplace solds, eBay-weighted ~85%, auctions ~15% |
| **Premium (Golden-style)** | Auction-house venues only (Goldin/Heritage when available), fee-normalized |
| **Blend (default)** | Recency-weighted median; for slabs >$500 use 0.4 liquidity / 0.6 premium; for raw <$100 reverse 0.7/0.3 |

### Algorithm steps
1. Exact grade match; last **60 days**; title/match score ≥ 0.85  
2. Drop multi-card lots / outliers (IQR)  
3. If n ≥ 5 → recency-weighted median (half-life ~21 days)  
4. If 3–4 → plain median + “thin market” badge  
5. If n < 3 → expand to 180 days or show range only — **never invent**  
6. Always show: sample size, date window, source mix %, confidence  

Default blend weights if both buckets exist: **liquidity 0.70 / premium 0.30** (configurable).

---

## 5. Scanner architecture (anti–dogshit)

**Ban:** full-image cloud OCR as sole identity; multi-megabyte uploads; single silent “best guess.”

**Pipeline:** still capture → on-device quad warp + quality gate → visual embedding retrieve + light OCR → top-5 candidates → **user confirm** → price async → save.

| Target | Budget |
|--------|--------|
| P50 identify | ≤ 1.0s |
| P95 identify | ≤ 2.0s |
| Slab cert # path | Often fastest (exact) |

Stack direction: Expo mobile + server ANN (FAISS/pgvector); Vision/ML Kit OCR; cert-first for PSA/BGS/SGC slabs.

Full design: `research/SCANNER-ARCHITECTURE.md` (to be written from agent output).

---

## 6. Tech stack (default)

- **Monorepo:** Turborepo — **Expo** (iOS/Android) + **Next.js** (web) + shared TS packages  
- **Auth/DB:** Supabase Auth + Postgres RLS + Storage  
- **Pricing package:** pluggable adapters + blend service  
- **Infra ballpark:** ~$50–150/mo alpha (ex data licenses)

---

## 7. Domain recommendations

WHOIS batch (2026-08-06, not GoDaddy cart — verify on GoDaddy before buy).  
Status **AVAILABLE?** = whois suggested free; **confirm live on GoDaddy** (races happen).

### Top picks for this product
| Domain | Why |
|--------|-----|
| **truecompcards.com** | Comps = hobby language; dual-source honest branding |
| **valuedslab.com** | Premium / graded culture + value |
| **instantcardvalue.com** | Promise matches scanner+price loop |
| **scoutmycards.com** | Action + collection; friendly |
| **scancardhq.com** | Scanner-first brand |
| **cardindexpro.com** | Catalog / pro feel |
| **cardmarketai.com** | Tech/AI scanner signal (optional) |
| **valuemydeck.com** | Pokémon-friendly; sports still works as “deck” stretch |
| **pokesportcards.com** | Explicit dual category (narrower brand) |
| **rawandgraded.com** | Condition spectrum; clear for sports |
| **collectionscan.com** | Collection + scan |

Also check (batch 2 running / pending): scanvault, valueslab, mintfolio, hitvault, slabstack, scanfolio, pullworth, etc.

**Taken (do not chase):** cardvault, cardfolio, cardledger, cardpulse, slabscan, cardradar, scanmycards, mycardvalue, cardblend, compscan, …

**GoDaddy next step:** bulk paste available list → register 1 primary + 1 defensive.

---

## 8. Build phases

### Phase 0 (this week)
- [ ] Confirm “Golden” = Goldin with Charlie/Jordan  
- [ ] Register domain  
- [ ] Scaffold monorepo + Supabase  
- [ ] Email 130point re: data/partner; evaluate PriceCharting/JustTCG for Pokémon  

### Phase 1 — 2-week MVP
Login → manual search add → mock then real price path → scan stub with confirm → one collection  

### Phase 2 — 6-week beta
Real scanner accuracy, both price methodologies, iOS+Android, legal pages, soft launch  

---

## 9. Open decisions for Jordan
1. Brand: pick domain from available list  
2. Source labels: keep “130point / Golden” in UI vs neutral “Liquidity / Premium auction” until licenses  
3. Card Ladder: pursue as licensed data or leave as competitor deep-link only  
4. MVP category seed: Pokémon-only first vs sports+Pokémon thin both  

