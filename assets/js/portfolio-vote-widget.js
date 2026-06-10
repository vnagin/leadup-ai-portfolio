/*!
 * Portfolio Vote Widget — «👍 Голосую за идею»
 * LeadUp AI · AI-портфолио (LEA-2872) · v3 teal стиль
 *
 * Встройка (Миша / Лена):
 *   1. Положить пустой контейнер туда, где нужна кнопка + счётчик:
 *        <div data-portfolio-vote="axiomai"></div>
 *      (data-portfolio-vote = projectSlug проекта)
 *   2. Подключить этот файл один раз на странице (карточная главная ИЛИ лендинг):
 *        <script src="/assets/portfolio-vote-widget.js" defer></script>
 *
 * Виджет сам:
 *   - один раз дёргает GET /portfolio-votes и проставляет все счётчики на странице;
 *   - по клику шлёт POST /portfolio-vote { projectSlug }, инкрементит, ставит localStorage-флаг;
 *   - повторно голосовать не даёт (localStorage + серверный мягкий дедуп по hash(IP+UA)).
 *
 * Стиль наследует v3-токены, если они есть на странице (--teal, --font-sans...),
 * иначе использует встроенные фолбэки. Никаких внешних зависимостей.
 */
(function () {
  "use strict";

  var API_BASE = "https://n8n.flowstudio.cloud/webhook";
  var ENDPOINT_VOTE = API_BASE + "/portfolio-vote";
  var ENDPOINT_VOTES = API_BASE + "/portfolio-votes";
  var LS_PREFIX = "pv_voted_"; // localStorage флаг на слаг

  // ---- styв (инжектим один раз) ------------------------------------------
  var CSS = [
    ".pv-btn{",
    "  --pv-teal: var(--teal, #00E5C7);",
    "  --pv-teal-hover: var(--teal-hover, #14F5D7);",
    "  --pv-teal-pressed: var(--teal-pressed, #00CBB0);",
    "  --pv-teal-tint: var(--teal-tint, rgba(0,229,199,0.12));",
    "  display:inline-flex;align-items:center;gap:8px;",
    "  font-family: var(--font-sans, 'Geist', -apple-system, 'Inter', sans-serif);",
    "  font-size:14px;font-weight:600;line-height:1;cursor:pointer;",
    "  padding:9px 14px;border-radius: var(--r-full, 9999px);",
    "  color:var(--pv-teal);background:var(--pv-teal-tint);",
    "  border:1px solid color-mix(in srgb, var(--pv-teal) 40%, transparent);",
    "  transition: all .18s var(--ease, cubic-bezier(0.2,0,0,1));",
    "  -webkit-tap-highlight-color:transparent;user-select:none;",
    "}",
    ".pv-btn:hover:not([disabled]){background:color-mix(in srgb, var(--pv-teal) 18%, transparent);",
    "  border-color:var(--pv-teal-hover);box-shadow: var(--teal-glow, 0 0 18px rgba(0,229,199,0.35));}",
    ".pv-btn:active:not([disabled]){transform:translateY(1px);color:var(--pv-teal-pressed);}",
    ".pv-btn[disabled]{cursor:default;opacity:1;}",
    ".pv-btn[aria-pressed='true']{background:var(--pv-teal);color:#04221d;border-color:var(--pv-teal);}",
    ".pv-btn[aria-pressed='true'] .pv-emoji{filter:none;}",
    ".pv-emoji{font-size:15px;line-height:1;}",
    ".pv-count{font-variant-numeric:tabular-nums;font-feature-settings:'tnum';",
    "  min-width:1ch;text-align:left;}",
    ".pv-count-sep{opacity:.5;font-weight:400;}",
    ".pv-btn.pv-pending{opacity:.6;pointer-events:none;}",
    ".pv-bump{animation:pv-bump .32s var(--ease, ease);}",
    "@keyframes pv-bump{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}",
  ].join("\n");

  function injectStyle() {
    if (document.getElementById("pv-widget-style")) return;
    var s = document.createElement("style");
    s.id = "pv-widget-style";
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  // ---- helpers ------------------------------------------------------------
  function hasVoted(slug) {
    try { return localStorage.getItem(LS_PREFIX + slug) === "1"; }
    catch (e) { return false; }
  }
  function markVoted(slug) {
    try { localStorage.setItem(LS_PREFIX + slug, "1"); } catch (e) {}
  }
  function fmt(n) {
    if (n == null || isNaN(n)) return "0";
    return n >= 1000 ? (n / 1000).toFixed(1).replace(/\.0$/, "") + "k" : String(n);
  }

  function buildButton(slug) {
    var voted = hasVoted(slug);
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "pv-btn";
    btn.setAttribute("data-pv-slug", slug);
    btn.setAttribute("aria-pressed", voted ? "true" : "false");
    if (voted) btn.disabled = true;
    btn.innerHTML =
      '<span class="pv-emoji" aria-hidden="true">👍</span>' +
      '<span class="pv-label">' + (voted ? "Вы проголосовали" : "Голосую за идею") + "</span>" +
      '<span class="pv-count-sep">·</span>' +
      '<span class="pv-count" data-pv-count>—</span>';
    btn.addEventListener("click", function () { onVote(btn, slug); });
    return btn;
  }

  function setCount(el, n) {
    var c = el.querySelector("[data-pv-count]");
    if (!c) return;
    c.textContent = fmt(n);
    c.classList.remove("pv-bump");
    // reflow → перезапуск анимации
    void c.offsetWidth;
    c.classList.add("pv-bump");
  }

  function onVote(btn, slug) {
    if (btn.disabled || btn.classList.contains("pv-pending")) return;
    if (hasVoted(slug)) return;
    btn.classList.add("pv-pending");
    fetch(ENDPOINT_VOTE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectSlug: slug }),
    })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        markVoted(slug);
        btn.disabled = true;
        btn.setAttribute("aria-pressed", "true");
        var label = btn.querySelector(".pv-label");
        if (label) label.textContent = "Вы проголосовали";
        if (typeof data.total === "number") setCount(btn, data.total);
      })
      .catch(function () {
        // мягкий фолбэк: не ломаем UX, разрешаем повтор
        btn.classList.remove("pv-pending");
      })
      .then(function () { btn.classList.remove("pv-pending"); });
  }

  // ---- bootstrap ----------------------------------------------------------
  function mountAll() {
    var hosts = document.querySelectorAll("[data-portfolio-vote]");
    if (!hosts.length) return;
    injectStyle();
    var bySlug = {};
    hosts.forEach(function (host) {
      var slug = host.getAttribute("data-portfolio-vote");
      if (!slug || host.querySelector(".pv-btn")) return;
      var btn = buildButton(slug);
      host.appendChild(btn);
      (bySlug[slug] = bySlug[slug] || []).push(btn);
    });
    // один батч-запрос на все счётчики страницы
    fetch(ENDPOINT_VOTES)
      .then(function (r) { return r.json(); })
      .then(function (counts) {
        Object.keys(bySlug).forEach(function (slug) {
          var n = counts && typeof counts[slug] === "number" ? counts[slug] : 0;
          bySlug[slug].forEach(function (btn) {
            var c = btn.querySelector("[data-pv-count]");
            if (c) c.textContent = fmt(n);
          });
        });
      })
      .catch(function () {
        // если счётчики недоступны — показываем 0, кнопка остаётся рабочей
        Object.keys(bySlug).forEach(function (slug) {
          bySlug[slug].forEach(function (btn) {
            var c = btn.querySelector("[data-pv-count]");
            if (c && c.textContent === "—") c.textContent = "0";
          });
        });
      });
  }

  // публичный хук для SPA/динамической дорисовки карточек
  window.PortfolioVote = { mount: mountAll, ENDPOINT_VOTE: ENDPOINT_VOTE, ENDPOINT_VOTES: ENDPOINT_VOTES };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountAll);
  } else {
    mountAll();
  }
})();
