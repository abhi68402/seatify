// Procedural "films" drawn on a canvas — used for the 3D screen and for posters.
import { rng } from './layout.js';

const R = rng(42);
const STARS = Array.from({ length: 260 }, () => [R(), R(), R() * 1.4 + 0.3, R()]);
const BUILDINGS = Array.from({ length: 40 }, () => [R() * 0.08 + 0.03, R() * 0.45 + 0.15, R()]);
const LANTERNS = Array.from({ length: 34 }, () => [R(), R(), R() * 0.5 + 0.5, R()]);
const KITES = Array.from({ length: 7 }, () => [R(), R() * 0.4 + 0.08, R(), R()]);

function sand(c, w, h, t) {
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#e6d6c1'); g.addColorStop(0.55, '#f1dcc0'); g.addColorStop(1, '#c49a6e');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const sx = w * 0.64, sy = h * 0.36;
  g = c.createRadialGradient(sx, sy, 0, sx, sy, h * 0.7);
  g.addColorStop(0, 'rgba(255,250,236,.95)'); g.addColorStop(1, 'rgba(255,250,236,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const layers = [
    [0.6, 0.035, 1.6, '#dcb892', 0.006], [0.68, 0.05, 1.2, '#cfa175', 0.012],
    [0.78, 0.07, 0.9, '#b8885c', 0.02], [0.9, 0.08, 0.7, '#916442', 0.032],
  ];
  layers.forEach(([y, a, f, col, s], li) => {
    c.beginPath(); c.moveTo(0, h);
    for (let x = 0; x <= w + 8; x += 8) {
      const u = x / w + t * s;
      const yy = h * (y + a * Math.sin(u * Math.PI * 2 * f) + a * 0.45 * Math.sin(u * Math.PI * 5.3 * f + 1.3));
      c.lineTo(x, yy);
      if (li === 1 && Math.abs(x - w * 0.5) < 4) walkerY = yy;
    }
    c.lineTo(w, h); c.closePath(); c.fillStyle = col; c.fill();
    if (li === 1) {
      const wx = w * 0.5, wy = walkerY;
      c.fillStyle = '#2a1d16';
      const s2 = h * 0.03, step = Math.sin(t * 3) * s2 * 0.15;
      c.fillRect(wx - s2 * 0.18, wy - s2 * 1.6, s2 * 0.36, s2 * 1.2);
      c.beginPath(); c.arc(wx, wy - s2 * 1.8, s2 * 0.2, 0, 7); c.fill();
      c.fillRect(wx - s2 * 0.15 + step, wy - s2 * 0.5, s2 * 0.12, s2 * 0.5);
      c.fillRect(wx + s2 * 0.03 - step, wy - s2 * 0.5, s2 * 0.12, s2 * 0.5);
    }
  });
}
let walkerY = 0;

function charminar(c, cx, base, s, col) {
  c.fillStyle = col;
  const bw = s * 1.0, bh = s * 0.62;
  c.fillRect(cx - bw / 2, base - bh, bw, bh);
  c.fillRect(cx - bw / 2 - s * 0.03, base - bh - s * 0.08, bw + s * 0.06, s * 0.08);
  [-1, 1].forEach((d) => {
    const mx = cx + d * (bw / 2 - s * 0.04);
    c.fillRect(mx - s * 0.06, base - s * 1.55, s * 0.12, s * 1.55);
    for (let k = 0; k < 3; k++) c.fillRect(mx - s * 0.09, base - s * (0.8 + k * 0.25), s * 0.18, s * 0.04);
    c.beginPath(); c.ellipse(mx, base - s * 1.55, s * 0.08, s * 0.1, 0, Math.PI, 0); c.fill();
    c.fillRect(mx - s * 0.01, base - s * 1.75, s * 0.02, s * 0.12);
  });
  c.beginPath(); c.ellipse(cx, base - bh - s * 0.08, s * 0.16, s * 0.14, 0, Math.PI, 0); c.fill();
  // arch cut-out
  c.save(); c.globalCompositeOperation = 'destination-out';
  c.beginPath(); const aw = s * 0.36;
  c.moveTo(cx - aw / 2, base); c.lineTo(cx - aw / 2, base - bh * 0.5);
  c.quadraticCurveTo(cx - aw / 2, base - bh * 0.85, cx, base - bh * 0.88);
  c.quadraticCurveTo(cx + aw / 2, base - bh * 0.85, cx + aw / 2, base - bh * 0.5);
  c.lineTo(cx + aw / 2, base); c.fill(); c.restore();
}

