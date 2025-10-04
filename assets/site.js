// assets/site.js
(async function () {
  // Ensure Tailwind/your styles already exist in the page.

  // 1) Make/ensure a mount at top of <body>
  function ensureHeaderMount() {
    let mount = document.getElementById('header');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'header';
      // insert as the first child of <body>
      document.body.insertBefore(mount, document.body.firstChild);
    }
    return mount;
  }

  // 2) Inject shared header HTML
  async function injectHeader() {
    const mount = ensureHeaderMount();
    const res = await fetch((window.__HEADER_PATH__ || 'includes/header.html'), { cache: 'no-cache' });
    const html = await res.text();
    mount.innerHTML = html;
    initHeaderMenu(); // wire after injection
  }

  // 3) Wire hamburger menu (same code, but here globally)
  function initHeaderMenu() {
    const btn = document.getElementById('menuToggle');
    const panel = document.getElementById('mobileMenu');
    if (!btn || !panel) return;

    function closeMenu() {
      panel.classList.add('hidden');
      btn.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('overflow-hidden');
    }
    function openMenu() {
      panel.classList.remove('hidden');
      btn.setAttribute('aria-expanded', 'true');
      document.body.classList.add('overflow-hidden');
    }
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

  // 4) Fire
  try { await injectHeader(); } 
  catch (e) { console.error('Header load error:', e); }
})();
