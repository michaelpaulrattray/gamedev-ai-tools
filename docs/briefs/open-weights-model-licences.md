# Brief: Open-weights AI model licences for game devs

Status: Briefed · Written 17 Oct 2026 (AEST) by the SEO research agent · Ideas board rank 4
This is a brief for the CEO bot to write from, not the article. Copy Humanizer polishes the draft afterwards. Use Australian English (licence as the noun, license as the verb). Not legal advice: the page must say so, as /steam-ai-disclosure/ does.

## 1. Slug and URL

- Slug: `open-weights-model-licences`. Suggested URL: **`/guides/open-weights-model-licences/`**.
- Fit: guides live at `/guides/<slug>/`. The existing GUIDES entries in content.mjs are step workflows (`steps`, `flow`, `outcome`, rendered with HowTo JSON-LD). This page is a reference page, not a workflow. Build it like the Steam page, from a content.mjs object of `sections` made of sourced `s(text, url)` statements, and add it to the /guides/ index and the footer. If the CEO prefers a top-level reference URL like `/steam-ai-disclosure/`, `/open-weights-licences/` also fits. Pick one and redirect the other.

## 2. Target reader and job to be done

- Reader: an indie dev (often solo, often on a home GPU) who wants to avoid subscriptions by running open models locally (ComfyUI, Hugging Face, GitHub releases) for textures, sprites, concept art, 3D meshes or audio.
- Job: "Before I put this model's output in a paid game, tell me in plain words whether the licence lets me, what the catches are (revenue caps, territory, attribution, disclosure, no-training clauses), and where the licence says so."

## 3. Search intent

Informational, with high stakes. Questions are specific and model-named ("is FLUX dev commercial", "Hunyuan3D commercial use"), which is long-tail and winnable for a new site.

## 4. Terms

- Primary: open-weights model licence commercial use games; can I use [model] output commercially.
- Secondary: Hunyuan3D licence EU UK South Korea; Stable Diffusion 3.5 commercial use $1M; SDXL licence commercial; FLUX dev commercial use outputs; FLUX schnell Apache 2.0; TRELLIS licence commercial; TripoSR licence; Stability AI Community License; OpenRAIL++.
- No search volume data was available, so don't claim any.

## 5. Questions to answer (as people ask AI assistants)

