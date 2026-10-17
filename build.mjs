// Zero-dependency static site generator. Usage: node build.mjs  -> writes ./dist
import fs from 'node:fs';
import path from 'node:path';

const SITE = {
  name: 'GameDev AI Tools',
  origin: process.env.SITE_ORIGIN || 'https://gamedevaitools.com',
  base: process.env.SITE_BASE ?? '', // e.g. '/gamedev-ai-tools' for a GitHub Pages project path
  description: 'A free directory of AI tools for game developers. Filter by task (pixel art, 3D models, textures, music, voice, NPC dialogue, code), engine, pricing and commercial-use license.',
  updated: '2026-10-17',
};
// Signup form is shown only when explicitly enabled AND both Resend env vars exist.
const NEWSLETTER_ON = process.env.NEWSLETTER_ENABLED === '1' && Boolean(process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID);
console.log('Newsletter signup enabled:', NEWSLETTER_ON);
const URL_ = p => SITE.origin + SITE.base + p;
const L = p => SITE.base + p;

const TASKS = {
  'sprites':      { label: 'Pixel art & sprites', page: 'pixel-art', h1: 'AI tools for pixel art and sprites' },
  '3d-models':    { label: '3D models', page: '3d-models', h1: 'AI tools for 3D game models' },
  'textures':     { label: 'Textures, materials & skyboxes', page: 'textures', h1: 'AI tools for textures, materials and skyboxes' },
  'concept-art':  { label: 'Concept art', page: 'concept-art', h1: 'AI tools for game concept art' },
  'animation':    { label: 'Animation & mocap', page: 'animation', h1: 'AI tools for game animation and motion capture' },
  'audio':        { label: 'Music & sound', page: 'music-and-sound', h1: 'AI tools for game music and sound' },
  'voice':        { label: 'Voice & TTS', page: 'voice', h1: 'AI voice and text-to-speech tools for games' },
  'npc-dialogue': { label: 'NPC dialogue & AI characters', page: 'npc-dialogue', h1: 'AI tools for NPC dialogue and AI characters' },
  'code':         { label: 'Code assistants', page: 'code', h1: 'AI coding tools for game developers' },
  'design':       { label: 'Game design & ideation', page: 'game-design', h1: 'AI tools for game design and ideation' },
};
const ENGINES = { unity: 'Unity', godot: 'Godot', unreal: 'Unreal' };
const PRICING = { 'freemium': 'Free tier + paid', 'paid': 'Paid', 'pay-as-you-go': 'Pay as you go', 'open-weights': 'Free (open weights)', 'included': 'Included with engine plan', 'unverified': 'Unverified' };
const COMMERCIAL = { 'yes': 'Commercial use allowed', 'paid-only': 'Commercial on paid plans only', 'restricted': 'Restricted (see notes)', 'no': 'Not allowed', 'unverified': 'Unverified' };

