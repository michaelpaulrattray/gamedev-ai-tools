# Brief: How to fill in Steam's AI disclosure (example wording)

Status: Briefed · Written 22 Oct 2026 (AEST) by the SEO research agent · Ideas board rank 8
This is a brief for the CEO bot to write from, not the article. Copy Humanizer polishes the draft afterwards. Use Australian English (licence as the noun, license as the verb, localisation, organise).

**Relationship to the live page.** /steam-ai-disclosure/ (live, checked 22 Oct 2026) already gives the short answer ("Yes, Steam asks"), the Pre-Generated vs Live-Generated rules and other stores. It does **not** give example wording, a decision list of what's in or out of scope, or a guardrails example. This page is the task-shaped companion; it must not repeat the policy summary beyond two sentences and must link back to it. Ideas board rank 7 (other stores) is a separate brief: store-ai-rules-beyond-steam.md.

**Not-legal-advice rule.** The example wording is ours, not Valve's. Say so plainly: *"These are example descriptions we wrote, not text Valve supplies or approves. Describe what your game actually does. This isn't legal advice."*

## 1. Slug and URL

- Recommended: **`/guides/steam-ai-disclosure-examples/`**, as a `GUIDES` entry in content.mjs with `kind: 'Guide'` and a `metaTitle` override (the guide template is `g.metaTitle || ${g.title} | ${SITE.name}`).
- Alternative: a `#examples` section on /steam-ai-disclosure/. Not recommended: that page is already long, and a separate URL matches the distinct "what do I write" query.

## 2. Target reader and job to be done

- Reader: a first-time Steam publisher (often solo) at the Content Survey step, who used AI for some art, audio, text, localisation or code, or ships an LLM-driven feature.
- Job: "What exactly do I tick and write in Steam's AI section for my situation, and what can I leave out?"

## 3. Search intent

Task/how-to. Ideas board rank 8 terms: "what to write in Steam AI disclosure", "Steam content survey AI example", "do I disclose Copilot on Steam", "live-generated AI guardrails example". Question map rows 15, 16 and 24 ask the same things. No search volume data was available, so don't claim any.

## 4. Terms

- Primary: Steam AI disclosure example; what to write in Steam AI disclosure.
- Secondary: Steam content survey AI; Steam pre-generated vs live-generated AI; do I need to disclose Copilot on Steam; Steam AI guardrails example; Steam AI disclosure localisation.

## 5. Questions to answer (as people ask AI assistants)

1. What do I write in Steam's AI disclosure?
2. Do I have to disclose using Copilot, Cursor or ChatGPT for code?
3. What counts as Pre-Generated vs Live-Generated?
4. What does a guardrails description look like for AI NPC dialogue?
5. I used AI for placeholder art I replaced. Do I disclose it?
6. Can I change my answers after release?

## 6. Title tag, meta description, H1

- Title tag (≤60): **`Steam AI disclosure: example wording | GameDev AI Tools`** (55).
- Meta description (≤155): **`Example wording for Steam's AI disclosure: art, music, voice, text, localisation and live AI NPCs, plus what's out of scope, like AI coding tools.`** (146)
- H1: **How to fill in Steam's AI disclosure, with examples**

## 7. Answer-first opening paragraph (40–60 words; quotable)

> Describe the AI-made content that ships in your game and that players see or hear, such as art, sound, text or localisation, and say how you made it. Valve says efficiency gains from AI dev tools are "not the focus". If AI generates content while the game runs, also describe your guardrails against illegal content.

(53 words.)

## 8. Outline (H2/H3 and what each must say)

