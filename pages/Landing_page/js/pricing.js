/* ==========================================================================
   Trazo & Papel — Selector de modalidad (Pago Único vs. + Save the Date)
   ========================================================================== */
(function () {
  'use strict';

  var TP = (window.TP = window.TP || {});

  TP.PLANS = {
    esencial: { name: 'Esencial', price: 890, from: false },
    gala: { name: 'Gala', price: 1690, from: false },
    atelier: { name: 'Atelier a medida', price: 2990, from: true }
  };
  TP.STD_PRICE = 300;

  TP.formatMXN = function (n) {
    return '$' + Math.round(n).toLocaleString('es-MX');
  };

  var buttons = document.querySelectorAll('.pricing-toggle [data-mode]');
  var prices = document.querySelectorAll('[data-price]');
  var stdLines = document.querySelectorAll('[data-std-line]');
  var note = document.getElementById('pricing-note');

  TP.pricing = { mode: 'single' };

  function setMode(mode) {
    if (mode !== 'single' && mode !== 'std') return;
    var changed = TP.pricing.mode !== mode;
    TP.pricing.mode = mode;
    var withStd = mode === 'std';

    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-mode') === mode ? 'true' : 'false');
    });

    prices.forEach(function (el) {
      var base = Number(el.getAttribute('data-base'));
      el.textContent = TP.formatMXN(base + (withStd ? TP.STD_PRICE : 0));
      if (changed) {
        el.classList.remove('price-tick');
        void el.offsetWidth;
        el.classList.add('price-tick');
      }
    });

    stdLines.forEach(function (li) { li.hidden = !withStd; });

    if (note) {
      note.textContent = withStd
        ? 'Precios en MXN · incluye tarjeta Save the Date (+$300)'
        : 'Precios en MXN · pago único';
    }
  }
  TP.pricing.setMode = setMode;

  buttons.forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
  });

  document.querySelectorAll('[data-quote-plan]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!TP.openQuote) return;
      TP.openQuote({
        plan: btn.getAttribute('data-quote-plan'),
        std: TP.pricing.mode === 'std'
      });
    });
  });

  setMode('single');
})();
