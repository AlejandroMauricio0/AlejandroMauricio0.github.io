/* Lightbox compartido y carrusel responsivo de fotos de la pareja. */
(() => {
  'use strict';

  const { $, $$ } = window.Eventia;

  const lightbox = (() => {
    const dialog = $('#lightbox');
    const img = $('#lightbox-img');
    const caption = $('#lightbox-caption');
    let items = [];
    let current = 0;

    const show = (i) => {
      current = (i + items.length) % items.length;
      img.src = items[current].src;
      img.alt = items[current].alt || '';
      caption.textContent = items.length > 1 ? `${current + 1} / ${items.length}` : '';
    };
    const open = (list, index = 0) => {
      if (!list.length) return;
      items = list;
      dialog.dataset.single = String(list.length < 2);
      show(index);
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.setAttribute('open', '');
    };
    const close = () => {
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.removeAttribute('open');
    };

    $('#lightbox-close').addEventListener('click', close);
    $('#lightbox-prev').addEventListener('click', () => show(current - 1));
    $('#lightbox-next').addEventListener('click', () => show(current + 1));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.addEventListener('keydown', (e) => {
      if (items.length < 2) return;
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
    let touchX = null;
    dialog.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener('touchend', (e) => {
      if (touchX === null || items.length < 2) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      touchX = null;
    });

    return { open };
  })();

  /* ---------- Carrusel responsivo ---------- */
  const initCarousel = () => {
    const root = $('#carousel');
    if (!root) return;
    const viewport = $('#carousel-viewport');
    const track = $('#carousel-track');
    const slides = $$('.carousel__slide', track);
    const dotsWrap = $('#carousel-dots');
    const status = $('#carousel-status');
    const total = slides.length;
    let index = 0;
    let perView = 0;
    let maxIndex = 0;
    let dots = [];

    const items = slides.map((slide) => {
      const image = $('img', slide);
      return { src: image.currentSrc || image.src, alt: image.alt };
    });

    slides.forEach((slide, i) => {
      slide.setAttribute('role', 'group');
      slide.setAttribute('aria-roledescription', 'diapositiva');
      slide.setAttribute('aria-label', `${i + 1} de ${total}`);
    });

    const readPerView = () => Math.max(1, parseInt(getComputedStyle(root).getPropertyValue('--per-view'), 10) || 1);
    const offsetFor = (i) => (slides[i] ? slides[i].offsetLeft : 0);

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      dots = Array.from({ length: maxIndex + 1 }, (_, i) => {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel__dot';
        dot.setAttribute('aria-label', `Ir a la posición ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
      });
    };

    function goTo(i, announce = true) {
      if (i > maxIndex) i = 0;
      if (i < 0) i = maxIndex;
      index = i;
      track.style.transform = `translateX(${-offsetFor(index)}px)`;
      dots.forEach((dot, d) => dot.setAttribute('aria-current', String(d === index)));
      slides.forEach((slide, s) => {
        const visible = s >= index && s < index + perView;
        slide.setAttribute('aria-hidden', String(!visible));
        const btn = $('button', slide);
        if (btn) btn.tabIndex = visible ? 0 : -1;
      });
      if (announce) {
        const last = Math.min(index + perView, total);
        status.textContent = perView > 1 ? `Fotos ${index + 1} a ${last} de ${total}` : `Foto ${index + 1} de ${total}`;
      }
    }

    const layout = () => {
      const pv = readPerView();
      if (pv !== perView) {
        perView = pv;
        maxIndex = Math.max(0, total - perView);
        buildDots();
        index = Math.min(index, maxIndex);
      }
      track.classList.add('no-transition');
      goTo(index, false);
      requestAnimationFrame(() => track.classList.remove('no-transition'));
    };

    $('#carousel-prev').addEventListener('click', () => goTo(index - 1));
    $('#carousel-next').addEventListener('click', () => goTo(index + 1));
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    let startX = 0;
    let startY = 0;
    let deltaX = 0;
    let pointerId = null;
    let dragging = false;
    let suppressClick = false;

    viewport.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointerId = e.pointerId;
      startX = e.clientX;
      startY = e.clientY;
      deltaX = 0;
      dragging = false;
    });
    viewport.addEventListener('pointermove', (e) => {
      if (pointerId !== e.pointerId) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (!dragging) {
        if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(dy)) return;
        dragging = true;
        viewport.setPointerCapture(e.pointerId);
        viewport.classList.add('is-dragging');
        track.classList.add('no-transition');
      }
      deltaX = dx;
      const edge = (index === 0 && dx > 0) || (index === maxIndex && dx < 0);
      track.style.transform = `translateX(${-offsetFor(index) + dx * (edge ? 0.35 : 1)}px)`;
    });
    const endDrag = (e) => {
      if (pointerId !== e.pointerId) return;
      pointerId = null;
      if (!dragging) return;
      dragging = false;
      suppressClick = true;
      setTimeout(() => { suppressClick = false; }, 60);
      viewport.classList.remove('is-dragging');
      track.classList.remove('no-transition');
      const threshold = Math.min(80, viewport.clientWidth * 0.15);
      if (deltaX < -threshold && index < maxIndex) goTo(index + 1);
      else if (deltaX > threshold && index > 0) goTo(index - 1);
      else goTo(index, false);
    };
    viewport.addEventListener('pointerup', endDrag);
    viewport.addEventListener('pointercancel', endDrag);

    slides.forEach((slide, i) => {
      $('button', slide).addEventListener('click', (e) => {
        if (suppressClick) { e.preventDefault(); return; }
        lightbox.open(items, i);
      });
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => layout()).observe(viewport);
    } else {
      window.addEventListener('resize', layout);
    }
    layout();
  };

  Object.assign(window.Eventia, { lightbox, initCarousel });
})();
