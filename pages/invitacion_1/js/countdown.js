/* Cuenta regresiva en tiempo real hasta la ceremonia. */
(() => {
  'use strict';

  const { $ } = window.Eventia;

  const initCountdown = () => {
    const root = $('#countdown');
    if (!root) return;
    const target = new Date(root.dataset.target).getTime();
    const fields = {
      days: $('[data-unit="days"]', root),
      hours: $('[data-unit="hours"]', root),
      minutes: $('[data-unit="minutes"]', root),
      seconds: $('[data-unit="seconds"]', root)
    };
    const sr = $('#countdown-sr');
    const pad = (n, len = 2) => String(n).padStart(len, '0');
    let lastMinute = -1;
    let timer;

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        root.innerHTML = '<div class="card card--center"><p class="countdown__done">¡Hoy es el gran día!</p></div>';
        root.style.gridTemplateColumns = '1fr';
        if (sr) sr.textContent = '¡Hoy es el gran día!';
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      fields.days.textContent = pad(days, days > 99 ? 3 : 2);
      fields.hours.textContent = pad(hours);
      fields.minutes.textContent = pad(minutes);
      fields.seconds.textContent = pad(seconds);
      if (sr && minutes !== lastMinute) {
        lastMinute = minutes;
        sr.textContent = `Faltan ${days} días, ${hours} horas y ${minutes} minutos para la boda.`;
      }
    };

    tick();
    timer = setInterval(tick, 1000);
  };

  Object.assign(window.Eventia, { initCountdown });
})();
