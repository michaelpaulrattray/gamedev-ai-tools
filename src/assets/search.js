// Intent search for the homepage hero: type what you're trying to do ("animation", "modelling", "voice acting")
// and get the ranked top picks for that job, its head-to-head comparisons, and matching tools/engines.
// Data comes from window.SEARCH (built by build.mjs); everything runs in the browser.
(function () {
  var D = window.SEARCH, form = document.querySelector('.searchbar[data-smart]');
  if (!D || !form) return;
  var input = form.querySelector('input'), box = document.createElement('div');
  box.className = 'ss-box'; box.id = 'ss-box'; box.hidden = true;
  form.appendChild(box);
  input.setAttribute('aria-controls', 'ss-box'); input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-autocomplete', 'list');

  function e(x) { return String(x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function words(s) { return s.toLowerCase().replace(/[^a-z0-9& ]+/g, ' ').split(/\s+/).filter(function (w) { return w.length > 1; }); }
  // A query word hits a keyword when either is a prefix of the other ("modelling" ~ "model", "anim" ~ "animation").
  function hit(w, k) { return (w.length >= 3 && k.indexOf(w) === 0) || (k.length >= 3 && w.indexOf(k) === 0); }
  function score(ws, keys) {
    var s = 0;
    ws.forEach(function (w) { var best = 0; keys.forEach(function (k) { if (k === w) best = Math.max(best, 3); else if (hit(w, k)) best = Math.max(best, 2); }); s += best; });
    return s;
  }
  function logo(t, size) {
    return t.l ? '<img class="tlogo" src="' + e(t.l) + '" alt="" width="' + size + '" height="' + size + '">'
      : '<span class="tlogo mono" aria-hidden="true" style="--h:' + t.h + ';width:' + size + 'px;height:' + size + 'px">' + e(t.i) + '</span>';
  }

  function find(q) {
    var ws = words(q);
    if (!ws.length) return null;
    var cats = D.cats.map(function (c) { return { c: c, s: score(ws, c.kw) }; }).filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; }).slice(0, 2).map(function (x) { return x.c; });
    var ql = q.toLowerCase().trim();
    var tools = D.tools.filter(function (t) { var n = t.n.toLowerCase(); return n.indexOf(ql) === 0 || n.split(/\s+/).some(function (p) { return ws.some(function (w) { return w.length >= 2 && p.indexOf(w) === 0; }); }); }).slice(0, 4);
    var engines = D.engines.filter(function (g) { return ws.some(function (w) { return hit(w, g.n.toLowerCase()); }); });
    // Naming a tool also surfaces its comparisons.
    var cmps = [];
    tools.forEach(function (t) { D.cmps.forEach(function (p) { if ((p.a === t.s || p.b === t.s) && cmps.indexOf(p) < 0) cmps.push(p); }); });
    cats.forEach(function (c) { c.cmp.forEach(function (i) { var p = D.cmps[i]; if (cmps.indexOf(p) < 0) cmps.push(p); }); });
    return { cats: cats, tools: tools, engines: engines, cmps: cmps.slice(0, 4) };
  }

  var links = [], active = -1;
  function render(r, q) {
    var h = '';
    r.cats.forEach(function (c, ci) {
      h += '<div class="ss-sec"><div class="ss-head"><span>Best for ' + e(c.label) + '</span><a href="' + e(c.u) + '">All ' + c.count + ' ranked →</a></div>';
      c.top.forEach(function (t) {
        h += '<a class="ss-row" href="' + e(t.u) + '"><span class="ss-n">#' + t.r + '</span>' + logo(t, 30) + '<span class="ss-txt"><b>' + e(t.n) + '</b><small>' + e(t.p) + (t.ev ? ' · <i class="best-ev">●</i> independently tested' : '') + '</small></span></a>';
      });
      h += '</div>';
    });
    if (r.cmps.length) h += '<div class="ss-sec"><div class="ss-head"><span>Compare</span><a href="' + e(D.cmpAll) + '">All comparisons →</a></div><div class="ss-chips">' + r.cmps.map(function (p) { return '<a class="chip" href="' + e(p.u) + '">' + e(p.t) + '</a>'; }).join('') + '</div></div>';
    if (r.tools.length || r.engines.length) {
      h += '<div class="ss-sec"><div class="ss-head"><span>Tools</span></div>';
      r.tools.forEach(function (t) { h += '<a class="ss-row" href="' + e(t.u) + '">' + logo(t, 30) + '<span class="ss-txt"><b>' + e(t.n) + '</b><small>' + e(t.c) + '</small></span></a>'; });
      r.engines.forEach(function (g) { h += '<a class="ss-row" href="' + e(g.u) + '"><span class="ss-eng">' + e(g.n.charAt(0)) + '</span><span class="ss-txt"><b>AI tools for ' + e(g.n) + '</b><small>' + g.c + ' tools with a ' + e(g.n) + ' integration</small></span></a>'; });
      h += '</div>';
    }
    h += '<a class="ss-all" href="' + e(D.toolsUrl + '?q=' + encodeURIComponent(q)) + '">Search all tools for “' + e(q) + '” →</a>';
    box.innerHTML = h;
    links = [].slice.call(box.querySelectorAll('a')); active = -1;
    show(true);
  }
  function show(on) { box.hidden = !on; input.setAttribute('aria-expanded', on ? 'true' : 'false'); }
  function update() {
    var q = input.value.trim();
    if (q.length < 2) { show(false); return; }
    render(find(q) || { cats: [], tools: [], engines: [], cmps: [] }, q);
  }
  function move(d) {
    if (box.hidden || !links.length) return;
    active = (active + d + links.length) % links.length;
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
    links[active].scrollIntoView({ block: 'nearest' });
  }
  input.addEventListener('input', update);
  input.addEventListener('focus', update);
  input.addEventListener('keydown', function (ev) {
    if (ev.key === 'ArrowDown') { ev.preventDefault(); move(1); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); move(-1); }
    else if (ev.key === 'Escape') { show(false); }
  });
  // Enter: the highlighted row, else the best matching job's ranked list, else the tool that was named, else full search.
  form.addEventListener('submit', function (ev) {
    var q = input.value.trim(), r = q ? find(q) : null, go = active >= 0 && links[active] ? links[active].href
      : r && r.cats.length ? r.cats[0].u : r && r.tools.length === 1 ? r.tools[0].u : null;
    if (go) { ev.preventDefault(); location.href = go; }
  });
  document.addEventListener('click', function (ev) { if (!form.contains(ev.target)) show(false); });
})();
