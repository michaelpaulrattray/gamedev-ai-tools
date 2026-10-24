// Static site generator. Usage: npm install (once) then node build.mjs  -> writes ./dist
// Pages are plain HTML from template helpers; the only dependencies (satori, @resvg/resvg-js) render share images (og.mjs).
import { markSvg, listedBadge, rankedBadge, LISTED as BADGE_LISTED, RANKED as BADGE_RANKED } from './badges.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { CHECKED, GUIDES, DISCLOSURE, NEWS, COMPARE, ENGINE_HUBS, CAN_SELL, ALTERNATIVES } from './content.mjs';
import { SPONSOR_OFFERS, BUSINESS_EMAIL, AFFILIATE_NOTE } from './config.mjs';
import { loadBookings, resolveBookings } from './sponsors.mjs';
import { createOg, OG_W, OG_H } from './og.mjs';

const HOME_DESC = 'Find and compare the latest AI tools for making games: what\'s new, the best tool for each job, what it costs and how to use it.';
const SITE = {
  name: 'GameDev AI Tools',
  origin: process.env.SITE_ORIGIN || 'https://gamedevaitools.com',
  base: process.env.SITE_BASE ?? '', // e.g. '/gamedev-ai-tools' for a GitHub Pages project path
  description: 'Find and compare the latest AI tools for making games: concept art, 3D models, textures, animation, voice, music, NPCs, code, levels, localisation, QA and trailers. What\'s new, what\'s best for each job, what it costs and how to use it.',
  updated: '2026-10-17',
};
// Signup form is shown only when explicitly enabled AND both Resend env vars exist.
const NEWSLETTER_ON = process.env.NEWSLETTER_ENABLED === '1' && Boolean(process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID);
console.log('Newsletter signup enabled:', NEWSLETTER_ON);
// Build date in the business's time zone (Australia/Brisbane), YYYY-MM-DD. Used to drop expired deals and sponsor bookings,
// and as "today" for visitor-facing friendly dates. Override with BUILD_DATE=YYYY-MM-DD for testing.
const TODAY = process.env.BUILD_DATE || new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const URL_ = p => SITE.origin + SITE.base + p;
const ORG = { '@type': 'Organization', name: SITE.name, url: URL_('/') };
const L = p => SITE.base + p;
const EMAIL = BUSINESS_EMAIL;
const crumbsLd = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: URL_(p) })) });
const mailto = (subject) => `mailto:${EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
const TASKS = {
  'concept-art':  { label: 'Concept art & 2D assets', page: 'concept-art', h1: 'AI tools for game concept art, sprites and 2D assets' },
  '3d-models':    { label: '3D model generation', page: '3d-models', h1: 'AI 3D model generators for games' },
  'textures':     { label: 'Textures & materials', page: 'textures', h1: 'AI tools for game textures, materials and skyboxes' },
  'animation':    { label: 'Rigging, animation & mocap', page: 'animation', h1: 'AI tools for rigging, animation and motion capture' },
  'voice':        { label: 'Voice & dialogue', page: 'voice', h1: 'AI voice and dialogue tools for games' },
  'audio':        { label: 'Music & SFX', page: 'music-and-sound', h1: 'AI tools for game music and sound effects' },
  'npc':          { label: 'NPC & AI characters', page: 'npc-dialogue', h1: 'AI tools for NPCs and AI characters' },
  'code':         { label: 'Coding assistants', page: 'code', h1: 'AI coding assistants for game developers' },
  'level':        { label: 'Level & terrain generation', page: 'level-generation', h1: 'AI tools for level, world and terrain generation' },
  'localisation': { label: 'Localisation', page: 'localisation', h1: 'AI localisation tools for games' },
  'qa':           { label: 'QA & playtesting', page: 'qa-playtesting', h1: 'AI tools for game QA and playtesting' },
  'marketing':    { label: 'Trailers & marketing', page: 'trailers-marketing', h1: 'AI tools for game trailers and marketing' },
};
// Engines and tools a listing can be tagged with (data/tools.json `engines`; 'any' = engine-agnostic file export).
// Each gets an indexable page at /engine/<page>/, like TASKS make /category/<page>/. Tag only where the vendor's own
// docs or pages show an official plugin, integration or export target (sources: OPERATIONS.md decisions log, 2026-10-17).
const ENGINE_PAGES = {
  unity:   { label: 'Unity', page: 'unity', h1: 'AI tools for Unity developers', what: 'Unity' },
  unreal:  { label: 'Unreal', page: 'unreal', h1: 'AI tools for Unreal Engine developers', what: 'Unreal Engine' },
  godot:   { label: 'Godot', page: 'godot', h1: 'AI tools for Godot developers', what: 'Godot' },
  blender: { label: 'Blender', page: 'blender', h1: 'AI tools with Blender add-ons and integrations', what: 'Blender',
    title: 'Blender AI tools: add-ons & integrations | GameDev AI Tools',
    description: 'AI tools with an official Blender add-on, integration or export, with pricing and commercial-use terms from each vendor\'s site.' },
  roblox:  { label: 'Roblox', page: 'roblox', h1: 'AI tools for Roblox Studio', what: 'Roblox Studio',
    description: 'AI tools with an official Roblox Studio plugin, integration or export, with pricing and commercial-use terms from each vendor\'s site.' },
};
const ENGINES = Object.fromEntries(Object.entries(ENGINE_PAGES).map(([k, e]) => [k, e.label]));
// First publication date of the site's pages (launch, per OPERATIONS.md); used as Article datePublished.
const PUBLISHED = '2026-10-17';

// Visitor-facing wording: a data value of 'unverified' is shown as "Not stated by vendor" (data itself is unchanged).
const NSV_TEXT = 'Not stated by vendor';
const PRICING = { 'freemium': 'Free tier + paid', 'paid': 'Paid', 'pay-as-you-go': 'Pay as you go', 'open-weights': 'Free (open weights)', 'included': 'Included with engine plan', 'contact': 'Contact sales', 'unverified': NSV_TEXT };
const FREE = { 'yes': 'Free plan', 'trial': 'Free trial or credits only', 'no': 'Paid only', 'unverified': NSV_TEXT };
const SHIP = { 'yes': 'Yes, on every plan', 'paid-only': 'Yes, on paid plans', 'check': 'Check terms (restricted or not stated)', 'no': 'No', 'n-a': 'Not applicable (testing tools)' };
const API_L = { yes: 'Available', no: 'No public API', partner: 'Partner / negotiated only', na: 'Not applicable', unverified: NSV_TEXT };
const MCP_L = { official: 'Official MCP server', client: 'Connects to MCP servers', community: 'Community server only', preview: 'In preview', 'none-found': 'None found', unverified: NSV_TEXT };
const COMMERCIAL = { 'yes': 'Commercial use allowed', 'paid-only': 'Commercial on paid plans only', 'restricted': 'Restricted (see notes)', 'no': 'Not allowed', 'unverified': 'Commercial use: not stated by vendor', 'n-a': 'Not applicable' };

// Guides v2 format: { result, shared:[step], paths:[{key,label,steps:[step]}], videos:[...], images:[...] } where
// step = { h, do:[...], see, gotcha, source:{label,url} }. Normalised here to the v1 `steps` shape (shared + first path)
// so step counts, HowTo JSON-LD and llms.txt keep working. v1 guides (steps only) still render with the old layout.
// v2 content lives in data/guides/<slug>.json and is merged over the content.mjs entry.
for (const g of GUIDES) { const fp = `data/guides/${g.slug}.json`; if (fs.existsSync(fp)) { const d = JSON.parse(fs.readFileSync(fp, 'utf8')); delete d._doc; Object.assign(g, d); } }
for (const g of GUIDES) if (Array.isArray(g.paths) && g.paths.length) {
  g.steps = [...(g.shared || []), ...g.paths[0].steps].map(s => ({ h: s.h, p: [{ text: s.do.join(' '), url: s.source && s.source.url }] }));
}
const tools = JSON.parse(fs.readFileSync('data/tools.json', 'utf8')).sort((a, b) => a.name.localeCompare(b.name));
const bySlug = Object.fromEntries(tools.map(t => [t.slug, t]));
const readJson = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d;
// Sponsor bookings (sponsors.mjs): one active paid booking per slot, start/end AEST honoured at the build date.
// Overlapping paid bookings for the same slot, unknown slots or incomplete bookings fail the build.
const SPONSOR_SLOTS = new Set(['sitewide', 'newsletter', ...Object.values(TASKS).map(c => `category:${c.page}`), ...Object.values(ENGINE_PAGES).map(e => `engine:${e.page}`)]);
const { active: SPONSORS, errors: sponsorErrors } = resolveBookings(loadBookings(process.env.SPONSOR_FILE || 'data/sponsor.json'), TODAY, { validSlots: SPONSOR_SLOTS });
if (sponsorErrors.length) { console.error('\n*** SPONSOR BOOKING ERRORS (data/sponsor.json) ***\n- ' + sponsorErrors.join('\n- ') + '\n'); process.exit(1); }
const SPONSOR = SPONSORS.get('sitewide') || null; // site-wide: top strip, homepage card, wide-screen side card
const offer = id => SPONSOR_OFFERS.find(o => o.id === id);
const dealsAll = readJson('data/deals.json', []);
const DEALS = dealsAll.filter(d => d && d.offer && d.source && !(d.expires && d.expires < TODAY));
console.log(`Build date ${TODAY}: sponsors ${SPONSORS.size ? [...SPONSORS].map(([k, b]) => `${k}=${b.name}`).join(', ') : 'none'}; deals ${DEALS.length} live, ${dealsAll.length - DEALS.length} dropped (expired or incomplete)`);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// First candidate that fits the limit (titles 60, metas 160); falls back to the last one.
const fit = (max, ...c) => c.find(x => x.length <= max) || c[c.length - 1];
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const LOGOS = new Set(fs.existsSync('src/assets/logos') ? fs.readdirSync('src/assets/logos').filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)) : []);
const hue = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const initials = n => n.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const logo = (t, size = 44, eager = false) => LOGOS.has(t.slug)
  ? `<img class="tlogo" src="${L(`/assets/logos/${t.slug}.png`)}" alt="" width="${size}" height="${size}"${eager ? '' : ' loading="lazy"'} decoding="async">`
  : `<span class="tlogo mono" aria-hidden="true" style="--h:${hue(t.slug)};width:${size}px;height:${size}px">${esc(initials(t.name))}</span>`;
const catImg = page => L(`/assets/img/${page}.webp`);
const ICON_SEARCH = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const MARK = markSvg({ size: 28 }).replace('<svg ', '<svg aria-hidden="true" ');
const srcA = (url, label = 'source') => url ? ` <a class="src" href="${esc(url)}"${url.startsWith('/') ? '' : ' rel="noopener nofollow" target="_blank"'}>${label}</a>` : '';
const engineText = t => t.engines.filter(e => ENGINES[e]).map(e => ENGINES[e]).join(', ') || 'Any (standard file export / engine-agnostic)';
const isNsv = v => v === undefined || v === null || v === '' || v === 'unverified';
const NSV = `<span class="nsv">${NSV_TEXT}</span>`;
const val = v => isNsv(v) ? NSV : esc(v); // detail pages: unknown -> muted "Not stated by vendor"

// ---------- Friendly dates (absolute, e.g. "Sat 17 Oct 2026"; ISO stays in data and in <time datetime>) ----------
const DAY_MS = 86400000;
const dayNum = iso => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10)) / DAY_MS;
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateLabel = iso => { const d = new Date(dayNum(iso) * DAY_MS); return `${WD[d.getUTCDay()]} ${d.getUTCDate()} ${MON[d.getUTCMonth()]} ${iso.slice(0, 4)}`; };
// Visible dates are absolute and include the year ("Sat 17 Oct 2026") so static HTML never goes stale.
// `cap` is kept for call-site compatibility (labels already start with a capital).
function friendly(iso, cap = false) {
  if (!/^\d{4}-\d{2}-\d{2}/.test(iso || '')) return esc(iso || '');
  return dateLabel(iso);
}
const timeEl = (iso, cap = false) => `<time datetime="${esc(iso)}" title="${esc(iso)}">${friendly(iso, cap)}</time>`;

// ---------- Shared components: badge, chip, cards ----------
const badge = (label, tone = 'neutral', { title, cls = '' } = {}) => `<span class="badge b-${tone}${cls ? ' ' + cls : ''}"${title ? ` title="${esc(title)}"` : ''}>${esc(label)}</span>`;
// chip: link (href), filter button (filter: [group, value]) or plain tag; optional tool logo
function chip(label, { href, tool, filter, active, muted, above } = {}) {
  const cls = `chip${tool ? ' has-logo' : ''}${muted ? ' c-muted' : ''}${above ? ' above' : ''}`;
  const inner = `${tool ? logo(tool, 20) : ''}${esc(label)}`;
  if (filter) return `<button type="button" class="${cls}" data-group="${filter[0]}" data-value="${esc(filter[1])}" aria-pressed="${active ? 'true' : 'false'}">${inner}</button>`;
  if (href) return `<a class="${cls}" href="${esc(href)}">${inner}</a>`;
  return `<span class="${cls}">${inner}</span>`;
}
const chips = (arr, tag = 'ul') => arr.length ? (tag === 'ul' ? `<ul class="chips">${arr.map(c => `<li>${c}</li>`).join('')}</ul>` : `<div class="chips">${arr.join('')}</div>`) : '';
// Licence tone (cards, tool pages, comparisons): green = commercial use allowed incl. any free plan or trial,
// amber = paid plans only, restricted, or allowed but no free plan; red = not allowed; grey = not stated / not applicable.
const licTone = t => ({ yes: t.free === 'no' ? 'warn' : 'ok', 'paid-only': 'warn', restricted: 'warn', no: 'bad', unverified: 'unk', 'n-a': 'unk' }[t.commercial] || 'unk');
const licBadge = (t, opts) => badge(COMMERCIAL[t.commercial] || NSV_TEXT, licTone(t), opts);
const toolUrl = t => L(`/tools/${t.slug}/`);
// Outbound "Visit" link: uses the affiliate URL when one is approved (rel=sponsored), otherwise the official site.
const visitHref = t => t.affiliateUrl || t.url;
const visitRel = t => t.affiliateUrl ? 'sponsored noopener' : 'noopener nofollow';
const visitBtn = (t, { cls = 'btn', label } = {}) => `<a class="${cls}" href="${esc(visitHref(t))}" rel="${visitRel(t)}" target="_blank">${esc(label || `Visit ${t.name}`)} ↗</a>`;
// Card subtitle: pricing model, or the main task when pricing isn't stated (never "unverified").
const cardSub = t => isNsv(t.pricingModel) ? TASKS[t.tasks[0]].label : PRICING[t.pricingModel];
// Card footer: colour is reserved for the one signal that matters (commercial use). Everything else is quiet text.
// Fields whose value is 'unverified' are hidden on cards.
const cardFacts = t => [
  t.free === 'yes' ? 'Free plan' : '',
  t.api.status === 'yes' ? 'API' : '',
  t.mcp.status === 'official' ? 'MCP' : '',
].filter(Boolean);
const dealFor = slug => DEALS.find(d => d.tool === slug);
const cardBadges = t => `${isNsv(t.commercial) ? '' : licBadge(t)}${dealFor(t.slug) ? badge('Deal', 'deal') : ''}${cardFacts(t).length ? `<span class="facts-line">${cardFacts(t).join(' · ')}</span>` : ''}`;
function toolCard(t, { compact = false, note = '', attrs = '' } = {}) {
  return `<article class="card is-link${compact ? ' compact' : ''}" data-slug="${t.slug}"${attrs ? ' ' + attrs : ''}>
<div class="card-top">${logo(t)}<div class="card-title"><h3><a class="card-link" href="${toolUrl(t)}">${esc(t.name)}</a></h3><span class="card-sub">${esc(compact ? cardSub(t) : [TASKS[t.tasks[0]].label, isNsv(t.pricingModel) ? '' : PRICING[t.pricingModel]].filter(Boolean).join(' · '))}</span></div><span class="arrow" aria-hidden="true">→</span></div>
${note}<p class="summary">${esc(t.summary)}</p>
${compact ? '' : `<p class="verdict">${esc(t.verdict)}</p>\n`}<div class="card-foot"><span class="badges">${cardBadges(t)}</span></div>
</article>`;
}
// Generic link card: optional media (img html), kicker, title, description and footer html.
function linkCard({ href, title, kicker = '', desc = '', media = '', foot = '', cls = '', attrs = '', h = 'h3' }) {
  return `<article class="card is-link${cls ? ' ' + cls : ''}"${attrs}>${media ? `<div class="card-media">${media}</div>` : ''}${kicker ? `<span class="kicker">${kicker}</span>` : ''}<${h}><a class="card-link" href="${esc(href)}">${esc(title)}</a></${h}>${desc ? `<p class="card-desc">${desc}</p>` : ''}${foot}</article>`;
}
const artSrcset = page => `${L(`/assets/img/${page}-640.webp`)} 640w, ${catImg(page)} 1280w`;
const artImg = (page, { eager = false, sizes = '(max-width:720px) 100vw, 420px' } = {}) => `<img src="${catImg(page)}" srcset="${artSrcset(page)}" sizes="${sizes}" alt="" width="1280" height="720"${eager ? ' fetchpriority="high"' : ' loading="lazy"'} decoding="async">`;
// Guide art: a dedicated hero image (src/assets/img/<hero>.webp) when present, otherwise the task's category art.
const guideArtPage = g => g.hero && fs.existsSync(`src/assets/img/${g.hero}.webp`) ? g.hero : TASKS[g.task].page;
// Pipeline strip: the guide's stages as connected nodes; AI stages show stacked logos of the guide's tools.
function flowStrip(g, { max = 3 } = {}) {
  if (!g.flow) return '';
  const gt = g.tools.map(s => bySlug[s]).filter(Boolean);
  const node = (st, i) => `<li class="flow-node${st.ai ? ' is-ai' : ''}">${st.ai
    ? `<span class="flow-logos">${gt.slice(0, max).map(t => logo(t, 26)).join('')}${gt.length > max ? `<span class="flow-more">+${gt.length - max}</span>` : ''}</span>`
    : `<span class="flow-num">${i + 1}</span>`}<span class="flow-label">${esc(st.label)}</span></li>`;
  return `<ol class="flow" aria-label="Workflow stages">${g.flow.map(node).join('')}</ol>`;
}

// ---------- Share images (og:image) ----------
const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
const OG = await createOg({ outDir: out });
const logoData = t => LOGOS.has(t.slug) ? { src: `data:image/png;base64,${fs.readFileSync(`src/assets/logos/${t.slug}.png`).toString('base64')}` } : { mono: initials(t.name), hue: hue(t.slug) };
const OG_LIC = { yes: 'Commercial use: allowed', 'paid-only': 'Commercial use: paid plans only', restricted: 'Commercial use: restricted', no: 'Commercial use: not allowed', unverified: 'Commercial use: not stated by vendor', 'n-a': 'Commercial use: not applicable' };
const ogFile = (name, kind, data) => OG ? OG.add(`og/${name}.png`, kind, data) : null;
const slugOf = p => p.replace(/^\/|\/$/g, '').replace(/\//g, '-') || 'home';
const stripSite = s => s.replace(/\s*\|\s*GameDev AI Tools$/, '');

const spLogoSrc = S => esc(S.logo.startsWith('/') ? L(S.logo) : S.logo);
function sponsorStrip() {
  if (!SPONSOR) return ''; // no active paid site-wide booking: no strip
  const img = SPONSOR.logo ? `<img src="${spLogoSrc(SPONSOR)}" alt="" width="20" height="20" loading="lazy" decoding="async">` : '';
  return `<aside class="sponsor-strip" aria-label="Sponsored"><div class="wrap"><span class="sp-label">Sponsored</span><a href="${esc(SPONSOR.url)}" rel="sponsored noopener" target="_blank">${img}<strong>${esc(SPONSOR.name)}</strong></a></div></aside>`;
}
// Sponsor card: same card component as tool cards. Never part of tool lists' order, counts, ItemList JSON-LD or filters
// (no data-slug, sits outside #results). Renders only for an active paid booking for that slot; otherwise nothing
// (an empty "your tool here" slot reads as unsold space). Sponsors find the offer via the footer Advertise link,
// the Submit page and the "Work at <tool>?" line on tool pages.
function sponsorCard({ compact = false, booking = SPONSOR } = {}) {
  const S = booking;
  if (!S) return '';
  const mark = S.logo
    ? `<img class="tlogo" src="${spLogoSrc(S)}" alt="" width="44" height="44" loading="lazy" decoding="async">`
    : `<span class="tlogo mono" aria-hidden="true" style="--h:${hue(S.name)};width:44px;height:44px">${esc(initials(S.name))}</span>`;
  return `<article class="card is-link sp-card${compact ? ' compact' : ''}" aria-label="Sponsored">
