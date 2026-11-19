/* Mesa de regalos: copiar al portapapeles y mostrar/ocultar datos bancarios. */
(() => {
  'use strict';

  const { $, $$, renderIcons, toast } = window.Eventia;

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }
  };

  const initGifts = () => {
    $$('[data-copy-target]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const source = document.getElementById(btn.dataset.copyTarget);
        if (!source) return;
        const ok = await copyText(source.textContent.replace(/\s+/g, ''));
        toast(ok ? 'Copiado al portapapeles' : 'No se pudo copiar');
      });
    });

    const toggle = $('#bank-toggle');
    const details = $('#bank-details');
    details.inert = true;
    toggle.addEventListener('click', () => {
      const open = details.dataset.open !== 'true';
      details.dataset.open = String(open);
      details.inert = !open;
      toggle.setAttribute('aria-expanded', String(open));
      toggle.innerHTML = open
        ? '<i data-lucide="eye-off" aria-hidden="true"></i><span>Ocultar datos</span>'
        : '<i data-lucide="eye" aria-hidden="true"></i><span>Ver datos bancarios</span>';
      renderIcons();
    });
  };

  Object.assign(window.Eventia, { initGifts });
})();
