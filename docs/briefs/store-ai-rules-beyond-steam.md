# Brief: AI-content rules beyond Steam (Google Play, Apple, Microsoft Store/Xbox, Fab, Unity Asset Store, Nintendo, PlayStation)

Status: Briefed · Written 22 Oct 2026 (AEST) by the SEO research agent · Ideas board rank 7
This is a brief for the CEO bot to write from, not the article. Copy Humanizer polishes the draft afterwards. Use Australian English (licence as the noun, license as the verb, organise).

**Expand an existing page, don't make a new one.** /steam-ai-disclosure/ (live, checked 22 Oct 2026) covers Steam, itch.io, Epic Games Store (including Fab's CreatedWithAI/NoAI tags) and Google Play's AI-Generated Content policy for apps that generate content. It misses: Google Play's newer Play Console declaration for AI-generated store assets, Apple, Microsoft Store/Xbox, Unity Asset Store, Nintendo and PlayStation. The content lives in `DISCLOSURE` in content.mjs and renders via the `page('/steam-ai-disclosure/', …)` block in build.mjs.

**Not-legal-advice rule.** Keep the page's existing note ("This is a summary, not legal advice…").

## 1. Slug and URL

- Keep **`/steam-ai-disclosure/`** (it has the history and links). Add new store sections with anchors: `#google-play`, `#apple`, `#microsoft-xbox`, `#unity-asset-store`, `#nintendo`, `#playstation`.
- Retitle to cover all stores while keeping "Steam" first (see 6). Don't rename the URL; a redirect would waste a week-old page's signals.
- Ideas board rank 18 (selling AI assets on Fab/Unity Asset Store/itch.io) overlaps on Unity Asset Store; include only a one-line Unity Asset Store note here and leave the seller-focused guide to rank 18.

## 2. Target reader and job to be done

- Reader: an indie shipping on more than Steam: mobile (Google Play, App Store), Xbox/Microsoft Store, or console.
- Job: "Do the other stores make me label AI content, and what exactly do they ask?"

## 3. Search intent

Informational. Ideas board rank 7 terms: "Xbox AI disclosure", "App Store AI content rules games", "Nintendo AI policy", "PlayStation AI generated content", "Google Play AI label store listing". Question map rows 20–22. No search volume data was available, so don't claim any.

## 4. Terms

- Primary: AI disclosure Google Play / App Store / Xbox; store AI content rules games.
- Secondary: Play Console AI-generated content declaration; Microsoft Store live generative AI policy; Apple guideline 1.2 AI content creation apps; Nintendo AI policy; PlayStation AI policy.

## 5. Questions to answer (as people ask AI assistants)

1. Does Google Play make me label AI-generated screenshots or store art?
2. What are Apple's App Store rules for AI content in games?
3. Does Xbox / the Microsoft Store require AI disclosure?
4. What are Nintendo's and PlayStation's AI rules?
5. Which stores only care about live (runtime) AI?

## 6. Title tag, meta description, H1

