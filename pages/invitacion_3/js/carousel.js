/* =========================================================
   Galería: carrusel (flechas, puntos, swipe, teclado),
   rotación aleatoria de polaroids y revelado al hacer scroll
   ========================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Revelado de secciones ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && reveals.length) {
    document.documentElement.classList.add('js-reveal');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Polaroids: rotación aleatoria entre -3deg y 3deg ---------- */
  document.querySelectorAll('[data-polaroids] .polaroid').forEach(function (p, i) {
    var r = 1 + Math.random() * 2;          // 1..3 grados
    if (i % 2 === 0) r = -r;                 // alterna el sentido
    p.style.setProperty('--rot', r.toFixed(1) + 'deg');
  });

  /* ---------- Carrusel ---------- */
  var root = document.querySelector('[data-carousel]');
  if (!root) return;

  var viewport = root.querySelector('.carousel__viewport');
  var track = root.querySelector('.carousel__track');
  var slides = Array.prototype.slice.call(root.querySelectorAll('.carousel__slide'));
  var dotsWrap = root.querySelector('.carousel__dots');
  var status = root.querySelector('[data-status]');
  var total = slides.length;
  if (!total) return;

  var index = 0;
  var autoplay = null;
  var AUTOPLAY_MS = 4500;

  var dots = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'carousel__dot';
    b.setAttribute('aria-label', 'Ver foto ' + (i + 1));
    b.addEventListener('click', function () { goTo(i); restartAutoplay(); });
    dotsWrap.appendChild(b);
    return b;
  });

  function goTo(i, announce) {
    index = (i + total) % total;
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    slides.forEach(function (s, n) { s.setAttribute('aria-hidden', n === index ? 'false' : 'true'); });
    dots.forEach(function (d, n) { d.setAttribute('aria-current', n === index ? 'true' : 'false'); });
    if (status && announce !== false) {
      var cap = slides[index].querySelector('.carousel__caption');
      status.textContent = 'Foto ' + (index + 1) + ' de ' + total + (cap ? ': ' + cap.textContent : '');
    }
  }

  root.querySelector('[data-prev]').addEventListener('click', function () { goTo(index - 1); restartAutoplay(); });
  root.querySelector('[data-next]').addEventListener('click', function () { goTo(index + 1); restartAutoplay(); });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { goTo(index - 1); restartAutoplay(); }
    if (e.key === 'ArrowRight') { goTo(index + 1); restartAutoplay(); }
  });

  // Swipe táctil / arrastre con ratón
  var startX = 0, startY = 0, dx = 0, dragging = false, horizontal = null;

  viewport.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; horizontal = null;
    startX = e.clientX; startY = e.clientY; dx = 0;
    stopAutoplay();
  });

  viewport.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (horizontal === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
      horizontal = Math.abs(dx) > Math.abs(dy);
      if (horizontal) {
        viewport.classList.add('is-dragging');
        try { viewport.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
      }
    }
    if (horizontal) {
      var pct = (dx / viewport.clientWidth) * 100;
      track.style.transform = 'translateX(' + (-index * 100 + pct) + '%)';
    }
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
    if (horizontal && Math.abs(dx) > viewport.clientWidth * 0.18) {
      goTo(dx < 0 ? index + 1 : index - 1);
    } else {
      goTo(index, false);
    }
    startAutoplay();
  }
  viewport.addEventListener('pointerup', endDrag);
  viewport.addEventListener('pointercancel', endDrag);
  viewport.addEventListener('lostpointercapture', endDrag);

  function startAutoplay() {
    if (reduceMotion || autoplay) return;
    autoplay = setInterval(function () { goTo(index + 1, false); }, AUTOPLAY_MS);
  }
  function stopAutoplay() { clearInterval(autoplay); autoplay = null; }
  function restartAutoplay() { stopAutoplay(); startAutoplay(); }

  root.addEventListener('mouseenter', stopAutoplay);
  root.addEventListener('mouseleave', startAutoplay);
  root.addEventListener('focusin', stopAutoplay);
  root.addEventListener('focusout', startAutoplay);

  goTo(0, false);
  startAutoplay();
})();
