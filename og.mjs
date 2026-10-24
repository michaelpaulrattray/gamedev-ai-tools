// Share images (og:image / twitter:image), 1200x630 PNG, rendered at build time with satori (layout) + resvg (PNG).
// Deterministic: same input -> same PNG. Rendered PNGs are cached by content hash in node_modules/.cache/og
// (kept between Vercel builds), so unchanged images cost nothing on the next build.
// Images used: our own brand mark, stored tool logos (src/assets/logos) and our category art (og/art = JPEG copies of src/assets/img).
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const W = 1200, H = 630;
const C = { bg: '#0b0d14', panel: '#141824', line: '#2f3850', text: '#eef0f6', muted: '#9aa3b8', dim: '#8089a0', accent: '#8b5cf6', accent2: '#22d3ee' };
export const TONES = {
  ok: { bg: 'rgba(16,185,129,0.16)', fg: '#6ee7b7', bd: 'rgba(16,185,129,0.45)' },
  warn: { bg: 'rgba(245,158,11,0.16)', fg: '#fcd34d', bd: 'rgba(245,158,11,0.45)' },
  bad: { bg: 'rgba(239,68,68,0.16)', fg: '#fca5a5', bd: 'rgba(239,68,68,0.45)' },
  unk: { bg: 'rgba(100,116,139,0.22)', fg: '#cbd5e1', bd: 'rgba(100,116,139,0.5)' },
  accent: { bg: 'rgba(139,92,246,0.18)', fg: '#c4b5fd', bd: 'rgba(139,92,246,0.5)' },
};
const MARK_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 32 32"><defs><linearGradient id="gm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#gm)"/><path d="M9 13h4m-2-2v4" stroke="#0b0d14" stroke-width="2.2" stroke-linecap="round"/><circle cx="20" cy="12.5" r="1.6" fill="#0b0d14"/><circle cx="23" cy="15.5" r="1.6" fill="#0b0d14"/><path d="M7 19c0-3 1.5-5 5-5h8c3.5 0 5 2 5 5v1.5c0 2-2.4 2.8-3.8 1.3L19 19.5h-6l-2.2 2.3C9.4 23.3 7 22.5 7 20.5z" fill="none" stroke="#0b0d14" stroke-width="2"/></svg>';
const MARK = 'data:image/svg+xml;base64,' + Buffer.from(MARK_SVG).toString('base64');

