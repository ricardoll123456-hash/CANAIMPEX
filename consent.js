/* Cana Impex / NutWorks — Global Cookie Consent + GA4 (standalone) */
(function () {
  var GA_ID = "G-2RWCT01R3F";               // <-- your GA4 ID
  var KEY   = "canaimpex_cookie_consent";    // localStorage key

  function loadGA() {
    if (window.gtagLoaded || localStorage.getItem(KEY) !== "accepted") return;

    // Load GA4 library
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);

    // gtag bootstrap
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag("js", new Date());
    // IP anonymization is good for GDPR
    gtag("config", GA_ID, { anonymize_ip: true });

    window.gtagLoaded = true;
  }

  function showBanner() {
    if (document.getElementById("cookie-banner")) return;

    var wrap = document.createElement("div");
    wrap.id = "cookie-banner";
    wrap.setAttribute("role", "dialog");
    wrap.setAttribute("aria-live", "polite");
    wrap.style.cssText = "position:fixed;bottom:0;left:0;width:100%;background:#111;color:#fff;text-align:center;padding:15px 10px;z-index:999999;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;font-size:15px;box-shadow:0 -2px 8px rgba(0,0,0,.4)";

    var link = '#b8860b';
    wrap.innerHTML =
      'We use cookies to analyze traffic and improve our site. See our ' +
      '<a href="/privacy-policy.html" target="_blank" rel="noopener" style="color:'+link+';text-decoration:underline">Privacy Policy</a>. ' +
      '<button id="cc-accept" style="background:#0a5;border:none;color:#fff;padding:8px 14px;margin-left:10px;border-radius:6px;font-weight:600;cursor:pointer">Accept</button>' +
      '<button id="cc-decline" style="background:'+link+';border:none;color:#111;padding:8px 14px;margin-left:6px;border-radius:6px;font-weight:700;cursor:pointer">Decline</button>';

    document.body.appendChild(wrap);

    document.getElementById("cc-accept").onclick = function () {
      localStorage.setItem(KEY, "accepted");
      wrap.remove();
      loadGA();
    };
    document.getElementById("cc-decline").onclick = function () {
      localStorage.setItem(KEY, "rejected");
      wrap.remove();
    };
  }

  // Public helper so you can reopen the banner from a footer link
  window.openCookieSettings = function () {
    localStorage.removeItem(KEY);
    var b = document.getElementById("cookie-banner");
    if (b) b.remove();
    showBanner();
  };

  // If previously accepted, load GA right away
  if (localStorage.getItem(KEY) === "accepted") {
    loadGA();
  } else if (!localStorage.getItem(KEY)) {
    // No choice yet → show banner when DOM is ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", showBanner);
    } else {
      showBanner();
    }
  }
})();
