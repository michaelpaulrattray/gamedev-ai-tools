// /api/unsubscribe?e=...&t=...  GET shows a one-button confirmation (so link scanners can't unsubscribe people);
// POST (the button, or RFC 8058 one-click from the List-Unsubscribe header) sets unsubscribed=true on the Resend contact.
const { readBody, redirect } = require('./_util');
const { verify } = require('./_unsub');
const escH = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
module.exports = async (req, res) => {
  const q = new URL(req.url, 'https://gamedevaitools.com').searchParams;
  if (req.method === 'GET' || req.method === 'HEAD') {
    const e = q.get('e') || '', t = q.get('t') || '';
    const email = verify(e, t);
    if (!email) return redirect(res, '/unsubscribe-error/');
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    return res.end(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Unsubscribe | GameDev AI Tools</title><link rel="stylesheet" href="/assets/style.css"></head>
<body><main class="wrap" style="padding:48px 20px"><h1>Unsubscribe</h1><p>Stop all emails from GameDev AI Tools to <strong>${escH(email)}</strong>?</p>
<form method="post" action="/api/unsubscribe/?e=${escH(e)}&amp;t=${escH(t)}"><button class="btn" type="submit">Unsubscribe</button></form>
<p class="note">GameDev AI Tools, Brisbane, Australia · <a href="/">gamedevaitools.com</a></p></main></body></html>`);
  }
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'GET, POST'); return res.end('Method Not Allowed'); }
  const b = await readBody(req).catch(() => ({}));
  const email = verify(q.get('e') || b.e, q.get('t') || b.t);
  if (!email) return redirect(res, '/unsubscribe-error/');
  const key = process.env.RESEND_API_KEY, audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) return redirect(res, '/unsubscribe-error/');
  try {
    const r = await fetch(`https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts/${encodeURIComponent(email)}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ unsubscribed: true }),
    });
    // 404: no such contact, so there is nothing left to email. Treat as done.
    if (!r.ok && r.status !== 404) { console.error('resend unsubscribe failed', r.status); return redirect(res, '/unsubscribe-error/'); }
    return redirect(res, '/unsubscribed/');
  } catch (e) { console.error('resend unsubscribe error', e && e.message); return redirect(res, '/unsubscribe-error/'); }
};
