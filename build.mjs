// Zero-dependency static site generator. Usage: node build.mjs  -> writes ./dist
import fs from 'node:fs';
import path from 'node:path';
import { CHECKED, GUIDES, DISCLOSURE, NEWS, COMPARE } from './content.mjs';
import { SPONSOR_PAYMENT_URL, SPONSOR_OFFER, BUSINESS_EMAIL, AFFILIATE_NOTE } from './config.mjs';

const SITE = {
  name: 'GameDev AI Tools',
  origin: process.env.SITE_ORIGIN || 'https://gamedevaitools.com',
  base: process.env.SITE_BASE ?? '', // e.g. '/gamedev-ai-tools' for a GitHub Pages project path
  description: 'A free directory of AI tools for game developers. Filter by task (concept art, 3D models, textures, animation, voice, music, NPCs, code, levels, localisation, QA, trailers), engine, free plan and whether it is safe to ship commercially.',
  updated: '2026-10-17',
};
// Signup form is shown only when explicitly enabled AND both Resend env vars exist.
const NEWSLETTER_ON = process.env.NEWSLETTER_ENABLED === '1' && Boolean(process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID);
console.log('Newsletter signup enabled:', NEWSLETTER_ON);
// Build date in the business's time zone (Australia/Brisbane), YYYY-MM-DD. Used to drop expired deals and sponsor bookings.
const TODAY = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Brisbane', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const URL_ = p => SITE.origin + SITE.base + p;
const L = p => SITE.base + p;
const EMAIL = BUSINESS_EMAIL;
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
const ENGINES = { unity: 'Unity', godot: 'Godot', unreal: 'Unreal' };
const PRICING = { 'freemium': 'Free tier + paid', 'paid': 'Paid', 'pay-as-you-go': 'Pay as you go', 'open-weights': 'Free (open weights)', 'included': 'Included with engine plan', 'contact': 'Contact sales', 'unverified': 'Unverified' };
const FREE = { 'yes': 'Free plan', 'trial': 'Free trial or credits only', 'no': 'Paid only', 'unverified': 'Unverified' };
const SHIP = { 'yes': 'Yes, on every plan', 'paid-only': 'Yes, on paid plans', 'check': 'Check terms (restricted or unverified)', 'no': 'No', 'n-a': 'Not applicable (testing tools)' };
const API_L = { yes: 'Available', no: 'No public API', partner: 'Partner / negotiated only', na: 'Not applicable', unverified: 'Unverified' };
const MCP_L = { official: 'Official MCP server', client: 'Connects to MCP servers', community: 'Community server only', preview: 'In preview', 'none-found': 'None found', unverified: 'Unverified' };
const COMMERCIAL = { 'yes': 'Commercial use allowed', 'paid-only': 'Commercial on paid plans only', 'restricted': 'Restricted (see notes)', 'no': 'Not allowed', 'unverified': 'Commercial use unverified', 'n-a': 'Not applicable' };

