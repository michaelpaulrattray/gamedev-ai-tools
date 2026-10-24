// "Listed on" and "Ranked" badges for listed tools to embed on their sites. Rendered with satori so the text is
// converted to paths: the SVG looks identical everywhere, with no font loading on the host page.
import fs from 'node:fs';
import satori from 'satori';

const FONTS = [
  { name: 'Inter', data: fs.readFileSync('og/fonts/Inter-SemiBold.ttf'), weight: 600, style: 'normal' },
  { name: 'Inter', data: fs.readFileSync('og/fonts/Inter-ExtraBold.ttf'), weight: 800, style: 'normal' },
];
// Brand mark: isometric cube (a game asset) with its top face lit violet, in a circle. Shared with build.mjs and og.mjs.
export const markSvg = ({ ring = '#ffffff', ink = '#101014', lit = '#7c5cf0', size = 32 } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="${ring}"/><g transform="translate(3.2 3.2) scale(.8)"><path d="M16 4.5 26 10.25 16 16 6 10.25Z" fill="${lit}"/><path d="M16 4.5 26 10.25V21.75L16 27.5 6 21.75V10.25ZM6 10.25 16 16 26 10.25M16 16V27.5" fill="none" stroke="${ink}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></g></svg>`;
const dataUri = svg => 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');

const THEMES = {
  dark: { bg: '#101014', border: 'rgba(255,255,255,0.16)', text: '#ffffff', muted: '#a8a8b3', pillBg: '#a78bfa', pillFg: '#101014', mark: markSvg() },
  light: { bg: '#ffffff', border: '#dcdce4', text: '#101014', muted: '#5b5b66', pillBg: '#6d4fe0', pillFg: '#ffffff', mark: markSvg({ ring: '#101014', ink: '#ffffff', lit: '#a78bfa' }) },
};
const h = (type, style, children = [], props = {}) => ({ type, props: { style: { display: 'flex', ...style }, children, ...props } });

export const LISTED = { w: 216, h: 48 };
export const RANKED = { w: 300, h: 48 };

async function render(w, hgt, theme, kicker, main) {
  const t = THEMES[theme];
  const el = h('div', { width: w, height: hgt, alignItems: 'center', gap: 11, padding: '0 14px 0 9px', background: t.bg, border: `1px solid ${t.border}`, borderRadius: 12, fontFamily: 'Inter' }, [
    h('img', { width: 30, height: 30 }, [], { src: dataUri(t.mark), width: 30, height: 30 }),
    h('div', { flexDirection: 'column', justifyContent: 'center', gap: 2 }, [
      h('div', { fontSize: 9.5, fontWeight: 600, letterSpacing: 1.1, color: t.muted }, kicker),
      h('div', { alignItems: 'center', gap: 6, fontSize: 14.5, fontWeight: 800, letterSpacing: 0.2, color: t.text }, main(t)),
    ]),
  ]);
  // Inline the mark (satori embeds it as a nested data-URI <image>, which some renderers skip).
  const svg = await satori(el, { width: w, height: hgt, fonts: FONTS });
  return svg.replace(/<image x="([\d.]+)" y="([\d.]+)" width="([\d.]+)" height="([\d.]+)"[^>]*\/>/, (m, x, y, iw, ih) =>
    t.mark.replace(/<svg [^>]*>/, `<svg x="${x}" y="${y}" width="${iw}" height="${ih}" viewBox="0 0 32 32">`));
}
const withTitle = (svg, title) => svg.replace(/^<svg /, `<svg role="img" aria-label="${title.replace(/"/g, '&quot;')}" `).replace(/(<svg[^>]*>)/, `$1<title>${title.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</title>`);

export async function listedBadge(theme) {
  return withTitle(await render(LISTED.w, LISTED.h, theme, 'LISTED ON', () => 'GAMEDEV AI TOOLS'), 'Listed on GameDev AI Tools');
}
// rank: { n, joint, label } e.g. { n: 1, joint: true, label: '3D model generation' }
export async function rankedBadge(theme, { n, joint, label }) {
  const pill = t => h('div', { padding: '2px 7px', borderRadius: 999, background: t.pillBg, color: t.pillFg, fontSize: 12, fontWeight: 800 }, `${joint ? 'Joint ' : ''}#${n}`);
  const short = label.length > 26 ? label.slice(0, 25).replace(/[\s&,]+\S*$/, '') + '…' : label;
  return withTitle(await render(RANKED.w, RANKED.h, theme, 'GAMEDEV AI TOOLS RANKING', t => [pill(t), h('div', {}, short)]), `${joint ? 'Joint ' : ''}#${n} in ${label} on GameDev AI Tools`);
}
