/* LiA Website — Main JS */

// Header scroll
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

// Hamburger
const hamburger = document.querySelector('.hamburger');
const navMobile = document.querySelector('.nav-mobile');
if (hamburger && navMobile) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMobile.classList.toggle('open');
    document.body.style.overflow = navMobile.classList.contains('open') ? 'hidden' : '';
  });
  // close on link click
  navMobile.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navMobile.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// Scroll reveal
const reveals = document.querySelectorAll('.reveal, .reveal-l, .reveal-r');
if ('IntersectionObserver' in window && reveals.length) {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });
  reveals.forEach((el, i) => {
    const delay = el.dataset.delay || 0;
    el.style.transitionDelay = delay + 's';
    obs.observe(el);
  });
}

// Stagger children
document.querySelectorAll('[data-stagger]').forEach(parent => {
  Array.from(parent.children).forEach((child, i) => {
    child.classList.add('reveal');
    child.dataset.delay = (i * 0.1).toFixed(1);
    child.style.transitionDelay = (i * 0.1) + 's';
  });
  if ('IntersectionObserver' in window) {
    const obs2 = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          Array.from(parent.children).forEach((child, i) => {
            setTimeout(() => child.classList.add('in'), i * 100);
          });
          obs2.unobserve(parent);
        }
      });
    }, { threshold: 0.1 });
    obs2.observe(parent);
  }
});

// Active nav
const path = window.location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-desktop a, .nav-mobile a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) {
    a.classList.add('active');
  }
});
