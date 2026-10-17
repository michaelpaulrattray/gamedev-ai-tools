// Site-wide settings that change without a code change elsewhere.
// Sponsor checkout: Stripe Payment Link (Webshark account, approved by Mike 2026-10-17). After payment Stripe redirects to /sponsor/?paid=1.
// Fallback if the link is ever disabled: 'mailto:hello@gamedevaitools.com?subject=Sponsor%20slot'
export const SPONSOR_PAYMENT_URL = 'https://buy.stripe.com/cNi6oH9KDaWV44P7CO4Vy00';
// Current weekly sponsor price (change here when the price tier changes; the sponsor card, /sponsor/ page and llms.txt read it).
export const SPONSOR_PRICE = 'US$79/week';
export const SPONSOR_OFFER = `For 7 days, your logo and link sit in the sponsored card on the homepage and every category page, and in the strip across the top of every page. You also get a mention in the next newsletter. ${SPONSOR_PRICE}.`;
export const BUSINESS_EMAIL = 'hello@gamedevaitools.com';
export const AFFILIATE_NOTE = 'Some links earn us a commission. It never changes our listings.';
