/* ============================================================
   Invitación 4 · Utilidades generales
   Revelado al hacer scroll, calendario, mapas, WhatsApp y
   música ambiental tipo caja musical (Web Audio, sin archivos).
   ============================================================ */
(function () {
  'use strict';

  var cfg = window.INVITACION || {};

  /* ---------- Revelado al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Calendario ---------- */
  function stamp(d) {
    function p(n) { return (n < 10 ? '0' : '') + n; }
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + 'T' + p(d.getHours()) + p(d.getMinutes()) + '00';
  }
  var details = 'Te esperamos para celebrar el Bautizo y el Primer Año de Jerónimo. Con cariño, ' + cfg.familia + '.';

  var gLink = document.getElementById('cal-google');
  if (gLink && cfg.inicio) {
    gLink.href = 'https://calendar.google.com/calendar/render?action=TEMPLATE' +
      '&text=' + encodeURIComponent(cfg.titulo) +
      '&dates=' + stamp(cfg.inicio) + '/' + stamp(cfg.fin) +
      '&ctz=' + encodeURIComponent(cfg.zonaHoraria) +
      '&details=' + encodeURIComponent(details) +
      '&location=' + encodeURIComponent(cfg.lugar);
  }

  var icsBtn = document.getElementById('cal-ics');
  if (icsBtn && cfg.inicio) {
    icsBtn.addEventListener('click', function () {
      function esc(s) { return String(s).replace(/([,;\\])/g, '\\$1'); }
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Eventia//Invitacion 4//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
        'BEGIN:VEVENT',
        'UID:bautizo-jeronimo-' + stamp(cfg.inicio) + '@eventia',
        'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
        'DTSTART;TZID=' + cfg.zonaHoraria + ':' + stamp(cfg.inicio),
        'DTEND;TZID=' + cfg.zonaHoraria + ':' + stamp(cfg.fin),
        'SUMMARY:' + esc(cfg.titulo),
        'DESCRIPTION:' + esc(details),
        'LOCATION:' + esc(cfg.lugar),
        'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:' + esc(cfg.titulo), 'END:VALARM',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'bautizo-jeronimo.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    });
  }

  /* ---------- Mapas ---------- */
  var q = encodeURIComponent(cfg.lugar || '');
  var gm = document.getElementById('map-google');
  var wz = document.getElementById('map-waze');
  if (gm) gm.href = 'https://www.google.com/maps/search/?api=1&query=' + q;
  if (wz) wz.href = 'https://waze.com/ul?q=' + q + '&navigate=yes';

  /* ---------- WhatsApp para dudas ---------- */
  var wa = document.getElementById('wa-help');
  if (wa) wa.href = 'https://wa.me/' + cfg.whatsapp + '?text=' +
    encodeURIComponent('¡Hola! Tengo una duda sobre el Bautizo de Jerónimo.');

  /* ---------- Música ambiental: caja musical ---------- */
  var btn = document.getElementById('music-toggle');
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!btn) return;
  if (!AC) { btn.hidden = true; return; }

  // Canción de cuna original en 3/4: [nota MIDI, tiempos]; null = silencio
  var MELODY = [
    [76, 2], [79, 1], [84, 2], [83, 1], [81, 2], [79, 1], [76, 3],
    [77, 2], [81, 1], [79, 2], [76, 1], [74, 2], [72, 1], [74, 3],
    [76, 2], [79, 1], [84, 2], [86, 1], [84, 2], [79, 1], [81, 3],
    [79, 2], [77, 1], [76, 2], [74, 1], [72, 3], [null, 3]
  ];
  var BASS = [48, 52, 53, 48, 53, 48, 43, 43, 48, 52, 48, 53, 43, 43, 48, 48];
  var BEAT = 0.6;

  var ctx = null, master = null, loopTimer = null;

  function midi(n) { return 440 * Math.pow(2, (n - 69) / 12); }

  function pluck(note, t, gain, decay) {
    var f = midi(note);
    var env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, t);
    env.gain.exponentialRampToValueAtTime(gain, t + 0.008);
    env.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    env.connect(master);
    [[1, 1], [4.2, 0.12], [2, 0.18]].forEach(function (h) {
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = f * h[0];
      g.gain.value = h[1];
      o.connect(g); g.connect(env);
      o.start(t); o.stop(t + decay + 0.05);
    });
  }

  function scheduleLoop(start) {
    var t = start;
    MELODY.forEach(function (m) {
      if (m[0] !== null) pluck(m[0], t, 0.22, 2.2);
      t += m[1] * BEAT;
    });
    BASS.forEach(function (n, i) {
      var bt = start + i * 3 * BEAT;
      pluck(n, bt, 0.12, 2.6);
      pluck(n + 7, bt + BEAT, 0.05, 1.6);
      pluck(n + 12, bt + 2 * BEAT, 0.05, 1.6);
    });
    var len = t - start;
    loopTimer = setTimeout(function () { scheduleLoop(start + len); }, (start + len - ctx.currentTime - 0.4) * 1000);
  }

  function play() {
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.0001;
    // Eco suave para dar sensación de espacio
    var delay = ctx.createDelay();
    var fb = ctx.createGain();
    var wet = ctx.createGain();
    delay.delayTime.value = 0.32; fb.gain.value = 0.28; wet.gain.value = 0.22;
    master.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(ctx.destination);
    master.gain.exponentialRampToValueAtTime(0.6, ctx.currentTime + 1.2);
    scheduleLoop(ctx.currentTime + 0.1);
    btn.setAttribute('aria-pressed', 'true');
    btn.setAttribute('aria-label', 'Pausar música ambiental');
  }

  function pause() {
    clearTimeout(loopTimer);
    var c = ctx;
    master.gain.cancelScheduledValues(c.currentTime);
    master.gain.setTargetAtTime(0.0001, c.currentTime, 0.15);
    setTimeout(function () { c.close(); }, 700);
    ctx = null;
    btn.setAttribute('aria-pressed', 'false');
    btn.setAttribute('aria-label', 'Reproducir música ambiental');
  }

  btn.addEventListener('click', function () { ctx ? pause() : play(); });
})();
