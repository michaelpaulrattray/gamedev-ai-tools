# Ranking research runbook

How gamedevaitools.com ranks tools, and how an agent (or a person) keeps the rankings current. Rankings are the
site's main selling point: every rank must be backed by independent evidence a reader can check.

The public explanation lives at `/how-we-rank/` (built from `build.mjs`). This file is the working procedure.

## How a rank is calculated

Each tool in a job (category) gets a score out of 100 from four signals:

| Signal | Weight | What counts |
|---|---|---|
| `bench` Benchmarks | 35% | Independent blind-vote leaderboards and measured tests |
| `reviews` Expert reviews | 25% | Independent hands-on reviews and same-input side-by-side tests |
| `users` User reports | 25% | Review-site ratings (25+ reviews) and sampled community threads |
| `fit` Game-dev fit | 15% | Computed by the build from `data/tools.json`; never entered by hand |

- A missing signal is re-weighted away, not counted as zero.
- **Confidence tiers:** 2+ of bench/reviews/users = *Ranked on independent evidence* (ranked first). Exactly 1 = *Provisional*. 0 = *Not enough evidence yet* (ranked last, on fit only). Only confident tools show an overall score.
- **Ties:** confident tools within 3 points share a rank (joint #1). Comparison pages then show "Too close to call".
- **Fit (0-100):** job is the tool's main task 40, each of Godot/Unity/Unreal integration 8, public API 8, official MCP 4, free plan 12 (trial 6), commercial use allowed 12 (paid-only 8, restricted 4). Licence terms are deliberately a small part.

Weights, the tie gap and the fit formula live in `build.mjs` (`SIGNALS`, `TIE`, `fitScore`). Change them only with Mike's approval and update `/how-we-rank/` in the same commit.

## Where the data lives

- `data/evidence/<task>.json`: one file per job, keyed by the task id in `TASKS` (`3d-models`, `animation`, `concept-art`, `textures`, `voice`, `audio`, `npc`, `code`, `level`, `localisation`, `qa`, `marketing`). A job with a file uses this scoring; a job without one still uses the older method (`data/rankings.json`).
- `docs/research/<date>-<task>.json`: the raw research notes behind each update (audit trail). Keep them; never publish them.

### Evidence file format

```json
{
  "task": "3d-models",
  "checked": "2026-10-24",
  "tools": {
    "<tool-slug>": {
      "bench":   [{ "source": "3D Arena blind vote", "url": "https://...", "detail": "Render board: Meshy 6 #3 of 24", "score": 91.3 }],
      "reviews": [{ "source": "StraySpark blog", "url": "https://...", "date": "2026-04-23", "summary": "own words, 1-2 sentences", "score": 75 }],
      "users":   [{ "source": "Trustpilot", "url": "https://...", "detail": "4.7/5 from 3,888 reviews", "score": 92.5 },
                  { "source": "Community threads (15 read)", "url": "https://first-thread", "detail": "4 positive, 7 mixed, 4 negative", "score": 50 }],
      "vendorClaims": [{ "text": "own words", "url": "https://..." }],
      "strengths":  ["max 3 short phrases, from independent sources"],
      "weaknesses": ["max 3 short phrases"],
      "examples": [{ "type": "sketchfab", "uid": "32-hex-id", "title": "...", "author": "...", "licence": "CC BY", "url": "https://sketchfab.com/3d-models/..." }],
      "note": "optional: e.g. which model version the evidence covers"
    }
  },
  "videos": [{ "id": "youtubeId", "title": "...", "channel": "...", "start": 656, "url": "https://www.youtube.com/watch?v=...", "tools": ["slug-a", "slug-b"] }],
  "labels": { "<tool-slug>": "optional custom label, e.g. Best free (self-hosted)" },
  "notes": "optional: category-level gaps, e.g. tools we should add"
}
```

Every item needs a `url` and a numeric `score`, or the build ignores it. Every slug must exist in `data/tools.json`.

## Scoring rules (apply exactly; they are what makes ranks comparable)

**Benchmarks** (`bench`)
- One item per leaderboard board (e.g. 3D Arena render board, 3D Arena topology board, top3d.ai textured, top3d.ai geometry).
- Use the best **current** model the tool's service actually runs. Never use an old or different model (e.g. Tripo's open-source TripoSR is not Tripo's service; Tencent's hosted Hunyuan 3.x is not the open 2.1 we list).
- Score = percentile on that board: `100 * (boardSize - rank) / (boardSize - 1)`. #1 = 100, last = 0.
- Skip live boards for a season still in progress if a completed season exists. Skip papers written by a competing model maker.

