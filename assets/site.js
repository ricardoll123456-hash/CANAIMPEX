
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
/* ===== Lightweight i18n (EN <-> FR) =====
   Usage:
   - data-i18n="key"            -> remplace textContent
   - data-i18n-attr="attr:key"  -> remplace un attribut (placeholder, title, aria-label, etc.)
   - Plusieurs attributs: data-i18n-attr="placeholder:form_name,title:tooltip_name"
*/

const I18N = {
  en: {
    // --- Nav / Header ---
    nav_home: "Home",
    nav_products: "Our Products",
    nav_packaging: "Custom Packaging",
    nav_about: "About",
    nav_quotes: "Get Quotes",
    nav_contact: "Contact",
    cta_portfolio: "View Portfolio",
    cta_samples: "Request Samples",

    // --- About page (exemples) ---
    about_hero_kicker: "Who We Are",
    about_hero_title: "20 Years Connecting Côte d’Ivoire to Global Markets",
    about_hero_desc:
      "Cana Impex is a privately-held export house built by agronomy and logistics experts. From Abidjan, we manage end-to-end sourcing for cashew, cocoa, hevea, and coffee buyers who demand quality, compliance, and reliable sailings.",
    about_hero_btn_talk: "Talk to Our Team",
    about_hero_btn_explore: "Explore Our Commodities",
    about_section_title: "Origin Specialists with a Global Mindset",
    card_experience_title: "Experience",
    card_experience_value: "20+ years of export leadership",
    card_footprint_title: "Footprint",
    card_footprint_value: "12+ countries served annually",
    card_compliance_title: "Compliance",
    card_compliance_value: "SGS, Cotecna & Phyto ready",
    card_logistics_title: "Logistics",
    card_logistics_value: "Abidjan & San Pedro coverage",
  },

  fr: {
    // --- Nav / Header ---
    nav_home: "Accueil",
    nav_products: "Nos Produits",
    nav_packaging: "Emballages Personnalisés",
    nav_about: "À propos",
    nav_quotes: "Devis",
    nav_contact: "Contact",
    cta_portfolio: "Voir le Portefeuille",
    cta_samples: "Demander des Échantillons",

    // --- About page (exemples) ---
    about_hero_kicker: "Qui sommes-nous",
    about_hero_title: "20 ans reliant la Côte d’Ivoire aux marchés mondiaux",
    about_hero_desc:
      "Cana Impex est une maison d’export privée fondée par des experts en agronomie et logistique. Depuis Abidjan, nous gérons l’approvisionnement de bout en bout pour des acheteurs de cajou, cacao, hévéa et café exigeant qualité, conformité et fiabilité des départs.",
    about_hero_btn_talk: "Parler à notre équipe",
    about_hero_btn_explore: "Explorer nos produits",
    about_section_title: "Spécialistes d’origine au regard international",
    card_experience_title: "Expérience",
    card_experience_value: "20+ ans de leadership à l’export",
    card_footprint_title: "Empreinte",
    card_footprint_value: "12+ pays servis par an",
    card_compliance_title: "Conformité",
    card_compliance_value: "SGS, Cotecna & Phyto prêts",
    card_logistics_title: "Logistique",
    card_logistics_value: "Couverture Abidjan & San Pedro",
  }
};

// Helper
function i18nGet(lang, key) {
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || "";
}

function applyTranslations(lang) {
  // Texte simple
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    const txt = i18nGet(lang, key);
    if (txt) el.textContent = txt;
  });

  // Attributs (placeholder, title, aria-label…)
  document.querySelectorAll("[data-i18n-attr]").forEach(el => {
    const spec = el.getAttribute("data-i18n-attr"); // e.g. "placeholder:form_name,title:tooltip_name"
    if (!spec) return;
    spec.split(",").forEach(pair => {
      const [attr, key] = pair.split(":").map(s => s.trim());
      const val = i18nGet(lang, key);
      if (attr && val) el.setAttribute(attr, val);
    });
  });

  // <html lang="...">
  document.documentElement.setAttribute("lang", lang);

  // mémorise le choix
  localStorage.setItem("cana_lang", lang);
}

function initI18N() {
  // Détecte choix utilisateur ou langue navigateur
  let lang = localStorage.getItem("cana_lang");
  if (!lang) {
    const nav = (navigator.language || "en").toLowerCase();
    lang = nav.startsWith("fr") ? "fr" : "en";
    localStorage.setItem("cana_lang", lang);
  }
  applyTranslations(lang);

  // Boutons EN/FR
  const enBtn = document.getElementById("langEN");
  const frBtn = document.getElementById("langFR");
  if (enBtn) enBtn.addEventListener("click", (e) => { e.preventDefault(); applyTranslations("en"); });
  if (frBtn) frBtn.addEventListener("click", (e) => { e.preventDefault(); applyTranslations("fr"); });
}

// Lance après chargement (ton site.js est déjà defer)
try { initI18N(); } catch (e) { console.error("i18n init error:", e); }