function deccan(c, w, h, t) {
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#2b1e4a'); g.addColorStop(0.45, '#b4466a'); g.addColorStop(0.75, '#f39a54'); g.addColorStop(1, '#f7c57a');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const sy = h * (0.72 - 0.03 * Math.sin(t * 0.05));
  g = c.createRadialGradient(w * 0.5, sy, 0, w * 0.5, sy, h * 0.5);
  g.addColorStop(0, 'rgba(255,230,170,1)'); g.addColorStop(0.15, 'rgba(255,210,140,.9)'); g.addColorStop(1, 'rgba(255,170,120,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // skyline
  c.fillStyle = '#2a1426';
  BUILDINGS.forEach(([bw, bh, p], i) => {
    const x = ((i / BUILDINGS.length + t * 0.004) % 1) * w * 1.1 - w * 0.05;
    c.fillRect(x, h * (1 - bh * 0.35), bw * w * 0.6, h * bh);
  });
  charminar(c, w * 0.5, h * 0.98, h * 0.42, '#1d0d1b');
  KITES.forEach(([x, y, p, q]) => {
    const kx = w * ((x + t * 0.01 * (q + 0.5)) % 1);
    const ky = h * (y + 0.03 * Math.sin(t * (0.8 + p) + q * 6));
    const s = h * 0.025;
    c.fillStyle = ['#ffd166', '#06d6a0', '#ef476f', '#118ab2'][Math.floor(p * 4)];
    c.beginPath(); c.moveTo(kx, ky - s); c.lineTo(kx + s * 0.7, ky); c.lineTo(kx, ky + s); c.lineTo(kx - s * 0.7, ky); c.fill();
    c.strokeStyle = 'rgba(40,20,30,.4)'; c.lineWidth = 1; c.beginPath(); c.moveTo(kx, ky + s); c.lineTo(kx - s, ky + s * 6); c.stroke();
  });
}

function neon(c, w, h, t) {
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#07051a'); g.addColorStop(1, '#2a0e3a');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const cols = ['#ff2e88', '#20e3ff', '#ffd23f', '#7cff6b', '#b05cff'];
  BUILDINGS.forEach(([bw, bh, p], i) => {
    const x = (((i / BUILDINGS.length) - t * 0.02 * (0.5 + p * 0.3)) % 1 + 1) % 1 * w * 1.2 - w * 0.1;
    const top = h * (1 - bh * 1.3);
    c.fillStyle = '#0d0a1e'; c.fillRect(x, top, bw * w, h - top);
    c.fillStyle = 'rgba(255,220,150,.35)';
    for (let yy = top + 8; yy < h - 6; yy += 14) for (let xx = x + 5; xx < x + bw * w - 6; xx += 10) if ((xx * 7 + yy * 3 + i) % 5 < 2) c.fillRect(xx, yy, 4, 6);
    if (p > 0.4) {
      const on = Math.sin(t * (4 + p * 6) + i) > -0.6;
      c.fillStyle = on ? cols[i % 5] : '#222';
      c.shadowColor = cols[i % 5]; c.shadowBlur = on ? 18 : 0;
      c.fillRect(x + 4, top + 14, bw * w - 8, 8);
      c.shadowBlur = 0;
    }
  });
  c.strokeStyle = 'rgba(180,200,255,.25)'; c.lineWidth = 1;
  for (let i = 0; i < 70; i++) {
    const x = (i * 97.3 + t * 40) % w, y = (i * 53.1 + t * 520) % h;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x - 3, y + 14); c.stroke();
  }
}

