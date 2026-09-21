(function() {
  var grid = document.getElementById('movies-grid');
  if (!grid) return;

  var form     = document.getElementById('movies-toolbar');
  var countEl  = document.getElementById('movies-count').firstElementChild;
  var emptyEl  = document.getElementById('movies-empty');
  var clearEl  = document.getElementById('movies-clear');
  var dialog   = document.getElementById('movie-dialog');

  var items = Array.prototype.slice.call(grid.children);
  var fields = ['sort', 'director', 'genre', 'decade', 'view', 'rows'];
  var defaults = { sort: 'year-desc', view: 'grid' };
  var VIEW_KEY = 'movies-view';
  var layoutFields = ['sort', 'view', 'rows'];
  var filterFields = fields.filter(function(f) { return layoutFields.indexOf(f) === -1; });
  var rowsEl = document.getElementById('movies-rows');

  items.forEach(function(li) {
    li._directors = li.dataset.directors ? li.dataset.directors.split('|') : [];
    li._genres = li.dataset.genres ? li.dataset.genres.split('|') : [];
    li._year = parseInt(li.dataset.year, 10) || 0;
  });

  // Films per director, so the director sort can rank the most-collected
  // directors first. A film with several directors keys on its biggest one.
  var directorCounts = {};
  items.forEach(function(li) {
    li._directors.forEach(function(d) { directorCounts[d] = (directorCounts[d] || 0) + 1; });
  });
  items.forEach(function(li) {
    var best = null;
    li._directors.forEach(function(d) {
      if (!best || directorCounts[d] > directorCounts[best]) best = d;
    });
    li._director = best || '\uffff';   // undirected films sink to the bottom
    li._directorCount = best ? directorCounts[best] : 0;
  });

  // ---- filtering & sorting -------------------------------------------------

  function state() {
    var s = {};
    fields.forEach(function(f) {
      var el = form.elements[f];
      s[f] = el.type === 'checkbox' ? (el.checked ? el.value : '') : el.value;
    });
    return s;
  }

  var sorters = {
    'year-desc': function(a, b) { return b._year - a._year || cmp(a.dataset.sort, b.dataset.sort); },
    'year-asc':  function(a, b) { return a._year - b._year || cmp(a.dataset.sort, b.dataset.sort); },
    'title':     function(a, b) { return cmp(a.dataset.sort, b.dataset.sort) || a._year - b._year; },
    'director':  function(a, b) {
      return b._directorCount - a._directorCount ||
             cmp(a._director, b._director) ||
             a._year - b._year ||
             cmp(a.dataset.sort, b.dataset.sort);
    }
  };

  function cmp(a, b) { return a < b ? -1 : a > b ? 1 : 0; }

  function apply() {
    var s = state();
    var shown = 0;

    items.forEach(function(li) {
      var ok = (!s.director || li._directors.indexOf(s.director) !== -1) &&
               (!s.genre || li._genres.indexOf(s.genre) !== -1) &&
               (!s.decade || li.dataset.decade === s.decade);
      li.hidden = !ok;
      if (ok) shown++;
    });

    items.sort(sorters[s.sort] || sorters['year-desc']);
    items.forEach(function(li) { grid.appendChild(li); });
    groupByDirector(s.sort === 'director');

    grid.classList.toggle('movies-grid--list', s.view === 'list');
    // "Rows" (each director on its own row) only means something in director order.
    rowsEl.hidden = s.sort !== 'director';
    grid.classList.toggle('movies-grid--rows', s.sort === 'director' && !!s.rows);
    try { localStorage.setItem(VIEW_KEY, s.view); } catch (err) {}

    // Highlight the active decade bar in the stats strip.
    Array.prototype.forEach.call(document.querySelectorAll('.movies-stats__link[data-filter="decade"]'), function(b) {
      b.classList.toggle('is-active', b.dataset.value === s.decade);
    });

    countEl.textContent = shown;
    emptyEl.hidden = shown > 0;
    clearEl.hidden = !filterFields.some(function(f) { return s[f]; });
    writeUrl(s);
  }

  // In director order, drop a title card in front of each director's run of
  // visible films. Cards are rebuilt on every apply so filters stay in sync.
  function groupByDirector(on) {
    Array.prototype.forEach.call(grid.querySelectorAll('.movies-group'), function(el) {
      grid.removeChild(el);
    });
    if (!on) return;

    var groups = [];
    items.forEach(function(li) {
      if (li.hidden) return;
      var last = groups[groups.length - 1];
      if (last && last.director === li._director) {
        last.count++;
      } else {
        groups.push({ director: li._director, first: li, count: 1 });
      }
    });

    groups.forEach(function(g) {
      var card = document.createElement('li');
      card.className = 'movies-group monospace';
      var name = document.createElement('span');
      name.className = 'movies-group__name';
      name.textContent = g.director === '\uffff' ? 'Unknown director' : g.director;
      var count = document.createElement('span');
      count.className = 'movies-group__count';
      count.textContent = g.count + (g.count === 1 ? ' film' : ' films');
      card.appendChild(name);
      card.appendChild(count);
      grid.insertBefore(card, g.first);
    });
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
    if (!params.has('view')) {
      try {
        var saved = localStorage.getItem(VIEW_KEY);
        if (saved) form.elements.view.value = saved;
      } catch (err) {}
    }
    if (!form.elements.view.value) form.elements.view.value = defaults.view;
  }

  form.addEventListener('change', apply);
  // The view radios live outside the form (linked via form=""), so their
  // change events don't bubble to it.
  document.getElementById('movies-view').addEventListener('change', apply);
  form.addEventListener('submit', function(e) { e.preventDefault(); });
  clearEl.addEventListener('click', function(e) {
    e.preventDefault();
    var view = form.elements.view.value;
    var rows = form.elements.rows.checked;
    form.reset();
    clearFilters();   // form.reset() skips hidden inputs
    form.elements.view.value = view;   // keep the chosen view
    form.elements.rows.checked = rows;
    apply();
  });

  function clearFilters() {
    filterFields.forEach(function(f) { form.elements[f].value = ''; });
  }

  // Apply a single filter, replacing any others (sort is left alone).
  function setFilter(field, value) {
    var el = form.elements[field];
    if (!el) return;
    clearFilters();
    el.value = value;
    if (el.value !== value) el.value = '';   // option not present
    apply();
  }

  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-filter]');
    if (!btn) return;
    e.preventDefault();
    if (dialog.open) dialog.close();
    setFilter(btn.dataset.filter, btn.dataset.value);
  });

  readUrl();
  apply();

  // ---- detail dialog -------------------------------------------------------

  var hero  = document.getElementById('movie-dialog-hero');
  var title = document.getElementById('movie-dialog-title');
  var meta  = document.getElementById('movie-dialog-meta');
  var text  = document.getElementById('movie-dialog-text');
  var links = document.getElementById('movie-dialog-links');
  var prevBtn = document.getElementById('movie-dialog-prev');
  var nextBtn = document.getElementById('movie-dialog-next');
  var current = null;

  function visibleItems() {
    return items.filter(function(li) { return !li.hidden; });
  }

  function openDialog(li) {
    current = li;
    if (li.dataset.fanart) {
      hero.src = li.dataset.fanart;
      hero.hidden = false;
    } else {
      hero.removeAttribute('src');
      hero.hidden = true;
    }
    title.textContent = li.dataset.title;

    var runtime = parseInt(li.dataset.runtime, 10);
    meta.innerHTML = '';
    var parts = [];
    parts.push([filterLink('decade', li.dataset.decade, li.dataset.year)]);
    if (li._directors.length) {
      parts.push([document.createTextNode('dir. ')].concat(joinNodes(li._directors.map(function(d) {
        return filterLink('director', d, d);
      }))));
    }
    if (runtime) parts.push([document.createTextNode(runtime + ' min')]);
    if (li._genres.length) {
      parts.push(joinNodes(li._genres.map(function(g) { return filterLink('genre', g, g); })));
    }
    if (li.dataset.watched) {
      var w = document.createElement('span');
      w.className = 'movie-dialog__watched';
      w.textContent = 'watched ' + li.dataset.watched;
      parts.push([w]);
    }
    parts.forEach(function(nodes, i) {
      if (i) meta.appendChild(document.createTextNode(' \u00b7 '));
      nodes.forEach(function(n) { meta.appendChild(n); });
    });

    text.innerHTML = '';
    var tpl = li.querySelector('.movie__details');
    if (tpl) text.appendChild(tpl.content.cloneNode(true));

    links.innerHTML = '';
    if (li.dataset.tmdb) {
      var a = document.createElement('a');
      a.href = 'https://www.themoviedb.org/movie/' + li.dataset.tmdb;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = 'TMDB';
      links.appendChild(a);
    }
    if (li.dataset.letterboxd) {
      var lb = document.createElement('a');
      lb.href = li.dataset.letterboxd;
      lb.target = '_blank';
      lb.rel = 'noopener';
      lb.textContent = 'Letterboxd';
      links.appendChild(lb);
    }

    var single = visibleItems().length < 2;
    prevBtn.disabled = single;
    nextBtn.disabled = single;

    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    preloadNeighbours();
  }

  function filterLink(field, value, label) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'movie-dialog__filter';
    b.dataset.filter = field;
    b.dataset.value = value;
    b.textContent = label;
    return b;
  }

  function joinNodes(nodes) {
    var out = [];
    nodes.forEach(function(n, i) {
      if (i) out.push(document.createTextNode(', '));
      out.push(n);
    });
    return out;
  }

  // Warm the browser cache with the prev/next films' fanart so arrowing
  // through the dialog doesn't wait on a 1280px download each time.
  var preloaded = {};
  function preloadNeighbours() {
    var list = visibleItems();
    var i = list.indexOf(current);
    if (i === -1 || list.length < 2) return;
    [list[(i + 1) % list.length], list[(i - 1 + list.length) % list.length]].forEach(function(li) {
      var url = li.dataset.fanart;
      if (!url || preloaded[url]) return;
      preloaded[url] = true;
      var img = new Image();
      img.decoding = 'async';
      img.src = url;
    });
  }

  function step(dir) {
    var list = visibleItems();
    if (list.length < 2 || !current) return;
    var i = list.indexOf(current);
    openDialog(list[(i + dir + list.length) % list.length]);
  }

  prevBtn.addEventListener('click', function() { step(-1); });
  nextBtn.addEventListener('click', function() { step(1); });
  dialog.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  });

  // Grid: the poster is the click target. List: the whole row is.
  grid.addEventListener('click', function(e) {
    var li = e.target.closest('.movie');
    if (!li) return;
    if (e.target.closest('.movie__poster') || grid.classList.contains('movies-grid--list')) {
      openDialog(li);
    }
  });

  dialog.addEventListener('click', function(e) {
    if (e.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', function() {
    hero.removeAttribute('src');
    if (current) {
      var btn = current.querySelector('.movie__poster');
      if (btn) btn.focus();
    }
    current = null;
  });
})();
