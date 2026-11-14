// Seat geometry + viewing metrics.
// Coordinates: screen centre-bottom at z = 0, audience toward +z, x = right
// (from the viewer's point of view), y = up. Metres throughout.
import { TIERS } from './data.js';

const cache = new Map();
const rowLetter = (i) => (i < 26 ? String.fromCharCode(65 + i) : 'A' + String.fromCharCode(65 + i - 26));
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const deg = (r) => (r * 180) / Math.PI;

// Normalise a section into row specs ordered FRONT (nearest screen) to BACK.
//   rows: [{ n, tier, blocks:[6,18,6], price, label }]       – generated, front-to-back
//   grid: [{ tier, label, rows:['J  oooo..oooo', ...] }]     – copied from a BookMyShow
//         seat map, listed TOP-TO-BOTTOM as on screen (back → front).
//         'o' = seat, '.' = empty column, '-' alone = walkway,
//         'F:4  ...' = row F whose first seat is numbered 4.
function normaliseSection(sec, hall) {
  const out = [];
  if (sec.grid) {
    sec.grid.slice().reverse().forEach((g) => {
      g.rows.slice().reverse().forEach((line) => {
        const t = line.trim();
        if (t === '-' || t === '') { out.push({ walkway: true, pitch: g.walkway || 1.0 }); return; }
        const m = t.match(/^([^\s:]+)(?::(\d+))?\s+(.*)$/);
        out.push({
          tier: g.tier, label: m[1], start: m[2] ? +m[2] : 1, cells: m[3].replace(/\s/g, '.'),
          tierLabel: g.label, price: g.price, align: 'grid', colW: g.colW, prefix: g.prefix,
          pitch: g.pitch, rtl: g.rtl ?? sec.rtl ?? hall.rtl, numbering: g.numbering || hall.numbering,
        });
      });
    });
  } else {
    sec.rows.forEach((spec) => {
      for (let k = 0; k < spec.n; k++) {
        out.push({ tier: spec.tier, cells: spec.blocks.map((b) => 'o'.repeat(b)).join('..'), tierLabel: spec.label, price: spec.price, pitch: spec.pitch, align: 'self', start: 1 });
      }
    });
  }
  return out;
}

