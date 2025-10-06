
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
// ==== AUTO LANGUAGE REDIRECT (EN <-> FR) ====

// Liste des correspondances entre les pages anglaises et françaises
const LANG_MAP = {
  '/':                     { en: '/',                 fr: '/fr/' },
  '/index.html':           { en: '/index.html',       fr: '/fr/index.html' },
  '/about.html':           { en: '/about.html',       fr: '/fr/a-propos.html' },
  '/our-products.html':    { en: '/our-products.html', fr: '/fr/produits.html' },
  '/custom-packaging.html':{ en: '/custom-packaging.html', fr: '/fr/emballages-personnalises.html' },
  '/thanks.html':          { en: '/thanks.html',      fr: '/fr/merci.html' },
  // les pages FR pointent aussi vers leur équivalent EN
  '/fr/':                  { en: '/',                 fr: '/fr/' },
  '/fr/index.html':        { en: '/index.html',       fr: '/fr/index.html' },
  '/fr/a-propos.html':     { en: '/about.html',       fr: '/fr/a-propos.html' },
  '/fr/produits.html':     { en: '/our-products.html', fr: '/fr/produits.html' },
  '/fr/emballages-personnalises.html': { en: '/custom-packaging.html', fr: '/fr/emballages-personnalises.html' },
  '/fr/merci.html':        { en: '/thanks.html',      fr: '/fr/merci.html' },
};

// Fonction utilitaire
function getCurrentPath() {
  let p = location.pathname;
  if (p === '' || p === '/') return '/';
  return p;
}

// Vérifie si la page actuelle est française
function isFrenchPage(p) {
  return p.startsWith('/fr/');
}

// Détecte la langue du navigateur (fr / en)
function detectBrowserLang() {
  const lang = (navigator.language || navigator.userLanguage || 'en').toLowerCase();
  return lang.startsWith('fr') ? 'fr' : 'en';
}

// Redirection automatique à la première visite
(function autoLangRedirect() {
  const storedLang = localStorage.getItem('cana_lang');
  const browserLang = detectBrowserLang();
  const current = getCurrentPath();
  const pair = LANG_MAP[current] || LANG_MAP['/'];

  // Si on a déjà choisi une langue manuellement, ne rien faire
  if (storedLang) return;

  // Sinon, rediriger selon la langue du navigateur
  if (browserLang === 'fr' && !isFrenchPage(current)) {
    localStorage.setItem('cana_lang', 'fr');
    location.replace(pair.fr);
  } else if (browserLang === 'en' && isFrenchPage(current)) {
    localStorage.setItem('cana_lang', 'en');
    location.replace(pair.en);
  }
})();
