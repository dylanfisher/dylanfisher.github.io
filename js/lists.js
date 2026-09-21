// Shared behaviour for the list pages (/movies/, /music/): reads the
// toolbar form, keeps it in sync with the URL, remembers the chosen view,
// wires the Clear button and any [data-filter] button, and updates the
// shown/total count. Each page supplies `apply(state)`, which hides and
// reorders its own items and returns how many are shown.
//
//   var page = ListPage({
//     fields:       ['sort', 'genre', 'view'],   // form field names
//     defaults:     { sort: 'title', view: 'grid' },
//     layoutFields: ['sort', 'view'],            // not filters; Clear leaves them alone
//     storageKey:   'movies-view',               // localStorage key for the view
//     apply:        function(state) { ...; return shown; },
//                   // or { shown: n, noun: 'albums' } to relabel the count
//     onFilter:     function() {}                // before a [data-filter] click applies
//   });
//
// Expects a form with id lists-toolbar; lists-view (control group outside
// the form), lists-count, lists-empty and lists-clear are optional.
window.ListPage = function(opts) {
  var form    = document.getElementById('lists-toolbar');
  var viewEl  = document.getElementById('lists-view');
  var countEl = document.getElementById('lists-count');
  var nounEl  = countEl && countEl.lastElementChild;
  countEl = countEl && countEl.firstElementChild;
  var emptyEl = document.getElementById('lists-empty');
  var clearEl = document.getElementById('lists-clear');

  var fields       = opts.fields;
  var defaults     = opts.defaults || {};
  var layoutFields = opts.layoutFields || [];
  var filterFields = fields.filter(function(f) { return layoutFields.indexOf(f) === -1; });

  function state() {
    var s = {};
    fields.forEach(function(f) {
      var el = form.elements[f];
      s[f] = el.type === 'checkbox' ? (el.checked ? el.value : '') : el.value;
    });
    return s;
  }

  function apply() {
    var s = state();
    var result = opts.apply(s);
    var shown = typeof result === 'number' ? result : result.shown;
    if (nounEl && result.noun) nounEl.textContent = result.noun;

    if (opts.storageKey && s.view !== undefined) {
      try { localStorage.setItem(opts.storageKey, s.view); } catch (err) {}
    }

    // Highlight the active button in the stats strip (decade bar, facet).
    Array.prototype.forEach.call(document.querySelectorAll('.lists-stats__link[data-filter]'), function(b) {
      b.classList.toggle('is-active', !!s[b.dataset.filter] && b.dataset.value === s[b.dataset.filter]);
    });

    if (countEl) countEl.textContent = shown;
    if (emptyEl) emptyEl.hidden = shown > 0;
    if (clearEl) clearEl.hidden = !filterFields.some(function(f) { return s[f]; });
    writeUrl(s);
  }

  function writeUrl(s) {
    var params = new URLSearchParams();
    fields.forEach(function(f) {
      var def = defaults[f] || '';
      if (s[f] && s[f] !== def) params.set(f, s[f]);
    });
    var qs = params.toString();
    history.replaceState(null, '', location.pathname + (qs ? '?' + qs : ''));
  }

  function readUrl() {
    var params = new URLSearchParams(location.search);
    fields.forEach(function(f) {
      if (!params.has(f)) return;
      var el = form.elements[f];
      if (el.type === 'checkbox') el.checked = params.get(f) === el.value;
      else el.value = params.get(f);
    });
    // View isn't a filter, so remember it across visits when the URL is silent.
    var view = form.elements.view;
    if (view && !params.has('view') && opts.storageKey) {
      try {
        var saved = localStorage.getItem(opts.storageKey);
        if (saved) view.value = saved;
      } catch (err) {}
    }
    if (view && !view.value) view.value = defaults.view;
  }

  function clearFilters() {
    filterFields.forEach(function(f) {
      var el = form.elements[f];
      if (el.type === 'checkbox') el.checked = false; else el.value = '';
    });
  }

  // Apply a single filter, replacing any others (layout fields are left alone).
  function setFilter(field, value) {
    var el = form.elements[field];
    if (!el) return;
    clearFilters();
    el.value = value;
    if (el.value !== value) el.value = '';   // option not present
    apply();
  }

  form.addEventListener('change', apply);
  // Text inputs filter as you type.
  var typing = null;
  form.addEventListener('input', function(e) {
    if (e.target.type !== 'search' && e.target.type !== 'text') return;
    clearTimeout(typing);
    typing = setTimeout(apply, 120);
  });
  // The view radios live outside the form (linked via form=""), so their
  // change events don't bubble to it.
  if (viewEl) viewEl.addEventListener('change', apply);
  form.addEventListener('submit', function(e) { e.preventDefault(); });

  if (clearEl) clearEl.addEventListener('click', function(e) {
    e.preventDefault();
    var kept = {};
    layoutFields.forEach(function(f) {
      var el = form.elements[f];
      kept[f] = el.type === 'checkbox' ? el.checked : el.value;
    });
    form.reset();
    clearFilters();   // form.reset() skips hidden inputs
    layoutFields.forEach(function(f) {
      var el = form.elements[f];
      if (el.type === 'checkbox') el.checked = kept[f]; else el.value = kept[f];
    });
    apply();
  });

  function filterFrom(e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    e.preventDefault();
    if (opts.onFilter) opts.onFilter();
    setFilter(btn.dataset.filter, btn.dataset.value);
  }
  document.addEventListener('click', filterFrom);
  // role=button spans don't fire click on Enter/Space like real buttons do.
  document.addEventListener('keydown', function(e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A') return;
    filterFrom(e);
  });

  readUrl();
  apply();

  return { form: form, state: state, apply: apply, setFilter: setFilter };
};

// Plain string comparison for sorters.
window.ListPage.cmp = function(a, b) { return a < b ? -1 : a > b ? 1 : 0; };
