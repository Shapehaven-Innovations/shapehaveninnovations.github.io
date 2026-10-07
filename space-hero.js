// Generative hero: blueprint network above a perspective grid floor, packets in flight, drifting code tokens.
// No video assets; renders to <canvas>. Safe to re-run after SPA page swaps.
let spaceHeroCleanup = null;

function initSpaceHero() {
  if (spaceHeroCleanup) { spaceHeroCleanup(); spaceHeroCleanup = null; }

  const hero = document.querySelector('.space-hero');
  const canvas = hero && hero.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOKENS = ['{ }', '=>', '</>', '0x1F', 'func', 'git', '[ ]', '&&', 'async', '#!', 'SELECT', 'return', 'import', 'const', 'await', 'class', '=== ', 'npm i', 'POST /', 'try {', '200 OK', 'export'];
  const GRID = 48;

  let w = 0, h = 0, dpr = 1, horizon = 0;
  let nodes = [], edges = [], packets = [], glyphs = [], stars = [];
  let rafId = 0, running = false, t = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    horizon = h * 0.6;
    stars = Array.from({ length: Math.round(w * horizon / 2200) }, () => ({
      x: Math.random() * w,
      y: Math.random() * horizon,
      r: Math.random() < 0.05 ? 2 : Math.random() * 1.1 + 0.3,
      tw: Math.random() * Math.PI * 2
    }));

    // circuit network in the sky, on a snapped grid
    const cols = Math.floor(w / GRID);
    const rows = Math.floor(horizon / GRID);
    nodes = [];
    for (let i = 0; i < Math.round(cols * rows / 4.5); i++) {
      nodes.push({
        x: (1 + Math.floor(Math.random() * (cols - 1))) * GRID,
        y: (1 + Math.floor(Math.random() * (rows - 1))) * GRID,
        phase: Math.random() * Math.PI * 2,
      });
    }
    edges = [];
    nodes.forEach((a, i) => {
      nodes
        .map((b, j) => ({ j, d: Math.hypot(a.x - b.x, a.y - b.y) }))
        .filter(o => o.j !== i && o.d > 0 && o.d < GRID * 4)
        .sort((p, q) => p.d - q.d)
        .slice(0, 2)
        .forEach(o => edges.push([i, o.j]));
    });
    packets = edges.length
      ? Array.from({ length: Math.min(28, edges.length) }, () => ({
          e: Math.floor(Math.random() * edges.length),
          p: Math.random(),
          s: 0.003 + Math.random() * 0.005,
        }))
      : [];

    // one code token per vertical slot so they spread evenly across the width
    const slots = Math.max(8, Math.round(w / 55));
    glyphs = Array.from({ length: slots }, (_, i) => newGlyph(true, i, slots));
  }

  function newGlyph(initial, slot, slots) {
    return {
      slot,
      slots,
      x: ((slot + Math.random()) / slots) * w,
      y: initial ? Math.random() * h : h + 20,
      v: Math.random() * 0.25 + 0.08,
      txt: TOKENS[Math.floor(Math.random() * TOKENS.length)],
      size: Math.random() * 5 + 10,
      o: Math.random() * 0.25 + 0.18
    };
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    // navy backdrop with a glow on the horizon
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0, '#050914');
    bg.addColorStop(0.55, '#0b1633');
    bg.addColorStop(1, '#060b1a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    const glow = ctx.createRadialGradient(w / 2, horizon, 0, w / 2, horizon, w * 0.55);
    glow.addColorStop(0, 'rgba(110,150,255,0.35)');
    glow.addColorStop(0.5, 'rgba(70,100,220,0.1)');
    glow.addColorStop(1, 'rgba(70,100,220,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, h);

    // sky: faint blueprint grid, then the network, fading toward the horizon
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, horizon);
    ctx.clip();

    for (const st of stars) {
      const a = 0.4 + 0.6 * Math.sin(t * 0.02 + st.tw);
      ctx.fillStyle = `rgba(255,255,255,${a * 0.85})`;
      ctx.fillRect(st.x, st.y, st.r, st.r);
    }

    ctx.strokeStyle = 'rgba(140,180,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += GRID) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, horizon); }
    for (let y = 0; y <= horizon; y += GRID) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(140,180,255,0.3)';
    ctx.beginPath();
    edges.forEach(([a, b]) => {
      const A = nodes[a], B = nodes[b];
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, A.y);              // orthogonal routing, circuit-board style
      ctx.lineTo(B.x, B.y);
    });
    ctx.stroke();

    nodes.forEach(n => {
      const g = 0.5 + 0.5 * Math.sin(t * 0.02 + n.phase);
      ctx.fillStyle = `rgba(160,200,255,${0.35 + g * 0.5})`;
      ctx.fillRect(n.x - 3, n.y - 3, 6, 6);
    });

    packets.forEach(k => {
      const [a, b] = edges[k.e];
      const A = nodes[a], B = nodes[b];
      const legX = Math.abs(B.x - A.x), legY = Math.abs(B.y - A.y);
      const d = k.p * (legX + legY);
      let x, y;
      if (d <= legX) { x = A.x + Math.sign(B.x - A.x) * d; y = A.y; }
      else { x = B.x; y = A.y + Math.sign(B.y - A.y) * (d - legX); }
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(120,170,255,0.9)';
      ctx.shadowBlur = 10;
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.shadowBlur = 0;
      if (!reduceMotion) {
        k.p += k.s;
        if (k.p >= 1) { k.p = 0; k.e = Math.floor(Math.random() * edges.length); }
      }
    });

    const fade = ctx.createLinearGradient(0, horizon * 0.55, 0, horizon);
    fade.addColorStop(0, 'rgba(11,22,51,0)');
    fade.addColorStop(1, 'rgba(11,22,51,0.95)');
    ctx.fillStyle = fade;
    ctx.fillRect(0, horizon * 0.55, w, horizon * 0.45 + 1);
    ctx.restore();

    // planet: a huge dark sphere whose surface carries the perspective grid
    const Rp = w * 1.5;
    const pcx = w / 2, pcy = horizon + Rp;
    ctx.save();
    ctx.beginPath();
    ctx.arc(pcx, pcy, Rp, 0, Math.PI * 2);
    ctx.clip();
    const surf = ctx.createLinearGradient(0, horizon, 0, h);
    surf.addColorStop(0, '#0e1a3d');
    surf.addColorStop(1, '#050914');
    ctx.fillStyle = surf;
    ctx.fillRect(0, horizon, w, h - horizon);

    const floorH = h - horizon;
    const vx = w / 2;
    ctx.lineWidth = 1;
    for (let i = -24; i <= 24; i++) {
      ctx.strokeStyle = `rgba(140,180,255,${0.26 * (1 - Math.abs(i) / 26)})`;
      ctx.beginPath();
      ctx.moveTo(vx + i * 2, horizon);
      ctx.lineTo(vx + i * (w / 14), h);
      ctx.stroke();
    }
    const offset = (t * 0.012) % 1;
    for (let i = 0; i < 12; i++) {
      const z = (i + offset) / 12;                 // 0 at the limb, 1 at the viewer
      const y = horizon + floorH * z * z;
      ctx.strokeStyle = `rgba(140,180,255,${0.08 + z * 0.3})`;
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(w, y + 0.5);
      ctx.stroke();
    }
    ctx.restore();

    // atmosphere on the limb
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'rgba(120,170,255,0.18)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(pcx, pcy, Rp + 2, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(190,220,255,0.85)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(pcx, pcy, Rp, Math.PI * 1.2, Math.PI * 1.8);
    ctx.stroke();
    ctx.restore();

    // orbit ring with two satellites carrying code labels
    const ocx = w / 2, ocy = horizon - h * 0.06;
    const orx = w * 0.4, ory = h * 0.1, otilt = -0.07;
    const orbit = (ang) => {
      const ex = Math.cos(ang) * orx, ey = Math.sin(ang) * ory;
      return [ocx + ex * Math.cos(otilt) - ey * Math.sin(otilt), ocy + ex * Math.sin(otilt) + ey * Math.cos(otilt), Math.sin(ang) > 0];
    };
    ctx.lineWidth = 1;
    for (const front of [false, true]) {
      ctx.strokeStyle = front ? 'rgba(170,205,255,0.55)' : 'rgba(170,205,255,0.18)';
      ctx.beginPath();
      let started = false;
      for (let a = 0; a <= Math.PI * 2 + 0.05; a += 0.05) {
        const [x, y, f] = orbit(a);
        if (f !== front) { started = false; continue; }
        if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    [['{ }', 0], ['</>', Math.PI]].forEach(([label, phase]) => {
      const [x, y] = orbit(t * 0.006 + phase);
      ctx.fillStyle = '#fff';
      ctx.shadowColor = 'rgba(120,170,255,0.95)';
      ctx.shadowBlur = 14;
      ctx.fillRect(x - 3, y - 3, 6, 6);
      ctx.shadowBlur = 0;
      ctx.font = '12px ui-monospace, SFMono-Regular, Menlo, monospace';
      ctx.fillStyle = 'rgba(200,225,255,0.9)';
      ctx.fillText(label, x + 9, y - 7);
    });

    // drifting code tokens
    for (let i = 0; i < glyphs.length; i++) {
      const g = glyphs[i];
      ctx.font = `${g.size}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      ctx.fillStyle = `rgba(150,200,255,${g.o})`;
      ctx.fillText(g.txt, g.x, g.y);
      if (!reduceMotion) { g.y -= g.v; if (g.y < -20) glyphs[i] = newGlyph(false, g.slot, g.slots); }
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
