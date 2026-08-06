# TrueComp Cards (demo / dummy site)

Local demo of the sports + Pokémon card value app.

## Public links

| Link | Notes |
|------|--------|
| **https://jpeplinski33.github.io/truecomp-cards/** | Permanent static host (GitHub Pages) — works off your network once build finishes |
| Cloudflare tunnel (while this Mac + dev server run) | See session notes; temporary |

Repo: https://github.com/jpeplinski33/truecomp-cards

**Note:** Demo accounts live in the **browser’s localStorage**. Phone and laptop do not share the same login until real backend auth is wired.

## Run locally

```bash
cd ~/Projects/card-value-app/web
npm install
npm run dev -- -p 3456
```

Open **http://localhost:3456**

## What’s included

| Route | Purpose |
|-------|---------|
| `/` | Landing page |
| `/signup` · `/login` | Auth (browser localStorage only) |
| `/app` | Dashboard — portfolio total, collections |
| `/app/scanner` | Demo scanner → value → save to collection |
| `/app/collections` | Multiple collections under one profile |
| `/app/collections/[id]` | Cards + collection total |
| `/app/settings` | Pricing mode: 130point / Golden / Combined |

## Notes

- New signup gets a seeded sample collection.
- Values and scan matches are **simulated** (not live 130point/Goldin).
- Data never leaves the browser (localStorage). Clear site data = wipe account.
- Not affiliated with 130point, Goldin, Card Ladder, or any brand.

## Product docs

- `PRODUCT-BRIEF.md`
- `research/TRANSCRIPT-21.md` (Charlie audio)
- `DOMAINS-BUY.md` (domain candidates — you buying on GoDaddy)
