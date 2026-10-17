# Brief: Unreal Engine AI tools hub

Status: Briefed · Written 17 Oct 2026 (AEST) by the SEO research agent · Ideas board rank 3
This is a brief for the CEO bot to write from, not the article. Copy Humanizer polishes the draft afterwards. Use Australian English (licence as the noun, license as the verb, localisation, organise).

## 1. Slug and URL

- Slug: `unreal`. URL: **`/engine/unreal/`**.
- The page already exists as a generated page. As of 17 Oct 2026, `ENGINE_PAGES` in build.mjs defines `unreal: { label: 'Unreal', page: 'unreal', h1: 'AI tools for Unreal Engine developers', what: 'Unreal Engine' }`, and the "Engine pages" loop over `engineList` renders `/engine/<page>/` with an `ItemList` and `BreadcrumbList`. Same as the Godot and Unity briefs, this brief supplies the editorial layer: the opening answer, the sections, the FAQ and extra schema. If the CEO adds per-engine copy fields to `ENGINE_PAGES` (for example `intro`, `sections`, `faq`) for Godot and Unity, use the same fields here so all five engine pages share one template.
- **Title fix needed.** The engine-page loop builds the title as `${e.h1} (${year}) | ${SITE.name}`. For Unreal that's `AI tools for Unreal Engine developers (2026) | GameDev AI Tools`, which is **63 characters**, over the 60 limit. Override the title for this page (see 6). The generated meta description is also too long, at **174 characters** with today's 16 tools, because "Unreal Engine" is a long `what` value. Override that too.

## 2. Target reader and job to be done

- Reader: an indie or small-studio Unreal Engine 5 developer (Blueprints and/or C++), usually more production-minded than the Godot audience. Often already uses Fab and thinks about the Unreal royalty.
- Job: "Tell me which AI tools genuinely plug into Unreal (Epic's own MCP plugin, editor plugins, or clean imports), what they cost, and whether the output is safe to ship and to sell on Fab."

## 3. Search intent

Mixed: commercial investigation ("which tool for Unreal") and informational ("how do I connect Claude Code to Unreal", "does Unreal have MCP"). The Unreal MCP angle is new, documented on Epic's own site, and very few comparison pages cover it yet.

## 4. Terms

- Primary: AI tools for Unreal Engine; Unreal Engine AI plugin.
- Secondary: Unreal MCP; Unreal Engine MCP server; Claude Code Unreal Engine; Cursor Unreal Engine; AI for Blueprints; AI 3D models for Unreal (FBX/GLB); AI NPCs Unreal (Inworld, Convai); Fab AI-generated content rules; Unreal Engine royalty AI.
- No search volume data was available, so don't claim any.

## 5. Questions to answer (as people ask AI assistants)

1. Does Unreal Engine have built-in AI assistant or MCP support?
2. How do I connect Claude Code, Cursor or Codex to the Unreal Editor?
3. Which AI plugins run inside the Unreal Editor?
4. Which AI 3D generators export to Unreal?
5. What are the options for AI-driven NPC conversations in Unreal?
6. Can I sell AI-generated assets on Fab?
7. Does using AI change the Unreal Engine royalty or licence?

## 6. Title tag, meta description, H1

- Title tag (≤60, with the hand-added suffix): **`AI tools for Unreal Engine (2026) | GameDev AI Tools`** (52 characters). Without the suffix: **`AI tools for Unreal Engine 5: MCP, plugins, licences`** (52).
- Meta description (≤155): **`AI tools that work with Unreal Engine 5: Unreal MCP, coding agents, editor plugins and asset generators, with vendor pricing and commercial terms.`** (146)
- H1: **AI tools for Unreal Engine developers** (as set in `ENGINE_PAGES.unreal.h1`; keep it, since the H1 has no length limit).

## 7. Answer-first opening paragraph (40–60 words; quotable)

> Unreal Engine 5.8 includes Unreal MCP, an experimental Epic plugin that lets agents such as Claude Code, Cursor and Codex drive the editor over a local connection. Beyond that, AI reaches Unreal through editor plugins like Ludus AI and generators whose files Unreal imports. Below: what each tool costs and whether you can ship it.