function orbit(c, w, h, t) {
  c.fillStyle = '#020309'; c.fillRect(0, 0, w, h);
  STARS.forEach(([x, y, s, p]) => {
    const xx = ((x - t * 0.004 * s) % 1 + 1) % 1 * w;
    c.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.7 + p * 9));
    c.fillStyle = '#fff'; c.fillRect(xx, y * h, s, s);
  });
  c.globalAlpha = 1;
  const px = w * 0.72, py = h * 1.05, pr = h * 0.75;
  let g = c.createRadialGradient(px - pr * 0.4, py - pr * 0.5, pr * 0.1, px, py, pr);
  g.addColorStop(0, '#7fd3ff'); g.addColorStop(0.5, '#2b6cb0'); g.addColorStop(1, '#06142c');
  c.fillStyle = g; c.beginPath(); c.arc(px, py, pr, 0, 7); c.fill();
  g = c.createRadialGradient(px, py, pr * 0.95, px, py, pr * 1.12);
  g.addColorStop(0, 'rgba(120,200,255,.5)'); g.addColorStop(1, 'rgba(120,200,255,0)');
  c.fillStyle = g; c.beginPath(); c.arc(px, py, pr * 1.12, 0, 7); c.fill();
  const k = (t * 0.06) % 1.4 - 0.2;
  const sx = w * k, sy = h * (0.35 - k * 0.1);
  c.fillStyle = '#e8eef7'; c.fillRect(sx, sy, w * 0.02, h * 0.008);
  g = c.createLinearGradient(sx - w * 0.06, 0, sx, 0);
  g.addColorStop(0, 'rgba(255,170,80,0)'); g.addColorStop(1, 'rgba(255,190,120,.9)');
  c.fillStyle = g; c.fillRect(sx - w * 0.06, sy + h * 0.002, w * 0.06, h * 0.004);
}

function jatara(c, w, h, t) {
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#12040a'); g.addColorStop(0.7, '#5a1208'); g.addColorStop(1, '#c2410c');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  const fl = 0.85 + 0.15 * Math.sin(t * 9) * Math.sin(t * 5.3);
  g = c.createRadialGradient(w * 0.5, h * 1.05, 0, w * 0.5, h * 1.05, h * 0.9 * fl);
  g.addColorStop(0, 'rgba(255,200,90,.95)'); g.addColorStop(0.4, 'rgba(255,110,30,.5)'); g.addColorStop(1, 'rgba(255,80,0,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  LANTERNS.forEach(([x, y, s, p]) => {
    const yy = h * (1.1 - ((y + t * 0.025 * s) % 1.2));
    const xx = w * x + Math.sin(t * 0.6 + p * 8) * w * 0.015;
    const r = h * 0.018 * s;
    g = c.createRadialGradient(xx, yy, 0, xx, yy, r * 4);
    g.addColorStop(0, 'rgba(255,200,120,.9)'); g.addColorStop(1, 'rgba(255,140,40,0)');
    c.fillStyle = g; c.fillRect(xx - r * 4, yy - r * 4, r * 8, r * 8);
    c.fillStyle = '#ffd59a'; c.fillRect(xx - r * 0.6, yy - r, r * 1.2, r * 1.6);
  });
  c.fillStyle = '#0a0204';
  for (let i = 0; i < 26; i++) {
    const x = (i / 25) * w, bob = Math.abs(Math.sin(t * 4 + i)) * h * 0.02;
    c.beginPath(); c.arc(x, h * 0.92 - bob, h * 0.035, 0, 7); c.fill();
    c.fillRect(x - h * 0.04, h * 0.94 - bob, h * 0.08, h * 0.1);
    if (i % 3 === 0) c.fillRect(x + h * 0.02, h * 0.82 - bob - Math.sin(t * 8 + i) * h * 0.03, h * 0.012, h * 0.1);
  }
}