<div class="card-top">${mark}<div class="card-title"><h3><a class="card-link" href="${esc(S.url)}" rel="sponsored noopener" target="_blank">${esc(S.name)}</a></h3><span class="card-sub sp-tag">Sponsored</span></div><span class="arrow" aria-hidden="true">↗</span></div>
${S.line ? `<p class="summary">${esc(S.line)}</p>\n` : ''}</article>`;
}
// Wide-screen side card (site-wide booking only): fixed in the right-hand margin, out of the document flow so it can't
// shift layout; display:none below the breakpoint in style.css (.sp-side). No animation.
function sponsorSide() {
  const S = SPONSOR;
  if (!S) return '';
  const mark = S.logo
    ? `<img class="tlogo" src="${spLogoSrc(S)}" alt="" width="32" height="32" loading="lazy" decoding="async">`
    : `<span class="tlogo mono" aria-hidden="true" style="--h:${hue(S.name)};width:32px;height:32px">${esc(initials(S.name))}</span>`;
  return `<aside class="sp-side" aria-label="Sponsored"><a class="card sp-side-card" href="${esc(S.url)}" rel="sponsored noopener" target="_blank">${mark}<span class="sp-tag">Sponsored</span><strong>${esc(S.name)}</strong>${S.line ? `<span class="sp-side-line">${esc(S.line)}</span>` : ''}</a></aside>`;
}
const HONEYPOT = `<div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>`;
function footerSignup() {
  if (!NEWSLETTER_ON) return `<form class="foot-signup" onsubmit="return false"><label for="fs-email">Newsletter (coming soon)</label><input id="fs-email" type="email" placeholder="you@example.com" disabled><button type="button" disabled>Coming soon</button></form>`;
  return `<form class="foot-signup" method="post" action="/api/subscribe/"><label for="fs-email">Get the newsletter and the free <a href="${L('/cheat-sheet/')}">ship-it cheat sheet</a></label><input id="fs-email" type="email" name="email" required maxlength="254" placeholder="you@example.com" autocomplete="email">${HONEYPOT}<button type="submit">Subscribe</button></form>`;
}
function layout({ title, description, pathname, body, jsonld = [], scripts = '', noindex = false, head = '', og }) {
  if (title.length > 60) title = stripSite(title);
  // Every page gets a 1200x630 share image: page-specific when passed in, otherwise a generic title card for that page.
  const ogPath = og !== undefined ? og : noindex ? (OG ? '/og/home.png' : null) : ogFile(`page/${slugOf(pathname)}`, 'page', { kicker: 'GameDev AI Tools', title: stripSite(title), sub: description });
  const ogTags = ogPath ? `\n<meta property="og:image" content="${URL_(ogPath)}">\n<meta property="og:image:width" content="${OG_W}">\n<meta property="og:image:height" content="${OG_H}">\n<meta property="og:image:alt" content="${esc(stripSite(title))}">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:image" content="${URL_(ogPath)}">` : '\n<meta name="twitter:card" content="summary">';
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#101014">
<meta name="color-scheme" content="dark">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${URL_(pathname)}">${noindex ? '\n<meta name="robots" content="noindex">' : ''}
<link rel="icon" href="${L('/favicon.svg')}" type="image/svg+xml">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${URL_(pathname)}">
<meta property="og:site_name" content="${SITE.name}">${ogTags}
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<link rel="preload" href="${L('/assets/fonts/inter-latin.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="${L('/assets/fonts/inter-tight-latin.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${L('/assets/style.css')}">${head}
<script defer src="/_vercel/insights/script.js"></script>
${jsonld.map(ld).join('\n')}
</head>
<body>
<header class="site-header"><div class="wrap hdr">
<a class="logo" href="${L('/')}" aria-label="GameDev AI Tools home">${MARK}<span class="wordmark">GAMEDEV <b>AI TOOLS</b></span></a>
<nav class="hdr-nav" aria-label="Main"><a href="${L('/tools/')}">Tools</a><a href="${L('/category/')}">Best by job</a><a href="${L('/compare/')}">Compare</a><a href="${L('/guides/')}">Guides</a><a href="${L('/new/')}">News</a>${DEALS.length ? `<a href="${L('/deals/')}">Deals</a>` : ''}</nav>
<form class="hdr-search" action="${L('/tools/')}" method="get" role="search">${ICON_SEARCH}<input name="q" type="search" placeholder="Search tools" aria-label="Search tools" autocomplete="off"></form>
<a class="btn btn-sm hdr-cta" href="${L('/submit/')}">Submit a tool</a>
</div></header>
${sponsorStrip()}
<main class="wrap">
${body}
</main>
${sponsorSide()}
<footer class="site-footer"><div class="wrap">
<div class="foot-grid">
<div class="foot-brand-col"><a class="logo" href="${L('/')}" aria-label="GameDev AI Tools home">${MARK}<span class="wordmark">GAMEDEV <b>AI TOOLS</b></span></a>
<p class="foot-tag">Find and compare the latest AI tools for making games: what's new, what's best for each job, what it costs and how to use it.</p>
${footerSignup()}</div>
<nav class="foot-col" aria-label="Explore"><h2>Explore</h2><a href="${L('/tools/')}">All tools</a><a href="${L('/category/')}">Best by category</a><a href="${L('/guides/')}">Guides</a><a href="${L('/compare/')}">Compare tools</a><a href="${L('/alternatives/')}">Alternatives</a><a href="${L('/new/')}">New this week</a>${DEALS.length ? `<a href="${L('/deals/')}">Deals</a>` : ''}</nav>
<nav class="foot-col" aria-label="Resources"><h2>Resources</h2><a href="${L('/cheat-sheet/')}">Can I ship it? cheat sheet</a><a href="${L('/steam-ai-disclosure/')}">Steam AI disclosure</a><a href="${L('/guides/open-weights-model-licences/')}">Open-weights licences</a><a href="${L('/how-we-rank/')}">How we rank</a><a href="${L('/badge/')}">"Listed on" badge</a></nav>
<nav class="foot-col" aria-label="Company"><h2>Company</h2><a href="${L('/about/')}">About</a><a href="${L('/submit/')}">Submit a tool</a><a href="${L('/sponsor/')}">Advertise</a><a href="${mailto()}">Contact</a><a href="${L('/privacy/')}">Privacy</a></nav>
</div>
<div class="foot-bottom"><p>Facts come from each vendor's own website and are dated. Pricing and licences change often, so check the vendor's current terms before you rely on them. This isn't legal advice. <span class="aff-disc">${esc(AFFILIATE_NOTE)}</span></p>
<p class="foot-meta"><span>© ${TODAY.slice(0, 4)} GameDev AI Tools</span><span>Last updated ${timeEl(SITE.updated)}</span><a href="${L('/sitemap.xml')}">Sitemap</a></p></div>
</div></footer>
${scripts}
</body>
</html>
`;
}

const write = (p, s) => { const f = path.join(out, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const pages = [];
const page = (p, html, { sitemap = true } = {}) => { write(p === '/' ? 'index.html' : p.replace(/^\//, '') + 'index.html', html); if (sitemap) pages.push(p); };

function newsletterBlock({ heading, text } = {}) {
  if (!NEWSLETTER_ON) return `<section class="newsletter soon" id="newsletter">
<h2>Newsletter: coming soon</h2>
<p>A short weekly email: new AI tools for game devs, the best launches and price changes. Signup isn't open yet, and this form collects nothing.</p>
<form onsubmit="return false"><input type="email" placeholder="you@example.com" disabled aria-label="Email (coming soon)"><button type="button" disabled>Coming soon</button></form>
</section>`;
  return `<section class="newsletter" id="newsletter">
<h2>${esc(heading || 'AI tools you can legally ship in a paid game')}</h2>
<p>${text || `Our free cheat sheet covers every tool we list: whether free-plan output can go in a commercial game, which plan you need, and the catch, with sources and check dates. Subscribe and we'll email you the link, plus a weekly newsletter on new tools and licence changes. Unsubscribe any time. (Or just <a href="${L('/cheat-sheet/')}">read it here</a>.)`}</p>
<form method="post" action="/api/subscribe/">
<input type="email" name="email" required maxlength="254" placeholder="you@example.com" aria-label="Email address">
${HONEYPOT}
<button type="submit">Subscribe</button>
</form>
</section>`;
}

const tile = (c, n) => `<a class="tile" href="${L(`/category/${c.page}/`)}"><img src="${catImg(c.page)}" srcset="${artSrcset(c.page)}" sizes="(max-width:720px) 50vw, 300px" alt="" width="1280" height="720" loading="lazy" decoding="async"><span class="tile-body"><strong>${esc(c.label)}</strong><span>${n} ${n === 1 ? 'tool' : 'tools'}</span></span></a>`;

// ---------- News helpers (type tag inferred only from the entry's own title; "Why it matters" only when the entry has it) ----------
function newsType(n) {
  if (n.type) return n.type;
  const s = n.title;
  if (/\bpric(e|es|ing)\b/i.test(s)) return 'Pricing change';
  if (/\blicen[cs]e|terms of (use|service)\b/i.test(s)) return 'Licence change';
  if (/\b(raises|funding|series [a-e]|seed round)\b/i.test(s)) return 'Funding';
  if (/\b(launch(es|ed)?|unveil(s|ed)?|open-sources?|releases?)\b/i.test(s)) return 'Launch';
  return 'Update';
}
// News type tags stay neutral so they don't compete with the licence colours; pricing/licence changes get amber because they affect shipping.
const NEWS_TONE = { 'Pricing change': 'warn', 'Licence change': 'warn' };
const newsBadge = n => badge(newsType(n), NEWS_TONE[newsType(n)] || 'neutral');
const newsArt = n => n.tool && bySlug[n.tool] ? TASKS[bySlug[n.tool].tasks[0]].page : null;
// Monday-start weeks (Australia/Brisbane dates)
const weekStart = iso => { const d = dayNum(iso), wd = new Date(d * DAY_MS).getUTCDay(); return d - ((wd + 6) % 7); };
const isoOf = dn => new Date(dn * DAY_MS).toISOString().slice(0, 10);
const weekLabel = iso => { const diff = Math.round((weekStart(TODAY) - weekStart(iso)) / 7); return diff === 0 ? 'This week' : diff === 1 ? 'Last week' : `Week of ${dateLabel(isoOf(weekStart(iso)))}`; };
const recentNews = NEWS.filter(n => { const d = dayNum(TODAY) - dayNum(n.date); return d >= 0 && d < 7; });

// ---------- Home ----------
const engineList = Object.entries(ENGINE_PAGES).map(([k, e]) => ({ k, e, list: tools.filter(t => t.engines.includes(k)) })).filter(x => x.list.length).map(x => ({ ...x, n: x.list.length }));
// Free-plan commercial status (shared with the home answer line, comparisons and the cheat sheet).
const freeShip = t => {
  if (t.commercial === 'n-a') return ['na', 'Not applicable'];
  if (t.free === 'unverified' || t.commercial === 'unverified') return ['unk', NSV_TEXT];
  if (t.free === 'no') return ['paid', 'No free plan'];
  if (t.commercial === 'yes') return t.free === 'yes' ? ['yes', 'Yes'] : ['yes', 'Yes (free option is a trial or credits)'];
  if (t.commercial === 'paid-only') return ['paid', 'No: paid plan needed'];
  if (t.commercial === 'restricted') return ['check', 'Restricted: read the catch'];
  if (t.commercial === 'no') return ['no', 'No, on any plan'];
  return ['unk', NSV_TEXT];
};
const SHEET_GROUPS = [
  ['yes', 'Free-plan output can be shipped commercially'],
  ['paid', 'You need a paid plan to ship'],
  ['check', 'Restricted: read the terms'],
  ['no', 'Not allowed in a commercial game'],
  ['unk', 'Not stated by vendor: the vendor\'s pages didn\'t clearly answer this'],
  ['na', 'Not applicable: testing tools that don\'t make assets'],
];
const sheetCounts = Object.fromEntries(SHEET_GROUPS.map(([k]) => [k, tools.filter(t => freeShip(t)[0] === k).length]));
const opts = (o) => Object.entries(o).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
// "New & updated this week": tools named in the last 7 days of the /new/ feed (real dated entries only), newest first, one card per tool.
const newRow = [];
for (const n of recentNews) if (n.tool && bySlug[n.tool] && !newRow.some(x => x.t.slug === n.tool)) newRow.push({ t: bySlug[n.tool], n });
// Row = optional active sponsor card + tools, max 4 cards, column count matched to the card count so there's never a gap.
const NEW_MAX = Math.min(newRow.length, SPONSOR ? 3 : 4);
const NEW_COLS = { 1: 'g2 m2', 2: 'g2 m2', 3: 'g3 t3', 4: 'g4 m2' }[NEW_MAX + (SPONSOR ? 1 : 0)] || 'g4 m2';
const HOME_TITLE = 'The best AI tools for making games';
// Direct answer to the H1 (also the og:image sub line), from the same counts as the cheat sheet. Handles 0 and 1.
const HOME_SUB = `What's new, the best tool for each job, what it costs and how to use it. ${tools.length} tools across ${Object.keys(TASKS).length} game-dev jobs, updated every week.`;
// Homepage and /tools/ are built near the end (after rankings) — see "Home + tools pages".

// ---------- Rankings (data/rankings.json + published fit score; method on /how-we-rank/) ----------
// Tier 1: tools with independent quality evidence, in the order given in rankings.json (each needs a why + source).
// Tier 2: every other tool in the category, ordered by the game-dev fit score below. Sponsors/affiliates never affect either.
const RANKINGS = readJson('data/rankings.json', {});
// Game-dev fit (0-100), from facts on vendor pages. Specialising in the job counts most; licence terms are a small part.
const FIT_ENGINES = ['godot', 'unity', 'unreal'];
const FIT_FREE = { yes: 12, trial: 6 };
const FIT_COM = { yes: 12, 'paid-only': 8, restricted: 4 };
const fitScore = (t, key) => (t.tasks[0] === key ? 40 : 0) + 8 * FIT_ENGINES.filter(e => t.engines.includes(e)).length
  + (t.api.status === 'yes' ? 8 : 0) + (t.mcp.status === 'official' ? 4 : 0) + (FIT_FREE[t.free] || 0) + (FIT_COM[t.commercial] || 0);
function fitWhy(t, key, note) {
  const eng = FIT_ENGINES.filter(e => t.engines.includes(e)).map(e => ENGINES[e]);
  const parts = [t.tasks[0] === key ? `built for ${TASKS[key].label.toLowerCase()}` : `${TASKS[key].label.toLowerCase()} is a side feature`,
    eng.length ? `${eng.join(', ')} ${eng.length === 1 ? 'integration' : 'integrations'}` : 'no engine integration stated',
    [t.api.status === 'yes' ? 'API' : '', t.mcp.status === 'official' ? 'official MCP server' : ''].filter(Boolean).join(' and '),
    { yes: 'free plan', trial: 'free trial', no: 'paid only' }[t.free] || ''].filter(Boolean);
  return `Not enough independent evidence yet. Ranked on game-dev fit: ${parts.join('; ')}.${note ? ' ' + note : ''}`;
}
// Evidence-based scores (data/evidence/<task>.json). Each tool's score blends independent benchmarks, expert reviews and
// user reports with game-dev fit; a tool needs 2+ kinds of independent evidence to be ranked with confidence.
const EVIDENCE = fs.existsSync('data/evidence') ? Object.fromEntries(fs.readdirSync('data/evidence').filter(f => f.endsWith('.json')).map(f => [f.slice(0, -5), JSON.parse(fs.readFileSync(`data/evidence/${f}`, 'utf8'))])) : {};
const SIGNALS = [['bench', 'Benchmarks', 0.35], ['reviews', 'Expert reviews', 0.25], ['users', 'User reports', 0.25], ['fit', 'Game-dev fit', 0.15]];
const TIE = 3; // scores this close are a tie (joint rank)
const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : null;
function evidenceRows(key, list) {
  const E = EVIDENCE[key];
  const rows = list.map(t => {
    const e = (E.tools && E.tools[t.slug]) || {};
    const items = k => (e[k] || []).filter(x => x && typeof x.score === 'number' && x.url);
    const sig = { bench: avg(items('bench').map(x => x.score)), reviews: avg(items('reviews').map(x => x.score)), users: avg(items('users').map(x => x.score)), fit: Math.min(100, fitScore(t, key)) };
    const kinds = ['bench', 'reviews', 'users'].filter(k => sig[k] !== null).length;
    const used = SIGNALS.filter(([k]) => sig[k] !== null), w = used.reduce((a, [, , x]) => a + x, 0);
    const score = Math.round(used.reduce((a, [k, , x]) => a + sig[k] * x, 0) / w);
    const conf = kinds >= 2 ? 'confident' : kinds === 1 ? 'provisional' : 'fit';
    const sources = ['bench', 'reviews', 'users'].flatMap(k => items(k).map(x => ({ url: x.url, label: x.source, kind: k, detail: x.detail || x.summary || '' })));
    return { t, score, sig, conf, kinds, sources, strengths: e.strengths || [], weaknesses: e.weaknesses || [], vendorClaims: e.vendorClaims || [], examples: e.examples || [], verdict: e.verdict || '' };
  });
  const tierN = { confident: 0, provisional: 1, fit: 2 };
  rows.sort((a, b) => tierN[a.conf] - tierN[b.conf] || b.score - a.score || a.t.name.localeCompare(b.t.name));
  // Rank numbers: within the confident tier, a score within TIE points of the previous row's shares its rank.
  rows.forEach((r, i) => {
    const p = rows[i - 1];
    r.n = p && r.conf === 'confident' && p.conf === 'confident' && p.score - r.score <= TIE ? p.n : i + 1;
    r.tier = r.conf === 'confident' ? 'evidence' : 'fit';
    r.why = r.verdict || (r.conf === 'fit' ? fitWhy(r.t, key) : `Score ${r.score}/100 from ${r.kinds} kind${r.kinds === 1 ? '' : 's'} of independent evidence plus game-dev fit.`);
  });
  const joint = rows.filter(r => r.n === 1).length > 1;
  rows.forEach(r => { r.label = (E.labels && E.labels[r.t.slug]) || (r.n === 1 && r.conf === 'confident' ? (joint ? 'Joint top pick' : 'Top pick') : ''); });
  return rows;
}
const RANKED = {};
for (const key of Object.keys(TASKS)) {
  const list = tools.filter(t => t.tasks.includes(key));
  if (list.length < 2) continue; // nothing to rank
  if (EVIDENCE[key]) {
    const rows = evidenceRows(key, list);
    RANKED[key] = { checked: EVIDENCE[key].checked || CHECKED, rows, nEvidence: rows.filter(r => r.tier === 'evidence').length, v2: true };
    continue;
  }
  // Older categories (data/rankings.json): independent tests first, then game-dev fit.
  const R = RANKINGS[key] || {};
  const ev = R && Array.isArray(R.evidence) ? R.evidence.filter(e => e && e.why && Array.isArray(e.sources) && e.sources.some(s => s.url) && list.some(t => t.slug === e.tool)) : [];
  const evSlugs = ev.map(e => e.tool);
  const rest = list.filter(t => !evSlugs.includes(t.slug)).sort((a, b) => fitScore(b, key) - fitScore(a, key) || a.name.localeCompare(b.name));
  const rows = [...ev.map(e => ({ t: bySlug[e.tool], tier: 'evidence', why: e.why, sources: e.sources.filter(s => s.url) })),
    ...rest.map(t => ({ t, tier: 'fit', why: fitWhy(t, key, R.notes && R.notes[t.slug]), sources: [] }))];
  rows.forEach((r, i) => { r.n = i + 1; r.label = (R.labels && R.labels[r.t.slug]) || ''; });
  RANKED[key] = { checked: R.checked || CHECKED, rows, nEvidence: ev.length };
}
const rankOf = (slug, key) => { const R = RANKED[key]; const r = R && R.rows.find(x => x.t.slug === slug); return r || null; };
// Category rank card body for evidence-scored rows: score, the four signals, strengths/watch-outs, sources on demand.
const CONF_TXT = { confident: 'Ranked on independent evidence', provisional: 'Provisional: one kind of evidence', fit: 'Not enough evidence yet: game-dev fit only' };
const srcListV2 = r => `<ul class="src-list">${r.sources.map(x => `<li><a href="${esc(x.url)}" rel="noopener nofollow" target="_blank">${esc(x.label)}</a>${x.detail ? ` <span>${esc(x.detail)}</span>` : ''}</li>`).join('')}</ul>`;
const rankNoteV2 = r => `<p class="rank-line"><span class="rank-n">#${r.n}</span>${r.label ? badge(r.label, 'accent') : ''}${r.conf === 'confident' ? `<span class="rank-score"><b>${r.score}</b>/100</span>` : `<span class="rank-score">${r.conf === 'provisional' ? 'Provisional' : 'Unscored'}</span>`}</p>
<p class="rank-conf rc-${r.conf}">${CONF_TXT[r.conf]}</p>
<ul class="rank-sig">${SIGNALS.map(([k, l]) => `<li${r.sig[k] === null ? ' class="is-none"' : ''}><span>${l}</span><span class="rs-track"><span style="width:${r.sig[k] === null ? 0 : Math.round(r.sig[k])}%"></span></span><b>${r.sig[k] === null ? '–' : Math.round(r.sig[k])}</b></li>`).join('')}</ul>
${r.strengths.length ? `<p class="rank-pros">${r.strengths.slice(0, 3).map(x => `<span>${esc(x)}</span>`).join('')}</p>` : ''}${r.weaknesses.length ? `<p class="rank-cons"><b>Watch out:</b> ${esc(r.weaknesses.slice(0, 2).join('; '))}</p>` : ''}
${r.sources.length ? `<details class="rank-src above"><summary>${r.sources.length} ${r.sources.length === 1 ? 'source' : 'sources'}</summary>${srcListV2(r)}</details>` : `<p class="rank-why">${esc(r.why)}</p>`}
`;
const rankSources = r => r.sources.map(s => `<a class="src" href="${esc(s.url)}" rel="noopener nofollow" target="_blank">${esc(s.label || 'source')}</a>`).join(' ');

// ---------- Tool pages ----------
// Quick answer: one sentence derived strictly from the `commercial` field (plus `free` for "no free plan");
// the vendor's licence text and its source link follow it.
function quickAnswer(t) {
  const n = t.name;
  return {
    yes: t.free === 'no' ? `Yes. ${n}'s published terms allow commercial use, but there's no free plan, so you'll need a paid plan.` : `Yes. ${n}'s published terms allow commercial use on every plan.`,
    'paid-only': `Yes, but only on a paid plan: ${n}'s published terms limit commercial use to paid plans.`,
    restricted: `With restrictions: ${n}'s licence allows commercial use only under certain conditions, so read the terms below before you ship.`,
    no: `No. ${n}'s published terms don't allow commercial use.`,
    unverified: `Not stated by vendor: we couldn't find a clear answer in ${n}'s published terms, so confirm with the vendor before you ship.`,
    'n-a': `Not applicable: ${n} is a testing tool, so it doesn't make assets that ship in your game.`,
  }[t.commercial] || `Not stated by vendor: confirm with ${n} before you ship.`;
}
const QA_SHORT = { yes: 'Yes', 'paid-only': 'Paid plans only', restricted: 'Restricted', no: 'No', unverified: NSV_TEXT, 'n-a': 'Not applicable' };
// Example output: rendered only when data/media/<slug>/ holds images AND a credit.
// Credit from media.json {"credit","creditUrl","items":[{"file","alt","caption"}]} or credit.txt (line 1 credit, line 2 optional URL).
function mediaFor(slug) {
  const dir = path.join('data/media', slug);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => /\.(png|jpe?g|webp|gif|avif)$/i.test(f)).sort();
  const meta = readJson(path.join(dir, 'media.json'), {});
  const txt = fs.existsSync(path.join(dir, 'credit.txt')) ? fs.readFileSync(path.join(dir, 'credit.txt'), 'utf8').split('\n').map(s => s.trim()).filter(Boolean) : [];
  const credit = meta.credit || txt[0], creditUrl = meta.creditUrl || txt[1];
  if (!files.length || !credit) return null;
  const items = files.map(f => { const m = (meta.items || []).find(i => i.file === f) || {}; return { file: f, alt: m.alt || `Example output from ${bySlug[slug].name}`, caption: m.caption || '' }; });
  for (const i of items) { const dst = path.join(out, 'media', slug, i.file); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(path.join(dir, i.file), dst); }
  return { items, credit, creditUrl };
}
const cmpPairsFor = slug => COMPARE.filter(p => p.includes(slug));
const cmpChip = ([a, b]) => chip(`${bySlug[a].name} vs ${bySlug[b].name}`, { href: L(`/compare/${a}-vs-${b}/`) });
// Alternatives: same main task first, then other shared tasks; alphabetical within each (not a ranking); max 4.
function alternativesFor(t) {
  const primary = tools.filter(o => o.slug !== t.slug && o.tasks.includes(t.tasks[0]));
  const shared = tools.filter(o => o.slug !== t.slug && !primary.includes(o) && o.tasks.some(k => t.tasks.includes(k)));
  return [...primary, ...shared].slice(0, 4);
}
const nsvText = x => esc(x).replace(/Not stated by vendor/g, NSV);
const stmtN = x => `${nsvText(x.text)}${srcA(x.url)}`;
// Visible FAQ (details/summary) + matching FAQPage JSON-LD (only questions shown on the page).
const faqBlock = (faq, id = 'faq') => faq && faq.length ? `<section class="faq" aria-labelledby="${id}-h"><h2 class="sub-h" id="${id}-h">Questions</h2>${faq.map(f => `<details class="card faq-item"><summary>${esc(f.q)}</summary><p>${nsvText(f.a)}${f.url ? srcA(f.url) : ''}</p></details>`).join('')}</section>` : '';
const faqLd = faq => ({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a + (f.url ? ` Source: ${f.url.startsWith('/') ? URL_(f.url) : f.url}` : '') } })) });
// "Can I sell?" answer block (content.mjs CAN_SELL), rendered at #can-i-sell on the tool page.
function canSellBlock(t, cs) {
  const tbl = cs.table ? `<h3>Plan by plan</h3><div class="table-wrap"><table class="cmp"><thead><tr>${cs.table.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr></thead><tbody>${cs.table.rows.map(r => `<tr>${r.map(c => `<td>${nsvText(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div><p class="note">Source:${srcA(cs.table.source, 'Midjourney plans')} · Checked ${timeEl(cs.checked)}</p>` : '';
  const alts = (cs.alts || []).filter(x => bySlug[x]);
  return `<section class="card disc hub-sec" id="can-i-sell" aria-labelledby="cs-h">
<h2 id="cs-h">${esc(cs.h)}</h2>
<p class="hub-intro"><strong>${esc(cs.answer)}</strong></p>
<p class="note">${esc(cs.note)} Checked ${timeEl(cs.checked)}.</p>
${tbl}
<h3>The rules that catch people out</h3>
<ol>${cs.rules.map(r => `<li><b>${esc(r.h)}.</b> ${nsvText(r.text)}${srcA(r.url)}</li>`).join('')}</ol>
${cs.sections.map(sec => `<h3>${esc(sec.h)}</h3>${sec.items.map(i => `<p>${stmtN(i)}</p>`).join('')}`).join('\n')}
${alts.length ? `<h3>Alternatives with different terms</h3><ul>${alts.map(x => `<li><a href="${toolUrl(bySlug[x])}">${esc(bySlug[x].name)}</a>: ${esc(QA_SHORT[bySlug[x].commercial] || NSV_TEXT)}. ${esc(bySlug[x].verdict)}</li>`).join('')}</ul>` : ''}
${cs.links ? `<p class="cmp-row">${cs.links.map(l => chip(l.label, { href: L(l.href) })).join('')}</p>` : ''}
</section>
${faqBlock(cs.faq, 'cs-faq')}`;
}
const sourceLine = url => url ? `<br><small>Source: <a href="${esc(url)}" rel="noopener nofollow" target="_blank">${esc(url)}</a></small>` : '';
for (const t of tools) {
  const p = `/tools/${t.slug}/`;
  const alts = alternativesFor(t);
  const media = mediaFor(t.slug);
  const pairs = cmpPairsFor(t.slug);
  const desc = `${t.name} for game developers: ${t.summary}`.slice(0, 155).replace(/\s+\S*$/, '') + '…';
  const q = `Can I use ${t.name} in a commercial game?`;
  const answer = quickAnswer(t);
  const terms = isNsv(t.license) ? '' : t.license;
  const cs = CAN_SELL[t.slug];
  page(p, layout({
    title: cs && cs.metaTitle ? cs.metaTitle : fit(60, `${t.name}: pricing & commercial licence | ${SITE.name}`, `${t.name}: pricing & licence | ${SITE.name}`, `${t.name} pricing & licence for game devs`, `${t.name}: pricing & licence`),
    description: cs && cs.metaDesc ? cs.metaDesc : desc,
    pathname: p,
    og: ogFile(`tools/${t.slug}`, 'tool', { logo: logoData(t), name: t.name, task: TASKS[t.tasks[0]].label, badge: { label: OG_LIC[t.commercial] || OG_LIC.unverified, tone: licTone(t) } }),
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: t.name, url: t.url, description: t.summary, applicationCategory: 'MultimediaApplication', operatingSystem: 'Web', sameAs: [t.url] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'All tools', item: URL_('/') },
        { '@type': 'ListItem', position: 2, name: TASKS[t.tasks[0]].label, item: URL_(`/category/${TASKS[t.tasks[0]].page}/`) },
        { '@type': 'ListItem', position: 3, name: t.name, item: URL_(p) } ] },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: [{ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: `${answer}${terms ? ` What the terms say: ${terms}` : ''}${t.licenseSource ? ` Source: ${t.licenseSource} (checked ${t.lastChecked}).` : ''}` } }, ...(cs ? faqLd(cs.faq).mainEntity : [])] },
    ],
    body: `
<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L(`/category/${TASKS[t.tasks[0]].page}/`)}">${esc(TASKS[t.tasks[0]].label)}</a> › ${esc(t.name)}</nav>
<article class="tool">
<header class="tool-head">${logo(t, 72, true)}<div>
<h1>${esc(t.name)}</h1>
<p class="lead">${esc(t.summary)}</p>
<p class="tool-cta">${t.affiliateUrl ? `<a class="btn" href="${esc(t.affiliateUrl)}" rel="sponsored noopener" target="_blank">Visit official site ↗</a><small class="aff-note">${esc(AFFILIATE_NOTE)}</small>` : `<a class="btn" href="${esc(t.url)}" rel="noopener nofollow" target="_blank">Visit official site ↗</a>`}${isNsv(t.pricingModel) ? '' : badge(PRICING[t.pricingModel], 'neutral')}${licBadge(t)}</p>
</div></header>
${(() => { const r = rankOf(t.slug, t.tasks[0]); return r ? `<p class="rank-chip"><a href="${L(`/category/${TASKS[t.tasks[0]].page}/`)}"><b>#${r.n}</b> in ${esc(TASKS[t.tasks[0]].label)}</a>${r.label ? badge(r.label, 'accent') : ''}<span>${r.tier === 'evidence' ? 'based on independent tests' : 'ranked on game-dev fit'} · <a href="${L('/how-we-rank/')}">how we rank</a></span></p>` : ''; })()}
<section class="card qa" aria-labelledby="qa-h">
<h2 id="qa-h">${esc(q)}</h2>
<p class="qa-a">${badge(QA_SHORT[t.commercial] || NSV_TEXT, licTone(t), { cls: 'b-lg' })} <span>${esc(answer)}</span></p>
<p class="qa-terms">${terms ? `What the terms say: ${esc(terms)} ` : ''}${t.licenseSource ? `<a href="${esc(t.licenseSource)}" rel="noopener nofollow" target="_blank">Read the vendor's terms ↗</a>` : NSV} · Checked ${timeEl(t.lastChecked)}</p>
</section>
${cs ? canSellBlock(t, cs) : ''}
<p class="verdict big"><strong>Verdict:</strong> ${esc(t.verdict)}</p>
<dl class="facts">
<dt>Best for</dt><dd>${val(t.bestFor)}</dd>
<dt>Tasks</dt><dd>${t.tasks.map(k => `<a href="${L(`/category/${TASKS[k].page}/`)}">${esc(TASKS[k].label)}</a>`).join(', ')}</dd>
<dt>Engines</dt><dd>${esc(engineText(t))}</dd>
<dt>Price &amp; free tier</dt><dd>${isNsv(t.free) ? NSV : badge(FREE[t.free], t.free === 'yes' ? 'info' : 'neutral')} ${isNsv(t.free) && isNsv(t.freeTier) ? '' : val(t.freeTier)}<br>${val(t.pricing)}${sourceLine(t.pricingSource)}</dd>
<dt>Export formats</dt><dd>${val(t.exportFormats)}${sourceLine(t.exportSource)}</dd>
<dt>Commercial use &amp; licence</dt><dd>${licBadge(t)}<br>${val(t.license)}${sourceLine(t.licenseSource)}</dd>
<dt>Revenue share / caps</dt><dd>${val(t.revenue)}</dd>
<dt>API</dt><dd>${isNsv(t.api.status) ? NSV : badge(API_L[t.api.status], 'neutral')} ${isNsv(t.api.note) ? '' : esc(t.api.note)}${sourceLine(t.api.source)}</dd>
<dt>MCP server</dt><dd>${isNsv(t.mcp.status) ? NSV : badge(MCP_L[t.mcp.status], t.mcp.status === 'official' ? 'accent' : 'neutral')} ${isNsv(t.mcp.note) ? '' : esc(t.mcp.note)}${sourceLine(t.mcp.source)}</dd>
<dt>Last checked</dt><dd>${timeEl(t.lastChecked, true)}</dd>
</dl>
${media ? `<section class="example" aria-labelledby="ex-h"><h2 id="ex-h" class="sub-h">Example output</h2>
<div class="media-grid">${media.items.map(i => `<figure><img src="${L(`/media/${t.slug}/${encodeURIComponent(i.file)}`)}" alt="${esc(i.alt)}" loading="lazy" decoding="async">${i.caption ? `<figcaption>${esc(i.caption)}</figcaption>` : ''}</figure>`).join('')}</div>
<p class="note">Credit: ${media.creditUrl ? `<a href="${esc(media.creditUrl)}" rel="noopener nofollow" target="_blank">${esc(media.credit)}</a>` : esc(media.credit)}</p></section>` : ''}
<p class="note">We summarise what the vendor's own pages say on the date above. "Not stated by vendor" means we couldn't find that detail on the vendor's pages. Read the vendor's current terms before you ship anything.</p>
<aside class="maker"><span><b>Work at ${esc(t.name)}?</b> Send a correction, grab a <a href="${L('/badge/')}">"Listed on" badge</a>, or <a href="${L('/sponsor/')}">feature ${esc(t.name)}</a> to game devs browsing this directory.</span><a class="maker-mail" href="${mailto(`Listing: ${t.name}`)}">Contact us</a></aside>
</article>
${alts.length ? `<section class="alts" aria-labelledby="alt-h">
<div class="sec-head"><h2 id="alt-h">Alternatives</h2><a href="${L(`/category/${TASKS[t.tasks[0]].page}/`)}">More in ${esc(TASKS[t.tasks[0]].label)} →</a></div>
${pairs.length ? `<div class="cmp-row"><span>Compare side by side:</span>${pairs.map(cmpChip).join('')}</div>` : ''}
<div class="grid ${alts.length >= 4 ? 'g4' : 'g3'}">${alts.map(o => toolCard(o, { compact: true })).join('\n')}</div>
${ALTERNATIVES.filter(a => a.base === t.slug).map(a => `<p class="cmp-row">${chip(`${a.title} →`, { href: L(`/alternatives/${a.slug}/`) })}</p>`).join('')}
</section>` : ''}
${newsletterBlock()}`,
  }));
}

// ---------- Category filters (free plan / commercial use / engine); rows and cards carry data-* for the inline script ----------
const catAttrs = t => `data-free="${t.free === 'yes' ? 1 : 0}" data-ship="${t.commercial === 'yes' ? 1 : 0}" data-eng="${t.engines.filter(e => ENGINES[e]).join(' ')}"`;
function catFilters(list) {
  if (list.length < 3) return '';
  const engs = Object.keys(ENGINES).filter(e => list.some(t => t.engines.includes(e)));
  const anyFree = list.some(t => t.free === 'yes'), anyShip = list.some(t => t.commercial === 'yes');
  return `<div class="chip-filters cat-filters" role="group" aria-label="Filter tools"><div class="chips"><span class="cf-label">Filter</span>${anyFree ? chip('Free plan', { filter: ['free', '1'] }) : ''}${anyShip ? chip('Commercial use allowed', { filter: ['ship', '1'] }) : ''}${engs.map(e => chip(`Works with ${ENGINES[e]}`, { filter: ['eng', e] })).join('')}<span class="cf-count" aria-live="polite"></span></div></div>`;
}
function catTable(list, R) {
  const row = (t, r) => `<tr ${catAttrs(t)}${r ? ` data-rank="${r.n}" data-alpha="${list.indexOf(t)}"${r.n === 1 ? ' class="is-top"' : ''}` : ''}>${R ? `<td class="td-rank">${r.n}</td>` : ''}<td><a class="cmp-tool" href="${toolUrl(t)}">${logo(t, 24)}${esc(t.name)}</a>${r && r.label ? `<span class="row-label">${esc(r.label)}</span>` : ''}</td><td>${isNsv(t.free) ? NSV : esc(FREE[t.free])}</td><td>${licBadge(t)}</td><td>${isNsv(t.api.status) ? NSV : esc(API_L[t.api.status])}</td><td>${isNsv(t.mcp.status) ? NSV : esc(MCP_L[t.mcp.status])}</td><td class="td-visit">${visitBtn(t, { cls: 'visit-sm', label: 'Visit' })}</td></tr>`;
  const cols = R ? 7 : 6;
  const body = R
    ? R.rows.map(r => `${r.tier === 'fit' && r.n === R.nEvidence + 1 ? `<tr class="tier-row"><td colspan="${cols}">${R.nEvidence ? 'No independent quality tests yet for the tools below' : 'No independent quality tests found for these tools yet'}: ranked on game-dev fit. <a href="${L('/how-we-rank/')}">How</a></td></tr>\n` : ''}${row(r.t, r)}`).join('\n')
    : list.map(t => row(t, null)).join('\n');
  return `${R ? `<div class="rank-switch" role="group" aria-label="Order"><button type="button" class="chip" data-order="rank" aria-pressed="true">Ranked</button><button type="button" class="chip" data-order="alpha" aria-pressed="false">A–Z</button></div>` : ''}<div class="table-wrap"><table class="cmp cat-table"><thead><tr>${R ? '<th class="td-rank">#</th>' : ''}<th>Tool</th><th>Free plan</th><th>Commercial use</th><th>API</th><th>MCP</th><th><span class="sr-only">Visit</span></th></tr></thead><tbody>
