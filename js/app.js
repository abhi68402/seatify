import { THEATRES, MOVIES, TIERS, theatreById } from './data.js';
import { getLayout, crowd, topSeats, neighbour, heatColor, labelTone, insightFor } from './layout.js';
import { profileOf, matchView, bestInTheatre, directorSeats, DNA_PRESETS, dnaProfile } from './twin.js';
import { infoOf, INFO_AS_OF } from './info.js';

// ───────────────────────── helpers ─────────────────────────
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'), screenEl = $('#screen'), stageEl = $('#stage'), glEl = $('#gl'), modalEl = $('#modal');
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const I = {
  back: svg('<path d="M15 18l-6-6 6-6"/>'),
  info: svg('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
  pin: svg('<path d="M12 21s-7-6.2-7-11a7 7 0 0114 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  bookmark: svg('<path d="M6 4h12v17l-6-4-6 4z"/>'),
  moon: svg('<path d="M20 14.5A8 8 0 019.5 4a8 8 0 1010.5 10.5z"/>'),
  sun: svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  people: svg('<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2c2.8.3 5 2.6 5 5.8"/>'),
  bulb: svg('<path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0012 3z"/>'),
  film: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 5v14M17 5v14M3 9h4M3 15h4M17 9h4M17 15h4"/>'),
  spark: svg('<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>'),
  heat: svg('<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="currentColor"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>'),
  chev: svg('<path d="M6 9l6 6 6-6"/>'),
  chevR: svg('<path d="M9 6l6 6-6 6"/>', 'class="go"'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  plus: svg('<path d="M12 5v14M5 12h14"/>'),
  minus: svg('<path d="M5 12h14"/>'),
  close: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
  seat: svg('<path d="M6 11V6a2 2 0 012-2h8a2 2 0 012 2v5"/><path d="M4 11h16v5H4zM6 16v4M18 16v4"/>'),
  twin: svg('<path d="M3 11V7a1.5 1.5 0 011.5-1.5h5A1.5 1.5 0 0111 7v4"/><path d="M2 11h10v3.5H2zM3.5 14.5V18M10.5 14.5V18"/><path d="M13 11V7a1.5 1.5 0 011.5-1.5h5A1.5 1.5 0 0121 7v4"/><path d="M12 11h10v3.5H12zM13.5 14.5V18M20.5 14.5V18"/>'),
  star: svg('<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z" fill="currentColor" stroke="none"/>'),
  ext: svg('<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h5"/>'),
  heart: svg('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>'),
  dna: svg('<path d="M4 6h16M4 12h16M4 18h16"/><circle cx="9" cy="6" r="2.2" fill="currentColor"/><circle cx="15" cy="12" r="2.2" fill="currentColor"/><circle cx="7" cy="18" r="2.2" fill="currentColor"/>'),
  motion: svg('<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/><path d="M3.5 8.5a6 6 0 000 7M20.5 8.5a6 6 0 010 7"/>'),
  eye: svg('<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  arrow: (deg) => svg('<path d="M6 15l6-6 6 6"/>', `style="transform:rotate(${deg}deg)"`),
};
const screensOf = (t) => t.screens || [t.hall];
const allLayouts = () => THEATRES.flatMap((t) => screensOf(t).map((_, i) => getLayout(t, i)));
// Motion Look needs a motion sensor and a touch screen (phones and tablets)
const motionCapable = () => 'DeviceOrientationEvent' in window && window.matchMedia('(pointer: coarse)').matches;
// The wordmark: the y leans forward. Screen readers hear one word, "Vyu".
const WORDMARK = '<span class="sr">Vyu</span><span class="wm" aria-hidden="true">V<span class="wm-y">y</span>u</span>';
const hallName = (h) => h.name.split(' · ')[0];

// ───────────────────────── storage ─────────────────────────
const store = {
  get() { try { return JSON.parse(localStorage.getItem('vyu.saved') || localStorage.getItem('seatify.saved') || localStorage.getItem('darshan.saved') || '[]'); } catch { return []; } },
  set(v) { try { localStorage.setItem('vyu.saved', JSON.stringify(v)); localStorage.removeItem('seatify.saved'); localStorage.removeItem('darshan.saved'); } catch {} },
};
let SAVED = store.get();

// My Seat: the one seat a person calls theirs. Seat Twin then finds its view in every hall.
// Stored as {tid, si, id}; dropped if that seat no longer exists in the data.
let MYSEAT = (() => {
  try {
    const v = JSON.parse(localStorage.getItem('vyu.myseat') || localStorage.getItem('seatify.myseat') || 'null');
    const t = v && theatreById(v.tid);
    return t && (t.screens || [t.hall])[v.si] && getLayout(t, v.si).byId.has(v.id) ? v : null;
  } catch { return null; }
})();
function mySeat() {
  if (!MYSEAT) return null;
  const t = theatreById(MYSEAT.tid), Lm = getLayout(t, MYSEAT.si);
  return { t, L: Lm, seat: Lm.byId.get(MYSEAT.id) };
}
function setMySeat(v) {
  MYSEAT = v;
  try { v ? localStorage.setItem('vyu.myseat', JSON.stringify(v)) : localStorage.removeItem('vyu.myseat'); localStorage.removeItem('seatify.myseat'); } catch {}
}
const isMySeat = (tid, si, id) => !!MYSEAT && MYSEAT.tid === tid && MYSEAT.si === si && MYSEAT.id === id;
// The seat in hall Lx that matches My Seat's view (or My Seat itself in its own hall).
function myTwinIn(Lx) {
  const my = mySeat();
  if (!my) return null;
  if (my.L === Lx) return { seat: my.seat, pct: 100, own: true };
  const r = matchView(profileOf(my.seat), [Lx])[0];
  return r && { seat: r.seat, pct: r.pct, own: false };
}

// ───────────────────────── theme ─────────────────────────
// index.html sets <html data-theme> before first paint (saved choice, else the system setting).
// Choosing a theme here saves it; until then the page follows system changes live.
const isDark = () => document.documentElement.dataset.theme === 'dark';
function setTheme(t, save = true) {
  const root = document.documentElement;
  root.classList.add('theme-anim');
  root.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'dark' ? '#100e0c' : '#f7f6f3');
  if (save) try { localStorage.setItem('vyu.theme', t); localStorage.removeItem('seatify.theme'); } catch {}
  setTimeout(() => root.classList.remove('theme-anim'), 350);
  const live = document.getElementById('announce');
  if (live && save) live.textContent = t === 'dark' ? 'Dark mode on' : 'Light mode on';
}
try {
  const mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', (e) => {
    let saved = null; try { saved = localStorage.getItem('vyu.theme') || localStorage.getItem('seatify.theme'); } catch {}
    if (!saved) { setTheme(e.matches ? 'dark' : 'light', false); if (S.route === 'home') render(); }
  });
} catch {}
const isSaved = (tid, si, id) => SAVED.some((s) => s.tid === tid && s.si === si && s.id === id);

// ───────────────────────── state & layout ─────────────────────────
const S = {
  route: 'home', tid: null, si: 0, focus: null, heat: true, // seat maps open coloured by view quality
  filter: 'all', q: '',
  zoom: null, top: -1, aerial: false, crowd: true, lights: true, open: false, content: 0,
  full: false, scenePrimed: false, sceneKey: '', motion: false, homeView: 'list',
};
const T = () => theatreById(S.tid);
const L = () => getLayout(T(), S.si);
const hallOf = () => screensOf(T())[S.si];
const coarse = window.matchMedia('(pointer: coarse)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// phone <640 · tablet 640–1023 · split ≥1024 (seat map + live 3D side by side)
const layoutOf = () => (innerWidth >= 1024 ? 'split' : innerWidth >= 640 ? 'tablet' : 'phone');
const sheetOf = (l) => (l === 'split' ? 'float' : innerWidth / innerHeight > 1.1 && innerWidth >= 560 ? 'side' : 'bottom');
const isSplit = () => app.dataset.layout === 'split';
const exploring = () => S.route === 'seats' || S.route === 'view';
function syncLayout() {
  const l = layoutOf();
  app.dataset.layout = l;
  app.dataset.sheet = sheetOf(l);
  app.dataset.route = S.route;
  app.classList.toggle('full', S.full && exploring());
  return l;
}

const TITLES = { home: 'Vyu · View your seat before you sit', theatre: '', seats: '', view: '', saved: 'Saved seats · Vyu' };
function go(route, patch = {}, { history: nav = 'push' } = {}) {
  Object.assign(S, patch);
  if (layoutOf() === 'split' && route === 'view') route = 'seats';
  const was = S.route;
  S.route = route;
  S.full = false;
  if (!exploring()) stop3D();
  render();
  if (!(route === 'seats' && was === 'seats')) screenEl.scrollTop = 0;
  if (route !== was) focusPage();
  if (nav === 'push') pushUrl();
}

// ───────────────────────── browser history ─────────────────────────
// Every page has its own address (#/t/prasads/0/seat/I24), so the browser's back and forward
// buttons move between pages and a link opens the same page. Hash URLs work on any static host.
// Picking another seat on the same page replaces the address instead of adding history steps.
function urlOf() {
  const r = S.route, t = S.tid && T() ? encodeURIComponent(S.tid) : null;
  if (r === 'saved') return '#/saved';
  if (!t || r === 'home') return '#/';
  if (r === 'theatre') return `#/t/${t}`;
  if (S.focus && (r === 'view' || isSplit())) return `#/t/${t}/${S.si}/seat/${encodeURIComponent(S.focus)}`;
  return `#/t/${t}/${S.si}/seats`;
}
// Address → {route, patch}, or null when it names nothing that exists (then the home page shows).
function parseUrl(hash) {
  const p = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (!p.length) return { route: 'home', patch: {} };
  if (p[0] === 'saved') return { route: 'saved', patch: {} };
  if (p[0] !== 't') return null;
  const t = theatreById(p[1]);
  if (!t) return null;
  if (p.length === 2) return { route: 'theatre', patch: { tid: p[1] } };
  const si = +p[2];
  if (!Number.isInteger(si) || !screensOf(t)[si]) return { route: 'theatre', patch: { tid: p[1] } };
  const base = { tid: p[1], si, zoom: null, open: false };
  if (p[3] === 'seat' && p[4] && getLayout(t, si).byId.has(p[4])) return { route: layoutOf() === 'split' ? 'seats' : 'view', patch: { ...base, focus: p[4] } };
  return { route: 'seats', patch: { ...base, focus: null, top: -1 } };
}
let navIdx = 0;          // position of the current entry in this tab's history (kept in history.state)
const navUrls = [];      // the addresses at each position, so an in-app "back" can reuse the browser's
let quietPop = false;    // the next popstate was started by us: the page is already rendered
function pushUrl() {
  const u = urlOf();
  if (u === location.hash || (u === '#/' && !location.hash)) return;
  if (navIdx > 0 && navUrls[navIdx - 1] === u) { quietPop = true; history.back(); return; } // a "back" button: go back, don't stack
  navIdx++; navUrls.length = navIdx; navUrls.push(u);
  history.pushState({ vyu: navIdx }, '', u);
}
function replaceUrl() {
  const u = urlOf();
  if (u === location.hash || (u === '#/' && !location.hash)) return;
  navUrls[navIdx] = u;
  history.replaceState({ vyu: navIdx }, '', u);
}
window.addEventListener('popstate', (e) => {
  navIdx = e.state?.vyu ?? 0;
  navUrls[navIdx] = location.hash || '#/';
  if (quietPop) { quietPop = false; return; }
  closeModal();
  const r = parseUrl(location.hash);
  if (!r) { go('home', {}, { history: 'none' }); replaceUrl(); return; }
  const changedHall = r.patch.tid !== S.tid || (r.patch.si != null && r.patch.si !== S.si);
  if (r.patch.tid && changedHall && !('focus' in r.patch)) Object.assign(r.patch, { focus: null, zoom: null, si: r.patch.si ?? 0 });
  if (S.route === r.route && exploring() && !changedHall && 'focus' in r.patch && r.patch.focus !== S.focus && r.patch.focus) { chooseSeat(r.patch.focus); return; }
  go(r.route, r.patch, { history: 'none' });
});

// After a route change, move keyboard and screen-reader focus to the new page's heading.
function focusPage() {
  const h = $('h1', screenEl) || $('h1', stageEl) || $('#main');
  if (!h) return;
  if (!h.hasAttribute('tabindex')) h.tabIndex = -1;
  h.focus({ preventScroll: true });
}

function render() {
  syncLayout();
  const r = S.route;
  // the 3D overlay is the page's main content on its own route, a labelled region beside the map in split view
  if (r === 'view') { stageEl.setAttribute('role', 'main'); stageEl.removeAttribute('aria-label'); }
  else if (r === 'seats' && isSplit()) { stageEl.setAttribute('role', 'region'); stageEl.setAttribute('aria-label', '3D seat view'); }
  else { stageEl.removeAttribute('role'); stageEl.removeAttribute('aria-label'); }
  document.title = TITLES[r] || `${T()?.name ?? 'Vyu'} · Vyu`;
  if (r === 'home') renderHome();
  else if (r === 'theatre') renderTheatre();
  else if (r === 'saved') renderSaved();
  else if (r === 'seats') {
    renderSeats();
    if (isSplit()) { renderStage(); startScene(); } else {
      stageEl.innerHTML = ''; app.style.setProperty('--sheet-h', '0px');
      view3d?.setActive(false); glEl.classList.remove('on'); S.scenePrimed = false; S.sceneKey = '';
      warmHall();
    }
  } else if (r === 'view') { screenEl.innerHTML = ''; renderStage(); startScene(); }
}

let toastT;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => el.classList.remove('on'), 2600);
}

