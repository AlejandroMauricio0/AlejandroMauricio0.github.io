/* =========================================================
   RSVP: validación y envío por WhatsApp
   Número destino: atributo data-whatsapp del formulario
   ========================================================= */
(function () {
  'use strict';

  var form = document.getElementById('rsvp-form');
  if (!form) return;

  var STORAGE_KEY = 'eventia_inv2_rsvp';
  var phone = form.getAttribute('data-whatsapp');
  var nameInput = form.elements.name;
  var adults = form.elements.adults;
  var kids = form.elements.kids;
  var guestsBox = form.querySelector('[data-guests]');
  var status = form.querySelector('[data-status]');
  var nameError = form.querySelector('[data-error-for="name"]');
  var guestsError = form.querySelector('[data-error-for="guests"]');

  function clamp(input) {
    var min = Number(input.min) || 0;
    var max = Number(input.max) || 10;
    var v = parseInt(input.value, 10);
    if (isNaN(v)) v = min;
    input.value = Math.min(max, Math.max(min, v));
    return Number(input.value);
  }

  function attending() {
    var checked = form.querySelector('input[name="attending"]:checked');
    return checked ? checked.value === 'yes' : true;
  }

  function syncGuests() {
    var on = attending();
    guestsBox.classList.toggle('is-disabled', !on);
    guestsBox.querySelectorAll('input, button').forEach(function (el) { el.disabled = !on; });
    if (!on) guestsError.hidden = true;
  }

  // Botones + / −
  form.querySelectorAll('[data-step]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = document.getElementById(btn.getAttribute('data-target'));
      input.value = (parseInt(input.value, 10) || 0) + Number(btn.getAttribute('data-step'));
      clamp(input);
      guestsError.hidden = true;
    });
  });
  [adults, kids].forEach(function (input) {
    input.addEventListener('change', function () { clamp(input); });
  });

  form.querySelectorAll('input[name="attending"]').forEach(function (r) {
    r.addEventListener('change', syncGuests);
  });

  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim().length >= 2) {
      nameInput.removeAttribute('aria-invalid');
      nameError.hidden = true;
    }
  });

  // Recupera datos previos (si el navegador lo permite)
  try {
    var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (saved) {
      nameInput.value = saved.name || '';
      adults.value = saved.adults != null ? saved.adults : adults.value;
      kids.value = saved.kids != null ? saved.kids : kids.value;
      var radio = form.querySelector('input[name="attending"][value="' + (saved.attending === 'no' ? 'no' : 'yes') + '"]');
      if (radio) radio.checked = true;
    }
  } catch (e) { /* almacenamiento no disponible */ }
  syncGuests();

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = nameInput.value.trim().replace(/\s+/g, ' ');
    var yes = attending();
    var a = clamp(adults);
    var k = clamp(kids);
    var ok = true;

    if (name.length < 2) {
      nameInput.setAttribute('aria-invalid', 'true');
      nameError.hidden = false;
      ok = false;
    }
    if (yes && a + k < 1) {
      guestsError.hidden = false;
      ok = false;
    }
    if (!ok) {
      (name.length < 2 ? nameInput : adults).focus();
      return;
    }

    var lines = [
      '🎮 *Confirmación – Fiesta de Ricardo Soto*',
      '',
      '👤 Nombre: ' + name
    ];
    if (yes) {
      lines.push('✅ Asistencia: ¡Sí, ahí estaré!');
      lines.push('🧑 Adultos: ' + a);
      lines.push('🧒 Niños: ' + k);
      lines.push('👥 Total: ' + (a + k));
    } else {
      lines.push('❌ Asistencia: No podré asistir');
      lines.push('¡Le mando un abrazo a Ricardo en su cumpleaños!');
    }

    var url = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(lines.join('\n'));

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        name: name, adults: a, kids: k, attending: yes ? 'yes' : 'no'
      }));
    } catch (err) { /* noop */ }

    status.textContent = yes
      ? '¡Jugador registrado! Abriendo WhatsApp para enviar tu confirmación…'
      : '¡Gracias por avisar! Abriendo WhatsApp para enviar tu mensaje…';
    status.hidden = false;

    var win = window.open(url, '_blank', 'noopener');
    if (!win) window.location.href = url;
  });
})();