${body}
</tbody></table>`;
}
const RANK_SWITCH_JS = `<script>(function(){var bs=document.querySelectorAll('.rank-switch button');if(!bs.length)return;
function order(by){[document.querySelector('.cat-table tbody'),document.querySelector('.ranked-cards')].forEach(function(box){if(!box)return;var items=[].slice.call(box.querySelectorAll('[data-rank]'));items.sort(function(a,b){return (+a.dataset[by])-(+b.dataset[by]);});items.forEach(function(el){box.appendChild(el);});});
var tr=document.querySelector('.tier-row');if(tr){tr.hidden=by!=='rank';if(by==='rank'){var first=document.querySelector('.cat-table tbody [data-rank="'+tr.dataset.before+'"]');if(first)first.parentNode.insertBefore(tr,first);}}
document.querySelectorAll('.rank-n').forEach(function(n){n.style.visibility=by==='rank'?'':'hidden';});document.querySelectorAll('.td-rank').forEach(function(n){n.style.visibility=by==='rank'?'':'hidden';});}
var tr=document.querySelector('.tier-row');if(tr){var nx=tr.nextElementSibling;if(nx)tr.dataset.before=nx.dataset.rank;}
bs.forEach(function(b){b.addEventListener('click',function(){bs.forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false');});order(b.dataset.order==='alpha'?'alpha':'rank');});});})();</script>`;
const CAT_FILTER_JS = `<script>(function(){var f={free:'',ship:'',eng:''},els=document.querySelectorAll('[data-free]'),cnt=document.querySelector('.cf-count'),empty=document.querySelector('.cat-empty');
function ok(el){return (!f.free||el.dataset.free==='1')&&(!f.ship||el.dataset.ship==='1')&&(!f.eng||(' '+el.dataset.eng+' ').indexOf(' '+f.eng+' ')!==-1);}
function apply(){var n=0,on=f.free||f.ship||f.eng;els.forEach(function(el){var y=ok(el);el.hidden=!y;if(y&&el.tagName==='TR')n++;});if(cnt)cnt.textContent=on?n+(n===1?' tool matches':' tools match'):'';if(empty)empty.hidden=!(on&&n===0);}
document.querySelectorAll('.cat-filters button[data-group]').forEach(function(b){b.addEventListener('click',function(){var g=b.dataset.group,v=b.dataset.value,act=f[g]===v;
document.querySelectorAll('.cat-filters button[data-group="'+g+'"]').forEach(function(o){o.setAttribute('aria-pressed','false');});f[g]=act?'':v;b.setAttribute('aria-pressed',act?'false':'true');apply();});});
document.querySelectorAll('[data-reset]').forEach(function(b){b.addEventListener('click',function(){f={free:'',ship:'',eng:''};document.querySelectorAll('.cat-filters button').forEach(function(o){o.setAttribute('aria-pressed','false');});apply();});});})();</script>`;

// ---------- Category pages ----------
const catIndex = [];
for (const [key, c] of Object.entries(TASKS)) {
  const list = tools.filter(t => t.tasks.includes(key));
  if (!list.length) continue;
  const p = `/category/${c.page}/`;
  catIndex.push({ c, p, n: list.length });
  const desc = `${list.length} AI tools for ${c.label.toLowerCase()} in game development, with pricing and commercial-use licence notes from each vendor's site. Checked ${SITE.updated}.`;
  const cp = COMPARE.filter(([a, b]) => bySlug[a].tasks.includes(key) && bySlug[b].tasks.includes(key));
  page(p, layout({
    title: fit(60, `Best ${c.h1} (${SITE.updated.slice(0, 4)}) | ${SITE.name}`, `Best ${c.h1} (${SITE.updated.slice(0, 4)})`, `Best ${c.h1}`, `Best AI tools: ${c.label} (${SITE.updated.slice(0, 4)})`),
    description: desc,
    pathname: p,
    og: ogFile(`category/${c.page}`, 'page', { kicker: `Category · ${list.length} ${list.length === 1 ? 'tool' : 'tools'}`, title: c.h1, sub: 'Pricing and commercial-use terms from each vendor, sourced and dated.', artPage: c.page }),
    jsonld: [{ '@context': 'https://schema.org', '@type': 'ItemList', name: c.h1, itemListElement: (RANKED[key] ? RANKED[key].rows.map(r => r.t) : list).map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/tools/${t.slug}/`), name: t.name })) }],
    body: `
<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/category/')}">Categories</a> › ${esc(c.label)}</nav>
<header class="cat-hero">${artImg(c.page, { eager: true })}<div>
<h1>Best ${esc(c.h1)}</h1>
${RANKED[key] ? `<p>${list.length} tools, ranked ${RANKED[key].nEvidence ? 'first by independent quality tests where they exist, then by fit for game devs' : 'by fit for game devs (we found no independent quality tests for these tools yet)'}. Paid placements never change the order. <a href="${L('/how-we-rank/')}">How we rank</a> · Checked ${timeEl(RANKED[key].checked)}</p>` : `<p>${list.length} tools, in alphabetical order (not ranked yet). Check each tool's commercial-use notes before you ship assets in a game.</p>`}
</div></header>
${catFilters(list)}
${catTable(list, RANKED[key])}<p class="cat-empty" hidden>No tools match these filters. <button type="button" class="linkish" data-reset>Clear filters</button></p></div>
${list.length > 1 ? `<div class="cmp-row" style="margin-top:6px"><span>Compare side by side:</span>${cp.map(cmpChip).join('')}<a class="chip c-muted" href="${L(`/compare/?task=${key}`)}">Pick any two →</a></div>` : ''}
${GUIDES.filter(g => g.task === key).map(g => `<section class="rel-guide" aria-label="Related guide">${linkCard({ href: L(`/guides/${g.slug}/`), title: g.title, kicker: 'Related workflow guide', desc: esc(g.outcome), media: artImg(guideArtPage(g)), foot: flowStrip(g, { max: 4 }), cls: 'feature', h: 'h2' })}</section>`).join('\n')}
${RANKED[key] ? `<h2 class="sub-h">Why each tool ranks where it does</h2>
<div class="grid ranked-cards">${RANKED[key].rows.map(r => toolCard(r.t, { compact: !!r.sig, attrs: `${catAttrs(r.t)} data-rank="${r.n}" data-alpha="${list.indexOf(r.t)}"`, note: r.sig ? rankNoteV2(r) : `<p class="rank-line"><span class="rank-n">#${r.n}</span>${r.label ? badge(r.label, 'accent') : ''}<span class="rank-tier">${r.tier === 'evidence' ? 'Independent tests' : 'Game-dev fit'}</span></p><p class="rank-why">${esc(r.why)} ${rankSources(r)}</p>\n` })).join('\n')}` : `<h2 class="sub-h">Verdicts</h2>
<div class="grid">${list.map(t => toolCard(t, { attrs: catAttrs(t) })).join('\n')}`}
${sponsorCard({ booking: SPONSORS.get(`category:${c.page}`) })}</div>
${newsletterBlock()}`,
    scripts: CAT_FILTER_JS + (RANKED[key] ? RANK_SWITCH_JS : ''),
  }));
}
// ---------- Categories hub: top picks + categories grouped by pipeline stage, each card showing its ranked top 3 ----------
const CAT_GROUPS = [
  { h: 'Art & assets', sub: 'Concepts, models, materials and motion', keys: ['concept-art', '3d-models', 'textures', 'animation'] },
  { h: 'Sound', sub: 'Character voices, music and effects', keys: ['voice', 'audio'] },
  { h: 'Gameplay & code', sub: 'Characters that talk back, code and worlds', keys: ['npc', 'code', 'level'] },
  { h: 'Ship it', sub: 'Translation, testing and trailers', keys: ['localisation', 'qa', 'marketing'] },
];
const CAT_BLURB = {
  'concept-art': 'Concept art, sprites, pixel art, icons and skyboxes.',
  '3d-models': 'Text- or image-to-3D props, characters and environment pieces.',
  'textures': 'Tileable materials, PBR maps and textures for 3D models.',
  'animation': 'Auto-rigging, keyframe help and video-to-mocap.',
  'voice': 'Text-to-speech and voice lines for characters.',
  'audio': 'Soundtracks, loops and sound effects.',
  'npc': 'Conversational NPCs with memory, voice and goals.',
  'code': 'Coding assistants and in-editor helpers for game code.',
  'level': 'Explorable worlds, levels and terrain from prompts or images.',
  'localisation': 'Translating and managing your game\'s text.',
  'qa': 'Automated playtesting and bug finding.',
  'marketing': 'Trailer shots, key art and promo clips.',
};
const catGuides = key => GUIDES.filter(g => g.task === key);
const catPairs = key => COMPARE.filter(([a, b]) => bySlug[a].tasks.includes(key) && bySlug[b].tasks.includes(key));
function hubCard(key) {
  const c = TASKS[key], list = tools.filter(t => t.tasks.includes(key));
  if (!list.length) return '';
  const R = RANKED[key];
  const top = R ? R.rows.slice(0, 3) : list.slice(0, 3).map(t => ({ t }));
  const lead = R && R.rows[0];
  const gs = catGuides(key), ps = catPairs(key);
  return `<article class="card is-link hub-card">
<div class="card-media hub-media">${artImg(c.page)}<span class="hub-count">${list.length} ${list.length === 1 ? 'tool' : 'tools'}</span></div>
<h3><a class="card-link" href="${L(`/category/${c.page}/`)}">${esc(c.label)}</a></h3>
<p class="card-desc">${esc(CAT_BLURB[key] || '')}</p>
${lead ? `<div class="hub-top"><span class="hub-n">#1</span>${logo(lead.t, 32)}<span class="hub-top-txt"><b>${esc(lead.t.name)}</b><small>${esc(lead.label || (lead.tier === 'evidence' ? 'Best on independent tests' : 'Best fit for game devs'))}</small></span></div>` : ''}
<div class="hub-next">${top.slice(lead ? 1 : 0).map((r, i) => `<span class="hub-mini" title="${esc(r.t.name)}">${R ? `<em>#${r.n || i + 2}</em>` : ''}${logo(r.t, 22)}${esc(r.t.name)}</span>`).join('')}</div>
<div class="hub-foot">${R ? `<span class="hub-basis${R.nEvidence ? ' is-ev' : ''}">${R.nEvidence ? 'Independent tests' : 'Ranked on features'}</span>` : ''}<span class="hub-links">${gs.length ? `<a class="above" href="${L(`/guides/${gs[0].slug}/`)}">Guide</a>` : ''}${ps.length ? `<a class="above" href="${L(`/compare/?task=${key}`)}">Compare</a>` : ''}</span></div>
</article>`;
}
const topPicks = Object.keys(TASKS).map(k => ({ k, R: RANKED[k] })).filter(x => x.R && x.R.nEvidence).map(({ k, R }) => ({ k, r: R.rows[0], joint: R.rows[1] && R.rows[0].label && R.rows[1].label === R.rows[0].label ? R.rows[1] : null }));
page('/category/', layout({
  title: `Best AI tools for every part of game development | ${SITE.name}`,
  description: 'The best AI tools for each game-dev job, ranked: concept art, 3D models, textures, animation, voice, music, NPCs, code, levels, localisation, QA and trailers.',
  pathname: '/category/',
  og: ogFile('category-hub', 'page', { kicker: 'Categories', title: 'The best AI tool for every part of your game', sub: `${Object.keys(TASKS).length} categories, ranked on independent tests where they exist.` }),
  body: `<h1 class="page-h">The best AI tool for every part of your game</h1>
<p class="page-sub">${Object.keys(TASKS).length} categories, each ranked: independent quality tests first where they exist, then fit for game devs. <a href="${L('/how-we-rank/')}">How we rank</a></p>
${topPicks.length ? `<section class="hub-picks" aria-labelledby="picks-h"><div class="sec-head"><h2 id="picks-h">Top picks backed by independent tests</h2></div>
<div class="uh-picks">${topPicks.map(({ k, r, joint }) => `<a class="uh-pick" href="${L(`/category/${TASKS[k].page}/`)}"><span class="uh-pick-logos">${logo(r.t, 44)}${joint ? logo(joint.t, 44) : ''}</span><span class="uh-pick-cat">${esc(TASKS[k].label)}</span><b>${esc(joint ? `${r.t.name} & ${joint.t.name}` : r.t.name)}</b><span class="uh-rank">${joint ? 'Joint #1' : '#1'}</span></a>`).join('')}</div></section>` : ''}
${CAT_GROUPS.map(gr => `<section class="hub-group" aria-labelledby="hg-${gr.keys[0]}"><div class="sec-head"><h2 id="hg-${gr.keys[0]}">${esc(gr.h)}</h2><p>${esc(gr.sub)}</p></div>
<div class="grid hub-grid">${gr.keys.map(hubCard).join('\n')}</div></section>`).join('\n')}
${newsletterBlock()}`,
}));

// ---------- Editorial helpers shared by engine hubs and licence guides ----------
// "Not stated by vendor" inside sourced text is shown muted, like empty data fields.
// Engine hub section (content.mjs ENGINE_HUBS): heading, optional intro, optional table with sources, sourced statements, tool chips.
const hubSection = sec => `<section class="card disc hub-sec"${sec.id ? ` id="${esc(sec.id)}"` : ''}><h2>${esc(sec.h)}</h2>${sec.checked ? `<p class="note">Checked ${timeEl(sec.checked)}.</p>` : ''}${sec.intro ? `<p class="hub-intro">${nsvText(sec.intro)}</p>` : ''}
${sec.tools && sec.tools.length ? chips(sec.tools.map(sl => bySlug[sl]).filter(Boolean).map(t => chip(t.name, { tool: t, href: toolUrl(t) })), 'div') : ''}
${sec.table ? `<div class="table-wrap"><table class="cmp hub-table"><thead><tr>${sec.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${sec.table.rows.map(r => `<tr>${r.map((c, i) => i ? `<td>${nsvText(c)}</td>` : `<th scope="row">${esc(c)}</th>`).join('')}</tr>`).join('')}</tbody></table></div>${sec.table.sources ? `<p class="note">Source: ${sec.table.sources.map(([l, u]) => `<a href="${esc(u)}" rel="noopener nofollow" target="_blank">${esc(l)}</a>`).join(', ')}.</p>` : ''}` : ''}
${sec.items && sec.items.length ? `<ul>${sec.items.map(x => `<li>${stmtN(x)}</li>`).join('')}</ul>` : ''}</section>`;

// ---------- Engine pages (one per ENGINE_PAGES entry with tagged tools; optional editorial hub from ENGINE_HUBS) ----------
for (const { k, e, list } of engineList) {
  const p = `/engine/${e.page}/`;
  const desc = `${list.length} AI ${list.length === 1 ? 'tool' : 'tools'} for game developers whose vendor documents an official ${e.what} plugin, integration or export, with pricing and commercial-use terms from each vendor's site.`;
  const H = ENGINE_HUBS[k];
  page(p, layout({
    title: H && H.title ? H.title : e.title ? e.title : `${e.h1} (${SITE.updated.slice(0, 4)}) | ${SITE.name}`,
    description: H && H.description ? H.description : e.description || desc,
    pathname: p,
    og: ogFile(`engine/${e.page}`, 'page', { kicker: `Engine · ${list.length} ${list.length === 1 ? 'tool' : 'tools'}`, title: e.h1, sub: 'Official plugins, integrations and exports, with pricing and commercial-use terms, sourced and dated.' }),
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'ItemList', name: e.h1, itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/tools/${t.slug}/`), name: t.name })) },
      crumbsLd([['All tools', '/'], [e.label, p]]),
      ...(H && H.faq && H.faq.length ? [faqLd(H.faq)] : []),
    ],
    body: `
<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/#engines')}">Engines</a> › ${esc(e.label)}</nav>
<h1 class="page-h">${esc(e.h1)}</h1>
${H ? `<section class="card qa" aria-label="Short answer"><p class="qa-a"><span><b>Short answer:</b> ${nsvText(H.answer)}</span></p><p class="qa-terms">Every statement below links to its source. Checked ${timeEl(H.checked)}.</p></section>
<h2 class="sub-h">Tools with an official ${esc(e.what)} plugin, integration or export</h2>` : ''}
<p class="page-sub">${list.length} ${list.length === 1 ? 'tool whose vendor documents' : 'tools whose vendors document'} an official ${esc(e.what)} plugin, integration or export target, in alphabetical order (this isn't a ranking). Most other tools export standard files (PNG, FBX, GLB, WAV and so on) that work in any engine: see <a href="${L('/tools/')}">all tools</a>. Check each tool's commercial-use notes before you ship.</p>
<div class="table-wrap"><table class="cmp"><thead><tr><th>Tool</th><th>Main task</th><th>Free plan</th><th>Commercial use</th></tr></thead><tbody>
${list.map(t => `<tr><td><a class="cmp-tool" href="${toolUrl(t)}">${logo(t, 24)}${esc(t.name)}</a></td><td><a href="${L(`/category/${TASKS[t.tasks[0]].page}/`)}">${esc(TASKS[t.tasks[0]].label)}</a></td><td>${isNsv(t.free) ? NSV : esc(FREE[t.free])}</td><td>${licBadge(t)}</td></tr>`).join('\n')}
</tbody></table></div>
${H ? H.sections.map(hubSection).join('\n') + faqBlock(H.faq) : ''}
<p class="quick"><span>Other engines:</span>${engineList.filter(x => x.k !== k).map(x => chip(x.e.label, { href: L(`/engine/${x.e.page}/`) })).join('')}</p>
<h2 class="sub-h">Tool details</h2>
<div class="grid">${list.map(t => toolCard(t)).join('\n')}</div>
${SPONSORS.get(`engine:${e.page}`) ? `<div class="grid sp-row">${sponsorCard({ booking: SPONSORS.get(`engine:${e.page}`) })}</div>` : ''}
${newsletterBlock()}`,
  }));
}

// ---------- Guides ----------
const stmt = x => `${esc(x.text)}${srcA(x.url)}`;
// Tools named in a step (by listing link or by name), shown as logo chips on that step.
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const toolAliases = tools.map(t => {
  const names = new Set([t.name, t.name.replace(/\s*\(.*\)$/, ''), t.name.replace(/(\.ai| AI)$/i, '')]);
  if (t.slug === 'unity-ai') names.delete('Unity'); // "Unity" alone means the engine
  return { t, names: [...names].filter(n => n.length > 3) };
});
const stepTools = st => {
  const txt = st.p.map(x => x.text).join(' '), urls = st.p.map(x => x.url || '').join(' ');
  return toolAliases.filter(({ t, names }) => urls.includes(`/tools/${t.slug}/`) || names.some(n => new RegExp(`(^|[^A-Za-z0-9])${reEsc(n)}(?![A-Za-z0-9])`).test(txt))).map(x => x.t);
};
const guideChips = g => chips(g.tools.map(s => bySlug[s]).filter(Boolean).map(t => chip(t.name, { tool: t })), 'div');
const engineBadges = g => (g.engines || []).map(e => badge(ENGINES[e], 'neutral')).join('');
const FEATURED = GUIDES[0];
const guideCard = g => linkCard({
  href: L(`/guides/${g.slug}/`), title: g.title, kicker: esc(g.kind || TASKS[g.task].label), media: artImg(guideArtPage(g)),
  desc: esc(g.outcome),
  foot: `${flowStrip(g)}<div class="card-foot"><span class="facts-line">${g.steps.length} steps${(g.engines || []).length ? ' · ' + g.engines.map(e => ENGINES[e]).join(', ') : ''}</span></div>`,
  attrs: ` data-task="${g.task}" data-engines="${(g.engines || []).join(' ')}"${g === FEATURED ? ' data-featured hidden' : ''}`,
});
const guideTasks = [...new Set(GUIDES.map(g => g.task))];
const guideEngines = Object.keys(ENGINES).filter(e => GUIDES.some(g => (g.engines || []).includes(e)));
page('/guides/', layout({
  title: `Workflow guides: AI tools in a game pipeline | ${SITE.name}`,
  description: 'Step-by-step, sourced guides for AI tools in game development: 3D models to engine, voice to lip-sync, concept to textures, open-weights licences.',
  jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Workflow guides', url: URL_('/guides/'), mainEntity: { '@type': 'ItemList', itemListElement: GUIDES.map((g, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/guides/${g.slug}/`), name: g.title })) } }],
  pathname: '/guides/',
  og: ogFile('guides', 'page', { kicker: 'Workflow guides', title: 'AI tools in a game pipeline, step by step', sub: `${GUIDES.length} sourced workflows, each step linked to official documentation.`, artPage: TASKS[FEATURED.task].page }),
  body: `<h1 class="page-h">Workflow guides</h1><p class="page-sub">Factual steps with a link to the official documentation for each one. Checked ${timeEl(CHECKED)}.</p>
<section id="featured" aria-label="Featured guide">
<article class="card is-link feature">
<div class="card-media">${artImg(guideArtPage(FEATURED), { eager: true })}</div>
<div class="feature-body">
<span class="kicker">Featured guide · ${esc(TASKS[FEATURED.task].label)}</span>
<h2><a class="card-link" href="${L(`/guides/${FEATURED.slug}/`)}">${esc(FEATURED.title)}</a></h2>
<p class="outcome">${esc(FEATURED.outcome)}</p>
${flowStrip(FEATURED, { max: 5 })}
<span class="facts-line">${FEATURED.steps.length} steps · ${(FEATURED.engines || []).map(e => ENGINES[e]).join(', ')}</span>
</div>
</article>
</section>
<div class="sec-head"><h2 id="all-guides">More guides</h2><p id="g-count" aria-live="polite"></p></div>
<div class="chip-filters" role="group" aria-label="Filter guides">
<div class="chips"><span class="cf-label">Task</span>${chip('All', { filter: ['task', ''], active: true })}${guideTasks.map(k => chip(TASKS[k].label, { filter: ['task', k] })).join('')}</div>
<div class="chips"><span class="cf-label">Engine</span>${chip('Any', { filter: ['engine', ''], active: true })}${guideEngines.map(e => chip(ENGINES[e], { filter: ['engine', e] })).join('')}</div>
</div>
<div class="grid g3" id="guide-grid">${GUIDES.map(guideCard).join('\n')}</div>
<p class="note">Also see: <a href="${L('/steam-ai-disclosure/')}">${esc(DISCLOSURE.title)}</a>.</p>`,
  scripts: `<script>(function(){var f={task:'',engine:''},cards=document.querySelectorAll('#guide-grid .card'),feat=document.getElementById('featured'),cnt=document.getElementById('g-count'),hd=document.getElementById('all-guides');
document.querySelectorAll('.chip-filters button').forEach(function(b){b.addEventListener('click',function(){f[b.dataset.group]=b.dataset.value;document.querySelectorAll('.chip-filters button[data-group="'+b.dataset.group+'"]').forEach(function(o){o.setAttribute('aria-pressed',o===b?'true':'false');});apply();});});
function apply(){var on=f.task||f.engine,n=0;feat.hidden=!!on;hd.textContent=on?'Matching guides':'More guides';cards.forEach(function(c){var ok=(!f.task||c.dataset.task===f.task)&&(!f.engine||(' '+c.dataset.engines+' ').indexOf(' '+f.engine+' ')!==-1);c.hidden=!(ok&&(on||!c.hasAttribute('data-featured')));if(ok)n++;});cnt.textContent=on?n+(n===1?' guide':' guides'):'';}})();</script>`,
}));
// ---------- Guide v2 layout: result up front, pick your path, step cards with do / you should see / watch out / media ----------
const ytId = s => /^[A-Za-z0-9_-]{11}$/.test(s || '') ? s : null;
// Click-to-load video: no request to YouTube until the visitor presses play (privacy + speed).
const videoEmbed = v => ytId(v.youtube_id) ? `<figure class="g-video"><button type="button" class="yt" data-yt="${v.youtube_id}" aria-label="Play video: ${esc(v.title)}"><span class="yt-play" aria-hidden="true">▶</span><span class="yt-title">${esc(v.title)}</span><span class="yt-meta">${esc(v.channel)} · YouTube · loads when you press play</span></button><figcaption>Official video from ${esc(v.channel)}. <a href="${esc(v.url || `https://www.youtube.com/watch?v=${v.youtube_id}`)}" rel="noopener nofollow" target="_blank">Watch on YouTube ↗</a></figcaption></figure>` : '';
const guideImage = (g, im) => `<figure class="g-img"><img src="${L(`/assets/guides/${g.slug}/${encodeURIComponent(im.file)}`)}" alt="${esc(im.alt || im.step)}" loading="lazy" decoding="async"><figcaption>${esc(im.caption || '')} Image: ${im.source_page ? `<a href="${esc(im.source_page)}" rel="noopener nofollow" target="_blank">${esc(im.credit)}</a>` : esc(im.credit)}, ${esc(im.licence)}.</figcaption></figure>`;
function stepCard(g, s, n) {
  const vids = (g.videos || []).filter(v => v.step === s.h).map(videoEmbed).join('');
  const imgs = (g.images || []).filter(im => im.step === s.h && im.file && fs.existsSync(`src/assets/guides/${g.slug}/${im.file}`)).map(im => guideImage(g, im)).join('');
  const stt = stepTools({ p: [{ text: `${s.h} ${s.do.join(' ')}` }] });
  return `<li class="g-step" id="step-${n}"><div class="g-num" aria-hidden="true">${n}</div><div class="card g-card">
<h3>${esc(s.h)}</h3>${stt.length ? chips(stt.map(t => chip(t.name, { tool: t, href: toolUrl(t) })), 'div') : ''}
<ol class="g-do">${s.do.map(d => `<li>${esc(d)}</li>`).join('')}</ol>
${s.see ? `<p class="g-see"><b>You should see:</b> ${esc(s.see)}</p>` : ''}${s.gotcha ? `<p class="g-gotcha"><b>Watch out:</b> ${esc(s.gotcha)}</p>` : ''}
${imgs}${vids}${s.source && s.source.url ? `<p class="g-src">From the official docs: <a href="${esc(s.source.url)}" rel="noopener nofollow" target="_blank">${esc(s.source.label || 'source')} ↗</a></p>` : ''}
</div></li>`;
}
// Licence-style guides: an at-a-glance table (rows: model, asset, licence, outputs, limits, catch, tone, source).
// Tone colours the licence badge only (commercial-use signal): ok = permissive, warn = conditions, unk = not verified.
const GT_TONE = { ok: 'Permissive', warn: 'Conditions apply', bad: 'Not for commercial use', unk: 'Not verified' };
const guideTable = g => `<section class="g-table" aria-labelledby="gt-h"><h2 class="g-h" id="gt-h">The licences at a glance</h2>
<div class="table-wrap"><table class="cmp lic-table"><thead><tr>${g.table.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>
${g.table.rows.map(r => `<tr><th scope="row">${esc(r.model)}<br>${badge(GT_TONE[r.tone] || GT_TONE.unk, GT_TONE[r.tone] ? r.tone : 'unk')}</th>${[esc(r.asset), nsvText(r.licence) + srcA(r.source, 'licence'), nsvText(r.outputs), nsvText(r.limits), nsvText(r.catch)].map((c, i) => `<td data-label="${esc(g.table.head[i + 1])}">${c}</td>`).join('')}</tr>`).join('\n')}
</tbody></table></div><p class="note">Each row links to the licence or model card it quotes. Read the full licence for the exact version you use.</p></section>`;
// Scope-style guides: a plain table (situation, answer, why; optional per-row source link). No colour: colour is reserved for commercial-use badges.
const guideScope = g => `<section class="g-table" aria-labelledby="gs-h"><h2 class="g-h" id="gs-h">${esc(g.scope.title || 'At a glance')}</h2>
<div class="table-wrap"><table class="cmp lic-table"><thead><tr>${g.scope.head.map(h => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>
${g.scope.rows.map(r => `<tr><th scope="row">${esc(r.situation)}</th>${[nsvText(r.answer), nsvText(r.why) + (r.source ? srcA(r.source, 'source') : '')].map((c, i) => `<td data-label="${esc(g.scope.head[i + 1])}">${c}</td>`).join('')}</tr>`).join('\n')}
</tbody></table></div>${g.scope.source ? `<p class="note">Source:${srcA(g.scope.source, 'Steamworks Content Survey')} · Checked ${timeEl(g.checked || CHECKED)}</p>` : ''}</section>`;
// Total step cards in a v2 guide (shared + every path), used when the content.mjs entry has no legacy steps.
const guideStepCount = g => g.steps.length || (g.shared || []).length + (g.paths || []).reduce((n, p) => n + p.steps.length, 0);
function guideV2(g, gt) {
  const shared = g.shared || [];
  return `<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/guides/')}">Guides</a> › ${esc(g.title)}</nav>
<article class="guide g2">
<header class="guide-hero"><div class="guide-hero-art">${artImg(guideArtPage(g), { eager: true })}</div><div class="guide-hero-body"><span class="kicker">${esc(g.kind || 'Workflow guide')}${g.kind ? '' : ` · ${esc(TASKS[g.task].label)}`}</span><h1>${esc(g.title)}</h1><p class="lead">${esc(g.result || g.outcome)}</p>
<p class="g-meta">${chips(gt.map(t => chip(t.name, { tool: t, href: toolUrl(t) })), 'div')}</p></div></header>
${flowStrip(g, { max: 5 })}
${g.notice ? `<section class="card qa" aria-label="Before you copy anything"><p class="qa-a"><span>${esc(g.notice)}</span></p></section>` : ''}
${gt.length ? `<details class="card g-costs"><summary>Cost and licences of the AI tools in this guide</summary><ul class="cost-list">${gt.map(t => `<li><a class="tname" href="${toolUrl(t)}">${esc(t.name)}</a>${isNsv(t.commercial) ? '' : licBadge(t)}${isNsv(t.freeTier) ? '' : `<span>${esc(t.freeTier)}</span>`}${srcA(t.pricingSource, 'pricing')}</li>`).join('')}</ul></details>` : ''}
${g.table ? guideTable(g) : ''}${g.scope ? guideScope(g) : ''}
${shared.length ? `<h2 class="g-h">Everyone: steps 1–${shared.length}</h2><ol class="g-steps">${shared.map((s, i) => stepCard(g, s, i + 1)).join('\n')}</ol>` : ''}
<section class="g-paths" aria-labelledby="path-h"><h2 class="g-h" id="path-h">Then pick your path</h2>
<div class="g-tabs" role="tablist">${g.paths.map((pth, i) => `<button type="button" role="tab" class="chip" id="tab-${pth.key}" aria-controls="path-${pth.key}" aria-selected="${i === 0 ? 'true' : 'false'}" data-path="${pth.key}">${esc(pth.label)}</button>`).join('')}</div>
${g.paths.map((pth, i) => `<div class="g-path" id="path-${pth.key}" role="tabpanel" aria-labelledby="tab-${pth.key}"${i === 0 ? '' : ' data-hidden'}><h3 class="g-path-h">${esc(pth.label)}</h3><ol class="g-steps">${pth.steps.map((s, j) => stepCard(g, s, shared.length + j + 1)).join('\n')}</ol></div>`).join('\n')}
</section>
${g.alternative ? `<aside class="card g-alt"><span class="kicker">Another option</span><p><b>${esc(g.alternative.name)}.</b> ${esc(g.alternative.note)} <a href="${esc(g.alternative.url)}" rel="noopener nofollow" target="_blank">Official repo ↗</a></p></aside>` : ''}
${faqBlock(g.faq)}
<p class="note">${g.note ? `${esc(g.note)} ` : ''}Written from the official documentation linked on each step and checked ${timeEl(g.checked || CHECKED)}. ${g.kind ? '' : 'Menus and settings change between versions, so follow the linked docs if something looks different. '}No vendor reviews or pays for these guides.</p>
</article>
${gt.length ? `<section class="related"><div class="sec-head"><h2>Tools for this workflow</h2></div><div class="grid g3">${gt.map(t => toolCard(t, { compact: true })).join('\n')}</div></section>` : ''}${g.related ? `<p class="note">${g.related.map(r => `<a href="${L(r.href)}">${esc(r.label)}</a>`).join(' · ')}</p>` : ''}`;
}
// Path tabs (all paths are visible without JS) + click-to-load YouTube (youtube-nocookie).
const GUIDE_V2_JS = `<script>(function(){var tabs=document.querySelectorAll('.g-tabs [data-path]'),panes=document.querySelectorAll('.g-path');
panes.forEach(function(p){if(p.hasAttribute('data-hidden'))p.hidden=true;});document.querySelectorAll('.g-path-h').forEach(function(h){h.classList.add('sr-only');});
function show(k){tabs.forEach(function(t){t.setAttribute('aria-selected',t.dataset.path===k?'true':'false');});panes.forEach(function(p){p.hidden=p.id!=='path-'+k;});}
tabs.forEach(function(t){t.addEventListener('click',function(){show(t.dataset.path);history.replaceState(null,'','#'+t.dataset.path);});});
var h=location.hash.slice(1);if(h&&document.getElementById('path-'+h))show(h);
document.querySelectorAll('button.yt').forEach(function(b){b.addEventListener('click',function(){var f=document.createElement('iframe');f.src='https://www.youtube-nocookie.com/embed/'+b.dataset.yt+'?autoplay=1';f.title=b.getAttribute('aria-label');f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;f.loading='lazy';f.className='yt-frame';b.replaceWith(f);});});})();</script>`;

for (const g of GUIDES) {
  const p = `/guides/${g.slug}/`;
  const gt = g.tools.map(s => bySlug[s]).filter(Boolean);
  page(p, layout({
    title: g.metaTitle || fit(60, `${g.title} | ${SITE.name}`, g.title, `${g.title.split(':')[0]} | ${SITE.name}`), description: g.description, pathname: p,
    og: ogFile(`guides/${g.slug}`, 'page', { kicker: `${g.kind || 'Workflow guide'} · ${guideStepCount(g)} steps`, title: g.title, sub: g.outcome, artPage: TASKS[g.task].page }),
    // Workflow guides are HowTo (v2 steps from shared + paths when the legacy list is empty); reference guides (`kind`) are Article.
    jsonld: [g.kind
      ? { '@context': 'https://schema.org', '@type': 'Article', headline: g.title, description: g.description, url: URL_(p), mainEntityOfPage: URL_(p), datePublished: g.published || PUBLISHED, dateModified: g.checked || CHECKED, inLanguage: 'en-AU', author: ORG, publisher: ORG }
      : { '@context': 'https://schema.org', '@type': 'HowTo', name: g.title, description: g.description, step: (g.steps.length ? g.steps.map(st => ({ name: st.h, text: st.p.map(x => x.text).join(' ') })) : [...(g.shared || []), ...(g.paths || []).flatMap(pth => pth.steps.map(st => ({ ...st, h: `${pth.label}: ${st.h}` })))].map(st => ({ name: st.h, text: st.do.join(' ') }))).map((st, i) => ({ '@type': 'HowToStep', position: i + 1, ...st })) },
      crumbsLd([['All tools', '/'], ['Guides', '/guides/'], [g.title, p]]),
      ...(g.faq && g.faq.length ? [faqLd(g.faq)] : [])],
    scripts: g.paths ? GUIDE_V2_JS : '',
    body: g.paths ? guideV2(g, gt) : `<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/guides/')}">Guides</a> › ${esc(g.title)}</nav>
<article class="guide"><header class="guide-hero"><div class="guide-hero-art">${artImg(guideArtPage(g), { eager: true })}</div><div class="guide-hero-body"><span class="kicker">Workflow guide · ${esc(TASKS[g.task].label)}</span><h1>${esc(g.title)}</h1><p class="lead">${esc(g.intro)}</p></div></header>
${flowStrip(g, { max: 5 })}
<section class="card g-summary" aria-labelledby="sum-h">
<h2 id="sum-h">Summary</h2>
<dl>
<dt>What you'll end up with</dt><dd>${esc(g.outcome)}</dd>
<dt>Steps and engines</dt><dd><span class="badges">${badge(`${g.steps.length} steps`, 'neutral')}${engineBadges(g)}</span></dd>
<dt>AI tools in this guide</dt><dd>${chips(gt.map(t => chip(t.name, { tool: t, href: toolUrl(t) })), 'div')}</dd>
<dt>Cost (from vendor pricing)</dt><dd><ul class="cost-list">${gt.map(t => `<li><a class="tname" href="${toolUrl(t)}">${esc(t.name)}</a>${isNsv(t.free) ? NSV : badge(FREE[t.free], t.free === 'yes' ? 'info' : 'neutral')}${isNsv(t.freeTier) ? '' : `<span>${esc(t.freeTier)}</span>`}${srcA(t.pricingSource, 'pricing')}</li>`).join('')}</ul></dd>
</dl>
</section>
<ol class="steps">${g.steps.map((st, i) => { const stt = stepTools(st); return `<li class="step"><div class="card"><span class="step-k">Step ${i + 1} of ${g.steps.length}</span><h2>${esc(st.h)}</h2>${stt.length ? chips(stt.map(t => chip(t.name, { tool: t, href: toolUrl(t) })), 'div') : ''}<ul>${st.p.map(x => `<li>${stmt(x)}</li>`).join('')}</ul></div></li>`; }).join('')}</ol>
<p class="note">Checked ${timeEl(CHECKED)}. Tools and docs change, so follow the linked sources. No vendor reviews or pays for these guides.</p></article>
<section class="related"><div class="sec-head"><h2>Tools for this workflow</h2></div><div class="grid g3">${gt.map(t => toolCard(t, { compact: true })).join('\n')}</div></section>`,
  }));
}

// ---------- Store AI disclosure ----------
const DISC_CHECKED = DISCLOSURE.checked || CHECKED;
const discOg = ogFile('page/steam-ai-disclosure', 'page', { kicker: 'GameDev AI Tools', title: DISCLOSURE.metaTitle || `${DISCLOSURE.title} (${CHECKED.slice(0, 4)})`, sub: DISCLOSURE.description });
page('/steam-ai-disclosure/', layout({
  title: `${DISCLOSURE.metaTitle || `${DISCLOSURE.title} (${CHECKED.slice(0, 4)})`} | ${SITE.name}`, description: DISCLOSURE.description, pathname: '/steam-ai-disclosure/',
  og: discOg,
  jsonld: [
    { '@context': 'https://schema.org', '@type': 'Article', headline: DISCLOSURE.title, description: DISCLOSURE.description, abstract: DISCLOSURE.answer, url: URL_('/steam-ai-disclosure/'), mainEntityOfPage: URL_('/steam-ai-disclosure/'), datePublished: PUBLISHED, dateModified: DISC_CHECKED, inLanguage: 'en-AU', author: ORG, publisher: ORG, ...(discOg ? { image: URL_(discOg) } : {}) },
    crumbsLd([['All tools', '/'], ['Guides', '/guides/'], ['Store AI disclosure', '/steam-ai-disclosure/']]),
    ...(DISCLOSURE.faq && DISCLOSURE.faq.length ? [faqLd(DISCLOSURE.faq)] : []),
  ],
  body: `<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/guides/')}">Guides</a> › Store AI disclosure</nav>
<article class="guide"><h1 class="page-h">${esc(DISCLOSURE.title)}</h1>
${DISCLOSURE.answer ? `<section class="card qa" aria-label="Short answer"><p class="qa-a"><span><b>Short answer:</b> ${esc(DISCLOSURE.answer)}</span></p></section>` : ''}<p class="lead">${esc(DISCLOSURE.description)} Checked ${timeEl(DISC_CHECKED)}. See also the <a href="${L('/cheat-sheet/')}">Can I ship it? cheat sheet</a>.</p><p class="note">Filling in Steam's form? <a href="${L('/guides/steam-ai-disclosure-examples/')}">See example wording for each kind of AI content</a>.</p>
<nav aria-label="Jump to a store">${chips(DISCLOSURE.sections.filter(sec => sec.id).map(sec => chip(sec.h, { href: `#${sec.id}` })), 'div')}</nav>
${DISCLOSURE.sections.map(hubSection).join('')}
${faqBlock(DISCLOSURE.faq, 'disc-faq')}
<p class="note">${esc(DISCLOSURE.note)}</p></article>`,
}));

// ---------- New this week ----------
const newsLogo = (n, size = 44) => n.tool && bySlug[n.tool] ? logo(bySlug[n.tool], size) : `<span class="tlogo" aria-hidden="true" style="display:inline-grid;place-items:center;width:${size}px;height:${size}px">${MARK.replace('width="28" height="28"', `width="${Math.round(size * 0.6)}" height="${Math.round(size * 0.6)}"`).replace('id="gm"', 'id="gmn"').replace('url(#gm)', 'url(#gmn)')}</span>`;
const newsMeta = n => `<p class="news-meta">Source: <a href="${esc(n.source)}" rel="noopener nofollow" target="_blank">${esc(n.sourceName)}</a>${n.tool && bySlug[n.tool] ? ` · Listing: <a href="${toolUrl(bySlug[n.tool])}">${esc(bySlug[n.tool].name)}</a>` : ''}</p>`;
const whyLine = n => n.why ? `<p class="why"><b>Why it matters for game devs:</b> ${esc(n.why)}</p>` : '';
const newsCard = n => `<article class="card news-item">
<div class="card-top">${newsLogo(n)}<div class="card-title"><span class="badges">${newsBadge(n)}<span class="card-sub">${timeEl(n.date, true)}</span></span></div></div>
<h3>${esc(n.title)}</h3>
<p class="news-text">${esc(n.text)}</p>
${whyLine(n)}${newsMeta(n)}
</article>`;
const newsTop = n => `<article class="card news-top">
<div class="card-media">${newsArt(n) ? artImg(newsArt(n), { eager: true }) : ''}</div>
<div class="feature-body">
<span class="badges">${newsBadge(n)}<span class="card-sub">${timeEl(n.date, true)}</span></span>
<div class="card-top">${newsLogo(n, 40)}<h3>${esc(n.title)}</h3></div>
<p class="news-text">${esc(n.text)}</p>
${whyLine(n)}${newsMeta(n)}
</div>
</article>`;
// Week headings ("This week" / "Last week") are relative, so they are re-labelled in the browser from today's Australia/Brisbane date;
// the build-time label is only the no-JS fallback. Absolute dates stay as built.
const WEEK_JS = `<script>(function(){try{var t=new Intl.DateTimeFormat('en-CA',{timeZone:'Australia/Brisbane',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());var dn=function(s){return Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10))/864e5;};var d=dn(t),ws=d-((new Date(d*864e5).getUTCDay()+6)%7);var W=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];document.querySelectorAll('[data-week]').forEach(function(e){var k=dn(e.getAttribute('data-week')),n=Math.round((ws-k)/7),x=new Date(k*864e5);e.textContent=n===0?'This week':n===1?'Last week':'Week of '+W[x.getUTCDay()]+' '+x.getUTCDate()+' '+M[x.getUTCMonth()];});}catch(e){}})();</script>`;
const newsWeeks = [];
for (const n of NEWS) { const k = weekStart(n.date); let w = newsWeeks.find(x => x.k === k); if (!w) newsWeeks.push(w = { k, label: weekLabel(n.date), items: [] }); w.items.push(n); }
page('/new/', layout({
  title: `New this week: AI game-dev tool releases | ${SITE.name}`, description: 'Real releases and updates to AI tools for game developers this week, each with a source link.', pathname: '/new/',
  og: ogFile('new', 'page', { kicker: 'New this week', title: 'AI game-dev tool releases and updates', sub: NEWS.slice(0, 2).map(n => n.title).join(' · '), artPage: newsArt(NEWS[0]) || undefined }),
  body: `<h1 class="page-h">New this week</h1><p class="page-sub">Releases and updates to AI tools for game devs, each linked to its source. Dates are the source's publication date (Australia/Brisbane). Last checked ${timeEl(CHECKED)}.</p>
${newsWeeks.map((w, wi) => `<section aria-labelledby="wk-${wi}"><h2 class="week-h" id="wk-${wi}"><span data-week="${isoOf(w.k)}">${esc(w.label)}</span> <small>${dateLabel(isoOf(w.k))} to ${dateLabel(isoOf(w.k + 6))}</small></h2>
${wi === 0 ? newsTop(w.items[0]) : ''}
<div class="news-list">${w.items.filter((n, i) => !(wi === 0 && i === 0)).map(newsCard).join('\n')}</div></section>`).join('\n')}
<p class="note">Know of a release we missed? <a href="${L('/submit/')}">Submit it</a> with a link to the official announcement.</p>
${newsletterBlock({ heading: 'Get this every week', text: `New AI tools for game devs and changes to their pricing and licences, by email, plus our <a href="${L('/cheat-sheet/')}">ship-it cheat sheet</a>. Every email has an unsubscribe link.` })}`,
  scripts: WEEK_JS,
}));

// ---------- Comparisons ----------
const ROWS = [
  ['Best for', t => val(t.bestFor)],
  ['What it does', t => esc(t.summary)],
  ['Verdict', t => esc(t.verdict)],
  ['Tasks', t => t.tasks.map(k => esc(TASKS[k].label)).join(', '), t => t.tasks.join()],
  ['Engines', t => esc(engineText(t)), t => engineText(t)],
  ['Free plan', t => `${isNsv(t.free) ? NSV : badge(FREE[t.free], t.free === 'yes' ? 'info' : 'neutral')} ${isNsv(t.free) && isNsv(t.freeTier) ? '' : val(t.freeTier)}`, t => t.free],
  ['Pricing', t => `${val(t.pricing)}${srcA(t.pricingSource)}`],
  ['Export formats', t => `${val(t.exportFormats)}${srcA(t.exportSource)}`, t => t.exportFormats],
  ['Commercial use', t => `${licBadge(t)}<br>${val(t.license)}${srcA(t.licenseSource)}`, t => t.commercial],
  ['Revenue share / caps', t => val(t.revenue), t => t.revenue],
  ['API', t => `${val(API_L[t.api.status])}${isNsv(t.api.note) ? '' : `. ${esc(t.api.note)}`}${srcA(t.api.source)}`, t => t.api.status],
  ['MCP server', t => `${val(MCP_L[t.mcp.status])}${isNsv(t.mcp.note) ? '' : `. ${esc(t.mcp.note)}`}${srcA(t.mcp.source)}`, t => t.mcp.status],
  ['Last checked', t => timeEl(t.lastChecked, true)],
];
// Difference chips, computed from data fields only (null = not stated or not applicable, so no chip). No ratings or winners.
// "Cheaper entry plan" is not computed: prices are free text in the data, not directly comparable.
const FACTS = [
  ['Free plan commercial', t => ({ yes: true, paid: false, check: false, no: false }[freeShip(t)[0]] ?? null)],
  ['Public API', t => ({ yes: true, no: false, partner: false }[t.api.status] ?? null)],
  ['Official MCP', t => ({ official: true, 'none-found': false, client: false, community: false, preview: false }[t.mcp.status] ?? null)],
  ['Free plan', t => ({ yes: true, trial: false, no: false }[t.free] ?? null)],
];
function diffChips(A, B) {
  const res = [];
  for (const [label, f] of FACTS) {
    const a = f(A), b = f(B);
    if (a === null || b === null) continue;
    const v = a && b ? 'both' : !a && !b ? 'neither' : a ? A.name : B.name;
    res.push({ label: `${label}: ${v}`, rank: v === 'both' || v === 'neither' ? 1 : 0 });
  }
  return res.sort((x, y) => x.rank - y.rank).slice(0, 3).map(x => x.label);
}
const pairTask = (A, B) => B.tasks.includes(A.tasks[0]) ? A.tasks[0] : A.tasks.includes(B.tasks[0]) ? B.tasks[0] : A.tasks.find(k => B.tasks.includes(k)) || A.tasks[0];
const cmpGroups = Object.keys(TASKS).map(k => ({ k, pairs: COMPARE.filter(([a, b]) => pairTask(bySlug[a], bySlug[b]) === k) })).filter(g => g.pairs.length);
// Every pair of tools that share a task gets a page, so "pick any two" always lands somewhere. Curated COMPARE
// pairs get a versus share image; generated pairs use the generic one. See THIN_NSV below for which pairs are indexed.
const pairKey = (a, b) => [a, b].sort().join('|');
const CURATED = new Set(COMPARE.map(([a, b]) => pairKey(a, b)));
const ALL_PAIRS = COMPARE.map(([a, b]) => [a, b, true]);
for (const k of Object.keys(TASKS)) {
  const ts = tools.filter(t => t.tasks.includes(k)); // alphabetical
  for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
    const key = pairKey(ts[i].slug, ts[j].slug);
    if (!CURATED.has(key) && !ALL_PAIRS.some(([a, b]) => pairKey(a, b) === key)) ALL_PAIRS.push([ts[i].slug, ts[j].slug, false]);
  }
}
const pairUrl = Object.fromEntries(ALL_PAIRS.map(([a, b]) => [pairKey(a, b), L(`/compare/${a}-vs-${b}/`)]));
const PICKER_DATA = {
  tasks: Object.entries(TASKS).map(([k, c]) => ({ k, label: c.label, tools: tools.filter(t => t.tasks.includes(k)).map(t => [t.slug, t.name]), top: RANKED[k] ? RANKED[k].rows.slice(0, 2).map(r => r.t.slug) : [] })).filter(x => x.tools.length > 1),
  pairs: pairUrl,
};
// Compact pair row: both logos, "A vs B", a licence dot per tool; optional tag (e.g. "#1 vs #2").
const licDot = t => `<i class="ldot ld-${licTone(t)}" title="${esc(t.name)}: ${esc(COMMERCIAL[t.commercial] || NSV_TEXT)}"></i>`;
const pairRow = ([a, b], tag = '') => { const A = bySlug[a], B = bySlug[b], u = pairUrl[pairKey(a, b)] || L(`/compare/${a}-vs-${b}/`); return `<a class="prow${tag ? ' is-top' : ''}" href="${u}"><span class="prow-logos">${logo(A, 30)}${logo(B, 30)}</span><span class="prow-name">${esc(A.name)} <em>vs</em> ${esc(B.name)}</span>${tag ? `<span class="prow-tag">${esc(tag)}</span>` : ''}<span class="prow-lic">${licDot(A)}${licDot(B)}</span></a>`; };
function cmpPanel(k) {
  const list = tools.filter(t => t.tasks.includes(k));
  if (list.length < 2) return '';
  const R = RANKED[k], top = R ? [R.rows[0].t.slug, R.rows[1].t.slug] : null;
  const curated = COMPARE.filter(([a, b]) => pairTask(bySlug[a], bySlug[b]) === k && !(top && pairKey(a, b) === pairKey(top[0], top[1])));
  return `<section class="card cmp-panel" aria-labelledby="cp-${k}"><div class="cmp-panel-h"><h3 id="cp-${k}">${esc(TASKS[k].label)}</h3><a href="${L(`/compare/?task=${k}`)}">Pick any two →</a></div>
${top ? pairRow(top, '#1 vs #2') : ''}${curated.map(p => pairRow(p)).join('')}
<p class="cmp-panel-foot">${list.length} tools · <a href="${L(`/category/${TASKS[k].page}/`)}">See the ranking</a></p></section>`;
}
const pairCard = ([a, b]) => { const A = bySlug[a], B = bySlug[b]; return `<article class="card is-link vs">
<span class="vs-logos">${logo(A, 48)}<em>vs</em>${logo(B, 48)}</span>
<h3><a class="card-link" href="${L(`/compare/${a}-vs-${b}/`)}">${esc(A.name)} vs ${esc(B.name)}</a></h3>
<ul class="vs-lic">${[A, B].map(t => `<li><span>${esc(t.name)}</span>${isNsv(t.commercial) ? `<span class="nsv">${NSV_TEXT}</span>` : licBadge(t)}</li>`).join('')}</ul>
</article>`; };
page('/compare/', layout({
  title: `AI game-dev tool comparisons | ${SITE.name}`, description: 'Compare two AI tools for game developers side by side: free plans, pricing, commercial-use terms, API and engine support, from each vendor\'s published pages.', pathname: '/compare/',
  jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'AI game-dev tool comparisons', url: URL_('/compare/'), mainEntity: { '@type': 'ItemList', itemListElement: COMPARE.map((c, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/compare/${c[0]}-vs-${c[1]}/`) })) } }],
  og: ogFile('compare', 'page', { kicker: 'Comparisons', title: 'AI game-dev tools, side by side', sub: `Pick any two tools that do the same job: sourced facts side by side, plus our ranking where we have evidence.` }),
  body: `<h1 class="page-h">Compare AI tools side by side</h1><p class="page-sub">Pick two tools that do the same job. Facts come from each vendor's published pricing, specs and licence terms, and each page shows <a href="${L('/how-we-rank/')}">our ranking</a> where we have evidence.</p>
<form class="card picker" id="picker" onsubmit="return false">
<label class="pk-task">Task<select id="pk-task">${PICKER_DATA.tasks.map(x => `<option value="${x.k}">${esc(x.label)}</option>`).join('')}</select></label>
<label>First tool<select id="pk-a"></select></label>
<span class="pk-vs" aria-hidden="true">vs</span>
<label>Second tool<select id="pk-b"></select></label>
<button class="btn" type="submit" id="pk-go">Compare</button>
<noscript><p class="note">The picker needs JavaScript. Browse the comparisons below instead.</p></noscript>
</form>
<h2 class="sub-h">Top matchups by category</h2>
<p class="cmp-legend"><i class="ldot ld-ok"></i> commercial use allowed <i class="ldot ld-warn"></i> paid plans only or restricted <i class="ldot ld-bad"></i> not allowed <i class="ldot ld-unk"></i> not stated</p>
${CAT_GROUPS.map(gr => `<div class="cmp-stage"><h3 class="cmp-stage-h">${esc(gr.h)}</h3><div class="cmp-panels cp-${gr.keys.filter(k => tools.filter(x => x.tasks.includes(k)).length > 1).length}">${gr.keys.map(cmpPanel).join('')}</div></div>`).join('\n')}
<p class="note">Licence badges: green = commercial use allowed, amber = paid plans only or restricted, red = not allowed. Always read the vendor's current terms before you ship.</p>`,
  scripts: `<script>window.PICK=${JSON.stringify(PICKER_DATA).replace(/</g, '\\u003c')};
(function(){var D=window.PICK,t=document.getElementById('pk-task'),a=document.getElementById('pk-a'),b=document.getElementById('pk-b');
var q=new URLSearchParams(location.search);if(q.get('task')&&D.tasks.some(function(x){return x.k===q.get('task');}))t.value=q.get('task');
function fill(sel,list,skip){var cur=sel.value;sel.innerHTML='';list.forEach(function(p){if(p[0]===skip)return;var o=document.createElement('option');o.value=p[0];o.textContent=p[1];sel.appendChild(o);});if([].some.call(sel.options,function(o){return o.value===cur;}))sel.value=cur;}
function list(){for(var i=0;i<D.tasks.length;i++)if(D.tasks[i].k===t.value)return D.tasks[i].tools;return [];}
function top(){for(var i=0;i<D.tasks.length;i++)if(D.tasks[i].k===t.value)return D.tasks[i].top||[];return [];}
function sync(){var l=list(),tp=top();fill(a,l,null);if(tp[0])a.value=tp[0];fill(b,l,a.value);if(tp[1]&&tp[1]!==a.value)b.value=tp[1];}
t.addEventListener('change',function(){a.value='';sync();});a.addEventListener('change',function(){fill(b,list(),a.value);});
document.getElementById('picker').addEventListener('submit',function(){var k=[a.value,b.value].sort().join('|');if(D.pairs[k])location.href=D.pairs[k];});
sync();})();</script>`,
}));
// "Bottom line for game devs": sentences generated only from sourced fields, each with its source link.
function bottomLine(A, B) {
  const items = [];
  const licS = t => t.commercial === 'unverified' ? 'not stated by vendor' : (COMMERCIAL[t.commercial] || NSV_TEXT).toLowerCase();
  items.push(A.commercial === B.commercial && A.commercial !== 'unverified'
    ? `<b>Commercial use:</b> both ${esc(licS(A))} (${esc(A.name)}${srcA(A.licenseSource, 'terms')}; ${esc(B.name)}${srcA(B.licenseSource, 'terms')}).`
    : `<b>Commercial use:</b> ${esc(A.name)}: ${esc(licS(A))}${srcA(A.licenseSource, 'terms')}. ${esc(B.name)}: ${esc(licS(B))}${srcA(B.licenseSource, 'terms')}.`);
  const fr = t => isNsv(t.free) ? 'free plan not stated by vendor' : `${esc(FREE[t.free].toLowerCase())}${isNsv(t.freeTier) ? '' : ` (${esc(t.freeTier)})`}`;
  items.push(`<b>Free plan:</b> ${esc(A.name)}: ${fr(A)}${srcA(A.pricingSource, 'pricing')}. ${esc(B.name)}: ${fr(B)}${srcA(B.pricingSource, 'pricing')}.`);
  const k1 = freeShip(A)[0], k2 = freeShip(B)[0];
  if (!['unk', 'na'].includes(k1) && !['unk', 'na'].includes(k2)) {
    const ok = [A, B].filter(t => freeShip(t)[0] === 'yes').map(t => esc(t.name));
    items.push(`<b>Shipping free-plan output in a paid game:</b> ${ok.length === 2 ? 'both allow it' : ok.length === 1 ? `only ${ok[0]} allows it` : 'neither allows it'}, per their published terms.`);
  }
  const API_P = { yes: 'public API', no: 'no public API', partner: 'API for partners only', na: 'API not applicable', unverified: 'API not stated by vendor' };
  const MCP_P = { official: 'official MCP server', client: 'connects to MCP servers', community: 'community MCP server only', preview: 'MCP server in preview', 'none-found': 'no MCP server found', unverified: 'MCP not stated by vendor' };
  const am = t => `${API_P[t.api.status] || API_P.unverified}, ${MCP_P[t.mcp.status] || MCP_P.unverified}`;
  items.push(am(A) === am(B) ? `<b>API and MCP:</b> both: ${esc(am(A))}.` : `<b>API and MCP:</b> ${esc(A.name)}: ${esc(am(A))}. ${esc(B.name)}: ${esc(am(B))}.`);
  const eng = t => t.engines.some(e => ENGINES[e]) ? esc(engineText(t)) : 'none stated (standard file export)';
  items.push(eng(A) === eng(B) ? `<b>Engine integrations stated by the vendor:</b> both: ${eng(A)}.` : `<b>Engine integrations stated by the vendor:</b> ${esc(A.name)}: ${eng(A)}. ${esc(B.name)}: ${eng(B)}.`);
  return items;
}
// At-a-glance card for one side of a comparison.
const glance = (t, k) => { const r = k ? rankOf(t.slug, k) : null; return `<article class="card glance">
${r ? `<a class="glance-rank" href="${L(`/category/${TASKS[k].page}/`)}"><b>#${r.n}</b> in ${esc(TASKS[k].label)}${r.label ? ` · ${esc(r.label)}` : ''}</a>` : ''}<div class="card-top">${logo(t, 48, true)}<div class="card-title"><h2><a href="${toolUrl(t)}">${esc(t.name)}</a></h2><span class="card-sub">${esc([TASKS[t.tasks[0]].label, isNsv(t.pricingModel) ? '' : PRICING[t.pricingModel]].filter(Boolean).join(' · '))}</span></div></div>
<dl class="glance-facts">
<dt>Commercial use</dt><dd>${isNsv(t.commercial) ? NSV : licBadge(t)}</dd>
<dt>Free plan</dt><dd>${isNsv(t.free) ? NSV : esc(FREE[t.free])}${isNsv(t.freeTier) ? '' : `<small>${esc(t.freeTier)}</small>`}</dd>
<dt>Ship free-plan output?</dt><dd>${esc(freeShip(t)[1])}</dd>
<dt>Engines</dt><dd>${esc(engineText(t))}</dd>
</dl>
<p class="glance-cta">${visitBtn(t)}<a class="btn-ghost" href="${toolUrl(t)}">Full listing</a></p>${t.affiliateUrl ? `<small class="aff-note">${esc(AFFILIATE_NOTE)}</small>` : ''}
</article>`; };
// ---- Visual comparison (v2): matchup header, "pick X if", score bars, real-world results, short at-a-glance rows ----
const priceFrom = t => { const m = (t.pricing || '').match(/US\$\s?(\d+(?:\.\d+)?)\s*(?:\/|per\s)\s*(?:seat\/)?(?:month|mo)\b/i); return m ? { v: +m[1], txt: `US$${m[1]}/mo` } : { v: null, txt: isNsv(t.pricingModel) ? 'Not stated' : PRICING[t.pricingModel] }; };
const FREE_RANK = { yes: 2, trial: 1, no: 0 }, COM_RANK = { yes: 3, 'paid-only': 2, restricted: 1, no: 0 };
const COM_SHORT = { yes: 'Allowed', 'paid-only': 'Paid plans only', restricted: 'Restricted', no: 'Not allowed', unverified: 'Not stated', 'n-a': 'Not applicable' };
const bigEngines = t => FIT_ENGINES.filter(e => t.engines.includes(e));
const better = (a, b, hi = true) => a === null || b === null || a === b ? '' : (a > b) === hi ? 'a' : 'b';
function glanceRows(A, B) {
  const pA = priceFrom(A), pB = priceFrom(B);
  const auto = t => [t.api.status === 'yes' ? 'API' : '', t.mcp.status === 'official' ? 'MCP' : ''].filter(Boolean).join(' + ') || 'None';
  const autoN = t => (t.api.status === 'yes' ? 1 : 0) + (t.mcp.status === 'official' ? 1 : 0);
  const eng = t => bigEngines(t).map(e => ENGINES[e]).join(' · ') || 'File export only';
  return [
    ['Paid plans from', pA.txt, pB.txt, better(pA.v, pB.v, false)],
    ['Free plan', isNsv(A.free) ? 'Not stated' : FREE[A.free], isNsv(B.free) ? 'Not stated' : FREE[B.free], better(FREE_RANK[A.free] ?? null, FREE_RANK[B.free] ?? null)],
    ['Engine plugins', eng(A), eng(B), better(bigEngines(A).length, bigEngines(B).length)],
    ['API / MCP', auto(A), auto(B), better(autoN(A), autoN(B))],
    ['Commercial use', COM_SHORT[A.commercial] || NSV_TEXT, COM_SHORT[B.commercial] || NSV_TEXT, better(COM_RANK[A.commercial] ?? null, COM_RANK[B.commercial] ?? null)],
  ];
}
const bar = (v, win) => v === null ? '<span class="sb-none">No data</span>' : `<span class="sb-track"><span class="sb-fill${win ? ' is-win' : ''}" style="width:${Math.max(4, Math.round(v))}%"></span></span><b class="sb-v">${Math.round(v)}</b>`;
function scoreBars(rA, rB) {
  return SIGNALS.map(([k, label]) => { const a = rA.sig[k], b = rB.sig[k], w = better(a, b);
    return `<div class="sb-row"><span class="sb-label">${label}</span><div class="sb-pair"><div class="sb-side">${bar(a, w === 'a')}</div><div class="sb-side">${bar(b, w === 'b')}</div></div></div>`; }).join('');
}
const srcList = r => r.sources.length ? `<ul class="src-list">${r.sources.map(x => `<li><a href="${esc(x.url)}" rel="noopener nofollow" target="_blank">${esc(x.label)}</a>${x.detail ? ` <span>${esc(x.detail)}</span>` : ''}</li>`).join('')}</ul>` : '<p class="note">No independent sources yet.</p>';
// Embeds load only on click (no third-party requests until the visitor asks).
function exampleEmbed(x) {
  if (x.type === 'sketchfab' && x.uid) return `<figure class="ex"><button type="button" class="ex-load" data-src="https://sketchfab.com/models/${esc(x.uid)}/embed?autostart=1&amp;ui_theme=dark" aria-label="Load 3D model: ${esc(x.title)}"><span class="ex-play">3D</span><span>Load interactive model</span></button><figcaption><a href="${esc(x.url)}" rel="noopener nofollow" target="_blank">${esc(x.title)}</a> by ${esc(x.author)} on Sketchfab${x.licence ? ` · ${esc(x.licence)}` : ''}</figcaption></figure>`;
  if (x.type === 'youtube' && x.id) return `<figure class="ex"><button type="button" class="ex-load ex-yt" style="background-image:url(https://i.ytimg.com/vi/${esc(x.id)}/hqdefault.jpg)" data-src="https://www.youtube-nocookie.com/embed/${esc(x.id)}?autoplay=1${x.start ? `&amp;start=${+x.start}` : ''}" aria-label="Play video: ${esc(x.title)}"><span class="ex-play">▶</span></button><figcaption><a href="${esc(x.url)}" rel="noopener nofollow" target="_blank">${esc(x.title)}</a> · ${esc(x.channel)}</figcaption></figure>`;
  return '';
}
const EX_JS = `<script>document.addEventListener('click',function(e){var b=e.target.closest('.ex-load');if(!b)return;var f=document.createElement('iframe');f.src=b.dataset.src;f.title=b.getAttribute('aria-label');f.allow='autoplay; fullscreen; xr-spatial-tracking';f.setAttribute('allowfullscreen','');f.loading='lazy';b.replaceWith(f);});</script>`;
function matchup(A, B, k) {
  const rA = k && rankOf(A.slug, k), rB = k && rankOf(B.slug, k), v2 = rA && rB && rA.sig && rB.sig, both = v2 && rA.conf === 'confident' && rB.conf === 'confident';
  const side = (t, r) => `<div class="mu-side"><a class="mu-logo" href="${toolUrl(t)}">${logo(t, 72, true)}</a><h2><a href="${toolUrl(t)}">${esc(t.name)}</a></h2>
${r ? `<a class="mu-rank" href="${L(`/category/${TASKS[k].page}/`)}">#${r.n} in ${esc(TASKS[k].label)}</a>` : `<span class="mu-rank">${esc(TASKS[t.tasks[0]].label)}</span>`}
${v2 && r.conf === 'confident' ? `<div class="mu-score" style="--s:${r.score}"><b>${r.score}</b><small>/100</small></div>` : ''}${v2 ? `<span class="mu-conf">${r.conf === 'confident' ? `${r.kinds} kinds of independent evidence` : r.conf === 'provisional' ? 'Provisional: limited evidence' : 'Not enough evidence yet'}</span>` : ''}
<p class="mu-cta">${visitBtn(t, { label: `Try ${t.name}` })}</p></div>`;
  let verdict = '';
  if (rA && rB) {
    const tie = rA.n === rB.n, best = rA.n <= rB.n ? rA : rB, other = best === rA ? rB : rA;
    verdict = tie ? `Too close to call: both are joint #${rA.n} in ${esc(TASKS[k].label)}. Pick on the strengths below.`
      : both ? `<b>${esc(best.t.name)}</b> edges it for most game devs (${best.score} vs ${other.score}), but it's closer than the ranks suggest on some signals.`
      : `<b>${esc(best.t.name)}</b> ranks higher in ${esc(TASKS[k].label)} (#${best.n} vs #${other.n}).`;
    if (both && !tie && best.score - other.score >= 10) verdict = `<b>${esc(best.t.name)}</b> is the stronger pick for most game devs (${best.score} vs ${other.score}).`;
  }
  return `<section class="matchup" aria-label="${esc(A.name)} vs ${esc(B.name)}"><div class="mu-grid">${side(A, rA)}<span class="mu-vs" aria-hidden="true">VS</span>${side(B, rB)}</div>${verdict ? `<p class="mu-verdict">${verdict} <a href="${L('/how-we-rank/')}">How we score</a></p>` : ''}</section>`;
}
function pickIf(A, B, k) {
  const r = t => k && rankOf(t.slug, k);
  const card = t => { const x = r(t), pros = x && x.strengths && x.strengths.length ? x.strengths : [t.bestFor], cons = x && x.weaknesses && x.weaknesses.length ? x.weaknesses : [];
    return `<div class="pick-if"><h3>${logo(t, 28)}Pick ${esc(t.name)} if you want</h3><ul class="pi-pros">${pros.slice(0, 3).map(p => `<li>${esc(p)}</li>`).join('')}</ul>${cons.length ? `<p class="pi-cons"><b>Watch out:</b> ${esc(cons.slice(0, 2).join('; '))}</p>` : ''}</div>`; };
  return `<section class="pick-pair" aria-label="Which to pick">${card(A)}${card(B)}</section>`;
}
function scoresSection(A, B, k) {
  const rA = k && rankOf(A.slug, k), rB = k && rankOf(B.slug, k);
  if (!rA || !rB || !rA.sig || !rB.sig) return '';
  return `<section class="cmp-sec" aria-labelledby="sc-h"><div class="cmp-sec-h"><h2 id="sc-h">How they score</h2><p>Each signal is out of 100. Higher wins.</p></div>
<div class="sb"><div class="sb-row sb-head"><span></span><div class="sb-pair"><span>${logo(A, 22)}${esc(A.name)}</span><span>${logo(B, 22)}${esc(B.name)}</span></div></div>${scoreBars(rA, rB)}</div>
<details class="cmp-src"><summary>See all ${rA.sources.length + rB.sources.length} sources</summary><div class="src-pair"><div><h3>${esc(A.name)}</h3>${srcList(rA)}</div><div><h3>${esc(B.name)}</h3>${srcList(rB)}</div></div>
${[...rA.vendorClaims, ...rB.vendorClaims].length ? `<p class="note"><b>Vendor claims (not scored):</b> ${[...rA.vendorClaims.map(c => [A, c]), ...rB.vendorClaims.map(c => [B, c])].map(([t, c]) => `${esc(t.name)}: ${esc(c.text)} <a class="src" href="${esc(c.url)}" rel="noopener nofollow" target="_blank">source</a>`).join(' · ')}</p>` : ''}</details></section>`;
}
function examplesSection(A, B, k) {
  const E = k && EVIDENCE[k]; if (!E) return '';
  const ex = t => ((E.tools[t.slug] || {}).examples || []).slice(0, 2);
  const shared = (E.videos || []).filter(v => v.tools && v.tools.includes(A.slug) && v.tools.includes(B.slug)).slice(0, 1);
  if (!ex(A).length && !ex(B).length && !shared.length) return '';
  return `<section class="cmp-sec" aria-labelledby="ex-h"><div class="cmp-sec-h"><h2 id="ex-h">Real-world results</h2><p>Made by other people with each tool. Click to load.</p></div>
${shared.map(v => `<div class="ex-shared">${exampleEmbed({ ...v, type: 'youtube' })}</div>`).join('')}
<div class="ex-pair"><div><h3>${logo(A, 22)}${esc(A.name)}</h3>${ex(A).map(exampleEmbed).join('') || '<p class="note">No public examples yet.</p>'}</div><div><h3>${logo(B, 22)}${esc(B.name)}</h3>${ex(B).map(exampleEmbed).join('') || '<p class="note">No public examples yet.</p>'}</div></div></section>`;
}
function glanceSection(A, B) {
  return `<section class="cmp-sec" aria-labelledby="ag-h"><div class="cmp-sec-h"><h2 id="ag-h">At a glance</h2></div>
<div class="ag" role="table" aria-label="Key facts"><div class="ag-row ag-head" role="row"><span role="columnheader"></span><span role="columnheader">${logo(A, 22)}${esc(A.name)}</span><span role="columnheader">${logo(B, 22)}${esc(B.name)}</span></div>
${glanceRows(A, B).map(([h, a, b, w]) => `<div class="ag-row" role="row"><span role="rowheader">${h}</span><span role="cell"${w === 'a' ? ' class="is-win"' : ''}>${esc(a)}</span><span role="cell"${w === 'b' ? ' class="is-win"' : ''}>${esc(b)}</span></div>`).join('')}</div></section>`;
}
// Indexing: curated pairs always; generated pairs too, unless they're thin, i.e. at least THIN_NSV "Not stated by vendor" cells
// (more than any curated pair has). Thin pairs stay noindex and out of the sitemap.
const THIN_NSV = 7, THIN_PAIRS = [];
for (const [a, b, curated] of ALL_PAIRS) {
  const A = bySlug[a], B = bySlug[b], p = `/compare/${a}-vs-${b}/`;
  const cmpOg = curated ? ogFile(`compare/${a}-vs-${b}`, 'versus', { kicker: 'Comparison · pricing, licence, API', a: { logo: logoData(A), name: A.name }, b: { logo: logoData(B), name: B.name } }) : undefined;
  const cmpDesc = fit(160, `${A.name} vs ${B.name} for game developers: free plans, pricing, export formats, commercial-use terms, API and MCP, from each vendor's published pages.`, `${A.name} vs ${B.name} for game devs: free plans, pricing, exports, commercial-use terms, API and MCP, from each vendor's own pages.`, `${A.name} vs ${B.name}: free plans, pricing, exports, commercial terms, API and MCP, from each vendor's pages.`, `${A.name} vs ${B.name}: pricing, commercial terms and API, from each vendor's pages.`);
  const modified = [CHECKED, A.lastChecked, B.lastChecked].filter(Boolean).sort().pop();
  const head = t => `<div role="columnheader" class="vs-tool"><a class="cmp-tool" href="${toolUrl(t)}">${logo(t, 36, true)}${esc(t.name)}</a>${licBadge(t)}</div>`;
  const rows = ROWS.map(([h, fn, k]) => ({ h, fn, cls: k ? (String(k(A)) !== String(k(B)) ? ' is-diff' : ' is-same') : '' }));
  const nDiff = rows.filter(r => r.cls === ' is-diff').length;
  const mk = idx => layout({
    title: fit(60, `${A.name} vs ${B.name}: pricing, licence, API | ${SITE.name}`, `${A.name} vs ${B.name}: pricing & licence | ${SITE.name}`, `${A.name} vs ${B.name} | ${SITE.name}`, `${A.name} vs ${B.name}: pricing & licence`, `${A.name} vs ${B.name}`),
    description: cmpDesc, pathname: p, noindex: !idx,
    og: cmpOg,
    jsonld: idx ? [
      { '@context': 'https://schema.org', '@type': 'Article', headline: `${A.name} vs ${B.name}`, description: cmpDesc, url: URL_(p), mainEntityOfPage: URL_(p), datePublished: PUBLISHED, dateModified: modified, inLanguage: 'en-AU', author: ORG, publisher: ORG, about: [A, B].map(t => ({ '@type': 'SoftwareApplication', name: t.name, url: t.url })), ...(cmpOg ? { image: URL_(cmpOg) } : {}) },
      crumbsLd([['All tools', '/'], ['Comparisons', '/compare/'], [`${A.name} vs ${B.name}`, p]]),
    ] : [],
    body: `<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/compare/')}">Comparisons</a> › ${esc(A.name)} vs ${esc(B.name)}</nav>
<h1 class="page-h cmp-h1">${esc(A.name)} vs ${esc(B.name)}</h1>
<p class="page-sub">${esc(TASKS[pairTask(A, B)].label)} · checked ${timeEl(CHECKED)} · <a href="${L(`/compare/?task=${pairTask(A, B)}`)}">Compare different tools</a></p>
${matchup(A, B, pairTask(A, B))}
${pickIf(A, B, pairTask(A, B))}
${scoresSection(A, B, pairTask(A, B))}
${examplesSection(A, B, pairTask(A, B))}
${glanceSection(A, B)}
<details class="cmp-more"><summary>Full comparison: every fact, with sources</summary>
<div class="vs-toolbar">${nDiff ? `<button type="button" class="chip" id="only-diff" aria-pressed="false">Show only differences (${nDiff})</button>` : ''}</div>
<div class="vs-grid" id="vs-grid" role="table" aria-label="${esc(A.name)} vs ${esc(B.name)}">
<div class="vs-row vs-head" role="row"><div role="columnheader" class="vs-label">Tool</div>${head(A)}${head(B)}</div>
${rows.map(r => `<div class="vs-row${r.cls}" role="row"><div role="rowheader" class="vs-label">${r.h}${r.cls === ' is-diff' ? '<span class="diff-dot" title="Differs">●</span>' : ''}</div><div role="cell">${r.fn(A)}</div><div role="cell">${r.fn(B)}</div></div>`).join('\n')}
</div>
<p class="note">Rows marked ● differ between the two tools. Licence badges: green = commercial use allowed (including any free plan or trial), amber = paid plans only, restricted, or allowed but with no free plan, red = not allowed, grey = not stated by vendor or not applicable. Read the vendor's current terms before you ship.</p></details>${A.affiliateUrl || B.affiliateUrl ? `<p class="note">${esc(AFFILIATE_NOTE)}</p>` : ''}`,
    scripts: EX_JS + (nDiff ? `<script>(function(){var b=document.getElementById('only-diff'),g=document.getElementById('vs-grid');b.addEventListener('click',function(){var on=b.getAttribute('aria-pressed')!=='true';b.setAttribute('aria-pressed',on?'true':'false');g.classList.toggle('diff-only',on);});})();</script>` : ''),
  });
  // Thinness is counted on the fact table (+ commercial/free per tool, as the old glance cards showed them), so layout changes can't shift it.
  const html = mk(true), nNsv = (rows.map(r => r.fn(A) + r.fn(B)).join('').match(/class="nsv"/g) || []).length + [A, B].reduce((n, t) => n + isNsv(t.commercial) + isNsv(t.free), 0);
  const indexed = curated || nNsv < THIN_NSV;
  if (!indexed) THIN_PAIRS.push(p);
  page(p, indexed ? html : mk(false), { sitemap: indexed });
}