const tools = JSON.parse(fs.readFileSync('data/tools.json', 'utf8')).sort((a, b) => a.name.localeCompare(b.name));
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
const engineText = t => t.engines.filter(e => ENGINES[e]).map(e => ENGINES[e]).join(', ') || 'Any (standard file export / engine-agnostic)';

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
${jsonld.map(ld).join('\n')}
</head>
<body>
<header class="site-header"><div class="wrap">
<a class="logo" href="${L('/')}">${MARK}<span>GameDev <b>AI Tools</b></span></a>
<nav><a href="${L('/#tools')}">All tools</a><a href="${L('/category/')}">Categories</a><a href="${L('/get-featured/')}">Get featured</a><a class="nav-cta" href="${L('/submit/')}">Submit a tool</a></nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer class="site-footer"><div class="wrap">
<p class="foot-brand"><a class="logo" href="${L('/')}">${MARK}<span>GameDev <b>AI Tools</b></span></a></p>
<p>Facts are taken from each vendor's own website and dated. Pricing and licences change often, so always check the vendor's current terms before you rely on them. This is not legal advice. No affiliate links.</p>
<p><a href="${L('/privacy/')}">Privacy</a> · <a href="${L('/get-featured/')}">Get featured</a> · <a href="${L('/sitemap.xml')}">Sitemap</a> · Last updated ${SITE.updated}</p>
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
<div class="card-foot"><ul class="tags">${t.tasks.map(k => `<li>${esc(TASKS[k].label)}</li>`).join('')}</ul><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span></div>
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
<h2>Get the newsletter</h2>
<p>An occasional email about new AI tools for game devs and changes to their pricing and licences. Unsubscribe any time.</p>
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
<p class="eyebrow"><span class="dot"></span>Free directory · No affiliate links · Checked ${SITE.updated}</p>
<h1>Find the right AI tool for <span class="grad">every part of your game</span></h1>
<p class="sub">${tools.length} AI tools for sprites, 3D models, textures, animation, music, voice, NPC dialogue and code. Every listing shows pricing and commercial-use terms, with a link to the vendor's own page and the date we checked it.</p>
<label class="searchbar">${ICON_SEARCH}<input id="q" type="search" placeholder="Search tools, e.g. pixel art, voice, Godot" aria-label="Search tools" autocomplete="off"></label>
<p class="quick"><span>Popular:</span>${['sprites', '3d-models', 'audio', 'voice', 'code'].map(k => `<a href="${L(`/?task=${k}#tools`)}">${esc(TASKS[k].label)}</a>`).join('')}</p>
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
<select id="f-pricing" aria-label="Pricing"><option value="">Any pricing</option>${opts(PRICING)}</select>
<select id="f-commercial" aria-label="Commercial use"><option value="">Any licence</option>${opts(COMMERCIAL)}</select>
<button id="reset" type="button">Reset</button>
</div>
<p class="hint">The engine filter shows tools whose vendor states a plugin, integration or export for that engine. Most other tools export standard files (PNG, FBX, GLB, WAV and so on) that work in any engine.</p>
<div id="results" class="grid">
${tools.map(card).join('\n')}
</div>
</section>
<section class="how" aria-labelledby="how-h">
<h2 id="how-h">How listings work</h2>
<div class="how-grid">
<div><h3>Sourced</h3><p>Pricing and commercial-use notes come from each vendor's own pages, and every listing links to its source.</p></div>
<div><h3>Dated</h3><p>Each tool shows the date we last checked it. Anything we couldn't confirm is marked "unverified".</p></div>
<div><h3>Not a ranking</h3><p>Tools are listed alphabetically. There are no paid placements, reviews, ratings or affiliate links.</p></div>
</div>
</section>
${newsletterBlock()}`,
  scripts: `<script>window.TOOLS=${JSON.stringify(tools.map(t => ({ slug: t.slug, name: t.name, summary: t.summary + ' ' + t.verdict, tasks: t.tasks, engines: t.engines, pricingModel: t.pricingModel, commercial: t.commercial }))).replace(/</g, '\\u003c')};</script>
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
<p class="tool-cta"><a class="btn" href="${esc(t.url)}" rel="noopener nofollow" target="_blank">Visit official site ↗</a><span class="pill">${esc(PRICING[t.pricingModel])}</span><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span></p>
</div></header>
<p class="verdict big"><strong>Verdict:</strong> ${esc(t.verdict)}</p>
<dl class="facts">
<dt>Tasks</dt><dd>${t.tasks.map(k => `<a href="${L(`/category/${TASKS[k].page}/`)}">${esc(TASKS[k].label)}</a>`).join(', ')}</dd>
<dt>Engines</dt><dd>${esc(engineText(t))}</dd>
<dt>Pricing</dt><dd>${esc(t.pricing)}<br><small>Source: <a href="${esc(t.pricingSource)}" rel="noopener nofollow" target="_blank">${esc(t.pricingSource)}</a></small></dd>
<dt>Commercial use</dt><dd><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span><br>${esc(t.license)}<br><small>Source: <a href="${esc(t.licenseSource)}" rel="noopener nofollow" target="_blank">${esc(t.licenseSource)}</a></small></dd>
<dt>Last checked</dt><dd><time datetime="${t.lastChecked}">${t.lastChecked}</time></dd>
</dl>
<p class="note">We summarise what the vendor's own pages say on the date above. "Unverified" means we couldn't confirm that detail. Read the vendor's current terms before you ship anything.</p>
</article>
${related.length ? `<section class="related"><h2>Related tools</h2><div class="grid">${related.map(card).join('\n')}</div></section>` : ''}`,
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
<div class="table-wrap"><table class="cmp"><thead><tr><th>Tool</th><th>Pricing</th><th>Commercial use</th></tr></thead><tbody>
${list.map(t => `<tr><td><a class="cmp-tool" href="${L(`/tools/${t.slug}/`)}">${logo(t, 24)}${esc(t.name)}</a></td><td>${esc(PRICING[t.pricingModel])}</td><td><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span></td></tr>`).join('\n')}
</tbody></table></div>
<div class="grid">${list.map(card).join('\n')}</div>`,
  }));
}
page('/category/', layout({
  title: `Categories: AI tools for game developers | ${SITE.name}`,
  description: 'Browse AI tools for game development by task: pixel art, 3D models, textures, animation, music, voice, NPC dialogue, code and design.',
  pathname: '/category/',
  body: `<h1 class="page-h">Browse by task</h1><p class="page-sub">Pick a task to compare tools side by side, with pricing and commercial-use notes.</p><div class="tiles big">${catIndex.map(({ c, n }) => tile(c, n)).join('')}</div>`,
}));

