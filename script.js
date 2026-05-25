/* =========================================================================
   autoinference — landing page interactions + animations
   ========================================================================= */

/* ---------------------------------------------------------------------
   PRELOADER — runs immediately on script load.
   Builds many rain columns + manages the hide timing.
   --------------------------------------------------------------------- */
(function preloader() {
  const rainEl = document.getElementById('preRain');
  const preEl  = document.getElementById('preloader');
  const statusEl = document.getElementById('preStatus');
  if (!preEl) return;

  // build N columns of ASCII rain across the screen width
  if (rainEl) {
    // Massive vocabulary — verbs + nouns + adjectives so combinations
    // very rarely repeat. ~85 verbs × ~80 nouns × ~30 templates ≈ 200k possibilities.
    const VERBS = [
      'scan','probe','tune','verify','compile','profile','ramp','cache','rank','fuse',
      'check','warm','sweep','load','init','build','link','allocate','schedule','dispatch',
      'broadcast','gather','reduce','partition','replicate','materialize','optimize','fold',
      'unroll','vectorize','prefetch','evict','hash','sort','merge','split','balance','route',
      'monitor','trace','sample','throttle','queue','drain','flush','sync','snapshot','restore',
      'replay','capture','emit','ingest','render','validate','certify','attest','audit','mirror',
      'shadow','refresh','rebalance','recompile','rehash','reorder','realign','quantize','calibrate',
      'inline','splice','rewire','prune','distill','export','import','seed','spawn','await',
      'detach','attach','pause','resume','tag','untag','assert','negotiate','escalate'
    ];
    const NOUNS = [
      'workload','kernel','config','topology','engine','manifest','bench','graph','pipeline','batch',
      'runtime','recipe','tensor','allocator','scheduler','planner','executor','anchor','lattice',
      'vertex','node','cluster','fabric','mesh','ring','tree','dag','queue','buffer','stream',
      'channel','partition','shard','fragment','payload','request','frame','layer','head','block',
      'dim','axis','shape','stride','slice','embedding','prompt','token','vocab','span','cursor',
      'frontier','oracle','ledger','attention','mlp','ffn','gate','expert','register','context',
      'index','catalog','digest','signature','sentinel','snapshot','warmup','prefill','decode',
      'rollout','quantizer','bandwidth','latency','barrier','semaphore','heap','arena'
    ];
    const STATUSES = ['ok','done','pass','warn','skip','live','idle','ready','wait','hold'];
    const HEX = '0123456789abcdef';

    function mkRng(seed) {
      let s = seed >>> 0;
      return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    }

    function buildLines(seed, lineCount) {
      const rand = mkRng(seed);
      const pick = arr => arr[Math.floor(rand() * arr.length)];
      const ri = (max) => Math.floor(rand() * max);

      function ts() {
        return '[' + String(ri(24)).padStart(2,'0') + ':' + String(ri(60)).padStart(2,'0') + ':' + String(ri(60)).padStart(2,'0') + ']';
      }
      function hex(n) { let s = ''; for (let i = 0; i < n; i++) s += HEX[ri(16)]; return s; }
      function bar(w) { const W = w || 10 + ri(6); const f = ri(W); return '▓'.repeat(f) + '░'.repeat(W - f); }
      function pad2(n) { return String(n).padStart(2, '0'); }

      // 30 distinct templates — combined with 85 verbs × 80 nouns ≈ 200k+
      // unique outputs. Heavily weighted toward blank lines for sparseness.
      const tpls = [
        // ~50% blank — visual breathing
        () => '', () => '', () => '', () => '', () => '', () => '', () => '', () => '',
        () => '', () => '', () => '', () => '', () => '',
        // timestamps & rules
        () => ts(),
        () => '─'.repeat(8 + ri(6)),
        () => '┄'.repeat(8 + ri(6)),
        // tool / result rows
        () => '● ' + pick(VERBS),
        () => '● ' + pick(VERBS) + ' ' + pick(NOUNS),
        () => '  ⎿ ' + pick(STATUSES),
        () => '  ⎿ ' + ri(999) + 'ms',
        () => '  ⎿ ' + (ri(99)) + '.' + pad2(ri(99)) + 'MB',
        () => '  ⎿ ' + pick(NOUNS) + ': ' + pick(STATUSES),
        // bars / progress
        () => bar() + ' ' + ri(100) + '%',
        () => bar(),
        // file paths + identifiers
        () => 'src/' + pick(NOUNS) + '.py',
        () => 'lib/' + pick(NOUNS) + '.cu',
        () => 'out/' + pick(VERBS) + '-' + ri(9999),
        () => pick(NOUNS) + '_' + ri(99) + '.bin',
        // network/hex/version artifacts
        () => '0x' + hex(6),
        () => 'sha:' + hex(8),
        () => 'v' + ri(9) + '.' + ri(99) + '.' + ri(99),
        () => 'node-' + pad2(ri(64)),
        () => '10.0.' + ri(255) + '.' + ri(255),
        // command-like
        () => '$ ' + pick(VERBS) + ' --' + pick(NOUNS),
        () => '> ' + pick(VERBS) + ' ' + pick(NOUNS),
        () => '↳ ' + pick(VERBS) + ' ' + ri(100) + '%',
        // measurement-like
        () => pick(NOUNS) + ': ' + (ri(99) + 1) + '.' + ri(9) + 'k',
        () => 'p' + (50 + ri(50)) + ' = ' + ri(999) + 'ms'
      ];

      const lines = [];
      for (let i = 0; i < lineCount; i++) {
        lines.push(tpls[Math.floor(rand() * tpls.length)]());
      }
      const text = lines.join('\n');
      return text + '\n' + text; // duplicate for seamless loop
    }

    // 10-11 parallel columns with small visible gaps between them.
    // Slot width ~140px → typically 10-11 columns on a 1400-1500px desktop.
    // Each column body capped to 115px in CSS so a small gap stays visible.
    const vw = window.innerWidth || 1200;
    const numCols = Math.max(8, Math.min(12, Math.floor(vw / 140)));
    const colWidth = 100 / numCols;

    for (let i = 0; i < numCols; i++) {
      const col = document.createElement('pre');
      col.className = 'preloader__col';
      // center each column inside its allotted slot for even spacing
      col.style.left = ((i + 0.5) * colWidth) + '%';
      col.style.transform = 'translateX(-50%)';
      const duration = 38 + (i * 7) % 30 + Math.random() * 14;
      const delay = -Math.random() * 30;
      col.style.animation = 'preRainScroll ' + duration.toFixed(1) + 's linear infinite';
      col.style.animationDelay = delay.toFixed(1) + 's';
      // wildly distinct seed per column so the procedural content diverges
      col.textContent = buildLines(13579 + i * 9737 + Math.floor(Math.random() * 100000), 140);
      rainEl.appendChild(col);
    }
  }

  // Cycle a few status messages while loading
  const statuses = [
    'initializing runtime...',
    'profiling hardware...',
    'loading recipes...',
    'warming kernels...',
    'ready.',
  ];
  let statusIdx = 0;
  const statusTimer = setInterval(function () {
    statusIdx++;
    if (statusEl && statusIdx < statuses.length) {
      statusEl.textContent = statuses[statusIdx];
    }
    if (statusIdx >= statuses.length - 1) clearInterval(statusTimer);
  }, 520);

  // Hide preloader: at least MIN_DISPLAY after page becomes interactive
  const MIN_DISPLAY = 2400;
  const start = performance.now();
  function hidePreloader() {
    const elapsed = performance.now() - start;
    const wait = Math.max(0, MIN_DISPLAY - elapsed);
    setTimeout(function () {
      preEl.classList.add('hidden');
      document.body.classList.remove('preloading');
      // remove from DOM after fade transition completes
      setTimeout(function () {
        if (preEl.parentNode) preEl.parentNode.removeChild(preEl);
      }, 900);
    }, wait);
  }
  if (document.readyState === 'complete') hidePreloader();
  else window.addEventListener('load', hidePreloader);
})();

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
     Premium word-by-word reveal — blur → clear, lift → settle, fade in.
     Each word transitions for ~1s with a 100ms stagger, so multiple words
     are mid-fade at once, producing a smooth left-to-right wash rather
     than a mechanical typewriter. Linear / Vercel / Stripe pattern.
     --------------------------------------------------------------------- */
  // Per-word reveal timing (must mirror CSS)
  const WORD_STAGGER = 110;     // ms between word starts (matches --wi * 110ms in CSS)
  const WORD_DURATION = 1200;   // ms per-word transition (matches CSS)
  const REVEAL_START_DELAY = 150;  // ms initial delay before first word starts

  function revealDurationFor(el) {
    const text = el.dataset.scrambleText || el.textContent || '';
    const wc = text.trim().split(/\s+/).length;
    return REVEAL_START_DELAY + (Math.max(0, wc - 1)) * WORD_STAGGER + WORD_DURATION;
  }

  // Title-class ancestors that should get a trailing blinking cursor
  const TITLE_CLASSES = ['hero__title', 'section__title', 'cta__title'];

  function findTitleAncestor(el) {
    let cur = el.parentElement;
    while (cur && cur !== document.body) {
      for (let i = 0; i < TITLE_CLASSES.length; i++) {
        if (cur.classList && cur.classList.contains(TITLE_CLASSES[i])) return cur;
      }
      cur = cur.parentElement;
    }
    return null;
  }

  function revealEl(el) {
    if (el.dataset.revealed === '1') return;
    if (!el.dataset.scrambleText) el.dataset.scrambleText = el.textContent;
    const text = el.dataset.scrambleText;
    const words = text.split(' ');

    // Compute sequential delay: wait for prior [data-scramble] siblings in same parent to finish
    let seqDelay = 0;
    const parent = el.parentElement;
    if (parent) {
      const all = parent.querySelectorAll(':scope > [data-scramble]');
      for (const sib of all) {
        if (sib === el) break;
        seqDelay += revealDurationFor(sib);
      }
    }
    el.style.setProperty('--seq-delay', seqDelay + 'ms');

    // wrap each word in a span with --wi index for staggered CSS transitions
    el.innerHTML = words.map((w, i) => {
      const safe = w.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
      return '<span class="rv-w" style="--wi:' + i + '">' + safe + '</span>';
    }).join(' ');
    el.dataset.revealed = '1';
    void el.offsetWidth;
    el.classList.add('rv-in');

    // Cursor: if this element is the LAST [data-scramble] in its title ancestor,
    // inject a blinking orange cursor INSIDE the last .rv-w span so it
    // stays together with the final word when the heading wraps.
    const titleEl = findTitleAncestor(el);
    if (titleEl) {
      const allInTitle = titleEl.querySelectorAll('[data-scramble]');
      const isLast = allInTitle[allInTitle.length - 1] === el;
      if (isLast && !titleEl.querySelector('.line-cursor')) {
        const cursor = document.createElement('span');
        cursor.className = 'line-cursor';
        cursor.setAttribute('aria-hidden', 'true');
        const rvWords = el.querySelectorAll('.rv-w');
        const lastWord = rvWords[rvWords.length - 1];
        if (lastWord) {
          // wrap last word + cursor together so they never break across lines
          lastWord.style.whiteSpace = 'nowrap';
          lastWord.appendChild(cursor);
        } else {
          titleEl.appendChild(cursor);
        }
        const total = seqDelay + revealDurationFor(el);
        setTimeout(function () { cursor.classList.add('in'); }, Math.max(0, total - 200));
      }
    }
  }

  // intersection-triggered reveal (one-time per element)
  const rvTargets = document.querySelectorAll('[data-scramble]');
  if (rvTargets.length && 'IntersectionObserver' in window) {
    const ioRv = new IntersectionObserver((entries, obs) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          revealEl(e.target);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    rvTargets.forEach(t => ioRv.observe(t));
  }
  // hover-scramble attribute is now a no-op (kept in HTML for backwards-compat)

  /* ---------------------------------------------------------------------
     Background ASCII rain — generates two columns of procedural
     terminal-style activity that scrolls slowly in the background
     --------------------------------------------------------------------- */
  function buildRain(elId, lineCount, seed) {
    const el = document.getElementById(elId);
    if (!el) return;
    // Same expanded vocabulary as the preloader rain
    const verbs = [
      'scan','probe','tune','verify','compile','profile','ramp','cache','rank','fuse',
      'check','warm','sweep','load','init','build','link','allocate','schedule','dispatch',
      'broadcast','gather','reduce','partition','replicate','materialize','optimize','fold',
      'unroll','vectorize','prefetch','evict','hash','sort','merge','split','balance','route',
      'monitor','trace','sample','throttle','queue','drain','flush','sync','snapshot','restore',
      'replay','capture','emit','ingest','render','validate','certify','attest','audit','mirror',
      'shadow','refresh','rebalance','recompile','rehash','reorder','realign','quantize','calibrate',
      'inline','splice','rewire','prune','distill','export','import','seed','spawn','await',
      'detach','attach','pause','resume','tag','untag','assert','negotiate','escalate'
    ];
    const nouns = [
      'workload','kernel','config','topology','engine','manifest','bench','graph','pipeline','batch',
      'runtime','recipe','tensor','allocator','scheduler','planner','executor','anchor','lattice',
      'vertex','node','cluster','fabric','mesh','ring','tree','dag','queue','buffer','stream',
      'channel','partition','shard','fragment','payload','request','frame','layer','head','block',
      'dim','axis','shape','stride','slice','embedding','prompt','token','vocab','span','cursor',
      'frontier','oracle','ledger','attention','mlp','ffn','gate','expert','register','context',
      'index','catalog','digest','signature','sentinel','warmup','prefill','decode','rollout',
      'quantizer','bandwidth','latency','barrier','semaphore','heap','arena'
    ];
    const statuses = ['ok','done','pass','warn','skip','live','idle','ready','wait','hold'];
    const blocks = ['▒','░','▓','█'];
    const HEX = '0123456789abcdef';

    // simple seeded RNG for stable, reproducible columns
    let s = seed >>> 0;
    function rand() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }
    function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
    function ri(max) { return Math.floor(rand() * max); }
    function ts() {
      return '[' + String(ri(24)).padStart(2,'0') + ':' + String(ri(60)).padStart(2,'0') + ':' + String(ri(60)).padStart(2,'0') + ']';
    }
    function hex(n) { let o = ''; for (let i = 0; i < n; i++) o += HEX[ri(16)]; return o; }
    function bar(w) { const W = w || 10 + ri(6); const f = ri(W); return '▓'.repeat(f) + '░'.repeat(W - f); }
    function pad2(n) { return String(n).padStart(2, '0'); }
    function blockRun() { let o = ''; const n = 8 + ri(8); for (let i = 0; i < n; i++) o += pick(blocks); return o; }

    const tpls = [
      // ~50% blank for breathing room
      () => '', () => '', () => '', () => '', () => '', () => '', () => '', () => '',
      () => '', () => '', () => '', () => '', () => '',
      // timestamps, rules
      () => ts(),
      () => '─'.repeat(8 + ri(6)),
      () => '┄'.repeat(8 + ri(6)),
      // tool / result rows
      () => '● ' + pick(verbs),
      () => '● ' + pick(verbs) + ' ' + pick(nouns),
      () => '  ⎿ ' + pick(statuses),
      () => '  ⎿ ' + ri(999) + 'ms',
      () => '  ⎿ ' + (ri(99)) + '.' + pad2(ri(99)) + 'MB',
      () => '  ⎿ ' + pick(nouns) + ': ' + pick(statuses),
      // bars / progress
      () => bar() + ' ' + ri(100) + '%',
      () => blockRun(),
      // paths + identifiers
      () => 'src/' + pick(nouns) + '.py',
      () => 'lib/' + pick(nouns) + '.cu',
      () => 'out/' + pick(verbs) + '-' + ri(9999),
      () => pick(nouns) + '_' + ri(99) + '.bin',
      // network/hex/version
      () => '0x' + hex(6),
      () => 'sha:' + hex(8),
      () => 'v' + ri(9) + '.' + ri(99) + '.' + ri(99),
      () => 'node-' + pad2(ri(64)),
      () => '10.0.' + ri(255) + '.' + ri(255),
      // command-like
      () => '$ autoinference ' + pick(verbs),
      () => '> ' + pick(verbs) + ' ' + pick(nouns),
      () => '↳ ' + pick(verbs) + ' ' + ri(100) + '%',
      // measurement-like
      () => pick(nouns) + ': ' + (ri(99) + 1) + '.' + ri(9) + 'k',
      () => 'p' + (50 + ri(50)) + ' = ' + ri(999) + 'ms'
    ];

    const lines = [];
    for (let i = 0; i < lineCount; i++) {
      lines.push(tpls[Math.floor(rand() * tpls.length)]());
    }
    const text = lines.join('\n');
    el.textContent = text + '\n' + text;
  }

  buildRain('bgRainL', 130, 12345);
  buildRain('bgRainR', 130, 67890);

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
