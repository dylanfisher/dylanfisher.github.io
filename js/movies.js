(function() {
  var grid = document.getElementById('lists-items');
  if (!grid) return;

  var dialog = document.getElementById('movie-dialog');
  var rowsEl = document.getElementById('movies-rows');
  var cmp    = ListPage.cmp;

  var items = Array.prototype.slice.call(grid.children);
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

  ListPage({
    fields: ['sort', 'director', 'genre', 'decade', 'view', 'rows'],
    defaults: { sort: 'year-desc', view: 'grid' },
    layoutFields: ['sort', 'view', 'rows'],
    storageKey: 'movies-view',
    onFilter: function() { if (dialog.open) dialog.close(); },
    apply: function(s) {
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
      return shown;
    }
  });

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
      if (i) meta.appendChild(document.createTextNode(' · '));
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
