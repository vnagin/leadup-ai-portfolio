/*!
 * LeadUp AI — unified marketing tracking bundle
 * HubSpot (portal 144309663, EU1) + Meta Pixel (941953963611912) + GA4 (G-SW1QTKLYGV)
 * Источник истины: vault LEA-3849. Менять ID только здесь.
 * Идемпотентен: безопасен при двойном подключении и при наличии inline-gtag на странице.
 */
(function () {
  if (window.__leadupTrackingLoaded) return;
  window.__leadupTrackingLoaded = true;

  /* ---------- HubSpot ---------- */
  if (!document.getElementById('hs-script-loader')) {
    var hs = document.createElement('script');
    hs.type = 'text/javascript';
    hs.id = 'hs-script-loader';
    hs.async = true;
    hs.defer = true;
    hs.src = '//js-eu1.hs-scripts.com/144309663.js';
    document.head.appendChild(hs);
  }

  /* ---------- Meta Pixel ---------- */
  if (!window.fbq) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', '941953963611912');
    window.fbq('track', 'PageView');
  }

  /* ---------- GA4 (gtag.js) ---------- */
  /* Пропускаем, если на странице уже подключён gtag для этого же measurement ID
     (на funnel-страницах есть inline gtag) — чтобы не дублировать PageView. */
  if (!document.querySelector('script[src*="gtag/js?id=G-SW1QTKLYGV"]')) {
    var ga = document.createElement('script');
    ga.async = true;
    ga.src = 'https://www.googletagmanager.com/gtag/js?id=G-SW1QTKLYGV';
    document.head.appendChild(ga);
    window.dataLayer = window.dataLayer || [];
    if (typeof window.gtag !== 'function') {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    window.gtag('js', new Date());
    window.gtag('config', 'G-SW1QTKLYGV');
  }
})();
