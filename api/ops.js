// Operator-only checks, guarded by the OPS_TOKEN env var (Authorization: Bearer <token>). Returns 404 without it.
// GET  ?action=domain                       -> Resend status and DNS records for news.gamedevaitools.com
// GET  ?action=contact&email=x@example.com  -> whether a test contact exists and is unsubscribed
// POST ?action=delete-contact&email=x@example.com -> delete a test contact (reserved example.* addresses only)
const crypto = require('crypto');
const { NEWS_DOMAIN } = require('./_config');
const TEST_ONLY = /@example\.(com|org|net)$/i;
function authed(req) {
  const want = process.env.OPS_TOKEN, got = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!want || !got) return false;
  const a = crypto.createHash('sha256').update(want).digest(), b = crypto.createHash('sha256').update(got).digest();
  return crypto.timingSafeEqual(a, b);
}
const json = (res, code, o) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(o, null, 1)); };
module.exports = async (req, res) => {
  if (!authed(req)) { res.statusCode = 404; return res.end('Not Found'); }
  const key = process.env.RESEND_API_KEY, audience = process.env.RESEND_AUDIENCE_ID;
  const H = { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
  const q = new URL(req.url, 'https://x').searchParams, action = q.get('action'), email = String(q.get('email') || '').toLowerCase();
  try {
    if (action === 'domain' && req.method === 'GET') {
      const l = await fetch('https://api.resend.com/domains', { headers: H }); const lj = await l.json();
      if (!l.ok) return json(res, 502, { error: 'list domains failed', status: l.status, message: lj.message });
      const d = (lj.data || []).find((x) => x.name === NEWS_DOMAIN);
      if (!d) return json(res, 200, { found: false, domains: (lj.data || []).map((x) => ({ name: x.name, status: x.status })) });
      const g = await fetch(`https://api.resend.com/domains/${d.id}`, { headers: H }); const gj = await g.json();
      return json(res, 200, { found: true, name: gj.name, status: gj.status, region: gj.region, records: gj.records });
    }
    if (!TEST_ONLY.test(email)) return json(res, 400, { error: 'test addresses at example.com/org/net only' });
    const url = `https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts/${encodeURIComponent(email)}`;
    if (action === 'contact' && req.method === 'GET') {
      const r = await fetch(url, { headers: H }); const j = await r.json().catch(() => ({}));
      return json(res, 200, { status: r.status, exists: r.ok, unsubscribed: r.ok ? j.unsubscribed : null });
    }
    if (action === 'delete-contact' && req.method === 'POST') {
      const r = await fetch(url, { method: 'DELETE', headers: H });
      return json(res, 200, { status: r.status, deleted: r.ok });
    }
    return json(res, 400, { error: 'unknown action' });
  } catch (e) { return json(res, 500, { error: e && e.message }); }
};
