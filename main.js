/* ═══════════════════════════════════════════════
   HAARFREI TRIER — Premium JS · Türkis Edition
   ═══════════════════════════════════════════════ */
'use strict';

/* ── LOADER ── */
(function initLoader() {
  const loader = document.getElementById('loader');
  const progress = document.getElementById('loaderProgress');
  if (!loader || !progress) return;
  document.body.style.overflow = 'hidden';
  let pct = 0;
  const t = setInterval(() => {
    pct += Math.random() * 18 + 5;
    if (pct >= 100) {
      pct = 100; progress.style.width = '100%';
      clearInterval(t);
      setTimeout(() => {
        loader.classList.add('hide');
        document.body.style.overflow = '';
        initReveal(); initCounters(); initBars();
      }, 350);
    } else { progress.style.width = pct + '%'; }
  }, 55);
})();

/* ── CURSOR ── */
(function initCursor() {
  const c = document.getElementById('cursor');
  const f = document.getElementById('cursorFollower');
  if (!c || !f) return;
  let mx = 0, my = 0, fx = 0, fy = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    c.style.left = mx + 'px'; c.style.top = my + 'px';
  });
  (function loop() {
    fx += (mx - fx) * 0.1; fy += (my - fy) * 0.1;
    f.style.left = fx + 'px'; f.style.top = fy + 'px';
    requestAnimationFrame(loop);
  })();
  document.querySelectorAll('a, button, .service-card, .testimonial-card, .faq-question, .team-card').forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
})();

/* ── NAV ── */
(function initNav() {
  const nav = document.getElementById('nav');
  const burger = document.getElementById('navBurger');
  const links = document.getElementById('navLinks');
  if (!nav) return;
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  if (burger && links) {
    burger.addEventListener('click', () => {
      links.classList.toggle('open');
      const spans = burger.querySelectorAll('span');
      if (links.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
      } else { spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; }); }
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      links.classList.remove('open');
      burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }));
  }
})();

/* ── SMOOTH SCROLL ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

/* ── REVEAL ── */
function initReveal() {
  const els = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay) || 0;
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── COUNTERS ── */
function initCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      const target = parseInt(el.dataset.target);
      let cur = 0; const step = target / (1600 / 16);
      const t = setInterval(() => {
        cur = Math.min(cur + step, target);
        el.textContent = Math.round(cur);
        if (cur >= target) clearInterval(t);
      }, 16);
      obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(el);
  });
}

/* ── PROGRESS BARS ── */
function initBars() {
  document.querySelectorAll('.tf-fill').forEach(bar => {
    const obs = new IntersectionObserver(entries => {
      if (!entries[0].isIntersecting) return;
      const w = bar.style.width; bar.style.width = '0';
      setTimeout(() => { bar.style.width = w; }, 150);
      obs.disconnect();
    }, { threshold: 0.5 });
    obs.observe(bar);
  });
}

/* ── FAQ ACCORDION ── */
document.querySelectorAll('.faq-question').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

/* ── HERO PARALLAX ── */
window.addEventListener('scroll', () => {
  const hero = document.querySelector('.hero-content');
  if (!hero) return;
  const sy = window.scrollY;
  if (sy < window.innerHeight) {
    hero.style.transform = `translateY(${sy * 0.2}px)`;
    hero.style.opacity = Math.max(0, 1 - sy / (window.innerHeight * 0.75));
  }
}, { passive: true });

/* ── CARD TILT ── */
document.querySelectorAll('.service-card, .testimonial-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    card.style.transform = `translateY(-6px) perspective(800px) rotateX(${(-y/r.height*6).toFixed(2)}deg) rotateY(${(x/r.width*6).toFixed(2)}deg)`;
  });
  card.addEventListener('mouseleave', () => { card.style.transform = ''; });
});

/* ── CONTACT FORM ── */
document.querySelectorAll('#contactForm').forEach(form => {
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const span = btn?.querySelector('span');
    if (!span) return;
    span.textContent = 'Wird gesendet…'; btn.disabled = true;
    setTimeout(() => {
      span.textContent = 'Nachricht gesendet ✓';
      btn.style.background = 'var(--primary-2)';
      form.reset();
      setTimeout(() => { span.textContent = 'Nachricht senden'; btn.disabled = false; btn.style.background = ''; }, 3000);
    }, 1200);
  });
});

/* ── ACTIVE NAV LINK ── */
(function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link:not(.nav-cta)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path) link.classList.add('active');
  });
})();

/* On inner pages, init reveal immediately (no loader) */
if (!document.getElementById('loader')) {
  initReveal(); initCounters(); initBars();
} else {
  // Also trigger for pages without loader
  const loaderEl = document.getElementById('loader');
  if (loaderEl && loaderEl.classList.contains('hide')) {
    initReveal(); initCounters(); initBars();
  }
}
