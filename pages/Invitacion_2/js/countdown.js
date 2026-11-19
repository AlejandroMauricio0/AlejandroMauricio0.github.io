/* =========================================================
   Cuenta regresiva hacia el inicio de la fiesta
   Fecha objetivo: atributo data-countdown (hora local)
   ========================================================= */
(function () {
  'use strict';

  var root = document.querySelector('[data-countdown]');
  if (!root) return;

  var target = new Date(root.getAttribute('data-countdown')).getTime();
  if (isNaN(target)) return;

  var units = {
    days: root.querySelector('[data-unit="days"]'),
    hours: root.querySelector('[data-unit="hours"]'),
    minutes: root.querySelector('[data-unit="minutes"]'),
    seconds: root.querySelector('[data-unit="seconds"]')
  };
  var tickBlock = root.querySelector('[data-tick]');
  var doneMsg = document.querySelector('[data-countdown-done]');
  var timer = null;

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function set(el, value) {
    if (el && el.textContent !== value) el.textContent = value;
  }

  function render() {
    var diff = Math.max(0, target - Date.now());
    var s = Math.floor(diff / 1000);

    set(units.days, pad(Math.floor(s / 86400)));
    set(units.hours, pad(Math.floor((s % 86400) / 3600)));
    set(units.minutes, pad(Math.floor((s % 3600) / 60)));
    set(units.seconds, pad(s % 60));

    if (tickBlock && diff > 0) {
      tickBlock.classList.remove('is-bumped');
      void tickBlock.offsetWidth; // reinicia la animación
      tickBlock.classList.add('is-bumped');
    }

    if (diff === 0) {
      clearInterval(timer);
      if (doneMsg) doneMsg.hidden = false;
    }
  }

  render();
  timer = setInterval(render, 1000);
})();