const tools = JSON.parse(fs.readFileSync('data/tools.json', 'utf8')).sort((a, b) => a.name.localeCompare(b.name));
const bySlug = Object.fromEntries(tools.map(t => [t.slug, t]));
const readJson = (f, d) => fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d;
const sponsorRaw = readJson('data/sponsor.json', {});
const SPONSOR = sponsorRaw && sponsorRaw.name && sponsorRaw.url && !(sponsorRaw.end && sponsorRaw.end < TODAY) && !(sponsorRaw.start && sponsorRaw.start > TODAY) ? sponsorRaw : null;
const dealsAll = readJson('data/deals.json', []);
const DEALS = dealsAll.filter(d => d && d.offer && d.source && !(d.expires && d.expires < TODAY));
console.log(`Build date ${TODAY}: sponsor ${SPONSOR ? SPONSOR.name : 'none'}; deals ${DEALS.length} live, ${dealsAll.length - DEALS.length} dropped (expired or incomplete)`);
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ld = o => `<script type="application/ld+json">${JSON.stringify(o).replace(/</g, '\\u003c')}</script>`;
const LOGOS = new Set(fs.existsSync('src/assets/logos') ? fs.readdirSync('src/assets/logos').filter(f => f.endsWith('.png')).map(f => f.slice(0, -4)) : []);
const hue = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);
const initials = n => n.replace(/[^A-Za-z0-9 ]/g, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const logo = (t, size = 44, eager = false) => LOGOS.has(t.slug)
  ? `<img class="tlogo" src="${L(`/assets/logos/${t.slug}.png`)}" alt="" width="${size}" height="${size}"${eager ? '' : ' loading="lazy"'} decoding="async">`
  : `<span class="tlogo mono" aria-hidden="true" style="--h:${hue(t.slug)};width:${size}px;height:${size}px">${esc(initials(t.name))}</span>`;
const catImg = page => L(`/assets/img/${page}.webp`);
const ICON_SEARCH = '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const MARK = '<svg aria-hidden="true" width="28" height="28" viewBox="0 0 32 32"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#gm)"/><path d="M9 13h4m-2-2v4" stroke="#0b0d14" stroke-width="2.2" stroke-linecap="round"/><circle cx="20" cy="12.5" r="1.6" fill="#0b0d14"/><circle cx="23" cy="15.5" r="1.6" fill="#0b0d14"/><path d="M7 19c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5v1.5c0 2-2.4 2.8-3.8 1.3L19 19.5h-6l-2.2 2.3C9.4 23.3 7 22.5 7 20.5z" fill="none" stroke="#0b0d14" stroke-width="2"/></svg>';
const srcA = (url, label = 'source') => url ? ` <a class="src" href="${esc(url)}"${url.startsWith('/') ? '' : ' rel="noopener nofollow" target="_blank"'}>${label}</a>` : '';
const engineText = t => t.engines.filter(e => ENGINES[e]).map(e => ENGINES[e]).join(', ') || 'Any (standard file export / engine-agnostic)';

function sponsorStrip() {
  if (!SPONSOR) return `<aside class="sponsor-strip" aria-label="Sponsor"><div class="wrap"><span class="sp-label">Sponsor</span><span>Your tool here: <a href="${L('/sponsor/')}">Sponsor us</a></span></div></aside>`;
  const img = SPONSOR.logo ? `<img src="${esc(SPONSOR.logo.startsWith('/') ? L(SPONSOR.logo) : SPONSOR.logo)}" alt="" width="20" height="20" loading="lazy" decoding="async">` : '';
  return `<aside class="sponsor-strip" aria-label="Sponsor"><div class="wrap"><span class="sp-label">Sponsor</span><a href="${esc(SPONSOR.url)}" rel="sponsored noopener" target="_blank">${img}<strong>${esc(SPONSOR.name)}</strong></a></div></aside>`;
}
function footerSignup() {
  if (!NEWSLETTER_ON) return `<form class="foot-signup" onsubmit="return false"><label for="fs-email">Newsletter (coming soon)</label><input id="fs-email" type="email" placeholder="you@example.com" disabled><button type="button" disabled>Coming soon</button></form>`;
  return `<form class="foot-signup" method="post" action="/api/subscribe/"><label for="fs-email">Get the newsletter and the free <a href="${L('/cheat-sheet/')}">ship-it cheat sheet</a></label><input id="fs-email" type="email" name="email" required maxlength="254" placeholder="you@example.com" autocomplete="email">${HONEYPOT}<button type="submit">Subscribe</button></form>`;
}
function layout({ title, description, pathname, body, jsonld = [], scripts = '', noindex = false, head = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#0b0d14">
<meta name="color-scheme" content="dark">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${URL_(pathname)}">${noindex ? '\n<meta name="robots" content="noindex">' : ''}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${URL_(pathname)}">
<meta property="og:site_name" content="${SITE.name}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="${L('/assets/style.css')}">${head}
<script defer src="/_vercel/insights/script.js"></script>
${jsonld.map(ld).join('\n')}
</head>
<body>
<header class="site-header"><div class="wrap">
<a class="logo" href="${L('/')}">${MARK}<span>GameDev <b>AI Tools</b></span></a>
<nav><a href="${L('/#tools')}">Tools</a><a href="${L('/category/')}">Categories</a><a class="hide-sm" href="${L('/guides/')}">Guides</a><a class="hide-sm" href="${L('/compare/')}">Compare</a><a class="hide-sm" href="${L('/new/')}">New</a><a href="${L('/deals/')}">Deals</a><a class="nav-cta" href="${L('/submit/')}">Submit a tool</a></nav>
</div></header>
${sponsorStrip()}
<main class="wrap">
${body}
</main>
<footer class="site-footer"><div class="wrap">
<p class="foot-brand"><a class="logo" href="${L('/')}">${MARK}<span>GameDev <b>AI Tools</b></span></a></p>
${footerSignup()}
<p>Facts are taken from each vendor's own website and dated. Pricing and licences change often, so always check the vendor's current terms before you rely on them. This is not legal advice.</p>
<p class="aff-disc">${esc(AFFILIATE_NOTE)}</p>
<p class="foot-links"><a href="${L('/guides/')}">Guides</a> · <a href="${L('/compare/')}">Comparisons</a> · <a href="${L('/new/')}">New this week</a> · <a href="${L('/deals/')}">Deals</a> · <a href="${L('/cheat-sheet/')}">Cheat sheet</a> · <a href="${L('/steam-ai-disclosure/')}">Steam AI disclosure</a> · <a href="${L('/badge/')}">Badge</a> · <a href="${L('/sponsor/')}">Sponsor us</a> · <a href="${L('/privacy/')}">Privacy</a> · <a href="${mailto()}">Contact</a> · <a href="${L('/sitemap.xml')}">Sitemap</a> · Last updated ${SITE.updated}</p>
</div></footer>
${scripts}
</body>
</html>
`;
}

function card(t) {
  return `<article class="card" data-slug="${t.slug}">
<div class="card-top">${logo(t)}<div class="card-title"><h3><a href="${L(`/tools/${t.slug}/`)}">${esc(t.name)}</a></h3><span class="price">${esc(PRICING[t.pricingModel])}</span></div><span class="arrow" aria-hidden="true">→</span></div>
<p class="summary">${esc(t.summary)}</p>
<p class="verdict"><strong>Verdict:</strong> ${esc(t.verdict)}</p>
<div class="card-foot"><ul class="tags">${t.tasks.map(k => `<li>${esc(TASKS[k].label)}</li>`).join('')}</ul><span class="badges"><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span>${t.free === 'yes' ? '<span class="pill free">Free plan</span>' : ''}${t.mcp.status === 'official' ? '<span class="pill mcp" title="Official MCP server">MCP</span>' : ''}${t.api.status === 'yes' ? '<span class="pill api">API</span>' : ''}</span></div>
</article>`;
}

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
const write = (p, s) => { const f = path.join(out, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const pages = [];
const page = (p, html, { sitemap = true } = {}) => { write(p === '/' ? 'index.html' : p.replace(/^\//, '') + 'index.html', html); if (sitemap) pages.push(p); };

const HONEYPOT = `<div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="company" tabindex="-1" autocomplete="off"></label></div>`;
function newsletterBlock() {
  if (!NEWSLETTER_ON) return `<section class="newsletter soon" id="newsletter">
<h2>Newsletter: coming soon</h2>
<p>We're planning a short email about new AI tools for game devs and changes to their pricing and licences. Signup isn't open yet, and this form collects nothing.</p>
<form onsubmit="return false"><input type="email" placeholder="you@example.com" disabled aria-label="Email (coming soon)"><button type="button" disabled>Coming soon</button></form>
</section>`;
  return `<section class="newsletter" id="newsletter">
<h2>AI tools you can legally ship in a paid game</h2>
<p>Our cheat sheet: for every tool we list, whether free-plan output can go in a commercial game, which plan you need, and the catch, with sources and check dates. Subscribe and we'll email you the link, plus an occasional newsletter about new tools and licence changes. Unsubscribe any time. (It's also <a href="${L('/cheat-sheet/')}">free to read here</a>.)</p>
<form method="post" action="/api/subscribe/">
<input type="email" name="email" required maxlength="254" placeholder="you@example.com" aria-label="Email address">
${HONEYPOT}
<button type="submit">Subscribe</button>
</form>
</section>`;
}

const tile = (c, n) => `<a class="tile" href="${L(`/category/${c.page}/`)}"><img src="${catImg(c.page)}" alt="" width="640" height="480" loading="lazy" decoding="async"><span class="tile-body"><strong>${esc(c.label)}</strong><span>${n} ${n === 1 ? 'tool' : 'tools'}</span></span></a>`;
// ---------- Home ----------
const opts = (o) => Object.entries(o).map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('');
page('/', layout({
  title: `${SITE.name}: directory of AI tools for game developers`,
  description: SITE.description,
  pathname: '/',
  jsonld: [{
    '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: URL_('/'), description: SITE.description,
    potentialAction: { '@type': 'SearchAction', target: { '@type': 'EntryPoint', urlTemplate: URL_('/') + '?q={search_term_string}' }, 'query-input': 'required name=search_term_string' },
  }],
  head: `<link rel="preload" as="image" href="${L('/assets/img/hero-960.webp')}" imagesrcset="${L('/assets/img/hero-960.webp')} 960w, ${L('/assets/img/hero.webp')} 1680w" imagesizes="(max-width: 1180px) 100vw, 1180px" fetchpriority="high">`,
  body: `
<section class="hero">
<img class="hero-bg" src="${L('/assets/img/hero.webp')}" srcset="${L('/assets/img/hero-960.webp')} 960w, ${L('/assets/img/hero.webp')} 1680w" sizes="(max-width: 1180px) 100vw, 1180px" width="1680" height="720" alt="" fetchpriority="high" decoding="async">
<div class="hero-inner">
<p class="eyebrow"><span class="dot"></span>Free directory · Sourced and dated · Checked ${SITE.updated}</p>
<h1>Find the right AI tool for <span class="grad">every part of your game</span></h1>
<p class="sub">${tools.length} AI tools for concept art, 3D models, textures, animation, voice, music, NPCs, code, levels, localisation, QA and trailers. Every listing shows pricing and commercial-use terms, with a link to the vendor's own page and the date we checked it.</p>
<label class="searchbar">${ICON_SEARCH}<input id="q" type="search" placeholder="Search tools, e.g. pixel art, voice, Godot" aria-label="Search tools" autocomplete="off"></label>
<p class="quick"><span>Popular:</span>${['3d-models', 'concept-art', 'audio', 'voice', 'code', 'qa'].map(k => `<a href="${L(`/?task=${k}#tools`)}">${esc(TASKS[k].label)}</a>`).join('')}</p>
</div>
</section>
<section class="cats" aria-labelledby="cats-h">
<div class="sec-head"><h2 id="cats-h">Browse by task</h2><a href="${L('/category/')}">All categories →</a></div>
<div class="tiles">${Object.entries(TASKS).map(([k, c]) => tile(c, tools.filter(t => t.tasks.includes(k)).length)).join('')}</div>
</section>
<section id="tools" class="tools-sec" aria-labelledby="tools-h">
<div class="sec-head"><h2 id="tools-h">All tools</h2><p id="count" aria-live="polite">${tools.length} tools</p></div>
<div class="filters" role="group" aria-label="Filters">
<select id="f-task" aria-label="Task"><option value="">All tasks</option>${opts(Object.fromEntries(Object.entries(TASKS).map(([k, v]) => [k, v.label])))}</select>
<select id="f-engine" aria-label="Engine"><option value="">Any engine</option>${opts(ENGINES)}</select>
<select id="f-pricing" aria-label="Free or paid"><option value="">Free or paid</option>${opts(FREE)}</select>
<select id="f-commercial" aria-label="Safe to ship commercially"><option value="">Safe to ship commercially?</option>${opts(SHIP)}</select>
<button id="reset" type="button">Reset</button>
</div>
<p class="hint">"Safe to ship commercially" is based only on each vendor's published terms (see the source on each tool page). It is not legal advice. The engine filter shows tools whose vendor states a plugin, integration or export for that engine. Most other tools export standard files (PNG, FBX, GLB, WAV and so on) that work in any engine.</p>
<div id="results" class="grid">
${tools.map(card).join('\n')}
</div>
</section>
<section class="res" aria-labelledby="res-h">
<div class="sec-head"><h2 id="res-h">Guides and resources</h2><a href="${L('/guides/')}">All guides →</a></div>
<div class="res-grid">
${GUIDES.map(g => `<a class="res-card" href="${L(`/guides/${g.slug}/`)}"><span class="res-k">Workflow guide</span><strong>${esc(g.title)}</strong></a>`).join('')}
<a class="res-card" href="${L('/steam-ai-disclosure/')}"><span class="res-k">Store rules</span><strong>${esc(DISCLOSURE.title)}</strong></a>
<a class="res-card" href="${L('/compare/')}"><span class="res-k">Comparisons</span><strong>${COMPARE.length} side-by-side comparisons from published specs</strong></a>
<a class="res-card" href="${L('/new/')}"><span class="res-k">New this week</span><strong>${esc(NEWS[0].title)}</strong></a>
</div>
</section>
<section class="how" aria-labelledby="how-h">
<h2 id="how-h">How listings work</h2>
<div class="how-grid">
<div><h3>Sourced</h3><p>Pricing and commercial-use notes come from each vendor's own pages, and every listing links to its source.</p></div>
<div><h3>Dated</h3><p>Each tool shows the date we last checked it. Anything we couldn't confirm is marked "unverified".</p></div>
<div><h3>Not a ranking</h3><p>Tools are listed alphabetically, with no reviews or ratings. Sponsors and affiliate links never change a listing, its position or its verdict.</p></div>
</div>
</section>
${newsletterBlock()}`,
  scripts: `<script>window.TOOLS=${JSON.stringify(tools.map(t => ({ slug: t.slug, name: t.name, summary: t.summary + ' ' + t.verdict + ' ' + t.bestFor, tasks: t.tasks, engines: t.engines, free: t.free, commercial: t.commercial }))).replace(/</g, '\\u003c')};</script>
<script src="${L('/assets/app.js')}"></script>`,
}));

// ---------- Tool pages ----------
for (const t of tools) {
  const p = `/tools/${t.slug}/`;
  const related = tools.filter(o => o.slug !== t.slug && o.tasks.some(k => t.tasks.includes(k))).slice(0, 6);
  const desc = `${t.name} for game developers: ${t.summary}`.slice(0, 155).replace(/\s+\S*$/, '') + '…';
  page(p, layout({
    title: `${t.name}: pricing, commercial licence & game dev uses | ${SITE.name}`,
    description: desc,
    pathname: p,
    jsonld: [
      { '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: t.name, url: t.url, description: t.summary, applicationCategory: 'MultimediaApplication', operatingSystem: 'Web', sameAs: [t.url] },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'All tools', item: URL_('/') },
        { '@type': 'ListItem', position: 2, name: TASKS[t.tasks[0]].label, item: URL_(`/category/${TASKS[t.tasks[0]].page}/`) },
        { '@type': 'ListItem', position: 3, name: t.name, item: URL_(p) } ] },
    ],
    body: `
<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L(`/category/${TASKS[t.tasks[0]].page}/`)}">${esc(TASKS[t.tasks[0]].label)}</a> › ${esc(t.name)}</nav>
<article class="tool">
<header class="tool-head">${logo(t, 72, true)}<div>
<h1>${esc(t.name)}</h1>
<p class="lead">${esc(t.summary)}</p>
<p class="tool-cta">${t.affiliateUrl ? `<a class="btn" href="${esc(t.affiliateUrl)}" rel="sponsored noopener" target="_blank">Visit official site ↗</a><small class="aff-note">${esc(AFFILIATE_NOTE)}</small>` : `<a class="btn" href="${esc(t.url)}" rel="noopener nofollow" target="_blank">Visit official site ↗</a>`}<span class="pill">${esc(PRICING[t.pricingModel])}</span><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span></p>
</div></header>
<p class="verdict big"><strong>Verdict:</strong> ${esc(t.verdict)}</p>
<dl class="facts">
<dt>Best for</dt><dd>${esc(t.bestFor)}</dd>
<dt>Tasks</dt><dd>${t.tasks.map(k => `<a href="${L(`/category/${TASKS[k].page}/`)}">${esc(TASKS[k].label)}</a>`).join(', ')}</dd>
<dt>Engines</dt><dd>${esc(engineText(t))}</dd>
<dt>Price &amp; free tier</dt><dd><span class="pill">${esc(FREE[t.free])}</span> ${esc(t.freeTier)}<br>${esc(t.pricing)}<br><small>Source: <a href="${esc(t.pricingSource)}" rel="noopener nofollow" target="_blank">${esc(t.pricingSource)}</a></small></dd>
<dt>Export formats</dt><dd>${esc(t.exportFormats)}${t.exportSource ? `<br><small>Source: <a href="${esc(t.exportSource)}" rel="noopener nofollow" target="_blank">${esc(t.exportSource)}</a></small>` : ''}</dd>
<dt>Commercial use &amp; licence</dt><dd><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span><br>${esc(t.license)}<br><small>Source: <a href="${esc(t.licenseSource)}" rel="noopener nofollow" target="_blank">${esc(t.licenseSource)}</a></small></dd>
<dt>Revenue share / caps</dt><dd>${esc(t.revenue)}</dd>
<dt>API</dt><dd><span class="pill">${esc(API_L[t.api.status])}</span> ${esc(t.api.note)}${t.api.source ? `<br><small>Source: <a href="${esc(t.api.source)}" rel="noopener nofollow" target="_blank">${esc(t.api.source)}</a></small>` : ''}</dd>
<dt>MCP server</dt><dd><span class="pill${t.mcp.status === 'official' ? ' mcp' : ''}">${esc(MCP_L[t.mcp.status])}</span> ${esc(t.mcp.note)}${t.mcp.source ? `<br><small>Source: <a href="${esc(t.mcp.source)}" rel="noopener nofollow" target="_blank">${esc(t.mcp.source)}</a></small>` : ''}</dd>
<dt>Last checked</dt><dd><time datetime="${t.lastChecked}">${t.lastChecked}</time></dd>
</dl>
${COMPARE.filter(p => p.includes(t.slug)).length ? `<p class="cmp-links">Compare: ${COMPARE.filter(p => p.includes(t.slug)).map(p => `<a href="${L(`/compare/${p[0]}-vs-${p[1]}/`)}">${esc(bySlug[p[0]].name)} vs ${esc(bySlug[p[1]].name)}</a>`).join(' · ')}</p>` : ''}
<p class="note">We summarise what the vendor's own pages say on the date above. "Unverified" means we couldn't confirm that detail. Read the vendor's current terms before you ship anything.</p>
</article>
${related.length ? `<section class="related"><h2>Related tools</h2><div class="grid">${related.map(card).join('\n')}</div></section>` : ''}
${newsletterBlock()}`,
  }));
}

// ---------- Category pages ----------
const catIndex = [];
for (const [key, c] of Object.entries(TASKS)) {
  const list = tools.filter(t => t.tasks.includes(key));
  if (!list.length) continue;
  const p = `/category/${c.page}/`;
  catIndex.push({ c, p, n: list.length });
  const desc = `${list.length} AI tools for ${c.label.toLowerCase()} in game development, with pricing and commercial-use licence notes from each vendor's site. Checked ${SITE.updated}.`;
  page(p, layout({
    title: `Best ${c.h1} (${SITE.updated.slice(0, 4)}) | ${SITE.name}`,
    description: desc,
    pathname: p,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'ItemList', name: c.h1, itemListElement: list.map((t, i) => ({ '@type': 'ListItem', position: i + 1, url: URL_(`/tools/${t.slug}/`), name: t.name })) }],
    body: `
<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/category/')}">Categories</a> › ${esc(c.label)}</nav>
<header class="cat-hero"><img src="${catImg(c.page)}" alt="" width="640" height="480" fetchpriority="high" decoding="async"><div>
<h1>Best ${esc(c.h1)}</h1>
<p>${list.length} tools, in alphabetical order (this isn't a ranking). Check each tool's commercial-use notes before you ship assets in a game.</p>
</div></header>
<div class="table-wrap"><table class="cmp"><thead><tr><th>Tool</th><th>Free plan</th><th>Commercial use</th><th>API</th><th>MCP</th></tr></thead><tbody>
${list.map(t => `<tr><td><a class="cmp-tool" href="${L(`/tools/${t.slug}/`)}">${logo(t, 24)}${esc(t.name)}</a></td><td>${esc(FREE[t.free])}</td><td><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span></td><td>${esc(API_L[t.api.status])}</td><td>${esc(MCP_L[t.mcp.status])}</td></tr>`).join('\n')}
</tbody></table></div>
<h2 class="sub-h">Tool details</h2>
<div class="grid">${list.map(card).join('\n')}</div>
${newsletterBlock()}`,
  }));
}
page('/category/', layout({
  title: `Categories: AI tools for game developers | ${SITE.name}`,
  description: 'Browse AI tools for game development by task: pixel art, 3D models, textures, animation, music, voice, NPC dialogue, code and design.',
  pathname: '/category/',
  body: `<h1 class="page-h">Browse by task</h1><p class="page-sub">Pick a task to compare tools side by side, with pricing and commercial-use notes.</p><div class="tiles big">${catIndex.map(({ c, n }) => tile(c, n)).join('')}</div>
${newsletterBlock()}`,
}));

