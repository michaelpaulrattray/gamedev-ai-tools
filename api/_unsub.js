// Signed unsubscribe links: /api/unsubscribe?e=<base64url email>&t=<HMAC-SHA256>.
// Key: UNSUBSCRIBE_SECRET if set, otherwise derived from RESEND_API_KEY (so links keep working if the secret is missing,
// but rotating the Resend key would then invalidate old links).
const crypto = require('crypto');
const { SITE_ORIGIN } = require('./_config');
function key() {
  const s = process.env.UNSUBSCRIBE_SECRET;
  if (s) return s;
  if (!process.env.RESEND_API_KEY) return null;
  return crypto.createHash('sha256').update('gdat-unsub-v1:' + process.env.RESEND_API_KEY).digest('hex');
}
const b64u = (buf) => Buffer.from(buf).toString('base64url');
function sign(email) { const k = key(); return k ? crypto.createHmac('sha256', k).update(email.toLowerCase()).digest('base64url') : null; }
function link(email) { const t = sign(email); return t ? `${SITE_ORIGIN}/api/unsubscribe/?e=${b64u(email.toLowerCase())}&t=${t}` : null; }
function verify(e, t) {
  try {
    const email = Buffer.from(String(e || ''), 'base64url').toString('utf8').toLowerCase();
    const want = sign(email);
    if (!email || !want || typeof t !== 'string') return null;
    const a = Buffer.from(want), b = Buffer.from(t);
    return a.length === b.length && crypto.timingSafeEqual(a, b) ? email : null;
  } catch { return null; }
}
module.exports = { link, verify };
