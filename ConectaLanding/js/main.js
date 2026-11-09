/* ============================================================
   Conecta · Landing — interacciones y animaciones
   Requiere GSAP + ScrollTrigger (en assets/vendor).
   Si no cargan, la página sigue siendo legible (sin animación).
   Si el usuario pide menos movimiento, se omiten los efectos.
   ============================================================ */
(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = Boolean(window.gsap && window.ScrollTrigger);
  const motion = hasGsap && !reduce;

  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if (motion) document.documentElement.classList.add('has-motion');

  /* ---------- Utilidades ---------- */
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const debounce = (fn, ms = 150) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  /* ============================================================
     1. Preloader: barras que se llenan y cortina que sube
     ============================================================ */
  function preloader(onReveal) {
    const pre = $('.preloader');
    const finish = () => {
      if (pre) pre.remove();
      document.body.classList.remove('is-loading');
    };

    if (!pre || !motion) { finish(); onReveal(); return; }

    const bars = $$('.preloader__bars i', pre);
    const tl = gsap.timeline({ onComplete: finish });

    bars.forEach((bar, i) => {
      tl.add(
        gsap.timeline()
          .to(bar, { width: `${gsap.utils.random(20, 80)}%`, duration: 0.28, ease: 'none' })
          .to(bar, { width: '100%', duration: 0.32, ease: 'power1.out' }),
        i * 0.16
      );
    });
    tl.to('.preloader__brand', { scale: 1.04, duration: 0.4, ease: 'power2.out' }, '>-0.1')
      .add(onReveal, '>')
      .to(pre, { '--clip': '100%', duration: 0.8, ease: 'power3.inOut' }, '<');

    // Red de seguridad: jamás dejar la página tapada
    setTimeout(() => { if (document.body.classList.contains('is-loading')) { finish(); onReveal(); } }, 7000);
  }

  /* ============================================================
     2. Entrada del hero
     ============================================================ */
  const heroTargets = '.hero__eyebrow, .hero__lead, .hero__cta, .hero__foot';

  function heroPrepare() {
    if (!motion) return;
    gsap.set('.hero__title .line > span', { yPercent: 115 });
    gsap.set(heroTargets, { autoAlpha: 0, y: 30 });
    gsap.set('.hd__inner', { autoAlpha: 0, y: -24 });
  }

  function heroReveal() {
    if (!motion) return;
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero__title .line > span', { yPercent: 0, duration: 1.2, stagger: 0.14, ease: 'power4.out' })
      .to(heroTargets, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, '-=0.8')
      .to('.hd__inner', { autoAlpha: 1, y: 0, duration: 0.8 }, '-=1')
      .fromTo('.hero__bg img', { scale: 1.15 }, { scale: 1, duration: 2.4, ease: 'power3.out' }, 0);
  }

  /* ============================================================
     3. Aparición al hacer scroll ([data-reveal] y grupos)
     ============================================================ */
  function reveals() {
    if (!motion) return;

    $$('[data-reveal]').forEach((el) => {
      const tipo = el.dataset.reveal;
      const delay = parseFloat(el.dataset.delay || 0);
      const from = { autoAlpha: 0 };
      const to = { autoAlpha: 1, duration: 1, ease: 'power3.out', delay };

      if (tipo === 'up') { from.y = 50; to.y = 0; }
      else if (tipo === 'left') { from.x = -60; to.x = 0; }
      else if (tipo === 'right') { from.x = 60; to.x = 0; }
      else if (tipo === 'zoom') { from.scale = 0.88; to.scale = 1; }
      else if (tipo === 'rotate') {
        from.rotationX = 35; from.yPercent = 40; from.transformPerspective = 600;
        to.rotationX = 0; to.yPercent = 0;
      }

      gsap.fromTo(el, from, {
        ...to,
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });

    $$('[data-reveal-group]').forEach((grupo) => {
      gsap.from(grupo.children, {
        autoAlpha: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.14,
        scrollTrigger: { trigger: grupo, start: 'top 85%', once: true }
      });
    });
  }

  /* ============================================================
     4. Texto que se ilumina letra por letra con el scroll
     ============================================================ */
  function textoQueSeIlumina() {
    $$('.lit').forEach((el) => {
      const texto = el.textContent.trim().replace(/\s+/g, ' ');
      el.setAttribute('aria-label', texto);
      if (!motion) return;

      el.textContent = '';
      const frag = document.createDocumentFragment();
      const letras = [];
      texto.split(' ').forEach((palabra, i, todas) => {
        const w = document.createElement('span');
        w.className = 'lit__word';
        w.setAttribute('aria-hidden', 'true');
        for (const ch of palabra) {
          const c = document.createElement('span');
          c.className = 'lit__char';
          c.textContent = ch;
          w.appendChild(c);
          letras.push(c);
        }
        frag.appendChild(w);
        if (i < todas.length - 1) frag.appendChild(document.createTextNode(' '));
      });
      el.appendChild(frag);

      gsap.to(letras, {
        color: '#e8ecf6',
        ease: 'power2.out',
        stagger: { each: 0.03 },
        scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 35%', scrub: true }
      });
    });
  }

  /* ============================================================
     5. Tarjetas apiladas: la de abajo tapa a la anterior, que se
        encoge y se apaga (el apilado en sí es CSS `position: sticky`)
     ============================================================ */
  function tarjetasApiladas() {
    if (!motion) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 768px)', () => {
      const cards = $$('.work__card');
      cards.slice(0, -1).forEach((card, i) => {
        // Se oscurece con `filter` (no con opacity) para que el texto de la
        // tarjeta de atrás no se transparente a través de la de enfrente.
        // Valores iniciales explícitos: desde `filter: none` GSAP interpolaría
        // desde brightness(0) y la tarjeta se vería negra al empezar.
        gsap.fromTo(card, { scale: 1, filter: 'brightness(1)' }, {
          scale: 0.92,
          filter: 'brightness(0.5)',
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom-=80',
            end: () => `top ${getComputedStyle(card).top}`,
            scrub: true,
            invalidateOnRefresh: true
          }
        });
      });
    });
  }

  /* ============================================================
     6. Abanico de pantallas: salen del centro y se abren en diagonal
     ============================================================ */
  const fan = { tl: null };

  function abanico() {
    const wrap = $('#fan');
    if (!wrap) return;
    const cards = $$('.fan__card', wrap);

    const construir = () => {
      if (fan.tl) { fan.tl.scrollTrigger && fan.tl.scrollTrigger.kill(); fan.tl.kill(); fan.tl = null; }

      const ancho = cards[0].getBoundingClientRect().width || 325;
      const movil = innerWidth < 768;
      const k = clamp(ancho / 325, 0.4, 1);
      const kx = movil ? k * 0.55 : k;
      const dx = [-400, -240, -80, 80, 240, 400].map((v) => v * kx);
      const dy = [-300, -180, -60, 60, 180, 300].map((v) => v * k);
      wrap.style.height = `${Math.round(600 * k + ancho * 1.35)}px`;

      const base = { xPercent: -50, yPercent: -50, x: 0, y: 0, rotation: 0, rotationX: 0, rotationY: 0 };
      const final = { x: (i) => dx[i], y: (i) => dy[i], rotation: -10, rotationX: 4, rotationY: 10 };

      if (!motion) { gsap && gsap.set(cards, { ...base, ...final, opacity: 1 }); return; }

      gsap.set(cards, { ...base, opacity: 0 });
      fan.tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: wrap, start: 'top 70%', toggleActions: 'play none none reverse' }
      });
      fan.tl
        .to(cards, { opacity: 1, duration: 0.8, stagger: 0.1 })
        .to(cards, { ...final, duration: 1.1, ease: 'power2.out' }, '+=0.1');
    };

    if (!hasGsap) {
      // Sin GSAP: cuadrícula simple
      wrap.style.height = 'auto';
      wrap.style.display = 'grid';
      wrap.style.gridTemplateColumns = 'repeat(auto-fit, minmax(160px, 1fr))';
      wrap.style.gap = '16px';
      cards.forEach((c) => { c.style.position = 'relative'; c.style.left = 'auto'; c.style.top = 'auto'; c.style.width = '100%'; });
      return;
    }

    construir();
    addEventListener('resize', debounce(() => { construir(); ScrollTrigger.refresh(); }, 250));
  }

  /* ============================================================
     7. Contadores
     ============================================================ */
  function contadores() {
    $$('[data-count]').forEach((el) => {
      const meta = parseInt(el.dataset.count, 10) || 0;
      if (!motion || meta === 0) { el.textContent = meta; return; }
      const obj = { v: 0 };
      gsap.to(obj, {
        v: meta,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: () => { el.textContent = Math.round(obj.v); },
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      });
    });
  }

  /* ============================================================
     8. Pestañas (Control por separado/conectado y precios)
     ============================================================ */
  function moverPildora(tabs) {
    const activo = $('.tabs__btn.is-active', tabs);
    if (!activo) return;
    tabs.style.setProperty('--pill-x', `${activo.offsetLeft - 5}px`);
    tabs.style.setProperty('--pill-w', `${activo.offsetWidth}px`);
  }

  function pestanas() {
    const todas = $$('.tabs');
    todas.forEach((t) => moverPildora(t));
    addEventListener('resize', debounce(() => todas.forEach(moverPildora), 150));
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => todas.forEach(moverPildora));

    const activar = (tabs, btn) => {
      $$('.tabs__btn', tabs).forEach((b) => {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-selected', String(on));
      });
      moverPildora(tabs);
    };

    // Control: por separado / conectado
    const ctrl = $('#ctrl-tabs');
    if (ctrl) {
      ctrl.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-tab]');
        if (!btn) return;
        activar(ctrl, btn);
        $$('.ctrl-panel').forEach((p) => p.classList.toggle('is-active', p.dataset.panel === btn.dataset.tab));
      });
    }

    // Precios: mensual / anual
    const precios = $('#price-tabs');
    if (precios) {
      precios.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-period]');
        if (!btn) return;
        activar(precios, btn);
        const periodo = btn.dataset.period;
        $$('[data-m][data-a]').forEach((el) => {
          el.textContent = el.dataset[periodo];
          if (motion) gsap.fromTo(el, { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, ease: 'power3.out' });
        });
      });
    }
  }

  /* ============================================================
     9. Acordeón de preguntas
     ============================================================ */
  function acordeon() {
    $$('.acc__q').forEach((btn) => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.acc__item');
        const abrir = !item.classList.contains('is-open');
        $$('.acc__item').forEach((it) => {
          it.classList.remove('is-open');
          $('.acc__q', it).setAttribute('aria-expanded', 'false');
        });
        if (abrir) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
        if (hasGsap) setTimeout(() => ScrollTrigger.refresh(), 550);
      });
    });
  }

  /* ============================================================
     10. Carrusel de testimonios (scroll-snap + botones)
     ============================================================ */
  function carrusel() {
    const slider = $('#slider');
    if (!slider) return;
    const paso = () => {
      const card = $('.quote', slider);
      return card ? card.getBoundingClientRect().width + 24 : 400;
    };
    $('#sl-prev')?.addEventListener('click', () => slider.scrollBy({ left: -paso(), behavior: 'smooth' }));
    $('#sl-next')?.addEventListener('click', () => slider.scrollBy({ left: paso(), behavior: 'smooth' }));
    slider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') slider.scrollBy({ left: paso(), behavior: 'smooth' });
      if (e.key === 'ArrowLeft') slider.scrollBy({ left: -paso(), behavior: 'smooth' });
    });
  }

  /* ============================================================
     11. Encabezado, menú móvil, enlace activo y volver arriba
     ============================================================ */
  function encabezado() {
    const hd = $('#hd');
    const burger = $('#burger');
    const menu = $('#menu');
    const gotop = $('#gotop');
    let ultimo = 0;

    const cerrarMenu = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Abrir menú');
      document.body.style.overflow = '';
    };

    burger.addEventListener('click', () => {
      const abrir = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', abrir);
      menu.setAttribute('aria-hidden', String(!abrir));
      burger.setAttribute('aria-expanded', String(abrir));
      burger.setAttribute('aria-label', abrir ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = abrir ? 'hidden' : '';
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', cerrarMenu));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') cerrarMenu(); });
    addEventListener('resize', () => { if (innerWidth >= 992) cerrarMenu(); });

    const onScroll = () => {
      const y = scrollY;
      hd.classList.toggle('hd--solid', y > 20);
      hd.classList.toggle('hd--hide', y > ultimo && y > 240 && !menu.classList.contains('is-open'));
      ultimo = y;

      const max = document.documentElement.scrollHeight - innerHeight;
      gotop.style.setProperty('--p', `${max > 0 ? (y / max) * 360 : 0}deg`);
      gotop.classList.toggle('is-show', y > 300);
    };
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    gotop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

    // Enlace activo según la sección visible
    const links = new Map($$('.nav a[data-link]').map((a) => [a.dataset.link, a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        links.forEach((a) => a.classList.remove('is-active'));
        const a = links.get(en.target.id);
        if (a) a.classList.add('is-active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => io.observe(s));
  }

  /* ============================================================
     12. Formulario de contacto (demostración, sin envío real)
     ============================================================ */
  function formulario() {
    const form = $('#form');
    const ok = $('#form-ok');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        $$('input, textarea', form).forEach((f) => f.classList.toggle('is-invalid', !f.checkValidity()));
        form.reportValidity();
        return;
      }
      $$('.is-invalid', form).forEach((f) => f.classList.remove('is-invalid'));
      // TODO: enviar a la API de contacto cuando exista (ver README).
      form.reset();
      ok.hidden = false;
      if (motion) gsap.fromTo(ok, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' });
    });
  }

  /* ============================================================
     13. Partículas que reaccionan al cursor (fondo)
     ============================================================ */
  function particulas() {
    const cv = $('#particles');
    if (!cv || reduce) { cv && cv.remove(); return; }
    const ctx = cv.getContext('2d');
    let w, h, dpr, ps = [];
    const mouse = { x: -9999, y: -9999 };

    const medir = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = Math.floor(innerWidth * dpr);
      h = cv.height = Math.floor(innerHeight * dpr);
      cv.style.width = `${innerWidth}px`;
      cv.style.height = `${innerHeight}px`;
      const n = Math.min(80, Math.floor((innerWidth * innerHeight) / 22000));
      ps = Array.from({ length: n }, (_, i) => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28 * dpr,
        vy: (Math.random() - 0.5) * 0.28 * dpr,
        r: (Math.random() * 1.4 + 0.7) * dpr,
        c: i % 3 === 0 ? '124,92,255' : '34,211,238'
      }));
    };
    medir();
    addEventListener('resize', debounce(medir, 200));
    addEventListener('mousemove', (e) => { mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr; }, { passive: true });
    addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

    const LINK = 120 * 1;
    const frame = () => {
      if (!document.hidden) {
        ctx.clearRect(0, 0, w, h);
        const link = LINK * dpr;
        const near = 170 * dpr;
        for (let i = 0; i < ps.length; i++) {
          const p = ps[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0) p.x = w; else if (p.x > w) p.x = 0;
          if (p.y < 0) p.y = h; else if (p.y > h) p.y = 0;

          const mx = p.x - mouse.x, my = p.y - mouse.y;
          const md = Math.hypot(mx, my);
          if (md < near) {
            const f = (1 - md / near) * 0.6;
            p.x += (mx / (md || 1)) * f * 2;
            p.y += (my / (md || 1)) * f * 2;
            ctx.strokeStyle = `rgba(34,211,238,${(1 - md / near) * 0.35})`;
            ctx.lineWidth = dpr;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }

          ctx.fillStyle = `rgba(${p.c},0.75)`;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();

          for (let j = i + 1; j < ps.length; j++) {
            const q = ps[j];
            const d = Math.hypot(p.x - q.x, p.y - q.y);
            if (d < link) {
              ctx.strokeStyle = `rgba(167,176,201,${(1 - d / link) * 0.16})`;
              ctx.lineWidth = dpr * 0.8;
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
        }
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ============================================================
     14. Estela del cursor y ondas al hacer clic
     ============================================================ */
  function estela() {
    const cv = $('#trail');
    if (!cv || reduce || !finePointer) { cv && cv.remove(); return; }
    const ctx = cv.getContext('2d');
    let w, h, dpr;
    const puntos = [];
    let ondas = [];

    const medir = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = cv.width = Math.floor(innerWidth * dpr);
      h = cv.height = Math.floor(innerHeight * dpr);
      cv.style.width = `${innerWidth}px`;
      cv.style.height = `${innerHeight}px`;
    };
    medir();
    addEventListener('resize', debounce(medir, 200));

    addEventListener('mousemove', (e) => {
      puntos.push({ x: e.clientX * dpr, y: e.clientY * dpr, t: performance.now() });
      if (puntos.length > 14) puntos.shift();
    }, { passive: true });
    addEventListener('click', (e) => { ondas.push({ x: e.clientX * dpr, y: e.clientY * dpr, r: 0, a: 1 }); });

    const frame = (now) => {
      ctx.clearRect(0, 0, w, h);

      // Quita puntos viejos para que la estela se desvanezca al detenerse
      while (puntos.length && now - puntos[0].t > 220) puntos.shift();

      if (puntos.length > 1) {
        const a = puntos[0], z = puntos[puntos.length - 1];
        const g = ctx.createLinearGradient(a.x, a.y, z.x, z.y);
        g.addColorStop(0, 'rgba(124,92,255,0)');
        g.addColorStop(1, 'rgba(34,211,238,0.9)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 3 * dpr;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        for (let i = 1; i < puntos.length; i++) ctx.lineTo(puntos[i].x, puntos[i].y);
        ctx.stroke();
      }

      ondas.forEach((o) => {
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(34,211,238,${o.a})`;
        ctx.lineWidth = 2 * dpr;
        ctx.stroke();
        o.r += 1.6 * dpr;
        o.a -= 0.022;
      });
      ondas = ondas.filter((o) => o.a > 0);

      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }

  /* ============================================================
     Arranque
     ============================================================ */
  function iniciar() {
    const y = $('#year');
    if (y) y.textContent = new Date().getFullYear();

    encabezado();
    pestanas();
    acordeon();
    carrusel();
    formulario();
    particulas();
    estela();

    heroPrepare();
    textoQueSeIlumina();
    tarjetasApiladas();
    abanico();
    contadores();
    reveals();

    preloader(heroReveal);

    if (hasGsap) addEventListener('load', () => ScrollTrigger.refresh());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
