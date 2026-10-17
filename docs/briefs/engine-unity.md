# Brief: Unity AI tools hub (with Unity AI credit pricing and output terms)

Status: Briefed · Written 17 Oct 2026 (AEST) by the SEO research agent · Ideas board rank 2
This is a brief for the CEO bot to write from, not the article. Copy Humanizer polishes the draft afterwards. Use Australian English.

## 1. Slug and URL

- Slug: `unity`. URL: **`/engine/unity/`**.
- This matches what the CEO is building. `ENGINE_PAGES` in build.mjs defines `unity: { label: 'Unity', page: 'unity', h1: 'AI tools for Unity developers', what: 'Unity' }` and renders `/engine/<page>/` with the Unity-tagged tools listed automatically. This brief supplies the editorial layer: the opening answer, the Unity AI credits and terms sections, the FAQ and the schema.
- Keep the existing tool page **/tools/unity-ai/** for Unity's own AI product. This hub covers every AI tool that works with Unity, and it gives Unity AI's credits and terms their own H2 linking to that tool page. Don't duplicate the full tool page.

## 2. Target reader and job to be done

- Reader: an indie or small-studio Unity 6 developer, often on Unity Personal, deciding whether to pay for Unity AI or use outside tools.
- Job: "Tell me what Unity AI costs on my plan, what a credit buys, whether I own and can ship what it generates, and which other AI tools plug into Unity."

## 3. Search intent

Commercial investigation plus informational. Pricing and licence questions ("how much does Unity AI cost", "can I use Unity AI assets commercially") are strongly answer-seeking, which suits AEO.

## 4. Terms

- Primary: AI tools for Unity; Unity AI pricing.
- Secondary: Unity AI credits; Unity Credits cost per generation; Unity AI commercial use; Unity AI Assistant free trial; Unity MCP server; Claude Code / Cursor with Unity; AI 3D models for Unity; Unity Asset Store AI disclosure.
- No search volume data was available, so don't claim any.

## 5. Questions to answer (as people ask AI assistants)

From the AI question map (#31, #37) plus related questions:
1. How much does Unity AI cost, and is it free on Unity Personal?
2. How many Unity Credits does it take to generate an image, a texture or a 3D model?
3. Can I use Unity AI-generated assets commercially, and who owns them?
4. Which third-party models power Unity AI's generators, and whose terms apply?
5. Do I need credits to use Claude Code or Cursor with Unity through MCP?
6. Which other AI tools have Unity plugins?
7. Can I sell AI-made assets on the Unity Asset Store?

## 6. Title tag, meta description, H1

- Title tag (≤60). Without the site suffix, use **`AI tools for Unity: Unity AI credits, pricing, licences`** (55 characters). With the suffix, shorten it to **`Unity AI tools and credits | GameDev AI Tools`** (45). The longer suffixed version runs to 61 characters, which is too long.
- Meta description (≤155): **`Unity AI credits and pricing by plan, who owns what it generates, and other AI tools with Unity plugins. Sourced from vendor pages and dated.`**
- H1: **AI tools for Unity developers** (as set in `ENGINE_PAGES.unity.h1`; keep it)

## 7. Answer-first opening paragraph (40–60 words; quotable)

> Unity AI runs on Unity Credits. Pro includes 2,000 a month and Enterprise 3,000. Personal users get a 14-day free trial, then a US$10/month subscription. Unity says you own your inputs and outputs, but its generators also fall under third-party model terms. Below are Unity AI's costs and terms, plus other AI tools that plug into Unity.

(57 words. Every number here must be re-checked on the day of writing; see section 10. The Personal figures are in conflict, see the warning.)

> **Warning: data conflict.** data/tools.json (`unity-ai.pricing`) currently says "Unity Personal (free) includes a 1,000 monthly Unity Credit allowance". On 17 Oct 2026 unity.com/products showed Personal with "Try Unity's AI tools free for 14 days, paid subscription available after trial. 1,000 Monthly credit allowance…". unity.com/features/ai says the Personal trial "converts to a $10/month subscription", and the Guiding Principles say Personal users "can explore a 14-day free trial, with the option to purchase a Unity Credits subscription". Read together, the 1,000 credits seem to come with the paid Personal subscription and are not free. Confirm this, then update data/tools.json and /tools/unity-ai/ to match before this page goes live, so the two pages don't contradict each other.

## 8. Outline (H2/H3 and what each must say)

- **H2 Quick answer: Unity AI cost by plan.** A table with one row per plan (Personal, Pro, Enterprise, Industry if shown): monthly credit allowance, how you get access (trial, then subscription, or included), and the source link with an absolute check date. Add one line: credits reset each billing cycle and don't roll over, AI features pause at zero until reset or a top-up, and extra credit bundles are sold.
- **H2 What a Unity Credit buys.** Reproduce Unity's example table as ranges: AI Assistant message 4–1,500+; image 1–6; texture 1–9; 3D model 8–13; sound effects 1–5; music 3–5; text-to-speech about 3. Quote Unity's warning that these are "representative examples only", vary with the model and the request, and that the Dashboard is authoritative. Don't convert credits to dollars unless Unity publishes a per-credit price; if it doesn't, say "Not stated by vendor".
- **H2 Can you ship what Unity AI generates?**
  - H3 *Ownership.* The Guiding Principles say "You own your input and output data", and training on your content is off by default.
  - H3 *Third-party generator terms.* Unity's Third-Party AI Terms directory (updated 28 Jul 2026) lists Layer AI (sprites; FLUX-based models), Scenario (FLUX, GPT-Image, Google Gemini and Seedream models; 3D, skyboxes, textures, sound, video) and Uthana (animation), each "governed by the respective third-party terms of service". Tell readers to check those terms, and link /tools/layer-ai/ and /tools/scenario/.
  - H3 *UnityAI metadata.* Unity embeds "UnityAI" metadata in all generations so you can find and remove them. Tie this to the Steam disclosure (link /steam-ai-disclosure/).
  - H3 *Plan revenue thresholds.* Pro is "required for businesses with over $200K in funding or annual revenue" per the plans page. Keep it short; it's an engine licence point, not an AI one.
- **H2 Using outside agents with Unity (MCP, CLI, plugin).** The Unity MCP server comes through the Unity CLI, needs Unity 6+, and there's an official plugin for third-party agents (Claude Code, Codex and Grok are listed in the Unity docs navigation). The FAQ says using a third-party agent through the AI gateway doesn't consume Unity credits. Link /tools/cursor/, /tools/github-copilot/, /tools/windsurf/, and a Claude Code page if one is added.
- **H2 Other AI tools with Unity plugins or bridges.** A grouped list from data/tools.json (see 9) with route, free plan and commercial badge. Keep the groups brief by task: 2D/art, 3D, animation/mocap, NPC/dialogue, levels/worlds, localisation.
- **H2 Selling AI-made assets on the Unity Asset Store.** Summarise Unity's rule: AI-generated or AI-assisted content is allowed if it has value and doesn't infringe. You must disclose AI use in the product's marketing data and "AI description" field. Don't use human-effort words like "hand drawn" for AI work, and AI marketing images can only be supplementary. Source it, and add "Not stated by vendor" for anything unconfirmed.
- **H2 FAQ** (see 14).
- **Footer:** the cheat-sheet signup partial.

## 9. Tools to feature (from data/tools.json)

- Tagged `unity` in data/tools.json as of 17 Oct 2026 (18 tools after the CEO's re-tag): **unity-ai**, **scenario**, **ludo-ai**, **meshy**, **tripo**, **retro-diffusion**, **hyper3d-rodin**, **sloyd**, **skybox-ai**, **rokoko-vision**, **inworld-ai**, **convai**, **charisma-ai**, **world-labs-marble**, **crowdin**, **gridly**, **modl-ai**, **nunu-ai**.
- Unity-relevant, engine-agnostic: **layer-ai** (powers Unity AI sprites per Unity's directory), and **cursor**, **github-copilot** and **windsurf** (MCP clients).
- Check, and add the `unity` tag if the vendor states support: **elevenlabs** (look for an official Unity integration page). **layer-ai** stays engine-agnostic unless Layer itself documents a Unity plugin; its role inside Unity AI is a Unity statement, not a Layer one.

### Tools to consider adding, with sources
- **Uthana** (animation generator inside Unity AI): listed at https://unity.com/legal/third-party-ai-terms. Find Uthana's own pricing and terms before listing.
- **Claude Code** (MCP client; Unity documents a plugin): https://unity.com/blog/unity-ai-mcp-how-to-get-started and the Unity docs "Unity's plugin for third-party agents" section.

## 10. Facts to verify before publishing (vendor source for each)

The rule: anything you can't confirm on the source page on the day of writing is written as **"Not stated by vendor"**. Every figure gets a source link and an absolute check date.

| Fact (as seen 17 Oct 2026) | Source |
|---|---|
| Personal: 14-day free trial of Unity's AI tools, then a paid subscription; "1,000 Monthly credit allowance" listed under Personal | https://unity.com/products |
| Personal trial "converts to a $10/month subscription" (currency not stated on the page; don't write A$) | https://unity.com/features/ai (FAQ) |
| Pro: 2,000 monthly credits; Enterprise: 3,000; "Special terms apply to Unity Credits" | https://unity.com/products |
| Pro "from $2,310.00/yr"; Pro required over $200K funding or annual revenue | https://unity.com/products |
| Credits reset each billing cycle, don't roll over, features pause at zero; bundles available | https://docs.unity.com/en-us/ai/credits/credits-about |
| Example credit ranges per activity and the "representative examples only" warning | https://docs.unity.com/en-us/ai/credits/credits-about |
| "You own your input and output data"; training on your content off by default; "UnityAI" metadata; Guiding Principles last updated 19 Aug 2026, "Applicable to Unity Editor 6.7 and below" | https://unity.com/legal/unityai-guiding-principles |
| Third-party generators: Layer AI, Scenario, Uthana; models named; directory last updated 28 Jul 2026 | https://unity.com/legal/third-party-ai-terms |
| MCP server via the Unity CLI, Unity 6+; the official plugin is free; third-party agents via the AI gateway don't consume credits | https://unity.com/features/ai · https://docs.unity.com/en-us/unity-cli/replace-mcp-server-unity-cli |
| Unity Asset Store AI rules (AI description field, disclosure, marketing images) | https://assetstore.unity.com/publishing/submission-guidelines · https://unity.com/legal/asset-store-content-transparency · https://support.unity.com/hc/en-us/articles/16456407029524 |
| Per-credit dollar price | Not found on the pages above, so write "Not stated by vendor" unless the Dashboard or the pricing page publishes it |

## 11. Structured data

- `CollectionPage` + `ItemList` of featured tool pages.
- `BreadcrumbList`: All tools › Engines › Unity.
- `FAQPage` from section 14.
- A `Table` isn't needed. Keep the pricing table as plain HTML so answer engines can read it.
- `dateModified` = the latest check date used on the page.

## 12. Internal links

- **From this page to:** /tools/unity-ai/, /tools/scenario/, /tools/layer-ai/, /tools/ludo-ai/, /tools/meshy/, /tools/tripo/, /tools/sloyd/, /tools/retro-diffusion/, /tools/rokoko-vision/, /tools/world-labs-marble/, /tools/charisma-ai/, /tools/cursor/, /tools/github-copilot/, /compare/scenario-vs-layer-ai/, /compare/meshy-vs-tripo/, /compare/cursor-vs-github-copilot/, /guides/ai-3d-model-to-engine/, /guides/ai-voice-to-lip-sync/, /steam-ai-disclosure/, /cheat-sheet/.
- **To this page from:** /tools/unity-ai/ (add "Unity AI vs other Unity tools" link), every Unity-tagged tool page's Engines row, the homepage engine filter, /guides/ai-3d-model-to-engine/, /guides/ai-voice-to-lip-sync/, the footer, and llms.txt.

## 13. How to beat the competing pages

- **assetforgeindex.com/engines/unity** ("AI tools that work with Unity (2026)", ItemList + FAQ). It lists 13 tools with vendor quotes and marks Unity AI "commercial use allowed / commercial use allowed". **Gap:** it has no credit pricing by plan, no per-activity credit table, nothing on the Personal trial-then-subscription model, and nothing on the third-party generator terms (Layer, Scenario, Uthana) that Unity says also govern outputs. Our edge is the cost-and-terms answer in one dated place.
- **unity.com/features/ai and docs.unity.com.** Authoritative, but the information is spread across pricing, legal and docs pages, and the docs warn their figures may be out of date. **Gap:** a neutral summary that links all of them, with check dates.
- **gamedevaihub.com/claude-code-vs-cursor-for-unity/.** Covers agent choice only. **Gap:** no pricing or licence angle. Link out to our future Claude Code vs Cursor comparison rather than competing on this page.

## 14. FAQ block (4–6)

1. **Is Unity AI free on Unity Personal?** There's a 14-day free trial. After that it's a paid subscription (US$10/month per Unity's FAQ on the check date). Confirm this before publishing.
2. **How many credits does a 3D model cost in Unity AI?** Unity's example range is 8–13 credits, but it says actual use varies and the Dashboard is authoritative.
3. **Do I own what Unity AI generates?** Unity's AI Guiding Principles say you own your input and output data. Its generators are also governed by third-party terms (Layer, Scenario, Uthana).
4. **Do unused Unity Credits roll over?** No. They reset each billing cycle.
5. **Does using Claude Code or Cursor with Unity cost Unity Credits?** Unity's FAQ says third-party agents connected through its AI gateway don't consume Unity credits.
6. **Can I sell AI-generated assets on the Unity Asset Store?** Yes, with disclosure in the AI description field. Follow Unity's submission guidelines.

## 15. Success criteria

- The page is live at the agreed URL, in sitemap.xml and llms.txt; ItemList, BreadcrumbList and FAQPage validate.
- The Personal-plan conflict is resolved, and /tools/unity-ai/ and data/tools.json match this page.
- Every number has a source link and an absolute date. Anything unconfirmed says "Not stated by vendor".
- At least 6 internal links in and at least 15 out (section 12).
- Measure after indexing (no baseline; the site launched 17 Oct 2026): indexed in Search Console and Bing within 14 days. Then track Search Console impressions for "Unity AI" pricing and credit queries. Then check monthly whether ChatGPT, Perplexity and Google AI Overviews cite the page for questions 1–3 in section 5. Don't set position targets.
