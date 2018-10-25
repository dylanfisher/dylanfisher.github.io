(function() {
  var documentHost = document.location.href.split('/')[2];

  var isExternalLink = function(el) {
    var link = el.getAttribute('href');
    var linkHost = link.split('/')[2];

    return linkHost != documentHost && !link.indexOf('mailto:').length;
  };

  var links = document.getElementsByTagName('a');

  for (var i = links.length - 1; i >= 0; i--) {
    if ( isExternalLink(links[i]) ) {
      links[i].classList.add('link--external');
      links[i].setAttribute('target', '_blank');
    }
  }
})();
