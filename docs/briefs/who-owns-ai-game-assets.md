# Brief: Who owns AI-generated game assets? Copyright in Australia, the US, UK and EU

Status: Briefed · Written 17 Oct 2026 (AEST) by the SEO research agent · Ideas board rank 5
This is a brief for the CEO bot to write from, not the article. Copy Humanizer polishes the draft afterwards. Use Australian English (licence as the noun, license as the verb, organise, recognise).

**Legal-content rule for this page.** This page reports what governments, courts and copyright offices have said. It must not tell a reader whether *their* asset is protected, who wins a dispute, or what they "can" do legally. Put a prominent not-legal-advice note near the top, directly under the opening answer, and repeat it in the FAQ. Suggested wording: *"This is general information, not legal advice. Copyright law differs by country and is changing quickly; for a decision about your game, talk to a lawyer (in Australia, the Arts Law Centre of Australia offers advice to artists and arts organisations)."* Check Arts Law's eligibility wording before naming it.

## 1. Slug and URL

- Slug: `who-owns-ai-game-assets`. Suggested URL: **`/guides/who-owns-ai-game-assets/`**.
- Fit with build.mjs as of 17 Oct 2026: guides live at `/guides/<slug>/`, but the existing `GUIDES` in content.mjs are step workflows rendered with HowTo JSON-LD. This is a reference page. Build it like `/steam-ai-disclosure/`, from a content.mjs object of `sections` made of sourced `s(text, url)` statements, with Article and BreadcrumbList JSON-LD (the CEO added those to the Steam page in commit 67f82ef). Use the same build pattern as the open-weights licence guide brief, and list both on the /guides/ index. If the CEO prefers top-level reference URLs like `/steam-ai-disclosure/`, use `/ai-copyright/` instead. Pick one and redirect the other.

## 2. Target reader and job to be done

