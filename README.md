# GameDev AI Tools

A free, static directory of AI tools for game developers. You can filter by task (12 categories, from concept art and 3D models to localisation, QA and trailers), engine (Unity, Godot, Unreal), free plan and whether it's safe to ship commercially. Also generates `/llms.txt` and `/llms-full.txt`.

Live: https://gamedevaitools.com (Vercel). The old GitHub Pages URL redirects there.

## How it works
- `data/tools.json` is the single source of truth. Each tool has a summary, pricing as stated on the vendor's site, commercial-use notes, source links and a `lastChecked` date.
- `npm install` then `node build.mjs` (Node 20+) generates `dist/`: the homepage with search and filters, one page per tool, category, guide, comparison and news pages, `sitemap.xml`, `robots.txt`, JSON-LD, and a 1200x630 share image per page (`og.mjs`: satori + @resvg/resvg-js, Inter fonts in `og/fonts`, category art JPEGs in `og/art`; cached in `node_modules/.cache/og`). Without the two dependencies the build still works but skips share images.
- Design system: shared `badge()`, `chip()`, `toolCard()` and `linkCard()` helpers in `build.mjs`, styled by the Components section of `src/assets/style.css`.
- Hosting: Vercel (`vercel.json`: install `npm install`, build `node build.mjs`, output `dist`). The GitHub Pages workflow only publishes redirect stubs (`pages-redirect.mjs`) for the old URL.

## Editorial rules
- Only facts from the vendor's own pages, each with a source link and a date.
- No invented reviews, ratings, stats or user counts. Anything unclear is `unverified` in the data and shown to visitors as "Not stated by vendor".

## Build settings
Defaults: `SITE_ORIGIN=https://gamedevaitools.com`, `SITE_BASE=` (domain root). For a sub-path host, set `SITE_BASE=/sub-path`.
