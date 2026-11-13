// High-resolution procedural materials for the hall. Everything is painted on canvases at
// 1024–2048 px (half that on low-power devices) with matching normal maps, so fabric,
// carpet and wood catch the light instead of looking like a blurry printed picture.
// No downloads, no licences, works offline.
import * as THREE from 'three';

let ANISO = 8;
let Q = 1; // 1 = high tier (2K), 0.5 = low tier (1K)
export function configureAssets({ anisotropy = 8, low = false } = {}) { ANISO = anisotropy; Q = low ? 0.5 : 1; }
const S = (n) => Math.max(128, Math.round(n * Q));

// deterministic random so every hall looks the same on every load
function rand(seed) { let a = seed >>> 0; return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Tileable value noise (wraps at the edges so textures repeat seamlessly).
function noiseRaw(w, h, cells, seed, octaves = 3) {
  const out = new Float32Array(w * h);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const cx = cells * (1 << o), cy = Math.max(1, Math.round((cells * (1 << o) * h) / w));
    const R = rand(seed + o * 101);
    const lat = new Float32Array(cx * cy).map(() => R());
    for (let y = 0; y < h; y++) {
      const fy = (y / h) * cy, y0 = Math.floor(fy), ty = fy - y0, y1 = (y0 + 1) % cy, sy = ty * ty * (3 - 2 * ty);
      for (let x = 0; x < w; x++) {
        const fx = (x / w) * cx, x0 = Math.floor(fx), tx = fx - x0, x1 = (x0 + 1) % cx, sx = tx * tx * (3 - 2 * tx);
        const a = lat[y0 * cx + x0], b = lat[y0 * cx + x1], c = lat[y1 * cx + x0], d = lat[y1 * cx + x1];
        out[y * w + x] += amp * ((a + (b - a) * sx) * (1 - sy) + (c + (d - c) * sx) * sy);
      }
    }
    total += amp; amp *= 0.5;
  }
  for (let i = 0; i < out.length; i++) out[i] /= total;
  return out;
}

// Same noise, evaluated at half resolution and upsampled with wrap-around bilinear filtering.
function noiseField(w, h, cells, seed, octaves = 3) {
  const hw = Math.max(16, w >> 1), hh = Math.max(16, h >> 1);
  const src = noiseRaw(hw, hh, cells, seed, octaves);
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    const fy = (y * hh) / h, y0 = Math.floor(fy), ty = fy - y0, y1 = (y0 + 1) % hh;
    for (let x = 0; x < w; x++) {
      const fx = (x * hw) / w, x0 = Math.floor(fx), tx = fx - x0, x1 = (x0 + 1) % hw;
      const a = src[y0 * hw + x0], b = src[y0 * hw + x1], c = src[y1 * hw + x0], d = src[y1 * hw + x1];
      out[y * w + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
    }
  }
  return out;
}

const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function toTex(c, srgb = true) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = ANISO;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.magFilter = THREE.LinearFilter;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Normal map from a height field (central differences, wrapping).
function normalFromHeight(hf, w, h, strength = 2) {
  const c = canvas(w, h), ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const l = hf[y * w + ((x - 1 + w) % w)], r = hf[y * w + ((x + 1) % w)];
      const u = hf[((y - 1 + h) % h) * w + x], dn = hf[((y + 1) % h) * w + x];
      let nx = (l - r) * strength, ny = (u - dn) * strength, nz = 1;
      const len = Math.hypot(nx, ny, nz); nx /= len; ny /= len; nz /= len;
      const i = (y * w + x) * 4;
      d[i] = (nx * 0.5 + 0.5) * 255; d[i + 1] = (ny * 0.5 + 0.5) * 255; d[i + 2] = (nz * 0.5 + 0.5) * 255; d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return toTex(c, false);
}

// Paint pixels from a per-pixel colour function.
function paint(w, h, fn) {
  const c = canvas(w, h), ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const [r, g, b] = fn(x, y, y * w + x), i = (y * w + x) * 4;
    d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}
const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ───────────── materials ─────────────

// Maroon stage curtain: soft fold shading + fine vertical weave; the geometry adds the big pleats.
function curtain() {
  const w = S(1024), h = S(1024);
  const n = noiseField(w, h, 8, 11, 3), fine = noiseField(w, h, 64, 12, 1);
  const hf = new Float32Array(w * h);
  const c = paint(w, h, (x, y, i) => {
    const fold = 0.5 + 0.5 * Math.sin((x / w) * Math.PI * 2 * 4 + n[i] * 2.5);
    const weave = 0.5 + 0.5 * Math.sin((x / w) * Math.PI * 2 * 220);
    hf[i] = fold * 0.7 + weave * 0.08 + fine[i] * 0.2;
    let col = mixc([58, 6, 16], [168, 30, 44], Math.pow(fold, 1.3) * 0.85 + fine[i] * 0.15);
    col = mixc(col, [12, 2, 4], Math.max(0, (y / h - 0.86) * 2.2)); // darker hem
    return col;
  });
  return { map: toTex(c), normal: normalFromHeight(hf, w, h, 3), rx: 1.6 };
}