// ---------- Guides ----------
const stmt = x => `${esc(x.text)}${srcA(x.url)}`;
page('/guides/', layout({
  title: `Workflow guides: AI tools in a game pipeline | ${SITE.name}`,
  description: 'Step-by-step, sourced workflows for using AI tools in game development: 3D models to engine, voice to lip-sync, concept to texture set.',
  pathname: '/guides/',
  body: `<h1 class="page-h">Workflow guides</h1><p class="page-sub">Factual steps with a link to the official documentation for each one. Checked ${CHECKED}.</p>
<div class="res-grid big">${GUIDES.map(g => `<a class="res-card" href="${L(`/guides/${g.slug}/`)}"><span class="res-k">${g.steps.length} steps</span><strong>${esc(g.title)}</strong><span class="res-d">${esc(g.description)}</span></a>`).join('')}</div>`,
}));
for (const g of GUIDES) {
  const p = `/guides/${g.slug}/`;
  page(p, layout({
    title: `${g.title} | ${SITE.name}`, description: g.description, pathname: p,
    jsonld: [{ '@context': 'https://schema.org', '@type': 'HowTo', name: g.title, description: g.description, step: g.steps.map((st, i) => ({ '@type': 'HowToStep', position: i + 1, name: st.h, text: st.p.map(x => x.text).join(' ') })) }],
    body: `<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/guides/')}">Guides</a> › ${esc(g.title)}</nav>
<article class="guide"><h1 class="page-h">${esc(g.title)}</h1><p class="lead">${esc(g.intro)}</p>
<ol class="steps">${g.steps.map(st => `<li><h2>${esc(st.h)}</h2><ul>${st.p.map(x => `<li>${stmt(x)}</li>`).join('')}</ul></li>`).join('')}</ol>
<p class="note">Checked ${CHECKED}. Tools and docs change, so follow the linked sources. No vendor reviews or pays for these guides.</p></article>
<section class="related"><h2>Tools for this workflow</h2><div class="grid">${g.tools.map(x => card(bySlug[x])).join('\n')}</div></section>`,
  }));
}

