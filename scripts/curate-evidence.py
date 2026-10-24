"""Turn raw research notes (docs/research/<date>-<task>.json) into a scored evidence file (data/evidence/<task>.json)
by applying the rules in docs/ranking-research.md. Run with --dry to print every candidate item and the decision.

  python scripts/curate-evidence.py <task> [--date 2026-10-24] [--dry]

Judgement calls that the rules can't make (which leaderboard row is a service's current default model, which reviews
are stale after a product rebuild) go in scripts/evidence-overrides.json, keyed by task, so they're reviewable:
  {"<task>": {"bench_keep": {"<slug>": ["substring of model/board to keep", ...]},
              "drop_urls": ["..."], "x_posts": {"<slug>": {"pos": 3, "mixed": 2, "neg": 1, "url": "..."}},
              "strengths": {...}, "weaknesses": {...}, "notes": {"<slug>": "..."}, "videos": [...]}}
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
args = [a for a in sys.argv[1:] if not a.startswith('--')]
TASK = args[0]
DATE = next((a.split('=')[1] for a in sys.argv if a.startswith('--date=')), '2026-10-24')
DRY = '--dry' in sys.argv
raw = json.load(open(os.path.join(ROOT, 'docs/research', f'{DATE}-{TASK}.json'), encoding='utf-8'))
OV = json.load(open(os.path.join(ROOT, 'scripts/evidence-overrides.json'), encoding='utf-8')).get(TASK, {}) if os.path.exists(os.path.join(ROOT, 'scripts/evidence-overrides.json')) else {}
TOOLS = {t['slug'] for t in json.load(open(os.path.join(ROOT, 'data/tools.json'), encoding='utf-8'))}

# Only an explicit "DO NOT SCORE" in the agent's note drops an item; everything else rests on the structured flags.
NO_SCORE = re.compile(r'do not score', re.I)
num = lambda v: v if isinstance(v, (int, float)) and not isinstance(v, bool) else None
def count_of(v):
    if isinstance(v, (int, float)): return int(v)
    m = re.sub(r'[^\d]', '', str(v or '')); return int(m) if m else 0
log = []
def decide(slug, kind, label, ok, why):
    if ok and any(k.lower() in label.lower() for k in OV.get('drop', {}).get(slug, [])): ok, why = False, 'override: dropped for this tool'
    log.append(f"  {'KEEP' if ok else 'drop'} {kind:7} {slug:22} {label[:95]}  ({why})")
    return ok

def bench_items(slug, t):
    out, best = [], {}
    keep = OV.get('bench_keep', {}).get(slug)
    for b in t.get('benchmarks', []) or []:
        rank, n = num(b.get('rank')), num(b.get('out_of') or b.get('board_size'))
        model = str(b.get('model_version') or b.get('model') or '')
        board = str(b.get('board') or b.get('metric') or '')
        src = str(b.get('source', ''))
        label = f"{src.split('(')[0].strip()} | {board} | {model} #{rank}/{n}"
        reasons = []
        if b.get('verified') is not True: reasons.append('unverified')
        if b.get('independent') is False: reasons.append('not independent')
        if b.get('use_for_score') is False: reasons.append('agent: use_for_score false')
        if not (rank and n and n > 1): reasons.append('no rank/size')
        if NO_SCORE.search(str(b.get('note', ''))) and not keep: reasons.append('note says not to score')
        if keep and not any(k.lower() in (model + ' ' + board).lower() for k in keep): reasons.append('override: not a kept model')
        if b.get('url') in OV.get('drop_urls', []): reasons.append('override: dropped')
        if not decide(slug, 'bench', label, not reasons, ', '.join(reasons) or 'ok'): continue
        score = round(100 * (n - rank) / (n - 1), 1)
        key = (src.split('(')[0].strip(), board)
        if key not in best or score > best[key]['score']:
            best[key] = {'source': src.split('(')[0].strip() or 'Leaderboard', 'url': b['url'], 'detail': f"{board}: {model} #{int(rank)} of {int(n)}".strip(': '), 'score': score}
    return list(best.values())

def review_items(slug, t):
    out = []
    for r in t.get('reviews', []) or []:
        rating = num(r.get('rating'))
        label = f"{r.get('outlet', '')} {r.get('date', '')} rating={rating}"
        reasons = []
        if r.get('independent') is not True: reasons.append(f"independent={r.get('independent')}")
        if r.get('verified') is not True: reasons.append('unverified')
        if rating is None: reasons.append('no rating')
        if r.get('hands_on') is False: reasons.append('not hands-on')
        if r.get('score_recommended') is False: reasons.append('agent: do not score')
        if NO_SCORE.search(str(r.get('note', ''))): reasons.append('note says not to score')
        if r.get('url') in OV.get('drop_urls', []): reasons.append('override: dropped')
        if decide(slug, 'review', label, not reasons, ', '.join(reasons) or 'ok'):
            out.append({'source': str(r.get('outlet', 'Review')).split(' (')[0], 'url': r['url'], 'date': r.get('date'), 'summary': r.get('summary', ''), 'score': rating})
    return out

def user_items(slug, t):
    out, u = [], t.get('users') or {}
    for r in (u.get('ratings', []) if isinstance(u, dict) else []):
        rating, scale, n = num(r.get('rating')), num(r.get('scale')) or 5, count_of(r.get('count'))
        site = r.get('platform') or r.get('site') or re.sub(r'https?://(www\.)?', '', str(r.get('url', ''))).split('.')[0].capitalize()
        label = f"{site} {rating}/{scale} n={n}"
        reasons = []
        if r.get('verified') is not True: reasons.append('unverified')
        if rating is None: reasons.append('no rating')
        if n < 25: reasons.append('under 25 reviews')
        if not r.get('url'): reasons.append('no url')
        if re.search(r'company-wide|whole (company|product)|not (about|specific)|covers (all|the whole)|mobile app|not scor|do not score', str(r.get('note', '')), re.I): reasons.append('not specific to this job/product')
        if r.get('url') in OV.get('keep_urls', []): reasons = [x for x in reasons if x == 'unverified' or x == 'under 25 reviews' or x == 'no rating']
        if r.get('url') in OV.get('drop_urls', []): reasons.append('override: dropped')
        if decide(slug, 'rating', label, not reasons, ', '.join(reasons) or 'ok'):
            out.append({'source': site, 'url': r['url'], 'detail': f"{rating}/{int(scale)} from {n:,} reviews", 'score': round((rating - 1) / (scale - 1) * 100, 1)})
    ms = [m for m in (u.get('mentions', []) if isinstance(u, dict) else []) if m.get('sentiment') in ('pos', 'mixed', 'neg') and m.get('url')]
    if len(ms) >= 3:
        c = {k: sum(1 for m in ms if m['sentiment'] == k) for k in ('pos', 'mixed', 'neg')}
        decide(slug, 'threads', f"{len(ms)} threads {c}", True, 'ok')
        out.append({'source': f'Community threads ({len(ms)} read)', 'url': ms[0]['url'], 'detail': f"{c['pos']} positive, {c['mixed']} mixed, {c['neg']} negative", 'score': round((100 * c['pos'] + 50 * c['mixed']) / len(ms), 1)})
    elif ms: decide(slug, 'threads', f"{len(ms)} threads", False, 'under 3')
    x = OV.get('x_posts', {}).get(slug)
    if x and x['pos'] + x['mixed'] + x['neg'] >= 3:
        n = x['pos'] + x['mixed'] + x['neg']
        out.append({'source': f'X posts ({n} read)', 'url': x['url'], 'detail': f"{x['pos']} positive, {x['mixed']} mixed, {x['neg']} negative", 'score': round((100 * x['pos'] + 50 * x['mixed']) / n, 1)})
    return out

ev = {'task': TASK, 'checked': raw.get('checked', DATE), 'tools': {}}
# users_from: product-level user evidence (review sites, X) already scored for the same tools in another job.
UF = {}
if OV.get('users_from'):
    UF = json.load(open(os.path.join(ROOT, 'data/evidence', OV['users_from'] + '.json'), encoding='utf-8'))['tools']
for slug in OV.get('bench_add', {}):
    raw['tools'].setdefault(slug, {})
for slug, t in raw['tools'].items():
    if slug not in TOOLS: log.append(f'  skip {slug} (not in tools.json)'); continue
    e = {'bench': bench_items(slug, t) + OV.get('bench_add', {}).get(slug, []), 'reviews': review_items(slug, t), 'users': user_items(slug, t) + (UF.get(slug, {}).get('users', []) if slug in OV.get('users_from_tools', []) else []),
         'vendorClaims': [{'text': c.get('claim') or c.get('text', ''), 'url': c['url']} for c in t.get('vendor_claims', []) or [] if c.get('url')][:4],
         'strengths': OV.get('strengths', {}).get(slug, t.get('strengths', []) or [])[:3],
         'weaknesses': OV.get('weaknesses', {}).get(slug, t.get('weaknesses', []) or [])[:3], 'examples': []}
    if not (e['bench'] or e['reviews'] or e['users']): e['strengths'], e['weaknesses'] = [], []
    if OV.get('notes', {}).get(slug): e['note'] = OV['notes'][slug]
    ev['tools'][slug] = e
if OV.get('videos'): ev['videos'] = OV['videos']
if raw.get('missing_tools'): ev['notes'] = 'Missing tools to consider: ' + ', '.join(m.get('name', '') for m in raw['missing_tools'][:8] if m.get('name'))
print(f'== {TASK}'); print('\n'.join(log))
for s, e in ev['tools'].items():
    print(f"  -> {s:22} bench {[x['score'] for x in e['bench']]} rev {[x['score'] for x in e['reviews']]} users {[x['score'] for x in e['users']]}")
if not DRY:
    p = os.path.join(ROOT, 'data/evidence', f'{TASK}.json')
    open(p, 'w', encoding='utf-8', newline='').write(json.dumps(ev, indent=1, ensure_ascii=False).replace('\n', '\r\n') + '\r\n')
    print('wrote', p)
