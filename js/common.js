// =====================================================
// COMMON INTERACTIONS — shared across all pages
// =====================================================

// Scroll reveal
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) entry.target.classList.add('active');
  });
}, { threshold: 0.15 });
reveals.forEach(el => observer.observe(el));

// Nav scroll
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 60);
});

// 3D Tilt on cards
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'translateY(0) perspective(800px) rotateY(0) rotateX(0)';
  });
});

// 3D Tilt on product cards
document.querySelectorAll('[data-product-tilt]').forEach(inner => {
  const card = inner.parentElement;
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    inner.style.transform = `perspective(1000px) rotateY(${x * 20}deg) rotateX(${-y * 15}deg) scale(1.02)`;
  });
  card.addEventListener('mouseleave', () => {
    inner.style.transform = 'perspective(1000px) rotateY(0) rotateX(0) scale(1)';
  });
});


// Desktop-only: custom cursor + mouse-tracked gradient
// Skip entirely on touch devices (no hover capability)
if (window.matchMedia('(hover: hover)').matches) {
  // Custom cursor
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  let cx = 0, cy = 0, dx = 0, dy = 0;
  document.addEventListener('mousemove', e => { cx = e.clientX; cy = e.clientY; });
  function animCursor() {
    dx += (cx - dx) * 0.15;
    dy += (cy - dy) * 0.15;
    if (dot) { dot.style.left = cx - 4 + 'px'; dot.style.top = cy - 4 + 'px'; }
    if (ring) {
      const rSize = ring.classList.contains('hover') ? 25 : 18;
      ring.style.left = dx - rSize + 'px'; ring.style.top = dy - rSize + 'px';
    }
    requestAnimationFrame(animCursor);
  }
  animCursor();

  // Cursor hover effects — class toggle for smooth CSS transition
  document.querySelectorAll('a, [data-tilt], .product-card, button, .cta-btn, .nav-cta, .link-btn').forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (dot) dot.classList.add('hover');
      if (ring) ring.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      if (dot) dot.classList.remove('hover');
      if (ring) ring.classList.remove('hover');
    });
  });

  // =====================================================
  // SITE-WIDE — Mouse Gradient (all pages)
  // =====================================================
  document.addEventListener('mousemove', e => {
    document.body.style.setProperty('--mx', e.clientX + 'px');
    document.body.style.setProperty('--my', e.clientY + 'px');
  });
}


// =====================================================
// PAGE HERO — Confetti Particles (sub pages only)
// =====================================================
const pageHero = document.querySelector('.page-hero');
if (pageHero) {

  // Confetti canvas
  const cvs = document.createElement('canvas');
  cvs.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  pageHero.insertBefore(cvs, pageHero.firstChild);
  const ctx = cvs.getContext('2d');

  let mouseInHero = false;
  let heroMx = -999, heroMy = -999;
  pageHero.addEventListener('mousemove', e => {
    const rect = pageHero.getBoundingClientRect();
    heroMx = e.clientX - rect.left;
    heroMy = e.clientY - rect.top;
    mouseInHero = true;
  });
  pageHero.addEventListener('mouseleave', () => { mouseInHero = false; });

  function resizeCvs() {
    cvs.width = pageHero.offsetWidth;
    cvs.height = pageHero.offsetHeight;
  }
  resizeCvs();
  window.addEventListener('resize', resizeCvs);

  // Soft dot particles — white + sky blue
  const colors = [
    'rgba(255,255,255,',
    'rgba(200,225,240,',
    'rgba(140,180,213,',
    'rgba(180,210,235,',
    'rgba(220,238,250,',
  ];
  const particles = [];
  const COUNT = 90;
  const MOUSE_RADIUS = 140;

  for (let i = 0; i < COUNT; i++) {
    particles.push({
      x: Math.random() * cvs.width,
      y: Math.random() * cvs.height,
      size: 1.2 + Math.random() * 2.3,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 0.2,
      vy: -0.08 - Math.random() * 0.15,
      opacity: 0.25 + Math.random() * 0.45,
    });
  }

  function animParticles() {
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      // Mouse repel
      if (mouseInHero) {
        const ddx = p.x - heroMx;
        const ddy = p.y - heroMy;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * 2;
          p.x += (ddx / dist) * force;
          p.y += (ddy / dist) * force;
        }
      }

      // Wrap
      if (p.y < -10) { p.y = cvs.height + 10; p.x = Math.random() * cvs.width; }
      if (p.x < -10) p.x = cvs.width + 10;
      if (p.x > cvs.width + 10) p.x = -10;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.fill();
    });
    requestAnimationFrame(animParticles);
  }
  animParticles();
}


// ===== Mobile Hamburger Toggle (added later) =====
(function() {
  const hamburger = document.querySelector('.nav-hamburger');
  const navLinks = document.querySelector('.nav-links');
  if (!hamburger || !navLinks) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // 메뉴 항목 클릭 시 자동 닫기 (드롭다운 토글 제외)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!link.classList.contains('dropdown-toggle')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
      }
    });
  });

  // 외부 클릭 시 닫기
  document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
    }
  });
})();