// ───────────────────────── small components ─────────────────────────
// Audience rating with its source (js/info.js). Compact count: 130,468 -> 130K.
const nfmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });
function ratingChip(t, { long = false } = {}) {
  const r = infoOf(t.id)?.rating;
  if (!r) return '';
  const cnt = r.count ? ` · ${long ? r.count.toLocaleString('en-IN') : nfmt.format(r.count)} review${r.count === 1 ? '' : 's'}` : '';
  const label = `Rated ${r.value} out of 5 on ${r.src}${r.count ? `, ${r.count.toLocaleString('en-IN')} reviews` : ''}`;
  return long
    ? `<a class="rating long" href="${r.url}" target="_blank" rel="noopener" aria-label="${esc(label)} (opens source)">${I.star}<b>${r.value.toFixed(1)}</b><span>${esc(r.src)}${cnt}</span>${I.ext}</a>`
    : `<span class="rating" role="img" aria-label="${esc(label)}">${I.star}<b>${r.value.toFixed(1)}</b><span>${esc(r.src)}${cnt}</span></span>`;
}

function ring(score, size = 48) {
  const r = (size - 6) / 2, c = 2 * Math.PI * r;
  return `<span class="ring" style="--s:${size}px" role="img" aria-label="View score ${score} out of 100">
    <svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" class="trk"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="${heatColor(score)}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - score / 100)}" class="val"/></svg>
    <b aria-hidden="true">${score}</b></span>`;
}
const verified = (t) => (t.source === 'bms'
  ? `<span class="badge ok">${I.check}${t.partial ? 'Mostly matched' : 'Matched'} to BookMyShow</span>`
  : '<span class="badge warn">Approximate layout</span>');
const iconBtn = (a, icon, label, extra = '') => `<button class="icon-btn" data-a="${a}" aria-label="${label}" title="${label}" ${extra}>${icon}</button>`;

// ───────────────────────── HOME ─────────────────────────
const FILTERS = [['all', 'All'], ['big', 'Large format'], ['rec', 'Recliners'], ['single', 'Single screen'], ['atmos', 'Dolby Atmos'], ['balc', 'Balcony']];
function matchFilter(t) {
  const hs = screensOf(t);
  const q = S.q.trim().toLowerCase();
  if (q && !(t.name + ' ' + t.area).toLowerCase().includes(q)) return false;
  switch (S.filter) {
    case 'big': return hs.some((h) => ['IMAX', 'PCX', 'PXL', 'LARGE', '70MM'].includes(h.format) || h.screen.w >= 16);
    case 'rec': return hs.some((_, i) => getLayout(t, i).seats.some((s) => s.tier === 'recliner' || s.tier === 'semi' || s.tier === 'lounger'));
    case 'single': return t.single;
    case 'atmos': return hs.some((h) => h.atmos);
    case 'balc': return hs.some((h) => h.sections.some((s) => s.balcony));
    default: return true;
  }
}
const filtered = () => THEATRES.filter(matchFilter).sort((a, b) => (b.source === 'bms') - (a.source === 'bms'));

function cityMap(list) {
  const W = 360, H = 250;
  const b = { lat0: 17.315, lat1: 17.50, lng0: 78.32, lng1: 78.58 };
  const px = (lng) => ((lng - b.lng0) / (b.lng1 - b.lng0)) * W;
  const py = (lat) => H - ((lat - b.lat0) / (b.lat1 - b.lat0)) * H;
  const musi = [[17.383, 78.36], [17.378, 78.40], [17.372, 78.44], [17.375, 78.47], [17.371, 78.50], [17.366, 78.545]].map(([a, o]) => `${px(o).toFixed(1)},${py(a).toFixed(1)}`).join(' ');
  const areas = [['HITEC City', 17.447, 78.376], ['Banjara Hills', 17.414, 78.432], ['Secunderabad', 17.442, 78.50], ['Kukatpally', 17.494, 78.405], ['Old City', 17.380, 78.476]];
  const pins = list.map((t) => `<g class="pin" tabindex="0" role="button" aria-label="${esc(t.name)}, ${esc(t.area)}" data-a="theatre" data-id="${t.id}" transform="translate(${px(t.lng).toFixed(1)},${py(t.lat).toFixed(1)})">
      <circle r="14" class="halo ${t.source === 'bms' ? 'v' : ''}"/><circle class="dot ${t.source === 'bms' ? 'v' : ''}" r="5.5"/><title>${esc(t.name)}</title></g>`).join('');
  return `<svg viewBox="0 0 ${W} ${H}" role="group" aria-label="Map of theatres in Hyderabad">
    <defs><pattern id="g" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M18 0H0V18" fill="none" style="stroke:var(--map-grid)" stroke-width="1"/></pattern></defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <ellipse cx="${px(78.4735)}" cy="${py(17.4239)}" rx="15" ry="11" style="fill:var(--water)"/>
    <text x="${px(78.4735) + 18}" y="${py(17.4239) + 16}" class="lbl-water" text-anchor="start" aria-hidden="true">Hussain Sagar</text>
    <polyline points="${musi}" fill="none" style="stroke:var(--water)" stroke-width="3" stroke-linecap="round"/>
    <g aria-hidden="true">${areas.map(([n, a, o]) => `<text x="${px(o)}" y="${py(a)}" class="lbl-area" text-anchor="middle">${n}</text>`).join('')}</g>
    ${pins}</svg>`;
}

function theatreCards() {
  const list = filtered();
  if (!list.length) return '<li class="empty"><b>No theatres match.</b><span>Try another filter or clear the search.</span></li>';
  return list.map((t) => {
    const hs = screensOf(t);
    const best = topSeats(getLayout(t, 0), 1)[0];
    const seats = hs.reduce((a, _, i) => a + getLayout(t, i).seats.length, 0);
    return `<li class="tcard">
      <div class="tc-head"><span class="ring-lbl">${ring(best.m.score, 52)}<small>best seat</small></span><div class="tc-title"><h3><button class="stretch" data-a="theatre" data-id="${t.id}">${esc(t.name)}</button></h3><p>${esc(t.area)} · ${hs.length > 1 ? hs.length + ' screens' : esc(hallName(hs[0]))}</p></div>${I.chevR}</div>
      ${ratingChip(t)}
      <div class="tags">${verified(t)}${t.tags.slice(0, 2).map((g) => `<span class="tag">${esc(g)}</span>`).join('')}<span class="tag">${seats.toLocaleString('en-IN')} seats</span></div>
      <p class="best">Best seat <b>${best.id}</b> · ${best.m.dist.toFixed(0)} m from a ${hs[0].screen.w} m screen</p>
      ${(() => { const my = mySeat(); if (!my) return ''; if (my.t === t) return `<p class="mine-line">${I.heart} Your seat: <b>${esc(my.seat.id)}</b></p>`; const r = bestInTheatre(profileOf(my.seat), t); return `<p class="mine-line">${I.twin} Your seat here: <b>${esc(r.seat.id)}</b>${hs.length > 1 ? ' · ' + esc(hallName(r.L.hall)) : ''} · ${r.pct}% match</p>`; })()}
    </li>`;
  }).join('');
}

// Hero hook: a live, colour-coded seat map of a real hall (AMB HDR by Barco), built from the same
// scores as the app. Rows fade in from the screen outward; the director's seat pulses.
function heroPreview() {
  const t = theatreById('amb'), Lx = getLayout(t, 0), D = Lx.director;
  const rows = Lx.rows.slice().sort((a, b) => a.z - b.z); // screen at the top, nearest row first
  const W = 560, pad = 18, top = 54, rowH = 15, H = top + rows.length * rowH + 14;
  const sx = (W - pad * 2) / (Lx.maxHalf * 2);
  let dxy = null;
  const seats = rows.map((r, i) => r.seats.map((st) => {
    const x = pad + (st.x - st.sw / 2 + Lx.maxHalf) * sx + 0.7, w = Math.max(3, st.sw * sx - 1.4), y = top + i * rowH;
    if (st === D) dxy = { x: x + w / 2, y: y + 5, w };
    return `<rect x="${x.toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="10" rx="2.5" fill="${heatColor(st.m.score)}" style="--d:${i * 55}ms"/>`;
  }).join('')).join('');
  const lblW = 150, lx = Math.min(Math.max(dxy.x - lblW / 2, 6), W - lblW - 6), ly = dxy.y + 16;
  return `<figure class="hero-preview">
    <svg viewBox="0 0 ${W} ${H + 30}" role="img" aria-label="Seat map of ${esc(t.name)}, ${esc(hallName(Lx.hall))}, coloured by view quality. The director's seat ${esc(D.id)} scores ${D.m.score}.">
      <defs><linearGradient id="hp-scr" x1="0" x2="1"><stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset=".5" stop-color="currentColor"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
      <path class="hp-screen" d="M${pad + 30} 30 Q${W / 2} 8 ${W - pad - 30} 30" stroke="url(#hp-scr)"/>
      <text class="hp-screen-t" x="${W / 2}" y="44" text-anchor="middle">SCREEN</text>
      <g class="hp-seats">${seats}</g>
      <circle class="hp-pulse" cx="${dxy.x.toFixed(1)}" cy="${dxy.y}" r="${Math.max(9, dxy.w)}"/>
      <circle class="hp-ring" cx="${dxy.x.toFixed(1)}" cy="${dxy.y}" r="${Math.max(7, dxy.w * 0.8)}"/>
      <g class="hp-label" transform="translate(${lx.toFixed(1)} ${ly})"><rect width="${lblW}" height="24" rx="12"/><text x="${lblW / 2}" y="16" text-anchor="middle">Director's seat · ${esc(D.id)} · ${D.m.score}</text></g>
    </svg>
    <figcaption><span class="hp-scale" aria-hidden="true"><i></i></span>Real scores for all ${Lx.seats.length} seats of ${esc(t.short)} · ${esc(hallName(Lx.hall))}. Green is the best view.
      <button class="linkbtn" data-a="theatre" data-id="${t.id}">Open this hall ${I.chevR}</button></figcaption>
  </figure>`;
}

