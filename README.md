# GameDev AI Tools

A free, static directory of AI tools for game developers. You can filter by task (pixel art and sprites, 3D models, textures, animation, music, voice, NPC dialogue, code), engine (Unity, Godot, Unreal), pricing model and commercial-use licence.

Live: https://michaelpaulrattray.github.io/gamedev-ai-tools/

## How it works
- `data/tools.json` is the single source of truth. Each tool has a summary, pricing as stated on the vendor's site, commercial-use notes, source links and a `lastChecked` date.
- `node build.mjs` (Node 18+, no dependencies) generates `dist/`: the homepage with search and filters, one page per tool, category pages, `sitemap.xml`, `robots.txt` and JSON-LD.
- Every push to `main` builds and deploys through GitHub Actions to GitHub Pages.

## Editorial rules
- Only facts from the vendor's own pages, each with a source link and a date.
- No invented reviews, ratings, stats or user counts. Anything unclear is marked `unverified`.

## Custom domain later
Build with `SITE_ORIGIN=https://example.com SITE_BASE= node build.mjs` and add a CNAME. See OPERATIONS.md for the open questions.
