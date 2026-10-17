// Sponsor bookings (data/sponsor.json), shared by build.mjs and any newsletter script.
// Format: { "bookings": [ { "slot": "sitewide" | "category:<page>" | "engine:<page>" | "newsletter",
//   "name", "url", "logo"?, "line"?, "start": "YYYY-MM-DD", "end": "YYYY-MM-DD", "paid": true } ] }
// Dates are AEST (Australia/Brisbane), inclusive, compared with the build date. Only "paid": true bookings with name + url
// ever render. Legacy single-booking files ({ name, url, ... } with no "bookings") are read as one "sitewide" booking; {} = none.
// Sponsors never change rankings, order, counts, filters, verdicts or JSON-LD lists.
import fs from 'node:fs';

export function loadBookings(file = 'data/sponsor.json') {
  const raw = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (Array.isArray(raw.bookings)) return raw.bookings;
  if (raw && raw.name && raw.url) return [{ slot: 'sitewide', ...raw, paid: raw.paid !== false }];
  return [];
}

const live = (b, day) => b && b.slot && b.name && b.url && b.paid === true && !(b.end && b.end < day) && !(b.start && b.start > day);
const overlaps = (a, b) => (a.start || '0000') <= (b.end || '9999') && (b.start || '0000') <= (a.end || '9999');

// Checks every booking. Returns { active: Map(slot -> booking), errors: [...] }. Overlap = two paid bookings for one
// slot whose date ranges intersect (any dates, not only today), so a double booking fails before it goes live.
export function resolveBookings(bookings, day, { validSlots } = {}) {
  const errors = [];
  const paid = bookings.filter(b => b && b.paid === true);
  for (const b of paid) {
    if (!b.slot || !b.name || !b.url) errors.push(`booking missing slot/name/url: ${JSON.stringify(b)}`);
    else if (validSlots && !validSlots.has(b.slot)) errors.push(`unknown slot "${b.slot}" (${b.name})`);
    if (b.start && b.end && b.end < b.start) errors.push(`end before start: ${b.slot} ${b.name}`);
  }
  for (let i = 0; i < paid.length; i++) for (let j = i + 1; j < paid.length; j++) {
    const a = paid[i], b = paid[j];
    if (a.slot === b.slot && overlaps(a, b)) errors.push(`overlapping bookings for slot "${a.slot}": ${a.name} (${a.start}–${a.end}) and ${b.name} (${b.start}–${b.end})`);
  }
  const active = new Map();
  for (const b of paid) if (live(b, day) && !active.has(b.slot)) active.set(b.slot, b);
  return { active, errors };
}

// For the newsletter: the paid newsletter booking whose start–end covers the issue date (YYYY-MM-DD, AEST), or null.
export function newsletterSponsor(issueDate, file) {
  const { active } = resolveBookings(loadBookings(file), issueDate);
  return active.get('newsletter') || null;
}