function renderHome() {
  const list = filtered();
  const totalSeats = THEATRES.reduce((n, t) => n + screensOf(t).reduce((a, _, i) => a + getLayout(t, i).seats.length, 0), 0);
  const verifiedN = THEATRES.filter((t) => t.source === 'bms').length;
  screenEl.innerHTML = `
  <header class="appbar"><div class="appbar-in wide">
    <p class="loc"><span class="loc-ico" aria-hidden="true">${I.pin}</span><span>Hyderabad <small>· ${THEATRES.length} theatres</small></span></p>
    <nav class="appbar-actions" aria-label="Site">
      <button class="nav-btn" data-a="how" aria-label="How seats are scored">${I.info}<span>How scoring works</span></button>
      <button class="nav-btn theme-btn" data-a="theme" aria-pressed="${isDark()}" aria-label="Dark mode" title="${isDark() ? 'Switch to light mode' : 'Switch to dark mode'}">${isDark() ? I.sun : I.moon}</button>
      <button class="nav-btn" data-a="saved" aria-label="Saved seats${SAVED.length ? ` (${SAVED.length})` : ''}">${I.bookmark}<span>Saved</span>${SAVED.length ? `<span class="count" aria-hidden="true">${SAVED.length}</span>` : ''}</button>
    </nav></div></header>
  <main id="main" class="page home" tabindex="-1">
    <section class="hero" aria-labelledby="hero-h">
      <h1 id="hero-h" class="hero-title"><span class="logo" aria-hidden="true">${I.seat}</span>${WORDMARK}</h1>
      <p class="tagline">View your seat <em>before you sit.</em></p>
      <p class="lede">Pick a theatre, choose a seat, and look at the screen through your own eyes: distance, angle, and whether the head in front gets in the way.</p>
      <div class="hero-cta">
        <button class="btn primary lg-ish" data-a="scrollfind">${I.search} Find my seat</button>
        <button class="btn ghost lg-ish" data-a="dna">${I.dna} Describe my seat</button>
      </div>
      <p class="hero-note"><span>${I.check}No login</span><span>${I.check}No sign-up</span><span>${I.check}Free, works offline</span></p>
      ${heroPreview()}
      <ul class="facts" aria-label="At a glance"><li><b>${THEATRES.length}</b> theatres</li><li><b>${totalSeats.toLocaleString('en-IN')}</b> seats scored</li><li><b>${verifiedN}</b> matched to BookMyShow</li></ul>
    </section>
    <section class="steps-wrap" aria-labelledby="steps-h">
      <h2 id="steps-h" class="sr">How it works</h2>
      <ol class="steps">
        <li><span class="step-ico">${I.pin}</span><span><b>Pick a theatre</b><span>${THEATRES.length} halls across Hyderabad, from large formats to single screens.</span></span></li>
        <li><span class="step-ico">${I.seat}</span><span><b>Choose a seat</b><span>Every seat gets a 0–100 view score for distance, angle and sightline.</span></span></li>
        <li><span class="step-ico">${I.eye}</span><span><b>See the screen</b><span>Fly into a 3D model of the hall and look from that exact seat.</span></span></li>
      </ol>
    </section>
    <section class="only" aria-labelledby="only-h">
      <p class="eyebrow">${I.spark} Only on Vyu</p>
      <h2 id="only-h">Things no booking app can show you</h2>
      <ul class="only-grid">
        <li class="only-card">
          <span class="only-ico">${I.twin}</span>
          <h3>Seat Twin</h3>
          ${(() => { const my = mySeat(); return my ? `
          <p>Your seat is <b>${esc(my.t.short)} · ${esc(hallName(my.L.hall))} · ${esc(my.seat.id)}</b>. Every theatre below now shows the seat that gives you the same view.</p>
          <div class="only-actions"><button class="btn primary" data-a="mytwins">${I.twin} See my twins</button><button class="btn ghost" data-a="dna">${I.dna} Describe instead</button><button class="linkbtn" data-a="clearmine">Change my seat</button></div>` : `
          <p>Find your seat in every hall. Tell us where you like to sit, by picking your usual seat or by describing the view, and we find that same view everywhere: same screen size in your eyes, same angle.</p>
          <div class="only-actions"><button class="btn primary" data-a="pickmine">${I.heart} Pick my seat</button><button class="btn ghost" data-a="dna">${I.dna} Describe my seat</button></div>`; })()}
        </li>
        <li class="only-card">
          <span class="only-ico">${I.motion}</span>
          <h3>Motion Look</h3>
          <p>Hold up your phone and move it: the hall moves with you, like a window into the cinema. No headset, no app to install.</p>
          ${motionCapable() ? `<button class="btn primary" data-a="trymotion">${I.motion} Try it now</button>` : '<p class="only-note">Open <b>abhi68402.github.io/vyu</b> on your phone to try it.</p>'}
        </li>
      </ul>
    </section>
    <div class="home-grid">
      <section class="finder" id="finder" aria-labelledby="find-h">
        <p class="eyebrow">${I.pin} Hyderabad</p>
        <h2 id="find-h">Find your theatre</h2>
        <form class="search" role="search" data-search>
          <label for="q" class="sr">Search theatres or areas</label>${I.search}<input id="q" type="search" placeholder="Search theatres or areas" value="${esc(S.q)}" autocomplete="off" enterkeyhint="search">
        </form>
        <div class="chips" role="group" aria-label="Filter theatres">${FILTERS.map(([k, l]) => `<button class="chip" data-a="filter" data-id="${k}" aria-pressed="${S.filter === k}">${l}</button>`).join('')}</div>
        <div class="finder-foot">
          <div class="seg view-switch" role="group" aria-label="Show theatres as"><button data-a="homeview" data-id="list" aria-pressed="${S.homeView === 'list'}">List</button><button data-a="homeview" data-id="map" aria-pressed="${S.homeView === 'map'}">Map</button></div>
          <p class="count" id="count" aria-live="polite">${countText(list.length)}</p>
        </div>
      </section>
      <section class="results" aria-labelledby="th-h">
        <h2 id="th-h" class="sr">Theatres</h2>
        ${S.homeView === 'map' ? `<figure class="mapblock">
          <div class="citymap" id="citymap">${cityMap(list)}</div>
          <figcaption class="map-key"><i class="dot v" aria-hidden="true"></i>Matched to BookMyShow <i class="dot" aria-hidden="true"></i>Approximate layout</figcaption>
        </figure>` : `<ul class="tlist" id="tlist">${theatreCards()}</ul>`}
      </section>
    </div>
  </main>
  <footer class="site-foot"><div class="foot-in foot-centre">
    <p class="brand sm"><span class="logo" aria-hidden="true">${I.seat}</span>${WORDMARK}</p>
    <p class="fine">“Approximate layout” halls are reconstructions from public descriptions. “Matched” halls follow the BookMyShow seat map row for row. Screen sizes and floor slope are estimates unless noted.</p>
    <p class="fine">Vyu is an independent seat-view guide. It does not sell tickets or list showtimes.</p>
    <p class="fine contact">Questions, fixes or a hall to add? <a href="mailto:gompaharshit7@gmail.com?subject=Vyu%20feedback">Contact me: gompaharshit7@gmail.com</a></p>
  </div></footer>`;
}
const countText = (n) => (n === THEATRES.length ? `All ${n} theatres` : `${n} of ${THEATRES.length} theatres`);
function refreshResults() {
  const list = filtered();
  const tl = $('#tlist'); if (tl) tl.innerHTML = theatreCards();
  const cm = $('#citymap'); if (cm) cm.innerHTML = cityMap(list);
  const c = $('#count'); if (c) c.textContent = countText(list.length);
  $$('.chip').forEach((b) => b.setAttribute('aria-pressed', b.dataset.id === S.filter));
}

// ───────────────────────── THEATRE ─────────────────────────
function sectionSvg(Lx) {
  const W = 360, H = 120;
  const maxZ = Lx.room.backZ, maxY = Lx.room.height;
  const k = Math.min((W - 20) / maxZ, (H - 14) / maxY);
  const X = (z) => 10 + z * k, Y = (y) => H - 6 - y * k;
  const sc = Lx.screen;
  let floor = `M${X(0)},${Y(0)} L${X(Lx.firstEdge)},${Y(0)}`;
  Lx.sections[0].rows.forEach((r) => { floor += ` L${X(r.z - r.pitch / 2)},${Y(r.floorY)} L${X(r.z + r.pitch / 2)},${Y(r.floorY)}`; });
  floor += ` L${X(maxZ)},${Y(Lx.sections[0].rows.at(-1).floorY)}`;
  let balc = '';
  Lx.balconies.forEach((bs) => {
    let p;
    if (bs.stacked) { // solid tier behind the one below: from the ground up to its first row
      p = `M${X(bs.startZ)},${Y(0)} L${X(bs.startZ)},${Y(bs.floorY)}`;
    } else {
      p = `M${X(bs.parapetZ)},${Y(bs.undersideY)} L${X(bs.parapetZ)},${Y(bs.floorY + 0.9)}`;
    }
    bs.rows.forEach((r) => { p += ` L${X(r.z - r.pitch / 2)},${Y(r.floorY)} L${X(r.z + r.pitch / 2)},${Y(r.floorY)}`; });
    p += bs.stacked || bs === Lx.balconies.at(-1) ? ` L${X(maxZ)},${Y(bs.rows.at(-1).floorY)} L${X(maxZ)},${Y(bs.stacked ? 0 : bs.undersideY)} Z` : ` L${X(bs.endZ)},${Y(bs.undersideY)} Z`;
    balc += `<path d="${p}" fill="rgba(181,79,11,.08)" style="stroke:var(--warn)" stroke-width="1"/>`;
  });
  const heads = Lx.rows.map((r) => `<circle cx="${X(r.z + 0.15)}" cy="${Y(r.floorY + 1.15)}" r="1.7" style="fill:var(--accent)" opacity=".85"/>`).join('');
  // tight viewBox: the drawing is centred in its card instead of hugging the left edge
  return `<svg viewBox="0 0 ${Math.ceil(X(maxZ) + 10)} ${H}" role="img" aria-label="Side section of the hall: screen on the left, rows rising to the right">
    <line x1="${X(0.05)}" y1="${Y(sc.bottom)}" x2="${X(0.05)}" y2="${Y(sc.top)}" style="stroke:var(--text)" stroke-width="3" stroke-linecap="round"/>
    <path d="${floor}" fill="none" stroke="#8f8477" stroke-width="1.5"/>${balc}${heads}</svg>`;
}

function knowBeforeYouGo(Lx) {
  const tips = [];
  const rowAvg = Lx.rows.map((r) => {
    const mid = r.seats.filter((s) => Math.abs(s.x) < 2.5);
    const arr = mid.length ? mid : r.seats;
    return { r, avg: arr.reduce((a, s) => a + s.m.score, 0) / arr.length };
  });
  const nm = (r) => (r.prefix ? `${r.prefix} ${r.label}` : r.label); // rows repeat their letters in each class
  const best = rowAvg.slice().sort((a, b) => b.avg - a.avg).slice(0, 3).map((x) => nm(x.r));
  tips.push(['good', `Best rows: <b>${best.join(', ')}</b>, centre block.`]);
  const neck = Lx.rows.filter((r) => r.seats.some((s) => s.m.elevTop > 38)).map(nm);
  if (neck.length) tips.push(['warn', `Rows <b>${neck.slice(0, 4).join(', ')}${neck.length > 4 ? '…' : ''}</b> are close to the screen, so you'll be looking up.`]);
  const under = Lx.rows.filter((r) => r.seats.some((s) => s.m.overhangCut > 0.05)).map(nm);
  if (under.length) tips.push(['warn', `Rows <b>${under[0]}–${under.at(-1)}</b> sit under the balcony; the top of the screen gets cut off.`]);
  const blocked = Lx.seats.filter((s) => s.m.clearance != null && s.m.clearance < 0.06).length;
  if (blocked / Lx.seats.length > 0.2) tips.push(['warn', `Shallow floor slope: in ${Math.round((blocked / Lx.seats.length) * 100)}% of seats a tall person in front can block the subtitles.`]);
  const side = Lx.seats.filter((s) => s.m.skew > 24).length;
  if (side) tips.push(['info', `${side} edge seats see the screen at a steep side angle.`]);
  const mark = { good: I.check, warn: svg('<path d="M12 4l9 16H3z"/><path d="M12 10v4M12 17h.01"/>'), info: I.info };
  return `<ul class="know">${tips.map(([k, t]) => `<li class="${k}">${mark[k]}<span>${t}</span></li>`).join('')}</ul>`;
}

