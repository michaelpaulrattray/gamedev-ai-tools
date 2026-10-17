# GameDev AI Tools

A free, static directory of AI tools for game developers. You can filter by task (12 categories, from concept art and 3D models to localisation, QA and trailers), engine (Unity, Godot, Unreal), free plan and whether it's safe to ship commercially. Also generates `/llms.txt` and `/llms-full.txt`.

Live: https://gamedevaitools.com (Vercel). The old GitHub Pages URL redirects there.

## How it works
- `data/tools.json` is the single source of truth. Each tool has a summary, pricing as stated on the vendor's site, commercial-use notes, source links and a `lastChecked` date.
- `node build.mjs` (Node 18+, no dependencies) generates `dist/`: the homepage with search and filters, one page per tool, category pages, `sitemap.xml`, `robots.txt` and JSON-LD.
- Hosting: Vercel (`vercel.json`: build `node build.mjs`, output `dist`). The GitHub Pages workflow only publishes redirect stubs (`pages-redirect.mjs`) for the old URL.

## Editorial rules
- Only facts from the vendor's own pages, each with a source link and a date.
- No invented reviews, ratings, stats or user counts. Anything unclear is marked `unverified`.

## Build settings
Defaults: `SITE_ORIGIN=https://gamedevaitools.com`, `SITE_BASE=` (domain root). For a sub-path host, set `SITE_BASE=/sub-path`.