- Reader: an indie developer (often Australian, given the site's base) who has used, or wants to use, AI for art, code, music or voice in a commercial game, and has seen conflicting claims that "AI art can't be copyrighted".
- Job: "Tell me, with sources, what each major jurisdiction has actually said about owning AI-generated material, how tool terms fit in, and what records to keep, so I can decide what to ask a lawyer and what to disclose."

## 3. Search intent

Informational, with a high-stakes, decision-support tone. People ask this as a question, so AI answer engines are a major channel and the page must be easy to quote.

## 4. Terms

- Primary: who owns AI-generated game assets; can you copyright AI-generated art (games).
- Secondary: AI art copyright Australia; is AI-generated art copyrighted in Australia; Copyright Office AI guidance games; UK computer-generated works AI; EU AI-generated content copyright; Thaler v Perlmutter; who owns Midjourney / Leonardo / Meshy output; AI-generated code copyright.
- No search volume data was available, so don't claim any.

## 5. Questions to answer (as people ask AI assistants)

From the AI question map plus forum phrasing:
1. Who owns art I generate with an AI tool for my game?
2. Can AI-generated game assets be copyrighted in Australia?
3. What does the US Copyright Office say about AI-generated content?
4. Is the UK different? (computer-generated works)
5. What does EU law say?
6. If the tool's terms say "you own the output", does that mean I hold copyright?
7. If I edit or build on AI output, is my version protected?
8. Can someone else copy my game's AI-generated assets?

## 6. Title tag, meta description, H1

- Title tag (≤60, with the hand-added suffix): **`Who owns AI-generated game assets? | GameDev AI Tools`** (53 characters). Without the suffix: **`Who owns AI game assets? AU, US, UK and EU copyright`** (52).
- Meta description (≤155): **`Can you copyright AI-generated game art, code and audio? What Australia, the US, UK and EU say, quoted from primary sources and dated. Not legal advice.`** (152)
- H1: **Who owns AI-generated game assets? Copyright in Australia, the US, UK and EU**

## 7. Answer-first opening paragraph (40–60 words; quotable)

> Official sources in Australia, the US and the EU say copyright needs a human author, so purely AI-generated assets may have no copyright owner, while what you create or meaningfully change can be protected. The UK still protects "computer-generated works", though its government proposed removing that in March 2026. Each tool's terms set what you may do.

(57 words. This deliberately reports positions ("sources say", "may", "can be") rather than giving a ruling. Put the not-legal-advice note immediately after it. Re-check the UK status on the day of writing.)

## 8. Outline (H2/H3 and what each must say)

- **H2 The short answer by country.** A table with columns: Jurisdiction · Purely AI output · Human-made or human-modified parts · Latest official development (dated) · Primary source. One row each for Australia, US, UK and EU. Use cautious column values quoted from sources ("No human author, so protection unclear: Arts Law"), not verdicts. Add a "Checked" date per row.
- **H2 Two different questions: copyright vs the tool's terms.** This is the page's main idea, and competitors blur it. (1) *Copyright subsistence*: does the law protect the asset at all? That's a question for the law of each country. (2) *Contract*: what does the tool's licence let you do with the output, and what does the vendor keep? Give real examples from data/tools.json, each linked to the tool page:
  - Leonardo's free tier: "Leonardo holds rights to the images but grants you a non-exclusive, royalty-free licence for commercial use".
  - Meshy's free plan: CC BY 4.0, so attribution is needed.
  - Runway: no ownership claim, but inputs and outputs may be used for training.
  - Cursor and Windsurf: assign rights in output to you.
  - GitHub Copilot: "GitHub does not own Suggestions".
  - The point to make: "a vendor assigning you its rights can't create copyright the law doesn't recognise". Phrase that as a widely noted point, attributed to Arts Law's GenAI terms sheet if that sheet says so. Otherwise drop it.
- **H2 Australia**
  - Copyright Act 1968 (Cth). There is no AI-specific provision. Arts Law: "a work can only be protected by copyright in Australia if there is a human author who contributed 'independent intellectual effort'", and "AI tools do not currently have a legal status and cannot own copyright". Quote it and link the Arts Law AI and copyright information sheet.
  - Case law context: *Telstra Corporation Ltd v Phone Directories Company Pty Ltd* [2010] FCAFC 149. The Full Federal Court said copyright in a literary work "can subsist only if it originates from an individual", and found no copyright in directories put into their final form "primarily by an automated computerised process". Say it predates generative AI and is about directories. Commentators apply it to AI; it isn't an AI ruling.
  - Policy, dated: on 26 Oct 2025 the Attorney-General ruled out a text and data mining exception and set the Copyright and AI Reference Group (CAIRG) three priority areas, one of which is "improving certainty" on how copyright applies to material generated through the use of AI. In September 2026, ABC News reported confidential consultation options on AI training access. Report that as reporting, not policy. Training is a side issue for this page; keep it to two sentences and link out.
- **H2 United States**
  - US Copyright Office, *Copyright and Artificial Intelligence, Part 2: Copyrightability* (29 Jan 2025). Quote its conclusions on prompts, expressive inputs, selection and arrangement, and modifications. Quote the report directly, not a summary (see 10).
  - Registration: applicants must disclose AI-generated content that is more than de minimis and claim only the human-authored parts. Cite the Office's registration guidance page.
  - *Thaler v Perlmutter*: the D.C. Circuit (18 Mar 2025) upheld the human-authorship requirement, and the Supreme Court **denied certiorari on 2 Mar 2026** (docket 25-449). Add the D.C. Circuit's note that the requirement doesn't bar works "made by or with the assistance of artificial intelligence". Thaler disclaimed any human input, so the case didn't decide how much human input is enough.
- **H2 United Kingdom**
  - CDPA 1988 s9(3): for a computer-generated work "in circumstances such that there is no human author", the author is the person "by whom the arrangements necessary for the creation of the work are undertaken". The protection lasts 50 years. The government's consultation said that for prompt-driven AI the author "will usually be the person who inputted the prompt".
  - 18 Mar 2026 *Report on Copyright and Artificial Intelligence*: "in the absence of evidence of its ongoing value, we propose that this specific type of protection should be removed, while copyright should continue to protect works created with AI assistance". The report also said the government will "continue to monitor" it. **No repeal date or bill has been set**, so say the protection still applies for now and the change is proposed.
  - Note the open question commentators raise: whether a computer-generated work also has to meet the originality test. Attribute it; don't resolve it.
- **H2 European Union**
  - There's no EU statute on AI output. The CJEU test is that a work must be the "author's own intellectual creation" (Infopaq, 2009, and later cases) and expressed with sufficient precision and objectivity.
  - European Parliament resolution on copyright and generative AI (report A10-0019/2026, adopted March 2026): EU copyright "remains grounded in the principles of human authorship", and content "fully generated by AI" that doesn't meet the criteria "should remain ineligible". Say it's a non-binding Parliament resolution, not law.
  - Optional H3: EU AI Act transparency duties for AI-generated or manipulated content. Include it only if the writer verifies the article, the dates it applies from, and any exception for evidently creative or fictional works. Otherwise leave it out.
- **H2 What this means in practice for a game (no legal conclusions).** Use neutral, practical points, each tied to a source above:
  - Keep records of your own creative contributions (sketches, edits, layered files, prompt and iteration logs), because the US Office and Arts Law both focus on human contribution.
  - Read each tool's output terms; link the cheat sheet.
  - Check contracts with contractors and studios about who holds rights in AI-assisted work.
  - Disclose where a store requires it (link /steam-ai-disclosure/).
  - Say once, plainly: "If ownership matters to a deal (a publisher, an acquisition, a licensing agreement), get legal advice."
- **H2 Sources and change log.** List every primary source with its date, and a dated change log ("UK: s9(3) still in force as of [date]"). This is what makes the page citable and gives readers a reason to come back.

## 9. Tools to feature (from data/tools.json)

This isn't a tool list. Reference tools only as contract examples, each linking to its tool page and licence source: leonardo-ai, meshy, runway, cursor, windsurf, github-copilot, pixellab (generations can't be used to train models), scenario (free plan for personal and evaluation use only).