// ---------- Store AI disclosure ----------
page('/steam-ai-disclosure/', layout({
  title: `${DISCLOSURE.title} (${CHECKED.slice(0, 4)}) | ${SITE.name}`, description: DISCLOSURE.description, pathname: '/steam-ai-disclosure/',
  body: `<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/guides/')}">Guides</a> › Store AI disclosure</nav>
<article class="guide"><h1 class="page-h">${esc(DISCLOSURE.title)}</h1><p class="lead">${esc(DISCLOSURE.description)} Checked <time datetime="${CHECKED}">${CHECKED}</time>.</p>
${DISCLOSURE.sections.map(sec => `<section class="disc"><h2>${esc(sec.h)}</h2><ul>${sec.items.map(x => `<li>${stmt(x)}</li>`).join('')}</ul></section>`).join('')}
<p class="note">${esc(DISCLOSURE.note)}</p></article>`,
}));

// ---------- New this week ----------
page('/new/', layout({
  title: `New this week: AI game-dev tool releases | ${SITE.name}`, description: 'Real releases and updates to AI tools for game developers this week, each with a source link.', pathname: '/new/',
  body: `<h1 class="page-h">New this week</h1><p class="page-sub">Releases and updates from ${NEWS[NEWS.length - 1].date} to ${CHECKED}. Each item links to its source. Dates are the source's publication date (Australia/Brisbane).</p>
<ol class="feed">${NEWS.map(n => `<li class="feed-item"><time datetime="${n.date}">${n.date}</time><div><h2>${esc(n.title)}</h2><p>${esc(n.text)}</p><p class="feed-meta">Source: <a href="${esc(n.source)}" rel="noopener nofollow" target="_blank">${esc(n.sourceName)}</a>${n.tool && bySlug[n.tool] ? ` · Listing: <a href="${L(`/tools/${n.tool}/`)}">${esc(bySlug[n.tool].name)}</a>` : ''}</p></div></li>`).join('')}</ol>
<p class="note">Know of a release we missed? <a href="${L('/submit/')}">Submit it</a> with a link to the official announcement.</p>`,
}));

