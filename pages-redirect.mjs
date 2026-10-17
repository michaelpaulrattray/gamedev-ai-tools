// Builds redirect stubs for the old GitHub Pages site (michaelpaulrattray.github.io/gamedev-ai-tools/)
// pointing every page at https://gamedevaitools.com. Reversible: revert the Pages workflow to `node build.mjs`.
import fs from 'node:fs';
import path from 'node:path';
const TARGET = 'https://gamedevaitools.com';
const OLD_BASE = '/gamedev-ai-tools';
const src = 'dist', out = 'dist-pages';
fs.rmSync(out, { recursive: true, force: true });
const stub = p => `<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>Moved to gamedevaitools.com</title>
<link rel="canonical" href="${TARGET}${p}">
<meta http-equiv="refresh" content="0; url=${TARGET}${p}">
<script>location.replace(${JSON.stringify(TARGET + p)} + location.search + location.hash);</script>
</head><body><p>GameDev AI Tools has moved to <a href="${TARGET}${p}">${TARGET}${p}</a>.</p></body></html>
`;
let n = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name === 'index.html') {
      const rel = path.relative(src, path.dirname(f));
      const p = '/' + (rel ? rel.split(path.sep).join('/') + '/' : '');
      const o = path.join(out, rel, 'index.html');
      fs.mkdirSync(path.dirname(o), { recursive: true });
      fs.writeFileSync(o, stub(p)); n++;
    }
  }
})(src);
// Unknown old URLs: map path minus the old base onto the new domain.
fs.writeFileSync(path.join(out, '404.html'), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved to gamedevaitools.com</title>
<script>var p=location.pathname.replace(/^${OLD_BASE.replace(/\//g, '\\/')}/,'')||'/';location.replace(${JSON.stringify(TARGET)}+p+location.search+location.hash);</script>
<meta http-equiv="refresh" content="0; url=${TARGET}/"></head><body><p>Moved to <a href="${TARGET}/">${TARGET}</a>.</p></body></html>
`);
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log(`Wrote ${n} redirect stubs -> ${out}/`);
