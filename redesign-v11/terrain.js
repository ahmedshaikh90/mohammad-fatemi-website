/* 3D network terrain background: a perspective wave landscape of connected points (plexus),
   with soft out-of-focus light particles. Theme-aware, mouse parallax on desktop,
   lighter settings on phones, respects reduced motion. */
(() => {
  'use strict';
  const root = document.documentElement;
  const canvas = document.createElement('canvas');
  canvas.id = 'terrain-bg';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.width = Math.round(window.innerWidth * Math.min(window.devicePixelRatio || 1, 2));
  canvas.height = Math.round(window.innerHeight * Math.min(window.devicePixelRatio || 1, 2));
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mobile = window.matchMedia('(max-width: 920px), (pointer: coarse)').matches;
  const FRAME_MS = mobile ? 42 : 33;
  const theme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  const LOOK = {
    dark: { sky: ['#010310', '#020A26', '#031538'], horizon: 'rgba(36, 100, 255, A)', line: [70, 140, 255], crest: [160, 205, 255],
            dot: [150, 200, 255], bokeh: [[80, 140, 255], [140, 190, 255], [60, 110, 230]], lineMax: 0.62, glow: true },
    light: { sky: ['#F6F9FF', '#EAF1FD', '#DCE7FB'], horizon: 'rgba(120, 165, 255, A)', line: [40, 92, 210], crest: [30, 70, 180],
             dot: [40, 92, 210], bokeh: [[90, 140, 240], [120, 170, 250], [70, 120, 230]], lineMax: 0.38, glow: false }
  };

  let seed = 9001;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

  // ---- terrain grid (world units) ----
  const STEP = mobile ? 1.0 : 0.72;
  const X0 = -22, X1 = 22, Z0 = 2.2, Z1 = 34;
  const cols = Math.floor((X1 - X0) / STEP) + 1, rows = Math.floor((Z1 - Z0) / STEP) + 1;
  const vx = new Float32Array(cols * rows), vz = new Float32Array(cols * rows), vj = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    vx[i] = X0 + c * STEP + (rand() - 0.5) * STEP * 0.7;
    vz[i] = Z0 + r * STEP + (rand() - 0.5) * STEP * 0.7;
    vj[i] = (rand() - 0.5) * 0.35;
  }
  const edges = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c;
    if (c < cols - 1) edges.push(i, i + 1);
    if (r < rows - 1) edges.push(i, i + cols);
    if (c < cols - 1 && r < rows - 1) edges.push(rand() < 0.5 ? i : i + 1, rand() < 0.5 ? i + cols + 1 : i + cols);
  }
  const N = cols * rows;
  const sx = new Float32Array(N), sy = new Float32Array(N), sa = new Float32Array(N), sh = new Float32Array(N);

  // ---- bokeh particles (screen space with depth) ----
  const bokeh = [];
  const BOKEH_N = mobile ? 26 : 46;
  for (let i = 0; i < BOKEH_N; i++) {
    const d = rand();
    bokeh.push({ x: rand(), y: rand() * 0.9, d, r: 1.5 + d * d * 16, a: 0.12 + (1 - Math.abs(d - 0.35)) * 0.35,
                 vy: 0.004 + d * 0.012, vx: (rand() - 0.5) * 0.004, ph: rand() * 6.28, c: Math.floor(rand() * 3) });
  }

  // soft round sprite for bokeh and glowing points
  const sprite = (() => {
    const s = document.createElement('canvas'); s.width = s.height = 64;
    const g = s.getContext('2d'); const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.35, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 64, 64); return s;
  })();
  const tinted = {};
  const tint = (rgb) => {
    const k = rgb.join(',');
    if (tinted[k]) return tinted[k];
    const s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d');
    g.drawImage(sprite, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgb(' + k + ')'; g.fillRect(0, 0, 64, 64);
    return (tinted[k] = s);
  };

  let W = 0, H = 0, DPR = 1, sky = null, mx = 0, my = 0, tmx = 0, tmy = 0;

  function layout() {
    DPR = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    W = window.innerWidth; H = Math.max(window.innerHeight, canvas.clientHeight > window.innerHeight * 0.6 ? canvas.clientHeight : 0);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    sky = buildSky();
  }

  function buildSky() {
    const L = LOOK[theme()];
    const off = document.createElement('canvas'); off.width = canvas.width; off.height = canvas.height;
    const c = off.getContext('2d'); c.setTransform(DPR, 0, 0, DPR, 0, 0);
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, L.sky[0]); g.addColorStop(0.55, L.sky[1]); g.addColorStop(1, L.sky[2]);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const hy = H * horizonRatio();
    const rg = c.createRadialGradient(W * 0.55, hy, 0, W * 0.55, hy, Math.max(W, H) * 0.7);
    rg.addColorStop(0, L.horizon.replace('A', theme() === 'dark' ? '0.34' : '0.22'));
    rg.addColorStop(1, L.horizon.replace('A', '0'));
    c.fillStyle = rg; c.fillRect(0, 0, W, H);
    return off;
  }
  const horizonRatio = () => (W <= 640 ? 0.6 : 0.6);

  function height(x, z, t) {
    return 0.95 * Math.sin(x * 0.32 + t * 0.55) * Math.cos(z * 0.26 - t * 0.35)
         + 0.55 * Math.sin(x * 0.75 + z * 0.42 + t * 0.8)
         + 0.35 * Math.cos(z * 0.9 - x * 0.2 + t * 0.6);
  }

  function draw(time) {
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    if (Math.abs(window.innerWidth - W) > 2 || Math.abs(dpr - DPR) > 0.01 || window.innerHeight > H + 2) layout();
    const L = LOOK[theme()];
    const t = reduce ? 0 : time / 7000; // slow, calm motion
    const flow = (window.scrollY || 0) * 0.006;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;

    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(sky, 0, 0, W, H);

    const F = W <= 640 ? W * 1.15 : Math.max(W * 0.62, H * 1.0);
    const cx = W / 2 - mx * 40, hy = H * horizonRatio() + my * 18;
    const camY = 3.1, camX = mx * 1.2;

    // project vertices
    for (let i = 0; i < N; i++) {
      const z = vz[i] - (flow % STEP);
      const y = height(vx[i], vz[i] + flow, t) + vj[i];
      const zz = Math.max(0.5, z);
      sx[i] = cx + (vx[i] - camX) / zz * F;
      sy[i] = hy + (camY - y) / zz * F;
      const fog = Math.max(0, 1 - (zz - Z0) / (Z1 - Z0)); // fade into the distance
      const near = Math.min(1, (zz - Z0 + 0.4) / 2.2);      // soften the closest rows
      sa[i] = Math.pow(fog, 1.25) * near;
      sh[i] = y;
    }

    // lines, batched by brightness for speed
    const BINS = 6;
    const paths = Array.from({ length: BINS }, () => []);
    for (let e = 0; e < edges.length; e += 2) {
      const a = edges[e], b = edges[e + 1];
      const al = (sa[a] + sa[b]) * 0.5;
      if (al < 0.03) continue;
      const ax = sx[a], ay = sy[a], bx = sx[b], by = sy[b];
      if ((ax < -50 && bx < -50) || (ax > W + 50 && bx > W + 50) || (ay > H + 50 && by > H + 50)) continue;
      const crest = Math.max(0, Math.min(1, ((sh[a] + sh[b]) * 0.5 + 0.6) / 2));
      const bin = Math.min(BINS - 1, Math.floor(al * (0.55 + crest * 0.6) * BINS));
      paths[bin].push(ax, ay, bx, by);
    }
    if (L.glow) ctx.globalCompositeOperation = 'lighter';
    ctx.lineWidth = W <= 640 ? 0.7 : 0.8;
    for (let k = 0; k < BINS; k++) {
      const p = paths[k]; if (!p.length) continue;
      const f = (k + 0.5) / BINS;
      const col = k >= BINS - 2 ? L.crest : L.line;
      ctx.strokeStyle = 'rgba(' + col[0] + ',' + col[1] + ',' + col[2] + ',' + (L.lineMax * f).toFixed(3) + ')';
      ctx.beginPath();
      for (let j = 0; j < p.length; j += 4) { ctx.moveTo(p[j], p[j + 1]); ctx.lineTo(p[j + 2], p[j + 3]); }
      ctx.stroke();
    }

    // points, brighter on the crests, a soft glow on the brightest
    const dotSprite = tint(L.dot);
    ctx.fillStyle = 'rgb(' + L.dot.join(',') + ')';
    for (let i = 0; i < N; i++) {
      const a = sa[i]; if (a < 0.06) continue;
      const x = sx[i], y = sy[i];
      if (x < -10 || x > W + 10 || y < -10 || y > H + 10) continue;
      const crest = Math.max(0, Math.min(1, (sh[i] + 0.4) / 1.8));
      const s = (1.1 + crest * 1.6) * (0.5 + a * 0.8);
      ctx.globalAlpha = Math.min(1, a * (0.45 + crest * 0.8));
      ctx.fillRect(x - s / 2, y - s / 2, s, s);
      if (L.glow && crest > 0.72 && a > 0.35) {
        const g = s * 7; ctx.globalAlpha = a * 0.35 * crest;
        ctx.drawImage(dotSprite, x - g / 2, y - g / 2, g, g);
      }
    }

    // bokeh: drifting out-of-focus lights
    for (const b of bokeh) {
      if (!reduce) { b.y -= b.vy * 0.0035; b.x += b.vx * 0.0035 + Math.sin(t * 0.3 + b.ph) * 0.00005; }
      if (b.y < -0.05) { b.y = 1.0; b.x = rand(); }
      if (b.x < -0.05) b.x = 1.05; if (b.x > 1.05) b.x = -0.05;
      const x = b.x * W - mx * 60 * b.d, y = b.y * H - my * 30 * b.d;
      const r = b.r * (W <= 640 ? 0.75 : 1) * 2.2;
      ctx.globalAlpha = b.a * (0.7 + 0.3 * Math.sin(t * 0.8 + b.ph)) * (theme() === 'dark' ? 1 : 0.6);
      ctx.drawImage(tint(L.bokeh[b.c]), x - r, y - r, r * 2, r * 2);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  if (!mobile && !reduce) {
    window.addEventListener('pointermove', (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2;
      tmy = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });
  }

  let raf = 0, last = 0;
  const loop = (tm) => { raf = requestAnimationFrame(loop); if (tm - last < FRAME_MS) return; last = tm; draw(tm); };
  layout(); draw(performance.now());
  window.addEventListener('load', () => { layout(); draw(performance.now()); }, { once: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => { layout(); draw(performance.now()); }).observe(canvas);
  if (!reduce) raf = requestAnimationFrame(loop);
  else window.addEventListener('scroll', () => draw(performance.now()), { passive: true });

  let rt = 0, lastW = W, lastH = H;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      if (Math.abs(window.innerWidth - lastW) > 20 || Math.abs(window.innerHeight - lastH) > 120) {
        lastW = window.innerWidth; lastH = window.innerHeight; layout(); draw(performance.now());
      }
    }, 150);
  });
  document.addEventListener('visibilitychange', () => {
    if (reduce) return;
    if (document.hidden) cancelAnimationFrame(raf); else raf = requestAnimationFrame(loop);
  });
  new MutationObserver(() => { sky = buildSky(); draw(performance.now()); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
})();