// ---------- Comparisons ----------
const ROWS = [
  ['Best for', t => esc(t.bestFor)],
  ['What it does', t => esc(t.summary)],
  ['Verdict', t => esc(t.verdict)],
  ['Tasks', t => t.tasks.map(k => esc(TASKS[k].label)).join(', ')],
  ['Engines', t => esc(engineText(t))],
  ['Free plan', t => `${esc(FREE[t.free])}: ${esc(t.freeTier)}`],
  ['Pricing', t => `${esc(t.pricing)}${srcA(t.pricingSource)}`],
  ['Export formats', t => `${esc(t.exportFormats)}${srcA(t.exportSource)}`],
  ['Commercial use', t => `<span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span> ${esc(t.license)}${srcA(t.licenseSource)}`],
  ['Revenue share / caps', t => esc(t.revenue)],
  ['API', t => `${esc(API_L[t.api.status])}. ${esc(t.api.note)}${srcA(t.api.source)}`],
  ['MCP server', t => `${esc(MCP_L[t.mcp.status])}. ${esc(t.mcp.note)}${srcA(t.mcp.source)}`],
  ['Last checked', t => t.lastChecked],
];
page('/compare/', layout({
  title: `AI game-dev tool comparisons | ${SITE.name}`, description: 'Side-by-side comparisons of similar AI tools for game developers, built only from published pricing, specs and licence terms.', pathname: '/compare/',
  body: `<h1 class="page-h">Comparisons</h1><p class="page-sub">Side by side, using only each vendor's published pricing, specs and licence terms. No benchmark scores or ratings.</p>
<div class="res-grid big">${COMPARE.map(([a, b]) => `<a class="res-card vs" href="${L(`/compare/${a}-vs-${b}/`)}"><span class="vs-logos">${logo(bySlug[a], 36)}<em>vs</em>${logo(bySlug[b], 36)}</span><strong>${esc(bySlug[a].name)} vs ${esc(bySlug[b].name)}</strong></a>`).join('')}</div>`,
}));
for (const [a, b] of COMPARE) {
  const A = bySlug[a], B = bySlug[b], p = `/compare/${a}-vs-${b}/`;
  page(p, layout({
    title: `${A.name} vs ${B.name}: pricing, licence, API compared | ${SITE.name}`,
    description: `${A.name} vs ${B.name} for game developers: free plans, pricing, export formats, commercial-use terms, API and MCP, from each vendor's published pages.`, pathname: p,
    body: `<nav class="crumbs"><a href="${L('/')}">All tools</a> › <a href="${L('/compare/')}">Comparisons</a> › ${esc(A.name)} vs ${esc(B.name)}</nav>
<h1 class="page-h">${esc(A.name)} vs ${esc(B.name)}</h1>
<p class="page-sub">Facts from each vendor's published pages, checked ${CHECKED}. No scores and no winner: pick based on what you need.</p>
<div class="table-wrap"><table class="cmp vs-table"><thead><tr><th></th><th><a class="cmp-tool" href="${L(`/tools/${a}/`)}">${logo(A, 28)}${esc(A.name)}</a></th><th><a class="cmp-tool" href="${L(`/tools/${b}/`)}">${logo(B, 28)}${esc(B.name)}</a></th></tr></thead><tbody>
${ROWS.map(([h, f]) => `<tr><th scope="row">${h}</th><td>${f(A)}</td><td>${f(B)}</td></tr>`).join('\n')}
</tbody></table></div>
<p class="note">"Unverified" means we couldn't confirm that detail on the vendor's own pages. Read the vendor's current terms before you ship.</p>`,
  }));
}

