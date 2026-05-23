/* =========================================================================
   autoinference — landing page interactions + animations
   ========================================================================= */

(function () {
  'use strict';

  /* ---------------------------------------------------------------------
     Nav scroll state
     --------------------------------------------------------------------- */
  const nav = document.getElementById('nav');
  if (nav) {
    let lastScroll = 0;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > 12) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
      lastScroll = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------------------------------------------------
     Mobile menu
     --------------------------------------------------------------------- */
  const burger = document.getElementById('burger');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('menu-open');
    });
    document.querySelectorAll('.nav__links a').forEach(a => {
      a.addEventListener('click', () => nav.classList.remove('menu-open'));
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll (IntersectionObserver)
     --------------------------------------------------------------------- */
  const reveals = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && reveals.length) {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        });
      },
      { rootMargin: '-50px 0px', threshold: 0.08 }
    );
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  /* ---------------------------------------------------------------------
     Bignum bars in-view (and counter animation)
     --------------------------------------------------------------------- */
  const bignums = document.querySelectorAll('.bignum');
  const counters = document.querySelectorAll('.counter');

  function animateCounter(el) {
    const target = parseFloat(el.getAttribute('data-target') || '0');
    const isFloat = String(target).indexOf('.') !== -1;
    const duration = 1600;
    const start = performance.now();
    const startVal = 0;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const v = startVal + (target - startVal) * eased;
      el.textContent = isFloat ? v.toFixed(1) : Math.round(v).toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = isFloat ? target.toFixed(1) : Math.round(target).toLocaleString();
    }
    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const ioStats = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          const c = e.target.querySelector('.counter');
          if (c) animateCounter(c);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    bignums.forEach(el => ioStats.observe(el));
  }

  /* ---------------------------------------------------------------------
     Performance chart line draw on view
     --------------------------------------------------------------------- */
  const perfSvg = document.querySelector('.perfchart__svg');
  if (perfSvg && 'IntersectionObserver' in window) {
    // set stroke dash lengths
    perfSvg.querySelectorAll('.chartline').forEach(p => {
      const len = p.getTotalLength ? p.getTotalLength() : 1000;
      p.style.strokeDasharray = len;
      p.style.strokeDashoffset = len;
    });
    const ioPerf = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('animate');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    ioPerf.observe(perfSvg);
  }

  /* ---------------------------------------------------------------------
     Test rows in-view (cascade)
     --------------------------------------------------------------------- */
  const testrows = document.querySelectorAll('.testrow');
  if (testrows.length && 'IntersectionObserver' in window) {
    const ioTest = new IntersectionObserver((entries, obs) => {
      entries.forEach((e, idx) => {
        if (e.isIntersecting) {
          // cascade based on row index in DOM
          const all = Array.from(document.querySelectorAll('.testrow'));
          const myIdx = all.indexOf(e.target);
          setTimeout(() => e.target.classList.add('in-view'), Math.max(0, myIdx) * 80);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    testrows.forEach(el => ioTest.observe(el));
  }

  /* ---------------------------------------------------------------------
     Subtle parallax for hero mock (mouse-tilt)
     --------------------------------------------------------------------- */
  const heroMock = document.querySelector('.mock--hero');
  if (heroMock && window.matchMedia('(pointer:fine)').matches) {
    const wrap = heroMock.parentElement;
    wrap.addEventListener('mousemove', (ev) => {
      const r = wrap.getBoundingClientRect();
      const px = (ev.clientX - r.left) / r.width - 0.5;
      const py = (ev.clientY - r.top) / r.height - 0.5;
      const rx = 2 + (-py * 4);
      const ry = px * 4;
      heroMock.style.transform = `perspective(2000px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
    });
    wrap.addEventListener('mouseleave', () => {
      heroMock.style.transform = 'perspective(2000px) rotateX(2deg) rotateY(0)';
    });
  }

  /* ---------------------------------------------------------------------
     Smooth anchor scroll with offset (compensate sticky nav)
     --------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href || href === '#') return;
      const tgt = document.querySelector(href);
      if (!tgt) return;
      e.preventDefault();
      const y = tgt.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', href);
    });
  });

  /* ---------------------------------------------------------------------
     Live "agent log" — add a couple of subtle pulses every few seconds
     --------------------------------------------------------------------- */
  const agentLog = document.querySelector('.agentlog');
  if (agentLog) {
    setInterval(() => {
      // brief flicker on the active row
      const active = agentLog.querySelector('.agentlog__row--active');
      if (!active) return;
      active.style.background = 'rgba(251,146,60,0.12)';
      setTimeout(() => { active.style.background = ''; }, 350);
    }, 4500);
  }

  /* ---------------------------------------------------------------------
     Live "stats" — subtle number jitter in hero stats
     --------------------------------------------------------------------- */
  const heroStat = document.querySelector('.mock__statsrow .statcard:first-child .statcard__value');
  if (heroStat) {
    setInterval(() => {
      // small fluctuation around 14,820
      const v = 14820 + Math.round((Math.random() - 0.5) * 40);
      heroStat.textContent = v.toLocaleString();
    }, 3200);
  }

  /* ---------------------------------------------------------------------
     Waitlist form (mock submit handler)
     --------------------------------------------------------------------- */
  window._aiSubmit = function (form) {
    const email = form.querySelector('.cta__email').value;
    if (!email) return;
    const btn = form.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = 'Thanks — we\'ll be in touch <span class="btn__arrow">✓</span>';
    btn.style.background = 'var(--grad-brand)';
    btn.style.color = 'white';
    setTimeout(() => {
      btn.innerHTML = original;
      btn.style.background = '';
      btn.style.color = '';
      form.querySelector('.cta__email').value = '';
    }, 3500);
    // when backend exists, POST to /waitlist here
  };

  /* ---------------------------------------------------------------------
     Year in footer (in case copyright moves)
     --------------------------------------------------------------------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

})();