// The director's seat, worked out step by step from this hall's geometry (layout.js L.refCalc).
function directorMaths(Lx) {
  const c = Lx.refCalc, D = Lx.director, m = D.m, f1 = (v) => v.toFixed(1);
  const angleIn = Math.min(Math.max(c.dAngle, c.bandLo), c.bandHi);
  const after = Math.max(c.blended, Math.min(c.neckZ, c.bandHi));
  const neckNote = c.neckZ <= c.blended
    ? `Looking up at most 30° needs at least ${f1(c.neckZ)} m. ${f1(c.blended)} m already meets it.`
    : c.neckZ > c.bandHi
      ? `Looking up at most 30° would need ${f1(c.neckZ)} m, past the director's band, so we go only as far back as the band allows: <b>${f1(after)} m</b>. Expect some look-up on a screen this tall.`
      : `Looking up at most 30° needs at least ${f1(c.neckZ)} m, so the seat moves back to <b>${f1(after)} m</b>.`;
  return `<section class="panel dir-panel" aria-labelledby="dir-h">
    <h2 class="h-sm" id="dir-h">Director's seat</h2>
    <div class="mine-row"><span class="mine-ico dir-ico" aria-hidden="true">${I.film}</span><span><b>${esc(D.id)}</b><small>${f1(m.dist)} m from the screen · fills ${Math.round(m.fov)}° · look-up ${Math.round(m.elevTop)}° · score ${m.score}</small></span>
      <button class="btn primary sm" data-a="sit" data-id="${esc(D.id)}">Sit there</button></div>
    <details class="dir-maths"><summary>How we worked it out</summary>
      <ol>
        <li><b>Ideal distance from the screen.</b> The screen is ${f1(c.w)} m wide and should fill ${c.theta}°${c.theta === 60 ? ' (immersive format)' : ''}. Trigonometry: D = W ÷ (2 × tan(θ/2)) = ${f1(c.w)} ÷ (2 × tan ${c.theta / 2}°) = <b>${f1(c.dAngle)} m</b>.</li>
        <li><b>Keep it in the director's band.</b> Directors mix and check films about two-thirds back, so the seat stays between 60% and 72% of the ${f1(c.backZ)} m room: ${f1(c.bandLo)} to ${f1(c.bandHi)} m${Math.abs(angleIn - c.dAngle) > 0.05 ? `, which moves ${f1(c.dAngle)} m to <b>${f1(angleIn)} m</b>` : ''}.</li>
        <li><b>Blend with the two-thirds rule.</b> Two-thirds of the room is ${f1(c.twoThirds)} m. Average of the two: (${f1(angleIn)} + ${f1(c.twoThirds)}) ÷ 2 = <b>${f1(c.blended)} m</b>.</li>
        <li><b>Neck check.</b> ${neckNote}</li>
        <li><b>Nearest real seat.</b> The row closest to ${f1(c.z)} m${Lx.balcony ? ' (in the stalls, clear of the balcony overhang)' : ''}, best seat nearest the centre line: <b>${esc(D.id)}</b>.</li>
      </ol>
      <p class="fine">Viewing-angle guidance: SMPTE asks for at least 30°, THX at least 36° from the back row. These set the floor; the director's seat sits further in, at the format's target angle.</p>
    </details>
  </section>`;
}

// Published specs for the selected hall, and the theatre's highlights (js/info.js), each linked to its source.
const srcLink = (url, src) => `<a class="src" href="${url}" target="_blank" rel="noopener">${esc(src)}${I.ext}</a>`;
function hallSpecs(t, si) {
  const h = infoOf(t.id)?.halls?.[si];
  if (!h) return '';
  const parts = [h.width && `<li><b>${esc(h.width)}</b><span>screen width</span></li>`, `<li><b>${esc(h.projector)}</b><span>projection</span></li>`, `<li><b>${esc(h.sound)}</b><span>sound</span></li>`].filter(Boolean);
  return `<div class="specs"><p class="specs-h">Published specs${h.which ? ` · ${esc(h.which)}` : ''}</p><ul class="specs-list">${parts.join('')}</ul>
    <p class="fine specs-src">Source: ${srcLink(h.url, new URL(h.url).hostname.replace('www.', ''))} · checked ${INFO_AS_OF}</p></div>`;
}
function specialPanel(t) {
  const inf = infoOf(t.id);
  if (!inf?.highlights?.length) return '';
  return `<section class="panel special" aria-labelledby="spec-h"><h2 class="h-sm" id="spec-h">What's special</h2>
    <ul class="special-list">${inf.highlights.map((x) => `<li>${I.spark}<span>${esc(x.text)} ${srcLink(x.url, x.src)}</span></li>`).join('')}</ul></section>`;
}

function renderTheatre() {
  const t = T(), hs = screensOf(t), Lx = getLayout(t, S.si), h = hs[S.si];
  const tops = topSeats(Lx, 3);
  const autos = Math.round(h.screen.w / 2.6);
  screenEl.innerHTML = `
  <header class="appbar"><div class="appbar-in t-bar">
    ${iconBtn('home', I.back, 'Back to all theatres')}
    <div class="appbar-title"><b>${esc(t.name)}</b> <span>${esc(t.area)}, Hyderabad</span></div>
    ${iconBtn('how', I.info, 'How seats are scored')}
  </div></header>
  <main id="main" class="page t-page" tabindex="-1">
      <div class="t-title"><p class="eyebrow">${esc(t.area)}</p><h1>${esc(t.name)}</h1>${ratingChip(t, { long: true })}<div class="tags">${verified(t)}${t.tags.map((g) => `<span class="tag">${esc(g)}</span>`).join('')}</div></div>
      ${hs.length > 1 ? `<div class="seg wide" role="group" aria-label="Choose a screen">${hs.map((x, i) => `<button data-a="screen" data-id="${i}" aria-pressed="${i === S.si}">${esc(hallName(x))}</button>`).join('')}</div>` : ''}
      <div class="t-grid">
      <div class="t-main">
      <section class="panel t-hall" aria-labelledby="hall-h">
        <h2 class="h-sm" id="hall-h">${esc(h.name)}</h2>
        <div class="stats">
          <div class="stat"><b>${h.screen.w} × ${h.screen.h} m</b><span>screen · about ${autos} autos wide</span></div>
          <div class="stat"><b>${Lx.seats.length}</b><span>seats in ${Lx.rows.length} rows</span></div>
          <div class="stat"><b>${Lx.balcony ? 'Balcony' : h.riser < 0.2 ? 'Gentle' : 'Stadium'}</b><span>${Lx.balconies.length > 1 ? 'stalls + 2 balconies' : Lx.balcony ? 'stalls + balcony' : 'floor slope'}</span></div>
        </div>
        ${hallSpecs(t, S.si)}
        <figure class="section-svg">${sectionSvg(Lx)}<figcaption>Side section, to scale. Screen on the left.${h.screenNote ? ` <em>${esc(h.screenNote)}.</em>` : ''}</figcaption></figure>
      </section>
      ${directorMaths(Lx)}
      </div>
      <div class="t-side">
      ${specialPanel(t)}
      <section aria-labelledby="know-h"><h2 class="h-sm" id="know-h">Know before you go</h2>${knowBeforeYouGo(Lx)}</section>
      ${(() => { const tw = myTwinIn(Lx); if (!tw) return ''; return `<section class="panel mine-panel" aria-labelledby="mine-h"><h2 class="h-sm" id="mine-h">${tw.own ? 'Your seat' : 'Your seat here'}</h2>
        <div class="mine-row"><span class="mine-ico">${tw.own ? I.heart : I.twin}</span><span><b>${esc(tw.seat.id)}</b><small>${tw.own ? 'The seat you marked as yours' : `${tw.pct}% match to your seat ${esc(mySeat().seat.id)} at ${esc(mySeat().t.short)}`}</small></span>
        <button class="btn primary sm" data-a="sit" data-id="${esc(tw.seat.id)}">Sit there</button></div></section>`; })()}
      <section class="panel" aria-labelledby="best-h"><h2 class="h-sm" id="best-h">Best seats in this hall</h2>
        <ol class="topseats">${tops.map((s, i) => `<li><button class="topseat" data-a="sit" data-id="${s.id}" aria-label="Number ${i + 1}: sit in ${s.id}, ${esc(s.tierLabel)}, score ${s.m.score}"><span class="rk" aria-hidden="true">#${i + 1}</span><b>${s.id}</b>${ring(s.m.score, 40)}<small>${s === Lx.director ? "Director's seat" : esc(s.tierLabel)}</small></button></li>`).join('')}</ol>
      </section>
      </div>
      </div>
  </main>
  <div class="cta-bar"><button class="btn primary lg" data-a="seats">Explore all ${Lx.seats.length} seats</button></div>`;
}

// ───────────────────────── SEAT MAP ─────────────────────────
function mapAvail() {
  const panel = isSplit() ? 440 : Math.min(innerWidth, 820);
  return panel - 2 * (isSplit() ? 20 : 16) - 2 * 24;
}
function renderSeats() {
  const t = T(), Lx = L(), h = hallOf(), hs = screensOf(t);
  const base = mapAvail() / (Lx.maxHalf * 2);
  if (S.zoom == null) S.zoom = Math.min(3.2, Math.max(1, (coarse.matches ? 18 : 14) / (0.55 * base)));
  const pxm = base * S.zoom;
  const width = Lx.maxHalf * 2 * pxm;
  const flash = new Set(S.flash || []);
  const myTw = myTwinIn(Lx); // your seat (or its twin) in this hall, marked on the map
  const tabId = S.focus || Lx.seats[0].id;
  let lastKey = '';
  const rowsHtml = Lx.rows.map((r) => {
    let head = '';
    const key = r.section + r.tierLabel;
    if (key !== lastKey) {
      head = `<div class="tierhead ${Lx.sections[r.section].balcony ? 'balc' : ''}"><span>${esc(r.tierLabel)}</span></div>`;
      lastKey = key;
    }
    const rh = Math.max(coarse.matches ? 24 : 20, Math.min(32, (TIERS[r.tier].pitch * 15 + 4) * Math.sqrt(S.zoom)));
    const prev = Lx.rows[Lx.rows.indexOf(r) - 1];
    const walk = prev && !head && r.section === prev.section && r.z - prev.z - (r.pitch + prev.pitch) / 2 > 0.4 ? 12 : 0;
    const seats = r.seats.map((s) => {
      const on = s.id === S.focus;
      const cls = ['seat', s.tier === 'recliner' || s.tier === 'lounger' || s.tier === 'semi' ? 'rec' : '', s.tier === 'motion' ? 'mot' : '', on ? 'sel' : '', isSaved(t.id, S.si, s.id) ? 'sv' : '', flash.has(s.id) ? 'sug' : '', s === Lx.director ? 'dir' : '', myTw && s === myTw.seat ? (myTw.own ? 'mine' : 'twin') : ''].join(' ');
      const gap = Math.max(1, pxm * 0.07);
      const left = (s.x - s.sw / 2 + Lx.maxHalf) * pxm + gap;
      const w = Math.max(4, s.sw * pxm - gap * 2);
      const bg = S.heat && !on ? `background:${heatColor(s.m.score)};color:#fff;` : '';
      return `<button class="${cls}" style="left:${left.toFixed(1)}px;width:${w.toFixed(1)}px;${bg}" data-a="seat" data-id="${esc(s.id)}" tabindex="${s.id === tabId ? 0 : -1}" aria-label="Row ${esc(s.rowLabel)} seat ${s.num}, ${esc(s.tierLabel)}, view score ${s.m.score}" aria-pressed="${on}">${w >= 13 && (on || S.zoom > 1.6) ? s.num : ''}</button>`;
    }).join('');
    return `${head}<div class="seatrow" style="height:${rh}px;margin-top:${walk}px"><span class="rl l" aria-hidden="true">${esc(r.label)}</span><div class="rs" style="width:${width}px">${seats}</div><span class="rl" aria-hidden="true">${esc(r.label)}</span></div>`;
  }).join('');

  const tiers = new Set(Lx.seats.map((s) => s.tier));
  const legend = [['seat', 'Seat']];
  if (['recliner', 'semi', 'lounger'].some((k) => tiers.has(k))) legend.push(['rec', 'Recliner']);
  if (tiers.has('motion')) legend.push(['mot', '4DX']);
  legend.push(['dir', "Director's seat"]);
  if (myTw) legend.push([myTw.own ? 'mine' : 'twin', myTw.own ? 'Your seat' : `Your seat's twin · ${myTw.pct}%`]);
  legend.push(['sel', 'Your pick']);
  const focus = S.focus && Lx.byId.get(S.focus);

  screenEl.innerHTML = `
  <header class="appbar"><div class="appbar-in">
    ${iconBtn('theatre', I.back, `Back to ${t.name}`, `data-id="${t.id}"`)}
    <h1 class="appbar-title"><b>${esc(t.short)}</b> <span><span class="sr">Seat map, </span>${esc(h.name)}</span></h1>
    ${iconBtn('how', I.info, 'How seats are scored')}
  </div></header>
  <main id="main" class="seats-page" tabindex="-1">
    ${hs.length > 1 ? `<div class="seg wide" role="group" aria-label="Choose a screen">${hs.map((x, i) => `<button data-a="screen" data-id="${i}" aria-pressed="${i === S.si}">${esc(hallName(x))}</button>`).join('')}</div>` : ''}
    <div class="mapcard">
      <div class="arc" aria-hidden="true"><svg viewBox="0 0 400 70" preserveAspectRatio="none"><defs><linearGradient id="sl" x1="0" x2="1"><stop offset="0" stop-color="#c8432e" stop-opacity="0"/><stop offset=".5" stop-color="#c8432e"/><stop offset="1" stop-color="#c8432e" stop-opacity="0"/></linearGradient><radialGradient id="sg" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="#c8432e" stop-opacity=".10"/><stop offset="1" stop-color="#c8432e" stop-opacity="0"/></radialGradient></defs><path d="M20 26 Q200 -8 380 26 L380 70 L20 70 Z" fill="url(#sg)"/><path d="M20 26 Q200 -8 380 26" fill="none" stroke="url(#sl)" stroke-width="2.6"/></svg><span>SCREEN · ${h.screen.w} M</span></div>
      <div class="mapwrap" role="group" aria-label="Seat map, screen at the top"><div class="mapinner" style="width:${width + 48}px">${rowsHtml}</div></div>
      ${S.heat ? '<div class="heatbar"><span>Weaker view</span><i></i><span>Better view</span></div>' : ''}<ul class="legend">${legend.filter(([c]) => !S.heat || !['seat', 'rec', 'mot'].includes(c)).map(([c, l]) => `<li><i class="sw ${c}"></i>${l}</li>`).join('')}</ul>
    </div>
    <div class="tools" role="toolbar" aria-label="Seat map tools">
      <button class="tool" data-a="top">${I.spark}<span>Best seats</span></button>
      <button class="tool" data-a="heat" aria-pressed="${S.heat}">${I.heat}<span>View-quality map</span></button>
      <div class="zoom" role="group" aria-label="Zoom">${iconBtn('zoom', I.minus, 'Zoom out', 'data-d="-1"')}${iconBtn('zoom', I.plus, 'Zoom in', 'data-d="1"')}</div>
    </div>
    <p class="sr">Use the arrow keys to move between seats, and Enter to sit in one.</p>
  </main>
  <div class="bottombar"><div class="sum" id="sum">${sumHtml(focus)}</div>
    <button class="btn ${focus ? 'primary' : ''}" id="sumbtn" data-a="sit" data-id="${focus ? esc(focus.id) : ''}" ${focus ? '' : 'disabled'}>View seat</button></div>`;
  const mw = $('.mapwrap');
  if (mw) mw.scrollLeft = S.keepScroll ?? (mw.scrollWidth - mw.clientWidth) / 2;
  S.keepScroll = null; S.flash = null;
}
const sumHtml = (f) => (f ? `<small>Selected · ${esc(f.tierLabel)}</small><b>${esc(f.id)} · score ${f.m.score}</b>` : '<small>Tap any seat to sit in it</small><b class="dim">No seat selected</b>');

