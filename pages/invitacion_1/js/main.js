/* Arranque de la invitación: inicializa todos los módulos. */
(() => {
  'use strict';

  const {
    $, $$, renderIcons, buildBouquet, initEnvelope, initCountdown,
    initCarousel, initGifts, initRSVP, initAlbum
  } = window.Eventia;

  const guardImages = () => {
    $$('.photo-frame img').forEach((img) => {
      const mark = () => img.classList.add('is-missing');
      if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) mark();
      img.addEventListener('error', mark);
      img.addEventListener('load', () => img.classList.remove('is-missing'));
    });
  };

  const init = () => {
    guardImages();
    buildBouquet($('#bouquet'));
    renderIcons();
    initEnvelope();
    initCountdown();
    initCarousel();
    initGifts();
    initRSVP();
    initAlbum();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
