// ============================================================
//  TOYZ — Serie de Propuestas LED
//  app.js  —  Controlador + Vista (MVC)
//
//  Model      → data.json  (contenido) + assets.js (rutas)
//  View       → funciones render*()
//  Controller → init(), eventos, carrusel, selección
// ============================================================

import ASSETS from './assets.js';

// ── Estado ───────────────────────────────────────────────────
const state = {
  seleccion: {},    // { "Logo principal": { nom, precio } }
  carruseles: {}    // { opcionId: { cur, timer, videoIdx } }
};

// ── Helpers ──────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const fmt = n => n.toLocaleString('es-MX');
const asset = key => ASSETS[key] ?? '';

// ── RENDER: Header ───────────────────────────────────────────
function renderHeader(empresa) {
  return `
  <header class="site-header" id="siteHeader">
    <a class="header-brand" href="#">
      <img class="header-logo" src="${asset('logo_ac')}" alt="${empresa.nombre}">
      <div class="header-brand-text">
        <span class="header-brand-name">${empresa.nombre}</span>
        <span class="header-brand-tagline">${empresa.tagline}</span>
      </div>
    </a>
    <nav class="header-social">
      <a class="soc-btn soc-ig" href="${empresa.redes.instagram}" target="_blank" rel="noopener">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none"/>
        </svg>
        <span class="soc-label">Instagram</span>
      </a>
      <a class="soc-btn soc-fb" href="${empresa.redes.facebook}" target="_blank" rel="noopener">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
        </svg>
        <span class="soc-label">Facebook</span>
      </a>
    </nav>
  </header>`;
}

// ── RENDER: Hero ─────────────────────────────────────────────
function renderHero(cliente) {
  return `
  <section class="hero">
    <div class="doc-tag"><span class="pulse"></span>Serie de Propuestas · Letreros LED</div>
    <img class="hero-logo" src="${asset('logo_toyz')}" alt="${cliente.nombre}">
    <h1>Propuestas para realzar<br>la esencia de la cochera.</h1>
    <p class="hero-sub">${cliente.descripcion}</p>
    <div class="hero-actions">
      <a href="#propuestas" class="btn btn-primary">Ver propuestas →</a>
      <a href="#resumen"    class="btn btn-ghost">Resumen de precios</a>
    </div>
    <div class="scroll-cue">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="6 9 12 15 18 9"/>
      </svg>
      explorar
    </div>
  </section>`;
}

// ── RENDER: Intro ────────────────────────────────────────────
function renderIntro(intro) {
  const parrafos = intro.parrafos.map(p => `<p>${p}</p>`).join('\n');
  return `
  <section class="intro fi">
    <div class="sec-tag">El contexto</div>
    <h2>${intro.titulo}</h2>
    ${parrafos}
  </section>`;
}

// ── RENDER: Media ────────────────────────────────────────────
function renderMedia(media, opcionId) {
  switch (media.tipo) {

    case 'imagen':
      return `<img class="card-img" src="${asset(media.asset)}" alt="" loading="lazy">`;

    case 'video-loop':
      return `
      <video class="card-vid" autoplay muted loop playsinline preload="none">
        <source src="${asset(media.asset)}" type="video/mp4">
      </video>`;

    case 'carrusel': {
      // Detectar índice del video dentro de los slides
      const videoIdx = media.slides.findIndex(s => s.tipo === 'video');

      const slidesHTML = media.slides.map((s, i) => {
        if (s.tipo === 'video') {
          // preload="none" — el navegador NO descarga el video hasta que sea necesario
          // Solo empieza a cargar cuando el usuario llega a ese slide
          return `
          <div class="car-slide">
            <video id="vid${opcionId}" muted playsinline autoplay preload="none">
              <source src="${asset(s.asset)}" type="video/mp4">
            </video>
          </div>`;
        }
        if (s.tipo === 'imagen') {
          return `
          <div class="car-slide">
            <img src="${asset(s.asset)}" alt="" loading="${i === 0 ? 'eager' : 'lazy'}">
          </div>`;
        }
        return '';
      }).join('');

      const dotsHTML = media.slides.map((_, i) =>
        `<div class="dot${i === 0 ? ' on' : ''}" data-carousel="${opcionId}" data-index="${i}"></div>`
      ).join('');

      return `
      <div class="carousel" data-carousel-id="${opcionId}" data-video-idx="${videoIdx}">
        <div class="car-track" id="track${opcionId}">${slidesHTML}</div>
        <div class="car-dots">${dotsHTML}</div>
      </div>`;
    }

    default:
      return '';
  }
}

