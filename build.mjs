// Zero-dependency static site generator. Usage: node build.mjs  -> writes ./dist
import fs from 'node:fs';
import path from 'node:path';

const SITE = {
  name: 'GameDev AI Tools',
  origin: process.env.SITE_ORIGIN || 'https://michaelpaulrattray.github.io',
  base: process.env.SITE_BASE ?? '/gamedev-ai-tools', // '' when on a custom domain
  description: 'A free directory of AI tools for game developers. Filter by task (pixel art, 3D models, textures, music, voice, NPC dialogue, code), engine, pricing and commercial-use license.',
  updated: '2026-10-17',
};
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
const engineText = t => t.engines.filter(e => ENGINES[e]).map(e => ENGINES[e]).join(', ') || 'Any (standard file export / engine-agnostic)';

function layout({ title, description, pathname, body, jsonld = [], scripts = '' }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${URL_(pathname)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${URL_(pathname)}">
<meta property="og:site_name" content="${SITE.name}">
<meta name="twitter:card" content="summary">
<link rel="stylesheet" href="${L('/assets/style.css')}">
${jsonld.map(ld).join('\n')}
</head>
<body>
<header class="site-header"><div class="wrap">
<a class="logo" href="${L('/')}">🎮 ${SITE.name}</a>
<nav><a href="${L('/')}">All tools</a><a href="${L('/category/')}">Categories</a><a href="${L('/get-featured/')}">Get featured</a></nav>
</div></header>
<main class="wrap">
${body}
</main>
<footer class="site-footer"><div class="wrap">
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
<h3><a href="${L(`/tools/${t.slug}/`)}">${esc(t.name)}</a></h3>
<p>${esc(t.summary)}</p>
<ul class="tags">${t.tasks.map(k => `<li>${esc(TASKS[k].label)}</li>`).join('')}</ul>
<p class="meta"><span class="pill price">${esc(PRICING[t.pricingModel])}</span> <span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span></p>
</article>`;
}

const out = 'dist';
fs.rmSync(out, { recursive: true, force: true });
const write = (p, s) => { const f = path.join(out, p); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };
const pages = [];
const page = (p, html) => { write(p === '/' ? 'index.html' : p.replace(/^\//, '') + 'index.html', html); pages.push(p); };

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
  body: `
<section class="hero">
<h1>AI tools for game developers</h1>
<p>${tools.length} tools for sprites, 3D models, textures, music, voice, NPC dialogue and code. Each one lists its pricing and commercial-use licence, with a link to the source and the date we checked it.</p>
</section>
<section class="filters" aria-label="Search and filters">
<input id="q" type="search" placeholder="Search tools, e.g. pixel art, voice, Godot" aria-label="Search tools">
<select id="f-task" aria-label="Task"><option value="">All tasks</option>${opts(Object.fromEntries(Object.entries(TASKS).map(([k, v]) => [k, v.label])))}</select>
<select id="f-engine" aria-label="Engine"><option value="">Any engine</option>${opts(ENGINES)}</select>
<select id="f-pricing" aria-label="Pricing"><option value="">Any pricing</option>${opts(PRICING)}</select>
<select id="f-commercial" aria-label="Commercial use"><option value="">Any licence</option>${opts(COMMERCIAL)}</select>
<button id="reset" type="button">Reset</button>
</section>
<p class="hint">The engine filter shows tools whose vendor states a plugin, integration or export for that engine. Most other tools export standard files (PNG, FBX, GLB, WAV and so on) that work in any engine.</p>
<p id="count" aria-live="polite">${tools.length} tools</p>
<section id="results" class="grid">
${tools.map(card).join('\n')}
</section>
<section class="newsletter" id="newsletter">
<h2>Newsletter: coming soon</h2>
<p>We're planning a short email about new AI tools for game devs and changes to their pricing and licences. Signup isn't open yet, and this form collects nothing.</p>
<form onsubmit="return false"><input type="email" placeholder="you@example.com" disabled aria-label="Email (coming soon)"><button type="button" disabled>Coming soon</button></form>
</section>`,
  scripts: `<script>window.TOOLS=${JSON.stringify(tools.map(t => ({ slug: t.slug, name: t.name, summary: t.summary, tasks: t.tasks, engines: t.engines, pricingModel: t.pricingModel, commercial: t.commercial }))).replace(/</g, '\\u003c')};</script>
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
<h1>${esc(t.name)}</h1>
<p class="lead">${esc(t.summary)}</p>
<p><a class="btn" href="${esc(t.url)}" rel="noopener nofollow" target="_blank">Visit official site ↗</a></p>
<dl class="facts">
<dt>Tasks</dt><dd>${t.tasks.map(k => `<a href="${L(`/category/${TASKS[k].page}/`)}">${esc(TASKS[k].label)}</a>`).join(', ')}</dd>
<dt>Engines</dt><dd>${esc(engineText(t))}</dd>
<dt>Pricing</dt><dd>${esc(t.pricing)}<br><small>Source: <a href="${esc(t.pricingSource)}" rel="noopener nofollow" target="_blank">${esc(t.pricingSource)}</a></small></dd>
<dt>Commercial use</dt><dd><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span><br>${esc(t.license)}<br><small>Source: <a href="${esc(t.licenseSource)}" rel="noopener nofollow" target="_blank">${esc(t.licenseSource)}</a></small></dd>
<dt>Last checked</dt><dd><time datetime="${t.lastChecked}">${t.lastChecked}</time></dd>
</dl>
<p class="note">We summarise what the vendor's own pages say on the date above. "Unverified" means we couldn't confirm that detail. Read the vendor's current terms before you ship anything.</p>
</article>
${related.length ? `<section><h2>Related tools</h2><div class="grid">${related.map(card).join('\n')}</div></section>` : ''}`,
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
<h1>Best ${esc(c.h1)}</h1>
<p>${list.length} tools, in alphabetical order (this isn't a ranking). Check each tool's commercial-use notes before you ship assets in a game.</p>
<table class="cmp"><thead><tr><th>Tool</th><th>Pricing</th><th>Commercial use</th></tr></thead><tbody>
${list.map(t => `<tr><td><a href="${L(`/tools/${t.slug}/`)}">${esc(t.name)}</a></td><td>${esc(PRICING[t.pricingModel])}</td><td><span class="pill lic lic-${t.commercial}">${esc(COMMERCIAL[t.commercial])}</span></td></tr>`).join('\n')}
</tbody></table>
<div class="grid">${list.map(card).join('\n')}</div>`,
  }));
}
page('/category/', layout({
  title: `Categories: AI tools for game developers | ${SITE.name}`,
  description: 'Browse AI tools for game development by task: pixel art, 3D models, textures, animation, music, voice, NPC dialogue, code and design.',
  pathname: '/category/',
  body: `<h1>Browse by task</h1><ul class="catlist">${catIndex.map(({ c, p, n }) => `<li><a href="${L(p)}">${esc(c.h1)}</a> <span>(${n})</span></li>`).join('')}</ul>`,
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
<p>To suggest a tool or a correction, open an issue on <a href="https://github.com/michaelpaulrattray/gamedev-ai-tools/issues">GitHub</a> with links to your pricing and terms pages.</p>`,
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
