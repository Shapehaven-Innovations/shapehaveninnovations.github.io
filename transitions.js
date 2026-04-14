(function () {
  function navigate(url) {
    if (!document.startViewTransition) {
      window.location.href = url;
      return;
    }
    document.startViewTransition(() => swapPage(url));
  }

  async function swapPage(url) {
    const res = await fetch(url);
    const html = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    document.title = doc.title;

    // Swap meta tags
    [
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[property="og:description"]',
      'meta[property="og:url"]',
      'meta[name="twitter:card"]',
      'meta[name="twitter:title"]',
      'meta[name="twitter:description"]',
      'meta[name="twitter:image"]',
    ].forEach(selector => {
      const oldEl = document.head.querySelector(selector);
      const newEl = doc.head.querySelector(selector);
      if (oldEl && newEl) oldEl.replaceWith(newEl.cloneNode(true));
      else if (newEl) document.head.appendChild(newEl.cloneNode(true));
    });

    // Swap canonical
    const oldCanon = document.head.querySelector('link[rel="canonical"]');
    const newCanon = doc.head.querySelector('link[rel="canonical"]');
    if (oldCanon && newCanon) oldCanon.replaceWith(newCanon.cloneNode(true));
    else if (newCanon) document.head.appendChild(newCanon.cloneNode(true));

    // Swap main and footer
    const newMain = doc.querySelector('main');
    const newFooter = doc.querySelector('footer');
    if (newMain) document.querySelector('main').replaceWith(newMain);
    if (newFooter) document.querySelector('footer').replaceWith(newFooter);

    history.pushState({}, '', url);
    if (typeof initPage === 'function') initPage();
  }

  document.addEventListener('click', function (e) {
    const a = e.target.closest('a');
    if (!a) return;
    if (a.target === '_blank') return;
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey) return;
    try {
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      e.preventDefault();
      navigate(url.href);
    } catch (_) {}
  });

  window.addEventListener('popstate', function () {
    swapPage(location.href);
  });
})();
