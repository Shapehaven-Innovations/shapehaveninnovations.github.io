// Generative "your project" hero: blueprint grid, network of nodes, packets travelling the edges.
// Renders to <canvas>. Safe to re-run after SPA page swaps.
let projectHeroCleanup = null;

function initProjectHero() {
  if (projectHeroCleanup) { projectHeroCleanup(); projectHeroCleanup = null; }

  const hero = document.querySelector('.project-hero');
  const canvas = hero && hero.querySelector('canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GRID = 48;

  let w = 0, h = 0, dpr = 1;
  let nodes = [], edges = [], packets = [];
  let rafId = 0, running = false, t = 0;

  function build() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = hero.clientWidth;
    h = hero.clientHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cols = Math.floor(w / GRID);
    const rows = Math.floor(h / GRID);
    nodes = [];
    for (let i = 0; i < Math.round(cols * rows / 5); i++) {
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
      ? Array.from({ length: Math.min(24, edges.length) }, () => ({
          e: Math.floor(Math.random() * edges.length),
          p: Math.random(),
          s: 0.003 + Math.random() * 0.005,
        }))
      : [];
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(140, 180, 255, 0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= w; x += GRID) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, h); }
    for (let y = 0; y <= h; y += GRID) { ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); }
    ctx.stroke();

    ctx.strokeStyle = 'rgba(140, 180, 255, 0.28)';
    ctx.beginPath();
    edges.forEach(([a, b]) => {
      const A = nodes[a], B = nodes[b];
      ctx.moveTo(A.x, A.y);
      ctx.lineTo(B.x, A.y); // orthogonal routing, circuit-board style
      ctx.lineTo(B.x, B.y);
    });
    ctx.stroke();

    nodes.forEach(n => {
      const glow = 0.5 + 0.5 * Math.sin(t * 0.02 + n.phase);
      ctx.fillStyle = `rgba(160, 200, 255, ${0.35 + glow * 0.5})`;
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
      ctx.shadowColor = 'rgba(120, 170, 255, 0.9)';
      ctx.shadowBlur = 10;
      ctx.fillRect(x - 2, y - 2, 4, 4);
      ctx.shadowBlur = 0;
      if (!reduceMotion) {
        k.p += k.s;
        if (k.p >= 1) { k.p = 0; k.e = Math.floor(Math.random() * edges.length); }
      }
    });

    t++;
  }

  function loop() {
    if (!running) return;
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    if (running || reduceMotion) return;
    running = true;
    rafId = requestAnimationFrame(loop);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  build();
  draw();

  const io = new IntersectionObserver(entries => {
    entries[0].isIntersecting ? start() : stop();
  });
  io.observe(hero);

  let resizeTimer = 0;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { build(); draw(); }, 150);
  };
  window.addEventListener('resize', onResize);

  projectHeroCleanup = () => {
    stop();
    io.disconnect();
    clearTimeout(resizeTimer);
    window.removeEventListener('resize', onResize);
  };
}
