/* Álbum colaborativo: subida de fotos y cámara en vivo (MediaDevices API). */
(() => {
  'use strict';

  const { $, storage, renderIcons, toast, lightbox } = window.Eventia;

  const ALBUM_KEY = 'eventia-album';
  const MAX_PHOTOS = 36;

  const compressImage = (file, maxSide = 1280, quality = 0.82) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Imagen no válida'));
    };
    img.src = url;
  });

  const initAlbum = () => {
    const grid = $('#album-grid');
    const status = $('#album-status');
    const upload = $('#album-upload');
    const fallback = $('#album-camera-fallback');
    let photos = storage.get('sessionStorage', ALBUM_KEY, []);

    const render = () => {
      grid.innerHTML = '';
      if (!photos.length) {
        grid.innerHTML = '<div class="album-empty"><i data-lucide="images" aria-hidden="true"></i><p style="margin:0">Aún no hay fotos. ¡Sé el primero en compartir un recuerdo!</p></div>';
        renderIcons();
        return;
      }
      photos.forEach((photo, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('aria-label', `Ver recuerdo ${i + 1}`);
        const img = document.createElement('img');
        img.src = photo.src;
        img.alt = `Recuerdo compartido ${i + 1}`;
        img.loading = 'lazy';
        btn.appendChild(img);
        btn.addEventListener('click', () => {
          lightbox.open(photos.map((p, n) => ({ src: p.src, alt: `Recuerdo compartido ${n + 1}` })), i);
        });
        grid.appendChild(btn);
      });
    };

    const persist = () => {
      if (!storage.set('sessionStorage', ALBUM_KEY, photos)) {
        status.textContent = 'Tus fotos se verán mientras mantengas esta página abierta.';
      }
    };

    const addPhoto = (src) => {
      const photo = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, src, at: new Date().toISOString() };
      photos.unshift(photo);
      photos = photos.slice(0, MAX_PHOTOS);
      render();
      persist();
      if (typeof window.EVENTIA_UPLOAD === 'function') {
        Promise.resolve(window.EVENTIA_UPLOAD(src, { id: photo.id, at: photo.at })).catch(() => {
          status.textContent = 'La foto se guardó aquí, pero no se pudo enviar al álbum en línea.';
        });
      }
    };

    const handleFiles = async (fileList) => {
      const files = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
      if (!files.length) return;
      status.textContent = files.length === 1 ? 'Procesando tu foto…' : `Procesando ${files.length} fotos…`;
      let added = 0;
      for (const file of files) {
        try {
          addPhoto(await compressImage(file));
          added += 1;
        } catch (err) {
          status.textContent = 'Uno de los archivos no pudo procesarse.';
        }
      }
      if (added) status.textContent = added === 1 ? '¡Foto añadida al muro! Gracias por compartir.' : `¡${added} fotos añadidas al muro! Gracias por compartir.`;
    };

    [upload, fallback].forEach((input) => {
      input.addEventListener('change', () => {
        handleFiles(input.files);
        input.value = '';
      });
    });

    /* Cámara en vivo (MediaDevices API) */
    const dialog = $('#camera');
    const video = $('#camera-video');
    const shutter = $('#camera-shutter');
    const switchBtn = $('#camera-switch');
    const camStatus = $('#camera-status');
    const flash = $('#camera-flash');
    const counter = $('#camera-count');
    const supported = Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) && window.isSecureContext !== false;
    let stream = null;
    let facing = 'environment';
    let shots = 0;

    const stop = () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      stream = null;
      video.srcObject = null;
      shutter.disabled = true;
    };

    const start = async () => {
      stop();
      camStatus.textContent = 'Activando cámara…';
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facing }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false
        });
        video.srcObject = stream;
        video.classList.toggle('is-mirrored', facing === 'user');
        await video.play();
        camStatus.textContent = '';
        shutter.disabled = false;
        shutter.focus();
        const devices = await navigator.mediaDevices.enumerateDevices();
        switchBtn.hidden = devices.filter((d) => d.kind === 'videoinput').length < 2;
      } catch (err) {
        stop();
        camStatus.textContent = err && err.name === 'NotAllowedError'
          ? 'Necesitamos tu permiso para usar la cámara. También puedes subir fotos desde tu galería.'
          : 'No pudimos abrir la cámara en este dispositivo. Puedes subir fotos desde tu galería.';
      }
    };

    $('#camera-open').addEventListener('click', () => {
      if (!supported) {
        fallback.click();
        return;
      }
      shots = 0;
      counter.textContent = '';
      dialog.showModal();
      start();
    });

    switchBtn.addEventListener('click', () => {
      facing = facing === 'user' ? 'environment' : 'user';
      start();
    });

    shutter.addEventListener('click', () => {
      if (!video.videoWidth) return;
      const scale = Math.min(1, 1440 / Math.max(video.videoWidth, video.videoHeight));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(video.videoWidth * scale);
      canvas.height = Math.round(video.videoHeight * scale);
      const ctx = canvas.getContext('2d');
      if (facing === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      addPhoto(canvas.toDataURL('image/jpeg', 0.82));
      shots += 1;
      counter.textContent = shots === 1 ? '1 foto' : `${shots} fotos`;
      flash.classList.remove('is-active');
      void flash.offsetWidth;
      flash.classList.add('is-active');
      toast('¡Foto añadida al álbum!');
    });

    $('#camera-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
      stop();
      if (shots) status.textContent = shots === 1 ? '¡Tu foto ya está en el muro!' : `¡Tus ${shots} fotos ya están en el muro!`;
    });

    render();
  };

  Object.assign(window.Eventia, { initAlbum });
})();
