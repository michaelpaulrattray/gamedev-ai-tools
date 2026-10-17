// POST /api/subscribe: adds an email to the Resend audience. Never sends email.
const { readBody, clean, isEmail, redirect } = require('./_util');
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.end('Method Not Allowed'); }
  const key = process.env.RESEND_API_KEY, audience = process.env.RESEND_AUDIENCE_ID;
  if (!key || !audience) return redirect(res, '/subscribe-error/');
  const b = await readBody(req);
  if (clean(b.company, 200)) return redirect(res, '/subscribed/'); // honeypot: pretend success, store nothing
  const email = clean(b.email, 254).toLowerCase();
  if (!isEmail(email)) return redirect(res, '/subscribe-error/');
  try {
    const r = await fetch(`https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!r.ok && r.status !== 409) { console.error('resend contact create failed', r.status); return redirect(res, '/subscribe-error/'); }
    return redirect(res, '/subscribed/');
  } catch (e) { console.error('resend error', e && e.message); return redirect(res, '/subscribe-error/'); }
};
