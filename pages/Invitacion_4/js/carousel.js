/* ============================================================
   Invitación 4 · Carrusel de fotografías
   Swipe en celular, flechas/teclado en PC, puntos y autoplay suave.
   ============================================================ */
(function () {
  'use strict';

  var root = document.getElementById('carousel');
  if (!root) return;

  var track = root.querySelector('.carousel__track');
  var slides = Array.prototype.slice.call(root.querySelectorAll('.slide'));
  var dotsBox = root.querySelector('.carousel__dots');
  var prev = root.querySelector('.carousel__arrow--prev');
  var next = root.querySelector('.carousel__arrow--next');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var index = 0;
  var autoplay = null;
  var visible = false;
  var DELAY = 5000;

  // Puntos de navegación
  var dots = slides.map(function (_, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'carousel__dot';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-label', 'Foto ' + (i + 1));
    b.addEventListener('click', function () { go(i); restart(); });
    dotsBox.appendChild(b);
    return b;
  });

  function go(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = 'translateX(' + (-index * 100) + '%)';
    dots.forEach(function (d, j) { d.setAttribute('aria-selected', j === index ? 'true' : 'false'); });
    slides.forEach(function (s, j) { s.setAttribute('aria-hidden', j === index ? 'false' : 'true'); });
  }

  function stop() { clearInterval(autoplay); autoplay = null; }
  function restart() {
    stop();
    if (!reduced && visible) autoplay = setInterval(function () { go(index + 1); }, DELAY);
  }

  prev.addEventListener('click', function () { go(index - 1); restart(); });
  next.addEventListener('click', function () { go(index + 1); restart(); });

  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(index - 1); restart(); }
    if (e.key === 'ArrowRight') { go(index + 1); restart(); }
  });

  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', restart);

  // Arrastre / swipe con Pointer Events
  var startX = 0, startY = 0, dx = 0, dragging = false, locked = false;

  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragging = true; locked = false;
    startX = e.clientX; startY = e.clientY; dx = 0;
    stop();
  });

  window.addEventListener('pointermove', function (e) {
    if (!dragging) return;
    dx = e.clientX - startX;
    var dy = e.clientY - startY;
    if (!locked) {
      if (Math.abs(dx) < 6 && Math.abs(dy) < 6) return;
      if (Math.abs(dy) > Math.abs(dx)) { dragging = false; restart(); return; } // scroll vertical
      locked = true;
      track.classList.add('is-dragging');
    }
    var w = root.offsetWidth;
    track.style.transform = 'translateX(calc(' + (-index * 100) + '% + ' + dx + 'px))';
    if (w && Math.abs(dx) > w) dx = dx > 0 ? w : -w;
  });

  function end() {
    if (!dragging) return;
    dragging = false;
    track.classList.remove('is-dragging');
    var threshold = Math.min(80, root.offsetWidth * 0.18);
    if (locked && dx > threshold) go(index - 1);
    else if (locked && dx < -threshold) go(index + 1);
    else go(index);
    restart();
  }
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // Autoplay solo mientras el carrusel está en pantalla
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? restart() : stop();
    }, { threshold: 0.4 }).observe(root);
  }

  go(0);
})();
