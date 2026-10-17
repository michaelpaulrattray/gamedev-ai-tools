# OPERATIONS: GameDev AI Tools

Owner: Mike Paul (Brisbane, Australia/Brisbane). Budget: $0. This business is separate from Klieg: no shared repos, accounts or services.

## Current goals
1. v0 live on free GitHub Pages with 25–40 real, sourced tools. **Done 2026-10-17: 31 tools.**
2. Grow to ~60 tools across all task categories while keeping every listing sourced and dated.
3. Get indexed: submit the sitemap to search engines once a verification method is approved (see open questions).
4. Re-verify pricing and licences regularly, since these change often (see routines).

## Routines
- **Monthly (first Saturday):** re-check each tool's pricing and licence source links. Update `pricing`, `license`, `commercial` and `lastChecked` in `data/tools.json`. Mark anything that can't be confirmed as `unverified`. Remove tools that have shut down.
- **Weekly:** look for new AI game-dev tools and add them only with official-source facts.
- **On every change:** push to `main`. The GitHub Actions "Deploy to GitHub Pages" workflow rebuilds the site. Then confirm that the homepage, one tool page and `sitemap.xml` return 200.
- **Inbound:** handle tool suggestions and corrections through GitHub issues (linked from /get-featured/).

## Metrics
No analytics are installed (none approved yet). Trackable right now with no tracking code:
- Number of tools listed (31 at launch) and number of category pages.
- Share of listings checked within the last 30 days.
- Share of fields marked `unverified` (target: going down).
- GitHub repo traffic (Insights → Traffic; repo only, not the site).
Later, if approved: site visits, top tool pages, search queries, newsletter signups.

## Decisions log
- **2026-10-17:** Chose a directory of AI tools for game developers as the micro-business (per Mike).
- **2026-10-17:** Hosting on Mike's personal GitHub (`michaelpaulrattray/gamedev-ai-tools`, public) with free GitHub Pages deployed through Actions (per Mike).
- **2026-10-17:** Stack is plain HTML/CSS/JS from a zero-dependency Node build script (`build.mjs`), with `data/tools.json` as the single source of truth. Chosen for speed, $0 cost and no dependency maintenance.
- **2026-10-17:** Editorial policy: vendor-sourced facts only, with source links and a last-checked date; `unverified` when unclear; no reviews, ratings or user counts; no affiliate links.
- **2026-10-17:** The newsletter is a disabled "coming soon" placeholder that collects nothing. The "Get featured" page has no prices.
- **2026-10-17:** Published a minimal privacy note (no data collected; mentions that GitHub Pages hosting may process IPs). Pending Mike's review, see open questions.

## Open questions (need Mike's approval)
1. **Custom domain** (~$15/yr). This needs approval for spend and a domain name. Note that `robots.txt` only takes effect at a domain root, so it isn't honoured on the `github.io/gamedev-ai-tools/` project path. A custom domain fixes that.
2. **Newsletter provider:** which service, and whether to have a free tier only. Nothing collects emails until this is decided.
3. **Analytics choice:** none, a privacy-friendly option, or Google Search Console only. The privacy note must be updated before adding anything.
4. **Privacy note:** please approve or edit the wording at /privacy/. It currently says no data is collected and that GitHub may process technical data to serve pages.
5. **Search engine submission:** OK to verify the site in Google Search Console / Bing Webmaster Tools? (Free, but it needs a Google or Microsoft account login. No new accounts have been created.)
6. **Monetisation for "Get featured":** whether to offer it, and the pricing model. No prices are published yet.