- **H2 What Steam asks, in two sentences.** Quote Valve: the section is "concerned with the use of AI in creating content that ships with your game, and is consumed by players", including "artwork, sound, narrative, localization". Link /steam-ai-disclosure/ for the full rules.
- **H2 In or out of scope? A quick list.** Table: Situation · Disclose? · Why (Valve's wording). Rows: AI concept art you painted over and shipped (yes, Pre-Generated); AI art used only as reference, nothing shipped (state it's our reading of "ships with your game"; Valve doesn't list this case: **Not stated by vendor**); AI music/SFX shipped (yes, "sound"); AI voice lines (yes, sound); AI-translated text (yes, "localization"); Copilot/Cursor/Claude Code for code (Valve: efficiency gains "not the focus"; whether code output itself must be listed is **Not stated by vendor**); placeholder art removed before release (**Not stated by vendor**; note Valve compares answers "relative to the content in your build", and you "must disclose all the adult content you've uploaded in your builds, even if it's not accessible" applies to mature content, not explicitly AI); LLM NPC dialogue at runtime (yes, Live-Generated plus guardrails).
- **H2 Example wording: Pre-Generated.** 5 short, specific examples (art, music, voice, narrative text, localisation). Each names the content, the tool, and the human step. E.g. "Background environment concepts were generated with [tool] and repainted by our artist; final in-game backgrounds are hand-finished." Use placeholders, not real tool endorsements.
- **H2 Example wording: Live-Generated and guardrails.** One NPC-dialogue example covering: model/provider, input filtering, output moderation, blocked topics, player reporting, logging. Quote Valve's requirement to "tell us what kind of guardrails you're putting on your AI to ensure it's not generating illegal content". Note Valve doesn't currently ship Live-Generated AI in Adult Only Sexual Content games.
- **H2 Running costs for live AI.** One paragraph summarising Valve's FAQ options (price it in, microtransactions, subscription, one-off DLC), all via Steam-supported payment methods.
- **H2 Changing answers later.** Valve: some answers "cannot be edited without first contacting Steam Support"; send a summary of what changed.
- **H2 What disclosure doesn't do.** Valve: "Products on Steam must adhere to the content rules, regardless of whether it is disclosed." Link each tool's commercial-use verdict and /cheat-sheet/: disclosure doesn't fix a licence problem.
- **H3 FAQ**, then **Sources and check dates**.

## 9. Tools to feature

- No main tool. Inline links where examples mention task types: /category/concept-art/, /category/music-and-sound/, /category/voice/, /category/localisation/, /category/npc-dialogue/, /tools/inworld-ai/, /tools/convai/, /tools/github-copilot/, /tools/claude-code/.

## 10. Facts to verify before publishing (vendor source for each)

| Fact | Status on 22 Oct 2026 | Source |
|---|---|---|
| Three survey sections; AI section scope ("ships with your game… consumed by players"; "artwork, sound, narrative, localization"); efficiency gains "not the focus" | Verified | https://partner.steamgames.com/doc/gettingstarted/contentsurvey |
| Pre-Generated and Live-Generated definitions; guardrails requirement; Distribution Agreement promises | Verified | Same |
| FAQ: answers locked after approval (contact Steam Support); live-AI cost options; no Live-Generated AI in Adult Only Sexual Content games; disclosure doesn't override content rules | Verified | Same |
| January 2026 revision of the guidance | Reported by Game Developer (16 Jan 2026), as already cited on /steam-ai-disclosure/; re-open before publishing | https://www.gamedeveloper.com/business/valve-tweaks-and-clarifies-ai-disclosure-rules-for-steam |
| Exact form field labels and character limits inside Steamworks | **Not stated by vendor** publicly (form is behind a Steamworks login) | — |
| Whether reference-only or removed placeholder AI content must be disclosed | **Not stated by vendor** | Content Survey page |
| Whether shipped AI-written code must be listed | **Not stated by vendor** (only "efficiency gains… not the focus") | Content Survey page |
| Steam store page "AI Generated Content Disclosure" display to players | Re-check on a live store page before stating | store.steampowered.com |

## 11. Structured data

- Article (datePublished, dateModified), BreadcrumbList (Guides › Steam AI disclosure examples), FAQPage. HowTo is not a good fit; don't add it.

## 12. Internal links

- **From this page to:** /steam-ai-disclosure/ (top and bottom), /cheat-sheet/, the category and tool pages in section 9, /guides/open-weights-model-licences/.
- **To this page from:** /steam-ai-disclosure/ (add a "See example wording" link under the short answer), every tool page's store-disclosure line where one exists, /guides/, llms.txt (`llmsLinks` in build.mjs).

## 13. How to beat the competing pages

- **Valve's own page** describes the rules but gives no examples. **Edge:** concrete, dated example wording plus a scope table, clearly labelled as ours.
- **pcgamer.com / gamedeveloper.com** news pieces explain the change, not the task. **Edge:** task-shaped and evergreen.
- **reddit r/gamedev 13cce1y** (2023 rejection thread) still circulates. **Edge:** current rules with a check date. Check assetforgeindex.com/guides/steam-ai-disclosure for example wording before claiming a gap.

## 14. FAQ block (4–6)

1. **What do I write in Steam's AI disclosure?** Describe the AI-made content that ships and players consume (art, sound, text, localisation) and how you made it. Example wording above is ours, not Valve's.
2. **Do I have to disclose Copilot or ChatGPT for code?** Valve says efficiency gains from AI dev tools are "not the focus" of the section.
3. **What's Live-Generated AI?** Content AI creates while the game runs. You must also describe your guardrails against illegal content.
4. **Can I change answers after release?** Valve says some answers need Steam Support; send a summary of what changed.
5. **Does disclosing make any AI content OK?** No. Valve says products must follow its content rules regardless of disclosure.

## 15. Success criteria

- Page live at /guides/steam-ai-disclosure-examples/, in sitemap.xml and llms.txt, linked from /steam-ai-disclosure/. Title ≤60, meta ≤155.
- Every Valve statement quoted with source link and check date; unknowns say "Not stated by vendor"; the example-wording disclaimer is visible.
- Measure after indexing (no baseline): Search Console impressions for "steam ai disclosure" + "example"/"what to write" queries; monthly manual check of AI assistant citations for questions 1–4. No position targets.