// Maroon wall velvet with a faint damask motif.
function velvet() {
  const w = S(1024), h = S(1024);
  const n = noiseField(w, h, 16, 21, 4);
  const c = paint(w, h, (x, y, i) => mixc([66, 12, 22], [112, 26, 38], n[i]));
  const ctx = c.getContext('2d');
  ctx.strokeStyle = 'rgba(236,180,110,.10)'; ctx.lineWidth = w / 340;
  const cell = w / 4;
  for (let gx = 0; gx <= 4; gx++) for (let gy = 0; gy <= 4; gy++) {
    const cx = gx * cell + ((gy % 2) * cell) / 2, cy = gy * cell;
    ctx.beginPath(); ctx.ellipse(cx, cy, cell * 0.28, cell * 0.42, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, cy - cell * 0.3); ctx.bezierCurveTo(cx + cell * 0.2, cy - cell * 0.1, cx + cell * 0.2, cy + cell * 0.1, cx, cy + cell * 0.3);
    ctx.bezierCurveTo(cx - cell * 0.2, cy + cell * 0.1, cx - cell * 0.2, cy - cell * 0.1, cx, cy - cell * 0.3); ctx.stroke();
  }
  return { map: toTex(c), normal: normalFromHeight(n, w, h, 2.2), rx: 1.8 };
}

// Red cinema carpet with a gold lattice, rosettes and a pile texture.
function carpet() {
  const w = S(1024), h = S(1024);
  const pile = noiseField(w, h, 96, 31, 2);
  const c = paint(w, h, (x, y, i) => mixc([70, 10, 22], [104, 18, 32], pile[i]));
  const ctx = c.getContext('2d');
  const gold = (a) => `rgba(222,176,82,${a})`;
  ctx.lineCap = 'round';
  const lat = (inset, lw, a) => {
    ctx.strokeStyle = gold(a); ctx.lineWidth = lw;
    ctx.beginPath(); ctx.moveTo(w / 2, inset); ctx.lineTo(w - inset, h / 2); ctx.lineTo(w / 2, h - inset); ctx.lineTo(inset, h / 2); ctx.closePath(); ctx.stroke();
  };
  lat(w * 0.02, w * 0.012, 0.9); lat(w * 0.07, w * 0.005, 0.55);
  const rosette = (cx, cy, r) => {
    ctx.fillStyle = gold(0.9);
    for (let k = 0; k < 8; k++) { const a = (k * Math.PI) / 4; ctx.beginPath(); ctx.ellipse(cx + Math.cos(a) * r * 0.55, cy + Math.sin(a) * r * 0.55, r * 0.42, r * 0.18, a, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#5a0f1c'; ctx.beginPath(); ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = gold(1); ctx.beginPath(); ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2); ctx.fill();
  };
  rosette(w / 2, h / 2, w * 0.07);
  [[0, 0], [w, 0], [0, h], [w, h]].forEach(([x, y]) => rosette(x, y, w * 0.06));
  ctx.fillStyle = gold(0.7);
  for (let k = 1; k < 8; k++) { [[w / 2 + (w / 2) * (k / 8), (h / 2) * (k / 8)], [w / 2 - (w / 2) * (k / 8), (h / 2) * (k / 8)]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x, y + h / 4 - h / 4, w * 0.004, 0, 7); ctx.fill(); }); }
  return { map: toTex(c), normal: normalFromHeight(pile, w, h, 1.6), rx: 1.4 };
}

// Teak wood grain (tall texture for pilasters and trim).
function wood() {
  const w = S(512), h = S(2048);
  const n = noiseField(w, h, 6, 41, 3), streak = noiseField(w, h, 48, 42, 1);
  const hf = new Float32Array(w * h);
  const c = paint(w, h, (x, y, i) => {
    const g = 0.5 + 0.5 * Math.sin((x / w) * Math.PI * 2 * 9 + n[i] * 9);
    hf[i] = g * 0.6 + streak[i] * 0.4;
    return mixc([60, 32, 14], [118, 68, 32], g * 0.7 + streak[i] * 0.3);
  });
  return { map: toTex(c), normal: normalFromHeight(hf, w, h, 1.2), rx: 1 };
}