### Tools to consider adding

None. This page shouldn't drive new listings.

## 10. Facts to verify before publishing (primary source for each)

Rule: quote primary sources. Anything unconfirmed is left out or marked "not confirmed". Never fill a gap with a conclusion.

| Fact | Status on 17 Oct 2026 | Source |
|---|---|---|
| Arts Law: human author with "independent intellectual effort"; AI tools "cannot own copyright" | Verified (text of the Arts Law AI and copyright info sheet, via search extract) | artslaw.com.au information sheet "Artificial Intelligence (AI) and Copyright" |
| Telstra v Phone Directories [2010] FCAFC 149 quotes | Verified (AustLII text) | austlii.edu.au/au/cases/cth/FCAFC/2010/149.html |
| AG ruled out a TDM exception on 26 Oct 2025; CAIRG priority areas | Verified | ministers.ag.gov.au media release 26-10-2025; ag.gov.au CAIRG page |
| ABC report of September 2026 consultation options | Verified as ABC reporting only | abc.net.au (15 Sep 2026) |
| Whether CAIRG has published anything on AI-generated works since | **Not verified** | ag.gov.au CAIRG page |
| US Copyright Office Part 2 published 29 Jan 2025 | Verified | copyright.gov/ai |
| Exact Part 2 conclusions on prompts and modifications | **Not verified first-hand**. Read and quote the report | copyright.gov/ai Part 2 PDF |
| Registration guidance: disclose more-than-de-minimis AI content | **Not verified first-hand** in this session | copyright.gov/ai registration guidance (2023) |
| Thaler: D.C. Cir. 18 Mar 2025; cert denied 2 Mar 2026 (No. 25-449) | Verified | supremecourt.gov docket 25-449 |
| UK s9(3) wording and 50-year term | Verified (gov.uk consultation text) | gov.uk "Copyright and Artificial Intelligence" consultation; legislation.gov.uk CDPA s9, s12 |
| UK 18 Mar 2026 report proposes removing CGW protection; no repeal date | Verified (report text and Bird & Bird summary) | assets.publishing.service.gov.uk report PDF |
| EU Parliament resolution text (paras AE and 25) and adoption date | Text verified (EUR-Lex); **exact adoption date not verified** (press release dated 6 Mar 2026 says "on Tuesday") | eur-lex.europa.eu C/2026/4006; europarl press release |
| CJEU "author's own intellectual creation" (Infopaq C-5/08) | Well established; cite the CJEU judgment directly | curia.europa.eu |
| EU AI Act transparency duties and dates for AI-generated content | **Not verified**. Omit unless checked | eur-lex AI Act |
| Australian employer ownership rule for staff-made works | **Not verified**. Don't cite a section unless checked | legislation.gov.au Copyright Act 1968 |