// ---------- Sponsor (four spots from SPONSOR_OFFERS in config.mjs; bookings in data/sponsor.json) ----------
const SPONSOR_DESC = 'Sponsor GameDev AI Tools: site-wide US$99/week, category or engine page US$29/week, newsletter US$49/issue. Labelled Sponsored; never changes rankings.';
const spBooked = id => [...SPONSORS.keys()].filter(k => k === id || k.startsWith(id + ':')).length;
const spMailto = o => `mailto:${EMAIL}?subject=${encodeURIComponent(`Sponsor booking: ${o.name} (${o.price})`)}&body=${encodeURIComponent(`Hi,\n\nWe'd like to book the ${o.name} spot (${o.price}).\n${o.id === 'category' ? 'Category: \n' : o.id === 'engine' ? 'Engine page (Unity, Unreal, Godot, Blender or Roblox): \n' : ''}${o.unit === 'issue' ? 'Issue date' : 'Week starting'}: \nProduct name and link: \n\nThanks`)}`;
const spCard = o => {
  const free = o.slots - spBooked(o.id);
  const avail = o.unit === 'issue' ? 'One sponsor per issue' : `${o.slots} ${o.slots === 1 ? 'spot' : 'spots'}${o.slotNote ? ` (${o.slotNote})` : ''} · ${free} free this week`;
  return `<section class="card sp-offer" id="${o.id}"><div class="sp-offer-head"><h2>${esc(o.name)}</h2><span class="sp-price">${esc(o.price)}</span></div>
<p><b>Where:</b> ${esc(o.where)}</p><p><b>What you get:</b> ${esc(o.gets)}</p><p class="sp-avail">${esc(avail)}</p>
<p>${o.paymentUrl ? `<a class="btn" href="${esc(o.paymentUrl)}">${o.unit === 'issue' ? 'Book an issue' : 'Book a week'} (${esc(o.price.replace(/\/.*/, ''))})</a>` : `<a class="btn" href="${esc(spMailto(o))}">Book by email</a>`}</p></section>`;
};
page('/sponsor/', layout({
  title: `Sponsor us | ${SITE.name}`, description: SPONSOR_DESC, pathname: '/sponsor/',
  body: `<h1 class="page-h">Sponsor GameDev AI Tools</h1>
<p class="page-sub">Put your product in front of game developers choosing AI tools. There are four kinds of spot. Each is booked by the week, except the newsletter, which is booked by the issue. Prices are in US$.</p>
<div class="paid-thanks" id="paid-thanks" role="status" hidden><p><strong>Thanks!</strong> Email your logo (SVG or PNG), your link and which spot you bought (site-wide, which category, which engine page, or newsletter) to <a href="${mailto('Sponsor logo and link')}">${EMAIL}</a> and we'll add you within a day.</p></div>
<div class="prose">
${SPONSOR_OFFERS.map(spCard).join('\n')}
<p class="note">Every paid spot is labelled "Sponsored". Sponsorship never changes our rankings, the order of tools, counts, filters or verdicts. See <a href="${L('/how-we-rank/')}">how we rank</a> and <a href="${L('/about/')}">how we make money</a>.</p>
<p>Planning a bigger campaign? Email <a href="${mailto('Campaign enquiry')}">${EMAIL}</a>.</p>
</div>`,
  scripts: `<script>if(/[?&]paid=1(&|$)/.test(location.search))document.getElementById('paid-thanks').hidden=false;</script>`,
}));