- Current title: `Steam AI-content disclosure (and other stores) (2026) | GameDev AI Tools` (72, over the limit; also fix 1 in this week's fix list).
- New title (≤60): **`Steam & store AI disclosure rules (2026) | GameDev AI Tools`** (59).
- Meta (≤155): **`What Steam, Google Play, Apple, Xbox, itch.io, Epic and Fab ask about AI content, with dated source links. Nintendo and PlayStation publish no policy.`** (150). The Nintendo/PlayStation clause must only stay if the check in 10 still finds no public policy.
- H1: **AI-content disclosure rules: Steam and other stores**

## 7. Answer-first opening paragraph (40–60 words; quotable)

Keep Steam's existing short answer, then add one sentence:

> Other stores split two ways. Google Play asks you to declare AI-generated store-listing images and videos, while Apple and the Microsoft Store (including Xbox) focus on apps that generate content for players. Nintendo and PlayStation publish no public AI-content policy that we could find.

(46 words. Re-check the last sentence before shipping.)

## 8. Outline (H2/H3 and what each must say)

- Existing sections stay: Steam, itch.io, Epic Games Store (with Fab tags), Google Play.
- **Google Play: add a "Store listing assets" subsection.** Play Console uses a "self-declaration model"; you declare each visual asset ("Images and videos used in your Store listings, Promotional content, YouTube videos etc."), via a checkbox reading "Regulations require that AI-generated content be labeled under certain circumstances" or similar; "Declared assets will be AI-labeled on the Google Play Store". Keep the existing AI-Generated Content policy paragraph for in-app generation.
- **H2 Apple App Store.** Guideline 1.2 User-Generated Content now names "AI content creation apps" and requires a filter for objectionable material, a reporting mechanism with timely responses, and the ability to block abusive users. A disclosure label for pre-made AI assets in games: **Not stated by vendor** in the Review Guidelines.
- **H2 Microsoft Store and Xbox.** Policy 11.16 "Live Generative AI Content": products with dynamic content created by generative AI "in response to user inputs" must disclose it in the metadata, note it in Partner Center at submission, keep output compliant with Store Policies, and provide a way to report inappropriate content. Microsoft defines "Store" to include "XBOX-branded stores". Pre-generated assets: **Not stated by vendor**. Note that console certification (ID@Xbox) requirements are under NDA and not checked.
- **H2 Unity Asset Store (one line).** Link to support.unity.com/hc/en-us/articles/16456407029524 and unity.com/legal/asset-store-content-transparency, re-fetched before publishing; point to the future rank 18 guide.
- **H2 Nintendo and PlayStation.** "We found no public AI-content disclosure policy from Nintendo or Sony Interactive Entertainment" with check date. Developer portals are NDA-gated; say so, and don't speculate.
- **H2 At a glance.** Table: Store · Asks about pre-made AI assets? · Asks about runtime AI? · Source · Checked.
- Keep the not-legal-advice line and Sources/check dates.

## 9. Tools to feature

- None as main. Link /category/npc-dialogue/ and the Inworld/Convai tool pages from the runtime-AI rows; /cheat-sheet/ from the intro.

## 10. Facts to verify before publishing (vendor source for each)

| Fact | Status on 22 Oct 2026 | Source |
|---|---|---|
| Play Console AI-content declaration: self-declaration, per-asset, store listing/promotional/YouTube visuals, checkbox wording, declared assets labelled | Verified | https://support.google.com/googleplay/android-developer/answer/17262077 |
| Google Play AI-Generated Content policy (apps that generate content) | Already on the live page; re-check | https://support.google.com/googleplay/android-developer/answer/13985936 |
| Apple guideline 1.2 includes "AI content creation apps"; filter, reporting, blocking requirements | Verified | https://developer.apple.com/app-store/review/guidelines/ |
| Apple disclosure for pre-made AI assets | **Not stated by vendor** | Same |
| Microsoft Store policy 11.16 Live Generative AI Content; "Store" includes XBOX-branded stores; page last updated 15 Sep 2026 | Verified | https://learn.microsoft.com/en-us/windows/apps/publish/store-policies |
| Microsoft/Xbox rule for pre-made AI assets; ID@Xbox certification requirements | **Not stated by vendor** publicly | Same |
| Unity Asset Store AI rules | **Not re-checked this week**; fetch before writing | https://support.unity.com/hc/en-us/articles/16456407029524 ; https://unity.com/legal/asset-store-content-transparency |
| Nintendo public AI-content policy | **Not stated by vendor** (none found; developer portal is login-gated) | https://developer.nintendo.com/the-process |
| PlayStation public AI-content policy | **Not stated by vendor** (none found) | partners.playstation.net (login-gated) |

## 11. Structured data

- The page currently has 2 JSON-LD blocks. Make sure they include Article (with dateModified) and BreadcrumbList, and add FAQPage with questions 1–5. Don't add HowTo.

## 12. Internal links

- **From the page to:** /guides/steam-ai-disclosure-examples/ (once live), /cheat-sheet/, /category/npc-dialogue/, /tools/inworld-ai/, /tools/convai/, /engine/unity/, /engine/unreal/.
- **To the page from:** the new examples guide, engine pages (one "Shipping on other stores?" line), llms.txt description update.

## 13. How to beat the competing pages

- **aigamedevs.org/wiki/platform-rules/** and **assetforgeindex.com/guides/platform-ai-policies** (ideas board). Check both for the Play Console declaration and Microsoft 11.16 before claiming a gap. **Edge:** primary-source quotes with check dates, and an explicit "no public policy found" for Nintendo/PlayStation instead of guesses.

## 14. FAQ block (4–6)

1. **Does Google Play make me label AI-generated store images?** Yes, Play Console asks you to self-declare AI-generated store-listing and promotional images and videos, and labels declared assets.
2. **What does Apple require for AI content?** Guideline 1.2 covers "AI content creation apps": filtering, reporting and blocking. No label for pre-made assets is stated.
3. **Does Xbox require AI disclosure?** Microsoft Store policy 11.16, which covers Xbox-branded stores, requires disclosure of live generative AI in metadata and Partner Center.
4. **What about Nintendo and PlayStation?** We found no public AI-content policy from either as of the check date.
5. **Is this legal advice?** No. Store rules change; read the linked pages before you submit.

## 15. Success criteria

- New sections live on /steam-ai-disclosure/ with anchors; title ≤60; meta ≤155; FAQPage valid.
- Every store claim has a source link and check date; unknowns say "Not stated by vendor".
- Measure after indexing (no baseline): Search Console impressions for "google play ai", "xbox ai", "app store ai" + disclosure queries; monthly AI assistant citation check for questions 1–4. No position targets.
