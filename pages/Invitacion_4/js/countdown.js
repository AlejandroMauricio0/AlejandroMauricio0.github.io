/* ============================================================
   Invitación 4 · Datos del evento + contador regresivo
   Edita aquí la fecha, el lugar y el WhatsApp: el resto de los
   scripts leen esta configuración desde window.INVITACION.
   ============================================================ */
(function () {
  'use strict';

  var EVENTO = window.INVITACION = {
    titulo: 'Bautizo y Primer Año de Jerónimo Pérez',
    // Sábado 25 de diciembre, 10:00 hrs (hora local del evento).
    // Nota: el 25/dic/2026 cae en viernes; 2027 es el próximo año en que cae en sábado.
    inicio: new Date(2027, 11, 25, 10, 0, 0),
    fin:    new Date(2027, 11, 25, 16, 0, 0),
    zonaHoraria: 'America/Mexico_City',
    lugar: 'Calle Cualquiera 123, Cualquier Lugar',
    whatsapp: '525512345678',          // (55) 1234-5678 con lada de México
    familia: 'Familia Soto Paula'
  };

  var grid = document.getElementById('countdown');
  if (!grid) return;

  var nums = {};
  grid.querySelectorAll('[data-unit]').forEach(function (el) { nums[el.dataset.unit] = el; });
  var done = document.getElementById('countdown-done');
  var timer = null;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function set(unit, value) {
    var el = nums[unit];
    if (!el || el.textContent === value) return;
    el.textContent = value;
    el.classList.remove('tick');
    void el.offsetWidth;            // reinicia la animación
    el.classList.add('tick');
  }

  function update() {
    var diff = EVENTO.inicio.getTime() - Date.now();
    if (diff <= 0) {
      grid.hidden = true;
      if (done) done.hidden = false;
      clearInterval(timer);
      return;
    }
    var s = Math.floor(diff / 1000);
    set('dias', String(Math.floor(s / 86400)));
    set('horas', pad(Math.floor(s / 3600) % 24));
    set('minutos', pad(Math.floor(s / 60) % 60));
    set('segundos', pad(s % 60));
  }

  update();
  timer = setInterval(update, 1000);
})();