// ---------- How we rank ----------
page('/how-we-rank/', layout({
  title: `How we rank AI tools for game devs | ${SITE.name}`,
  description: 'How we rank AI tools for game devs: independent benchmarks, expert reviews and real user reports, blended into one score with every source linked. Sponsors never change a rank.',
  pathname: '/how-we-rank/',
  jsonld: [{ '@context': 'https://schema.org', '@type': 'AboutPage', name: 'How we rank AI tools for game devs', url: URL_('/how-we-rank/'), publisher: ORG }],
  body: `<h1 class="page-h">How we rank</h1>
<p class="page-sub">No single test tells you which AI tool is best. So each tool's score blends several independent kinds of evidence, and every rank shows its working and links every source.</p>
<div class="prose">
<section class="card"><span class="kicker">The score</span><h2>Four signals, one score out of 100</h2>
<ul>
<li><b>Benchmarks (35%):</b> independent blind-vote leaderboards and measured tests, such as <a href="https://huggingface.co/spaces/3d-arena/3d-arena" rel="noopener nofollow" target="_blank">3D Arena</a> for 3D models. A tool's position is converted to 0-100 by where it sits on that leaderboard.</li>
<li><b>Expert reviews (25%):</b> hands-on reviews and side-by-side tests from independent outlets and creators. Each is rated 0-100 on what it actually found.</li>
<li><b>User reports (25%):</b> what game devs and artists say after using the tool: ratings on review sites, plus a sample of recent community threads scored positive, mixed or negative. We say how many we read.</li>
<li><b>Game-dev fit (15%):</b> facts from the vendor's own pages. Whether the job is the tool's specialty counts most, then engine plugins, API, free plan and price, and commercial-use terms.</li>
</ul>
<p>If a tool has no evidence of one kind, the other signals are re-weighted rather than counting it as zero, and the page shows a dash.</p></section>
<section class="card"><span class="kicker">Confidence</span><h2>Ranked, provisional, or not enough evidence</h2>
<ul>
<li><b>Ranked on independent evidence:</b> at least two of benchmarks, reviews and user reports. These tools are ranked first.</li>
<li><b>Provisional:</b> only one kind of independent evidence so far.</li>
<li><b>Not enough evidence yet:</b> ranked on game-dev fit only, after everything else.</li>
<li><b>Ties:</b> tools within ${TIE} points of each other share a rank (for example joint #1), and the comparison page says what each is better at.</li>
</ul></section>
<section class="card"><span class="kicker">Honesty rules</span><h2>What counts and what doesn't</h2>
<ul>
<li>Vendors' own tests and preference claims are shown as vendor claims, never scored.</li>
<li>We only use results for the model a tool's service actually runs today, not an older or different model from the same company.</li>
<li>Real-world examples on comparison pages are other people's public work, embedded or linked with credit, never copied.</li>
<li>Sponsorship, affiliate commissions and vendor requests never change a score, a rank or a verdict.</li>
<li>Evidence is re-checked monthly and leaderboards more often. Spotted something out of date or missing? Email <a href="${mailto('Ranking correction')}">${EMAIL}</a> with a link.</li>
</ul></section>
<section class="card"><span class="kicker">Rolling out</span><h2>Categories still on the older method</h2><p>${Object.keys(EVIDENCE).length ? `${Object.keys(EVIDENCE).map(k => `<a href="${L(`/category/${TASKS[k].page}/`)}">${esc(TASKS[k].label)}</a>`).join(', ')} ${Object.keys(EVIDENCE).length === 1 ? 'uses' : 'use'} the scoring above. ` : ''}The other categories are being moved over. Until then they rank tools with independent quality tests first, then the rest by game-dev fit alone.</p></section>
</div>`,
}));

