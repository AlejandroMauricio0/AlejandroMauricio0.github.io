/* Escena inicial: ramillete de gypsophila, apertura del sobre y aparición progresiva. */
(() => {
  'use strict';

  const { $, $$, reducedMotion, SVG_NS, scrollBehavior } = window.Eventia;

  const mulberry32 = (seed) => () => {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const svgEl = (tag, attrs) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  };

  const buildBouquet = (svg) => {
    if (!svg) return;
    const rand = mulberry32(23);
    const base = { x: 95, y: 158 };
    const stems = svgEl('g', { fill: 'none', stroke: '#9AA894', 'stroke-width': '0.9', 'stroke-linecap': 'round' });
    const leaves = svgEl('g', { fill: '#A9B9A5', 'fill-opacity': '0.85' });
    const florets = svgEl('g', { fill: '#FFFDF9', stroke: '#D6CDBE', 'stroke-width': '0.45' });
    const total = 13;
    const quad = (t, a, c, e) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * e;

    for (let i = 0; i < total; i += 1) {
      const angle = ((-152 + (124 * i) / (total - 1)) + (rand() - 0.5) * 10) * (Math.PI / 180);
      const len = 88 + rand() * 46;
      const ex = base.x + Math.cos(angle) * len;
      const ey = base.y + Math.sin(angle) * len;
      const cx = base.x + Math.cos(angle) * len * 0.5 + (rand() - 0.5) * 20;
      const cy = base.y + Math.sin(angle) * len * 0.5;
      stems.appendChild(svgEl('path', { d: `M${base.x} ${base.y} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}` }));

      if (i % 3 === 1) {
        const t = 0.45 + rand() * 0.2;
        const lx = quad(t, base.x, cx, ex);
        const ly = quad(t, base.y, cy, ey);
        const rot = (angle * 180) / Math.PI + (rand() > 0.5 ? 35 : -35);
        leaves.appendChild(svgEl('ellipse', {
          cx: lx.toFixed(1), cy: ly.toFixed(1), rx: '7', ry: '2.5',
          transform: `rotate(${rot.toFixed(1)} ${lx.toFixed(1)} ${ly.toFixed(1)})`
        }));
      }

      const branches = 3 + Math.floor(rand() * 3);
      for (let j = 0; j < branches; j += 1) {
        const t = 0.62 + rand() * 0.38;
        const px = quad(t, base.x, cx, ex);
        const py = quad(t, base.y, cy, ey);
        const bx = px + (rand() - 0.5) * 24;
        const by = py - 4 - rand() * 13;
        stems.appendChild(svgEl('path', { d: `M${px.toFixed(1)} ${py.toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`, 'stroke-width': '0.6' }));
        const count = 3 + Math.floor(rand() * 4);
        for (let k = 0; k < count; k += 1) {
          florets.appendChild(svgEl('circle', {
            cx: (bx + (rand() - 0.5) * 7).toFixed(1),
            cy: (by + (rand() - 0.5) * 7).toFixed(1),
            r: (1.3 + rand() * 1.3).toFixed(2)
          }));
        }
      }
    }
    svg.append(stems, leaves, florets);
  };

  /* ---------- Aparición progresiva ---------- */
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

  const startReveal = () => {
    const items = $$('#invitation .reveal');
    if (!revealObserver) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    items.forEach((el) => revealObserver.observe(el));
  };

  /* ---------- Sobre: closed → opening → opened (permanente) ---------- */
  const initEnvelope = () => {
    const scene = $('#envelope-scene');
    const seal = $('#wax-seal');
    const inner = $('#envelope-inner');
    const invitation = $('#invitation');
    const cue = $('#scroll-cue');
    const status = $('#envelope-status');

    const goToContent = (e) => {
      e.preventDefault();
      $('#hero').scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    };
    $('#enter-btn').addEventListener('click', goToContent);
    cue.addEventListener('click', goToContent);

    const open = () => {
      if (scene.dataset.state !== 'closed') return;
      scene.dataset.state = 'opening';
      seal.setAttribute('aria-expanded', 'true');
      status.textContent = 'Abriendo la invitación…';

      const duration = reducedMotion.matches ? 450 : 2100;
      window.setTimeout(() => {
        scene.dataset.state = 'opened';
        seal.disabled = true;
        seal.setAttribute('aria-hidden', 'true');
        inner.inert = false;
        inner.removeAttribute('inert');
        invitation.inert = false;
        invitation.removeAttribute('inert');
        cue.removeAttribute('tabindex');
        document.body.classList.remove('is-locked');
        status.textContent = 'Invitación abierta. Desliza para conocer todos los detalles.';
        startReveal();
        $('#enter-btn').focus({ preventScroll: true });
      }, duration);
    };

    seal.addEventListener('click', open);
  };

  Object.assign(window.Eventia, { buildBouquet, initEnvelope });
})();
