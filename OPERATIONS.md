# OPERATIONS: GameDev AI Tools

Live: https://gamedevaitools.com (Vercel, Git-connected: pushes to `main` deploy production). Old GitHub Pages URL redirects there.

Owner: Mike Paul (Brisbane, Australia/Brisbane). Budget: $0. This business is separate from Klieg: no shared repos, accounts or services.

## Current goals
1. v0 live on free GitHub Pages with 25–40 real, sourced tools. **Done 2026-10-17: 31 tools.** v2 (2026-10-17): 40 tools, 12 task categories.
2. Grow to ~60 tools across all task categories while keeping every listing sourced and dated.
3. Get indexed: submit the sitemap to search engines once a verification method is approved (see open questions).
4. Re-verify pricing and licences regularly, since these change often (see routines).

## Routines
- **Monthly (first Saturday):** re-check each tool's pricing and licence source links. Update `pricing`, `license`, `commercial` and `lastChecked` in `data/tools.json`. Mark anything that can't be confirmed as `unverified`. Remove tools that have shut down.
- **Weekly:** look for new AI game-dev tools and add them only with official-source facts.
- **Weekly (Saturday):** refresh the "New this week" feed (`NEWS` in `content.mjs`): real releases only, each with a source link and a date (AEST); drop items older than about 4 weeks. Mark launch dates `unverified` if the source does not state them.
- **Monthly:** re-check the store AI-disclosure page (`DISCLOSURE` in `content.mjs`) and comparison pages, since they derive from tools.json and store policies.
- **On every change:** push to `main`. Vercel auto-deploys production from `main` (Git-connected). The GitHub Actions Pages workflow only rebuilds the redirect stubs. Then confirm that every URL in https://gamedevaitools.com/sitemap.xml returns 200.
- **Inbound:** handle tool suggestions and corrections through GitHub issues (linked from /get-featured/).

## Metrics
No analytics are installed (none approved yet). Trackable right now with no tracking code:
- Number of tools listed (31 at launch, 40 at v2) and number of category pages.
- Share of listings checked within the last 30 days.
- Share of fields marked `unverified` (target: going down).
- GitHub repo traffic (Insights → Traffic; repo only, not the site).
- Newsletter subscribers: contact count in the Resend audience.
- Tool submissions: GitHub issues labelled `submission`.
Later, if approved: site visits, top tool pages, search queries.

