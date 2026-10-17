(function () {
  var T = window.TOOLS || [];
  var $ = function (id) { return document.getElementById(id); };
  var q = $('q'), ft = $('f-task'), fe = $('f-engine'), fp = $('f-pricing'), fc = $('f-commercial');
  var cards = {};
  document.querySelectorAll('#results .card').forEach(function (c) { cards[c.dataset.slug] = c; });
  var params = new URLSearchParams(location.search);
  q.value = params.get('q') || '';
  ft.value = params.get('task') || ''; fe.value = params.get('engine') || '';
  fp.value = params.get('pricing') || ''; fc.value = params.get('commercial') || '';
  function apply() {
    var terms = q.value.toLowerCase().trim().split(/\s+/).filter(Boolean), n = 0;
    T.forEach(function (t) {
      var hay = (t.name + ' ' + t.summary + ' ' + t.tasks.join(' ') + ' ' + t.engines.join(' ')).toLowerCase();
      var ok = terms.every(function (w) { return hay.indexOf(w) !== -1; }) &&
        (!ft.value || t.tasks.indexOf(ft.value) !== -1) &&
        (!fe.value || t.engines.indexOf(fe.value) !== -1) &&
        (!fp.value || t.free === fp.value) &&
        (!fc.value || (fc.value === 'check' ? (t.commercial === 'restricted' || t.commercial === 'unverified') : t.commercial === fc.value));
      if (cards[t.slug]) cards[t.slug].hidden = !ok;
      if (ok) n++;
    });
    $('count').textContent = n + (n === 1 ? ' tool' : ' tools');
    var p = new URLSearchParams();
    if (q.value) p.set('q', q.value); if (ft.value) p.set('task', ft.value); if (fe.value) p.set('engine', fe.value);
    if (fp.value) p.set('pricing', fp.value); if (fc.value) p.set('commercial', fc.value);
    history.replaceState(null, '', location.pathname + (p.toString() ? '?' + p : ''));
  }
  [q, ft, fe, fp, fc].forEach(function (el) { el.addEventListener('input', apply); el.addEventListener('change', apply); });
  $('reset').addEventListener('click', function () { q.value = ft.value = fe.value = fp.value = fc.value = ''; apply(); });
  apply();
})();
