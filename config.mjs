// Site-wide settings that change without a code change elsewhere.
// Sponsor spots (Mike approved the 4-spot lineup on 2026-10-17). /sponsor/, llms.txt and /about/ read this list.
// paymentUrl: the spot's Stripe Payment Link (Webshark account, live; created 2026-10-17, IDs in OPERATIONS.md). Each
// redirects to /sponsor/?paid=1 after payment. If a paymentUrl is emptied, /sponsor/ falls back to "Book by email".
// The old US$79/week link is deactivated (price changed); its value is noted in OPERATIONS.md only. Bookings: data/sponsor.json.
export const SPONSOR_OFFERS = [
  { id: 'sitewide', name: 'Site-wide sponsor', price: 'US$99/week', unit: 'week', slots: 1,
    where: 'The strip across the top of every page, the sponsored card on the homepage, and a small sponsored card in the right-hand margin on wide screens.',
    gets: 'Your logo, name and link, plus one optional line, on every page for 7 days.', paymentUrl: 'https://buy.stripe.com/9B6fZh0a31mlbxhf5g4Vy01' },
  { id: 'category', name: 'Category sponsor', price: 'US$29/week', unit: 'week', slots: 12, slotNote: 'one per category',
    where: 'A sponsored card at the end of one category\'s tool grid (for example 3D models or Voice & dialogue).',
    gets: 'Your logo, name, link and one optional line in front of game devs choosing a tool for that job, for 7 days.', paymentUrl: 'https://buy.stripe.com/6oUbJ15un9SR58Tf5g4Vy02' },
  { id: 'engine', name: 'Engine page sponsor', price: 'US$29/week', unit: 'week', slots: 5, slotNote: 'one per engine page: Unity, Unreal, Godot, Blender, Roblox',
    where: 'A sponsored card on one engine page, below its tool list.',
    gets: 'Your logo, name, link and one optional line in front of devs working in that engine, for 7 days.', paymentUrl: 'https://buy.stripe.com/dRm9AT8Gz5CB44Pe1c4Vy03' },
  { id: 'newsletter', name: 'Newsletter sponsor', price: 'US$49/issue', unit: 'issue', slots: 1, slotNote: 'one per issue',
    where: 'A labelled sponsor line in one issue of our weekly newsletter.',
    gets: 'Your name, link and one short line in one issue.', paymentUrl: 'https://buy.stripe.com/14AfZhcWP3utbxhcX84Vy04' },
];
export const BUSINESS_EMAIL = 'hello@gamedevaitools.com';
export const AFFILIATE_NOTE = 'Some links earn us a commission. It never changes our listings.';
