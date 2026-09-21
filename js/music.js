(function() {
  var list = document.getElementById('lists-items');
  if (!list) return;

  var artists = Array.prototype.slice.call(list.children);
  artists.forEach(function(li) {
    li._albums = Array.prototype.slice.call(li.querySelectorAll('.album'));
    li._albums.forEach(function(al) { al._tagged = al.classList.contains('album--tagged'); });
  });

  // Artists are already in A–Z order from the generator. Controls: the
  // Albums/Artists view, the Tagged toggle, and the artist filter set by
  // the "Most Collected" buttons.
  ListPage({
    fields: ['artist', 'tagged', 'view'],
    defaults: { view: 'names' },
    layoutFields: ['view'],
    storageKey: 'music-view',
    apply: function(s) {
      var shown = 0, albumsShown = 0;
      artists.forEach(function(li) {
        var any = false;
        var mine = !s.artist || li.dataset.slug === s.artist;
        li._albums.forEach(function(al) {
          var ok = !s.tagged || al._tagged;
          al.hidden = !ok;
          if (ok) any = true;
          if (ok && mine) albumsShown++;
        });
        // Artists without album folders only show when nothing is filtering.
        var ok = (any || (!li._albums.length && !s.tagged)) && mine;
        li.hidden = !ok;
        if (ok) shown++;
      });
      // A single artist always shows their albums in full-width rows,
      // whatever the view says.
      var names = s.view === 'names' && !s.artist;
      list.classList.toggle('music-artists--names', names);
      list.classList.toggle('music-artists--single', !!s.artist);
      // Count what's on screen: artists in the names view, albums otherwise.
      return names ? { shown: shown, noun: 'artists' } : { shown: albumsShown, noun: 'albums' };
    }
  });
})();
