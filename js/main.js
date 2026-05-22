/* ================================================================
   LiA — Main JS  |  GSAP 3 · ScrollTrigger (native scroll)
   ================================================================ */

/* ── 0. Plugin registration ──────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── 1. Native scroll — ScrollTrigger refresh on scroll ─────── */
window.addEventListener('scroll', ScrollTrigger.update, { passive: true });

/* ── 2. Custom cursor ────────────────────────────────────────── */
(function () {
  const dot  = document.querySelector('.cursor');
  const ring = document.querySelector('.cursor-ring');
  if (!dot || !ring) return;
  if (!window.matchMedia('(pointer: fine)').matches) {
    dot.style.display = ring.style.display = 'none'; return;
  }

  let mx = -200, my = -200, rx = -200, ry = -200;

  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    gsap.to(dot, { x: mx, y: my, duration: 0.07, ease: 'none' });
  });

  (function tick() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    gsap.set(ring, { x: rx, y: ry });
    requestAnimationFrame(tick);
  })();

  document.querySelectorAll('a, button, .scard, .news-row, .why-card, .cs-card').forEach(el => {
    el.addEventListener('mouseenter', () => ring.classList.add('expand'));
    el.addEventListener('mouseleave', () => ring.classList.remove('expand'));
  });
})();

/* ── 3. Page transition ───────────────────────────────────────── */
(function () {
  const ov = document.querySelector('.page-overlay');
  if (!ov) return;

  gsap.fromTo(ov,
    { scaleY: 1, transformOrigin: 'top' },
    { scaleY: 0, duration: 0.75, ease: 'power4.inOut', delay: 0.05 }
  );

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('http')) return;
    link.addEventListener('click', (e) => {
      e.preventDefault();
      gsap.fromTo(ov,
        { scaleY: 0, transformOrigin: 'bottom' },
        { scaleY: 1, duration: 0.55, ease: 'power4.inOut',
          onComplete: () => { window.location.href = href; }
        }
      );
    });
  });
})();

/* ── 4. Header scroll shadow ─────────────────────────────────── */
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── 5. Hamburger ────────────────────────────────────────────── */
const hamburger  = document.querySelector('.hamburger');
const navMobile  = document.querySelector('.nav-mobile');
if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navMobile.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMobile.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

/* ── 6. Active nav ───────────────────────────────────────────── */
const pagePath = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(a => {
  const h = a.getAttribute('href');
  if (h === pagePath || (pagePath === '' && h === 'index.html')) a.classList.add('active');
});

/* ── 7. Hero 9-cell unified photo grid ──────────────────────── */
(function () {
  const cells = document.querySelectorAll('.hero-cell');
  if (!cells.length) return;

  // Full-width photos — shown as ONE image split across the 3×3 grid
  const photos = [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1440&h=960&fit=crop&q=80&auto=format',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1440&h=960&fit=crop&q=80&auto=format',
    'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1440&h=960&fit=crop&q=80&auto=format',
    'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1440&h=960&fit=crop&q=80&auto=format',
  ];

  // background-position for each cell (col 0/1/2 × row 0/1/2)
  const positions = [
    '0% 0%',   '50% 0%',   '100% 0%',
    '0% 50%',  '50% 50%',  '100% 50%',
    '0% 100%', '50% 100%', '100% 100%',
  ];

  // Build two .cell-layer divs per cell for crossfade
  const state = [];
  cells.forEach((cell, i) => {
    const a = document.createElement('div');
    const b = document.createElement('div');
    a.className = b.className = 'cell-layer';
    a.style.backgroundPosition = positions[i];
    b.style.backgroundPosition = positions[i];
    b.style.opacity = '0';
    cell.append(a, b);
    state.push({ front: a, back: b });
  });

  let photoIdx = 0;

  // Apply photo URL to all cells' front layers (initial paint)
  function applyPhoto(url, layer) {
    state.forEach(s => { s[layer].style.backgroundImage = `url('${url}')`; });
  }

  // Preload an image, resolve when ready
  function preload(url) {
    return new Promise(res => {
      const img = new Image();
      img.onload = img.onerror = () => res();
      img.src = url;
    });
  }

  // Transition all 9 cells to a new photo in random cell order,
  // staggered across ~2 s, each cell crossfading over 1.4 s
  function transitionTo(url) {
    const order = Array.from({ length: 9 }, (_, i) => i).sort(() => Math.random() - 0.5);
    const WINDOW = 2000; // ms total stagger window
    order.forEach((ci, rank) => {
      setTimeout(() => {
        const s = state[ci];
        s.back.style.backgroundImage = `url('${url}')`;
        s.back.style.opacity = '1';
        s.front.style.opacity = '0';
        // Swap references so next cycle works correctly
        setTimeout(() => { [s.front, s.back] = [s.back, s.front]; }, 1500);
      }, rank * (WINDOW / 8));
    });
  }

  // Init: paint first photo immediately, then cycle every 4.5 s
  preload(photos[0]).then(() => {
    applyPhoto(photos[0], 'front');

    // Preload remaining photos
    photos.slice(1).forEach(url => preload(url));

    setInterval(async () => {
      photoIdx = (photoIdx + 1) % photos.length;
      const url = photos[photoIdx];
      await preload(url);
      transitionTo(url);
    }, 4500);
  });
})();

