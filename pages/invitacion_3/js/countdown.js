/* =========================================================
   Cuenta regresiva + "Save the Date"
   Fecha objetivo: atributo data-countdown (hora local)
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Datos del evento (para el calendario) ---------- */
  var EVENT = {
    title: 'XV Años de Andrea',
    start: '20270814T180000',          // 14 ago 2027, 18:00
    end: '20270815T030000',            // 15 ago 2027, 03:00
    startIso: '2027-08-14T18:00:00',
    endIso: '2027-08-15T03:00:00',
    timezone: 'America/Argentina/Buenos_Aires',
    location: 'Quinta Los Álamos, Pinamar',
    details: '18:00 Misa de Acción de Gracias · 20:00 Recepción y fiesta en Quinta Los Álamos. ¡Te espero! #LosXVDeAndrea'
  };

  /* ---------- Contador ---------- */
  var root = document.querySelector('[data-countdown]');
  if (root) {
    var target = new Date(root.getAttribute('data-countdown')).getTime();
    var units = {
      days: root.querySelector('[data-unit="days"]'),
      hours: root.querySelector('[data-unit="hours"]'),
      minutes: root.querySelector('[data-unit="minutes"]'),
      seconds: root.querySelector('[data-unit="seconds"]')
    };
    var doneMsg = document.querySelector('[data-countdown-done]');
    var timer = null;

    var pad = function (n) { return n < 10 ? '0' + n : String(n); };
    var set = function (el, value, bump) {
      if (!el || el.textContent === value) return;
      el.textContent = value;
      if (bump) {
        el.classList.remove('is-bumped');
        void el.offsetWidth; // reinicia la animación
        el.classList.add('is-bumped');
      }
    };

    var render = function () {
      var diff = Math.max(0, target - Date.now());
      var s = Math.floor(diff / 1000);
      set(units.days, pad(Math.floor(s / 86400)));
      set(units.hours, pad(Math.floor((s % 86400) / 3600)));
      set(units.minutes, pad(Math.floor((s % 3600) / 60)));
      set(units.seconds, pad(s % 60), true);
      if (diff === 0) {
        clearInterval(timer);
        if (doneMsg) doneMsg.hidden = false;
      }
    };

    if (!isNaN(target)) {
      render();
      timer = setInterval(render, 1000);
    }
  }

  /* ---------- Agendar en calendario ---------- */
  var cal = document.querySelector('[data-calendar]');
  if (!cal) return;

  var toggle = cal.querySelector('[data-calendar-toggle]');
  var menu = cal.querySelector('.calendar__menu');
  var enc = encodeURIComponent;

  cal.querySelector('[data-cal="google"]').href =
    'https://calendar.google.com/calendar/render?action=TEMPLATE' +
    '&text=' + enc(EVENT.title) +
    '&dates=' + EVENT.start + '/' + EVENT.end +
    '&ctz=' + enc(EVENT.timezone) +
    '&location=' + enc(EVENT.location) +
    '&details=' + enc(EVENT.details);

  cal.querySelector('[data-cal="outlook"]').href =
    'https://outlook.live.com/calendar/0/deeplink/compose?path=%2Fcalendar%2Faction%2Fcompose&rru=addevent' +
    '&subject=' + enc(EVENT.title) +
    '&startdt=' + enc(EVENT.startIso) +
    '&enddt=' + enc(EVENT.endIso) +
    '&location=' + enc(EVENT.location) +
    '&body=' + enc(EVENT.details);

  function icsEscape(t) { return t.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n'); }

  function stamp() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return d.getUTCFullYear() + p(d.getUTCMonth() + 1) + p(d.getUTCDate()) + 'T' +
      p(d.getUTCHours()) + p(d.getUTCMinutes()) + p(d.getUTCSeconds()) + 'Z';
  }

  cal.querySelector('[data-cal="ics"]').addEventListener('click', function (e) {
    e.preventDefault();
    var ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EVENTIA//XV Andrea//ES',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:xv-andrea-20270814@eventia',
      'DTSTAMP:' + stamp(),
      'DTSTART:' + EVENT.start,
      'DTEND:' + EVENT.end,
      'SUMMARY:' + icsEscape(EVENT.title),
      'LOCATION:' + icsEscape(EVENT.location),
      'DESCRIPTION:' + icsEscape(EVENT.details),
      'BEGIN:VALARM',
      'TRIGGER:-P1D',
      'ACTION:DISPLAY',
      'DESCRIPTION:Mañana son los XV de Andrea',
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'XV-Andrea.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    close();
  });

  function open() { menu.hidden = false; toggle.setAttribute('aria-expanded', 'true'); }
  function close() { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }

  toggle.addEventListener('click', function () { if (menu.hidden) open(); else close(); });
  document.addEventListener('click', function (e) { if (!cal.contains(e.target)) close(); });
  cal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { close(); toggle.focus(); }
  });
  menu.querySelectorAll('a:not([data-cal="ics"])').forEach(function (a) {
    a.addEventListener('click', function () { setTimeout(close, 100); });
  });
})();
