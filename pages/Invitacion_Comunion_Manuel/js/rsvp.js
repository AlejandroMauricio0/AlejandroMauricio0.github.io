/* ============================================================
   Primera Comunión de Manuel · Confirmación de asistencia (RSVP)
   Valida el formulario y abre WhatsApp con el mensaje prellenado.
   ============================================================ */
(function () {
  'use strict';

  var form = document.getElementById('rsvp-form');
  if (!form) return;

  var cfg = window.INVITACION || {};
  var STORAGE_KEY = 'comunion-manuel-rsvp';

  var nameInput = document.getElementById('rsvp-name');
  var guests = document.getElementById('rsvp-guests');
  var msg = document.getElementById('rsvp-msg');
  var choice = form.querySelector('.choice');
  var errName = document.getElementById('err-name');
  var errAtt = document.getElementById('err-attending');
  var done = document.getElementById('rsvp-done');
  var editBtn = document.getElementById('rsvp-edit');

  function attending() {
    var r = form.querySelector('input[name="attending"]:checked');
    return r ? r.value : '';
  }

  function syncGuests() {
    var no = attending() === 'no';
    guests.disabled = no;
    document.getElementById('guests-field').hidden = no;
  }

  function validate() {
    var ok = true;
    var name = nameInput.value.trim();
    if (name.length < 3) {
      errName.textContent = 'Por favor escribe tu nombre o el de tu familia.';
      nameInput.setAttribute('aria-invalid', 'true');
      ok = false;
    } else {
      errName.textContent = '';
      nameInput.removeAttribute('aria-invalid');
    }
    if (!attending()) {
      errAtt.textContent = 'Cuéntanos si podrás acompañarnos.';
      choice.classList.add('is-invalid');
      ok = false;
    } else {
      errAtt.textContent = '';
      choice.classList.remove('is-invalid');
    }
    return ok;
  }

  function buildMessage(data) {
    var lines = ['¡Hola! Soy *' + data.name + '*.'];
    if (data.attending === 'si') {
      lines.push('Con mucho gusto confirmo mi asistencia a la Primera Comunión de Manuel.');
      lines.push('Asistiremos: ' + data.guests + (data.guests === '1' ? ' persona' : ' personas') + '.');
    } else {
      lines.push('Lamentablemente no podré asistir a la Primera Comunión de Manuel.');
    }
    if (data.message) lines.push('', 'Mensaje para Manuel: ' + data.message);
    return lines.join('\n');
  }

  function showDone(data) {
    done.querySelector('[data-rsvp-name]').textContent = data.name;
    done.querySelector('[data-rsvp-text]').textContent = data.attending === 'si'
      ? 'Tu confirmación para ' + data.guests + (data.guests === '1' ? ' persona' : ' personas') + ' quedó lista. ¡Nos vemos pronto!'
      : 'Lamentamos que no puedas acompañarnos; gracias por avisarnos con cariño.';
    form.hidden = true;
    done.hidden = false;
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { /* sin almacenamiento */ }
  }

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); } catch (e) { return null; }
  }

  form.addEventListener('change', function (e) {
    if (e.target.name === 'attending') { syncGuests(); errAtt.textContent = ''; choice.classList.remove('is-invalid'); }
  });
  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim().length >= 3) { errName.textContent = ''; nameInput.removeAttribute('aria-invalid'); }
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validate()) {
      (nameInput.getAttribute('aria-invalid') ? nameInput : form.querySelector('#att-yes')).focus();
      return;
    }
    var data = {
      name: nameInput.value.trim(),
      attending: attending(),
      guests: guests.value,
      message: msg.value.trim()
    };
    var url = 'https://wa.me/' + cfg.whatsapp + '?text=' + encodeURIComponent(buildMessage(data));
    var win = window.open(url, '_blank');
    if (win) win.opener = null; else window.location.href = url;
    save(data);
    showDone(data);
    done.focus();
  });

  editBtn.addEventListener('click', function () {
    done.hidden = true;
    form.hidden = false;
    nameInput.focus();
  });

  // Restaurar una confirmación previa en este dispositivo
  var prevData = load();
  if (prevData && prevData.name) {
    nameInput.value = prevData.name;
    var radio = form.querySelector('input[name="attending"][value="' + prevData.attending + '"]');
    if (radio) radio.checked = true;
    if (prevData.guests) guests.value = prevData.guests;
    msg.value = prevData.message || '';
    showDone(prevData);
  }
  // Contador de caracteres del mensaje
  var count = document.getElementById('msg-count');
  function syncCount() { if (count) count.textContent = msg.value.length; }
  msg.addEventListener('input', syncCount);
  syncCount();
  syncGuests();
})();