/* ── 8. Hero entrance (home page) ────────────────────────────── */
(function () {
  const heroTitle = document.querySelector('.hero-title');
  if (!heroTitle) return;

  heroTitle.innerHTML = heroTitle.innerHTML
    .split('<br>')
    .map(l => `<span class="lw"><span class="li">${l}</span></span>`)
    .join('');

  const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.2 });
  tl
    .fromTo('.hero-eyebrow',      { opacity: 0, y: 18 },    { opacity: 1, y: 0, duration: 0.8 })
    .fromTo('.hero-title .li',    { y: '108%' },             { y: '0%', duration: 0.9, stagger: 0.09 }, '-=0.45')
    .fromTo('.hero-subtitle',     { opacity: 0, y: 16 },    { opacity: 1, y: 0, duration: 0.7 }, '-=0.55')
    .fromTo('.hero-tagline',      { opacity: 0, y: 14 },    { opacity: 1, y: 0, duration: 0.65 }, '-=0.55')
    .fromTo('.hero-actions .btn', { opacity: 0, y: 22 },    { opacity: 1, y: 0, duration: 0.55, stagger: 0.1 }, '-=0.5')
    .fromTo('.scroll-hint',       { opacity: 0 },           { opacity: 1, duration: 0.5 }, '-=0.2');
})();

/* ── 8. Page-header sub-pages ───────────────────────────────── */
(function () {
  if (!document.querySelector('.page-header')) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' }, delay: 0.25 });
  tl
    .fromTo('.page-header-bg-text', { opacity: 0, x: -56 },  { opacity: 1, x: 0, duration: 1.1 })
    .fromTo('.breadcrumb',          { opacity: 0, y: 12 },   { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
    .fromTo('.page-header-ja',      { y: '110%' },           { y: '0%', duration: 0.85 }, '-=0.55');
})();

/* ── 9. Career hero (career.html) ───────────────────────────── */
(function () {
  const ch = document.querySelector('.career-hero');
  if (!ch) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' }, delay: 0.3 });
  tl
    .fromTo('.career-hero-content p:first-child', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 })
    .fromTo('.career-hero-content h1',            { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.9 }, '-=0.4')
    .fromTo('.career-hero-content p:last-child',  { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5');
})();

/* ── 10. Scroll-triggered reveals ───────────────────────────── */
const st = (trigger, extra) => ({
  scrollTrigger: { trigger, start: 'top 88%', ...extra }
});

gsap.utils.toArray('.section-label').forEach(el =>
  gsap.fromTo(el, { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.7, ease: 'power3.out', ...st(el) })
);

gsap.utils.toArray('h2').forEach(el => {
  if (el.closest('#hero, .career-hero, .career-cta')) return;
  gsap.fromTo(el, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', ...st(el) });
});

gsap.utils.toArray('h3').forEach(el =>
  gsap.fromTo(el, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', ...st(el) })
);

gsap.utils.toArray('.about-body, .sv-overview-body, .sv-desc, .msg-sec p, .contact-note').forEach(el =>
  gsap.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', ...st(el) })
);

gsap.utils.toArray('.about-img-wrap, .msg-img-wrap, .msg-page-photo').forEach(el => {
  gsap.fromTo(el,
    { clipPath: 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 1.25, ease: 'power4.inOut', ...st(el, { start: 'top 84%' }) }
  );
  const img = el.querySelector('img');
  if (img) gsap.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1.4, ease: 'power4.out', ...st(el, { start: 'top 84%' }) });
});

gsap.utils.toArray('.sv-img').forEach(el => {
  const fromRight = el.closest('.sv-item.reverse');
  gsap.fromTo(el,
    { clipPath: fromRight ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
    { clipPath: 'inset(0 0% 0 0%)', duration: 1.1, ease: 'power4.inOut', ...st(el, { start: 'top 82%' }) }
  );
  const img = el.querySelector('img');
  if (img) gsap.fromTo(img, { scale: 1.1 }, { scale: 1, duration: 1.3, ease: 'power4.out', ...st(el, { start: 'top 82%' }) });
});

gsap.utils.toArray('.sv-item > div:not(.sv-img)').forEach(el => {
  const dir = el.closest('.sv-item.reverse') ? -44 : 44;
  gsap.fromTo(el, { opacity: 0, x: dir }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', ...st(el, { start: 'top 84%' }) });
});

gsap.utils.toArray('.about-text, .msg-text, .msg-page-content').forEach(el =>
  gsap.fromTo(el, { opacity: 0, x: 44 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', ...st(el, { start: 'top 82%' }) })
);
gsap.utils.toArray('.msg-page-grid > .reveal-l').forEach(el =>
  gsap.fromTo(el, { opacity: 0, x: -44 }, { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', ...st(el, { start: 'top 82%' }) })
);

gsap.utils.toArray('.service-grid, .why-grid, .career-style-grid').forEach(grid =>
  gsap.fromTo(Array.from(grid.children),
    { opacity: 0, y: 48, scale: 0.97 },
    { opacity: 1, y: 0, scale: 1, duration: 0.75, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: grid, start: 'top 84%' } }
  )
);

gsap.utils.toArray('.news-row').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, x: -28 }, { opacity: 1, x: 0, duration: 0.6, delay: i * 0.07, ease: 'power3.out', ...st(el) })
);

gsap.utils.toArray('.contact-info-row').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, x: -22 }, { opacity: 1, x: 0, duration: 0.55, delay: i * 0.07, ease: 'power3.out', ...st(el) })
);

gsap.utils.toArray('.contact-grid > *').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, y: 36, x: i === 0 ? -28 : 28 },
    { opacity: 1, y: 0, x: 0, duration: 0.9, ease: 'power3.out', ...st(el, { start: 'top 84%' }) })
);