// ---------- About ----------
page('/about/', layout({
  title: `About | ${SITE.name}`,
  description: 'About GameDev AI Tools: an independent directory of AI tools for game developers. Our editorial policy, how we make money, and how to contact us.',
  pathname: '/about/',
  body: `<h1 class="page-h">About GameDev AI Tools</h1>
<p class="page-sub">An independent directory of AI tools for game developers, by task and engine, with pricing and commercial-use terms that are sourced and dated.</p>
<div class="prose">
<section class="card"><h2>Who we are</h2><p>GameDev AI Tools is an independent directory: no tool vendor owns, funds or edits it. It's maintained by a small team with AI help, and every listing is checked against the vendor's own pages.</p></section>
<section class="card"><h2>Editorial policy</h2><ul>
<li><b>Sourced facts.</b> Pricing, free plans, licences, export formats, API and MCP details come from each vendor's own website, with a link to the source.</li>
<li><b>Dated checks.</b> Every listing shows the date we last checked it, and we re-check listings regularly.</li>
<li><b>"Not stated by vendor" when unknown.</b> If a vendor's pages don't clearly answer something, we say so rather than guess.</li>
<li><b>Rankings and verdicts are never bought.</b> Category rankings use independent quality tests (such as public blind-vote leaderboards) where they exist, then a published game-dev fit score; see <a href="${L('/how-we-rank/')}">How we rank</a>. Each verdict is one line written only from the sourced facts. Sponsors and affiliate links never change a listing, its rank or its verdict.</li>
</ul></section>
<section class="card"><h2>How we make money</h2><ul>
<li><b>Sponsorship:</b> labelled "Sponsored" spots booked by the week: site-wide (the top strip, a homepage card and a side card on wide screens), a single category or engine page, or one newsletter issue. Sponsors never change rankings or listings. See <a href="${L('/sponsor/')}">Sponsor us</a>.</li>
<li><b>Affiliate links:</b> some "Visit official site" links may be affiliate links, which earn us a commission if you buy. When a listing uses one, the tool page says so next to the button. ${esc(AFFILIATE_NOTE)}</li>
</ul></section>
<section class="card"><h2>Contact</h2><p>Corrections, sponsorship and anything else: <a href="${mailto()}">${EMAIL}</a>. For a correction, please include a link to the vendor's page. To suggest a tool, use <a href="${L('/submit/')}">Submit a tool</a>.</p></section>
</div>`,
}));

