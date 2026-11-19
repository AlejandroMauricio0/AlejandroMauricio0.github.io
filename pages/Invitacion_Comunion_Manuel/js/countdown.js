/* ============================================================
   Primera Comunión de Manuel · Datos del evento + contador
   Edita aquí fecha, lugar, WhatsApp y nombres: los demás scripts
   leen esta configuración desde window.INVITACION.
   ============================================================ */
(function () {
  'use strict';

  var EVENTO = window.INVITACION = {
    titulo: 'Primera Comunión de Manuel',
    // 25 de junio, 14:00 hrs (hora local). Mes en base 0: 5 = junio.
    // El día de la semana se calcula solo a partir de esta fecha.
    inicio: new Date(2027, 5, 25, 14, 0, 0),
    fin:    new Date(2027, 5, 25, 20, 0, 0),
    fechaLimiteRSVP: new Date(2027, 5, 10),
    zonaHoraria: 'America/Mexico_City',
    lugarNombre: 'Parroquia de San Lorenzo',
    lugar: 'Parroquia de San Lorenzo, Calle Cualquiera 123, Cualquier lugar',
    whatsapp: '525512345678',          // número con lada de país, sin "+" ni espacios
    familia: 'Familia García',
    edad: 9
  };

  /* ---------- Textos de fecha (siempre coherentes con la fecha) ---------- */
  var DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  var d = EVENTO.inicio;
  function pad(n) { return n < 10 ? '0' + n : String(n); }
  function fill(sel, text) {
    document.querySelectorAll(sel).forEach(function (el) { el.textContent = text; });
  }
  fill('[data-fecha-larga]', DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()] + ' de ' + d.getFullYear());
  fill('[data-fecha-corta]', d.getDate() + ' · ' + MESES[d.getMonth()] + ' · ' + d.getFullYear() + ' · ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ' hrs');
  fill('[data-fecha-limite]', EVENTO.fechaLimiteRSVP.getDate() + ' de ' + MESES[EVENTO.fechaLimiteRSVP.getMonth()]);
  fill('[data-edad]', String(EVENTO.edad));

  /* ---------- Mapas ---------- */
  var q = encodeURIComponent(EVENTO.lugar);
  var gm = document.getElementById('map-google');
  var wz = document.getElementById('map-waze');
  if (gm) gm.href = 'https://www.google.com/maps/search/?api=1&query=' + q;
  if (wz) wz.href = 'https://waze.com/ul?q=' + q + '&navigate=yes';

  /* ---------- Calendario (Google + archivo .ics para Apple/Outlook) ---------- */
  function stamp(date) {
    return date.getFullYear() + pad(date.getMonth() + 1) + pad(date.getDate()) + 'T' + pad(date.getHours()) + pad(date.getMinutes()) + '00';
  }
  var details = 'Te esperamos para celebrar la Primera Comunión de Manuel. Con cariño, ' + EVENTO.familia + '.';

  var calToggle = document.getElementById('cal-toggle');
  var calMenu = document.getElementById('cal-menu');
  if (calToggle && calMenu) {
    var setOpen = function (open) {
      calMenu.hidden = !open;
      calToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    };
    calToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(calMenu.hidden);
      if (!calMenu.hidden) calMenu.querySelector('a,button').focus();
    });
    document.addEventListener('click', function (e) {
      if (!calMenu.hidden && !calMenu.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !calMenu.hidden) { setOpen(false); calToggle.focus(); }
    });
    calMenu.addEventListener('click', function () { setTimeout(function () { setOpen(false); }, 0); });
  }

  var gCal = document.getElementById('cal-google');
  if (gCal) {
    gCal.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(EVENTO.titulo) +
      '&dates=' + stamp(EVENTO.inicio) + '/' + stamp(EVENTO.fin) +
      '&ctz=' + encodeURIComponent(EVENTO.zonaHoraria) +
      '&details=' + encodeURIComponent(details) +
      '&location=' + encodeURIComponent(EVENTO.lugar);
  }

  var icsBtn = document.getElementById('cal-ics');
  if (icsBtn) {
    icsBtn.addEventListener('click', function () {
      function esc(s) { return String(s).replace(/([,;\\])/g, '\\$1'); }
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eventia//Comunion Manuel//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:comunion-manuel-' + stamp(EVENTO.inicio) + '@eventia',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        'DTSTART;TZID=' + EVENTO.zonaHoraria + ':' + stamp(EVENTO.inicio),
        'DTEND;TZID=' + EVENTO.zonaHoraria + ':' + stamp(EVENTO.fin),
        'SUMMARY:' + esc(EVENTO.titulo),
        'DESCRIPTION:' + esc(details),
        'LOCATION:' + esc(EVENTO.lugar),
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(EVENTO.titulo), 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'primera-comunion-manuel.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });
  }

  /* ---------- Contador regresivo ---------- */
  var grid = document.getElementById('countdown');
  if (!grid) return;

  var nums = {};
  grid.querySelectorAll('[data-unit]').forEach(function (el) { nums[el.dataset.unit] = el; });
  var done = document.getElementById('countdown-done');
  var timer = null;

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
    set('dias', pad(Math.floor(s / 86400)));
    set('horas', pad(Math.floor(s / 3600) % 24));
    set('minutos', pad(Math.floor(s / 60) % 60));
    set('segundos', pad(s % 60));
  }

  update();
  timer = setInterval(update, 1000);
})();