// ---------- Get featured ----------
page('/get-featured/', layout({
  title: `Get featured | ${SITE.name}`,
  description: 'Make an AI tool for game developers? Here is how listings work on GameDev AI Tools.',
  pathname: '/get-featured/',
  body: `<h1>Get featured</h1>
<p>Do you build an AI tool that helps people make games? We'd like to list it.</p>
<ul>
<li>Every listing is based on your official website: what the tool does, your published pricing, and your commercial-use or licence terms, each with a source link and a "last checked" date.</li>
<li>We don't publish reviews, ratings or user numbers we can't verify.</li>
<li>Featured placements aren't available yet. When they are, they'll be clearly labelled.</li>
</ul>
<p>To suggest a tool, use the <a href="${L('/submit/')}">Submit a tool</a> form. For corrections, open an issue on <a href="https://github.com/michaelpaulrattray/gamedev-ai-tools/issues">GitHub</a> with links to your pricing and terms pages.</p>`,
}));

// ---------- Privacy ----------
page('/privacy/', layout({
  title: `Privacy | ${SITE.name}`,
  description: 'GameDev AI Tools does not collect personal data.',
  pathname: '/privacy/',
  body: `<h1>Privacy</h1>
<p>This site doesn't collect any personal data. It has no accounts, cookies, analytics or tracking, and the newsletter form is a placeholder that collects nothing.</p>
<p>The site is hosted on GitHub Pages. GitHub may process technical data (such as IP addresses) to serve the pages, as described in GitHub's own privacy statement.</p>
<p>Last updated ${SITE.updated}.</p>`,
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
  body: `<h1>You're on the list</h1><p>Thanks for signing up. We haven't sent any newsletters yet, and you can unsubscribe from any email we send.</p><p><a href="${L('/')}">Back to all tools</a></p>`,
}), { sitemap: false });
page('/subscribe-error/', layout({
  title: `Signup problem | ${SITE.name}`, description: 'There was a problem with your signup.', pathname: '/subscribe-error/', noindex: true,
  body: `<h1>Signup didn't work</h1><p>Please check your email address and <a href="${L('/#newsletter')}">try again</a>.</p>`,
}), { sitemap: false });

// ---------- Static assets, sitemap, robots, 404 ----------
fs.cpSync('src/assets', path.join(out, 'assets'), { recursive: true });
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `<url><loc>${URL_(p)}</loc><lastmod>${SITE.updated}</lastmod></url>`).join('\n')}
</urlset>
`);
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${URL_('/sitemap.xml')}\n`);
write('404.html', layout({ title: `Not found | ${SITE.name}`, description: 'Page not found.', pathname: '/404.html', body: `<h1>Page not found</h1><p><a href="${L('/')}">Back to all tools</a></p>` }));
write('.nojekyll', '');
console.log(`Built ${pages.length} pages, ${tools.length} tools -> ${out}/`);
