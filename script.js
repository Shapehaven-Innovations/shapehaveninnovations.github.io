document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const body = document.body;

  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    body.setAttribute('data-theme', savedTheme);
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    body.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '☀️';
  }

  // Toggle theme
  themeToggle.addEventListener('click', () => {
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
  });

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
});
