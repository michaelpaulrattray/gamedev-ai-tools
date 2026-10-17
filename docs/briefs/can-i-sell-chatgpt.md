# Brief: Can I sell a game made with ChatGPT? (images, code and text)

Status: Briefed · Written 17 Oct 2026 (AEST) by the SEO research agent · Ideas board rank 31 (shortlist #2; see /workspace/seo/can-i-sell-shortlist-2026-10-17.md)
This is a brief for the CEO bot to write from, not the article. Copy Humanizer polishes the draft afterwards. Use Australian English (licence as the noun, license as the verb, colour, organise).

**New listing needed.** ChatGPT isn't in data/tools.json. The CEO needs to add a `chatgpt` tool listing (draft fields in section 9) before this answer block can go live. This overlaps Ideas board rank 13 ("ChatGPT / OpenAI image generation for sprites and game art"). This brief supersedes that idea's licence angle.

**Not-legal-advice rule.** Quote OpenAI's terms; give no verdict on a reader's game. Put this note in the block: *"This summarises OpenAI's published terms on the date shown. It isn't legal advice; for a decision about your game, talk to a lawyer."*

## 1. Slug and URL

- Recommended: an **expanded answer block on the tool page**, at **`/tools/chatgpt/#can-i-sell`**. The reasoning is the same as the other two briefs:
  - The tool page template already opens with "Can I use ChatGPT in a commercial game?" and FAQPage JSON-LD (`q` in build.mjs), so a separate page would compete with it.
  - Put the block under the Q&A card as `<section id="can-i-sell">`, with content in content.mjs `CAN_SELL['chatgpt']` as sourced `s()` statements, and merge its FAQ into the existing FAQPage.
- Slug choice: `chatgpt` (the product people search for). Mention in the listing that the same ownership terms cover DALL·E and OpenAI's other individual services ("These Terms of Use apply to your use of ChatGPT, DALL·E, and OpenAI's other services for individuals").
- Fallback standalone URL if the CEO insists: `/can-i-sell/chatgpt/`, linked both ways. Not recommended.

## 2. Target reader and job to be done

- Reader: an indie or hobby dev using ChatGPT for sprites, icons, concept art, store capsule ideas, dialogue or code (ChatGPT appeared in 23 of 2,991 r/aigamedev titles, 2–17 Oct 2026).
- Job: "Can I put ChatGPT's images, text and code in a game I sell? Does the free plan count? What do I have to disclose, and what could go wrong?"

## 3. Search intent

Informational with commercial stakes. Autocomplete is image-heavy (17 Oct 2026, AU and US): "are chatgpt images free for commercial use", "can i sell chatgpt images", "can i use chatgpt images for commercial use", "chatgpt images copyright", "chatgpt image copyright reddit". Lead with images, and cover code and text in their own H3s.

## 4. Terms

- Primary: can I sell a game made with ChatGPT; ChatGPT images commercial use.
- Secondary: are ChatGPT images copyrighted; can I sell ChatGPT images; ChatGPT game assets Steam; OpenAI terms of use output ownership; ChatGPT free plan commercial use; GPT image game sprites.
- No search volume data was available, so don't claim any.

## 5. Questions to answer (as people ask AI assistants)

1. Can I sell a game that uses ChatGPT-generated images?
2. Do I own what ChatGPT makes? Does the free plan count?
3. Can someone else get the same image?
4. Are ChatGPT images copyrighted?
5. Do I need to disclose ChatGPT art on Steam or itch.io?
6. Is code or dialogue from ChatGPT treated differently?
7. What about the API or ChatGPT Business?

## 6. Title tag, meta description, H1

- Title tag (≤60, per-tool override): **`Can I sell a game made with ChatGPT? | GameDev AI Tools`** (55 characters). The current template would give `ChatGPT: pricing, commercial licence & game dev uses | GameDev AI Tools` (71).
- Meta description (≤155): **`OpenAI's terms say you own ChatGPT output on every plan, but it may not be unique or copyrightable. Plus what Steam and itch.io ask you to disclose.`** (148)
- H1: **ChatGPT** (the template). Block H2: **Can I sell a game made with ChatGPT?**

## 7. Answer-first opening paragraph (40–60 words; quotable)

> OpenAI's Terms of Use say you own ChatGPT's output, including images and code, and OpenAI assigns you any rights it has. The terms don't limit this by plan. Two caveats from the same terms: output may not be unique, and you mustn't present it as human-made. Steam and itch.io ask you to disclose AI content.

(55 words. It reports the terms; it doesn't say a reader's game is safe.)

## 8. Outline (H2/H3 and what each must say)

- **H2 Can I sell a game made with ChatGPT?** The opening, then the not-legal-advice note.
- **H3 Plan by plan.** A table with columns: Plan · Image generation (chatgpt.com/pricing, 17 Oct 2026) · Terms that apply · Ownership (quote) · Indemnity · Training on your content. Rows:
  - **Free:** image generation "Limited" · Terms of Use (effective 1 Jan 2026) · "As between you and OpenAI, and to the extent permitted by applicable law, you (a) retain your ownership rights in Input and (b) own the Output. We hereby assign to you all our right, title, and interest, if any, in and to Output." · None from OpenAI. If you're a business, *you* indemnify OpenAI · "We may use Content to… develop, and improve our Services", with an opt-out.
  - **Go:** image generation "Yes" (the page notes "This plan may include ads") · same · same · same · same.
  - **Plus:** "Yes", plus image generation with Thinking · same · same · same · same.
  - **Pro:** "Unlimited and faster image creation" · same · same · same · same.
  - **Business / Enterprise / API:** OpenAI Services Agreement (effective 1 Jan 2026) · Customer "owns all Output", with assignment · OpenAI indemnifies against claims "alleging that the Services infringe any third-party IP Right". Exclusions include "Customer Content", and the Service-Specific Terms Indemnity is incorporated. Quote it; don't summarise it as "covers your images" · "OpenAI will not use Customer Content to develop or improve the Services, unless Customer explicitly agrees".
  - Prices: the pricing page didn't render prices in our fetch, so the price column is **Not stated** until the writer reads the live page (note the currency).
- **H3 Who these terms cover.** The Terms of Use say: "If you reside in the European Economic Area, Switzerland, or the UK, your use of the Services is governed by these terms" (a separate EEA, Swiss and UK document). Australia, the US and most other countries use the main Terms of Use. The EEA/UK version wasn't checked: **Not stated** here, so link it.
- **H3 The catches in OpenAI's own words.**
  - "Output may not be unique and other users may receive similar output… Our assignment above does not extend to other users' output."
  - Prohibited: "Represent that Output was human-generated when it was not." Tie this to store disclosure, quoting only.
  - Prohibited: using the Services "in a way that infringes, misappropriates or violates anyone's rights". Usage Policies bar "use of someone's likeness, including their photorealistic image or voice, without their consent in ways that could confuse authenticity". Relevant to characters based on real people.
- **H3 Images, text and code: same terms.** The ownership clause covers all Output. Note that code may carry open-source licence questions: whether ChatGPT flags code that matches public repositories is **Not stated by vendor**. Link the rank 24 AI-code guide when it's live.
- **H3 Owning the output isn't the same as copyright.** Two sentences and a link to /guides/who-owns-ai-game-assets/ (US Copyright Office Part 2; Thaler cert denied 2 Mar 2026; Australian position per Arts Law). Not legal advice.
- **H3 Store disclosure.**
  - Steam: AI-made content that ships and that players consume (artwork, sound, narrative, localisation) is the focus of the Content Survey's AI section. Pre-Generated content is reviewed like any other content against "no illegal or infringing content". If the game calls ChatGPT/OpenAI live for players, the Live-Generated guardrail question applies.
  - itch.io: the AI disclosure covers Graphics, Sound, Text & Dialog and Code.
  - Use the existing sourced lines in content.mjs `DISCLOSURE` and link /steam-ai-disclosure/.
- **H3 Provenance metadata.** Whether ChatGPT images carry C2PA "made with AI" metadata is **not verified** in this session. Include it only if the writer confirms it on OpenAI's help centre, because it matters for store and press scrutiny.
- **H3 FAQ** (section 14), then **Sources and check dates**.

## 9. Tools to feature, and the listing to add

Draft `data/tools.json` entry (the CEO decides the final values):

| Field | Draft value | Source |
|---|---|---|
| slug / name | `chatgpt` / ChatGPT (OpenAI) | — |
| url | https://chatgpt.com | — |
| tasks | `concept-art`, `code` (both existing task keys in data/tools.json) | — |
| engines | `[]` | — |
| pricing | Plans: Free, Go, Plus, Pro, Business, Enterprise. Prices **Not stated** in our fetch, so the writer reads the live page | https://chatgpt.com/pricing |
| free / freeTier | `yes` / "Free plan with limited image creation" | https://chatgpt.com/pricing |
| commercial | `yes` (the ownership clause applies to all individual plans; the Terms of Use don't distinguish plans) | https://openai.com/policies/row-terms-of-use/ |
| license | "Terms of Use: you own the Output and OpenAI assigns you its rights, if any; output may not be unique; you mustn't present output as human-generated. Business/API: Services Agreement, with an IP indemnity subject to exclusions." | Terms of Use; https://openai.com/policies/services-agreement/ |
| verdict | One line from the facts only. Suggested: "For sprites, icons and concept art on any plan; OpenAI says you own the output, but similar images can go to other users and copyright may not apply." | — |

Alternatives to link: /tools/leonardo-ai/ (free tier: Leonardo holds rights), /tools/pixellab/, /tools/retro-diffusion/, /tools/scenario/. Midjourney is shortlist #4 and not listed yet.

## 10. Facts to verify before publishing (vendor source for each)

| Fact | Status on 17 Oct 2026 | Source |
|---|---|---|
| Terms of Use effective 1 Jan 2026: ownership plus assignment, similarity clause, "human-generated" prohibition, EEA/CH/UK carve-out, business-only user indemnity | Verified | https://openai.com/policies/row-terms-of-use/ |
| Services Agreement effective 1 Jan 2026 (Business, Enterprise, API): Customer owns Output; no training without agreement; §13.1 indemnity and exclusions | Verified | https://openai.com/policies/services-agreement/ |
| Service-Specific Terms Indemnity wording | **Not read**. Quote it before publishing | https://openai.com/policies/service-terms/ |
| Usage Policies likeness clause | Verified (search extract of the live page) | https://openai.com/policies/usage-policies/ |
| Image generation by plan (Free "Limited", Go "Yes", Plus "Yes" plus Thinking, Pro "Unlimited and faster") | Verified | https://chatgpt.com/pricing |
| ChatGPT plan prices | **Not stated** in our fetch | https://chatgpt.com/pricing |
| EEA/UK/Swiss terms' ownership wording | **Not verified** | OpenAI EU terms page |
| C2PA metadata on ChatGPT images | **Not verified** | OpenAI help centre |
| Sharing & Publication Policy requirements (if any) for publishing output | **Not read** | https://openai.com/policies/sharing-publication-policy |
| Steam and itch.io wording | Verified (already in content.mjs) | Steamworks Content Survey doc; itch.io 4309690 |

## 11. Structured data

- Tool page SoftwareApplication, BreadcrumbList and FAQPage. Merge this block's FAQ into the same FAQPage.
- No ratings or offers.

## 12. Internal links

- **From the block to:** /steam-ai-disclosure/, /guides/who-owns-ai-game-assets/, /cheat-sheet/, /tools/leonardo-ai/, /tools/pixellab/, /tools/retro-diffusion/, /tools/scenario/, /category/concept-art/, /category/code/, /tools/claude-code/#can-i-sell (code contrast), and the free-plans page (/free-ai-tools/) once live.
- **To the block from:** /category/concept-art/ and /category/code/ (generated once listed), the Leonardo and PixelLab tool pages (alternatives row), the copyright guide's "copyright vs tool terms" section, /cheat-sheet/ (generated row), llms.txt.

## 13. How to beat the competing pages

- **assetforgeindex.com/guides/can-i-use-chatgpt-images-commercially** (checked 17 Oct 2026). Its short answer covers ownership, no plan restriction, non-uniqueness, copyrightability, infringement, Steam, and the EEA/UK carve-out it hasn't checked. That's strong.
  - **Gaps:** no plan-by-plan table showing the switch to the Services Agreement (indemnity, no training) for Business/API; no "human-generated" prohibition tied to disclosure; no itch.io Code/Text angle; code and dialogue not covered alongside images.
- **seamui.com/guides/chatgpt/chatgpt-images-commercial-use** (appears in search results). It's a vendor guide promoting its own product. **Gap:** neutral and game-specific.

## 14. FAQ block (4–6)

1. **Can I sell a game with ChatGPT-made art?** OpenAI's Terms of Use say you own the Output and OpenAI assigns its rights, if any, with no plan restriction. Not legal advice.
2. **Does the free ChatGPT plan allow commercial use?** The Terms of Use don't distinguish plans for ownership. The free plan has "Limited" image creation.
3. **Can another user get the same image?** OpenAI says output "may not be unique", and its assignment doesn't extend to other users' output.
4. **Are ChatGPT images copyrighted?** That's a question of copyright law, not OpenAI's terms. See our copyright guide (US, UK, EU, Australia).
5. **Do I have to disclose ChatGPT art on Steam?** Steam's Content Survey focuses on AI content that ships with the game, such as artwork. itch.io asks about Graphics, Sound, Text & Dialog and Code.

## 15. Success criteria

- The `chatgpt` listing exists and the block renders at `/tools/chatgpt/#can-i-sell`, with the FAQ merged into the page FAQPage. The title is ≤60 characters and the meta ≤155.
- Every statement is quoted or closely paraphrased with a source link and check date. Unknowns say "Not stated by vendor". The not-legal-advice note is visible.
- The opening paragraph stays answer-first and between 40 and 60 words.
- At least 6 internal links in and at least 8 out.
- Measure after indexing (no baseline, since the site launched 17 Oct 2026): indexed within 14 days; Search Console impressions for "chatgpt images commercial use" style queries; monthly manual checks of AI-assistant citations for questions 1–5. Don't set position targets.