gsap.utils.toArray('.why-card, .cs-card').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', ...st(el) })
);

gsap.utils.toArray('[style*="border-bottom"][style*="flex"]').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, delay: i * 0.1, ease: 'power3.out', ...st(el) })
);

gsap.utils.toArray('.cta-block > .container, .career-cta > .container, .career-hero-content').forEach(el =>
  gsap.fromTo(el, { opacity: 0, y: 36 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', ...st(el, { start: 'top 86%' }) })
);

const homeMsg = document.getElementById('home-message');
if (homeMsg) {
  gsap.fromTo('.msg-attr, .msg-heading, .msg-body', { opacity: 0, y: 24 },
    { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
      scrollTrigger: { trigger: homeMsg, start: 'top 82%' } });
}

const footer = document.getElementById('footer');
if (footer) {
  gsap.fromTo(footer, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: footer, start: 'top 96%' } });
}

gsap.utils.toArray('.contact-map-placeholder').forEach(el =>
  gsap.fromTo(el, { opacity: 0, scale: 0.97 },
    { opacity: 1, scale: 1, duration: 0.9, ease: 'power3.out', ...st(el, { start: 'top 84%' }) })
);

/* ── 11. Parallax ────────────────────────────────────────────── */

/* Hero bg: Ken Burns CSS animation handles visual motion */

const bgTxt = document.querySelector('.page-header-bg-text');
if (bgTxt) {
  gsap.to(bgTxt, { y: 100, ease: 'none',
    scrollTrigger: { trigger: '.page-header', start: 'top top', end: 'bottom top', scrub: true }
  });
}

gsap.utils.toArray('.career-bg-img, .career-hero-img').forEach(el => {
  gsap.to(el, { yPercent: 18, ease: 'none',
    scrollTrigger: { trigger: el.closest('section, div'), start: 'top bottom', end: 'bottom top', scrub: true }
  });
});

gsap.utils.toArray('.about-img-wrap img, .msg-img-wrap img').forEach(el => {
  gsap.to(el, { yPercent: -8, ease: 'none',
    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
  });
});

gsap.utils.toArray('.sv-overview').forEach(el =>
  gsap.fromTo(el.querySelector('p'), { opacity: 0, y: 22 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', ...st(el) })
);

/* ── 12. Magnetic buttons (desktop only) ─────────────────────── */
if (window.matchMedia('(pointer: fine)').matches) {
  document.querySelectorAll('.btn-primary, .btn-white, .btn-outline').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      gsap.to(btn, {
        x: (e.clientX - r.left - r.width  / 2) * 0.28,
        y: (e.clientY - r.top  - r.height / 2) * 0.28,
        duration: 0.35, ease: 'power2.out'
      });
    });
    btn.addEventListener('mouseleave', () =>
      gsap.to(btn, { x: 0, y: 0, duration: 0.65, ease: 'elastic.out(1, 0.4)' })
    );
  });
}

/* ── 13. Newsbar entrance ────────────────────────────────────── */
const newsbar = document.getElementById('newsbar');
if (newsbar) {
  gsap.fromTo(newsbar, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.65, delay: 1.2, ease: 'power3.out' });
}

/* ── 14. About page philosophy items ─────────────────────────── */
gsap.utils.toArray('.style-item, .philosophy-point').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.65, delay: i * 0.08, ease: 'power3.out', ...st(el) })
);
gsap.utils.toArray('.company-table tr').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, delay: i * 0.06, ease: 'power3.out', ...st(el) })
);

/* ── 15. Message page sections ───────────────────────────────── */
gsap.utils.toArray('.msg-sec').forEach((el, i) =>
  gsap.fromTo(el, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out', ...st(el) })
);
