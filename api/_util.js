// Shared helpers for the form endpoints (files starting with _ are not routes).
async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const raw = typeof req.body === 'string' ? req.body : await new Promise((ok) => {
    let d = ''; req.on('data', (c) => { d += c; if (d.length > 20000) req.destroy(); }); req.on('end', () => ok(d));
  });
  try { return JSON.parse(raw); } catch { return Object.fromEntries(new URLSearchParams(raw)); }
}
const clean = (v, max) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const isEmail = (e) => /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/.test(e) && e.length <= 254;
const isUrl = (u) => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch { return false; } };
function redirect(res, location) { res.statusCode = 303; res.setHeader('Location', location); res.setHeader('Cache-Control', 'no-store'); res.end(); }
module.exports = { readBody, clean, isEmail, isUrl, redirect };
