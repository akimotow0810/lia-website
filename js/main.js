/* ===========================
   LiA Website - Main JS
   =========================== */

// ── Header scroll effect ──
const header = document.getElementById('header');
if (header) {
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// ── Active nav link ──
const navLinks = document.querySelectorAll('nav a:not(.nav-contact)');
const currentPath = window.location.pathname;
navLinks.forEach(link => {
  const href = link.getAttribute('href');
  if (href === currentPath || (href !== '/' && currentPath.includes(href.replace('.html', '')))) {
    link.classList.add('active');
  }
});

// ── Scroll reveal ──
const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => observer.observe(el));
}

// ── Staggered reveal for children ──
document.querySelectorAll('[data-stagger]').forEach(parent => {
  const children = parent.children;
  Array.from(children).forEach((child, i) => {
    child.style.transitionDelay = `${i * 0.1}s`;
    child.classList.add('reveal');
  });
});

// ── Re-run stagger observer ──
const staggerEls = document.querySelectorAll('[data-stagger] .reveal');
if ('IntersectionObserver' in window) {
  const obs2 = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  staggerEls.forEach(el => obs2.observe(el));
}

// ── Smooth anchor scroll ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
