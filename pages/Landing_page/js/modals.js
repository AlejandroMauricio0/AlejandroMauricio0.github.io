/* ==========================================================================
   Trazo & Papel — Modal de vista previa (#demo-modal) y cotizador (#quote-modal)
   ========================================================================== */
(function () {
  'use strict';

  var TP = (window.TP = window.TP || {});

  /* ---------- Utilidades de diálogo ---------- */
  function openDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    document.body.classList.add('has-dialog');
    dialog.scrollTop = 0;
  }

  function closeDialog(dialog) {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close();
    else dialog.removeAttribute('open');
  }

  document.querySelectorAll('.tp-dialog').forEach(function (dialog) {
    dialog.addEventListener('close', function () {
      if (!document.querySelector('.tp-dialog[open]')) document.body.classList.remove('has-dialog');
    });
    // Clic fuera del contenedor (backdrop)
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog || e.target.hasAttribute('data-dialog-backdrop')) closeDialog(dialog);
    });
    dialog.querySelectorAll('[data-close-dialog]').forEach(function (btn) {
      btn.addEventListener('click', function () { closeDialog(dialog); });
    });
  });

  /* ======================================================================
     Vista previa en vivo
     ====================================================================== */
  var demo = document.getElementById('demo-modal');
  var demoInvite = document.getElementById('demo-invite');
  var envelope = document.getElementById('demo-envelope');
  var seal = document.getElementById('wax-seal');
  var sealHint = document.getElementById('seal-hint');
  var details = document.getElementById('demo-details');
  var rsvpActions = document.getElementById('rsvp-actions');
  var feedback = document.getElementById('rsvp-feedback');
  var demoUrl = document.getElementById('demo-url');
  var demoKey = 'boda';

  TP.openDemo = function (key) {
    key = TP.events && TP.events[key] ? key : (TP.state && TP.state.event) || 'boda';
    var ev = TP.events[key];
    demoKey = key;

    TP.applyPalette(demoInvite, key);
    demoUrl.textContent = ev.slug;
    demoInvite.querySelectorAll('[data-demo]').forEach(function (n) {
      var field = n.getAttribute('data-demo');
      if (field === 'names') n.innerHTML = ev.namesHtml.replace('<em>', '<em class="italic" style="color:var(--c-accent)">');
      else if (field === 'seats') n.textContent = ev.seats + (ev.seats === 1 ? ' lugar' : ' lugares');
      else n.textContent = ev[field];
    });

    // Estado inicial: sobre cerrado, sin RSVP
    envelope.classList.remove('is-open');
    details.classList.remove('is-open');
    details.setAttribute('aria-hidden', 'true');
    sealHint.hidden = false;
    seal.disabled = false;
    rsvpActions.hidden = false;
    feedback.classList.remove('is-visible');
    feedback.textContent = '';

    openDialog(demo);
    TP.icons();
  };

  seal.addEventListener('click', function () {
    envelope.classList.add('is-open');
    details.classList.add('is-open');
    details.removeAttribute('aria-hidden');
    sealHint.hidden = true;
    seal.disabled = true;
    setTimeout(function () {
      var first = rsvpActions.querySelector('button');
      if (first) first.focus({ preventScroll: true });
    }, 650);
  });

  rsvpActions.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-rsvp]');
    if (!btn) return;
    var ev = TP.events[demoKey];
    var yes = btn.getAttribute('data-rsvp') === 'yes';
    feedback.innerHTML = yes
      ? '<span aria-hidden="true">✓</span> ¡Listo! Confirmaste ' + ev.seats + ' lugares para ' + escapeHtml(ev.pass) + '. Te esperamos.'
      : '<span aria-hidden="true">♡</span> Gracias por avisar. Haremos llegar tu respuesta con cariño.';
    rsvpActions.hidden = true;
    feedback.classList.remove('is-visible', 'pop-in');
    void feedback.offsetWidth;
    feedback.classList.add('is-visible', 'pop-in');
  });

  document.querySelector('[data-demo-to-quote]').addEventListener('click', function () {
    closeDialog(demo);
    TP.openQuote({ event: demoKey, plan: TP.events[demoKey].plan });
  });

  /* ======================================================================
     Cotizador
     ====================================================================== */
  var quote = document.getElementById('quote-modal');
  var form = document.getElementById('quote-form');
  var success = document.getElementById('quote-success');
  var totalEl = document.getElementById('q-total');
  var fromEl = document.getElementById('q-from');
  var linesEl = document.getElementById('q-lines');
  var stdBox = document.getElementById('q-std');
  var eventSel = document.getElementById('q-event');
  var nameInput = document.getElementById('q-name');
  var phoneInput = document.getElementById('q-phone');

  var EXTRAS = {
    express: { label: 'Entrega express (48 h)', price: 390, includedIn: [] },
    bilingue: { label: 'Versión bilingüe', price: 450, includedIn: ['atelier'] },
    regalos: { label: 'Mesa de regalos + dress code', price: 250, includedIn: ['gala', 'atelier'] }
  };

  function currentPlan() {
    var checked = form.querySelector('input[name="plan"]:checked');
    return checked ? checked.value : 'gala';
  }

  function line(label, value) {
    return '<div class="summary-line"><span>' + label + '</span><span>' + value + '</span></div>';
  }

  function recalc() {
    var planKey = currentPlan();
    var plan = TP.PLANS[planKey];
    var total = plan.price;
    var html = line('Plan ' + plan.name, (plan.from ? 'desde ' : '') + TP.formatMXN(plan.price));

    if (stdBox.checked) {
      total += TP.STD_PRICE;
      html += line('Save the Date', '+' + TP.formatMXN(TP.STD_PRICE));
    }

    Object.keys(EXTRAS).forEach(function (key) {
      var extra = EXTRAS[key];
      var row = form.querySelector('[data-extra="' + key + '"]');
      var input = row.querySelector('input');
      var priceEl = row.querySelector('.check-row__price');
      var included = extra.includedIn.indexOf(planKey) !== -1;

      if (included) {
        if (!row.classList.contains('is-included')) input.dataset.prev = input.checked ? '1' : '';
        row.classList.add('is-included');
        input.checked = true;
        input.disabled = true;
        priceEl.textContent = 'Incluido';
        html += line(extra.label, 'Incluido');
      } else {
        if (row.classList.contains('is-included')) input.checked = input.dataset.prev === '1';
        row.classList.remove('is-included');
        input.disabled = false;
        priceEl.textContent = '+' + TP.formatMXN(extra.price);
        if (input.checked) {
          total += extra.price;
          html += line(extra.label, '+' + TP.formatMXN(extra.price));
        }
      }
    });

    linesEl.innerHTML = html;
    fromEl.hidden = !plan.from;
    var text = TP.formatMXN(total);
    if (totalEl.textContent !== text) {
      totalEl.textContent = text;
      totalEl.classList.remove('price-tick');
      void totalEl.offsetWidth;
      totalEl.classList.add('price-tick');
    }
    return { plan: plan, total: total };
  }

  function showForm() {
    form.hidden = false;
    success.hidden = true;
  }

  /**
   * Abre el cotizador sincronizado con el plan elegido y el toggle Save the Date.
   * opts: { plan, std, event }
   */
  TP.openQuote = function (opts) {
    opts = opts || {};
    showForm();
    var plan = opts.plan && TP.PLANS[opts.plan] ? opts.plan : null;
    if (plan) form.querySelector('input[name="plan"][value="' + plan + '"]').checked = true;
    stdBox.checked = typeof opts.std === 'boolean' ? opts.std : TP.pricing.mode === 'std';
    var ev = opts.event || (TP.state && TP.state.event);
    if (ev && eventSel.querySelector('option[value="' + ev + '"]')) eventSel.value = ev;
    [nameInput, phoneInput].forEach(function (i) { i.classList.remove('is-invalid'); });
    recalc();
    openDialog(quote);
    setTimeout(function () { nameInput.focus({ preventScroll: true }); }, 60);
  };

  form.addEventListener('change', function (e) {
    if (e.target === stdBox && TP.pricing) {
      TP.pricing.setMode(stdBox.checked ? 'std' : 'single');
    }
    recalc();
  });

  [nameInput, phoneInput].forEach(function (input) {
    input.addEventListener('input', function () { input.classList.remove('is-invalid'); });
  });

  function validPhone(value) {
    var digits = value.replace(/\D/g, '');
    return digits.length === 10 || (digits.length === 12 && digits.indexOf('52') === 0);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okName = nameInput.value.trim().length >= 2;
    var okPhone = validPhone(phoneInput.value);
    nameInput.classList.toggle('is-invalid', !okName);
    phoneInput.classList.toggle('is-invalid', !okPhone);
    if (!okName || !okPhone) {
      (!okName ? nameInput : phoneInput).focus();
      return;
    }

    var result = recalc();
    var first = nameInput.value.trim().split(/\s+/)[0];
    var folio = 'TP-' + String(Math.floor(1000 + Math.random() * 9000));
    document.getElementById('q-folio').textContent = folio;
    document.getElementById('q-success-name').textContent = first;
    document.getElementById('q-success-text').textContent =
      'Recibimos tu solicitud para el plan ' + result.plan.name +
      (stdBox.checked ? ' + Save the Date' : '') +
      ' con una inversión estimada ' + (result.plan.from ? 'desde ' : 'de ') +
      TP.formatMXN(result.total) + ' MXN. Te escribiremos por WhatsApp para comenzar a trazar tu invitación.';

    form.hidden = true;
    success.hidden = false;
    quote.scrollTop = 0;
    TP.icons();
  });

  document.getElementById('q-new').addEventListener('click', function () {
    form.reset();
    form.querySelector('input[name="plan"][value="gala"]').checked = true;
    form.querySelectorAll('.check-row input').forEach(function (i) { delete i.dataset.prev; });
    form.querySelectorAll('.check-row').forEach(function (r) { r.classList.remove('is-included'); });
    stdBox.checked = TP.pricing.mode === 'std';
    showForm();
    recalc();
    nameInput.focus();
  });

  /* ---------- Disparadores globales ---------- */
  document.addEventListener('click', function (e) {
    var demoBtn = e.target.closest('[data-open-demo]');
    if (demoBtn) {
      TP.openDemo(demoBtn.getAttribute('data-open-demo') || TP.state.event);
      return;
    }
    var quoteBtn = e.target.closest('[data-open-quote]');
    if (quoteBtn) TP.openQuote({});
  });

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  recalc();
})();