// ── "The Gathering Storm": green-black fog rolling over a wet floor, god-rays from the top left,
// a cloaked wanderer walking out of the mist toward the camera, thunder pulsing in the clouds.
// Composed against the frame height so every screen shape (Flat, Scope, PCX/IMAX) is framed well.
// Fog is a few soft noise canvases painted once and scrolled, so a frame costs a handful of drawImage calls.
let FOG = null;
function fogLayers() {
  if (FOG) return FOG;
  const make = (seed, blobs, tint, rMin, rMax) => {
    const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256;
    const c = cv.getContext('2d'); const r = rng(seed);
    for (let i = 0; i < blobs; i++) {
      const x = r() * 512, y = 70 + r() * 116, rad = rMin + r() * (rMax - rMin), a = 0.035 + r() * 0.06;
      for (const dx of [-512, 0, 512]) { // drawn three times so the strip tiles horizontally
        const g = c.createRadialGradient(x + dx, y, 0, x + dx, y, rad);
        g.addColorStop(0, `rgba(${tint},${a})`); g.addColorStop(0.6, `rgba(${tint},${a * 0.45})`); g.addColorStop(1, `rgba(${tint},0)`);
        c.fillStyle = g; c.fillRect(x + dx - rad, y - rad, rad * 2, rad * 2);
      }
    }
    // fade the top and bottom of the strip so fog banks never show an edge
    c.globalCompositeOperation = 'destination-in';
    const m = c.createLinearGradient(0, 0, 0, 256);
    m.addColorStop(0, 'rgba(0,0,0,0)'); m.addColorStop(0.3, 'rgba(0,0,0,1)'); m.addColorStop(0.7, 'rgba(0,0,0,1)'); m.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = m; c.fillRect(0, 0, 512, 256);
    return cv;
  };
  FOG = [make(7, 90, '92,118,88', 50, 120), make(19, 80, '124,148,108', 45, 110), make(31, 110, '146,166,124', 35, 90)];
  return FOG;
}
// one fog strip scrolled sideways and drawn twice so it never ends
function fogStrip(c, img, w, y, hh, x0, alpha) {
  const sw = hh * 2; let x = -(((x0 % sw) + sw) % sw);
  c.globalAlpha = alpha;
  for (; x < w; x += sw) c.drawImage(img, x, y, sw, hh);
  c.globalAlpha = 1;
}
// the cloaked wanderer as a silhouette with its feet at (x, y), height s: a plain pointed hood,
// a cape open at the front over the walking legs, its hem billowing out to the right
function wanderer(c, x, y, s, t) {
  const step = Math.sin(t * 2.4), gust = Math.sin(t * 1.3) * 0.5 + Math.sin(t * 2.9) * 0.25;
  const sh = y - s * 0.8, hem = y - s * 0.04;
  c.beginPath();
  // hood
  c.moveTo(x - s * 0.06, sh + s * 0.02);
  c.quadraticCurveTo(x - s * 0.085, sh - s * 0.11, x - s * 0.01, sh - s * 0.2);
  c.quadraticCurveTo(x + s * 0.08, sh - s * 0.12, x + s * 0.065, sh + s * 0.02);
  // right shoulder, cape billowing out and back
  c.quadraticCurveTo(x + s * 0.15, sh + s * 0.03, x + s * 0.17, sh + s * 0.12);
  c.bezierCurveTo(x + s * (0.2 + gust * 0.04), y - s * 0.45, x + s * (0.32 + gust * 0.08), y - s * 0.2, x + s * (0.4 + gust * 0.1), hem - s * 0.02);
  for (let k = 0; k <= 6; k++) { const u = k / 6; c.lineTo(x + s * (0.4 + gust * 0.1) * (1 - u) + s * 0.08 * u, hem + s * 0.025 * Math.sin(u * 7 + t * 4)); }
  // the front opening: the cape parts over the legs
  c.lineTo(x + s * 0.05, y - s * 0.3);
  c.lineTo(x + s * 0.035 - step * s * 0.03, y);              // right leg
  c.lineTo(x - s * 0.005 - step * s * 0.03, y);
  c.lineTo(x - s * 0.0, y - s * 0.22);
  c.lineTo(x - s * 0.04 + step * s * 0.03, y);              // left leg
  c.lineTo(x - s * 0.08 + step * s * 0.03, y);
  c.lineTo(x - s * 0.07, y - s * 0.3);
  // left side of the cape, hanging closer to the body
  for (let k = 0; k <= 5; k++) { const u = k / 5; c.lineTo(x - s * 0.08 - s * 0.14 * u, hem + s * 0.02 * Math.sin(u * 6 - t * 3)); }
  c.bezierCurveTo(x - s * 0.21, y - s * 0.3, x - s * 0.17, y - s * 0.6, x - s * 0.15, sh + s * 0.1);
  c.quadraticCurveTo(x - s * 0.13, sh + s * 0.02, x - s * 0.06, sh + s * 0.02);
  c.closePath();
}
function storm(c, w, h, t) {
  const F = fogLayers();
  // thunder: a double flicker every ~9 s, brightening the clouds and the hall
  const ph = t % 9.3, flash = ph < 0.55 ? Math.max(0, Math.exp(-ph * 9) * 0.9 + (ph > 0.18 ? Math.exp(-(ph - 0.18) * 11) * 0.6 : 0)) : 0;
  // sky
  let g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#0d1510'); g.addColorStop(0.55, '#16231a'); g.addColorStop(0.78, '#1c2b20'); g.addColorStop(1, '#070a08');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // light source behind the clouds, top left
  const lx = w * 0.06, ly = -h * 0.08;
  g = c.createRadialGradient(lx, ly, 0, lx, ly, h * 1.1);
  g.addColorStop(0, 'rgba(232,236,190,.85)'); g.addColorStop(0.25, 'rgba(170,190,130,.35)'); g.addColorStop(1, 'rgba(60,80,55,0)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
  // god-rays fanning down to the right
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 7; i++) {
    const a = 0.2 + i * 0.13 + Math.sin(t * 0.25 + i) * 0.02, spread = 0.035 + (i % 3) * 0.012;
    const len = Math.hypot(w, h) * 1.1, al = (0.05 + 0.03 * Math.sin(t * 0.6 + i * 1.7)) * (1 + flash);
    g = c.createLinearGradient(lx, ly, lx + Math.cos(a) * len, ly + Math.sin(a) * len);
    g.addColorStop(0, `rgba(220,230,180,${al})`); g.addColorStop(1, 'rgba(220,230,180,0)');
    c.fillStyle = g; c.beginPath(); c.moveTo(lx, ly);
    c.lineTo(lx + Math.cos(a - spread) * len, ly + Math.sin(a - spread) * len);
    c.lineTo(lx + Math.cos(a + spread) * len, ly + Math.sin(a + spread) * len);
    c.closePath(); c.fill();
  }
  c.restore();
  // far cloud banks
  fogStrip(c, F[0], w, -h * 0.1, h * 0.75, t * h * 0.012, 0.9 + flash * 0.4);
  fogStrip(c, F[1], w, h * 0.15, h * 0.6, -t * h * 0.02, 0.6 + flash * 0.4);
  // the wanderer: walks out of the fog over a 22 s loop, growing as it nears, then the mist swallows it
  const L = 22, u = (t % L) / L, horizon = h * 0.74;
  const s = h * (0.18 + 0.55 * u * u), fx = w * 0.5 + Math.sin(u * 5) * h * 0.02, fy = horizon + (h * 0.94 - horizon) * u;
  const vis = Math.min(1, u * 5) * Math.min(1, (1 - u) * 8);
  c.save(); c.globalAlpha = vis;
  // rim light on the side facing the glow: the shape in pale light, nudged up-left, under the dark figure
  wanderer(c, fx - s * 0.008, fy - s * 0.006, s, t); c.fillStyle = `rgba(190,210,150,${0.28 + flash * 0.5})`; c.fill();
  wanderer(c, fx, fy, s, t); c.fillStyle = '#040605'; c.fill();
  c.restore();
  // wet floor: dark mirror with the glow and the figure reflected, and slow ripple streaks
  const fl = h * 0.8;
  g = c.createLinearGradient(0, fl, 0, h);
  g.addColorStop(0, 'rgba(10,16,12,.55)'); g.addColorStop(1, 'rgba(3,5,4,.92)');
  c.fillStyle = g; c.fillRect(0, fl, w, h - fl);
  if (fy > fl) {
    c.save(); c.globalAlpha = vis * 0.35; c.translate(0, fy * 2); c.scale(1, -1);
    c.beginPath(); c.rect(0, fy, w, h); c.clip(); wanderer(c, fx, fy, s, t); c.fillStyle = '#020302'; c.fill(); c.restore();
  }
  c.save(); c.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 14; k++) {
    const yy = fl + (h - fl) * (k / 14), xx = ((k * 137.5 + t * h * 0.03 * (1 + (k % 3))) % (w + h)) - h * 0.5;
    c.fillStyle = `rgba(160,190,140,${0.035 + flash * 0.05})`;
    c.fillRect(xx, yy, h * (0.25 + (k % 4) * 0.1), Math.max(1, h * 0.003));
  }
  c.restore();
  // ground mist rolling through the figure's legs, and a near fog bank
  fogStrip(c, F[2], w, h * 0.62, h * 0.38, t * h * 0.045, 0.95);
  fogStrip(c, F[0], w, h * 0.74, h * 0.34, -t * h * 0.06, 0.8);
  // thunder flash over everything
  if (flash > 0.01) { c.fillStyle = `rgba(190,215,170,${flash * 0.28})`; c.fillRect(0, 0, w, h); }
  // vignette
  g = c.createRadialGradient(w / 2, h * 0.55, h * 0.3, w / 2, h * 0.55, Math.max(w, h) * 0.75);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)');
  c.fillStyle = g; c.fillRect(0, 0, w, h);
}

const SCENES = { storm, sand, deccan, neon, orbit, jatara };
export function drawMovie(ctx, w, h, t, id) {
  (SCENES[id] || storm)(ctx, w, h, t);
}