function markSelected() {
  const Lx = L();
  $$('.seat.sel').forEach((b) => { b.classList.remove('sel'); b.setAttribute('aria-pressed', 'false'); if (S.zoom <= 1.6) b.textContent = ''; });
  const b = S.focus && $(`.seat[data-id="${CSS.escape(S.focus)}"]`);
  if (b) { b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); if (b.offsetWidth >= 13) b.textContent = Lx.byId.get(S.focus).num; b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
  $$('.seat[tabindex="0"]').forEach((x) => (x.tabIndex = -1));
  if (b) b.tabIndex = 0;
  const f = S.focus && Lx.byId.get(S.focus);
  const sum = $('#sum'); if (sum) sum.innerHTML = sumHtml(f);
  const btn = $('#sumbtn'); if (btn) { btn.disabled = !f; btn.dataset.id = f ? f.id : ''; btn.classList.toggle('primary', !!f); }
}

// ───────────────────────── 3D STAGE ─────────────────────────
let view3d = null, viewLoading = null;
// Each failure gets a `kind` so the stage can say what actually went wrong:
// 'webgl' (no GPU context), 'load' (neither the modules nor the single-file bundle arrived), 'error'.
const fail3D = (kind, cause) => Object.assign(new Error('3D view unavailable: ' + kind, { cause }), { kind });
function webglAvailable() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}
// Fallback: js/scene.bundle.js is three.js + all 3D modules in ONE classic script (built by
// tools/bundle-3d.mjs). It needs no import map and no module loading, so it works where those
// are blocked or unsupported (ad/script blockers, older browsers).
let sceneMod = null;
function loadBundle() {
  if (window.VyuScene) return Promise.resolve(window.VyuScene);
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = new URL('./scene.bundle.js?v=' + Date.now(), import.meta.url).href;
    s.onload = () => (window.VyuScene ? res(window.VyuScene) : rej(new Error('scene.bundle.js loaded but did not start')));
    s.onerror = () => { s.remove(); rej(new Error('Could not download js/scene.bundle.js')); };
    document.head.append(s);
  });
}
async function loadSceneModule() {
  if (sceneMod) return sceneMod;
  const maps = !window.HTMLScriptElement?.supports || HTMLScriptElement.supports('importmap');
  if (maps) {
    try { return (sceneMod = await import('./scene.js')); } catch (e1) { console.warn('3D modules failed; using the single-file bundle', e1); }
  }
  try { return (sceneMod = await loadBundle()); } catch (e) { throw fail3D('load', e); }
}
function getView() {
  if (view3d) return Promise.resolve(view3d);
  if (!viewLoading) {
    viewLoading = (async () => {
      if (!webglAvailable()) throw fail3D('webgl');
      const m = await loadSceneModule();
      try { view3d = new m.TheatreView(glEl); view3d.onLook = markLooking; return view3d; } catch (e) {
        glEl.replaceChildren();
        throw fail3D(/webgl|context/i.test(e?.message || '') ? 'webgl' : 'error', e);
      }
    })();
    // Never cache a failure: a later tap retries (e.g. once the connection is back).
    viewLoading.catch(() => { viewLoading = null; });
  }
  return viewLoading;
}
function failCopy(kind) {
  if (kind === 'browser') return ['This browser is too old for 3D', 'Update it, or open Vyu in a current Chrome, Edge, Firefox or Safari (16.4 or later). Seat scores still work below.'];
  if (kind === 'webgl') return ['3D graphics are turned off', 'This browser or device has WebGL disabled or unavailable. Turn on hardware acceleration in the browser settings, or try another browser. Seat scores still work below.'];
  if (kind === 'load') return navigator.onLine === false
    ? ['3D view didn’t finish loading', 'You went offline before the 3D files downloaded. Reconnect and tap Try again: once loaded, the 3D view keeps working offline.']
    : ['3D view didn’t finish loading', 'Some of the 3D files failed to download. Reload the page to try again. Seat scores still work.'];
  return ['The 3D view hit a problem', 'Something went wrong drawing this hall on this device. Tap Try again, or reload the page.'];
}
function show3DFailure(e) {
  const [title, body] = failCopy(e?.kind);
  stageEl.classList.add('no3d');
  let box = $('#st-fail', stageEl);
  if (!box) { box = document.createElement('div'); box.id = 'st-fail'; box.className = 'st-fail pe'; box.setAttribute('role', 'alert'); stageEl.prepend(box); }
  const c = e?.cause || e;
  const detail = String((c?.name ? c.name + ': ' : '') + (c?.message || c || 'Unknown error')).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  // A module that failed to load can only be refetched by reloading the page.
  const retry = e?.kind === 'load' ? 'reload3d' : 'retry3d';
  box.innerHTML = `<h2>${title}</h2><p>${body}</p><button class="btn light" data-a="${retry}">${retry === 'reload3d' ? 'Reload page' : 'Try again'}</button><details class="st-detail"><summary>Technical details</summary><code>${detail}</code><p>If this keeps happening, turn off ad or script blockers for this site.</p></details>`;
  requestAnimationFrame(positionFloating);
}
function clear3DFailure() { stageEl.classList.remove('no3d'); $('#st-fail', stageEl)?.remove(); }
function warmHall() { const Lx = L(); getView().then((v) => v.loadHall(Lx, crowd(Lx), MOVIES[S.content].id)).catch(() => {}); }

function stop3D() {
  if (S.motion) { S.motion = false; view3d?.setMotionLook(false); }
  glEl.classList.remove('on');
  S.scenePrimed = false; S.sceneKey = '';
  stageEl.innerHTML = ''; stageEl.classList.remove('no3d');
  setTimeout(() => { if (!exploring()) { view3d?.setActive(false); glEl.hidden = true; } }, 400);
}

