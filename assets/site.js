// /assets/site.js
(function () {
  /* -------------------------
     MOUNTS & HELPERS
  -------------------------- */
  function ensureMount(id, where = 'start') {
    let el = document.getElementById(id);
    if (!el) {
      el = document.createElement('div');
      el.id = id;
      if (where === 'start') {
        document.body.insertBefore(el, document.body.firstChild);
      } else {
        document.body.appendChild(el);
      }
    }
    return el;
  }

  function isDesktop() { return window.innerWidth >= 768; }

  /* -------------------------
     HEADER INJECTION + MENU
  -------------------------- */
  async function injectHeader() {
    const mount = ensureMount('header', 'start');
    const res = await fetch('/includes/header.html', { cache: 'no-cache' });
    if (!res.ok) throw new Error('Header HTTP ' + res.status);
    const html = await res.text();
    mount.innerHTML = html;

    // Après injection: câbler le menu + i18n (les boutons existent enfin)
    initHeaderMenu();
    initI18N();          // important: i18n après le header
    injectHreflang();    // balises SEO selon la page courante
  }

  function initHeaderMenu() {
    const btn = document.getElementById('menuToggle');
    const panel = document.getElementById('mobileMenu');
    if (!btn || !panel) return;

    // éviter le double-binding si on réinjecte
    if (btn.dataset.bound === '1') return;
    btn.dataset.bound = '1';

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
    window.addEventListener('resize', () => { if (isDesktop()) closeMenu(); });
  }

  /* -------------------------
     FOOTER (optionnel)
  -------------------------- */
  async function injectFooter() {
    const mount = document.getElementById('footer') || (() => {
      const el = document.createElement('div');
      el.id = 'footer';
      document.body.appendChild(el);
      return el;
    })();
    try {
      const res = await fetch('/includes/footer.html', { cache: 'no-cache' });
      if (!res.ok) return; // pas obligatoire
      const html = await res.text();
      mount.innerHTML = html;
      // met à jour l'année s'il y a #year dans le footer inclus
      const y = document.getElementById('year');
      if (y) y.textContent = new Date().getFullYear();
    } catch (e) {
      console.warn('Footer load skipped:', e);
    }
  }

  /* -------------------------
     FAVICON (assure l’icône)
  -------------------------- */
  function ensureFavicon() {
    // supprime anciens liens pour éviter les doublons
    document.querySelectorAll('link[rel="icon"], link[rel="alternate icon"], link[rel="apple-touch-icon"]')
      .forEach(n => n.parentNode.removeChild(n));

    const svg = document.createElement('link');
    svg.rel = 'icon';
    svg.type = 'image/svg+xml';
    svg.href = '/assets/favicon.svg?v=2';
    document.head.appendChild(svg);

    // Optionnel: PNG/Apple fallback — décommente si tu as /assets/favicon.png
    // const png = document.createElement('link');
    // png.rel = 'alternate icon';
    // png.type = 'image/png';
    // png.sizes = '32x32';
    // png.href = '/assets/favicon.png?v=2';
    // document.head.appendChild(png);

    // const apple = document.createElement('link');
    // apple.rel = 'apple-touch-icon';
    // apple.href = '/assets/favicon.png?v=2';
    // document.head.appendChild(apple);
  }

  /* -------------------------
     I18N (EN <-> FR)
     - data-i18n           : remplace textContent
     - data-i18n-attr      : ex. "placeholder:form_name_ph,title:tooltip_key"
  -------------------------- */
  const I18N = {
    en: {
      hero_kicker: "Côte d'Ivoire Export House",
      hero_title: "Unlimited Bulk Supply — Cashew • Cocoa • Hevea • Coffee",
      hero_desc: "We coordinate sourcing, grading, documentation, and shipping from Abidjan and San Pedro for roasters, processors, and industrial buyers around the world.",
      cta_quote: "Request a Desk Quote",
      cta_products: "Explore Products",
      cta_sales: "Talk to Sales",

      quotes_kicker: "Market Quotes",
      quotes_title: "Preview Our Core Commodities",
      quotes_sub: "Every shipment is calibrated to your target grade, moisture, and packaging requirements.",

      card_cashew_title: "Cashew",
      card_cashew_desc: "Bulk W240/W320 kernels and RCN with humidity control.",
      card_cashew_btn: "Request Cashew Quote",

      card_cocoa_title: "Cocoa",
      card_cocoa_desc: "Traceable cocoa beans and nibs ready for EU and NA import.",
      card_cocoa_btn: "Request Cocoa Quote",

      card_hevea_title: "Hevea",
      card_hevea_desc: "Cup-lump and latex programs with SGS and Cotecna oversight.",
      card_hevea_btn: "Request Rubber Quote",

      card_coffee_title: "Coffee",
      card_coffee_desc: "Robusta and arabica profiles shipped in bulk bags or pallets.",
      card_coffee_btn: "Request Coffee Quote",

      origin_kicker: "Origin Advantage",
      origin_title: "End-to-End Execution from Côte d’Ivoire",
      origin_desc: "Our bilingual teams manage procurement, quality control, fumigation, and documentation. We work directly with cooperatives and processors to secure volume and maintain traceability.",
      origin_exp_title: "Experience",
      origin_exp_value: "20+ years shipping globally",
      origin_foot_title: "Footprint",
      origin_foot_value: "Abidjan & San Pedro desks",
      origin_comp_title: "Compliance",
      origin_comp_value: "SGS • Cotecna • Phytosanitary",
      origin_logi_title: "Logistics",
      origin_logi_value: "FOB, CIF & multimodal options",
      desk_title: "Desk Coverage",
      desk_li1: "• Côte d’Ivoire origin specialists at port",
      desk_li2: "• Canada & Europe customer service desks",
      desk_li3: "• Weekly status reports and vessel tracking",
      desk_li4: "• Financing options via partner banks",

      sampling_title: "Sampling & Quality Control",
      sampling_desc: "We prepare desk samples from our Abidjan warehouse and coordinate independent lab analysis when required. Moisture, defects, and count per pound are tracked in a shared dashboard.",
      sampling_li1: "• Pre-shipment inspection with SGS/Cotecna",
      sampling_li2: "• Photo and video updates from stuffing",
      sampling_li3: "• Custom packaging per Incoterm",

      docs_title: "Documentation & Logistics",
      docs_desc: "Our team prepares commercial invoices, packing lists, certificates of origin, phytosanitary certificates, and negotiates freight with preferred carriers to match your schedule.",
      docs_li1: "• Abidjan & San Pedro port coverage",
      docs_li2: "• FOB, CFR, CIF, EXW, and FCA delivery",
      docs_li3: "• Digitised paperwork for rapid clearance",

      contact_kicker: "Contact",
      contact_title: "Request Samples or a Quote",
      contact_desc: "Tell us your volumes, target grades, and Incoterms. We respond within 24–48 hours.",
      form_name_ph: "Your name",
      form_company_ph: "Company",
      form_email_ph: "Email",
      form_message_ph: "Volumes, grades, Incoterms…",
      form_submit_btn: "Send Message",
      sidebar_label: "Commercial Desk",
      sidebar_locations: "Locations: Abidjan • San Pedro • Montreal",
      sidebar_commodities: "Commodities: Cashew, Cocoa, Hevea, Coffee",
      sidebar_integrity: "We conduct our business with integrity and transparent reporting from farmgate to vessel.",

      footer_company: "Cana Impex Inc.",
      footer_rights: "All rights reserved.",
      footer_madein: "Made in Côte d’Ivoire",
    },
    fr: {
      hero_kicker: "Maison d’export — Côte d’Ivoire",
      hero_title: "Approvisionnement en vrac — Cajou • Cacao • Hévéa • Café",
      hero_desc: "Nous coordonnons l’achat, le calibrage, la documentation et l’expédition depuis Abidjan et San Pedro pour des torréfacteurs, transformateurs et acheteurs industriels dans le monde entier.",
      cta_quote: "Demander un devis rapide",
      cta_products: "Voir les produits",
      cta_sales: "Parler aux ventes",

      quotes_kicker: "Devis marché",
      quotes_title: "Aperçu de nos marchandises clés",
      quotes_sub: "Chaque expédition est ajustée à votre grade cible, humidité et exigences d’emballage.",

      card_cashew_title: "Cajou",
      card_cashew_desc: "Amandes W240/W320 et RCN avec contrôle d’humidité.",
      card_cashew_btn: "Devis Cajou",

      card_cocoa_title: "Cacao",
      card_cocoa_desc: "Fèves et nibs traçables, prêts pour UE et Amérique du Nord.",
      card_cocoa_btn: "Devis Cacao",

      card_hevea_title: "Hévéa",
      card_hevea_desc: "Cup-lump et latex avec supervision SGS et Cotecna.",
      card_hevea_btn: "Devis Hévéa",

      card_coffee_title: "Café",
      card_coffee_desc: "Profils robusta et arabica expédiés en sacs vrac ou palettes.",
      card_coffee_btn: "Devis Café",

      origin_kicker: "Avantage Origine",
      origin_title: "Exécution de bout en bout depuis la Côte d’Ivoire",
      origin_desc: "Nos équipes bilingues gèrent l’achat, le contrôle qualité, la fumigation et la documentation. Nous travaillons avec coopératives et transformateurs pour sécuriser les volumes et maintenir la traçabilité.",
      origin_exp_title: "Expérience",
      origin_exp_value: "20+ ans d’expéditions mondiales",
      origin_foot_title: "Empreinte",
      origin_foot_value: "Bureaux Abidjan & San Pedro",
      origin_comp_title: "Conformité",
      origin_comp_value: "SGS • Cotecna • Phytosanitaire",
      origin_logi_title: "Logistique",
      origin_logi_value: "FOB, CIF et options multimodales",
      desk_title: "Couverture Opérationnelle",
      desk_li1: "• Spécialistes d’origine sur les ports ivoiriens",
      desk_li2: "• Bureaux service client Canada & Europe",
      desk_li3: "• Rapports hebdomadaires & suivi navires",
      desk_li4: "• Options de financement via banques partenaires",

      sampling_title: "Échantillonnage & Contrôle Qualité",
      sampling_desc: "Préparation d’échantillons depuis notre entrepôt d’Abidjan et analyses labo indépendantes si requis. Humidité, défauts et compte par livre suivis dans un tableau partagé.",
      sampling_li1: "• Inspection pré-expédition avec SGS/Cotecna",
      sampling_li2: "• Photos et vidéos pendant le stuffing",
      sampling_li3: "• Emballage personnalisé selon Incoterm",

      docs_title: "Documentation & Logistique",
      docs_desc: "Émission des factures commerciales, listes de colisage, certificats d’origine, certificats phytos, et négociation du fret avec transporteurs selon votre planning.",
      docs_li1: "• Couverture ports d’Abidjan & San Pedro",
      docs_li2: "• Livraisons FOB, CFR, CIF, EXW, FCA",
      docs_li3: "• Dossiers digitalisés pour un dédouanement rapide",

      contact_kicker: "Contact",
      contact_title: "Demander des échantillons ou un devis",
      contact_desc: "Indiquez vos volumes, grades cibles et Incoterms. Réponse sous 24–48 h.",
      form_name_ph: "Votre nom",
      form_company_ph: "Société",
      form_email_ph: "Email",
      form_message_ph: "Volumes, grades, Incoterms…",
      form_submit_btn: "Envoyer",
      sidebar_label: "Bureau commercial",
      sidebar_locations: "Implantations : Abidjan • San Pedro • Montréal",
      sidebar_commodities: "Produits : Cajou, Cacao, Hévéa, Café",
      sidebar_integrity: "Nous travaillons avec intégrité et un reporting transparent du champ au navire.",

      footer_company: "Cana Impex Inc.",
      footer_rights: "Tous droits réservés.",
      footer_madein: "Fait en Côte d’Ivoire",
    }
  };

  function i18nGet(lang, key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || "";
  }

  function applyTranslations(lang) {
    // textes
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const k = el.getAttribute("data-i18n");
      const v = i18nGet(lang, k);
      if (v) el.textContent = v;
    });
    // attributs
    document.querySelectorAll("[data-i18n-attr]").forEach(el => {
      const spec = el.getAttribute("data-i18n-attr");
      if (!spec) return;
      spec.split(",").forEach(pair => {
        const [attr, key] = pair.split(":").map(s => s.trim());
        const v = i18nGet(lang, key);
        if (attr && v) el.setAttribute(attr, v);
      });
    });
    document.documentElement.setAttribute("lang", lang);
    localStorage.setItem("cana_lang", lang);
  }

  function initI18N() {
    // empêcher double init si le header est ré-injecté
    if (window.__i18n_inited) {
      // on remet juste les listeners si besoin
      bindLangButtons();
      return;
    }
    window.__i18n_inited = true;

    let lang = localStorage.getItem("cana_lang");
    if (!lang) {
      lang = (navigator.language || "en").toLowerCase().startsWith("fr") ? "fr" : "en";
      localStorage.setItem("cana_lang", lang);
    }
    applyTranslations(lang);
    bindLangButtons();
  }

  function bindLangButtons() {
    const enBtn = document.getElementById("langEN");
    const frBtn = document.getElementById("langFR");

    if (enBtn && enBtn.dataset.bound !== '1') {
      enBtn.dataset.bound = '1';
      enBtn.addEventListener("click", (e) => { e.preventDefault(); applyTranslations("en"); });
    }
    if (frBtn && frBtn.dataset.bound !== '1') {
      frBtn.dataset.bound = '1';
      frBtn.addEventListener("click", (e) => { e.preventDefault(); applyTranslations("fr"); });
    }
  }

  /* -------------------------
     HREFLANG (SEO)
  -------------------------- */
  function injectHreflang() {
    // En i18n “même URL”, on peut annoncer EN et FR sur la même page.
    // (Si tu préfères le /fr/ séparé, dis-le et je remets la version par mapping.)
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(n => n.remove());

    const loc = location.origin + location.pathname + location.search;
    const linkEN = document.createElement('link');
    linkEN.rel = 'alternate';
    linkEN.hreflang = 'en';
    linkEN.href = loc;

    const linkFR = document.createElement('link');
    linkFR.rel = 'alternate';
    linkFR.hreflang = 'fr';
    linkFR.href = loc;

    const linkXD = document.createElement('link');
    linkXD.rel = 'alternate';
    linkXD.hreflang = 'x-default';
    linkXD.href = loc;

    document.head.appendChild(linkEN);
    document.head.appendChild(linkFR);
    document.head.appendChild(linkXD);
  }

  /* -------------------------
     BOOT
  -------------------------- */
  function boot() {
    ensureFavicon();
    injectHeader()
      .catch(err => {
        console.error('Header load error:', err);
        // si header échoue, tenter quand même i18n pour le contenu
        try { initI18N(); } catch (e) {}
      });
    injectFooter().catch(() => {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