// ---------- Sponsor (one offer; checkout URL lives in config.mjs) ----------
page('/sponsor/', layout({
  title: `Sponsor us | ${SITE.name}`, description: 'Sponsor GameDev AI Tools: your logo and link in the sponsor strip on every page for 7 days, plus a mention in the next newsletter. US$79/week.', pathname: '/sponsor/',
  body: `<h1 class="page-h">Sponsor GameDev AI Tools</h1>
<div class="paid-thanks" id="paid-thanks" role="status" hidden><p><strong>Thanks!</strong> Email your logo (SVG or PNG) and link to <a href="${mailto('Sponsor logo and link')}">${EMAIL}</a> and we'll add you within a day.</p></div>
<p class="offer">${esc(SPONSOR_OFFER)}</p>
<p><a class="btn" href="${esc(SPONSOR_PAYMENT_URL)}">Sponsor us</a></p>
<p class="note">The strip is labelled "Sponsor". Sponsorship never changes our listings, their order or their verdicts.</p>
<p>Planning a bigger campaign? Email <a href="${mailto('Campaign enquiry')}">${EMAIL}</a>.</p>`,
  scripts: `<script>if(/[?&]paid=1(&|$)/.test(location.search))document.getElementById('paid-thanks').hidden=false;</script>`,
}));