const tbtn = (a, icon, label, on) => `<button class="tbtn" data-a="${a}" aria-pressed="${on}" aria-label="${label}" title="${label}">${icon}<span aria-hidden="true">${label}</span></button>`;
function stageHtml() {
  return `${isSplit() ? '' : `<h1 class="sr">${esc(T().name)}: 3D seat view</h1>`}
  <div class="st-top pe">
    <button class="icon-btn st-back" data-a="change" aria-label="Back to seat map" title="Back to seat map">${I.back}</button>
    <div class="seat-pill" id="seatpill"></div>
    <div class="st-tools" role="toolbar" aria-label="Scene controls">
      ${motionCapable() ? tbtn('motion', I.motion, 'Motion look', S.motion) : ''}${tbtn('lights', I.bulb, 'House lights', S.lights)}${tbtn('crowd', I.people, 'Full house', S.crowd)}${tbtn('content', I.film, 'Screen', false)}<button class="tbtn" data-a="reset" aria-label="Reset view" title="Reset view" hidden>${svg('<path d="M4 4v6h6"/><path d="M20 12a8 8 0 10-2.3 5.7"/><path d="M4 10a8 8 0 012-3.3"/>')}<span>Reset view</span></button>
    </div>
  </div>
  <div class="seg st-seg pe" role="group" aria-label="Camera view">
    <button data-a="mode" data-m="seat" aria-pressed="${!S.aerial}">Seat view</button>
    <button data-a="mode" data-m="aerial" aria-pressed="${S.aerial}">Aerial</button>
  </div>
  <div class="st-move pe" role="group" aria-label="Move to another seat">
    <span></span><button data-a="move" data-d="up" aria-label="Row closer to the screen">${I.arrow(0)}</button><span></span>
    <button data-a="move" data-d="left" aria-label="Seat to the left">${I.arrow(-90)}</button><span></span><button data-a="move" data-d="right" aria-label="Seat to the right">${I.arrow(90)}</button>
    <span></span><button data-a="move" data-d="down" aria-label="Row further back">${I.arrow(180)}</button><span></span>
  </div>
  <p class="st-hint" id="sthint"></p>
  <p class="st-full">Tap to show controls</p>
  <aside class="seat-card pe" aria-label="Seat details"></aside>`;
}
function renderStage() {
  stageEl.innerHTML = stageHtml();
  updateViewUI();
  setTimeout(() => $('.seat-card')?.classList.remove('enter'), 50);
}

// Seat details as a flat HUD: one slim bar docked along the bottom of the 3D view (score, seat,
// three key numbers, actions) so the screen is never covered. "Details" opens a drawer (from the
// right on wide screens, upwards on phones) with the full breakdown. Every existing action is kept.
function cardHtml() {
  const t = T(), Lx = L();
  const seat = Lx.byId.get(S.focus);
  if (!seat) {
    return `<div class="hud-main hud-empty"><span class="hud-empty-ico" aria-hidden="true">${I.seat}</span>
      <div class="hud-id"><h2>Pick a seat to sit in it</h2><p class="tier">Tap any seat on the map and the camera flies there.</p></div>
      <div class="hud-actions"><button class="hud-btn primary" data-a="top">${I.spark}<span>Show me the best seat</span></button></div></div>`;
  }
  const m = seat.m;
  const side = Math.abs(seat.x) < 0.15 ? 'dead centre' : seat.x < 0 ? 'left of centre' : 'right of centre';
  const C = m.clearance == null ? null : Math.round(m.clearance * 1000);
  const parts = [['Screen size', m.parts.angle], ['Off-axis', m.parts.skew], ['Neck', m.parts.neck], ['Sightline', m.parts.clear], ["Director's spot", m.parts.position]];
  const rank = Lx.seats.filter((s) => s.m.score > m.score).length + 1;
  const saved = isSaved(t.id, S.si, seat.id);
  const mine = isMySeat(t.id, S.si, seat.id);
  const secName = Lx.sections[seat.row.section].name;
  const halls = allLayouts().length - 1;
  return `
    <button class="grip" data-a="grip" aria-label="${S.open ? 'Hide' : 'Show'} seat details" aria-expanded="${S.open}" aria-controls="seat-more"><i></i></button>
    <div class="more" id="seat-more" role="region" aria-label="Seat details" ${S.open ? '' : 'inert'}>
      <div class="more-head"><h3>Why this score?</h3><button class="icon-btn more-x" data-a="sheet" aria-label="Close details">${I.close}</button></div>
      <div class="tiles">
        <div class="tile ${m.elevTop > 34 ? 'warn' : ''}"><b>${Math.round(m.elevTop)}°</b><span>look-up to top edge</span></div>
        <div class="tile ${C != null && C < 60 ? 'warn' : ''}"><b>${C == null ? 'Clear' : C + ' mm'}</b><span>sightline clearance</span></div>
        <div class="tile ${m.overhangCut > 0.05 ? 'warn' : ''}"><b>${m.overhangCut > 0.01 ? Math.round(m.overhangCut * 100) + '%' : m.audioD.toFixed(1) + ' m'}</b><span>${m.overhangCut > 0.01 ? 'screen hidden' : "from the director's spot"}</span></div>
      </div>
      <div class="bars" aria-label="Score breakdown">${parts.map(([n, v]) => `<div><span>${n}</span><i style="--v:${Math.round(v * 100)}%"></i></div>`).join('')}</div>
      <ul class="insights">${insightFor(seat).map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <button class="btn ghost back-map" data-a="change">${I.back} Back to the seat map</button>
    </div>
    <div class="hud-main">
      ${ring(m.score, 48)}
      <div class="hud-id"><span class="lbl ${labelTone(m.label)}">${m.label}</span><h2>Row ${esc(seat.rowLabel)} · Seat ${seat.num}</h2>
        <p class="hud-sub">${m.dist.toFixed(1)} m away · ${Math.round(m.fov)}° · ${side}</p>
        <p class="tier">${esc(seat.tierLabel)}${secName && secName !== seat.tierLabel ? ' · ' + esc(secName) : ''} · #${rank} of ${Lx.seats.length}</p></div>
      <ul class="hud-stats" aria-label="Key numbers">
        <li><b>${m.dist.toFixed(1)} m</b><span>to the screen</span></li>
        <li><b>${Math.round(m.fov)}°</b><span>field of view</span></li>
        <li><b>${Math.abs(seat.x) < 0.15 ? '0 m' : Math.abs(seat.x).toFixed(1) + ' m'}</b><span>${side}</span></li>
      </ul>
      <div class="hud-actions">
        <button class="hud-btn twin" data-a="twin" aria-label="Seat Twin: find this view in ${halls} other halls" title="Seat Twin: this view in ${halls} other halls">${I.twin}<span>Seat Twin</span></button>
        <button class="hud-btn" data-a="myseat" aria-pressed="${mine}" aria-label="${mine ? 'This is your seat' : 'Mark as my seat'}" title="${mine ? 'This is your seat' : 'Mark as my seat'}">${I.heart}<span>My seat</span></button>
        <button class="hud-btn save" data-a="save" aria-pressed="${saved}" aria-label="${saved ? 'Saved' : 'Save seat'}" title="${saved ? 'Saved' : 'Save seat'}">${I.bookmark}<span>${saved ? 'Saved' : 'Save'}</span></button>
        <button class="hud-btn details" data-a="sheet" aria-expanded="${S.open}" aria-controls="seat-more" aria-label="${S.open ? 'Hide' : 'Show'} score details" title="Why this score?">${I.chev}<span>Details</span></button>
      </div>
    </div>`;
}

function updateViewUI() {
  const card = $('.seat-card');
  if (!card) return;
  const Lx = L();
  const seat = S.focus && Lx.byId.get(S.focus);
  stageEl.classList.toggle('no-seat', !seat);
  card.classList.toggle('open', S.open);
  card.innerHTML = cardHtml();
  const pill = $('#seatpill');
  if (pill) pill.innerHTML = seat ? `<i></i><span><em>View from </em>${esc(seat.id)}</span>` : '';
  $$('[data-a="lights"]', stageEl).forEach((b) => b.setAttribute('aria-pressed', S.lights));
  $$('[data-a="crowd"]', stageEl).forEach((b) => b.setAttribute('aria-pressed', S.crowd));
  $$('[data-a="motion"]', stageEl).forEach((b) => { b.setAttribute('aria-pressed', S.motion); b.hidden = S.aerial || !seat; });
  $$('[data-a="mode"]', stageEl).forEach((b) => b.setAttribute('aria-pressed', (b.dataset.m === 'aerial') === S.aerial));
  const rb = $('[data-a="reset"]', stageEl); if (rb) rb.hidden = !S.aerial;
  const hint = $('#sthint');
  if (hint) hint.textContent = coarse.matches
    ? (S.aerial ? 'Drag to orbit · pinch to zoom · tap for full screen' : S.motion ? 'Move your phone to look around · drag still works' : 'Drag to look around · tap for full screen')
    : (S.aerial ? 'Drag to orbit · scroll to zoom · double-click to reset · V seat view' : 'Drag to look around · ← ↑ → ↓ move seats · V aerial view · Esc back');
  if (seat) ['up', 'down', 'left', 'right'].forEach((d) => { const b = $(`.st-move [data-d="${d}"]`); if (b) b.disabled = !neighbour(Lx, seat, d); });
  requestAnimationFrame(positionFloating);
}

// Keep the picture centred in the free area beside/above the seat card.
function positionFloating() {
  const card = $('.seat-card');
  if (!card) return;
  if (S.full || !S.focus) { app.style.setProperty('--sheet-h', '0px'); view3d?.setInset(0); return; }
  // HUD: only the bar takes space; the drawer floats over the picture when asked for.
  const bar = $('.hud-main', card);
  const h = (bar ? bar.offsetHeight : card.offsetHeight) + (app.dataset.sheet === 'bottom' ? 0 : 16);
  app.style.setProperty('--sheet-h', h + 'px');
  view3d?.setInset(Math.min(h, innerHeight * 0.4));
}

// While the viewer drags to look around (or moves the phone in Motion Look), the HUD fades out of
// the way and comes back ~0.7 s after the movement stops. Never while focus is inside it.
let lookTimer = 0;
function markLooking() {
  stageEl.classList.add('looking');
  clearTimeout(lookTimer);
  lookTimer = setTimeout(() => stageEl.classList.remove('looking'), 700);
}

async function startScene() {
  const Lx = L();
  glEl.hidden = false;
  try {
    const v = await getView();
    if (!exploring() || L() !== Lx) return;
    const key = S.tid + ':' + S.si;
    if (S.sceneKey !== key) { S.sceneKey = key; S.scenePrimed = false; }
    v.loadHall(Lx, crowd(Lx), MOVIES[S.content].id);
    v.setAudience(S.crowd); v.setHouseLights(S.lights);
    v.mode = S.aerial ? 'aerial' : 'seat';
    v.setActive(true);
    const seat = S.focus && Lx.byId.get(S.focus);
    v.setFocus(seat ? seat.id : null);
    positionFloating();
    if (seat) { v.flyTo(seat, !S.scenePrimed); S.scenePrimed = true; } else { v.preview(); S.scenePrimed = false; }
    requestAnimationFrame(() => glEl.classList.add('on'));
    clear3DFailure();
  } catch (e) {
    console.error(e, e?.cause);
    if (exploring()) show3DFailure(e);
  }
}

// Choose a seat. Split view: stay on the page and fly the camera. Otherwise open the 3D page.
function chooseSeat(id) {
  if (!id) return;
  S.open = false;
  if (isSplit()) {
    S.focus = id;
    markSelected();
    if (!$('.seat-card')) renderStage(); else updateViewUI();
    startScene();
    replaceUrl();
  } else if (S.route === 'view') { go('view', { focus: id }, { history: 'none' }); replaceUrl(); }
  else go('view', { focus: id });
}

function moveFocus(dir) {
  const Lx = L();
  const n = S.focus && neighbour(Lx, Lx.byId.get(S.focus), dir);
  if (!n) return;
  S.focus = n.id;
  if (isSplit()) markSelected();
  updateViewUI();
  if (view3d) { view3d.setFocus(n.id); view3d.flyTo(n, false); }
  replaceUrl();
}