(55 words. Keep "experimental" in the first sentence: Epic's own page calls it an Experimental feature. Re-check the engine version in the doc title on the day of writing.)

## 8. Outline (H2/H3 and what each must say)

- **H2 Quick answer: what works with Unreal today.** A table of the featured tools: name, route (Epic plugin / MCP / editor plugin / file export / runtime SDK), free plan, commercial-use badge, check date. Use the existing licence badges and `timeEl()` dates, with absolute dates, not "today".
- **H2 Unreal MCP: Epic's official way to let an agent drive the editor**
  - What it is, quoted from Epic's doc: an MCP server embedded "inside the Unreal Editor process so that any MCP-compatible AI agent, such as Claude Code, Cursor, or the MCP Inspector, can drive the editor over a local HTTP connection".
  - Setup in four lines from the doc: enable the **Unreal MCP** and **All Toolsets** plugins (the server exposes no tools without All Toolsets); turn on *Auto Start Server* under Editor Preferences › Model Context Protocol, or run `ModelContextProtocol.StartServer`; run `ModelContextProtocol.GenerateClientConfig <Client>` (supported names: `ClaudeCode`, `Cursor`, `VSCode`, `Gemini`, `Codex`, `All`); start the agent from the project root. Default endpoint `http://127.0.0.1:8000/mcp`.
  - Limits, quoted not paraphrased: Experimental ("use caution when shipping with it"); "many features are incomplete or missing"; by default it accepts connections only from the same machine and "has no authentication layer"; tool calls run serially on the game thread, so clients shouldn't overlap calls.
  - H3 *Epic's Claude Code plugin.* Epic publishes `EpicGames/unreal-engine-skills-for-claude-code-plugin` on GitHub (MIT licence). The README says it controls the Unreal Editor from Claude Code via MCP, with "hundreds of tools" across "30+ toolsets" (actors, Blueprints, materials, Niagara, Sequencer and more). It needs the ModelContextProtocol and AllToolsets plugins enabled. Don't quote star or fork counts; the site publishes no popularity numbers.
- **H2 AI coding agents for Blueprints and C++**
  - H3 *Cursor, GitHub Copilot, Windsurf.* They aren't tagged Unreal in data/tools.json, because none of the vendors documents an Unreal plugin, so they don't appear in the generated list. Mention them in prose as MCP clients (`mcp.status = client`) that can connect to Unreal MCP. Cursor is a supported `GenerateClientConfig` target, and Copilot is covered through `VSCode`. Link their tool pages and /compare/cursor-vs-github-copilot/.
  - H3 *Ludus AI (in-editor).* From data: an AI toolkit that runs inside the Unreal Editor and works with Blueprints, C++, assets and levels; a 14-day Pro trial, then from $25/month; the free account has no credits. Output and ownership terms are **Not stated by vendor** in our data. Say so plainly.
- **H2 Asset generators that export to Unreal**
  - H3 *3D models and worlds.* Meshy (free plan = CC BY 4.0, attribution needed), Tripo (paid plan needed to ship), Hyper3D Rodin (commercial terms Not stated by vendor), Sloyd (paid plan needed), World Labs Marble (restricted, so read the terms). For each, give the Unreal route the vendor states and the export formats. Link /guides/ai-3d-model-to-engine/ and /compare/meshy-vs-tripo/.
  - H3 *2D, sprites and textures.* Retro Diffusion (free-plan output can be shipped commercially, per its FAQ) and Scenario (free plan is for personal and evaluation use only; paid plans include a commercial licence). Link /guides/concept-to-texture-set/ for Unreal texture import settings, which content.mjs already sources from Epic's docs.
  - H3 *Animation and motion capture.* Cascadeur (Free = non-commercial; Indie only under $100,000 a year in revenue or funding; Pro/Teams = full commercial) and Rokoko Vision (commercial terms Not stated by vendor).
- **H2 AI NPCs and voice at runtime.** Inworld AI, Convai and Charisma.ai. These ship inside your game as runtime services, not one-off assets, so cover pricing per use, data and ownership terms from each tool's data entry, and the fact that players' inputs go to a third party (link each vendor's terms; don't characterise the privacy terms beyond quoting them).
- **H2 Localisation and QA.** Crowdin and Gridly (commercial terms Not stated by vendor in our data) and nunu.ai (tests games; makes no shippable assets, so licence = not applicable).
- **H2 Selling AI-made assets on Fab.** From Epic's Fab/Marketplace distribution terms: listings where a material portion is created with generative AI must carry the **CreatedWithAI** tag; AI upscaling or content-aware fill alone doesn't trigger it; a **NoAI** tag means buyers may not use the content in generative-AI datasets or development. Quote the clauses and link them. (The fetch tool was blocked from fab.com and unrealengine.com, so the writer must open those pages and confirm the exact wording; see 10.)
- **H2 Does AI change the Unreal licence or royalty?** Keep this short and factual. The Unreal Engine EULA royalty is reported as 5% of gross revenue above the first US$1 million per product, with Epic Games Store revenue excluded. Quote Epic's licence page and add no interpretation. Say nothing about AI unless Epic's EULA says something. Then point to Steam's AI disclosure (/steam-ai-disclosure/), and note that we found **no AI disclosure requirement for the Epic Games Store** as of 17 Oct 2026. Word that as "we didn't find one", not "there isn't one".
- **H2 Other engines.** Use the existing chips to /engine/unity/, /engine/godot/, /engine/blender/, /engine/roblox/.

## 9. Tools to feature (from data/tools.json)

Unreal-tagged as of 17 Oct 2026 (16): retro-diffusion, scenario, meshy, tripo, hyper3d-rodin, sloyd, cascadeur, rokoko-vision, ludus-ai, inworld-ai, convai, charisma-ai, world-labs-marble, crowdin, gridly, nunu-ai. The generated list shows them alphabetically. Don't reorder them as a ranking.

Mention in prose, but don't tag them, because no vendor documents an Unreal plugin: cursor, github-copilot, windsurf (MCP clients).

### Tools to consider adding (new listings), with sources

| Candidate | Why | Source |
|---|---|---|
| Unreal MCP (Epic, built in) | Official, free with the engine, and the main new topic. It could be a tool page or just a section here. If listed, licence = Unreal Engine EULA, and output = whatever the agent writes into your project | https://dev.epicgames.com/documentation/unreal-engine/unreal-mcp-in-unreal-editor |
| Epic's Claude Code plugin | Official Epic repo, MIT licence | https://github.com/EpicGames/unreal-engine-skills-for-claude-code-plugin |

Don't add community Unreal MCP servers from GitHub without reading each licence. Now that Epic ships its own, a list of community forks adds little.

## 10. Facts to verify before publishing (vendor source for each)

Rule: if a vendor page doesn't clearly state it, the page says **"Not stated by vendor"**.

| Fact | Status on 17 Oct 2026 | Source |
|---|---|---|
| Unreal MCP is Experimental and documented for UE 5.8 | Verified (doc title "Unreal Engine 5.8 Documentation"; "Experimental feature") | dev.epicgames.com Unreal MCP page |
| Default endpoint 127.0.0.1:8000/mcp; localhost only; no authentication; serial tool calls | Verified | same |
| `GenerateClientConfig` clients: ClaudeCode, Cursor, VSCode, Gemini, Codex, All | Verified | same |
| All Toolsets plugin needed for any tools | Verified | same, and the Epic GitHub README |
| Epic Claude Code plugin is MIT and claims "hundreds of tools" and "30+ toolsets" | Verified (README) | github.com/EpicGames/unreal-engine-skills-for-claude-code-plugin |
| Which UE version first shipped Unreal MCP | **Not verified**. Only the 5.8 doc was read | Epic release notes |
| Fab: CreatedWithAI required when a "material portion" is AI-generated; upscaling and content-aware fill excluded; NoAI bars use in genAI datasets | **Not verified first-hand.** fab.com and unrealengine.com returned 403 to the fetch tool; wording seen in search results only | Fab distribution agreement; forums.unrealengine.com "Update on products generated with AI" |
| Unreal royalty: 5% above the first US$1M gross per product; Epic Games Store revenue excluded | **Not verified first-hand** (403); seen in search results only | unrealengine.com/en-US/license |
| Epic Games Store has no AI disclosure requirement | **Not verified**. No requirement found, which isn't proof none exists | Epic Games Store developer docs |
| Whether Epic offers its own in-editor AI chat assistant | **Not verified**. Don't claim either way | Epic docs |
| Ludus AI output ownership and commercial terms | Not stated by vendor (as in data) | ludusengine.com/terms |
| Ludus AI pricing (14-day Pro trial; $25/$80/$180 a month) | In data; re-check | ludusengine.com |
| Each 3D tool's stated Unreal route and export formats | Re-check each `sources` entry | vendor pages |
| Cascadeur Indie revenue cap of $100,000 a year | In data; re-check | cascadeur.com/plans |

## 11. Structured data

- Keep the generated `ItemList` and `BreadcrumbList` (All tools › Unreal).
- Add `FAQPage` from the FAQ block below.
- Optionally wrap it in `CollectionPage` with `dateModified` = the latest `lastChecked` among the listed tools, to match the Godot and Unity briefs.
- Don't add `SoftwareApplication` ratings or offers. The site publishes no ratings.

## 12. Internal links

- **From this page to:** every listed /tools/<slug>/ page (generated), /tools/cursor/, /tools/github-copilot/, /tools/windsurf/, /guides/ai-3d-model-to-engine/, /guides/concept-to-texture-set/, /compare/meshy-vs-tripo/, /compare/cursor-vs-github-copilot/, /steam-ai-disclosure/, /cheat-sheet/, /category/3d-models/, /category/code/, and the other engine pages.
- **To this page from:** the homepage engine chips (already there through `engineList`), each Unreal-tagged tool page's engine row, /guides/ai-3d-model-to-engine/ and /guides/concept-to-texture-set/ (both cite Unreal docs in content.mjs), the future copyright guide, the footer and llms.txt.

## 13. How to beat the competing pages

- **assetforgeindex.com/engines/unreal** ("AI Tools for Unreal Engine Game Dev (2026): Plugins, Exports & Licences"). It lists 10 of 49 tools by vendor-stated support, grouped as "Official plugin / add-on" and "Export formats", with a FAQ. **Gap (checked 17 Oct 2026):** the page doesn't mention Unreal MCP or Fab's AI rules. Epic's own MCP server and the Fab CreatedWithAI/NoAI tags are the two things an Unreal dev most needs to know in 2026, and both have primary sources.
- **Community MCP repos and blog posts.** These are scattered, and many predate Epic's official plugin. **Gap:** a neutral, dated summary that says "use Epic's plugin, here are its limits" with quotes.
- **Edge to keep:** each licence catch beside each tool, plus the Unreal-specific business questions (Fab tags, royalty) answered from Epic's own pages.

## 14. FAQ block (4–6)

1. **Does Unreal Engine have MCP support?** Yes. Unreal Engine 5.8 documents Unreal MCP, an experimental plugin that runs an MCP server inside the editor on your own machine. Epic's doc says to use caution when shipping with it.
2. **How do I connect Claude Code or Cursor to Unreal?** Enable the Unreal MCP and All Toolsets plugins, start the server, then run `ModelContextProtocol.GenerateClientConfig ClaudeCode` (or `Cursor`) in the editor console to write the config file.
3. **Can I use AI-generated assets in a paid Unreal game?** The engine licence doesn't address it as far as we found. What matters is each tool's terms, so link the cheat sheet and each tool's verdict. (Not legal advice.)
4. **Can I sell AI-generated assets on Fab?** Epic's terms require the CreatedWithAI tag when a material portion of a listing was made with generative AI. Quote and link the clause.
5. **Which AI 3D generators export to Unreal?** List the tools tagged Unreal in our data (as of 17 Oct 2026: Meshy, Tripo, Hyper3D Rodin, Sloyd and World Labs Marble), with each one's licence catch.
6. **Does the Epic Games Store require AI disclosure?** We didn't find a requirement as of the check date. Steam does, so link /steam-ai-disclosure/.

## 15. Success criteria

- The page is live at `/engine/unreal/`, in sitemap.xml and llms.txt, with a title of 60 characters or fewer and a meta description of 155 or fewer. ItemList, BreadcrumbList and FAQPage JSON-LD validate in Google's Rich Results Test.
- Every fact has a source link and an absolute check date. Anything unconfirmed says "Not stated by vendor".
- The opening paragraph stays answer-first and between 40 and 60 words.
- At least 6 internal links in and at least 10 out, as listed in 12.
- Measure after indexing (no baseline exists because the site launched 17 Oct 2026): the page is indexed in Search Console and Bing Webmaster Tools within 14 days. Then track impressions for "Unreal" and "Unreal MCP" queries. Then manually check, monthly, whether ChatGPT, Perplexity and Google AI Overviews cite the page for questions 1, 2 and 6 in section 5. Don't set position targets.