// ---------- Deals (data/deals.json; expired entries dropped at build time) ----------
const dealTool = d => bySlug[d.tool] ? `<a href="${L(`/tools/${d.tool}/`)}">${esc(bySlug[d.tool].name)}</a>` : esc(d.tool);
page('/deals/', layout({
  title: `Deals on AI tools for game devs | ${SITE.name}`,
  description: 'Live discounts and offers on AI tools for game developers, each sourced from the vendor, with its code and expiry date. Expired deals are removed automatically.',
  pathname: '/deals/',
  body: `<h1 class="page-h">Deals</h1>
<p class="page-sub">Real offers on AI tools for game devs, each linked to the vendor's own announcement. Expired deals are removed automatically. Last built ${timeEl(TODAY)}.</p>
${DEALS.length ? `<div class="table-wrap"><table class="cmp deals"><thead><tr><th>Tool</th><th>Offer</th><th>Code</th><th>Expires</th><th>Source</th></tr></thead><tbody>
${DEALS.map(d => `<tr><td>${dealTool(d)}</td><td>${esc(d.offer)}</td><td>${d.code ? `<code>${esc(d.code)}</code>` : 'No code needed'}</td><td>${d.expires ? `<time datetime="${esc(d.expires)}" title="${esc(d.expires)}">${dateLabel(d.expires)}</time>` : 'No end date stated by the vendor'}</td><td><a href="${esc(d.source)}" rel="noopener nofollow" target="_blank">Vendor source</a></td></tr>`).join('\n')}
</tbody></table></div>
<p class="note">Check the vendor's page before you buy: offers can end early. Deals never change our listings or verdicts.</p>` : `<p class="empty-state">No live deals right now. We only list real offers, sourced from the vendor.</p><p>Subscribe below and the newsletter will mention new deals when there are real ones.</p>`}
${newsletterBlock()}`,
}));

// ---------- Cheat sheet: AI tools you can legally ship in a paid game (built from tools.json) ----------
const planNeeded = t => ({
  'yes': t.free === 'yes' ? 'Free plan is enough' : t.free === 'no' ? 'Any paid plan' : 'Any plan (free option is a trial or credits)',
  'paid-only': 'A paid plan (see pricing)',
  'restricted': 'Depends on the licence terms',
  'no': 'None: commercial use not allowed',
  'unverified': NSV_TEXT,
  'n-a': 'Not applicable (doesn\'t make shippable assets)',
}[t.commercial] || NSV_TEXT);
const catchText = t => [isNsv(t.license) ? '' : t.license, t.revenue && t.revenue !== 'unverified' ? `Caps: ${t.revenue}` : ''].filter(Boolean).join(' ');
const SHEET_TONE = { yes: 'ok', paid: 'warn', check: 'warn', no: 'bad', unk: 'unk', na: 'unk' };
const sheetRow = t => { const [k, label] = freeShip(t); return `<tr><td><a class="cmp-tool" href="${toolUrl(t)}">${logo(t, 24)}${esc(t.name)}</a></td><td>${badge(label, SHEET_TONE[k])}</td><td>${planNeeded(t) === NSV_TEXT ? NSV : esc(planNeeded(t))}</td><td>${catchText(t) ? esc(catchText(t)) : NSV}</td><td>${t.licenseSource ? `<a href="${esc(t.licenseSource)}" rel="noopener nofollow" target="_blank">Terms</a>` : NSV}${t.pricingSource ? ` · <a href="${esc(t.pricingSource)}" rel="noopener nofollow" target="_blank">Pricing</a>` : ''}</td><td>${timeEl(t.lastChecked, true)}</td></tr>`; };
page('/cheat-sheet/', layout({
  title: `AI tools you can ship in a paid game: cheat sheet`,
  description: `For ${tools.length} AI game-dev tools: can free-plan output go in a commercial game, which plan you need, and the catch. Sourced from each vendor's terms and dated.`,
  pathname: '/cheat-sheet/',
  jsonld: [{ '@context': 'https://schema.org', '@type': 'Article', headline: 'AI tools you can legally ship in a paid game', url: URL_('/cheat-sheet/'), mainEntityOfPage: URL_('/cheat-sheet/'), datePublished: PUBLISHED, dateModified: CHECKED, inLanguage: 'en-AU', author: ORG, publisher: ORG, about: tools.map(t => ({ '@type': 'SoftwareApplication', name: t.name, url: t.url })) }],
  og: ogFile('cheat-sheet', 'page', { kicker: 'Cheat sheet', title: 'AI tools you can legally ship in a paid game', sub: `Free-plan commercial use, the plan you need and the catch, for ${tools.length} tools. Sourced and dated.`, chips: [{ label: `${sheetCounts.yes} free-plan OK`, tone: 'ok' }, { label: `${sheetCounts.paid} paid plan needed`, tone: 'warn' }, { label: `${sheetCounts.check} restricted`, tone: 'warn' }] }),
  body: `<h1 class="page-h">AI tools you can legally ship in a paid game</h1>
<p class="page-sub">For each of the ${tools.length} tools we list: whether output from the free plan can be used commercially, which plan you need, and the catch. Every row links to the vendor's own terms and shows the date we checked it. This summarises published terms; it isn't legal advice. Read the current terms before you ship.</p>
<p class="sheet-summary">${SHEET_GROUPS.map(([k, h]) => `<a href="#g-${k}"><strong>${sheetCounts[k]}</strong> ${esc(h.split(':')[0])}</a>`).join(' · ')}</p>
${SHEET_GROUPS.filter(([k]) => sheetCounts[k]).map(([k, h]) => `<h2 class="sub-h" id="g-${k}">${esc(h)}</h2>
<div class="table-wrap"><table class="cmp sheet"><thead><tr><th>Tool</th><th>Free plan, commercial?</th><th>Plan you need</th><th>The catch (from the vendor's terms)</th><th>Sources</th><th>Checked</th></tr></thead><tbody>
${tools.filter(t => freeShip(t)[0] === k).map(sheetRow).join('\n')}
</tbody></table></div>`).join('\n')}
<p class="note">"Not stated by vendor" means the vendor's pages didn't clearly answer the question when we checked. We'd rather say so than guess. Spotted something out of date? Email <a href="${mailto('Cheat sheet correction')}">${EMAIL}</a> with a link to the vendor's terms.</p>
${newsletterBlock()}`,
}));

// ---------- Badge ----------
// Best confident top-3 rank per tool (primary job first on ties) -> a "Ranked" badge; everyone listed gets "Listed on".
const BADGE_RANK = Object.fromEntries(tools.map(t => {
  const rs = t.tasks.map(k => ({ k, r: rankOf(t.slug, k) })).filter(x => x.r && x.r.n <= 3 && (x.r.conf ? x.r.conf === 'confident' : x.r.tier === 'evidence'));
  rs.sort((x, y) => x.r.n - y.r.n || (x.k === t.tasks[0] ? -1 : 1));
  const x = rs[0];
  return [t.slug, x ? { n: x.r.n, joint: RANKED[x.k].rows.filter(r => r.n === x.r.n).length > 1, label: TASKS[x.k].label, k: x.k } : null];
}).filter(([, v]) => v));
const badgeImg = (src, alt, w, hgt) => `<img src="${src}" alt="${esc(alt)}" width="${w}" height="${hgt}">`;
const listedSnippet = (slug, theme) => `<a href="${URL_(`/tools/${slug}/`)}">${badgeImg(URL_(`/assets/badge/listed-${theme}.svg`), 'Listed on GameDev AI Tools', BADGE_LISTED.w, BADGE_LISTED.h)}</a>`;
const rankedSnippet = (slug, theme) => { const R = BADGE_RANK[slug]; return R ? `<a href="${URL_(`/category/${TASKS[R.k].page}/`)}">${badgeImg(URL_(`/assets/badge/rank/${slug}-${theme}.svg`), `${R.joint ? 'Joint ' : ''}#${R.n} in ${R.label} on GameDev AI Tools`, BADGE_RANKED.w, BADGE_RANKED.h)}</a>` : ''; };
page('/badge/', layout({
  title: `Badges for listed tools | ${SITE.name}`,
  description: 'Is your tool listed or ranked on GameDev AI Tools? Add a "Listed on" or "Ranked" badge to your site, in light or dark, linking to your listing.',
  pathname: '/badge/',
  body: `<h1 class="page-h">Badges for listed tools</h1>
<p class="page-sub">If your tool is listed here, you're welcome to show a badge on your site. Tools ranked in the top 3 of a job also get a ranking badge, which updates itself if the rank changes. Badges are free and optional, and never affect a listing or a rank.</p>
<label class="badge-pick">Your tool <select id="badge-tool">${tools.map(t => `<option value="${t.slug}">${esc(t.name)}${BADGE_RANK[t.slug] ? ` (#${BADGE_RANK[t.slug].n} ${esc(TASKS[BADGE_RANK[t.slug].k].label)})` : ''}</option>`).join('')}</select></label>
<section class="badge-set" id="badge-ranked"${BADGE_RANK[tools[0].slug] ? '' : ' hidden'}><h2 class="sub-h">Ranking badge</h2>
<div class="badge-demo"><div class="bd dark"><img id="rk-dark" src="${BADGE_RANK[tools[0].slug] ? L(`/assets/badge/rank/${tools[0].slug}-dark.svg`) : ''}" alt="Ranking badge (dark)" width="${BADGE_RANKED.w}" height="${BADGE_RANKED.h}"><span>Dark</span></div><div class="bd light"><img id="rk-light" src="${BADGE_RANK[tools[0].slug] ? L(`/assets/badge/rank/${tools[0].slug}-light.svg`) : ''}" alt="Ranking badge (light)" width="${BADGE_RANKED.w}" height="${BADGE_RANKED.h}"><span>Light</span></div></div>
<textarea class="snippet" id="snip-rk-dark" readonly rows="3">${esc(rankedSnippet(tools[0].slug, 'dark'))}</textarea>
<textarea class="snippet" id="snip-rk-light" readonly rows="3">${esc(rankedSnippet(tools[0].slug, 'light'))}</textarea></section>
<section class="badge-set"><h2 class="sub-h">"Listed on" badge</h2>
<div class="badge-demo"><div class="bd dark"><img src="${L('/assets/badge/listed-dark.svg')}" alt="Listed on GameDev AI Tools (dark)" width="${BADGE_LISTED.w}" height="${BADGE_LISTED.h}"><span>Dark</span></div><div class="bd light"><img src="${L('/assets/badge/listed-light.svg')}" alt="Listed on GameDev AI Tools (light)" width="${BADGE_LISTED.w}" height="${BADGE_LISTED.h}"><span>Light</span></div></div>
<textarea class="snippet" id="snip-dark" readonly rows="3">${esc(listedSnippet(tools[0].slug, 'dark'))}</textarea>
<textarea class="snippet" id="snip-light" readonly rows="3">${esc(listedSnippet(tools[0].slug, 'light'))}</textarea></section>
<p class="note">Pick your tool above and the snippets update with your links. Not listed yet? <a href="${L('/submit/')}">Submit your tool</a>.</p>`,
  scripts: `<script>window.BADGES={rank:${JSON.stringify(Object.fromEntries(Object.entries(BADGE_RANK).map(([k, v]) => [k, { n: v.n, j: v.joint, l: v.label, u: URL_(`/category/${TASKS[v.k].page}/`) }]))).replace(/</g, '\\u003c')},tools:'${URL_('/tools/')}',img:'${URL_('/assets/badge/')}',local:'${L('/assets/badge/')}',lw:${BADGE_LISTED.w},lh:${BADGE_LISTED.h},rw:${BADGE_RANKED.w},rh:${BADGE_RANKED.h}};
(function(){var B=window.BADGES,s=document.getElementById('badge-tool');function e(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function u(){var v=s.value,R=B.rank[v];['dark','light'].forEach(function(th){document.getElementById('snip-'+th).value='<a href="'+B.tools+v+'/"><img src="'+B.img+'listed-'+th+'.svg" alt="Listed on GameDev AI Tools" width="'+B.lw+'" height="'+B.lh+'"></a>';
if(R){document.getElementById('rk-'+th).src=B.local+'rank/'+v+'-'+th+'.svg';document.getElementById('snip-rk-'+th).value='<a href="'+R.u+'"><img src="'+B.img+'rank/'+v+'-'+th+'.svg" alt="'+e((R.j?'Joint ':'')+'#'+R.n+' in '+R.l+' on GameDev AI Tools')+'" width="'+B.rw+'" height="'+B.rh+'"></a>';}});
document.getElementById('badge-ranked').hidden=!R;}s.addEventListener('change',u);u();})();</script>`,
}));

// ---------- Privacy (wording approved by Mike 2026-10-17; analytics, affiliate, payments and email sections added 2026-10-17 per Mike's policy) ----------
page('/privacy/', layout({
  title: `Privacy | ${SITE.name}`,
  description: 'What data GameDev AI Tools handles: hosting logs and cookieless Vercel Web Analytics, tool submissions via public GitHub issues, newsletter emails stored with Resend, affiliate links and sponsor payments.',
  pathname: '/privacy/',
  body: `<h1>Privacy</h1>
<p>Last updated 17 October 2026.</p>
<p>This page explains, in plain terms, what happens to data when you use this site.</p>
<h2 class="sub-h">Browsing</h2>
<p>The site is hosted on Vercel. Like any web host, Vercel receives technical data such as your IP address, browser user agent and the pages you request, and may keep it in server logs. See <a href="https://vercel.com/legal/privacy-policy" rel="noopener">Vercel's privacy policy</a>.</p>
<p>The site doesn't set cookies and doesn't use advertising or cross-site tracking. Pages load no third-party fonts. Tool logos are stored on this site.</p>
<p>Some guides include official tutorial videos from YouTube. Nothing loads from YouTube until you press play; the video then plays from youtube-nocookie.com under Google's privacy policy.</p>
<h2 class="sub-h">Analytics</h2>
<p>We use <a href="https://vercel.com/docs/analytics/privacy-policy" rel="noopener">Vercel Web Analytics</a>, which counts page views without cookies or personal identifiers. Its script is served from this site's own domain. We see totals such as page views, referring sites, countries and device types, not individual visitors.</p>
<h2 class="sub-h">Links to other sites, including affiliate links</h2>
<p>Links to tool vendors take you to their sites, where their own policies apply. Some of those links may be affiliate links, which means we may earn a commission if you buy. When you click one, the third-party site may set its own cookies to record that you came from us. Affiliate links never change our listings, their order or their verdicts.</p>
<h2 class="sub-h">Submitting a tool</h2>
<p>The <a href="${L('/submit/')}">Submit a tool</a> form doesn't store your submission on this site. It sends you to GitHub with a prefilled issue, and nothing is filed until you submit it there with your own GitHub account. GitHub issues are public: anyone can see what you write there, your GitHub username and any email address you choose to include. GitHub's own privacy statement applies.</p>
<h2 class="sub-h">Newsletter and emails</h2>
<p>If you sign up, your email address is stored with Resend, our email provider, in our newsletter list. We use it only for the newsletter. When you sign up we send one welcome email with a link to our cheat sheet. We haven't sent a newsletter yet. Every email we send, including the welcome email, includes an unsubscribe link: using it marks your address as unsubscribed in our list, and we stop emailing you. You can also email <a href="${mailto('Newsletter removal')}">${EMAIL}</a> from the address you signed up with to be removed.</p>
<h2 class="sub-h">Sponsor payments</h2>
<p>Sponsors pay through Stripe. Stripe processes the payment and card details under <a href="https://stripe.com/privacy" rel="noopener">Stripe's privacy policy</a>; we never see full card numbers. We receive the name, email address and payment details Stripe shares with merchants (such as the amount and date), and use them only to arrange and account for the sponsorship.</p>
<h2 class="sub-h">Contact</h2>
<p>Contact us at <a href="${mailto()}">${EMAIL}</a>.</p>`,
}));

// ---------- Submit a tool ----------
page('/submit/', layout({
  title: `Submit a tool | ${SITE.name}`,
  description: 'Suggest an AI tool for game developers to be listed on GameDev AI Tools.',
  pathname: '/submit/',
  body: `<h1>Submit a tool</h1>
<p>Know an AI tool that helps people make games? Send it in. We check every submission against the vendor's own website (what it does, its pricing and its commercial-use terms) before listing it. Submissions are public GitHub issues on <a href="https://github.com/michaelpaulrattray/gamedev-ai-tools/issues?q=label%3Asubmission">our repo</a>.</p>
<form class="submit" method="post" action="/api/submit/">
<label>Tool name <input name="name" required maxlength="100"></label>
<label>Official URL <input name="url" type="url" required maxlength="300" placeholder="https://"></label>
<label>Category <select name="category" required><option value="">Choose…</option>${Object.values(TASKS).map(c => `<option>${esc(c.label)}</option>`).join('')}<option>Other</option></select></label>
<label>Short description <textarea name="description" required maxlength="600" rows="4" placeholder="What does it do for game developers?"></textarea></label>
<label>Your email (optional) <input name="email" type="email" maxlength="254"><small>It will be shown publicly on the GitHub issue. Leave it blank if you'd rather not share it.</small></label>
${HONEYPOT}
<button type="submit">Submit tool</button>
</form>
<p class="note">Listing is free and never paid for. If you'd also like your tool in front of game devs straight away, see <a href="${L('/sponsor/')}">sponsoring</a>.</p>`,
}));
page('/submit/thanks/', layout({
  title: `Thanks for your submission | ${SITE.name}`, description: 'Submission received.', pathname: '/submit/thanks/', noindex: true,
  body: `<h1>Thanks! Your submission is in</h1><p>We'll check it against the vendor's website before listing it. You can follow submissions on <a href="https://github.com/michaelpaulrattray/gamedev-ai-tools/issues?q=label%3Asubmission">GitHub</a>.</p><p><a href="${L('/')}">Back to all tools</a></p>`,
}), { sitemap: false });
page('/submit/error/', layout({
  title: `Submission problem | ${SITE.name}`, description: 'There was a problem with your submission.', pathname: '/submit/error/', noindex: true,
  body: `<h1>Something went wrong</h1><p>Please check the required fields and <a href="${L('/submit/')}">try again</a>, or <a href="https://github.com/michaelpaulrattray/gamedev-ai-tools/issues/new?template=tool-submission.md">open a GitHub issue</a> directly.</p>`,
}), { sitemap: false });
page('/subscribed/', layout({
  title: `You're subscribed | ${SITE.name}`, description: 'Newsletter signup received.', pathname: '/subscribed/', noindex: true,
  body: `<h1>You're on the list</h1><p>Thanks for signing up. We're emailing you a link to the <a href="${L('/cheat-sheet/')}">cheat sheet</a> (if it doesn't arrive, it's right here). Every email we send has an unsubscribe link.</p><p><a href="${L('/')}">Back to all tools</a></p>`,
}), { sitemap: false });
page('/subscribe-error/', layout({
  title: `Signup problem | ${SITE.name}`, description: 'There was a problem with your signup.', pathname: '/subscribe-error/', noindex: true,
  body: `<h1>Signup didn't work</h1><p>Please check your email address and <a href="${L('/#newsletter')}">try again</a>.</p>`,
}), { sitemap: false });

page('/unsubscribed/', layout({
  title: `You're unsubscribed | ${SITE.name}`, description: 'You have been unsubscribed.', pathname: '/unsubscribed/', noindex: true,
  body: `<h1>You're unsubscribed</h1><p>We won't email you again. If that was a mistake, you can sign up again any time.</p><p><a href="${L('/')}">Back to all tools</a></p>`,
}), { sitemap: false });
page('/unsubscribe-error/', layout({
  title: `Unsubscribe problem | ${SITE.name}`, description: 'There was a problem unsubscribing.', pathname: '/unsubscribe-error/', noindex: true,
  body: `<h1>We couldn't unsubscribe you automatically</h1><p>The link may be incomplete. Email <a href="${mailto('Unsubscribe')}">${EMAIL}</a> from the address you signed up with and we'll remove you.</p>`,
}), { sitemap: false });

// ---------- Home + tools pages ----------
// Home: hero (search goes to /tools/) with top picks, "Can I ship it?" checker, best-for-each-job, new this week, guides, trust, newsletter.
const SHIP_SHORT = { yes: 'Yes', 'paid-only': 'Paid plans only', restricted: 'Restricted', no: 'No', unverified: NSV_TEXT, 'n-a': 'Not applicable' };
const SHIP_DATA = Object.fromEntries(tools.map(t => [t.slug, {
  n: t.name, u: toolUrl(t), l: LOGOS.has(t.slug) ? L(`/assets/logos/${t.slug}.png`) : '', s: SHIP_SHORT[t.commercial] || NSV_TEXT, tone: licTone(t),
  a: quickAnswer(t), c: isNsv(t.license) ? '' : (t.license.length > 240 ? t.license.slice(0, 237).replace(/\s+\S*$/, '') + '…' : t.license), src: t.licenseSource || '',
}]));
// Intent search (src/assets/search.js): what people type for each job -> that job's ranked top 3 + its comparisons.
// Keywords are matched by prefix both ways, so "modelling" hits "model" and "anim" hits "animation".
const SEARCH_KW = {
  'concept-art': ['concept', 'art', '2d', 'sprite', 'pixel', 'illustration', 'drawing', 'painting', 'image', 'icon', 'character design', 'portrait', 'ui', 'skybox', 'background', 'tileset', 'asset'],
  '3d-models': ['3d', 'model', 'modelling', 'modeling', 'mesh', 'sculpt', 'prop', 'asset', 'retopology', 'topology', 'glb', 'fbx', 'character'],
  'textures': ['texture', 'material', 'pbr', 'shader', 'normal', 'uv', 'tileable', 'seamless', 'skybox', 'hdri', 'surface'],
  'animation': ['animation', 'animate', 'animating', 'rig', 'rigging', 'mocap', 'motion', 'capture', 'keyframe', 'pose', 'lip', 'retarget', 'walk cycle'],
  'voice': ['voice', 'voices', 'tts', 'speech', 'text to speech', 'dialogue', 'acting', 'actor', 'narration', 'dub', 'dubbing', 'lip sync', 'vo'],
  'audio': ['music', 'soundtrack', 'song', 'score', 'composer', 'audio', 'sound', 'sfx', 'effects', 'ambience', 'foley'],
  'npc': ['npc', 'npcs', 'character', 'companion', 'conversation', 'dialogue', 'chatbot', 'ai character', 'behaviour', 'behavior', 'llm'],
  'code': ['code', 'coding', 'programming', 'programmer', 'script', 'scripting', 'debug', 'copilot', 'blueprint', 'gdscript', 'c#', 'cpp', 'shader'],
  'level': ['level', 'levels', 'terrain', 'world', 'map', 'procedural', 'environment', 'landscape', 'dungeon', 'layout', 'worldbuilding'],
  'localisation': ['localisation', 'localization', 'translate', 'translation', 'language', 'languages', 'subtitle', 'l10n'],
  'qa': ['qa', 'test', 'testing', 'tester', 'playtest', 'playtesting', 'bug', 'bugs', 'quality'],
  'marketing': ['trailer', 'marketing', 'video', 'promo', 'store page', 'capsule', 'social', 'ads', 'advert', 'screenshot', 'launch'],
};
const searchTool = t => ({ n: t.name, s: t.slug, u: toolUrl(t), l: LOGOS.has(t.slug) ? L(`/assets/logos/${t.slug}.png`) : '', i: initials(t.name), h: hue(t.slug), c: TASKS[t.tasks[0]].label });
const SEARCH_CMPS = COMPARE.map(([a, b]) => ({ a, b, t: `${bySlug[a].name} vs ${bySlug[b].name}`, u: L(`/compare/${a}-vs-${b}/`) }));
const SEARCH_DATA = {
  toolsUrl: L('/tools/'), cmpAll: L('/compare/'),
  cats: Object.keys(TASKS).filter(k => RANKED[k]).map(k => ({
    label: TASKS[k].label, u: L(`/category/${TASKS[k].page}/`), count: RANKED[k].rows.length,
    kw: [...new Set([...SEARCH_KW[k] || [], ...TASKS[k].label.toLowerCase().split(/[^a-z0-9]+/).filter(w => w.length > 1)])],
    top: RANKED[k].rows.slice(0, 3).map(r => ({ ...searchTool(r.t), r: r.n, p: cardSub(r.t), ev: r.tier === 'evidence' })),
    cmp: SEARCH_CMPS.map((p, i) => [p, i]).filter(([p]) => bySlug[p.a].tasks.includes(k) && bySlug[p.b].tasks.includes(k)).map(([, i]) => i),
  })),
  cmps: SEARCH_CMPS,
  tools: tools.map(searchTool),
  engines: engineList.map(({ e, n }) => ({ n: e.label, u: L(`/engine/${e.page}/`), c: n })),
};
// Home shows 3 guide cards (+3 resource cards = two full rows): the featured guide, then the two newest. All guides are on /guides/.
const HOME_GUIDES = [GUIDES[0], ...GUIDES.slice(1).slice(-2).reverse()];
page('/', layout({
  title: `${SITE.name}: the best AI tools for making games`,
  description: HOME_DESC,
  pathname: '/',
  og: ogFile('home', 'page', { title: HOME_TITLE, sub: HOME_SUB, chips: [{ label: `${tools.length} tools` }, { label: `${Object.keys(TASKS).length} jobs ranked` }, { label: 'Updated weekly' }] }),
  jsonld: [{
    '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: URL_('/'), description: SITE.description,
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: URL_('/tools/') + '?q={search_term_string}' }, 'query-input': 'required name=search_term_string' },
  }],
  body: `
<section class="uh-hero">
<div class="uh-hero-art"><img src="${L('/assets/img/hero.webp')}" srcset="${L('/assets/img/hero-960.webp')} 1200w, ${L('/assets/img/hero.webp')} 2400w" sizes="(max-width:720px) 100vw, 72vw" alt="" width="2400" height="1029" fetchpriority="high" decoding="async">${['level-generation', 'npc-dialogue', 'trailers-marketing', 'animation'].map((p, i) => `<img class="uh-reel" style="--d:${(i + 1) * 6}s" src="${catImg(p)}" alt="" width="1280" height="720" loading="lazy" decoding="async">`).join('')}</div>
<div class="uh-hero-txt">
<p class="uh-checked"><span class="dot"></span>${recentNews.length ? `${recentNews.length} ${recentNews.length === 1 ? 'update' : 'updates'} this week` : 'Updated weekly'} · ${tools.length} tools tracked</p>
<h1>The best AI tools for making games.</h1>
<p class="sub">What's new, the top pick for every job, what each tool costs and how to use it in your pipeline. Search ${tools.length} tools for art, 3D, audio, code and more.</p>
<form class="searchbar" data-smart action="${L('/tools/')}" method="get" role="search">${ICON_SEARCH}<input name="q" type="search" placeholder="What are you making? Try animation, 3D models, music" aria-label="Search by what you're making, or by tool name" autocomplete="off"><button type="submit" class="sb-go">Search</button></form>
<div class="uh-cta"><a class="btn" href="${L('/tools/')}">Browse all tools</a><a class="btn btn-ghost" href="${L('/category/')}">Best for each job</a></div>
</div>
</section>
${newRow.length ? `<section class="uh-sec" aria-labelledby="new-h">
<div class="sec-head"><h2 id="new-h">New this week</h2><a class="btn btn-ghost btn-sm" href="${L('/new/')}">View all news</a></div>
<div class="uh-news">${sponsorCard({ compact: true })}
${newRow.slice(0, SPONSOR ? 3 : 4).map(({ t, n }) => `<article class="uh-news-card"><div class="uh-news-art">${artImg(TASKS[t.tasks[0]].page)}${logo(t, 52)}</div><div class="uh-news-body"><p class="uh-date">${timeEl(n.date, true)} · ${esc(t.name)}</p><h3><a class="card-link" href="${toolUrl(t)}">${esc(n.title)}</a></h3><p class="summary">${esc(t.summary)}</p><span class="badges">${newsBadge(n)}${badge(cardSub(t), 'neutral')}</span></div></article>`).join('\n')}</div>
</section>` : ''}
<section class="uh-sec" aria-labelledby="best-h">
<h2 id="best-h" class="uh-big">The best tool for every job.</h2>
<p class="uh-lede">Twelve parts of game development, each with a ranked shortlist. Where independent tests exist we rank on those, otherwise on features, price and fit for game devs.</p>
<div class="uh-tiles">${CAT_GROUPS.flatMap(gr => gr.keys).map(k => { const R = RANKED[k], r = R && R.rows[0], c = TASKS[k]; return `<a class="uh-tile" href="${L(`/category/${c.page}/`)}">${artImg(c.page)}${r ? `<span class="uh-tile-top">${logo(r.t, 20)}<span>#1 ${esc(r.t.name)}</span></span>` : ''}<span class="uh-tile-body"><strong>${esc(c.label)}</strong><svg class="uh-go" aria-hidden="true" width="22" height="22" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff"/><path d="M7.5 12h8m-3.5-3.5L15.5 12 12 15.5" fill="none" stroke="#101014" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span></a>`; }).join('')}</div>
<p class="best-note"><i class="best-ev">●</i> ranked on independent tests · others ranked on features, price and fit. <a href="${L('/how-we-rank/')}">How we rank</a></p>
</section>
<section class="uh-sec" aria-labelledby="cmp-h">
<div class="sec-head"><h2 id="cmp-h">Head to head</h2><a class="btn btn-ghost btn-sm" href="${L('/compare/')}">All ${COMPARE.length} comparisons</a></div>
<div class="uh-vs">${COMPARE.slice(0, 6).map(([a, b]) => { const A = bySlug[a], B = bySlug[b]; return `<a class="uh-vs-card" href="${L(`/compare/${a}-vs-${b}/`)}"><span class="uh-vs-logos">${logo(A, 48)}<i>vs</i>${logo(B, 48)}</span><b>${esc(A.name)} vs ${esc(B.name)}</b><span class="uh-vs-cat">${esc(TASKS[A.tasks.find(x => B.tasks.includes(x)) || A.tasks[0]].label)}</span></a>`; }).join('')}</div>
</section>
<section class="uh-sec res" aria-labelledby="res-h">
<div class="sec-head"><h2 id="res-h">Learn how to use them</h2><a class="btn btn-ghost btn-sm" href="${L('/guides/')}">All guides</a></div>
<div class="grid g3">
${HOME_GUIDES.map(g => linkCard({ href: L(`/guides/${g.slug}/`), kicker: esc(g.kind || 'Workflow guide'), title: g.title, media: artImg(guideArtPage(g)), foot: `<div class="card-foot"><span class="facts-line">${g.steps.length} steps</span></div>` })).join('\n')}
</div>
</section>
<section class="uh-sec uh-band" aria-labelledby="at-h"><div><h2 id="at-h">What does it cost?</h2><p>Filter all ${tools.length} tools by free plan, pricing, engine and job, then compare the ones that fit your budget.</p>
<p class="quick" id="engines"><span>By engine:</span>${engineList.map(({ e, n }) => chip(`${e.label} (${n})`, { href: L(`/engine/${e.page}/`) })).join('')}</p></div>
<a class="btn" href="${L('/tools/')}">Filter all tools</a></section>
<section class="uh-sec uh-split" aria-labelledby="ship-h">
<div class="uh-split-txt"><p class="uh-eyebrow">Selling your game?</p><h2 id="ship-h">Check a tool's commercial terms</h2><p>Pick a tool to see what its terms say about using its output in a commercial game, with a link to the vendor's own page.</p><a class="btn btn-ghost" href="${L('/cheat-sheet/')}">All tools at a glance</a></div>
<div class="card ship"><label class="ship-pick"><span class="sr-only">Tool</span><select id="ship-sel"><option value="">Choose a tool…</option>${tools.map(t => `<option value="${t.slug}">${esc(t.name)}</option>`).join('')}</select></label>
<div class="ship-out" id="ship-out" aria-live="polite"><p class="ship-empty">The answer appears here.</p></div></div>
</section>
<section class="uh-sec" aria-labelledby="how-h">
<h2 id="how-h" class="uh-big">Researched by hand. <span class="uh-accent">Updated every week.</span></h2>
<div class="uh-how">
<div class="uh-how-card"><svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg><h3>Every tool, one place</h3><p>Pricing, free plans, engine support, APIs and the catch for ${tools.length} tools, straight from each vendor's own pages.</p></div>
<div class="uh-how-card"><svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg><h3>Always current</h3><p>Launches, price changes and new versions land on the site every week, and each listing shows when we last checked it.</p></div>
<div class="uh-how-card"><svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/></svg><h3>Rankings you can check</h3><p>Independent tests first, then features, price and fit. Sponsors and affiliate links never change a rank. <a href="${L('/how-we-rank/')}">How we rank</a></p></div>
</div>
</section>
${newsletterBlock()}`,
  scripts: `<script>window.SEARCH=${JSON.stringify(SEARCH_DATA).replace(/</g, '\\u003c')};</script>
<script src="${L('/assets/search.js')}" defer></script>
<script>window.SHIP=${JSON.stringify(SHIP_DATA).replace(/</g, '\\u003c')};
(function(){var D=window.SHIP,s=document.getElementById('ship-sel'),o=document.getElementById('ship-out');if(!s)return;
function e(x){return String(x).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
s.addEventListener('change',function(){var d=D[s.value];if(!d){return;}
o.innerHTML='<div class="ship-res"><div class="ship-top">'+(d.l?'<img class="tlogo" src="'+e(d.l)+'" alt="" width="40" height="40">':'')+'<b>'+e(d.n)+'</b><span class="badge b-lg b-'+e(d.tone)+'">'+e(d.s)+'</span></div><p class="ship-a">'+e(d.a)+'</p>'+(d.c?'<p class="ship-c"><b>The terms say:</b> '+e(d.c)+'</p>':'')+'<p class="ship-links"><a href="'+e(d.u)+'">Full listing →</a>'+(d.src?' <a href="'+e(d.src)+'" rel="noopener nofollow" target="_blank">Vendor terms ↗</a>':'')+'</p></div>';});})();</script>`,
}));
page('/tools/', layout({
  title: `All AI tools for game developers: search and filter | ${SITE.name}`,
  description: `Search ${tools.length} AI tools for game development and filter by task, engine, free plan and whether you can ship the output commercially.`,
  pathname: '/tools/',
  jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'All AI tools for game developers', url: URL_('/tools/'), mainEntity: { '@type': 'ItemList', numberOfItems: tools.length, itemListElement: tools.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/tools/${t.slug}/`), name: t.name })) } }],
  body: `<h1 class="page-h">All ${tools.length} AI tools for game devs</h1>
<p class="page-sub">Search, or filter by task, engine, free plan and commercial use. Want the best pick instead? See <a href="${L('/category/')}">the best tool for every category</a>.</p>
<label class="searchbar tools-search">${ICON_SEARCH}<input id="q" type="search" placeholder="Search tools, e.g. pixel art, voice, Godot" aria-label="Search tools" autocomplete="off"></label>
<section id="tools" class="tools-sec" aria-labelledby="tools-h">
<div class="sec-head"><h2 id="tools-h" class="sr-only">All tools</h2><p id="count" aria-live="polite">${tools.length} tools</p></div>
<div class="filters" role="group" aria-label="Filters">
<select id="f-task" aria-label="Task"><option value="">All tasks</option>${opts(Object.fromEntries(Object.entries(TASKS).map(([k, v]) => [k, v.label])))}</select>
<select id="f-engine" aria-label="Engine"><option value="">Any engine</option>${opts(ENGINES)}</select>
<select id="f-pricing" aria-label="Free or paid"><option value="">Free or paid</option>${opts(FREE)}</select>
<select id="f-commercial" aria-label="Safe to ship commercially"><option value="">Safe to ship commercially?</option>${opts(SHIP)}</select>
<button id="reset" type="button">Reset</button>
</div>
<p class="hint">"Safe to ship commercially" goes only on what each vendor's published terms say, and every tool page links to them. It isn't legal advice. The engine filter shows tools whose vendor states a plugin, integration or export for that engine. Most other tools export standard files (PNG, FBX, GLB, WAV and so on) that work in any engine.</p>
<div id="results" class="grid">
${tools.map(t => toolCard(t)).join('\n')}
</div>
</section>`,
  scripts: `<script>window.TOOLS=${JSON.stringify(tools.map(t => ({ slug: t.slug, name: t.name, summary: t.summary + ' ' + t.verdict + ' ' + t.bestFor, tasks: t.tasks, engines: t.engines, free: t.free, commercial: t.commercial }))).replace(/</g, '\\u003c')};</script>
<script src="${L('/assets/app.js')}"></script>`,
}));