// ───────────────────────── SAVED ─────────────────────────
function renderSaved() {
  screenEl.innerHTML = `
  <header class="appbar"><div class="appbar-in">${iconBtn('home', I.back, 'Back to all theatres')}<h1 class="appbar-title"><b>Saved seats</b> <span>${SAVED.length} seat${SAVED.length === 1 ? '' : 's'}</span></h1><span class="sp"></span></div></header>
  <main id="main" class="page narrow" tabindex="-1">${SAVED.length ? `<ul class="tlist one">${SAVED.slice().reverse().map((x) => {
    const t = theatreById(x.tid); const s = t && getLayout(t, x.si).byId.get(x.id);
    if (!s) return '';
    return `<li class="tcard"><div class="tc-head">${ring(s.m.score, 52)}<div class="tc-title"><h2><button class="stretch" data-a="opensaved" data-tid="${x.tid}" data-si="${x.si}" data-id="${esc(x.id)}">${esc(t.name)} · ${esc(x.id)}</button></h2><p>${esc(hallName(screensOf(t)[x.si]))} · ${esc(s.tierLabel)} · ${s.m.label.toLowerCase()}</p></div>${I.chevR}</div></li>`;
  }).join('')}</ul>` : `<div class="empty"><span class="empty-ico">${I.bookmark}</span><b>No saved seats yet.</b><span>Sit in a seat and tap “Save seat” to keep it for next time.</span><button class="btn ghost" data-a="home">Browse theatres</button></div>`}</main>`;
}

// ───────────────────────── Motion Look ─────────────────────────
async function toggleMotion() {
  if (S.motion) { S.motion = false; view3d?.setMotionLook(false); updateViewUI(); toast('Motion look off'); return; }
  const DOE = window.DeviceOrientationEvent;
  if (DOE && typeof DOE.requestPermission === 'function') { // iOS 13+: must be asked from a tap
    let ok = 'denied';
    try { ok = await DOE.requestPermission(); } catch {}
    if (ok !== 'granted') { toast('Allow motion access to look around by moving your phone'); return; }
  }
  if (!view3d) return;
  S.motion = true;
  view3d.setMotionLook(true, () => { S.motion = false; updateViewUI(); toast('No motion sensor found on this device'); });
  updateViewUI();
  toast('Move your phone to look around. Tap again to stop.');
}

// ───────────────────────── modal ─────────────────────────
let modalReturn = null;
function openModal(html, cls = '', focusSel = '.m-card .btn') {
  modalReturn = document.activeElement;
  modalEl.innerHTML = `<div class="m-back" data-a="closemodal"></div><div class="m-card ${cls}" role="dialog" aria-modal="true" aria-labelledby="m-title"><button class="icon-btn m-x" data-a="closemodal" aria-label="Close">${I.close}</button>${html}</div>`;
  modalEl.classList.add('on');
  modalEl.removeAttribute('aria-hidden');
  screenEl.inert = stageEl.inert = true;
  requestAnimationFrame(() => $(focusSel, modalEl)?.focus());
}

// Seat Twin: the seat in every other hall whose VIEW matches this one (twin.js matchView).
const twinRows = (list) => list.map((x) => `<li>
      <span class="twin-pct" aria-hidden="true"><b>${x.pct}%</b><small>match</small></span>
      <span class="twin-info"><b>${esc(x.L.theatre.short)} <span>· ${esc(hallName(x.L.hall))}</span></b><span>Seat <strong>${esc(x.seat.id)}</strong> · ${Math.round(x.seat.m.fov)}° wide · ${Math.round(x.seat.m.elevTop)}° up · ${sideText(x.seat.m)}${x.seat === x.L.director ? " · director's seat" : ''}</span></span>
      <button class="btn ghost sm" data-a="twin-go" data-tid="${x.L.theatre.id}" data-si="${x.L.screenIdx}" data-id="${esc(x.seat.id)}" data-pct="${x.pct}" aria-label="Sit in ${esc(x.L.theatre.short)} seat ${esc(x.seat.id)}, ${x.pct}% match">Sit here</button>
    </li>`).join('');
const sideText = (m) => (m.skew < 3 ? 'centre' : `${Math.round(m.skew)}° to the side`);
function openTwin(tid, si, id) {
  const t = theatreById(tid), Lx = getLayout(t, si), seat = Lx.byId.get(id);
  if (!seat) return;
  const twins = matchView(profileOf(seat), allLayouts(), { exclude: Lx }).slice(0, 8);
  const m = seat.m;
  openModal(`
    <p class="eyebrow">${I.twin} Only on Vyu</p>
    <h2 id="m-title">Seat Twin</h2>
    <p>${isMySeat(tid, si, id) ? 'Your seat' : 'The view from'} <b>${esc(t.short)} · ${esc(hallName(Lx.hall))} · ${esc(seat.id)}</b>, found again in the other ${allLayouts().length - 1} halls.</p>
    <ul class="twin-you" aria-label="Your view">
      <li><b>${Math.round(m.fov)}°</b> screen width</li><li><b>${Math.round(m.elevTop)}°</b> look-up</li><li><b>${m.skew < 3 ? 'Centre' : Math.round(m.skew) + '°'}</b> ${m.skew < 3 ? 'seat' : 'to the side'}</li>
      <li><b>${m.clearance == null || m.clearance >= 0.06 ? 'Clear' : 'Partly blocked'}</b> sightline</li>
    </ul>
    <ol class="twin-list">${twinRows(twins)}</ol>
    <p class="fine">We compare what your eyes get, not row letters: how wide the screen looks, how far you look up, how far off-centre you sit, whether heads in front block the picture and whether a balcony cuts it off.</p>`, 'twin-card', '.twin-list .btn');
}

// Seat DNA: no seat number needed. Two sliders describe the view; results re-rank live.
const DNA = { fov: 58, skew: 0, preset: null };
const fovWord = (f) => (f < 46 ? 'Relaxed' : f < 62 ? 'Balanced' : 'Big & close');
const skewWord = (k) => (k < 5 ? 'Centre' : k < 16 ? 'Slightly off-centre' : 'Aisle side');
function dnaResults() {
  const list = DNA.preset === 'director' ? directorSeats(allLayouts()) : matchView(dnaProfile(DNA.fov, DNA.skew), allLayouts());
  return list.slice(0, 8);
}
function openDna() {
  const my = mySeat();
  if (my && DNA.preset == null) { DNA.fov = Math.round(Math.min(80, Math.max(36, my.seat.m.fov))); DNA.skew = Math.round(Math.min(30, my.seat.m.skew)); }
  openModal(`
    <p class="eyebrow">${I.dna} Only on Vyu</p>
    <h2 id="m-title">Seat DNA</h2>
    <p>No seat number needed. Describe the view you like and we find it in all ${allLayouts().length} halls.</p>
    <div class="dna-presets" role="group" aria-label="Presets">${Object.entries(DNA_PRESETS).map(([k, v]) => `<button class="chip" data-a="dna-preset" data-id="${k}" aria-pressed="${DNA.preset === k}">${esc(v.label)}</button>`).join('')}</div>
    <div class="dna-slider"><label for="dna-fov">How big should the screen look? <b id="dna-fov-v">${DNA.fov}° · ${fovWord(DNA.fov)}</b></label>
      <input id="dna-fov" type="range" min="36" max="80" step="1" value="${DNA.fov}" aria-describedby="dna-fov-v"><span class="dna-ends" aria-hidden="true"><span>Relaxed</span><span>Balanced</span><span>Big & close</span></span></div>
    <div class="dna-slider"><label for="dna-skew">Where do you like to sit? <b id="dna-skew-v">${DNA.skew}° · ${skewWord(DNA.skew)}</b></label>
      <input id="dna-skew" type="range" min="0" max="30" step="1" value="${DNA.skew}" aria-describedby="dna-skew-v"><span class="dna-ends" aria-hidden="true"><span>Centre</span><span>Slightly off</span><span>Aisle</span></span></div>
    <p class="dna-sum" id="dna-sum" aria-live="polite"></p>
    <ol class="twin-list" id="dna-list"></ol>`, 'twin-card dna-card', '#dna-fov');
  updateDna();
}
function updateDna() {
  const list = $('#dna-list');
  if (!list) return;
  list.innerHTML = twinRows(dnaResults());
  $('#dna-fov-v').textContent = `${DNA.fov}° · ${fovWord(DNA.fov)}`;
  $('#dna-skew-v').textContent = `${DNA.skew}° · ${skewWord(DNA.skew)}`;
  $$('[data-a="dna-preset"]').forEach((b) => b.setAttribute('aria-pressed', DNA.preset === b.dataset.id));
  $('#dna-sum').textContent = DNA.preset === 'director' ? "Every hall's director's seat: two-thirds back, centred, where films are mixed." : `Best matches for a ${fovWord(DNA.fov).toLowerCase()} screen (${DNA.fov}°), ${skewWord(DNA.skew).toLowerCase()}.`;
}

function openHow() {
  openModal(`
    <h2 id="m-title">How Vyu scores a seat</h2>
    <p>Each hall is modelled in 3D from its seat map, screen size, row spacing, floor slope and balcony. For every seat we work out what your eyes actually see, against cinema standards:</p>
    <dl>
      <dt>Director's seat</dt><dd>The reference seat on the centre line about two-thirds of the way back, where a film's picture and sound are mixed and checked. It scores highest in every hall, and seats lose points the further they are from it (in, out, sideways or up in a balcony).</dd>
      <dt>Field of view</dt><dd>The angle the screen fills. SMPTE asks for at least 30°, THX about 36° from the back row and around 40° as ideal. Full marks from 36° up to about 62° (72° for IMAX, large-format and 70mm).</dd>
      <dt>Off-axis angle</dt><dd>Beyond about 8° to the side the picture starts to look skewed.</dd>
      <dt>Look-up angle</dt><dd>Elevation to the top edge. Above about 35° strains your neck.</dd>
      <dt>Sightline clearance</dt><dd>How far your line to the bottom of the screen clears the eyes of the person in front. Cinema designers aim for 100 mm or more; under 60 mm, heads block subtitles.</dd>
      <dt>Balcony overhang</dt><dd>In single screens, the share of the screen hidden by the balcony above the rear stalls.</dd>
    </dl>
    <button class="btn primary" data-a="closemodal">Got it</button>`);
}
function closeModal() {
  if (!modalEl.classList.contains('on')) return;
  modalEl.classList.remove('on');
  modalEl.setAttribute('aria-hidden', 'true');
  screenEl.inert = stageEl.inert = false;
  setTimeout(() => { if (!modalEl.classList.contains('on')) modalEl.innerHTML = ''; }, 300);
  modalReturn?.focus?.(); modalReturn = null;
}

// ───────────────────────── events ─────────────────────────
document.addEventListener('input', (e) => {
  if (e.target.id === 'dna-fov' || e.target.id === 'dna-skew') {
    DNA[e.target.id === 'dna-fov' ? 'fov' : 'skew'] = +e.target.value;
    DNA.preset = null;
    updateDna();
    return;
  }
  if (e.target.id !== 'q') return;
  S.q = e.target.value;
  refreshResults();
});
// the search form never navigates: results update as you type
document.addEventListener('submit', (e) => { if (e.target.matches('[data-search]')) { e.preventDefault(); $('#tlist .stretch')?.focus(); } });

