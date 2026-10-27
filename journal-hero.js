// Field-journal specimen for the home banner: a line-drawn plant that draws itself in, sways, and
// pulses its annotation points. Built as SVG inside .journal. Safe to re-run after page swaps.
function initJournalHero() {
  const plant = document.getElementById('journal-plant');
  const marks = document.getElementById('journal-marks');
  if (!plant || !marks) return;
  plant.replaceChildren();
  marks.replaceChildren();

  const NS = 'http://www.w3.org/2000/svg';
  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  // Stem rises from (0,0) to y = -330 in plant coordinates
  el('path', { d: 'M0 0 C-6 -90 8 -190 0 -330', class: 'j-line j-draw', pathLength: 1 }, plant);

  const tips = {};
  for (let i = 0; i < 9; i++) {
    const y = -50 - i * 30, s = 1 - i * 0.065, delay = 0.5 + i * 0.16;
    [-1, 1].forEach((d, k) => {
      const tx = d * 78 * s, ty = y - 34 * s;
      const leaf = `M0 ${y} C${d * 22 * s} ${y - 30 * s} ${tx * 0.9} ${ty - 12 * s} ${tx} ${ty} C${tx * 0.82} ${y + 2 * s} ${d * 26 * s} ${y + 10 * s} 0 ${y}Z`;
      const g = el('g', { class: 'j-fade', style: `animation-delay:${delay + k * 0.08}s` }, plant);
      el('path', { d: leaf, class: 'j-leaf' }, g);
      el('path', { d: `M0 ${y} Q${d * 40 * s} ${y - 20 * s} ${tx * 0.96} ${ty + 2}`, class: 'j-vein' }, g);
      tips[`${d}_${i}`] = [tx, ty];
    });
  }

  // Terminal bud, soil line, roots
  el('path', { d: 'M0 -330 C-12 -358 -8 -378 0 -396 C9 -378 13 -358 0 -330Z', class: 'j-bud j-fade', style: 'animation-delay:2s' }, plant);
  el('path', { d: 'M-70 0 H70', class: 'j-line j-draw j-soil', pathLength: 1 }, plant);
  [[-20, 34, -46, 60], [4, 40, 0, 74], [24, 30, 52, 56]].forEach(([x1, y1, x2, y2], i) =>
    el('path', { d: `M0 0 Q${x1} ${y1} ${x2} ${y2}`, class: 'j-vein j-fade', style: `animation-delay:${1.2 + i * 0.15}s` }, plant));

  // Annotations sit on the right so they never cross the caption. Plant origin is (250,355), scale 0.8.
  const ox = 250, oy = 355, k = 0.8, labelX = 392;
  [
    { from: tips['1_7'], text: 'fig. 1  new growth', y: 112, at: 2.2 },
    { from: tips['1_5'], text: 'fig. 2  edge pattern', y: 178, at: 2.5 },
    { from: tips['1_2'], text: 'fig. 3  after rain', y: 244, at: 2.8 },
    { from: [30, 50], text: 'fig. 4  root system', y: 330, at: 3.1 },
  ].forEach(n => {
    const x1 = ox + n.from[0] * k, y1 = oy + n.from[1] * k;
    const g = el('g', { class: 'j-fade', style: `animation-delay:${n.at}s` }, marks);
    el('path', { d: `M${x1} ${y1} L${labelX - 10} ${n.y}`, class: 'j-lead' }, g);
    el('circle', { cx: x1, cy: y1, r: 3.6, class: 'j-dot' }, g);
    el('text', { x: labelX, y: n.y + 4, class: 'j-tag' }, g).textContent = n.text;
  });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initJournalHero);
else initJournalHero();
