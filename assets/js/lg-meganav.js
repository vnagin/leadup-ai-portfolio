/**
 * LEA-3519 — desktop dropdown-контроллер мега-меню.
 * Mobile-drawer работает через <details> без JS.
 * Поведение: hover-intent (80/150 ms) + click toggle + Esc + click-outside close.
 * A11y: aria-expanded sync, fokus-trap не делаем (упрощение).
 */
(function () {
  'use strict';
  var OPEN_MS = 80, CLOSE_MS = 150;
  var items = [].slice.call(document.querySelectorAll('.lg-meganav [data-dropdown]'));
  if (!items.length) return;
  var timer;

  function closeAll(except) {
    items.forEach(function (it) {
      if (it === except) return;
      it.removeAttribute('data-open');
      var b = it.querySelector('.lg-meganav__trigger');
      if (b) b.setAttribute('aria-expanded', 'false');
    });
  }
  function open(it) {
    clearTimeout(timer);
    closeAll(it);
    it.setAttribute('data-open', 'true');
    var b = it.querySelector('.lg-meganav__trigger');
    if (b) b.setAttribute('aria-expanded', 'true');
  }
  function close(it) {
    it.removeAttribute('data-open');
    var b = it.querySelector('.lg-meganav__trigger');
    if (b) b.setAttribute('aria-expanded', 'false');
  }

  items.forEach(function (it) {
    var trg = it.querySelector('.lg-meganav__trigger');
    if (!trg) return;
    it.addEventListener('mouseenter', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { open(it); }, OPEN_MS);
    });
    it.addEventListener('mouseleave', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { close(it); }, CLOSE_MS);
    });
    trg.addEventListener('click', function (e) {
      e.preventDefault();
      if (it.getAttribute('data-open') === 'true') close(it); else open(it);
    });
    trg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault(); open(it);
        var first = it.querySelector('.lg-meganav__link');
        if (first) first.focus();
      }
      if (e.key === 'Escape') close(it);
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.lg-meganav [data-dropdown]')) closeAll(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeAll(null);
  });

  // ds-langswitch (если есть на portfolio)
  document.querySelectorAll('.ds-langswitch').forEach(function (sw) {
    var trigger = sw.querySelector('.ds-langswitch__trigger');
    if (!trigger) return;
    function lclose() { sw.setAttribute('data-open', 'false'); trigger.setAttribute('aria-expanded', 'false'); }
    function lopen() { sw.setAttribute('data-open', 'true'); trigger.setAttribute('aria-expanded', 'true'); }
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      sw.getAttribute('data-open') === 'true' ? lclose() : lopen();
    });
    document.addEventListener('click', function (e) { if (!sw.contains(e.target)) lclose(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') lclose(); });
  });
})();
