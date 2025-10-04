// /assets/site.js
(function () {
  // Create the header mount as the first element in <body>, if missing
  function ensureHeaderMount() {
    let mount = document.getElementById('header');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'header';
      document.body.insertBefore(mount, document.body.firstChild);
    }
    return mount;
  }

  // Inject shared header AFTER DOM is ready
  async function injectHeader() {
    const mount = ensureHeaderMount();
    const res = await fetch('/includes/header.html', { cache: 'no-cache' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const html = await res.text();
    mount.innerHTML = html;
    initHeaderMenu();
  }

  // Hamburger wiring (no scripts inside header.html)
  function initHeaderMenu() {
    const btn = document.getElementById('menuToggle');
    const panel = document.getElementById('mobileMenu');
    if (!btn || !panel) return;

    const closeMenu = () => {
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
    };
    const openMenu = () => {
      panel.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('overflow-hidden');
    };

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    panel.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth >= 768) closeMenu(); });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => injectHeader().catch(console.error));
  } else {
    injectHeader().catch(console.error);
  }
})();