## Decisions log
- **2026-10-17:** Chose a directory of AI tools for game developers as the micro-business (per Mike).
- **2026-10-17:** Hosting on Mike's personal GitHub (`michaelpaulrattray/gamedev-ai-tools`, public) with free GitHub Pages deployed through Actions (per Mike).
- **2026-10-17:** Stack is plain HTML/CSS/JS from a zero-dependency Node build script (`build.mjs`), with `data/tools.json` as the single source of truth. Chosen for speed, $0 cost and no dependency maintenance.
- **2026-10-17:** Editorial policy: vendor-sourced facts only, with source links and a last-checked date; `unverified` when unclear; no reviews, ratings or user counts; no affiliate links.
- **2026-10-17:** The newsletter is a disabled "coming soon" placeholder that collects nothing. The "Get featured" page has no prices.
- **2026-10-17:** Domain gamedevaitools.com bought by Mike on Vercel; hosting moved to Vercel (project `gamedev-ai-tools` in Mike's Vercel team). Site now builds for the domain root: canonical URLs, sitemap and robots.txt point at https://gamedevaitools.com. www redirects (308) to the apex.
- **2026-10-17:** Old GitHub Pages URL (michaelpaulrattray.github.io/gamedev-ai-tools/) now serves redirect stubs only (instant meta refresh + JS redirect + canonical to the same path on gamedevaitools.com). Reversible: in `.github/workflows/pages.yml`, switch the build step back to `node build.mjs` with `SITE_ORIGIN`/`SITE_BASE` env and upload `dist`, or disable Pages in repo settings.
- **2026-10-17:** Published a minimal privacy note (no data collected; mentions that GitHub Pages hosting may process IPs). Pending Mike's review, see open questions.

- **2026-10-17:** Vercel connected to GitHub by Mike; verified that a push to `main` (commit 3cb21a5) auto-deployed production.
- **2026-10-17:** v1: added a one-line "verdict" to every tool, written only from the sourced facts already on each listing (no ratings or reviews).
- **2026-10-17:** v1: "Submit a tool" page (`/submit/`) posts to `/api/submit` (Vercel function, honeypot field `company`). No `GITHUB_TOKEN` is set on Vercel: putting Mike's broad gh OAuth token on a server was judged unsafe. So the function validates the form and redirects the submitter to a prefilled GitHub new-issue form (`.github/ISSUE_TEMPLATE/tool-submission.md` applies the `submission` label). If Mike creates a fine-grained token (this repo only, Issues: read/write) and sets it as `GITHUB_TOKEN` on the Vercel project, the same function files issues directly with no code change.
- **2026-10-17:** v1: newsletter signup via Resend. Created Resend audience "Game Dev AI Tools newsletter" (id 948e7a35-dcea-4a83-b260-8b68439b25b7) with the key Mike provided. Set `RESEND_API_KEY` (sensitive) and `RESEND_AUDIENCE_ID` on the Vercel project (production and preview). `/api/subscribe` only adds contacts and never sends email. No emails have been sent to anyone. (Superseded by the next entry: the form is currently off.)
- **2026-10-17:** Newsletter rolled back to "coming soon". The `RESEND_API_KEY` value that reached Vercel was a redacted placeholder (the secret was redacted in transit), so the live test subscribe failed. The form is now enabled only when `NEWSLETTER_ENABLED=1` is also set on Vercel (it is not). The redaction was not worked around. The fake test contact was removed from the audience. **To enable (Mike):** in Vercel → gamedev-ai-tools → Settings → Environment Variables, replace `RESEND_API_KEY` with the real key, add `NEWSLETTER_ENABLED=1`, redeploy, then run one test subscribe with a fake address and delete that contact in Resend.
- **2026-10-17:** Submission flow tested end to end: test issue #1 was created through the prefilled link and then closed.
- **2026-10-17:** Redesign: dark directory UI (hero, search chips, category tiles with art, logo cards, mobile-first). Hero and category art generated with Mike's Higgsfield account: 15 images, about 1.8 credits from the existing balance, no purchases. Tool logos are each vendor's own favicon/logo fetched from their official site and stored in `src/assets/logos/` (sources in `SOURCES.json`); we remove any on request. Monograms are used where the official icon was misleading or unusable. Live Lighthouse (mobile): performance 100, accessibility 100, best practices 96, SEO 100. Screenshots: /workspace/screens/before-* and after-* on the agent box.
- **2026-10-17:** v2: 12-task taxonomy (concept art, 3D models, textures, animation, voice, music & SFX, NPC, code, level generation, localisation, QA, trailers & marketing). Old /category/pixel-art/ and /category/game-design/ redirect (308) to /category/concept-art/. 40 tools (9 added: World Labs Marble, HunyuanWorld, Crowdin, Gridly, modl.ai, nunu.ai, Razer QA Companion, Runway, Luma AI). New listing fields: best for, free tier, export formats, revenue share/caps, API and MCP availability (all sourced, or `unverified`). Filters: task, engine, free plan, safe to ship commercially. Added 3 sourced workflow guides, a store AI-disclosure page (/steam-ai-disclosure/), a "New this week" feed (/new/), 14 comparison pages built from published specs only, and a sponsor page (/sponsor/: two tiers, pricing on request, enquiries via GitHub issue, no payment link). 79 sitemap URLs, all 200.

## Open questions (need Mike's approval)
1. ~~Custom domain~~ Resolved 2026-10-17: Mike bought gamedevaitools.com on Vercel.
1a. ~~Vercel GitHub integration~~ Resolved 2026-10-17: connected by Mike.
2. ~~Newsletter provider~~ Resolved 2026-10-17: Resend (key provided by Mike).
3. **Analytics choice:** none, a privacy-friendly option, or Google Search Console only. The privacy note must be updated before adding anything.
4. **Privacy note (needs updating, Mike's approval required):** /privacy/ still says no data is collected and that the site is hosted on GitHub Pages. Hosting is now Vercel, tool submissions (public GitHub issues, optional email shown publicly) are live, and newsletter signup (emails stored in Resend) will be once enabled. Please approve new wording, or ask for signup/submissions to be switched off until it's updated.
4a. **Newsletter sending:** no sending domain is verified in Resend and nothing has been sent. Before the first send we need a verified sending domain (e.g. a DNS record on gamedevaitools.com), double opt-in or not, an unsubscribe flow, and a physical/contact address if required. Each of these needs Mike's decision.
4b. **Submissions token (optional):** a fine-grained GitHub token for direct issue creation (see decisions log). Without it, submitters need a GitHub account.
4c. **Abuse protection:** honeypot only, with no rate limiting. Revisit if spam appears.
5. **Search engine submission:** OK to verify the site in Google Search Console / Bing Webmaster Tools? (Free, but it needs a Google or Microsoft account login. No new accounts have been created.)
6. **Sponsorship (/sponsor/):** confirm the two tiers and the pricing ("on request" for now), and choose a private contact method. Enquiries currently go to public GitHub issues because no business email exists. The Newsletter slot tier is unavailable until the newsletter launches. Sponsored placements would need a visible "Sponsored" label.
7. **Newsletter key:** see the decisions log (replace the redacted `RESEND_API_KEY` and set `NEWSLETTER_ENABLED=1`).
