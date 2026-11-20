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
//         'B:3/26  ...' = each block (run of seats) has its own first number, in numbering
//         order (with rtl the rightmost block comes first); a block without one continues.
function normaliseSection(sec, hall) {
  const out = [];
  if (sec.grid) {
    sec.grid.slice().reverse().forEach((g) => {
      g.rows.slice().reverse().forEach((line) => {
        const t = line.trim();
        if (t === '-' || t === '') { out.push({ walkway: true, pitch: g.walkway || 1.0 }); return; }
        const m = t.match(/^([^\s:]+)(?::([\d/]+))?\s+(.*)$/);
        const st = m[2] ? m[2].split('/').map((v) => (v === '' ? null : +v)) : [1]; // '' = continue from the previous block
        out.push({
          tier: g.tier, label: m[1], start: st[0], starts: st.length > 1 ? st : null, cells: m[3].replace(/\s/g, '.'),
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
  let prevEnd = 0, prevLastFloor = 0;

  hall.sections.forEach((sec, si) => {
    let baseY = 0;
    // A balcony hangs over the back of the stalls (lift above the last stalls row, overhang = how far
    // it reaches over them). `stack: true` puts a further tier straight behind the previous section,
    // `lift` higher than its last row after a cross-aisle of `gap` metres (the upper balcony).
    const stacked = !!(sec.balcony && sec.balcony.stack);
    if (sec.balcony && stacked) {
      baseY = prevLastFloor + sec.balcony.lift;
      zCursor = prevEnd + (sec.balcony.gap ?? 1);
    } else if (sec.balcony) {
      baseY = stallsLastFloor + sec.balcony.lift;
      zCursor = stallsEnd - sec.balcony.overhang;
    }
    const riser = sec.riser ?? hall.riser;
    const info = { name: sec.name, balcony: !!sec.balcony, stacked, startZ: zCursor, baseY, rows: [] };
    if (sec.balcony) Object.assign(info, { parapetZ: zCursor - 0.15, floorY: baseY, undersideY: baseY - 0.35 });
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
      let nums = [];
      if (spec.starts) { // a first number per block, in numbering order
        const byCol = new Map(); let next = spec.starts[0];
        (spec.rtl ? runs.slice().reverse() : runs).forEach((r, i) => {
          if (spec.starts[i] != null) next = spec.starts[i];
          const cols = []; for (let c = r.start; c <= r.end; c++) cols.push(c);
          (spec.rtl ? cols.reverse() : cols).forEach((c) => byCol.set(c, next++));
        });
        runs.forEach((r) => { for (let c = r.start; c <= r.end; c++) nums.push(byCol.get(c)); });
      } else {
        runs.forEach((r) => { for (let c = r.start; c <= r.end; c++) nums.push(spec.numbering === 'col' ? c + 1 : nums.length + (spec.start || 1)); });
        if (spec.rtl) nums.reverse();
      }
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
    info.lastFloor = lastFloor;
    prevEnd = zCursor; prevLastFloor = lastFloor;
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
  const balconies = sections.filter((s) => s.balcony);
  const balconySec = balconies.find((s) => !s.stacked);
  const backZ = Math.max(...sections.map((s) => s.endZ)) + 1.6;
  // the depth the director's seat is measured against: the stalls and the first balcony, not a further
  // stacked tier (the upper balcony), which sits behind and above the reference position
  const backZ0 = Math.max(...sections.filter((s) => !s.stacked).map((s) => s.endZ)) + 1.6;
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
    balconies, maxHalf,
    byId: new Map(seats.map((s) => [s.id, s])),
  };

  // The director's seat: on the centre line, about two-thirds of the way from the screen to the back
  // wall. It is the reference position where a film's picture and sound are mixed and checked, so it
  // is where the film looks and sounds as intended. Kept in the stalls, clear of any balcony overhang.
  const stalls = sections[0];
  const usable = stalls.rows.filter((r) => !L.balcony || r.z <= L.balcony.parapetZ);
  const pool = usable.length ? usable : stalls.rows;
  // Where exactly? Worked out from the screen itself (shown step by step on the theatre page):
  //  1. Ideal distance from the screen's width W: the screen should fill the format's target angle θ
  //     (50°, or 60° for immersive formats such as IMAX, 70mm and PCX). Basic trigonometry gives
  //     D = W / (2·tan(θ/2)). (SMPTE's 30° and THX's 36-40° are back-row minimums; the reference
  //     seat sits further in.)
  //  2. Blend it half and half with the two-thirds rule (where picture and sound are calibrated),
  //     and keep the result inside the director's band, 60-72% of the room depth.
  //  3. Neck limit: inside that band, never so close that looking up at the top edge passes 30°.
  const theta = hall.immersive ? 60 : 50;
  const dAngle = sc.w / (2 * Math.tan((theta * Math.PI) / 360));
  const twoThirds = backZ0 * 2 / 3;
  const bandLo = backZ0 * 0.6, bandHi = backZ0 * 0.72;
  const neckOk = (r) => deg(Math.atan2(screen.top - (r.floorY + TIERS[r.tier].eye), r.z)) <= 30;
  const neckZ = (pool.find(neckOk) || pool.at(-1)).z;
  const blended = (Math.min(Math.max(dAngle, bandLo), bandHi) + twoThirds) / 2;
  const geoZ = Math.max(blended, Math.min(neckZ, bandHi));
  const refZ = Math.min(Math.max(geoZ, pool[0].z), pool.at(-1).z);
  const refRow = pool.reduce((a, r) => (Math.abs(r.z - refZ) < Math.abs(a.z - refZ) ? r : a));
  L.refCalc = { w: sc.w, theta, dAngle, twoThirds, blended, bandLo, bandHi, neckZ, z: refZ, backZ: backZ0, curved: !!sc.curve };
  L.ref = { x: 0, y: refRow.floorY + TIERS[refRow.tier].eye, z: refZ };
  L.sweet = L.ref; // sound is calibrated at the same spot
  L.depth = stallsEnd - hall.firstRow;

  seats.forEach((s) => (s.m = computeMetrics(s, L)));

  // Director's seat = the best seat in the director zone (centre, within about a row of the
  // two-thirds mark). The position score pulls every hall's best seat into this zone.
  // zone: within ±6% of the room depth of the two-thirds mark, and as central as that row allows
  // (some halls have a centre aisle, so 'central' is relative to the row's most central seat)
  const rowMinX = (r) => Math.min(...r.seats.map((x) => Math.abs(x.x)));
  const zone = pool.filter((r) => Math.abs(r.z - refZ) <= backZ0 * 0.06)
    .flatMap((r) => r.seats.filter((s) => Math.abs(s.x) <= rowMinX(r) + 0.6 && s.m.overhangCut === 0));
  const pick = (list) => list.reduce((a, s) => (!a || s.m.raw > a.m.raw || (s.m.raw === a.m.raw && Math.abs(s.x) < Math.abs(a.x)) ? s : a), null);
  L.director = pick(zone) || pick(pool.flatMap((r) => r.seats));
  L.director.m.label = 'DIRECTOR\'S SEAT';
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
  } else if (L.sections[seat.row.section].stacked) {
    // first row of a stacked tier: looks over the heads in the last row of the tier below
    const front = L.sections[seat.row.section - 1].rows.at(-1);
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

  // Screen size: SMPTE asks for at least 30° of view, THX about 36° from the back row and ~40° as
  // ideal. Full marks inside a comfort band from 36° up to the format's target + 12° (50°/60° immersive),
  // falling off outside it, steeply below SMPTE's 30°.
  const target = hall.immersive ? 60 : 50;
  const lo = 36, hi = target + 12;
  const sAngle = fov < lo ? Math.exp(-(((lo - fov) / (fov < 30 ? 5 : 8)) ** 2)) : fov > hi ? Math.exp(-(((fov - hi) / 12) ** 2)) : 1;
  const sSkew = clamp01(1 - Math.max(0, skew - 8) / 26);
  const sNeck = clamp01(1 - Math.max(0, elevTop - 30) / 18);
  const sClear = clearance == null ? 1 : clamp01((clearance * 1000 - 30) / 90);
  // Director's position: how close you are to the two-thirds-back, centre-line reference seat.
  const dz = (seat.z - L.ref.z) / L.room.backZ, dx = seat.x / L.room.halfW, dy = (seat.eyeY - L.ref.y) / L.room.height;
  const sPos = Math.exp(-((dz / 0.15) ** 2) - ((dx / 0.35) ** 2) - ((dy / 0.3) ** 2)); // a balcony sits above the reference
  const raw = (0.32 * sPos + 0.22 * sAngle + 0.14 * sSkew + 0.14 * sNeck + 0.18 * sClear) * clamp01(1 - overhangCut * 2.2);
  const score = Math.round(Math.min(99, raw * 100));

  const m = { fov, vfov, dist, skew, elevTop, elevCenter, clearance, overhangCut, audioD, target, score, raw,
    parts: { angle: sAngle, skew: sSkew, neck: sNeck, clear: sClear, position: sPos } };
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
  if (label === "DIRECTOR'S SEAT" || label === 'SWEET SPOT' || label === 'GREAT VIEW' || label === 'IMMERSIVE') return 'good';
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
  if (m.label === "DIRECTOR'S SEAT") out.unshift("This is the director's seat: centred, about two-thirds back, where films are mixed and checked. Picture and sound are exactly as intended here.");
  else if (m.parts.position > 0.8) out.push("You're close to the director's seat (two-thirds back, centred): picture and sound are close to how the film was mixed.");
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
  const sorted = L.seats.slice().sort((a, b) => b.m.raw - a.m.raw || Math.abs(a.x) - Math.abs(b.x));
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