// ── RENDER: Card ─────────────────────────────────────────────
function renderCard(op, seccionNombre) {
  const featuresHTML = op.caracteristicas.map(f => `<li>${f}</li>`).join('');
  const badgeHTML    = op.badge ? `<div class="rec-badge">${op.badge}</div>` : '';

  return `
  <div class="card${op.destacada ? ' star' : ''} fi">
    ${badgeHTML}
    ${renderMedia(op.media, op.id)}
    <div class="card-body">
      <div class="opt-lbl">${op.etiqueta}</div>
      <div class="card-title">${op.nombre}</div>
      <div class="card-desc">${op.descripcion}</div>
      <ul class="feats">${featuresHTML}</ul>
      <div class="card-foot">
        <div>
          <div class="price-lbl">Inversión</div>
          <div class="price-val">$${fmt(op.precio)} <sub>MXN</sub></div>
        </div>
        <button class="btn-sel"
          data-seccion="${seccionNombre}"
          data-nombre="${op.nombre}"
          data-precio="${op.precio}">
          Seleccionar
        </button>
      </div>
    </div>
  </div>`;
}

// ── RENDER: Sección grid ──────────────────────────────────────
function renderSeccionGrid(sec) {
  const cards = sec.opciones.map(op => renderCard(op, sec.titulo)).join('');
  return `
  <div class="sec-hdr fi">
    <div class="sec-tag">${sec.tag}</div>
    <h2>${sec.titulo}</h2>
    <p>${sec.descripcion}</p>
  </div>
  <div class="cards">${cards}</div>
  <hr class="divider">`;
}

// ── RENDER: Sección duo ───────────────────────────────────────
function renderSeccionDuo(sec) {
  const op           = sec.opciones[0];
  const featuresHTML = op.caracteristicas.map(f => `<li>${f}</li>`).join('');
  const isReverse    = op.media.layout === 'duo-reverse';
  const imgClass     = isReverse ? 'duo-img portrait' : 'duo-img';

  const imgCol = `
    <div class="duo-card" style="order:${isReverse ? 1 : 2}">
      <img class="${imgClass}" src="${asset(op.media.asset)}" alt="${op.nombre}" loading="lazy">
    </div>`;

  const infoCol = `
    <div class="duo-info" style="order:${isReverse ? 2 : 1}">
      <div class="opt-lbl" style="margin-bottom:10px">${op.etiqueta}</div>
      <h3>${op.nombre}</h3>
      <p>${op.descripcion}</p>
      <ul class="feats" style="margin-bottom:22px">${featuresHTML}</ul>
      <div class="price-block">
        <div class="price-lbl">Inversión</div>
        <div class="price-val">$${fmt(op.precio)} <sub>MXN</sub></div>
      </div>
      <button class="btn-sel" style="width:100%;padding:13px;font-size:13px"
        data-seccion="${sec.titulo}"
        data-nombre="${op.nombre}"
        data-precio="${op.precio}">
        Seleccionar
      </button>
    </div>`;

  return `
  <div class="sec-hdr fi">
    <div class="sec-tag">${sec.tag}</div>
    <h2>${sec.titulo}</h2>
    <p>${sec.descripcion}</p>
  </div>
  <div class="duo fi">${isReverse ? infoCol + imgCol : imgCol + infoCol}</div>
  <hr class="divider">`;
}

// ── RENDER: Router de sección ─────────────────────────────────
function renderSeccion(sec) {
  const layout = sec.opciones[0]?.media?.layout;
  return (layout === 'duo' || layout === 'duo-reverse')
    ? renderSeccionDuo(sec)
    : renderSeccionGrid(sec);
}

// ── RENDER: Resumen vacío ─────────────────────────────────────
function renderSummaryEmpty() {
  return `<tr><td colspan="3" style="text-align:center;color:#555;padding:36px 0">
    Selecciona las opciones arriba para ver el resumen ✦
  </td></tr>`;
}

// ── RENDER: Resumen ───────────────────────────────────────────
function renderResumen(cotizacion, empresa) {
  return `
  <section class="summary" id="resumen">
    <div class="sum-inner">
      <div class="sec-tag" style="text-align:center">Cotización</div>
      <h2>Resumen de selección</h2>
      <p class="sub">Selecciona las opciones arriba y el total se calcula aquí automáticamente.</p>
      <table class="sum-table">
        <thead>
          <tr>
            <th>Pieza</th>
            <th>Opción seleccionada</th>
            <th style="text-align:right">Precio</th>
          </tr>
        </thead>
        <tbody id="sumBody">${renderSummaryEmpty()}</tbody>
      </table>
      <div class="sum-note"><strong>✦ Nota:</strong> ${cotizacion.nota}</div>
      <div class="cta-row">
        <a href="https://wa.me/${empresa.whatsapp}" class="btn btn-primary"
           style="font-size:14px;padding:15px 30px" target="_blank">
          💬 Confirmar por WhatsApp
        </a>
        <button class="btn btn-ghost" onclick="window.print()">🖨 Imprimir</button>
      </div>
    </div>
  </section>`;
}

// ── RENDER: Footer ────────────────────────────────────────────
function renderFooter(empresa) {
  return `
  <footer>
    <p>Serie de propuestas preparada para <strong>TOYZ</strong> · ${empresa.nombre}</p>
    <p class="sub-note">Cotización válida por 30 días a partir de su fecha de envío.</p>
  </footer>`;
}

