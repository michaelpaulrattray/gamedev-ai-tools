// Welcome email with the cheat-sheet link, sender identification and an unsubscribe link.
const { SITE_ORIGIN, FROM, REPLY_TO, SENDER_LINE } = require('./_config');
const { link } = require('./_unsub');
const escH = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function build(email) {
  const unsub = link(email);
  if (!unsub) return null;
  const sheet = `${SITE_ORIGIN}/cheat-sheet/`;
  const subject = 'Your cheat sheet: AI tools you can legally ship in a paid game';
  const text = `Thanks for subscribing to GameDev AI Tools.

Here's the cheat sheet you asked for: for every AI tool we list, whether free-plan output can go in a commercial game, which plan you need, and the catch, with links to each vendor's terms and the date we checked them.

${sheet}

Licences change, so check the vendor's current terms before you ship. If you spot something out of date, reply to this email.

From now on we'll send a weekly newsletter about new tools and licence changes. Nothing else.

--
${SENDER_LINE}
${SITE_ORIGIN}
You're getting this because ${email} signed up at gamedevaitools.com.
Unsubscribe: ${unsub}
`;
  const html = `<div style="font-family:system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#111;max-width:560px">
<p>Thanks for subscribing to GameDev AI Tools.</p>
<p>Here's the cheat sheet you asked for: for every AI tool we list, whether free-plan output can go in a commercial game, which plan you need, and the catch, with links to each vendor's terms and the date we checked them.</p>
<p><a href="${sheet}" style="color:#6d28d9;font-weight:600">AI tools you can legally ship in a paid game</a></p>
<p>Licences change, so check the vendor's current terms before you ship. If you spot something out of date, reply to this email.</p>
<p>From now on we'll send a weekly newsletter about new tools and licence changes. Nothing else.</p>
<hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
<p style="font-size:13px;color:#555">${escH(SENDER_LINE)} · <a href="${SITE_ORIGIN}" style="color:#555">gamedevaitools.com</a><br>
You're getting this because ${escH(email)} signed up at gamedevaitools.com.<br>
<a href="${escH(unsub)}" style="color:#555">Unsubscribe</a></p>
</div>`;
  return {
    from: FROM, to: [email], reply_to: REPLY_TO, subject, text, html,
    headers: { 'List-Unsubscribe': `<${unsub}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  };
}
async function sendWelcome(email, key) {
  const payload = build(email);
  if (!payload) return { ok: false, reason: 'no-unsubscribe-key' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(6000),
  });
  if (!r.ok) { let m = ''; try { m = (await r.json()).message || ''; } catch {} return { ok: false, reason: `resend ${r.status} ${m}`.slice(0, 200) }; }
  return { ok: true };
}
module.exports = { sendWelcome, build };
