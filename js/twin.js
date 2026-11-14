// Seat Twin: find a VIEW, not a seat number, in every hall.
//
// A view profile is the handful of numbers that describe what your eyes get from a seat:
//   fov       how wide the screen looks (degrees)
//   elevTop   how far you look up to the top edge (degrees)
//   skew      how far off-centre you sit (degrees, left and right count the same)
//   blocked   0 = clear sightline over the row in front, 1 = heads block the picture
//   overhang  0-1 share of the screen cut off by a balcony above you
// Any of them may be missing: a profile only has to say what it cares about.
//
// Callers make a profile from a seat (profileOf), from sliders, or from a preset, then ask for the
// best match per hall (matchView) or per theatre (bestInTheatre).
import { getLayout } from './layout.js';

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// "Just noticeable" step per field: a difference this big is clearly felt, so dividing by it puts
// every field on the same scale before they are added up.
const STEP = { fov: 5, elevTop: 5, skew: 6, blocked: 0.5, overhang: 0.1 };

export function profileOf(seat) {
  const m = seat.m;
  return {
    fov: m.fov,
    elevTop: m.elevTop,
    skew: m.skew,
    blocked: m.clearance == null ? 0 : clamp01((0.10 - m.clearance) / 0.10),
    overhang: m.overhangCut,
  };
}

function distance(profile, seatProfile) {
  let sum = 0;
  for (const k in STEP) if (profile[k] != null) sum += ((profile[k] - seatProfile[k]) / STEP[k]) ** 2;
  return Math.sqrt(sum);
}
export const matchPct = (d) => Math.round(100 * Math.exp((-d * d) / 6));

function bestSeat(profile, L) {
  let best = null, bd = Infinity;
  for (const s of L.seats) {
    const d = distance(profile, profileOf(s));
    if (d < bd - 1e-9 || (Math.abs(d - bd) < 1e-9 && s.m.raw > best.m.raw)) { bd = d; best = s; }
  }
  return best && { L, seat: best, d: bd, pct: matchPct(bd) };
}

// The best-matching seat in every hall (except `exclude`), best match first.
export function matchView(profile, layouts, { exclude } = {}) {
  return layouts.filter((L) => L !== exclude).map((L) => bestSeat(profile, L)).filter(Boolean).sort((a, b) => a.d - b.d);
}

// The best-matching seat across all screens of one theatre.
export function bestInTheatre(profile, theatre) {
  const screens = theatre.screens || [theatre.hall];
  return screens.map((_, i) => bestSeat(profile, getLayout(theatre, i))).sort((a, b) => a.d - b.d)[0];
}

// Each hall's own director's seat (two-thirds back, centred): the reference view, a 100% match by definition.
export function directorSeats(layouts) {
  return layouts.map((L) => ({ L, seat: L.director, d: 0, pct: 100 }));
}

// Slider presets. Sliders describe screen size and side position; a clear, uncut view is always wanted.
export const DNA_PRESETS = {
  close: { label: 'Big & close', fov: 72, skew: 0 },
  director: { label: "Director's seat" },
  relaxed: { label: 'Relaxed', fov: 42, skew: 0 },
};
export const dnaProfile = (fov, skew) => ({ fov, skew, blocked: 0, overhang: 0 });
