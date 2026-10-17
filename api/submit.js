// POST /api/submit: tool submission.
// If GITHUB_TOKEN is set (fine-grained, this repo only, Issues: write), creates an issue labelled "submission".
// Otherwise redirects the submitter to a prefilled GitHub "new issue" form (the template applies the label).
const { readBody, clean, isEmail, isUrl, redirect } = require('./_util');
const REPO = 'michaelpaulrattray/gamedev-ai-tools';
module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'POST'); return res.end('Method Not Allowed'); }
  const b = await readBody(req);
  if (clean(b.company, 200)) return redirect(res, '/submit/thanks/'); // honeypot
  const name = clean(b.name, 100), url = clean(b.url, 300), category = clean(b.category, 60);
  const description = clean(b.description, 600), email = clean(b.email, 254);
  if (!name || !isUrl(url) || !category || !description || (email && !isEmail(email))) return redirect(res, '/submit/error/');
  const title = `Tool submission: ${name}`;
  const body = [
    `**Tool name:** ${name}`, `**Official URL:** ${url}`, `**Category:** ${category}`, '',
    '**Description:**', description, '',
    `**Submitter email (shared publicly by the submitter):** ${email || '_not provided_'}`, '',
    '_Submitted via https://gamedevaitools.com/submit/. To be checked against the vendor\'s own pricing and terms pages before listing._',
  ].join('\n');
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    const q = new URLSearchParams({ template: 'tool-submission.md', title, body, labels: 'submission' });
    return redirect(res, `https://github.com/${REPO}/issues/new?${q}`);
  }
  try {
    const r = await fetch(`https://api.github.com/repos/${REPO}/issues`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'User-Agent': 'gamedevaitools-submit', 'X-GitHub-Api-Version': '2022-11-28' },
      body: JSON.stringify({ title, body, labels: ['submission'] }),
    });
    if (!r.ok) { console.error('github issue create failed', r.status); return redirect(res, '/submit/error/'); }
    return redirect(res, '/submit/thanks/');
  } catch (e) { console.error('github error', e && e.message); return redirect(res, '/submit/error/'); }
};
