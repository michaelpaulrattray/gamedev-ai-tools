// POST /api/subscribe: adds an email to the Resend audience, then sends one welcome email (cheat-sheet link + unsubscribe).
// The signup succeeds even if the welcome email fails; the failure is only logged.
const { readBody, clean, isEmail, redirect } = require('./_util');
const { sendWelcome } = require('./_welcome');
// Reserved test domains never deliver, so we don't attempt a welcome email to them (avoids guaranteed bounces).
const RESERVED = /@(?:[^@]+\.)?(example\.(?:com|org|net)|[^@]+\.(?:test|invalid|example|localhost))$/i;
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.end('Method Not Allowed'); }
  const key = process.env.RESEND_API_KEY, audience = process.env.RESEND_AUDIENCE_ID;
  if (process.env.NEWSLETTER_ENABLED !== '1' || !key || !audience) return redirect(res, '/subscribe-error/');
  const b = await readBody(req);
  if (clean(b.company, 200)) return redirect(res, '/subscribed/'); // honeypot: pretend success, store nothing
  const email = clean(b.email, 254).toLowerCase();
  if (!isEmail(email)) return redirect(res, '/subscribe-error/');
  let created = false;
  try {
    const r = await fetch(`https://api.resend.com/audiences/${encodeURIComponent(audience)}/contacts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, unsubscribed: false }),
    });
    if (!r.ok && r.status !== 409) { console.error('resend contact create failed', r.status); return redirect(res, '/subscribe-error/'); }
    created = r.ok;
  } catch (e) { console.error('resend error', e && e.message); return redirect(res, '/subscribe-error/'); }
  // Welcome email: only for a newly created contact (so the form can't be used to re-send it to someone repeatedly).
  if (created && !RESERVED.test(email)) {
    try {
      const w = await sendWelcome(email, key);
      if (!w.ok) console.error('welcome email not sent:', w.reason);
    } catch (e) { console.error('welcome email error', e && e.message); }
  } else if (created) console.log('welcome email skipped: reserved test domain');
  return redirect(res, '/subscribed/');
};