From the AI question map (#8, #9) plus related questions:
1. Is Hunyuan3D free for commercial use?
2. Can I sell a game with Hunyuan3D models on Steam if players in the EU or UK can buy it?
3. Can I use Stable Diffusion or SDXL images in a commercial game?
4. Is Stable Diffusion 3.5 free for commercial use? What's the US$1M rule?
5. Is FLUX.1 dev allowed for commercial use? Are its outputs?
6. Is TRELLIS really MIT, and can I ship what it generates?
7. Which open models have no revenue cap or territory limit?

## 6. Title tag, meta description, H1

- Title tag (≤60). Without the suffix, use **`Open-weights AI model licences for game devs (2026)`** (51 characters). With the suffix, use **`Open-weights model licences for games | GameDev AI Tools`** (56).
- Meta description (≤155): **`Can you ship output from Hunyuan3D, SDXL, SD 3.5, FLUX or TRELLIS in a paid game? Each licence's catch, quoted and linked, with check dates.`**
- H1: **Open-weights model licences: what you can ship in a game**

## 7. Answer-first opening paragraph (40–60 words; quotable)

> "Open weights" doesn't mean "free for commercial use". SDXL, FLUX.1 [schnell], TRELLIS and TripoSR carry permissive licences. Stability's Community License is free only under US$1M annual revenue. FLUX.1 [dev] is a non-commercial licence. Hunyuan3D 2.1 excludes the EU, UK and South Korea. Here's each licence's catch, quoted and linked.

(49 words. Each claim maps to a row in section 10. TRELLIS is "permissive" only for the model and most of its code; the dependency caveat sits in its own section.)

## 8. Outline (H2/H3 and what each must say)

- **H2 Quick answer: licence by model.** One table with columns: Model (and version) · Asset type · Licence name · Commercial use of outputs · Revenue or user cap · Territory limit · Other catches · Source · Checked (absolute date). Rows: see section 9. Use the site's existing licence badge tones (green / amber / red / grey). Anything not in the licence text = "Not stated by vendor".
- **H2 Three questions to ask of any model licence.** (1) Does it cover the weights, the outputs, or both? (2) Is there a revenue, user or territory cap? (3) Are there use restrictions you have to pass on, such as content filters, AI disclosure or no-training clauses? Keep it short; it's a framework the rest of the page answers.
- **H2 Image models**
  - H3 *SDXL 1.0 (CreativeML Open RAIL++-M).* Commercial use allowed; use-based restrictions (Attachment A); "Licensor claims no rights in the Output". No revenue cap stated.
  - H3 *Stable Diffusion 3.5 (Stability AI Community License).* Free commercial use for individuals and organisations under US$1,000,000 annual revenue. You must register with Stability for commercial use. "You own any outputs… to the extent permitted by applicable law." Above the cap you need an Enterprise licence.
  - H3 *FLUX.1 [dev], FLUX.2 [dev], FLUX.2 [klein] 9B (BFL non-commercial licences).* Quote both sides of FLUX.1 [dev]: clause 2(d) "You may use Output for any purpose (including for commercial purposes)", and the Non-Commercial Purpose definition, which excludes "use (a) for revenue-generating activity". State plainly that the licence lets outputs be used commercially while restricting the model's use to non-commercial purposes, and that BFL sells commercial licences. Don't resolve this tension for the reader; tell them to read it or get a commercial licence. Also list clause 2(e): content filters or review, and AI disclosure "to the extent required under applicable law". For FLUX.2 [dev] and klein 9B, cite the licence named on the Hugging Face card ("flux-non-commercial-license") and verify the text before describing outputs.
  - H3 *FLUX.1 [schnell], FLUX.2 [klein] 4B (Apache 2.0).* Permissive per the Hugging Face model cards.
  - H3 *Qwen-Image (Apache 2.0).* Permissive per its model card.
- **H2 3D models**
  - H3 *Hunyuan3D 2.1 and HunyuanWorld 1.0 (Tencent Hunyuan Community License).* Quote the territory exclusion (the EU, UK and South Korea). Then cover the MAU clause: a licence request is needed if MAU exceeded 1 million "on the Tencent Hunyuan 3D 2.1 version release date". Tencent "claims no rights in Outputs". You must not use or display Output outside the Territory. You can't use outputs to improve other AI models. The AUP requires identifying machine-generated content placed in a public context. Clause 3(e) covers provider disclosure when you deploy the Works for third parties (relevant to runtime use).
  - H3 *What territory limits mean for a game sold worldwide.* Factual framing only. Steam, itch.io and the other stores sell into the EU and UK by default. The licence says use or display of Output outside the Territory is "unlicensed and unauthorized". The licence doesn't say how this applies to a game sold globally ("Not stated by vendor"). Suggest options without giving advice: region-lock, use a different model, or ask Tencent or a lawyer. The Australian angle: Australia isn't excluded, but most Australian indies sell globally.
  - H3 *TRELLIS and TRELLIS.2 (MIT, with dependency caveats).* The models and most of the code are MIT. The TRELLIS.2 README notes that nvdiffrast and nvdiffrec "operate under separate license terms". The nvdiffrast licence limits use to "non-commercially", meaning "for research or evaluation purposes only". Neither licence says whether this affects generated meshes ("Not stated by vendor"). Show it as a caveat to check, not as a verdict.
  - H3 *TripoSR and TripoSG (MIT).* Permissive per the repos and model cards.
  - H3 *Stable Fast 3D (Stability AI Community License).* Same US$1M rule as SD 3.5.
- **H2 Audio models: Stable Audio Open.** Hugging Face lists "stable-audio-community". Confirm the text before saying it matches the Community License terms above. Contrast it with hosted Stable Audio (/tools/stable-audio/: free plan non-commercial, paid plans commercial).
- **H2 Hosted versions have different terms.** Tencent Cloud's Hunyuan 3D API, Stability's API and BFL's API are each governed by their own service terms, not the open-weights licence. Link /tools/hunyuan3d/ (data lists the paid Tencent Cloud API).
- **H2 Before you ship: a short checklist.** Five lines: keep a copy of the licence version you used, record the model version and date, check revenue and territory caps, pass on any required disclosures, and fill in Steam's AI disclosure (link /steam-ai-disclosure/). Each line links a source.
- **H2 FAQ** (see 14).

## 9. Tools to feature (from data/tools.json)

- Listed already: **hunyuan3d**, **hunyuanworld** (both `commercial: restricted`, licence sources in data), **stable-audio** (hosted; contrast only).
- Mentioned via existing pages: **meshy** and **tripo** (hosted alternatives, with commercial terms by plan). Also **scenario** and **layer-ai**: Unity's third-party AI directory says their models include FLUX, which is useful context, but don't imply their outputs carry FLUX's licence.

### Models to consider adding as listings (each with source)
| Model | Licence (as seen 17 Oct 2026) | Source |
|---|---|---|
| SDXL 1.0 | CreativeML Open RAIL++-M | https://github.com/Stability-AI/generative-models/blob/main/model_licenses/LICENSE-SDXL1.0 · https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0 |
| Stable Diffusion 3.5 Large | Stability AI Community License | https://huggingface.co/stabilityai/stable-diffusion-3.5-large · https://stability.ai/community-license-agreement |
| FLUX.1 [dev] | FLUX.1 [dev] Non-Commercial License v1.1.1 | https://github.com/black-forest-labs/flux/blob/main/model_licenses/LICENSE-FLUX1-dev · https://huggingface.co/black-forest-labs/FLUX.1-dev |
| FLUX.1 [schnell] | Apache 2.0 | https://huggingface.co/black-forest-labs/FLUX.1-schnell |
| FLUX.2 [dev] | flux-non-commercial-license (HF card) | https://huggingface.co/black-forest-labs/FLUX.2-dev |
| FLUX.2 [klein] 4B | Apache 2.0 | https://huggingface.co/black-forest-labs/FLUX.2-klein-4B |
| FLUX.2 [klein] 9B | flux-non-commercial-license (HF card) | https://huggingface.co/black-forest-labs/FLUX.2-klein-9B |
| Qwen-Image | Apache 2.0 | https://huggingface.co/Qwen/Qwen-Image |
| TRELLIS (image-large) | MIT (models and most code; submodules differ) | https://github.com/microsoft/TRELLIS · https://huggingface.co/microsoft/TRELLIS-image-large |
| TRELLIS.2 (4B) | MIT (dependencies nvdiffrast, nvdiffrec under their own licences) | https://github.com/microsoft/TRELLIS.2 · https://huggingface.co/microsoft/TRELLIS.2-4B · https://github.com/NVlabs/nvdiffrast/blob/main/LICENSE.txt |
| TripoSR | MIT | https://github.com/VAST-AI-Research/TripoSR · https://huggingface.co/stabilityai/TripoSR |
| TripoSG | MIT | https://github.com/VAST-AI-Research/TripoSG · https://huggingface.co/VAST-AI/TripoSG |
| Stable Fast 3D | Stability AI Community License | https://huggingface.co/stabilityai/stable-fast-3d |
| Stable Audio Open 1.0 | stable-audio-community (HF card) | https://huggingface.co/stabilityai/stable-audio-open-1.0 |

## 10. Facts to verify before publishing (vendor source for each)

The rule: quote the licence text, link it, and give the absolute check date. Anything the licence doesn't clearly say is **"Not stated by vendor"**. Don't paraphrase a contested clause into a verdict.

| Claim | Exact source |
|---|---|
| Hunyuan3D 2.1: "DOES NOT APPLY IN THE EUROPEAN UNION, UNITED KINGDOM AND SOUTH KOREA"; Territory definition; Output use outside the Territory "unlicensed and unauthorized"; MAU > 1M "on the… version release date"; "Tencent claims no rights in Outputs"; no using Output to improve other AI models; AUP item on identifying machine-generated content; clause 3(e) provider disclosure | https://github.com/Tencent-Hunyuan/Hunyuan3D-2.1/blob/main/LICENSE |
| HunyuanWorld 1.0: same territory and MAU terms (per data/tools.json) | https://github.com/Tencent-Hunyuan/HunyuanWorld-1.0/blob/main/LICENSE |
| SDXL: OpenRAIL++-M, Attachment A use restrictions, "Licensor claims no rights in the Output" | https://github.com/Stability-AI/generative-models/blob/main/model_licenses/LICENSE-SDXL1.0 |
| Stability Community License: free under US$1,000,000 annual revenue; register for commercial use; you own outputs "to the extent permitted by applicable law"; "Last Updated: July 5, 2024" | https://stability.ai/community-license-agreement |
| SD 3.5 Large, Stable Fast 3D on the Community License; Stable Audio Open on "stable-audio-community" | the Hugging Face model cards in section 9 |
| FLUX.1 [dev]: clauses 1(c), 2(b), 2(d), 2(e) as quoted in section 8 | https://github.com/black-forest-labs/flux/blob/main/model_licenses/LICENSE-FLUX1-dev |
| FLUX.2 [dev] / klein 9B licence text and its output clause | **Not verified.** Only the HF card's licence name was seen. Read the linked licence on the model cards. |
| FLUX.1 [schnell], FLUX.2 [klein] 4B, Qwen-Image: Apache 2.0 | the HF model cards |
| TRELLIS: "TRELLIS models and the majority of the code are licensed under the MIT License"; submodules differ | https://github.com/microsoft/TRELLIS (README, License section) |
| TRELLIS.2: MIT; nvdiffrast and nvdiffrec "operate under separate license terms" | https://github.com/microsoft/TRELLIS.2 (README) |
| nvdiffrast: "non-commercially" means "for research or evaluation purposes only" | https://github.com/NVlabs/nvdiffrast/blob/main/LICENSE.txt |
| Whether nvdiffrast's licence affects TRELLIS outputs | **Not stated by vendor.** Say so. |
| TripoSR, TripoSG: MIT | the GitHub LICENSE files |
| Newer versions (any later Hunyuan3D, FLUX or TRELLIS release) | Check each vendor's GitHub or HF org on the day of writing, and give each version its own row |

## 11. Structured data

- `Article` (headline, datePublished, dateModified, author or publisher = Organization) on this page.
- `BreadcrumbList`: All tools › Guides › Open-weights model licences.
- `FAQPage` from section 14.
- Optional: `ItemList` of the models that get tool pages, once they exist.

## 12. Internal links

- **From this page to:** /tools/hunyuan3d/, /tools/hunyuanworld/, /tools/stable-audio/, /tools/meshy/, /tools/tripo/, /tools/scenario/, /tools/layer-ai/, /category/3d-models/, /category/concept-art/, /category/textures/, /guides/ai-3d-model-to-engine/, /guides/concept-to-texture-set/, /cheat-sheet/, /steam-ai-disclosure/, and the engine pages once live (/engine/godot/, /engine/unity/).
- **To this page from:** /tools/hunyuan3d/ and /tools/hunyuanworld/ (next to the "Restricted" verdict), /cheat-sheet/ (beside the Restricted group), /guides/ai-3d-model-to-engine/ (step 1, "Check the licence before you generate"), /guides/ and the footer, /category/3d-models/, and llms.txt.

## 13. How to beat the competing pages

- **assetforgeindex.com/commercial-use/hunyuan3d** (FAQPage + Breadcrumb). It summarises "Commercial use elsewhere is allowed… up to 1M monthly active users". **Gap:** it doesn't address the "use or display Output outside the Territory" clause for a game sold worldwide, the release-date MAU wording, or clause 3(e). It covers one model per page and has no cross-model comparison.
- **WebSearch AI summaries and blogs** (for example the synthesis citing rapiddirect.com, which called TRELLIS 2 "clearly permissive… under MIT"). **Gap:** none flag the nvdiffrast/nvdiffrec dependency licences. We can be the first sourced page to state the caveat neutrally.
- **recraft.ai/blog/stable-diffusion-alternatives and Stability's own pages.** These are vendor-written, with no game context. **Gap:** a neutral side-by-side with game-specific consequences (Steam disclosure, global sales, revenue caps for studios).
- **Reddit and Hugging Face discussions on FLUX dev outputs.** These are scattered opinions. **Gap:** quote both FLUX.1 [dev] clauses verbatim and let the reader see the tension.

## 14. FAQ block (4–6)

1. **Is Hunyuan3D free for commercial use?** Outside the EU, UK and South Korea, and below the MAU threshold, the licence permits it, with conditions. Quote the clauses and link.
2. **Can I use FLUX.1 [dev] images in a paid game?** The licence says outputs may be used commercially, but it also limits the model's own use to non-commercial purposes, excluding revenue-generating activity. BFL sells commercial licences. Quote both clauses.
3. **What is Stability AI's US$1M rule?** The Community License is free for commercial use if your annual revenue is under US$1,000,000. Above that you need an Enterprise licence, and commercial users must register.
4. **Which open models have the fewest strings attached?** The models whose cards show Apache 2.0 or MIT (FLUX.1 [schnell], FLUX.2 [klein] 4B, Qwen-Image, TripoSR, TripoSG), plus SDXL's OpenRAIL++-M with use restrictions. TRELLIS is MIT with a dependency caveat.
5. **Do open-weights licences require me to disclose AI use?** Some do. FLUX.1 [dev] requires disclosure where the law requires it, and Hunyuan's AUP requires identifying machine-generated content in public contexts. Steam requires disclosure regardless (link the Steam page).
6. **Is this legal advice?** No. It summarises each licence's text on the check date.

## 15. Success criteria

- The page is live at the agreed URL, in sitemap.xml, the /guides/ index and llms.txt; Article, BreadcrumbList and FAQPage validate.
- Every model row quotes or links its licence, with an absolute check date. Contested or missing points say "Not stated by vendor" rather than giving a verdict.
- The page carries a visible "not legal advice" note.
- At least 6 internal links in and at least 12 out (section 12).
- Measure after indexing (no baseline; the site launched 17 Oct 2026): indexed in Search Console and Bing within 14 days. Then track impressions for model-licence queries. Then check monthly whether ChatGPT, Perplexity and Google AI Overviews cite the page for questions 1, 4 and 5 in section 5. Don't set position targets.