## 11. Structured data

- `Article`, with `headline` = H1, `datePublished`, `dateModified` = the latest source check, and `author`/`publisher` = the site organisation (same pattern as the Steam page).
- `BreadcrumbList`: All tools › Guides › Who owns AI-generated game assets?
- `FAQPage` from the FAQ block. Answers must be the same hedged, sourced wording as on the page.
- Don't use `LegalService` or any schema implying advice.

## 12. Internal links

- **From this page to:** /steam-ai-disclosure/, /cheat-sheet/, /guides/open-weights-model-licences/ (once live), /tools/leonardo-ai/, /tools/meshy/, /tools/runway/, /tools/cursor/, /tools/windsurf/, /tools/github-copilot/, /tools/pixellab/, /tools/scenario/, /engine/unreal/ (the Fab section), and the future free-plans page.
- **To this page from:** /cheat-sheet/ (a "Who owns the output?" link in the intro), every tool page's licence block (one line: "Owning output vs copyright: read our guide"), /steam-ai-disclosure/, the /guides/ index, the homepage FAQ if one exists, the footer and llms.txt.

## 13. How to beat the competing pages

- **assetforgeindex.com/guides/ai-copyright-by-country** ("Can You Copyright AI-Generated Game Assets? US, UK, EU, Japan & More (2026)") and its /copyright/<country> pages. It's strong: dated, primary-sourced, with FAQPage and Article schema and a not-legal-advice line, and the UK page quotes the March 2026 report. **Gap (checked 17 Oct 2026):** the title and summary list no Australia page. It also doesn't separate copyright from tool terms with tool-by-tool examples, and has no "records to keep" section. We should win on: an Australian section with Arts Law, Telstra and the AG's 2025–26 actions; the copyright-versus-contract split, linked to our sourced tool terms; and practical, non-advisory record-keeping.
- **Law firm articles.** They're accurate but generic and cover one jurisdiction each. **Gap:** game-specific examples and four jurisdictions on one dated page.
- **Reddit and forum threads.** Confident and often wrong ("you own it if you paid"). **Gap:** a quotable, sourced answer.

## 14. FAQ block (4–6)

1. **Who owns art I generate with an AI tool?** Two things decide it: whether the law protects it at all (most sources say that needs a human author, except the UK's computer-generated works rule) and what the tool's terms say. Not legal advice.
2. **Is AI-generated art copyrighted in Australia?** Australia's Copyright Act has no AI-specific rule. Arts Law says protection needs a human author who contributed "independent intellectual effort", so works with too little human input may not be protected.
3. **What did the US Supreme Court decide about AI art?** It declined to hear *Thaler v Perlmutter* on 2 March 2026, which leaves in place the appeals court ruling that a copyrighted work needs a human author.
4. **Does the UK protect AI-generated works?** For now, the CDPA s9(3) rule on computer-generated works still applies. The government proposed removing it in March 2026 but set no date.
5. **If a tool says I own the output, do I hold copyright?** A tool's terms set out the contract between you and the vendor. Whether copyright exists is a separate legal question. Not legal advice.
6. **Is this legal advice?** No. It's general information with sources and dates. Talk to a lawyer about your own situation.

## 15. Success criteria

- The page is live at the agreed URL, in sitemap.xml and llms.txt, with a title of 60 characters or fewer and a meta description of 155 or fewer. Article, BreadcrumbList and FAQPage JSON-LD validate.
- Every legal statement is a quote or close paraphrase of a linked primary source with a date. The not-legal-advice note is visible without scrolling on mobile. There are no verdicts about any reader's asset.
- The opening paragraph stays answer-first and between 40 and 60 words.
- At least 6 internal links in and at least 10 out, as listed in 12.
- A monthly source re-check is logged in the change log, especially the UK s9(3) status and the Australian CAIRG outcome.
- Measure after indexing (no baseline exists because the site launched 17 Oct 2026): the page is indexed within 14 days. Then track Search Console impressions for "AI art copyright Australia" style queries. Then manually check, monthly, whether ChatGPT, Perplexity and Google AI Overviews cite the page for questions 1–4 in section 5. Don't set position targets.