export function getLayout(theatre, screenIdx = 0) {
  const key = theatre.id + ':' + screenIdx;
  if (cache.has(key)) return cache.get(key);
  const hall = (theatre.screens || [theatre.hall])[screenIdx];
  const colW = hall.colW || 0.55;
  const specsBySec = hall.sections.map((s) => normaliseSection(s, hall));
  const gridCols = Math.max(0, ...specsBySec.flat().filter((r) => r.align === 'grid').map((r) => r.cells.length));
  const rows = [];
  const sections = [];
  const firstSpec = specsBySec[0].find((r) => !r.walkway);
  let zCursor = hall.firstRow - (firstSpec.pitch || TIERS[firstSpec.tier].pitch) / 2;
  const firstEdge = zCursor;
  let stallsEnd = 0;
  let stallsLastFloor = 0;

  hall.sections.forEach((sec, si) => {
    let baseY = 0;
    if (sec.balcony) {
      baseY = stallsLastFloor + sec.balcony.lift;
      zCursor = stallsEnd - sec.balcony.overhang;
    }
    const riser = sec.riser ?? hall.riser;
    const info = { name: sec.name, balcony: !!sec.balcony, startZ: zCursor, baseY, rows: [] };
    let idx = 0;
    let lastFloor = baseY;
    specsBySec[si].forEach((spec) => {
      if (spec.walkway) { zCursor += spec.pitch; return; }
      const tier = TIERS[spec.tier];
      const pitch = spec.pitch || tier.pitch;
      const z = zCursor + pitch / 2;
      zCursor += pitch;
      const floorY = baseY + idx * riser;
      lastFloor = floorY;
      // grid rows share the hall's column grid (BookMyShow style), centred on the screen;
      // generated rows centre themselves
      const cw = spec.align === 'grid' ? (spec.colW || colW) : tier.seatW;
      const ncols = spec.align === 'grid' ? gridCols : spec.cells.length;
      const x0 = -((ncols - 1) / 2) * cw;
      const row = {
        label: spec.label || '', prefix: spec.prefix || '', z, floorY, pitch, tier: spec.tier,
        tierLabel: spec.tierLabel || tier.label, price: spec.price, section: si, idx, seats: [], aisles: [], halfW: 0,
      };
      const cells = spec.cells;
      // runs of consecutive seats; a gap is an aisle if ≥2 columns wide, or a single
      // column between two runs of ≥2 seats (single gaps between recliners aren't)
      const runs = [];
      for (let c = 0; c < cells.length; c++) {
        if (cells[c] !== 'o') continue;
        const last = runs.at(-1);
        if (last && last.end === c - 1) last.end = c; else runs.push({ start: c, end: c });
      }
      const nums = [];
      runs.forEach((r) => { for (let c = r.start; c <= r.end; c++) nums.push(spec.numbering === 'col' ? c + 1 : nums.length + (spec.start || 1)); });
      if (spec.rtl) nums.reverse();
      let block = 0, k = 0;
      runs.forEach((r, ri) => {
        if (ri > 0) {
          const prev = runs[ri - 1];
          const gap = r.start - prev.end - 1;
          const aisle = gap >= 2 || (prev.end - prev.start >= 1 && r.end - r.start >= 1);
          if (aisle) { block++; row.aisles.push(x0 + ((prev.end + r.start) / 2) * cw); }
        }
        for (let c = r.start; c <= r.end; c++) {
          const x = x0 + c * cw;
          const single = r.start === r.end;
          const sw = spec.align === 'grid' ? (single && tier.seatW > cw ? Math.min(tier.seatW, cw * 1.8) : Math.min(tier.seatW, cw)) : cw;
          row.seats.push({ num: nums[k++], x, block, sw });
          row.halfW = Math.max(row.halfW, Math.abs(x) + cw / 2);
        }
      });
      rows.push(row);
      info.rows.push(row);
      idx++;
    });
    info.endZ = zCursor;
    if (!sec.balcony) {
      stallsEnd = zCursor;
      stallsLastFloor = lastFloor;
    }
    sections.push(info);
  });

  const T = rows.length;
  rows.forEach((r, i) => { if (!r.label) r.label = hall.labels === 'back' ? rowLetter(T - 1 - i) : rowLetter(i); });

  const seats = [];
  rows.forEach((r) => {
    r.seats = r.seats.map((s) => {
      const tier = TIERS[r.tier];
      const seat = {
        id: r.prefix ? `${r.prefix} ${r.label}${s.num}` : `${r.label}${s.num}`, row: r, rowLabel: r.label, num: s.num,
        x: s.x, z: r.z, floorY: r.floorY, eyeY: r.floorY + tier.eye, block: s.block, sw: s.sw,
        tier: r.tier, tierLabel: r.tierLabel, price: r.price,
      };
      seats.push(seat);
      return seat;
    });
  });

  const sc = hall.screen;
  const screen = { ...sc, top: sc.bottom + sc.h, midY: sc.bottom + sc.h / 2 };
  const balconySec = sections.find((s) => s.balcony);
  const backZ = Math.max(...sections.map((s) => s.endZ)) + 1.6;
  const maxHalf = Math.max(...rows.map((r) => r.halfW));
  const halfW = Math.max(maxHalf + 1.7, sc.w / 2 + 1.6);
  const topFloor = Math.max(...rows.map((r) => r.floorY));
  const height = Math.max(screen.top + 2.4, topFloor + 3.6);

  const L = {
    theatre, hall, screenIdx, rows, seats, sections, screen, firstEdge, stallsEnd,
    room: { halfW, backZ, height },
    balcony: balconySec ? {
      parapetZ: balconySec.startZ - 0.15,
      floorY: balconySec.baseY,
      undersideY: balconySec.baseY - 0.35,
      endZ: balconySec.endZ,
    } : null,
    maxHalf,
    byId: new Map(seats.map((s) => [s.id, s])),
  };

  // audio sweet spot ≈ 2/3 of the way back in the stalls, centred
  const stalls = sections[0];
  const sweetRow = stalls.rows[Math.round((stalls.rows.length - 1) * 0.62)];
  L.sweet = { x: 0, y: sweetRow.floorY + 1.15, z: sweetRow.z };
  L.depth = stallsEnd - hall.firstRow;

  seats.forEach((s) => (s.m = computeMetrics(s, L)));
  cache.set(key, L);
  return L;
}

function screenPoint(sc, x, y) {
  if (!sc.curve) return [x, y, 0];
  const a = x / sc.curve;
  return [sc.curve * Math.sin(a), y, sc.curve * (1 - Math.cos(a))];
}

function angleBetween(e, a, b) {
  const v1 = [a[0] - e[0], a[1] - e[1], a[2] - e[2]];
  const v2 = [b[0] - e[0], b[1] - e[1], b[2] - e[2]];
  const dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  return Math.acos(dot / (Math.hypot(...v1) * Math.hypot(...v2)));
}

