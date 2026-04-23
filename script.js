const MOON_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
const SUN_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function initPage() {
  const themeToggle = document.getElementById('theme-toggle');
  const root = document.documentElement;

  // Sync toggle icon with current theme (already set by inline FOUC script)
  const currentTheme = root.getAttribute('data-theme');
  if (themeToggle) {
    themeToggle.innerHTML = currentTheme === 'dark' ? SUN_SVG : MOON_SVG;
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
      freshToggle.innerHTML = next === 'dark' ? SUN_SVG : MOON_SVG;
    });
  }

  // ─── Hamburger menu ────────────────────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');
  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = mainNav.classList.toggle('open');
      hamburger.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });
    // Close menu when a nav link is clicked
    mainNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
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