function act(el) {
  const a = el.dataset.a, id = el.dataset.id;
  switch (a) {
    case 'home': go('home'); break;
    case 'saved': go('saved'); break;
    case 'filter': S.filter = id; refreshResults(); break;
    case 'theatre':
      if (id && id !== S.tid) { S.tid = id; S.si = 0; S.focus = null; S.zoom = null; }
      go('theatre');
      break;
    case 'screen':
      S.si = +id; S.focus = null; S.zoom = null;
      if (S.route === 'seats') { renderSeats(); if (isSplit()) { renderStage(); startScene(); } else warmHall(); } else render();
      break;
    case 'seats': go('seats', { zoom: null, top: -1, focus: null, open: false }); break;
    case 'how': openHow(); break;
    case 'twin': openTwin(el.dataset.tid || S.tid, el.dataset.si != null ? +el.dataset.si : S.si, el.dataset.id || S.focus); break;
    case 'twin-go': {
      const d = el.dataset;
      closeModal();
      go(isSplit() ? 'seats' : 'view', { tid: d.tid, si: +d.si, focus: d.id, open: false, zoom: null, aerial: false });
      toast(`Seat Twin: ${theatreById(d.tid).short} ${d.id}, ${d.pct}% match`);
      break;
    }
    case 'motion': toggleMotion(); break;
    case 'scrollfind': {
      $('#finder')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => $('#q')?.focus({ preventScroll: true }), reduceMotion.matches ? 0 : 450);
      break;
    }
    case 'homeview': S.homeView = el.dataset.id; S.keepHome = $('#screen').scrollTop; render(); $('#screen').scrollTop = S.keepHome; $(`[data-a="homeview"][data-id="${S.homeView}"]`)?.focus(); break;
    case 'myseat': {
      const v = { tid: S.tid, si: S.si, id: S.focus };
      const was = isMySeat(v.tid, v.si, v.id);
      setMySeat(was ? null : v);
      updateViewUI();
      if (isSplit()) renderSeats();
      toast(was ? 'Removed as your seat' : `${v.id} is now your seat. Every hall shows your twin seat.`);
      break;
    }
    case 'dna': DNA.preset = null; openDna(); break;
    case 'dna-preset': {
      const k = el.dataset.id, p = DNA_PRESETS[k];
      DNA.preset = k;
      if (p.fov != null) { DNA.fov = p.fov; DNA.skew = p.skew; const a = $('#dna-fov'), b = $('#dna-skew'); if (a) a.value = DNA.fov; if (b) b.value = DNA.skew; }
      updateDna();
      break;
    }
    case 'pickmine': {
      const list = $('#tlist');
      list?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      toast("Open a theatre, tap your usual seat, then tap 'This is my seat'");
      break;
    }
    case 'mytwins': { const my = mySeat(); if (my) openTwin(my.t.id, my.L.screenIdx, my.seat.id); break; }
    case 'clearmine': setMySeat(null); render(); toast('Your seat was cleared'); break;
    case 'trymotion': {
      const my = mySeat();
      if (!my) { $('#tlist')?.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' }); toast('Pick a theatre and a seat, then tap the phone icon at the top'); break; }
      go(isSplit() ? 'seats' : 'view', { tid: my.t.id, si: my.L.screenIdx, focus: my.seat.id, open: false, zoom: null, aerial: false });
      toast('Tap the phone icon at the top to look around by moving your phone');
      break;
    }
    case 'theme': setTheme(isDark() ? 'light' : 'dark'); render(); break;
    case 'closemodal': closeModal(); break;
    case 'heat': S.heat = !S.heat; S.keepScroll = $('.mapwrap')?.scrollLeft; renderSeats(); break;
    case 'zoom': S.zoom = Math.max(1, Math.min(4, S.zoom * (+el.dataset.d > 0 ? 1.3 : 1 / 1.3))); S.keepScroll = $('.mapwrap')?.scrollLeft; renderSeats(); break;
    case 'top': {
      const list = topSeats(L(), 5);
      S.top = (S.top + 1) % list.length;
      const s = list[S.top];
      S.flash = [s.id];
      if (S.route === 'view') { S.focus = s.id; updateViewUI(); view3d?.setFocus(s.id); view3d?.flyTo(s, false); toast(`#${S.top + 1} best: ${s.id}, score ${s.m.score}`); break; }
      S.focus = s.id; S.keepScroll = $('.mapwrap')?.scrollLeft; renderSeats();
      if (isSplit()) { if (!$('.seat-card')) renderStage(); else updateViewUI(); startScene(); }
      toast(`#${S.top + 1} best: ${s.id}, score ${s.m.score}. Tap again for the next.`);
      break;
    }
    case 'seat': chooseSeat(id); break;
    case 'sit': if (id) { if (S.route === 'theatre') go(isSplit() ? 'seats' : 'view', { focus: id, zoom: null, open: false }); else chooseSeat(id); } break;
    case 'change': if (isSplit()) go('theatre'); else go('seats'); break;
    case 'reload3d': location.reload(); break;
    case 'retry3d': { const b = $('#st-fail button'); if (b) { b.disabled = true; b.textContent = 'Loading…'; } startScene(); break; }
    case 'crowd': S.crowd = !S.crowd; view3d?.setAudience(S.crowd); updateViewUI(); toast(S.crowd ? 'Full house: see whose head is in front of you' : 'Empty hall'); break;
    case 'lights': S.lights = !S.lights; view3d?.setHouseLights(S.lights); updateViewUI(); toast(S.lights ? 'House lights up' : 'Lights down. Showtime.'); break;
    case 'content': S.content = (S.content + 1) % MOVIES.length; view3d?.setContent(MOVIES[S.content].id); toast(`On screen: ${MOVIES[S.content].title}`); break;
    case 'mode': S.aerial = el.dataset.m === 'aerial'; if (S.aerial && S.motion) { S.motion = false; view3d?.setMotionLook(false); } view3d?.setMode(S.aerial ? 'aerial' : 'seat', S.focus && L().byId.get(S.focus)); updateViewUI(); break;
    case 'reset': view3d?.resetOrbit(); break;
    case 'move': moveFocus(el.dataset.d); break;
    case 'sheet': case 'grip': S.open = !S.open; updateViewUI(); break;
    case 'save': {
      const key = { tid: S.tid, si: S.si, id: S.focus };
      if (isSaved(key.tid, key.si, key.id)) SAVED = SAVED.filter((x) => !(x.tid === key.tid && x.si === key.si && x.id === key.id));
      else { SAVED.push(key); toast(`Saved ${key.id} at ${T().short}`); }
      store.set(SAVED);
      updateViewUI();
      if (isSplit()) $(`.seat[data-id="${CSS.escape(key.id)}"]`)?.classList.toggle('sv', isSaved(key.tid, key.si, key.id));
      break;
    }
    case 'opensaved': go(isSplit() ? 'seats' : 'view', { tid: el.dataset.tid, si: +el.dataset.si, focus: id, open: false, zoom: null }); break;
  }
}
document.addEventListener('click', (e) => {
  if (e.target.closest('.skip')) { // skip link: jump past the app bar (or into the 3D controls on the seat-view page)
    e.preventDefault();
    const t = $('#main') || $('.seat-card button, .st-top button', stageEl);
    t?.focus();
    return;
  }
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled || !app.contains(el)) return;
  const route = S.route;
  act(el);
  restoreFocus(el, route);
  if (S.route === route) replaceUrl();
});
// Many actions re-render the control that triggered them; put keyboard focus back on its replacement.
function restoreFocus(el, route) {
  if (el.isConnected || S.route !== route || modalEl.classList.contains('on')) return;
  if (document.activeElement && document.activeElement !== document.body) return;
  let q = `[data-a="${el.dataset.a}"]`;
  for (const k of ['d', 'm', 'id']) if (el.dataset[k] != null && !(el.dataset.a === 'sit' && k === 'id')) q += `[data-${k}="${CSS.escape(el.dataset[k])}"]`;
  $(q, app)?.focus({ preventScroll: true });
}
// SVG map pins are focusable groups: Enter/Space activate them
document.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('.pin')) { e.preventDefault(); act(e.target); }
});

// Seat map: roving tabindex + arrow keys move between seats
screenEl.addEventListener('keydown', (e) => {
  const b = e.target.closest?.('.seat');
  const dir = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' }[e.key];
  if (!b || !dir) return;
  e.preventDefault(); e.stopPropagation();
  const Lx = L();
  const n = neighbour(Lx, Lx.byId.get(b.dataset.id), dir);
  const nb = n && $(`.seat[data-id="${CSS.escape(n.id)}"]`);
  if (!nb) return;
  b.tabIndex = -1; nb.tabIndex = 0; nb.focus(); nb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
});

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.metaKey || e.ctrlKey) return;
  if (modalEl.classList.contains('on')) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') { // keep focus inside the dialog
      const f = $$('button, input', modalEl), first = f[0], last = f.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    return;
  }
  if (exploring()) {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    if (map[e.key] && S.focus) { e.preventDefault(); moveFocus(map[e.key]); }
    if (e.key === 'v' || e.key === 'V') $('[data-a="mode"][aria-pressed="false"]', stageEl)?.click();
    if (e.key === 'Escape') { if (S.route === 'view') go('seats'); else go('theatre'); }
  } else if (e.key === 'Escape') {
    if (S.route === 'theatre' || S.route === 'saved') go('home');
  }
});

// Drag the seat-card handle (phones): up expands, down collapses; a tap toggles.
let dragY = null;
stageEl.addEventListener('pointerdown', (e) => { if (e.target.closest('.grip')) dragY = e.clientY; });
stageEl.addEventListener('pointerup', (e) => {
  if (dragY == null) return;
  const dy = e.clientY - dragY; dragY = null;
  if (Math.abs(dy) < 8) return; // a tap is handled by the click action
  const want = dy < 0;
  if (want !== S.open) { S.open = want; updateViewUI(); }
  e.preventDefault();
  stageEl.addEventListener('click', (ev) => ev.stopPropagation(), { capture: true, once: true });
});

// Tap (not drag) the 3D view to hide or show all controls: full-screen viewing.
let tapStart = null;
glEl.addEventListener('pointerdown', (e) => { tapStart = { x: e.clientX, y: e.clientY, t: performance.now() }; });
glEl.addEventListener('pointerup', (e) => {
  if (!tapStart || !exploring() || !S.focus) return;
  const moved = Math.hypot(e.clientX - tapStart.x, e.clientY - tapStart.y);
  if (moved < 8 && performance.now() - tapStart.t < 350) setFull(!S.full);
  tapStart = null;
});
function setFull(on) {
  S.full = on;
  app.classList.toggle('full', on);
  positionFloating();
}

let lastLayout = '';
function onResize() {
  const was = lastLayout, l = syncLayout();
  const wasSplit = was === 'split', nowSplit = l === 'split';
  lastLayout = l;
  if (was && wasSplit !== nowSplit && exploring()) {
    S.route = nowSplit ? 'seats' : S.focus ? 'view' : 'seats';
    render();
    replaceUrl();
  } else if (exploring()) { positionFloating(); if (S.route === 'seats') { S.zoom = null; S.keepScroll = null; renderSeats(); } }
}
let rz; window.addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(onResize, 120); });

lastLayout = layoutOf();
{
  const r = location.hash && parseUrl(location.hash);
  if (r) { Object.assign(S, r.patch); S.route = r.route; }
  navUrls[0] = r ? location.hash : '#/';
  history.replaceState({ vyu: 0 }, '', r ? location.hash : location.pathname + location.search);
}
render();
// warm up three.js and paint the hall textures in idle time, so opening a hall is instant
// (the bundle carries its own copy of assets.js, so use that one when the bundle was loaded)
setTimeout(() => getView().then(() => (sceneMod?.prepareAssets ? sceneMod : import('./assets.js'))).then((a) => a.prepareAssets()).catch(() => {}), 800);

// ───────────────────────── offline ─────────────────────────
// sw.js (generated by tools/build-sw.mjs) stores every file on the first visit, so the site then
// opens and runs with no internet. Off on localhost, where serve.py already works offline and a
// cache-first worker would hide edits; add ?sw to the URL to test it locally.
if ('serviceWorker' in navigator) {
  const local = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (!local || new URLSearchParams(location.search).has('sw')) {
    window.addEventListener('load', () => {
      const firstInstall = !navigator.serviceWorker.controller;
      navigator.serviceWorker.register('./sw.js').then((reg) => {
        const w = reg.installing || reg.waiting;
        if (!firstInstall || !w) return;
        w.addEventListener('statechange', () => { if (w.state === 'activated') toast('Vyu is saved for offline use'); });
      }).catch((e) => console.warn('Offline mode unavailable', e));
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
  }
}