// ---------- Deals (data/deals.json; expired entries dropped at build time) ----------
const dealTool = d => bySlug[d.tool] ? `<a href="${L(`/tools/${d.tool}/`)}">${esc(bySlug[d.tool].name)}</a>` : esc(d.tool);
page('/deals/', layout({
  title: `Deals on AI tools for game devs | ${SITE.name}`,
  description: 'Live discounts and offers on AI tools for game developers, each sourced from the vendor, with its code and expiry date. Expired deals are removed automatically.',
  pathname: '/deals/',
  body: `<h1 class="page-h">Deals</h1>
<p class="page-sub">Real offers on AI tools for game devs, each linked to the vendor's own announcement. Expired deals are removed automatically. Last built ${TODAY}.</p>
${DEALS.length ? `<div class="table-wrap"><table class="cmp deals"><thead><tr><th>Tool</th><th>Offer</th><th>Code</th><th>Expires</th><th>Source</th></tr></thead><tbody>
${DEALS.map(d => `<tr><td>${dealTool(d)}</td><td>${esc(d.offer)}</td><td>${d.code ? `<code>${esc(d.code)}</code>` : 'No code needed'}</td><td>${d.expires ? `<time datetime="${esc(d.expires)}">${esc(d.expires)}</time>` : 'No end date stated by the vendor'}</td><td><a href="${esc(d.source)}" rel="noopener nofollow" target="_blank">Vendor source</a></td></tr>`).join('\n')}
</tbody></table></div>
<p class="note">Check the vendor's page before you buy: offers can end early. Deals never change our listings or verdicts.</p>` : `<p class="empty-state">No live deals right now. We only list real offers, sourced from the vendor.</p><p>Subscribe below and the newsletter will mention new deals when there are real ones.</p>`}
${newsletterBlock()}`,
}));

// ---------- Cheat sheet: AI tools you can legally ship in a paid game (built from tools.json) ----------
const freeShip = t => {
  if (t.commercial === 'n-a') return ['na', 'Not applicable'];
  if (t.free === 'unverified' || t.commercial === 'unverified') return ['unk', 'Unverified'];
  if (t.free === 'no') return ['paid', 'No free plan'];
  if (t.commercial === 'yes') return t.free === 'yes' ? ['yes', 'Yes'] : ['yes', 'Yes (free option is a trial or credits)'];
  if (t.commercial === 'paid-only') return ['paid', 'No: paid plan needed'];
  if (t.commercial === 'restricted') return ['check', 'Restricted: read the catch'];
  if (t.commercial === 'no') return ['no', 'No, on any plan'];
  return ['unk', 'Unverified'];
};
const planNeeded = t => ({
  'yes': t.free === 'yes' ? 'Free plan is enough' : t.free === 'no' ? 'Any paid plan' : 'Any plan (free option is a trial or credits)',
  'paid-only': 'A paid plan (see pricing)',
  'restricted': 'Depends on the licence terms',
  'no': 'None: commercial use not allowed',
  'unverified': 'Unverified',
  'n-a': 'Not applicable (doesn\'t make shippable assets)',
}[t.commercial] || 'Unverified');
const catchText = t => [t.license, t.revenue && t.revenue !== 'unverified' ? `Caps: ${t.revenue}` : ''].filter(Boolean).join(' ');
const SHEET_GROUPS = [
  ['yes', 'Free-plan output can be shipped commercially'],
  ['paid', 'You need a paid plan to ship'],
  ['check', 'Restricted: read the terms'],
  ['no', 'Not allowed in a commercial game'],
  ['unk', 'Unverified: we couldn\'t confirm this on the vendor\'s pages'],
  ['na', 'Not applicable: testing tools that don\'t make assets'],
];
const sheetRow = t => { const [k, label] = freeShip(t); return `<tr><td><a class="cmp-tool" href="${L(`/tools/${t.slug}/`)}">${logo(t, 24)}${esc(t.name)}</a></td><td><span class="pill ship-${k}">${esc(label)}</span></td><td>${esc(planNeeded(t))}</td><td>${esc(catchText(t))}</td><td>${t.licenseSource ? `<a href="${esc(t.licenseSource)}" rel="noopener nofollow" target="_blank">Terms</a>` : 'unverified'}${t.pricingSource ? ` · <a href="${esc(t.pricingSource)}" rel="noopener nofollow" target="_blank">Pricing</a>` : ''}</td><td><time datetime="${t.lastChecked}">${t.lastChecked}</time></td></tr>`; };
const sheetCounts = Object.fromEntries(SHEET_GROUPS.map(([k]) => [k, tools.filter(t => freeShip(t)[0] === k).length]));
page('/cheat-sheet/', layout({
  title: `AI tools you can legally ship in a paid game (cheat sheet) | ${SITE.name}`,
  description: `For ${tools.length} AI game-dev tools: can free-plan output go in a commercial game, which plan you need, and the catch. Sourced from each vendor's terms and dated.`,
  pathname: '/cheat-sheet/',
  body: `<h1 class="page-h">AI tools you can legally ship in a paid game</h1>
<p class="page-sub">For each of the ${tools.length} tools we list: whether output from the free plan can be used commercially, which plan you need, and the catch. Every row links to the vendor's own terms and shows the date we checked it. This summarises published terms; it isn't legal advice. Read the current terms before you ship.</p>
<p class="sheet-summary">${SHEET_GROUPS.map(([k, h]) => `<a href="#g-${k}"><strong>${sheetCounts[k]}</strong> ${esc(h.split(':')[0])}</a>`).join(' · ')}</p>
${SHEET_GROUPS.filter(([k]) => sheetCounts[k]).map(([k, h]) => `<h2 class="sub-h" id="g-${k}">${esc(h)}</h2>
<div class="table-wrap"><table class="cmp sheet"><thead><tr><th>Tool</th><th>Free plan, commercial?</th><th>Plan you need</th><th>The catch (from the vendor's terms)</th><th>Sources</th><th>Checked</th></tr></thead><tbody>
${tools.filter(t => freeShip(t)[0] === k).map(sheetRow).join('\n')}
</tbody></table></div>`).join('\n')}
<p class="note">"Unverified" means the vendor's pages didn't clearly answer the question when we checked. We'd rather say so than guess. Spotted something out of date? Email <a href="${mailto('Cheat sheet correction')}">${EMAIL}</a> with a link to the vendor's terms.</p>
${newsletterBlock()}`,
}));

// ---------- Badge ----------
const BADGE_W = 200, BADGE_H = 44;
const badgeSnippet = (slug, theme) => `<a href="${URL_(`/tools/${slug}/`)}"><img src="${URL_(`/assets/badge/listed-${theme}.svg`)}" alt="Listed on GameDev AI Tools" width="${BADGE_W}" height="${BADGE_H}"></a>`;
page('/badge/', layout({
  title: `"Listed on GameDev AI Tools" badge | ${SITE.name}`,
  description: 'Is your tool listed on GameDev AI Tools? Add a "Listed on GameDev AI Tools" badge to your site, in light or dark, linking to your listing.',
  pathname: '/badge/',
  body: `<h1 class="page-h">"Listed on GameDev AI Tools" badge</h1>
<p class="page-sub">If your tool is listed here, you're welcome to show this badge on your site. It links to your listing. It's optional and free, and it doesn't change your listing.</p>
<div class="badge-demo"><div class="bd light"><img src="${L('/assets/badge/listed-light.svg')}" alt="Listed on GameDev AI Tools (light)" width="${BADGE_W}" height="${BADGE_H}"><span>Light</span></div><div class="bd dark"><img src="${L('/assets/badge/listed-dark.svg')}" alt="Listed on GameDev AI Tools (dark)" width="${BADGE_W}" height="${BADGE_H}"><span>Dark</span></div></div>
<label class="badge-pick">Your tool <select id="badge-tool">${tools.map(t => `<option value="${t.slug}">${esc(t.name)}</option>`).join('')}</select></label>
<h2 class="sub-h">Light badge</h2>
<textarea class="snippet" id="snip-light" readonly rows="3">${esc(badgeSnippet(tools[0].slug, 'light'))}</textarea>
<h2 class="sub-h">Dark badge</h2>
<textarea class="snippet" id="snip-dark" readonly rows="3">${esc(badgeSnippet(tools[0].slug, 'dark'))}</textarea>
<p class="note">Pick your tool above and the snippets update with your listing's URL. Without JavaScript, replace <code>${esc(tools[0].slug)}</code> with your tool's slug from its listing URL. Not listed yet? <a href="${L('/submit/')}">Submit your tool</a>.</p>`,
  scripts: `<script>(function(){var s=document.getElementById('badge-tool');function u(){['light','dark'].forEach(function(th){document.getElementById('snip-'+th).value='<a href="${URL_('/tools/')}'+s.value+'/"><img src="${URL_('/assets/badge/listed-')}'+th+'.svg" alt="Listed on GameDev AI Tools" width="${BADGE_W}" height="${BADGE_H}"></a>';});}s.addEventListener('change',u);document.querySelectorAll('.snippet').forEach(function(t){t.addEventListener('focus',function(){t.select();});});})();</script>`,
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
</form>`,
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

// ---------- llms.txt / llms-full.txt (https://llmstxt.org) ----------
const md = s => String(s).replace(/\s+/g, ' ').trim();
const catLinks = Object.values(TASKS).map(c => `- [${c.label}](${URL_(`/category/${c.page}/`)}): ${c.h1}`);
const guideLinks = GUIDES.map(g => `- [${md(g.title)}](${URL_(`/guides/${g.slug}/`)}): ${md(g.description)}`);
const cmpLinks = COMPARE.map(([a, b]) => `- [${bySlug[a].name} vs ${bySlug[b].name}](${URL_(`/compare/${a}-vs-${b}/`)})`);
const llmsHead = `# ${SITE.name}

> ${SITE.description} Every fact comes from the vendor's own pages, with a source link and a last-checked date (${CHECKED}). Anything we couldn't confirm is marked "unverified". There are no ratings, reviews or user counts.

${tools.length} tools listed. Each tool page covers what it is best for, price and free tier, supported engines, export formats, commercial-use terms and licence (with source), revenue share or caps, and API and MCP server availability.
`;
const llmsLinks = `
## Categories
${catLinks.join('\n')}

## Guides
- [All guides](${URL_('/guides/')})
${guideLinks.join('\n')}

## Store rules
- [${md(DISCLOSURE.title)}](${URL_('/steam-ai-disclosure/')}): ${md(DISCLOSURE.description)}

## Comparisons
- [All comparisons](${URL_('/compare/')})
${cmpLinks.join('\n')}

## Resources
- [AI tools you can legally ship in a paid game](${URL_('/cheat-sheet/')}): cheat sheet of free-plan commercial use, plan needed and the catch for every tool, with sources and check dates
- [Deals](${URL_('/deals/')}): live, vendor-sourced offers on AI game-dev tools; expired deals are removed automatically
- [Listed badge](${URL_('/badge/')}): "Listed on GameDev AI Tools" badge snippets for listed tools

## Optional
- [Full directory of tools](${URL_('/')}): searchable and filterable by task, engine, free plan and commercial use
- [Full text for LLMs](${URL_('/llms-full.txt')}): every listing's sourced facts in one Markdown file
- [New this week](${URL_('/new/')}): recent, sourced releases
- [Submit a tool](${URL_('/submit/')})
- [Sponsor us](${URL_('/sponsor/')}): ${SPONSOR_OFFER}
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
- Best for: ${md(t.bestFor || 'unverified')}
- Tasks: ${t.tasks.map(k => TASKS[k] ? TASKS[k].label : k).join(', ')}
- Engines: ${engineText(t)}
- Pricing: ${md(t.pricing)} (source: ${t.pricingSource || 'unverified'})
- Free plan: ${FREE[t.free] || t.free}. ${md(t.freeTier || '')}
- Export formats: ${md(t.exportFormats || 'unverified')}${t.exportSource ? ` (source: ${t.exportSource})` : ''}
- Commercial use: ${COMMERCIAL[t.commercial] || t.commercial}. ${md(t.license)} (source: ${t.licenseSource || 'unverified'})
- Revenue share / caps: ${md(t.revenue || 'unverified')}
- API: ${API_L[t.api?.status] || 'Unverified'}${t.api?.note ? `. ${md(t.api.note)}` : ''}${t.api?.source ? ` (source: ${t.api.source})` : ''}
- MCP: ${MCP_L[t.mcp?.status] || 'Unverified'}${t.mcp?.note ? `. ${md(t.mcp.note)}` : ''}${t.mcp?.source ? ` (source: ${t.mcp.source})` : ''}
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
// Root-level verification files (e.g. Google Search Console), copied byte-for-byte; never in the sitemap.
if (fs.existsSync('src/root')) fs.cpSync('src/root', out, { recursive: true });
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages, '/llms.txt', '/llms-full.txt'].map(p => `<url><loc>${URL_(p)}</loc><lastmod>${SITE.updated}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\n# LLM-friendly summary (https://llmstxt.org): ${URL_('/llms.txt')} and ${URL_('/llms-full.txt')}\nSitemap: ${URL_('/sitemap.xml')}\n`);
write('404.html', layout({ title: `Not found | ${SITE.name}`, description: 'Page not found.', pathname: '/404.html', noindex: true, body: `<h1>Page not found</h1><p><a href="${L('/')}">Back to all tools</a></p>` }));
write('.nojekyll', '');
console.log(`Built ${pages.length} pages, ${tools.length} tools -> ${out}/`);
