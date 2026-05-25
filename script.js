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
    const duration = 2400;  // slower, more deliberate count-up
    const start = performance.now();
    const startVal = 0;

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out quartic — even smoother deceleration than cubic
      const eased = 1 - Math.pow(1 - t, 4);
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

  /* ---------------------------------------------------------------------
     CLI install tabs (hero install card)
     --------------------------------------------------------------------- */
  const tabs = document.querySelectorAll('.install-tab');
  const cmds = document.querySelectorAll('.install-cmd');
  if (tabs.length) {
    tabs.forEach(t => {
      t.addEventListener('click', () => {
        const target = t.getAttribute('data-tab');
        tabs.forEach(x => x.classList.toggle('active', x === t));
        cmds.forEach(c => {
          c.hidden = c.getAttribute('data-cmd') !== target;
        });
      });
    });
  }

  /* ---------------------------------------------------------------------
     Typewriter / text-completion animation — ChatGPT-style streaming
     reveal. Triggers on first scroll into view for [data-scramble]
     elements. No hover effect (let CSS color change handle hover).
     --------------------------------------------------------------------- */
  function typeEl(el, opts) {
    opts = opts || {};
    if (!el.dataset.scrambleText) el.dataset.scrambleText = el.textContent;
    const finalText = el.dataset.scrambleText;
    const speed     = opts.speed     || 55;   // ms per character — deliberate, premium pace
    const startWait = opts.startWait || 200;  // ms before typing begins (lets fade-in settle)
    const easeTail  = opts.easeTail  != null ? opts.easeTail : 0.35;  // last 35% of chars slow down
    const easeMax   = opts.easeMax   || 1.7;  // up to 1.7× base speed by the final char
    const len = finalText.length;
    if (el._typeTimer) clearTimeout(el._typeTimer);
    el.textContent = '';

    let i = 0;
    function tick() {
      i++;
      el.textContent = finalText.substring(0, i);
      if (i < len) {
        const remaining = len - i;
        const easeWindow = Math.max(1, len * easeTail);
        const slowFactor = remaining < easeWindow
          ? 1 + (1 - remaining / easeWindow) * (easeMax - 1)
          : 1;
        el._typeTimer = setTimeout(tick, speed * slowFactor);
      }
    }
    // small initial delay so the parent's fade-in completes first — premium feel
    el._typeTimer = setTimeout(tick, startWait);
  }

  // intersection-triggered typewriter (on first scroll into view)
  const typeTargets = document.querySelectorAll('[data-scramble]');
  if (typeTargets.length && 'IntersectionObserver' in window) {
    const ioType = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          typeEl(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.35 });
    typeTargets.forEach(t => ioType.observe(t));
  }
  // hover-scramble attribute is now a no-op (kept in HTML for backwards-compat)

  /* ---------------------------------------------------------------------
     Background ASCII rain — generates two columns of procedural
     terminal-style activity that scrolls slowly in the background
     --------------------------------------------------------------------- */
  function buildRain(elId, lineCount, seed) {
    const el = document.getElementById(elId);
    if (!el) return;
    const verbs   = ['scan', 'probe', 'tune', 'verify', 'compile', 'profile', 'ramp', 'cache', 'rank', 'fuse', 'check', 'warm', 'sweep'];
    const nouns   = ['workload', 'kernel', 'config', 'topology', 'engine', 'manifest', 'bench', 'graph', 'pipeline', 'batch'];
    const blocks  = ['▒', '░', '▓', '█'];
    const braille = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    const rules   = '─'.repeat(28);
    const blank   = '';

    // simple seeded RNG for stable, reproducible columns
    let s = seed >>> 0;
    function rand() {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    }
    function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

    function bar() {
      const filled = Math.floor(rand() * 24);
      const empty  = 24 - filled;
      return '▓'.repeat(filled) + '░'.repeat(empty) + '  ' + (filled * 4) + '%';
    }
    function timestamp() {
      const hh = String(13 + Math.floor(rand() * 11)).padStart(2, '0');
      const mm = String(Math.floor(rand() * 60)).padStart(2, '0');
      const ss = String(Math.floor(rand() * 60)).padStart(2, '0');
      return '[' + hh + ':' + mm + ':' + ss + ']';
    }
    function tool()    { return '● ' + pick(verbs) + ' ' + pick(nouns); }
    function result()  { return '  ⎿ ok'; }
    function ascii()   {
      let out = '';
      const n = 12 + Math.floor(rand() * 8);
      for (let i = 0; i < n; i++) out += pick(blocks);
      return out;
    }
    function spin()    { return pick(braille) + ' ' + pick(verbs) + '...'; }
    function prompt()  { return '$ autoinference ' + pick(verbs); }

    const generators = [
      blank, blank, blank, blank,    // lots of breathing room
      timestamp,
      rules,
      bar,
      tool, result,
      ascii,
      spin,
      prompt,
    ];

    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      const g = generators[Math.floor(rand() * generators.length)];
      lines.push(typeof g === 'function' ? g() : '');
    }
    // duplicate the content so the seamless loop works on the CSS translateY(-50%) animation
    const text = lines.join('\n');
    el.textContent = text + '\n' + text;
  }

  buildRain('bgRainL', 90, 12345);
  buildRain('bgRainR', 90, 67890);

  /* ---------------------------------------------------------------------
     Agent widget spinner (Claude Code CLI braille cycle)
     --------------------------------------------------------------------- */
  const spinnerFrames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  const agentSpinner = document.getElementById('agentSpinner');
  if (agentSpinner) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % spinnerFrames.length;
      agentSpinner.textContent = spinnerFrames[i];
    }, 110);
  }

  /* ---------------------------------------------------------------------
     Thinking spinner — Claude Code's ✶✸✹✺✺✹✸✶ cycle
     --------------------------------------------------------------------- */
  const thinkFrames = ['✶', '✷', '✸', '✹', '✺', '✹', '✸', '✷'];
  const thinkSpinner = document.getElementById('thinkSpinner');
  if (thinkSpinner) {
    let i = 0;
    setInterval(() => {
      i = (i + 1) % thinkFrames.length;
      thinkSpinner.textContent = thinkFrames[i];
    }, 180);
  }

  /* ---------------------------------------------------------------------
     ASCII performance bars (fill on view)
     --------------------------------------------------------------------- */
  const perfBars = document.querySelectorAll('.ascii-perf__row');
  if (perfBars.length && 'IntersectionObserver' in window) {
    const ioPerfX = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const target = parseInt(e.target.getAttribute('data-target'), 10) || 50;
        const fill = e.target.querySelector('.ascii-perf__fill');
        const counter = e.target.querySelector('.counter');
        setTimeout(() => { fill.style.width = target + '%'; }, 250);
        if (counter) animateCounter(counter);
        obs.unobserve(e.target);
      });
    }, { threshold: 0.3 });
    perfBars.forEach(b => ioPerfX.observe(b));
  }

  /* ---------------------------------------------------------------------
     Install copy button
     --------------------------------------------------------------------- */
  const copyBtn = document.getElementById('installCopy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const visible = document.querySelector('.install-cmd:not([hidden])');
      if (!visible) return;
      const text = visible.textContent.replace(/^\$\s*/, '').trim();
      try {
        await navigator.clipboard.writeText(text);
        copyBtn.classList.add('copied');
        const lbl = copyBtn.querySelector('span');
        const orig = lbl.textContent;
        lbl.textContent = 'Copied!';
        setTimeout(() => {
          copyBtn.classList.remove('copied');
          lbl.textContent = orig;
        }, 1800);
      } catch (e) {
        console.warn('Copy failed', e);
      }
    });
  }

})();
