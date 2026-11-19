/* ==========================================================================
   Trazo & Papel — Mesa de trabajo del Hero
   Datos de los 4 eventos, tabs, tarjeta muestra, reglas, menú y reveal.
   Scripts clásicos (no módulos) para que funcione también vía file://
   ========================================================================== */
(function () {
  'use strict';

  var TP = (window.TP = window.TP || {});

  /* ---------- Datos de las invitaciones muestra ---------- */
  TP.events = {
    boda: {
      kicker: 'Nos casamos',
      namesHtml: 'Valeria <em>&amp;</em> Mateo',
      names: 'Valeria & Mateo',
      monogram: 'V&M',
      seal: 'VM',
      dateShort: '13 · 03 · 27',
      dateMini: 'Sáb 13 mar 2027',
      dateLong: 'Sábado 13 de marzo, 2027',
      time: '17:00 h · Ceremonia',
      venue: 'Hacienda San Gabriel',
      city: 'Cuernavaca, Morelos',
      track: "Can't Help Falling in Love · piano",
      slug: 'valeria-y-mateo',
      message: 'Con la bendición de nuestros padres, te invitamos a celebrar nuestro matrimonio.',
      pass: 'Familia Hernández',
      seats: 4,
      plan: 'gala',
      colors: { bg: '#FFFDF8', ink: '#1E2B22', accent: '#A88A4E', soft: '#EDE6D5', seal: '#8E2430', extra: '#9CAF88' }
    },
    xv: {
      kicker: 'Mis XV Años',
      namesHtml: 'Sofía <em>Renata</em>',
      names: 'Sofía Renata',
      monogram: 'SR',
      seal: 'SR',
      dateShort: '22 · 05 · 27',
      dateMini: 'Sáb 22 may 2027',
      dateLong: 'Sábado 22 de mayo, 2027',
      time: '20:00 h · Recepción',
      venue: 'Salón Los Candiles',
      city: 'Puebla, Puebla',
      track: 'A Thousand Years · cuerdas',
      slug: 'sofia-renata-xv',
      message: 'Acompáñame a celebrar el inicio de una nueva etapa, rodeada de las personas que más quiero.',
      pass: 'Familia Ortega',
      seats: 3,
      plan: 'gala',
      colors: { bg: '#FFF7F7', ink: '#5B2333', accent: '#B9877F', soft: '#F6E1E4', seal: '#B76E79', extra: '#E7C9A0' }
    },
    cumple: {
      kicker: '¡Celebremos mis 40!',
      namesHtml: 'Diego <em>Morales</em>',
      names: 'Diego Morales',
      monogram: 'DM',
      seal: '40',
      dateShort: '09 · 10 · 27',
      dateMini: 'Sáb 9 oct 2027',
      dateLong: 'Sábado 9 de octubre, 2027',
      time: '21:00 h · Cóctel',
      venue: 'Terraza Cielo Rooftop',
      city: 'Ciudad de México',
      track: 'Fly Me to the Moon · jazz',
      slug: 'diego-cuarenta',
      message: 'Una noche de cóctel, jazz y buenos amigos para brindar por cuatro décadas.',
      pass: 'Ana & Rodrigo',
      seats: 2,
      plan: 'esencial',
      colors: { bg: '#1C2541', ink: '#F5EBDD', accent: '#E0A458', soft: '#27315A', seal: '#B5651D', extra: '#3A506B' }
    },
    baby: {
      kicker: 'Baby Shower',
      namesHtml: 'Bienvenido <em>Lucas</em>',
      names: 'Bienvenido Lucas',
      monogram: 'L',
      seal: 'L',
      dateShort: '18 · 07 · 27',
      dateMini: 'Dom 18 jul 2027',
      dateLong: 'Domingo 18 de julio, 2027',
      time: '13:00 h · Brunch',
      venue: 'Jardín Casa Olivo',
      city: 'Querétaro, Qro.',
      track: 'Twinkle Twinkle · caja de música',
      slug: 'bienvenido-lucas',
      message: 'Estamos por conocer al amor más pequeño de la casa. ¡Celebra con nosotros!',
      pass: 'Familia Ruiz',
      seats: 3,
      plan: 'esencial',
      colors: { bg: '#F4F9FC', ink: '#24435C', accent: '#6F9CC2', soft: '#DCEAF4', seal: '#6F9CC2', extra: '#F2D7A6' }
    }
  };

  TP.state = TP.state || { event: 'boda' };

  TP.icons = function () {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  /** Aplica la paleta de un evento como variables CSS sobre un elemento. */
  TP.applyPalette = function (el, key) {
    var c = TP.events[key].colors;
    el.style.setProperty('--c-bg', c.bg);
    el.style.setProperty('--c-ink', c.ink);
    el.style.setProperty('--c-accent', c.accent);
    el.style.setProperty('--c-soft', c.soft);
    el.style.setProperty('--seal', c.seal);
  };

  /* ---------- Mesa de trabajo ---------- */
  var card = document.getElementById('wb-card');
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.wb-tab'));
  var swatches = document.querySelectorAll('#wb-swatches .swatch');
  var slug = document.getElementById('wb-slug');

  function setEvent(key, focusTab) {
    var ev = TP.events[key];
    if (!ev || !card) return;
    TP.state.event = key;

    tabs.forEach(function (t) {
      var on = t.getAttribute('data-event') === key;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      if (on && focusTab) t.focus();
    });

    TP.applyPalette(card, key);
    card.querySelectorAll('[data-wb]').forEach(function (n) {
      var field = n.getAttribute('data-wb');
      if (field === 'names') n.innerHTML = ev.namesHtml;
      else n.textContent = ev[field];
    });
    document.querySelectorAll('.workbench [data-wb]').forEach(function (n) {
      if (card.contains(n)) return;
      var field = n.getAttribute('data-wb');
      n.textContent = ev[field];
      if (field === 'track') n.title = ev.track;
    });
    var c = ev.colors;
    [c.bg, c.extra, c.accent].forEach(function (color, i) {
      if (swatches[i]) swatches[i].style.background = color;
    });
    if (slug) slug.textContent = '/' + ev.slug;
    card.setAttribute('aria-label', 'Abrir vista previa completa: ' + ev.names);

    card.classList.remove('is-swapping');
    void card.offsetWidth; // reinicia la animación
    card.classList.add('is-swapping');
  }
  TP.setWorkbenchEvent = setEvent;

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { setEvent(tab.getAttribute('data-event')); });
    tab.addEventListener('keydown', function (e) {
      var dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!dir) return;
      e.preventDefault();
      var next = tabs[(i + dir + tabs.length) % tabs.length];
      setEvent(next.getAttribute('data-event'), true);
    });
  });

  if (card) {
    card.addEventListener('click', function () {
      if (TP.openDemo) TP.openDemo(TP.state.event);
    });
    setEvent('boda');
  }

  /* ---------- Reglas graduadas ---------- */
  function buildRulers() {
    document.querySelectorAll('[data-ruler]').forEach(function (ruler) {
      var axis = ruler.getAttribute('data-ruler');
      var size = axis === 'x' ? ruler.clientWidth : ruler.clientHeight;
      var html = '';
      for (var p = 80, n = 1; p < size - 20; p += 80, n++) {
        var pos = axis === 'x' ? 'left:' + p + 'px' : 'top:' + p + 'px';
        html += '<span class="mat-ruler__num" style="' + pos + '">' + n * 10 + '</span>';
      }
      ruler.innerHTML = html;
    });
  }
  buildRulers();
  var rulerTimer;
  window.addEventListener('resize', function () {
    clearTimeout(rulerTimer);
    rulerTimer = setTimeout(buildRulers, 150);
  });

  /* ---------- Menú móvil ---------- */
  var menuBtn = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a, button')) {
        menu.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- Portafolio: respaldo si no carga la imagen ---------- */
  function renderFallback(media) {
    var holder = media.querySelector('[data-fallback]');
    if (!holder || holder.childElementCount) return;
    var key = holder.getAttribute('data-fallback');
    var ev = TP.events[key];
    holder.innerHTML =
      '<span class="invite-card" style="max-width:68%;pointer-events:none">' +
      '<span class="invite-card__frame"></span><span class="invite-card__inner">' +
      '<span class="invite-card__kicker">' + ev.kicker + '</span>' +
      '<span class="invite-card__monogram">' + ev.monogram.replace('&', '&amp;') + '</span>' +
      '<span class="invite-card__names">' + ev.namesHtml + '</span>' +
      '<span class="invite-card__rule"></span>' +
      '<span class="invite-card__date">' + ev.dateShort + '</span></span></span>';
    TP.applyPalette(holder.firstChild, key);
    media.classList.add('is-fallback');
  }
  document.querySelectorAll('.portfolio-card__media img').forEach(function (img) {
    var media = img.parentNode;
    if (img.complete && img.naturalWidth === 0) renderFallback(media);
    img.addEventListener('error', function () { renderFallback(media); });
  });

  /* ---------- Aparición al hacer scroll ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  TP.icons();
})();