function computeMetrics(seat, L) {
  const hall = L.hall;
  const sc = L.screen;
  const e = [seat.x, seat.eyeY, seat.z];
  const fov = deg(angleBetween(e, screenPoint(sc, -sc.w / 2, sc.midY), screenPoint(sc, sc.w / 2, sc.midY)));
  const vfov = deg(angleBetween(e, [0, sc.bottom, 0], [0, sc.top, 0]));
  const dist = Math.hypot(seat.x, seat.eyeY - sc.midY, seat.z);
  const skew = deg(Math.atan2(Math.abs(seat.x), seat.z));
  const elevTop = deg(Math.atan2(sc.top - seat.eyeY, seat.z));
  const elevCenter = deg(Math.atan2(sc.midY - seat.eyeY, seat.z));

  // Sightline clearance ("C-value"): how far the line from your eye to the bottom
  // of the screen passes above the eyes of the person in the row in front.
  let clearance = null;
  const yLine = (zAt) => seat.eyeY + (sc.bottom - seat.eyeY) * ((seat.z - zAt) / seat.z);
  const secRows = L.sections[seat.row.section].rows;
  if (seat.row.idx > 0) {
    const front = secRows[seat.row.idx - 1];
    clearance = yLine(front.z) - (front.floorY + TIERS[front.tier].eye);
  } else if (L.sections[seat.row.section].balcony) {
    clearance = yLine(L.balcony.parapetZ) - (L.balcony.floorY + 0.9) + 0.12;
  }

  // Under-balcony: does the balcony slab hide the top of the screen?
  let overhangCut = 0;
  if (L.balcony && seat.row.section === 0 && seat.z > L.balcony.parapetZ) {
    const uy = L.balcony.undersideY;
    const yHit = seat.eyeY + (uy - seat.eyeY) * (seat.z / (seat.z - L.balcony.parapetZ));
    if (yHit < sc.top) overhangCut = clamp01((sc.top - Math.max(yHit, sc.bottom)) / sc.h);
  }

  const audioD = Math.hypot(seat.x - L.sweet.x, seat.eyeY - L.sweet.y, seat.z - L.sweet.z);

  const target = hall.immersive ? 60 : 50;
  const sAngle = Math.exp(-(((fov - target) / 16) ** 2));
  const sSkew = clamp01(1 - Math.max(0, skew - 8) / 26);
  const sNeck = clamp01(1 - Math.max(0, elevTop - 30) / 18);
  const sClear = clearance == null ? 1 : clamp01((clearance * 1000 - 30) / 90);
  const sAudio = Math.exp(-((audioD / (L.depth * 0.6 + 4)) ** 2));
  const raw = 0.34 * sAngle + 0.2 * sSkew + 0.14 * sNeck + 0.14 * sClear + 0.18 * sAudio;
  const score = Math.round(Math.min(99, raw * 100 * clamp01(1 - overhangCut * 2.2)));

  const m = { fov, vfov, dist, skew, elevTop, elevCenter, clearance, overhangCut, audioD, target, score,
    parts: { angle: sAngle, skew: sSkew, neck: sNeck, clear: sClear, audio: sAudio } };
  m.label = labelFor(m);
  return m;
}

function labelFor(m) {
  if (m.overhangCut > 0.08) return 'UNDER BALCONY';
  if (m.elevTop > 38) return 'NECK STRAIN';
  if (m.fov > m.target + 22) return 'UP CLOSE';
  if (m.skew > 24) return 'SIDE ANGLE';
  if (m.score >= 86) return 'SWEET SPOT';
  if (m.fov < m.target - 14) return 'FULL PICTURE';
  if (m.fov > m.target + 10) return 'IMMERSIVE';
  return 'GREAT VIEW';
}

export function labelTone(label) {
  if (label === 'SWEET SPOT' || label === 'GREAT VIEW' || label === 'IMMERSIVE') return 'good';
  if (label === 'FULL PICTURE') return 'ok';
  return 'warn';
}

