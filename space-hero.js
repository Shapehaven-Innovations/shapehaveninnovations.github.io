// Generative space hero: spiral galaxy + starfield + drifting code tokens.
// No video assets; renders to <canvas>. Safe to re-run after SPA page swaps.
let spaceHeroCleanup = null;

function initSpaceHero() {
  if (spaceHeroCleanup) { spaceHeroCleanup(); spaceHeroCleanup = null; }

  const hero = document.querySelector('.space-hero');
  const canvas = hero && hero.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOKENS = ['{ }', '=>', '</>', '0x1F', 'func', 'git', '[ ]', '&&', 'async', '#!', 'SELECT', 'return'];

  let w = 0, h = 0, dpr = 1;
  let stars = [], arms = [], glyphs = [];
  let rafId = 0, running = false, t = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    stars = Array.from({ length: Math.round(w * h / 2500) }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.2 + 0.2,
      s: Math.random() * 0.15 + 0.02,
      tw: Math.random() * Math.PI * 2
    }));

    // Log-spiral galaxy: 3 arms of particles with scatter
    const n = Math.round(Math.min(w, 1200) * 1.6);
    arms = Array.from({ length: n }, (_, i) => {
      const arm = i % 3;
      const d = Math.pow(Math.random(), 0.6);          // radial dist 0..1
      const a = arm * (Math.PI * 2 / 3) + d * 5.2;     // spiral winding
      const scatter = (Math.random() - 0.5) * 0.35 * (0.3 + d);
      return { d, a: a + scatter, z: (Math.random() - 0.5) * 0.06, hue: 215 + d * 70 + Math.random() * 20 };
    });

    glyphs = Array.from({ length: Math.max(6, Math.round(w / 110)) }, () => newGlyph(true));
  }

  function newGlyph(initial) {
    return {
      x: Math.random() * w,
      y: initial ? Math.random() * h : h + 20,
      v: Math.random() * 0.25 + 0.08,
      txt: TOKENS[Math.floor(Math.random() * TOKENS.length)],
      size: Math.random() * 5 + 10,
      o: Math.random() * 0.25 + 0.1
    };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // deep space backdrop
    const bg = ctx.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, Math.max(w, h) * 0.7);
    bg.addColorStop(0, '#101a33');
    bg.addColorStop(0.5, '#080c1a');
    bg.addColorStop(1, '#02030a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // stars
    for (const s of stars) {
      const a = 0.45 + 0.55 * Math.sin(t * 0.02 + s.tw);
      ctx.fillStyle = `rgba(255,255,255,${a * 0.8})`;
      ctx.fillRect(s.x, s.y, s.r, s.r);
      if (!reduceMotion) { s.x -= s.s; if (s.x < -2) s.x = w + 2; }
    }

    // galaxy: tilted ellipse, slow rotation
    const cx = w * 0.5, cy = h * 0.62;
    const R = Math.min(w * 0.42, h * 1.1);
    const tilt = 0.32;
    const rot = t * 0.0012;

    const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.35);
    core.addColorStop(0, 'rgba(255,230,190,0.55)');
    core.addColorStop(0.4, 'rgba(255,170,110,0.16)');
    core.addColorStop(1, 'rgba(255,170,110,0)');
    ctx.fillStyle = core;
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'lighter';
    for (const p of arms) {
      const ang = p.a + rot * (1.4 - p.d);             // inner spins faster
      const x = cx + Math.cos(ang) * p.d * R;
      const y = cy + Math.sin(ang) * p.d * R * tilt + p.z * R;
      const sz = 0.6 + (1 - p.d) * 1.1;
      ctx.fillStyle = `hsla(${p.hue},80%,${68 - p.d * 14}%,${0.55 - p.d * 0.3})`;
      ctx.fillRect(x, y, sz, sz);
    }
    ctx.globalCompositeOperation = 'source-over';

    // drifting code tokens
    ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i];
      ctx.font = `${g.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = `rgba(150,200,255,${g.o})`;
      ctx.fillText(g.txt, g.x, g.y);
      if (!reduceMotion) { g.y -= g.v; if (g.y < -20) glyphs[i] = newGlyph(false); }
    }
  }

  function frame() {
    t++;
    draw();
    rafId = requestAnimationFrame(frame);
  }

  function start() { if (!running && !reduceMotion) { running = true; rafId = requestAnimationFrame(frame); } }
  function stop() { running = false; cancelAnimationFrame(rafId); }

  // pause when offscreen
  const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { threshold: 0 });
  io.observe(hero);

  // scroll-driven expand: --p 0 (inset) -> 1 (wide)
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const r = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh - r.top) / (vh * 0.9)));
      hero.style.setProperty('--p', reduceMotion ? 1 : p.toFixed(3));
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  let resizeTimer;
  function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => { build(); draw(); }, 150); }
  window.addEventListener('resize', onResize);

  build();
  draw();          // static frame (also the reduced-motion render)
  onScroll();

  spaceHeroCleanup = () => {
    stop();
    io.disconnect();
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onResize);
  };
}