// ---------- Alternatives pages (content.mjs ALTERNATIVES): comparison table + notes from existing listing data ----------
const altCell = v => isNsv(v) ? NSV : esc(v);
const altPairs = (base, list) => list.map(t => pairUrl[pairKey(base.slug, t.slug)] ? { t, u: pairUrl[pairKey(base.slug, t.slug)] } : null).filter(Boolean);
for (const A of ALTERNATIVES) {
  const base = bySlug[A.base], list = A.tools.map(s => bySlug[s]).filter(Boolean);
  if (!base || !list.length) continue;
  const p = `/alternatives/${A.slug}/`, all = [base, ...list];
  const checked = all.map(t => t.lastChecked).sort().pop();
  const pairs = altPairs(base, list);
  page(p, layout({
    title: fit(60, `${A.metaTitle} | ${SITE.name}`, A.metaTitle, A.title),
    description: A.description,
    pathname: p,
    og: ogFile(`alternatives/${A.slug}`, 'page', { kicker: 'Alternatives', title: A.title, sub: `${list.length} tools compared with ${base.name}, sourced from each vendor.` }),
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'Article', headline: A.title, description: A.description, datePublished: '2026-10-22', dateModified: checked, url: URL_(p), author: { '@type': 'Organization', name: SITE.name, url: URL_('/') }, publisher: { '@type': 'Organization', name: SITE.name, url: URL_('/') } },
      { '@context': 'https://schema.org', '@type': 'ItemList', name: A.title, itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/tools/${t.slug}/`), name: t.name })) },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'All tools', item: URL_('/') },
        { '@type': 'ListItem', position: 2, name: 'Alternatives', item: URL_('/alternatives/') },
        { '@type': 'ListItem', position: 3, name: A.title, item: URL_(p) } ] },
    ],
    body: `
<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/alternatives/')}">Alternatives</a> › ${esc(A.title)}</nav>
<h1 class="page-h">${esc(A.title)}</h1>
<p class="page-sub">${esc(A.why)} Listed A to Z, not ranked; for the ranking see <a href="${L(`/category/${TASKS[A.task].page}/`)}">best ${esc(TASKS[A.task].label.toLowerCase())} tools</a>. Checked ${timeEl(checked)}.</p>
<div class="table-wrap"><table class="cmp"><thead><tr><th>Tool</th><th>Best for</th><th>Free plan</th><th>Commercial use</th><th>Engines</th><th>API</th><th>MCP</th></tr></thead><tbody>
${all.map(t => `<tr${t === base ? ' class="is-top"' : ''}><td><a class="cmp-tool" href="${toolUrl(t)}">${logo(t, 24)}${esc(t.name)}</a>${t === base ? '<span class="row-label">Compared with</span>' : ''}</td><td>${altCell(t.bestFor)}</td><td>${isNsv(t.free) ? NSV : esc(FREE[t.free])}</td><td>${licBadge(t)}</td><td>${esc(engineText(t))}</td><td>${isNsv(t.api.status) ? NSV : esc(API_L[t.api.status])}</td><td>${isNsv(t.mcp.status) ? NSV : esc(MCP_L[t.mcp.status])}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="note">Every cell comes from the tool's listing, which links the vendor's own pages. "Not stated by vendor" means we couldn't find it there.</p>
<h2 class="sub-h">Notes on each alternative</h2>
${list.map(t => { const u = pairUrl[pairKey(base.slug, t.slug)]; return `<section class="card disc hub-sec"><h3><a href="${toolUrl(t)}">${esc(t.name)}</a></h3>
<p>${esc(t.verdict)}</p>
<p><b>Price:</b> ${altCell(t.pricing)}${srcA(t.pricingSource)}</p>
<p><b>Licence:</b> ${altCell(t.license)}${srcA(t.licenseSource)} · Checked ${timeEl(t.lastChecked)}</p>
<p class="cmp-row">${chip(`${t.name} listing`, { href: toolUrl(t) })}${u ? chip(`${base.name} vs ${t.name}`, { href: u }) : ''}</p></section>`; }).join('\n')}
${pairs.length ? `<div class="cmp-row"><span>Compare side by side:</span>${pairs.map(x => chip(`${base.name} vs ${x.t.name}`, { href: x.u })).join('')}<a class="chip c-muted" href="${L(`/compare/?task=${A.task}`)}">Pick any two →</a></div>` : ''}
<p class="note">We summarise vendors' published pages on the dates shown. Read the current terms before you ship. Paid placements never change this list.</p>
${newsletterBlock()}`,
  }));
}
page('/alternatives/', layout({
  title: `Alternatives to popular AI game-dev tools | ${SITE.name}`,
  description: 'Alternatives to Midjourney, Meshy, Cursor and Suno for game developers, compared on free plans, commercial terms, engines, API and MCP from vendor pages.',
  pathname: '/alternatives/',
  og: ogFile('alternatives-hub', 'page', { kicker: 'Alternatives', title: 'Alternatives to popular AI game-dev tools', sub: 'Sourced from each vendor, never paid placement.' }),
  jsonld: [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: 'Alternatives to popular AI game-dev tools', url: URL_('/alternatives/'), mainEntity: { '@type': 'ItemList', itemListElement: ALTERNATIVES.map((a, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/alternatives/${a.slug}/`), name: a.title })) } }],
  body: `<nav class="crumbs"><a href="${L('/')}">All tools</a> › Alternatives</nav>
<h1 class="page-h">Alternatives to popular AI game-dev tools</h1>
<p class="page-sub">Looking past the obvious pick? Each page puts a well-known tool next to the alternatives we list and compares free plans, commercial-use terms, engines, API and MCP. Every fact comes from the vendor's own pages. Also see <a href="${L('/compare/')}">side-by-side comparisons</a> and <a href="${L('/tools/')}">all tools</a>.</p>
<div class="grid">${ALTERNATIVES.filter(a => bySlug[a.base]).map(a => linkCard({ href: L(`/alternatives/${a.slug}/`), title: a.title, kicker: TASKS[a.task].label, desc: `${a.tools.length} alternatives to ${esc(bySlug[a.base].name)}. ${esc(a.why)}` })).join('\n')}</div>
${newsletterBlock()}`,
}));

// ---------- llms.txt / llms-full.txt (https://llmstxt.org) ----------
const md = s => String(s).replace(/\s+/g, ' ').trim();
const mdv = v => isNsv(v) ? NSV_TEXT : md(v);
const catLinks = Object.values(TASKS).map(c => `- [${c.label}](${URL_(`/category/${c.page}/`)}): ${c.h1}`);
const guideLinks = GUIDES.map(g => `- [${md(g.title)}](${URL_(`/guides/${g.slug}/`)}): ${md(g.description)}`);
const cmpLinks = COMPARE.map(([a, b]) => `- [${bySlug[a].name} vs ${bySlug[b].name}](${URL_(`/compare/${a}-vs-${b}/`)})`);
const llmsHead = `# ${SITE.name}

> ${SITE.description} Every fact comes from the vendor's own pages, with a source link and a last-checked date (${CHECKED}). Anything the vendor doesn't clearly state is marked "Not stated by vendor". There are no ratings, reviews or user counts.

${tools.length} tools listed. Each tool page covers what it is best for, price and free tier, supported engines, export formats, commercial-use terms and licence (with source), revenue share or caps, and API and MCP server availability.
`;
const llmsLinks = `
## Categories
${catLinks.join('\n')}

## Engines
${engineList.map(({ e, n }) => `- [${e.label}](${URL_(`/engine/${e.page}/`)}): ${e.h1} (${n} ${n === 1 ? 'tool' : 'tools'} with an official plugin, integration or export, per the vendor)`).join('\n')}

## Guides
- [All guides](${URL_('/guides/')})
${guideLinks.join('\n')}

## Store rules
- [${md(DISCLOSURE.title)}](${URL_('/steam-ai-disclosure/')}): ${md(DISCLOSURE.description)}

## Comparisons
- [All comparisons](${URL_('/compare/')})
${cmpLinks.join('\n')}

## Alternatives
- [All alternatives](${URL_('/alternatives/')})
${ALTERNATIVES.map(a => `- [${md(a.title)}](${URL_(`/alternatives/${a.slug}/`)}): ${md(a.description)}`).join('\n')}

## Resources
- [AI tools you can legally ship in a paid game](${URL_('/cheat-sheet/')}): cheat sheet of free-plan commercial use, plan needed and the catch for every tool, with sources and check dates
- [Deals](${URL_('/deals/')}): live, vendor-sourced offers on AI game-dev tools; expired deals are removed automatically
- [Listed badge](${URL_('/badge/')}): "Listed on GameDev AI Tools" badge snippets for listed tools

## Optional
- [Full directory of tools](${URL_('/')}): searchable and filterable by task, engine, free plan and commercial use
- [Full text for LLMs](${URL_('/llms-full.txt')}): every listing's sourced facts in one Markdown file
- [New this week](${URL_('/new/')}): recent, sourced releases
- [Submit a tool](${URL_('/submit/')})
- [Sponsor us](${URL_('/sponsor/')}): ${SPONSOR_OFFERS.map(o => `${o.name} ${o.price}`).join('; ')}. Sponsored spots are labelled and never change rankings.
- [About](${URL_('/about/')}): independent directory, editorial policy, how we make money, contact
- [Privacy](${URL_('/privacy/')})
- [Contact](mailto:${EMAIL}): corrections, sponsorship and general enquiries

Disclosure: ${AFFILIATE_NOTE}
`;
write('llms.txt', llmsHead + llmsLinks);
const toolMd = t => `### ${t.name}
- Page: ${URL_(`/tools/${t.slug}/`)}
- Official site: ${t.url}
- Summary: ${md(t.summary)}
- Verdict: ${md(t.verdict)}
- Best for: ${mdv(t.bestFor)}
- Tasks: ${t.tasks.map(k => TASKS[k] ? TASKS[k].label : k).join(', ')}
- Engines: ${engineText(t)}
- Pricing: ${mdv(t.pricing)}${t.pricingSource ? ` (source: ${t.pricingSource})` : ''}
- Free plan: ${FREE[t.free] || t.free}.${isNsv(t.freeTier) ? '' : ' ' + md(t.freeTier)}
- Export formats: ${mdv(t.exportFormats)}${t.exportSource ? ` (source: ${t.exportSource})` : ''}
- Commercial use: ${COMMERCIAL[t.commercial] || t.commercial}. ${mdv(t.license)}${t.licenseSource ? ` (source: ${t.licenseSource})` : ''}
- Revenue share / caps: ${mdv(t.revenue)}
- API: ${API_L[t.api?.status] || NSV_TEXT}${t.api?.note && !isNsv(t.api.note) ? `. ${md(t.api.note)}` : ''}${t.api?.source ? ` (source: ${t.api.source})` : ''}
- MCP: ${MCP_L[t.mcp?.status] || NSV_TEXT}${t.mcp?.note && !isNsv(t.mcp.note) ? `. ${md(t.mcp.note)}` : ''}${t.mcp?.source ? ` (source: ${t.mcp.source})` : ''}
- Last checked: ${t.lastChecked}
`;
const discMd = DISCLOSURE.sections.map(sec => `### ${sec.h}\n${sec.items.map(i => `- ${md(i.text)}${i.url ? ` (source: ${i.url.startsWith('/') ? URL_(i.url) : i.url})` : ''}`).join('\n')}`).join('\n\n');
const newsMd = NEWS.map(n => `- ${n.date}: ${md(n.title)}. ${md(n.text)} (source: ${n.source})`).join('\n');
write('llms-full.txt', `${llmsHead}${llmsLinks}
## Tools
${tools.map(toolMd).join('\n')}
## ${md(DISCLOSURE.title)}
Checked ${CHECKED}. Page: ${URL_('/steam-ai-disclosure/')}

${discMd}

## New this week
${newsMd}
`);

// ---------- Static assets, sitemap, robots, 404 ----------
fs.cpSync('src/assets', path.join(out, 'assets'), { recursive: true });
// Badges (text rendered to paths by satori): one "Listed on" pair, plus a ranking pair per top-3 tool.
fs.mkdirSync(path.join(out, 'assets/badge/rank'), { recursive: true });
for (const th of ['dark', 'light']) {
  fs.writeFileSync(path.join(out, `assets/badge/listed-${th}.svg`), await listedBadge(th));
  for (const [slug, R] of Object.entries(BADGE_RANK)) fs.writeFileSync(path.join(out, `assets/badge/rank/${slug}-${th}.svg`), await rankedBadge(th, R));
}
if (OG) await OG.flush();
// Root-level verification files (e.g. Google Search Console), copied byte-for-byte; never in the sitemap.
if (fs.existsSync('src/root')) fs.cpSync('src/root', out, { recursive: true });
// lastmod: a tool page's own lastChecked, a guide's checked date, the store-rules page's checked date or the newest /new/ item, when newer than the site-wide date; otherwise SITE.updated.
const LASTMOD = Object.fromEntries([...tools.map(t => [`/tools/${t.slug}/`, t.lastChecked]), ...GUIDES.map(g => [`/guides/${g.slug}/`, g.checked || CHECKED]), ['/steam-ai-disclosure/', DISC_CHECKED], ['/new/', NEWS.reduce((m, n) => (n.date > m ? n.date : m), CHECKED)]]);
const pageLastmod = p => (LASTMOD[p] && LASTMOD[p] > SITE.updated ? LASTMOD[p] : SITE.updated);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages, '/llms.txt', '/llms-full.txt'].map(p => `<url><loc>${URL_(p)}</loc><lastmod>${pageLastmod(p)}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\n# LLM-friendly summary (https://llmstxt.org): ${URL_('/llms.txt')} and ${URL_('/llms-full.txt')}\nSitemap: ${URL_('/sitemap.xml')}\n`);
write('404.html', layout({ title: `Not found | ${SITE.name}`, description: 'Page not found.', pathname: '/404.html', noindex: true, body: `<h1>Page not found</h1><p><a href="${L('/')}">Back to all tools</a></p>` }));
write('.nojekyll', '');
console.log(`Built ${pages.length} pages, ${tools.length} tools -> ${out}/`);
console.log(`Compare: ${THIN_PAIRS.length} thin pairs noindex: ${THIN_PAIRS.join(" ")}`);