const h = (type, style = {}, children = [], props = {}) => ({ type, props: { ...props, style: { display: 'flex', ...style }, children } });
const text = (s, style) => h('div', style, String(s));
const dataUri = (file, mime) => `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;

function hsl2hex(hh, s, l) {
  s /= 100; l /= 100; const k = n => (n + hh / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = n => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))))).toString(16).padStart(2, '0');
  return '#' + f(0) + f(8) + f(4);
}
// logo: { src } (data URI of a stored PNG) or { mono: 'AB', hue }
function logoEl(lg, size) {
  const box = { width: size, height: size, borderRadius: Math.round(size * 0.22), border: `2px solid ${C.line}`, flexShrink: 0, overflow: 'hidden' };
  if (lg.src) return h('div', { ...box, background: 'rgba(255,255,255,0.07)', alignItems: 'center', justifyContent: 'center' }, [h('img', { width: size - 4, height: size - 4, objectFit: 'contain' }, [], { src: lg.src, width: size - 4, height: size - 4 })]);
  return h('div', { ...box, alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: Math.round(size * 0.36), backgroundImage: `linear-gradient(135deg, ${hsl2hex(lg.hue, 70, 45)}, ${hsl2hex((lg.hue + 50) % 360, 70, 35)})` }, lg.mono);
}
const badgeEl = (label, tone = 'accent', size = 30) => { const t = TONES[tone] || TONES.accent; return h('div', { alignItems: 'center', fontSize: size, fontWeight: 600, color: t.fg, background: t.bg, border: `2px solid ${t.bd}`, borderRadius: 999, padding: `${Math.round(size * 0.3)}px ${Math.round(size * 0.75)}px` }, label); };
const brand = () => h('div', { alignItems: 'center', gap: 16 }, [h('img', { width: 52, height: 52 }, [], { src: MARK, width: 52, height: 52 }), h('div', { fontSize: 30, fontWeight: 600, color: C.text }, [text('GameDev ', {}), text('AI Tools', { fontWeight: 800, color: '#c4b5fd', marginLeft: 8 })])]);
const footer = (s = 'gamedevaitools.com · sourced and dated') => h('div', { fontSize: 24, color: C.dim, alignItems: 'center', width: '100%' }, [text(s, {})]);
// Root has no padding (satori sizes padding outside width); an inner box with margins gives the 64/56px safe area.
const PX = 64, PY = 52;
const frame = (content) => h('div', {
  width: W, height: H, color: C.text, fontFamily: 'Inter',
  backgroundColor: C.bg, backgroundImage: 'radial-gradient(circle at 88% -10%, rgba(139,92,246,0.35), rgba(11,13,20,0) 55%), radial-gradient(circle at -5% 110%, rgba(34,211,238,0.18), rgba(11,13,20,0) 50%)',
}, [h('div', { width: W - 2 * PX, height: H - 2 * PY, margin: `${PY}px ${PX}px`, flexDirection: 'column', justifyContent: 'space-between' }, [brand(), h('div', { width: '100%', flexGrow: 1, alignItems: 'center' }, [content]), footer()])]);

const clamp = (s, n) => (s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s);

export function templates(arts) {
  const art = (page, w, hgt) => arts[page] ? h('img', { width: w, height: hgt, flexShrink: 0, borderRadius: 24, objectFit: 'cover', border: `2px solid ${C.line}` }, [], { src: arts[page], width: w, height: hgt }) : null;
  return {
    tool: ({ logo, name, task, badge }) => frame(h('div', { alignItems: 'center', gap: 48, width: '100%' }, [
      logoEl(logo, 200),
      h('div', { flexDirection: 'column', gap: 18, flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }, [
        text(clamp(name, 34), { fontSize: name.length > 22 ? 62 : 76, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05 }),
        text(task, { fontSize: 34, color: C.muted }),
        h('div', { marginTop: 10 }, [badgeEl(badge.label, badge.tone)]),
      ]),
    ])),
    page: ({ kicker, title, sub, artPage, chips = [] }) => frame(h('div', { alignItems: 'center', gap: 48, width: '100%' }, [
      h('div', { flexDirection: 'column', gap: 18, flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }, [
        kicker ? text(kicker, { fontSize: 26, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 2 }) : null,
        text(clamp(title, 90), { fontSize: title.length > 60 ? 52 : title.length > 36 ? 60 : 70, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.08 }),
        sub ? text(clamp(sub, 130), { fontSize: 28, color: C.muted, lineHeight: 1.35 }) : null,
        chips.length ? h('div', { gap: 12, marginTop: 6, flexWrap: 'wrap' }, chips.map(c => badgeEl(c.label, c.tone || 'accent', 24))) : null,
      ].filter(Boolean)),
      artPage ? art(artPage, 400, 300) : null,
    ].filter(Boolean))),
    versus: ({ a, b, kicker }) => frame(h('div', { flexDirection: 'column', alignItems: 'center', gap: 28, width: '100%' }, [
      text(kicker, { fontSize: 26, fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 2 }),
      h('div', { alignItems: 'center', gap: 56 }, [
        h('div', { flexDirection: 'column', alignItems: 'center', gap: 18, width: 420 }, [logoEl(a.logo, 150), text(clamp(a.name, 26), { fontSize: 44, fontWeight: 800, textAlign: 'center' })]),
        text('vs', { fontSize: 44, color: C.dim, fontWeight: 600 }),
        h('div', { flexDirection: 'column', alignItems: 'center', gap: 18, width: 420 }, [logoEl(b.logo, 150), text(clamp(b.name, 26), { fontSize: 44, fontWeight: 800, textAlign: 'center' })]),
      ]),
    ])),
  };
}

export async function createOg({ outDir, logoFor }) {
  let satori, Resvg;
  try { satori = (await import('satori')).default; ({ Resvg } = await import('@resvg/resvg-js')); }
  catch { console.warn('og: satori/@resvg/resvg-js not installed (run npm ci); share images skipped'); return null; }
  const fontDir = 'og/fonts';
  const fonts = [[400, 'Inter-Regular.ttf'], [600, 'Inter-SemiBold.ttf'], [800, 'Inter-ExtraBold.ttf']].map(([weight, f]) => ({ name: 'Inter', weight, style: 'normal', data: fs.readFileSync(path.join(fontDir, f)) }));
  const arts = Object.fromEntries(fs.readdirSync('og/art').filter(f => f.endsWith('.jpg')).map(f => [f.slice(0, -4), dataUri(path.join('og/art', f), 'image/jpeg')]));
  const T = templates(arts);
  const cacheDir = 'node_modules/.cache/og';
  fs.mkdirSync(cacheDir, { recursive: true });
  // Salt covers this file and the category art, so swapping an og/art image re-renders the cards that use it.
  const salt = crypto.createHash('sha1').update(fs.readFileSync(new URL(import.meta.url))).update(Object.values(arts).join('')).digest('hex');
  let rendered = 0, cached = 0;
  const jobs = [];
  return {
    T, logoFor,
    // name: path under dist, e.g. 'og/tools/meshy.png'. Returns the public path.
    add(name, kind, data) { jobs.push([name, kind, data]); return '/' + name; },
    async flush() {
      for (const [name, kind, data] of jobs) {
        const key = crypto.createHash('sha1').update(salt + kind + JSON.stringify(data)).digest('hex');
        const cf = path.join(cacheDir, key + '.png');
        let png;
        if (fs.existsSync(cf)) { png = fs.readFileSync(cf); cached++; }
        else {
          const svg = await satori(T[kind](data), { width: W, height: H, fonts });
          png = new Resvg(svg, { fitTo: { mode: 'width', value: W }, font: { loadSystemFonts: false } }).render().asPng();
          fs.writeFileSync(cf, png); rendered++;
        }
        const f = path.join(outDir, name); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, png);
      }
      console.log(`og: ${jobs.length} share images (${rendered} rendered, ${cached} from cache)`);
    },
  };
}
export const OG_W = W, OG_H = H;
