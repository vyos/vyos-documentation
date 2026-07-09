/* Version-scoped Pagefind loader. Derives its base from the current URL so the
 * same file works on production, canary, and /pr-<n>/ previews (§9). */
(function (window) {
  'use strict';

  function basePathFor(pathname) {
    var m = pathname.match(/^((\/pr-\d+)?\/[a-z]{2}(?:_[A-Z]{2})?\/[^/]+\/)/);
    if (!m) return null;
    return { base: m[1], prefix: m[2] || '' };
  }

  function prefixResultUrl(url, prefix) {
    return prefix ? prefix + url : url;
  }

  function init() {
    var mount = document.getElementById('vyos-search');
    if (!mount) return;
    var ctx = basePathFor(window.location.pathname);
    if (!ctx) return;
    var s = document.createElement('script');
    s.src = ctx.base + 'pagefind/pagefind-ui.js';
    s.onload = function () {
      /* global PagefindUI */
      new window.PagefindUI({
        element: '#vyos-search',
        baseUrl: ctx.base,
        bundlePath: ctx.base + 'pagefind/',
        processResult: function (result) {
          result.url = prefixResultUrl(result.url, ctx.prefix);
          return result;
        },
      });
    };
    document.head.appendChild(s);
  }

  window.VyOSSearch = { basePathFor: basePathFor, prefixResultUrl: prefixResultUrl, init: init };
  if (typeof document !== 'undefined' && document.addEventListener)
    document.addEventListener('DOMContentLoaded', init);
})(window);