// Cream lime-washed plaster for older single-screen halls.
function plaster() {
  const w = S(1024), h = S(1024);
  const n = noiseField(w, h, 10, 51, 5);
  const c = paint(w, h, (x, y, i) => mixc([196, 178, 140], [228, 214, 182], n[i]));
  return { map: toTex(c), normal: normalFromHeight(n, w, h, 1.4), rx: 2.6 };
}

// Seat upholstery: near-white velvet nap so each seat's instance colour shows through.
function upholstery() {
  const w = S(512), h = S(512);
  const n = noiseField(w, h, 48, 61, 2);
  const hf = new Float32Array(w * h);
  const c = paint(w, h, (x, y, i) => {
    const rib = 0.5 + 0.5 * Math.sin((y / h) * Math.PI * 2 * 18);
    hf[i] = rib * 0.6 + n[i] * 0.4;
    const v = 200 + n[i] * 40 + rib * 15;
    return [v, v, v];
  });
  return { map: toTex(c), normal: normalFromHeight(hf, w, h, 2.4), rx: 1 };
}

// Illuminated EXIT sign (English + Hindi), drawn crisp at 1024×384.
function exitSign() {
  const w = 1024, h = 384, c = canvas(w, h), x = c.getContext('2d');
  x.fillStyle = '#0b8f45'; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#d9ffe8'; x.lineWidth = 14; x.strokeRect(14, 14, w - 28, h - 28);
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '800 176px Inter, Arial, sans-serif'; x.fillText('EXIT', w * 0.4, h * 0.4);
  x.font = '700 92px "Noto Sans Devanagari", "Kohinoor Devanagari", sans-serif'; x.fillText('निकास', w * 0.4, h * 0.78);
  x.beginPath(); x.arc(w * 0.84, h * 0.24, 26, 0, 7); x.fill();
  x.lineWidth = 22; x.lineCap = 'round'; x.strokeStyle = '#fff';
  x.beginPath(); x.moveTo(w * 0.84, h * 0.36); x.lineTo(w * 0.8, h * 0.58); x.lineTo(w * 0.74, h * 0.84);
  x.moveTo(w * 0.8, h * 0.58); x.lineTo(w * 0.88, h * 0.84);
  x.moveTo(w * 0.78, h * 0.44); x.lineTo(w * 0.92, h * 0.5); x.stroke();
  const t = toTex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

// "YOU" tag above the viewer's own head (2× resolution).
function youTag() {
  const w = 512, h = 192, c = canvas(w, h), x = c.getContext('2d');
  x.fillStyle = '#e3b04b';
  x.beginPath(); x.roundRect(8, 8, w - 16, h - 56, 64); x.fill();
  x.beginPath(); x.moveTo(w / 2 - 30, h - 48); x.lineTo(w / 2 + 30, h - 48); x.lineTo(w / 2, h - 10); x.fill();
  x.fillStyle = '#1a1205'; x.font = '800 92px Inter, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('YOU', w / 2, (h - 56) / 2 + 10);
  const t = toTex(c); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t;
}

const BUILDERS = { curtain, velvet, carpet, wood, plaster, upholstery, exit: exitSign, you: youTag };
const cache = {};
// Synchronous: builds whatever hasn't been prepared yet.
export function getAssets() {
  for (const k in BUILDERS) if (!cache[k]) cache[k] = BUILDERS[k]();
  return cache;
}
// Background warm-up: one texture per idle slot so the page never stalls.
export async function prepareAssets() {
  const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 400 }) : setTimeout(r, 16)));
  for (const k in BUILDERS) { if (!cache[k]) { await idle(); if (!cache[k]) cache[k] = BUILDERS[k](); } }
  return cache;
}

// Tile a texture set at world scale: `metresX × metresY` of surface.
const rep = (t, rx, ry) => { const c = t.clone(); c.repeat.set(Math.max(0.01, rx), Math.max(0.01, ry)); c.userData = { tiled: true }; c.needsUpdate = true; return c; };
export function surface(set, metresX, metresY, extra = {}) {
  const rx = metresX / set.rx, ry = metresY / set.rx;
  return new THREE.MeshStandardMaterial({ map: rep(set.map, rx, ry), normalMap: rep(set.normal, rx, ry), roughness: 0.92, ...extra });
}
// Velvet with a soft sheen (physical material on high tier, standard on low).
export function fabric(set, metresX, metresY, { low = false, ...extra } = {}) {
  const rx = metresX / set.rx, ry = metresY / set.rx;
  const base = { map: rep(set.map, rx, ry), normalMap: rep(set.normal, rx, ry), roughness: 0.88, ...extra };
  return low ? new THREE.MeshStandardMaterial(base) : new THREE.MeshPhysicalMaterial({ ...base, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xff9a8a) });
}
