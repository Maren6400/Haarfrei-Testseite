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
      if (!el.dataset.target) return;
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
  if (window.innerWidth < 768) return;
  const hero = document.querySelector('.hero-content');
  if (!hero) return;
  const sy = window.scrollY;
  if (sy < window.innerHeight) {
    hero.style.transform = `translateY(${sy * 0.2}px)`;
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
    fetch(form.action, { method: 'POST', body: new FormData(form) })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          span.textContent = 'Nachricht gesendet ✓';
          btn.style.background = 'var(--primary-2)';
          form.reset();
          setTimeout(() => { span.textContent = 'Nachricht senden'; btn.disabled = false; btn.style.background = ''; }, 3000);
        } else {
          span.textContent = 'Fehler – bitte erneut versuchen';
          btn.disabled = false;
        }
      })
      .catch(() => {
        span.textContent = 'Fehler – bitte erneut versuchen';
        btn.disabled = false;
      });
  });
});

/* ── ZERTIFIKATE LIGHTBOX ── */
function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('active');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
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

/* ── GOOGLE ANALYTICS CONSENT ── */
(function initConsent() {
  var GA_ID = 'G-C786GT03VX';
  var FB_ID = '765528657266056';

  function loadGA() {
    if (window.__gaLoaded) return;
    window.__gaLoaded = true;
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function loadPixel() {
    if (window.__fbLoaded) return;
    window.__fbLoaded = true;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
    n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
    (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', FB_ID);
    fbq('track', 'PageView');
  }

  function loadAll() { loadGA(); loadPixel(); }

  if (localStorage.getItem('ga_consent') === 'granted') { loadAll(); return; }
  if (localStorage.getItem('ga_consent') === 'denied') return;

  // Banner erst nach Load-Event anzeigen, damit LCP nicht blockiert wird
  window.addEventListener('load', function() {
    setTimeout(function() {
      var banner = document.createElement('div');
      banner.id = 'cookieBanner';
      banner.innerHTML =
        '<p>Diese Website nutzt Google Analytics und Meta Pixel, um Besucherzahlen zu verstehen. ' +
        'Daten werden nur mit Ihrer Zustimmung erhoben. ' +
        '<a href="datenschutz.html">Datenschutz</a></p>' +
        '<div class="cookie-actions">' +
        '<button class="btn-cookie-accept" id="cookieAccept">Akzeptieren</button>' +
        '<button class="btn-cookie-decline" id="cookieDecline">Ablehnen</button>' +
        '</div>';
      document.body.appendChild(banner);

      document.getElementById('cookieAccept').addEventListener('click', function() {
        localStorage.setItem('ga_consent', 'granted');
        banner.remove();
        loadAll();
      });
      document.getElementById('cookieDecline').addEventListener('click', function() {
        localStorage.setItem('ga_consent', 'denied');
        banner.remove();
      });
    }, 500);
  });
})();
