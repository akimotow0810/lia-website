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

/* ── 7. Hero 9-cell photo grid rotation ─────────────────────── */
(function () {
  const cells = document.querySelectorAll('.hero-cell');
  if (!cells.length) return;

  // Unsplash business/office images (w=480 h=360 for each cell)
  const pool = [
    'photo-1497366216548-37526070297c', // modern office
    'photo-1560472354-b33ff0c44a43',    // business meeting table
    'photo-1542744173-8e7e53415bb0',    // whiteboard session
    'photo-1521737604893-d14cc237f11d', // people at desks
    'photo-1522071820081-009f0129c71c', // team work
    'photo-1600880292203-757bb62b4baf', // team meeting
    'photo-1553028826-f4804a6dba3b',    // open office
    'photo-1507003211169-0a1dd7228f2d', // professional portrait
    'photo-1573497019940-1c28c88b4f3e', // business woman
    'photo-1573496359142-b8d87734a5a2', // interview scene
    'photo-1454165804606-c3d57bc86b40', // laptop analysis
    'photo-1516321318423-f06f85e504b3', // laptop meeting
    'photo-1533750349088-cd871a92f312', // team brainstorm
    'photo-1568992687947-868a62a9f521', // office interior
    'photo-1497366754035-f200968a7ece', // workspace
    'photo-1508385082938-fd1ddc4a5b32', // handshake
    'photo-1551836022-deb4988cc6c0',    // work desk
    'photo-1527192491265-7e15c55b1ed2', // laptop work
  ].map(id => `https://images.unsplash.com/${id}?w=480&h=360&fit=crop&q=72&auto=format`);

  // Shuffle pool so adjacent cells start with different images
  const shuffled = pool.slice().sort(() => Math.random() - 0.5);

  cells.forEach((cell, i) => {
    // Two img elements per cell for crossfade
    const imgA = new Image();
    const imgB = new Image();
    imgA.src = shuffled[i % shuffled.length];
    imgB.src = shuffled[(i + cells.length) % shuffled.length];

    const base = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity 1.5s ease;';
    imgA.style.cssText = base;
    imgB.style.cssText = base + 'opacity:0;';
    cell.append(imgA, imgB);

    let front = imgA, back = imgB;
    let idx = (i + cells.length) % shuffled.length;

    function swap() {
      idx = (idx + 1) % pool.length;
      back.src = pool[idx];
      const doSwap = () => {
        front.style.opacity = '0';
        back.style.opacity  = '1';
        [front, back] = [back, front];
      };
      if (back.complete && back.naturalWidth) { doSwap(); }
      else { back.onload = doSwap; }
    }

    // Stagger start time so cells change at different moments
    const interval = 3600 + Math.random() * 2400; // 3.6–6s per cell
    const delay    = i * 380 + Math.random() * 300;
    setTimeout(() => { swap(); setInterval(swap, interval); }, delay);
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
