/* =========================================================
   RSVP: validación y envío por WhatsApp
   Número destino: atributo data-whatsapp del formulario
   (formato internacional sin "+", ej. 5491112345678)
   ========================================================= */
(function () {
  'use strict';

  var form = document.getElementById('rsvp-form');
  if (!form) return;

  var STORAGE_KEY = 'eventia_inv3_rsvp';
  var phone = form.getAttribute('data-whatsapp');
  var nameInput = form.elements.name;
  var guests = form.elements.guests;
  var message = form.elements.message;
  var guestsBox = form.querySelector('[data-guests]');
  var status = form.querySelector('[data-status]');
  var nameError = form.querySelector('[data-error-for="name"]');
  var guestsError = form.querySelector('[data-error-for="guests"]');
  var MIN = parseInt(guests.min, 10) || 1;
  var MAX = parseInt(guests.max, 10) || 10;

  function attending() {
    var checked = form.querySelector('input[name="attending"]:checked');
    return checked ? checked.value === 'yes' : true;
  }

  // Oculta el número de personas si no podrá asistir
  function syncGuests() {
    var yes = attending();
    guestsBox.hidden = !yes;
    guests.disabled = !yes;
  }

  function clearError(input, error) {
    input.removeAttribute('aria-invalid');
    error.hidden = true;
  }
  function showError(input, error) {
    input.setAttribute('aria-invalid', 'true');
    error.hidden = false;
    input.focus();
  }

  form.querySelectorAll('input[name="attending"]').forEach(function (r) {
    r.addEventListener('change', syncGuests);
  });

  // Botones − / + del campo numérico
  form.querySelectorAll('[data-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var n = parseInt(guests.value, 10) || MIN;
      n = Math.min(MAX, Math.max(MIN, n + parseInt(btn.getAttribute('data-step'), 10)));
      guests.value = n;
      clearError(guests, guestsError);
    });
  });

  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim().length >= 2) clearError(nameInput, nameError);
  });
  guests.addEventListener('input', function () { clearError(guests, guestsError); });

  // Recupera datos previos (si el navegador lo permite)
  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) {
      nameInput.value = saved.name || '';
      if (saved.guests) guests.value = String(saved.guests);
      var radio = form.querySelector('input[name="attending"][value="' + (saved.attending === 'no' ? 'no' : 'yes') + '"]');
      if (radio) radio.checked = true;
    }
  } catch (e) { /* almacenamiento no disponible */ }
  syncGuests();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = nameInput.value.trim().replace(/\s+/g, ' ');
    var yes = attending();
    var n = parseInt(guests.value, 10);
    var msg = message.value.trim();

    if (name.length < 2) { showError(nameInput, nameError); return; }
    if (yes && (isNaN(n) || n < MIN || n > MAX)) { showError(guests, guestsError); return; }

    var lines = [
      '👑 *Confirmación – XV Años de Andrea*',
      '',
      '👤 Nombre: ' + name
    ];
    if (yes) {
      lines.push('✅ Asistencia: Asistiré');
      lines.push('🎟️ Personas: ' + n);
    } else {
      lines.push('❌ Asistencia: No podré asistir');
    }
    if (msg) {
      lines.push('');
      lines.push('💌 Mensaje para Andrea: ' + msg);
    }

    var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(lines.join('\n'));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        name: name, guests: yes ? n : null, attending: yes ? 'yes' : 'no'
      }));
    } catch (err) { /* noop */ }

    status.textContent = yes
      ? '¡Gracias, ' + name + '! Abriendo WhatsApp para enviar tu confirmación…'
      : '¡Gracias por avisar! Abriendo WhatsApp para enviar tu mensaje…';
    status.hidden = false;

    // Sin 'noopener' en features: con él window.open siempre devuelve null
    var win = window.open(url, '_blank');
    if (win) { try { win.opener = null; } catch (err) { /* noop */ } }
    else window.location.href = url;
  });
})();