**Reviews** (`reviews`)
- Independent only: not the vendor, not a reseller/aggregator that sells the tool, not an author employed by a competitor (e.g. the HackerNoon test written by a Meshy employee is excluded), not a page full of the tool's affiliate or invite codes.
- Must be opened and read (not just a search snippet).
- Rate 0-100 on what the review found about this tool: 90 best in class / clear winner, 75 strong with minor caveats, 60 decent, 45 mixed, 30 mostly negative, 15 poor.
- Prefer the last 18 months. Older reviews of a tool that has since had a major rebuild should be flagged in `note` and replaced when newer ones exist.

**User reports** (`users`)
- Review-site ratings (Trustpilot, G2, Capterra, Product Hunt, Steam): only with **25+ reviews**, and only for the product we list (not a separate mobile app; not the whole company's other products). Score = `(rating - 1) / 4 * 100` on a 5-point scale.
- Community posts: **X (Twitter) is the main source** (Reddit blocks our fetchers). Sample 10-15 recent posts per tool from real users talking about their own results, via the logged-in browser (Claude in Chrome) with searches like `"tripo" (3d OR mesh OR topology) lang:en -from:<vendor>`. Exclude vendor and staff accounts, posts with referral or invite codes, "50 AI tools" listicles and bots. Add Hacker News and Unity/Unreal/Godot/Blender forum threads where relevant. Need **3+** usable posts. Positive 100, mixed 50, negative 0; ignore neutral; add one aggregate item per platform with the counts (e.g. `X posts (12 read)`). X sampling is read-only: never like, reply, post or follow.
- Note known skews in `detail` or the raw notes (e.g. Trustpilot dominated by billing complaints, or a burst of invited reviews).

**Vendor claims** are recorded in `vendorClaims` and shown on comparison pages, but never scored.

**Examples** (real-world results on comparison pages)
- Only other people's public work we can legally show without copying files: Sketchfab models (embedding enabled; prefer CC licences) and YouTube same-input comparison videos. They load only when a visitor clicks.
- Exclude vendor marketing accounts, uploads made by a competitor, and anything heavily hand-edited.
- Never download, re-host or screenshot someone else's images or footage.

## Schedule

| When | Job | What to do |
|---|---|---|
| Weekly (Monday) | Benchmarks | Re-read each leaderboard used in `data/evidence/*`. Update ranks, board sizes and scores; add new boards or new current model versions. Bump `checked`. |
| Monthly (first week) | Reviews + users | For each evidence file: search for new independent reviews and side-by-side tests (last 30 days), re-sample community threads, refresh review-site ratings. Replace stale items. |
| When it happens | Triggers | A new tool is listed; a tool ships a major new model or a rebuilt product (e.g. Rokoko Vision 3.0); a new benchmark or arena appears; a reader reports an error. Research just that tool or board. |
| Weekly until done | Rollout | Move one more job to evidence scoring each week. Suggested order: `voice`, `audio`, `concept-art`, `code`, `textures`, `npc`, `level`, `marketing`, `localisation`, `qa`. |
| Quarterly | Full re-research | Redo each job from scratch with a fresh brief, compare against the current file, and note what changed and why. |

## Procedure for one update

1. `git pull`, then create a branch: `research/<task>-<YYYY-MM-DD>`.
2. Run the research brief below (one agent per job). It returns raw notes; save them to `docs/research/<YYYY-MM-DD>-<task>.json`.
3. **Verify before scoring.** Open every URL you will cite. Drop anything unverified, non-independent, or about the wrong model version.
4. Apply the scoring rules above and write `data/evidence/<task>.json`. Keep `strengths`/`weaknesses` to what independent sources say.
5. Build: `node build.mjs`. Check the category page (`dist/category/<page>/index.html`) and two comparison pages for that job. Sanity check: if a rank moved a lot, the raw notes must explain why.
6. Commit with a message that lists rank changes and the main reasons, e.g. `Rankings: 3d-models refresh (Tripo +1 after top3d.ai Oct season)`.
7. Push the branch, open a PR, and post the Vercel preview link plus the rank changes for Mike. **Don't merge ranking changes without Mike's OK** (routine weekly benchmark number updates that move no rank may be merged directly, then logged in `OPERATIONS.md`).
8. Log the update in `OPERATIONS.md`.

## Research brief (template)

Use this as the prompt for a research agent. Replace `<...>`.

> You are researching evidence to rank AI tools for the job "<job label>" for gamedevaitools.com, an independent directory that helps game developers find and compare AI tools. Accuracy and honesty matter far more than completeness: never invent a source, number, rating or quote. Record null when you can't find something.
>
> Tools: <slug — name (url) — one-line description, one per line>. Focus on the main tools first.
>
> Collect, per tool:
> 1. **benchmarks**: independent blind-vote leaderboards or measured tests (known for this job: <list, e.g. 3D Arena, top3d.ai, TTS Arena, Artificial Analysis arenas, LMArena, SWE-bench>). For each: source, url, board/metric, model version, rank, board size, value, date, independent true/false/unclear.
> 2. **reviews**: independent hands-on reviews and same-input comparisons from the last 18 months. For each: outlet, url, date, author, independent true/false, 1-2 sentence summary in your own words, rating 0-100 (90 best in class, 75 strong, 60 decent, 45 mixed, 30 mostly negative, 15 poor).
> 3. **users**: review-site ratings (site, rating, scale, count, url) and 5-10 recent community threads about output quality (url, date, sentiment pos/mixed/neg, one-line note).
> 4. **vendor_claims**, **strengths**, **weaknesses** (from independent sources only), and **examples**: Sketchfab models made with the tool (page url, uid, title, author, licence, embedding enabled) and YouTube same-input comparison videos (url, title, channel, date, timestamp where the comparison starts).
>
> Rules: open every URL you list, or mark it `"verified": false`. Flag vendor-run, reseller, affiliate-heavy or competitor-authored sources as not independent. Keep evidence for different model versions apart. Never quote more than 15 words. Write JSON to `docs/research/<date>-<task>.json` shaped `{"task","checked","tools":{"<slug>":{"benchmarks":[],"reviews":[],"users":{"ratings":[],"mentions":[],"sampled":N},"vendor_claims":[],"strengths":[],"weaknesses":[],"examples":[],"notes":""}},"missing_tools":[],"caveats":""}`. Reply with counts per tool, the overall picture, and the biggest gaps.

## Known sources by job (start here; add as you find more)

- **3D models:** 3D Arena (`https://3d-arena-3d-arena.hf.space/`, render + topology boards), top3d.ai seasons (`https://top3d.ai/leaderboard`; run by an independent creator who sells ad slots, rankings stated not for sale); StraySpark same-prompt tests.
- **Animation / mocap:** no benchmarks for commercial tools yet. TATO Studio same-footage comparison; StraySpark mocap and auto-rig guides; Creative Bloq reviews.
- **Voice:** TTS Arena (Hugging Face), Artificial Analysis speech arena.
- **Concept art / images:** Artificial Analysis image arena, LMArena image boards.
- **Music & SFX:** music arena leaderboards where available.
- **Code:** SWE-bench and similar agentic coding leaderboards (score the model the tool uses by default).
- **Video / trailers:** Artificial Analysis video arena, LMArena video.

## Access notes

- Reddit blocks most fetchers; use X (logged-in browser) instead, plus developer forums. Run one X-sampling agent at a time, in its own browser tab.
- G2 and Capterra often return 403: don't use snippet-only figures (mark unverified, don't score).
- YouTube pages often can't be read: list comparison videos as `examples`, but only score a video as a review if you could read its verdict (transcript, description or chapters).

## Current gaps (2026-10-24)

- Animation: add Move.ai and QuickMagic (both rated above our listed video-mocap tools in independent tests). Re-test Rokoko Vision 3.0 when a review appears.
- 3D models: Thrixel, Dreamlands and Bake3D have no independent evidence yet. Retro Diffusion may not belong in 3D (no 3D feature found).
- All: X sampling replaces Reddit (approved by Mike 2026-10-24).
