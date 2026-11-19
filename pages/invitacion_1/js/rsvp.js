/* Confirmación de asistencia y generación del pase con código QR. */
(() => {
  'use strict';

  const { $, $$, EVENT, storage, renderIcons, scrollBehavior, toast } = window.Eventia;

  const RSVP_KEY = 'eventia-rsvp';

  const makeFolio = () => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const bytes = new Uint8Array(6);
    window.crypto.getRandomValues(bytes);
    return `VS27-${Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('')}`;
  };

  const slugify = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
      ctx.roundRect(x, y, w, h, r);
    } else {
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
  };

  const fitFont = (ctx, text, maxWidth, weight, size, family) => {
    let s = size;
    do {
      ctx.font = `${weight} ${s}px ${family}`;
      s -= 2;
    } while (ctx.measureText(text).width > maxWidth && s > 24);
  };

  const spacing = (ctx, value) => { if ('letterSpacing' in ctx) ctx.letterSpacing = value; };

  const downloadPass = async (data, qrHost) => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const source = $('canvas', qrHost) || $('img', qrHost);
    const W = 1080;
    const H = 1620;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    const serif = '"Cormorant Garamond", Georgia, serif';
    const label = 'Montserrat, sans-serif';

    ctx.fillStyle = '#F5F0E8';
    ctx.fillRect(0, 0, W, H);
    roundRect(ctx, 50, 50, W - 100, H - 100, 32);
    ctx.fillStyle = '#FFFDF9';
    ctx.fill();
    ctx.strokeStyle = '#E5DDD2';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    roundRect(ctx, 50, 50, W - 100, 420, 32);
    ctx.clip();
    const band = ctx.createLinearGradient(0, 50, 0, 470);
    band.addColorStop(0, 'rgba(198,180,157,0.32)');
    band.addColorStop(1, 'rgba(198,180,157,0.05)');
    ctx.fillStyle = band;
    ctx.fillRect(50, 50, W - 100, 420);
    ctx.restore();

    ctx.textAlign = 'center';
    ctx.fillStyle = '#968A7C';
    ctx.font = `600 26px ${label}`;
    spacing(ctx, '6px');
    ctx.fillText('PASE DE ACCESO', W / 2, 170);
    spacing(ctx, '0px');
    ctx.fillStyle = '#45413D';
    fitFont(ctx, EVENT.couple, W - 200, 500, 104, serif);
    ctx.fillText(EVENT.couple, W / 2, 300);
    ctx.fillStyle = '#9E7621';
    ctx.font = `500 24px ${label}`;
    spacing(ctx, '5px');
    ctx.fillText(EVENT.dateLine, W / 2, 380);
    spacing(ctx, '0px');

    ctx.setLineDash([14, 10]);
    ctx.strokeStyle = '#E5DDD2';
    ctx.beginPath();
    ctx.moveTo(110, 470);
    ctx.lineTo(W - 110, 470);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#F5F0E8';
    [50, W - 50].forEach((x) => { ctx.beginPath(); ctx.arc(x, 470, 30, 0, Math.PI * 2); ctx.fill(); });

    const qrSize = 560;
    const qrX = (W - qrSize) / 2;
    const qrY = 540;
    roundRect(ctx, qrX - 28, qrY - 28, qrSize + 56, qrSize + 56, 24);
    ctx.fillStyle = '#FFFDF9';
    ctx.fill();
    ctx.strokeStyle = '#E5DDD2';
    ctx.stroke();
    if (source) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(source, qrX, qrY, qrSize, qrSize);
    }

    ctx.fillStyle = '#968A7C';
    ctx.font = `600 24px ${label}`;
    spacing(ctx, '5px');
    ctx.fillText('INVITADO', W / 2, 1250);
    spacing(ctx, '0px');
    ctx.fillStyle = '#45413D';
    fitFont(ctx, data.name, W - 220, 500, 72, serif);
    ctx.fillText(data.name, W / 2, 1330);

    const colL = W / 2 - 220;
    const colR = W / 2 + 220;
    ctx.fillStyle = '#968A7C';
    ctx.font = `600 24px ${label}`;
    spacing(ctx, '5px');
    ctx.fillText('LUGARES', colL, 1420);
    ctx.fillText('FOLIO', colR, 1420);
    spacing(ctx, '0px');
    ctx.fillStyle = '#45413D';
    ctx.font = `500 60px ${serif}`;
    ctx.fillText(String(data.guests), colL, 1490);
    ctx.font = '500 40px "DM Sans", sans-serif';
    spacing(ctx, '3px');
    ctx.fillText(data.folio, colR, 1485);
    spacing(ctx, '0px');

    canvas.toBlob((blob) => {
      if (!blob) { toast('No se pudo generar la imagen'); return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pase-boda-${slugify(data.name) || 'invitado'}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      toast('Pase descargado');
    }, 'image/png');
  };

  const initRSVP = () => {
    const form = $('#rsvp-form');
    const container = $('#rsvp-container');
    const nameInput = $('#rsvp-name');
    const nameError = $('#rsvp-name-error');
    const attendanceError = $('#rsvp-attendance-error');
    const guestsField = $('#rsvp-guests-field');
    const guestsSelect = $('#rsvp-guests');
    const messageInput = $('#rsvp-message');

    $$('input[name="attendance"]', form).forEach((radio) => {
      radio.addEventListener('change', () => {
        attendanceError.textContent = '';
        guestsField.hidden = form.elements.attendance.value === 'no';
      });
    });
    nameInput.addEventListener('input', () => {
      if (nameInput.value.trim().length >= 3) {
        nameInput.removeAttribute('aria-invalid');
        nameError.textContent = '';
      }
    });

    const showForm = () => {
      $$('.rsvp-result', container).forEach((el) => el.remove());
      form.hidden = false;
      container.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
      nameInput.focus({ preventScroll: true });
    };

    const renderResult = (data, { scroll = true } = {}) => {
      form.hidden = true;
      $$('.rsvp-result', container).forEach((el) => el.remove());
      const fragment = $(data.attendance === 'yes' ? '#tpl-pass' : '#tpl-decline').content.cloneNode(true);
      const result = $('.rsvp-result', fragment);

      if (data.attendance === 'yes') {
        $('[data-field="name"]', result).textContent = data.name;
        $('[data-field="guests"]', result).textContent = `${data.guests} ${data.guests === 1 ? 'lugar' : 'lugares'}`;
        $('[data-field="folio"]', result).textContent = data.folio;
        const qrHost = $('[data-qr]', result);
        const ascii = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\x20-\x7E]/g, '');
        const payload = ascii([
          `BODA ${EVENT.initials} ${EVENT.dateISO}`,
          `FOLIO ${data.folio}`,
          `INVITADO ${data.name}`,
          `LUGARES ${data.guests}`
        ].join(' | '));
        if (window.QRCode) {
          new window.QRCode(qrHost, {
            text: payload,
            width: 368,
            height: 368,
            colorDark: '#45413D',
            colorLight: '#FFFDF9',
            correctLevel: window.QRCode.CorrectLevel.M
          });
        } else {
          qrHost.textContent = data.folio;
        }
        $('[data-action="download"]', result).addEventListener('click', () => downloadPass(data, qrHost));
      } else {
        $('[data-field="title"]', result).textContent = `Te extrañaremos, ${data.name.split(/\s+/)[0]}`;
      }

      $('[data-action="reset"]', result).addEventListener('click', () => {
        storage.remove('localStorage', RSVP_KEY);
        showForm();
      });

      container.appendChild(fragment);
      renderIcons();
      if (scroll) container.scrollIntoView({ behavior: scrollBehavior(), block: 'center' });
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = nameInput.value.trim().replace(/\s+/g, ' ');
      const attendance = form.elements.attendance.value;
      let valid = true;
      if (name.length < 3) {
        valid = false;
        nameInput.setAttribute('aria-invalid', 'true');
        nameError.textContent = 'Por favor escribe tu nombre completo.';
      }
      if (!attendance) {
        valid = false;
        attendanceError.textContent = 'Selecciona si podrás acompañarnos.';
      }
      if (!valid) {
        (name.length < 3 ? nameInput : $('input[name="attendance"]', form)).focus();
        return;
      }
      const data = {
        name,
        attendance,
        guests: attendance === 'yes' ? Number(guestsSelect.value) : 0,
        message: messageInput.value.trim(),
        folio: makeFolio(),
        createdAt: new Date().toISOString()
      };
      storage.set('localStorage', RSVP_KEY, data);
      renderResult(data);
      toast(attendance === 'yes' ? '¡Gracias por confirmar!' : 'Gracias por tu respuesta');
    });

    const saved = storage.get('localStorage', RSVP_KEY, null);
    if (saved && saved.name && saved.attendance) renderResult(saved, { scroll: false });
  };

  Object.assign(window.Eventia, { initRSVP });
})();
