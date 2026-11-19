/* Utilidades compartidas: selectores, datos del evento, almacenamiento, iconos y avisos. */
(() => {
  'use strict';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const SVG_NS = 'http://www.w3.org/2000/svg';

  const EVENT = {
    couple: 'Valeria & Santiago',
    initials: 'V&S',
    dateLine: '17 · ABRIL · 2027 · 17:00 HRS',
    dateISO: '2027-04-17'
  };

  const storage = {
    get(store, key, fallback) {
      try {
        const raw = window[store].getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (err) {
        return fallback;
      }
    },
    set(store, key, value) {
      try {
        window[store].setItem(key, JSON.stringify(value));
        return true;
      } catch (err) {
        return false;
      }
    },
    remove(store, key) {
      try { window[store].removeItem(key); } catch (err) { /* almacenamiento no disponible */ }
    }
  };

  const renderIcons = () => {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons({ attrs: { 'stroke-width': 1.5 } });
    }
  };

  const scrollBehavior = () => (reducedMotion.matches ? 'auto' : 'smooth');

  const toastEl = $('#toast');
  let toastTimer;
  const toast = (message) => {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2400);
  };

  window.Eventia = { $, $$, reducedMotion, SVG_NS, EVENT, storage, renderIcons, scrollBehavior, toast };
})();
