function initPage() {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Sync toggle icon with current theme (already set by inline FOUC script)
  const currentTheme = root.getAttribute('data-theme');
  if (themeToggle) {
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
  }

  // Toggle theme
  if (themeToggle) {
    themeToggle.replaceWith(themeToggle.cloneNode(true)); // remove stale listeners
    const freshToggle = document.getElementById('theme-toggle');
    freshToggle.addEventListener('click', () => {
      const current = root.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      freshToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
  }

  // ─── Domain / email injection from config.js ────────────────────────────────
  if (typeof SITE !== 'undefined') {
    // Update all mailto: href attributes and their visible text
    document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
      a.href = 'mailto:' + SITE.email;
      if (a.textContent.includes('@')) {
        a.textContent = SITE.email;
      }
    });

    // Update bare domain/email text nodes (not inside script/style tags)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const emailPattern = /info@[\w.-]+/g;
    const domainPattern = /shapehaveninnovations\.\w+/g;

    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.tagName === 'SCRIPT' || parent.tagName === 'STYLE') continue;
      let text = node.textContent;
      let updated = text
        .replace(emailPattern, SITE.email)
        .replace(domainPattern, SITE.domain);
      if (updated !== text) node.textContent = updated;
    }
  }
}

document.addEventListener('DOMContentLoaded', initPage);