// ── CONTROLADOR: Actualizar resumen ───────────────────────────
function updateSummary(cotizacion) {
  const body = $('sumBody');
  const keys = Object.keys(state.seleccion);

  if (!keys.length) {
    body.innerHTML = renderSummaryEmpty();
    return;
  }

  let total = 0;
  const rows = keys.map(cat => {
    const { nom, precio } = state.seleccion[cat];
    total += precio;
    return `<tr>
      <td><div class="itname">${cat}</div></td>
      <td><div class="itsub">${nom}</div></td>
      <td class="pcell">$${fmt(precio)}</td>
    </tr>`;
  }).join('');

  body.innerHTML = rows + `
  <tr class="tot-row">
    <td colspan="2" class="tot-lbl">Total estimado</td>
    <td class="tot-amt">$${fmt(total)} <sub>${cotizacion.moneda}</sub></td>
  </tr>`;
}

// ── CONTROLADOR: Carrusel ─────────────────────────────────────
// Orden de slides: imagen primero → video segundo
// El video usa preload="none" y solo empieza a cargar cuando
// se va a mostrar, para no bloquear la carga inicial de la página.
function initCarrusel(carouselEl) {
  const id       = carouselEl.dataset.carouselId;
  const videoIdx = Number(carouselEl.dataset.videoIdx);  // índice del slide de video
  const track    = $('track' + id);
  const vid      = $('vid'   + id);
  if (!track || !vid) return;

  state.carruseles[id] = { cur: 0, timer: null };

  function setSlide(idx, animate = true) {
    clearTimeout(state.carruseles[id].timer);
    state.carruseles[id].cur = idx;

    // Mover track
    if (!animate) track.classList.add('instant');
    track.style.transform = `translateX(-${idx * 100}%)`;
    if (!animate) requestAnimationFrame(() =>
      requestAnimationFrame(() => track.classList.remove('instant'))
    );

    // Actualizar dots
    carouselEl.querySelectorAll('.dot')
      .forEach((d, i) => d.classList.toggle('on', i === idx));

    if (idx === videoIdx) {
      // Slide del video: iniciar precarga y reproducir
      vid.preload = 'auto';
      vid.currentTime = 0;
      vid.play().catch(() => {});
    } else {
      // Slide de imagen: pausar video, programar avance al video
      vid.pause();
      // Aprovechar para precargar el video en segundo plano
      if (vid.preload === 'none') vid.preload = 'metadata';
      state.carruseles[id].timer = setTimeout(
        () => setSlide(videoIdx), 4000
      );
    }
  }

  // Al terminar el video → volver a la imagen
  vid.addEventListener('ended', () => {
    const imgIdx = videoIdx === 0 ? 1 : 0;
    setSlide(imgIdx);
  });

  // Arrancar en el primer slide (imagen)
  setSlide(0, false);

  // Exponer para los dots
  window[`_carousel_${id}`] = setSlide;
}

// ── CONTROLADOR: Selección ────────────────────────────────────
function initSeleccion(cotizacion) {
  document.addEventListener('click', e => {
    const btn = e.target.closest('.btn-sel');
    if (!btn) return;

    const { seccion, nombre, precio } = btn.dataset;
    state.seleccion[seccion] = { nom: nombre, precio: Number(precio) };
    updateSummary(cotizacion);

    const orig = btn.textContent;
    btn.textContent    = '✓ Seleccionado';
    btn.style.background = '#00e676';
    setTimeout(() => { btn.textContent = orig; btn.style.background = ''; }, 1600);
  });
}

// ── CONTROLADOR: Dots de carrusel ─────────────────────────────
function initDots() {
  document.addEventListener('click', e => {
    const dot = e.target.closest('.dot[data-carousel]');
    if (!dot) return;
    const id  = dot.dataset.carousel;
    const idx = Number(dot.dataset.index);
    window[`_carousel_${id}`]?.(idx);
  });
}

// ── CONTROLADOR: Header scroll ────────────────────────────────
function initHeader() {
  const hdr = $('siteHeader');
  if (!hdr) return;
  window.addEventListener('scroll', () => {
    hdr.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// ── CONTROLADOR: Fade-in ──────────────────────────────────────
function initFadeIn() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('vis'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.fi').forEach(el => obs.observe(el));
}

// ── INIT ──────────────────────────────────────────────────────
async function init() {
  const data = await fetch('./data.json').then(r => r.json());
  const app  = document.getElementById('app');

  // Construir DOM completo
  app.innerHTML =
    renderHeader(data.empresa) +
    renderHero(data.cliente) +
    renderIntro(data.intro) +
    `<div id="propuestas">` +
      data.secciones.map(renderSeccion).join('') +
    `</div>` +
    renderResumen(data.cotizacion, data.empresa) +
    renderFooter(data.empresa);

  // Inicializar controladores
  initHeader();
  initFadeIn();
  initSeleccion(data.cotizacion);
  initDots();

  // Inicializar cada carrusel encontrado en el DOM
  document.querySelectorAll('.carousel[data-carousel-id]')
    .forEach(el => initCarrusel(el));
}

init();