export function insightFor(seat) {
  const m = seat.m;
  const out = [];
  const pct = Math.round(m.overhangCut * 100);
  if (m.overhangCut > 0.02) out.push(`The balcony overhang hides roughly the top ${pct}% of the screen from here.`);
  if (m.elevTop > 38) out.push(`You'll look up ${Math.round(m.elevTop)}° to see the top edge — expect a stiff neck in a long film.`);
  else if (m.fov > m.target + 22) out.push(`The screen fills ${Math.round(m.fov)}° of your vision. You'll turn your head to follow action at the edges.`);
  else if (m.fov < m.target - 14) out.push(`You see the whole frame at once (${Math.round(m.fov)}°), but it feels less immersive.`);
  else if (Math.abs(m.fov - m.target) <= 7) out.push(`The screen fills ${Math.round(m.fov)}° of your view — right around the ${m.target}° ideal for this format.`);
  else if (m.fov > m.target) out.push(`The screen fills ${Math.round(m.fov)}° of your view — a bit more than the ${m.target}° ideal, so it feels big and immersive.`);
  else out.push(`The screen fills ${Math.round(m.fov)}° of your view — a little under the ${m.target}° ideal, easy to take in at a glance.`);
  if (m.skew > 20) out.push(`You're ${Math.round(m.skew)}° off-axis, so the picture looks slightly keystoned.`);
  if (m.clearance != null) {
    const c = Math.round(m.clearance * 1000);
    if (c < 60) out.push(`Low sightline clearance (${c} mm): a tall person in front will block the bottom of the screen (subtitles!).`);
    else if (c < 100) out.push(`Fair sightline clearance (${c} mm) — mostly clear, tall heads may intrude.`);
    else out.push(`Clean sightline over the row in front (${c} mm clearance).`);
  }
  if (seat.row.section === 0 && m.parts.audio > 0.85) out.push('You are near the mixing sweet spot — surround channels are balanced here.');
  return out;
}

// ---------- randomness ----------
function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Simulated "full house" crowd: who is sitting where, deterministic per hall.
const crowdCache = new Map();
export function crowd(L, fill = 0.72) {
  const key = L.theatre.id + ':' + L.screenIdx;
  if (crowdCache.has(key)) return crowdCache.get(key);
  const r = rng(hash(key));
  const taken = new Set();
  L.seats.forEach((s) => { if (r() < fill * (0.6 + s.m.score / 250)) taken.add(s.id); });
  crowdCache.set(key, taken);
  return taken;
}

// Top-scoring seats, spread out so suggestions aren't all neighbours.
export function topSeats(L, n = 5) {
  const sorted = L.seats.slice().sort((a, b) => b.m.score - a.m.score || Math.abs(a.x) - Math.abs(b.x));
  const out = [];
  for (const s of sorted) {
    if (out.some((o) => o.row === s.row && Math.abs(o.x - s.x) < 1.5)) continue;
    out.push(s);
    if (out.length >= n) break;
  }
  return out;
}

export function neighbour(L, seat, dir) {
  const rows = L.rows;
  const ri = rows.indexOf(seat.row);
  if (dir === 'left' || dir === 'right') {
    const row = seat.row.seats;
    const i = row.indexOf(seat) + (dir === 'left' ? -1 : 1);
    return row[i] || null;
  }
  const r2 = rows[ri + (dir === 'up' ? -1 : 1)];
  if (!r2) return null;
  let best = null;
  let bd = Infinity;
  r2.seats.forEach((s) => {
    const d = Math.abs(s.x - seat.x);
    if (d < bd) { bd = d; best = s; }
  });
  return best;
}

export const heatColor = (score) => {
  const k = clamp01((score - 45) / 50);
  return `hsl(${Math.round(k * 145)} 58% ${38 + k * 8}%)`;
};

// ───────── Seat Twin: the same VIEW in a different hall ─────────
// A seat's experience is described by what your eyes get, not by its row letter:
// how wide the screen looks (fov), how far you look up (elevTop), how far off to the side you sit
// (skew), whether heads in front block the picture (clearance) and whether a balcony cuts it off.
// Each difference is divided by "how much of a change you'd notice" so they can be added up.
const blocked = (m) => (m.clearance == null ? 0 : clamp01((0.10 - m.clearance) / 0.10));
export function viewDistance(a, b) {
  const t = [
    (a.fov - b.fov) / 5,              // 5° wider/narrower screen is a clear difference
    (a.elevTop - b.elevTop) / 5,      // 5° more look-up is noticeable on the neck
    (a.skew - b.skew) / 6,            // side angle: left and right count the same
    (blocked(a) - blocked(b)) / 0.5,  // sightline: clear vs blocked
    (a.overhangCut - b.overhangCut) / 0.1,
  ];
  return Math.hypot(...t);
}
export const matchPct = (d) => Math.round(100 * Math.exp((-d * d) / 6));

// For one seat, the closest-view seat in every OTHER hall, best match first.
export function findTwins(seat, L, layouts) {
  const out = [];
  for (const L2 of layouts) {
    if (L2 === L) continue;
    let best = null, bd = Infinity;
    for (const s of L2.seats) {
      const d = viewDistance(seat.m, s.m);
      if (d < bd - 1e-9 || (Math.abs(d - bd) < 1e-9 && s.m.score > best.m.score)) { bd = d; best = s; }
    }
    if (best) out.push({ L: L2, seat: best, d: bd, pct: matchPct(bd) });
  }
  return out.sort((a, b) => a.d - b.d);
}
