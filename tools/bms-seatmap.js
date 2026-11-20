// BookMyShow seat-map reader for adding theatres to Vyu. NOT part of the website (not served).
//
// How it works: BookMyShow draws its seat layout with Konva. Every seat is a Konva group whose
// `seatObj` holds the row letter, the printed seat number, the price class and the price, so the
// layout can be read exactly (no screenshots, no OCR). This script runs inside a BookMyShow page in
// a browser (the desktop app's browser pane): paste it once into localStorage, then eval it per page.
//
//   1. On any in.bookmyshow.com page:   localStorage.__vyu = `<this file's text>`;
//   2. Open https://in.bookmyshow.com/cinemas/hyderabad/x/buytickets/<VENUECODE>/<YYYYMMDD>
//      then:  eval(localStorage.__vyu); V.start('<VENUECODE>')        // counts every screen in hidden frames
//             eval(localStorage.__vyu); await V.waitGo()              // when done, opens the biggest screen
//      on the seat-layout page:  eval(localStorage.__vyu); await V.save()   // stores rows in localStorage.__vyuAll
//   3. Export localStorage.__vyuAll (it is JSON keyed by venue code) to halls.json and run
//      tools/bms-to-vyu.py to turn it into data.js / info.js entries.
// Venue codes, names and coordinates are in the page source of https://in.bookmyshow.com/hyderabad/cinemas
// (VenueCode, VenueName, VenueLatitude, VenueLongitude). Nothing is ever booked: only the
// "Continue" (age notice) and "Select Seats" (seat count) prompts are dismissed.
window.V = {
  sleep: (ms) => new Promise((r) => setTimeout(r, ms)),

  // buytickets page: every screen with its shows, attributes and price classes (from the page's own JSON)
  screens() {
    const html = document.documentElement.outerHTML, out = {};
    for (const m of html.matchAll(/"SessionId":"(\d+)"/g)) {
      let s = m.index, dep = 0; for (; s > 0; s--) { const c = html[s]; if (c === '}') dep++; else if (c === '{') { if (!dep) break; dep--; } }
      let e = m.index, d2 = 0; for (; e < html.length; e++) { const c = html[e]; if (c === '{') d2++; else if (c === '}') { if (!d2) break; d2--; } }
      const o = html.slice(s, e + 1);
      const g = (k) => (o.match(new RegExp('"' + k + '":"([^"]*)"')) || [])[1] || '';
      const ev = [...html.slice(Math.max(0, m.index - 60000), m.index).matchAll(/"EventCode":"(ET\d+)"/g)].at(-1)?.[1];
      const scr = g('ScreenName') || '?';
      (out[scr] ||= { screen: scr, n: 0, attrs: new Set(), cats: new Set(), sess: [] });
      out[scr].n++; if (g('Attributes')) out[scr].attrs.add(g('Attributes'));
      [...o.matchAll(/"PriceDesc":"([^"]*)"/g)].forEach((x) => out[scr].cats.add(x[1]));
      out[scr].sess.push(ev + '/' + m[1] + '/' + g('ShowDateCode'));
    }
    return Object.values(out).map((x) => ({ screen: x.screen, n: x.n, attrs: [...x.attrs].join(','), cats: [...x.cats].join('|'), sess: [...new Set(x.sess)] }));
  },
  // which screens to compare: a recognised large format alone, else all of them
  plan(code) {
    const sc = V.screens(); const big = sc.find((x) => /IMAX|PXL|EPIQ|\bICE\b|MACRO ?XE|ONYX|P\[XL\]/i.test(x.screen + ' ' + x.attrs));
    const list = (big ? [big] : sc).map((x) => { const [ev, sid, date] = x.sess[0].split('/'); return { screen: x.screen, attrs: x.attrs, cats: x.cats, url: '/movies/hyderabad/seat-layout/' + ev + '/' + code + '/' + sid + '/' + date }; });
    localStorage.__vyuPlan = JSON.stringify({ code, all: sc.map((x) => x.screen + (x.attrs ? '[' + x.attrs + ']' : '')), list, counts: {} });
    return list.length;
  },

  // exact seats from BookMyShow's own seat objects (Konva stage 0)
  konva(win = window) {
    const K = win.Konva; if (!K || !K.stages || !K.stages[0]) return null;
    const st = K.stages[0]; const groups = st.find('Group').filter((g) => g.attrs.seatObj);
    if (!groups.length) return null;
    const seats = groups.map((g) => { const o = g.attrs.seatObj; const r = g.findOne('Rect') || g; const p = r.getAbsolutePosition(st); const sc = r.getAbsoluteScale ? r.getAbsoluteScale().x : 1;
      return { x: p.x + (r.width ? r.width() * sc / 2 : 0), y: p.y, row: o.rowNumber, num: +o.displaySeatNumber || +o.seatNumber, area: o.areaCode, price: +o.curPrice }; });
    const labels = st.find('Text').filter((t) => /₹|Rs\.?\s?\d/.test(t.text())).map((t) => ({ y: t.getAbsolutePosition(st).y, text: t.text().replace(/\s+/g, ' ').trim() })).sort((a, b) => a.y - b.y);
    return { seats, labels };
  },
  // rows top-to-bottom in data.js grid syntax: '## <price label>' per class, "'-'" walkways,
  // "'B:3/26  ..ooo...'" (first number per block when it isn't a plain 1..n run), 'RTL ' when seat 1 is on the right
  rowsOut(K) {
    const S = K.seats, map = new Map();
    S.forEach((s) => { const k = s.area + '|' + s.row + '|' + Math.round(s.y / 4); (map.get(k) || map.set(k, []).get(k)).push(s); });
    const rows = [...map.values()].map((a) => ({ y: a.reduce((t, s) => t + s.y, 0) / a.length, s: a.sort((p, q) => p.x - q.x) })).sort((a, b) => a.y - b.y);
    const dx = []; rows.forEach((r) => { for (let i = 1; i < r.s.length; i++) dx.push(r.s[i].x - r.s[i - 1].x); }); dx.sort((a, b) => a - b);
    const mode = dx[Math.floor(dx.length * 0.3)]; const close = dx.filter((d) => Math.abs(d - mode) < mode * 0.12); const pitch = close.reduce((a, b) => a + b, 0) / close.length;
    const x0 = Math.min(...S.map((s) => s.x));
    const dy = rows.slice(1).map((r, i) => r.y - rows[i].y).sort((a, b) => a - b); const rowGap = dy[Math.floor(dy.length / 2)] || 1;
    let lastArea = null; const out = [], warn = [];
    rows.forEach((r, i) => {
      const cols = r.s.map((s) => (s.x - x0) / pitch); if (cols.some((c) => Math.abs(c - Math.round(c)) > 0.2)) warn.push(r.s[0].row + ': off-grid');
      const ci = cols.map(Math.round); let cells = ''; for (let c = 0; c <= Math.max(...ci); c++) cells += ci.includes(c) ? 'o' : '.';
      const blocks = []; r.s.forEach((s, k) => { if (!k || ci[k] - ci[k - 1] > 1) blocks.push([]); blocks.at(-1).push(s.num); });
      const flat = r.s.map((s) => s.num), inc = flat.length < 2 || flat.at(-1) > flat[0];
      const dirBlocks = inc ? blocks : blocks.slice().reverse().map((b) => b.slice().reverse());
      let ok = true, expect = null; const starts = [];
      dirBlocks.forEach((b) => { for (let k = 1; k < b.length; k++) if (b[k] !== b[k - 1] + 1) ok = false; starts.push(b[0] !== expect ? b[0] : ''); expect = b.at(-1) + 1; });
      if (!ok) warn.push(r.s[0].row + ': non-consecutive ' + flat.join(','));
      while (starts.length > 1 && starts.at(-1) === '') starts.pop();
      const spec = starts.length === 1 ? (starts[0] === 1 ? '' : ':' + starts[0]) : ':' + starts.join('/');
      const area = r.s[0].area + '@' + r.s[0].price, gap = i ? (r.y - rows[i - 1].y) / rowGap : 0;
      if (area !== lastArea) { const lab = K.labels.filter((l) => l.y < r.y).at(-1); out.push('## ' + (lab ? lab.text : '?') + '  [' + area + ']'); lastArea = area; }
      else if (gap > 1.5) out.push("'-'");
      out.push((inc ? '' : 'RTL ') + "'" + r.s[0].row + spec + '  ' + cells + "'");
    });
    return { n: S.length, warn, out };
  },

  // count seats of one seat-layout URL in a hidden same-origin frame
  inFrame: (url, timeout = 25000) => new Promise((res) => {
    const f = document.createElement('iframe'); f.style.cssText = 'position:fixed;left:0;top:0;width:1280px;height:1500px;opacity:0;pointer-events:none;z-index:-1';
    const t0 = Date.now(); f.src = url; document.body.appendChild(f); let last = -1;
    const t = setInterval(() => {
      if (Date.now() - t0 > timeout) { clearInterval(t); f.remove(); return res(0); }
      try { const w = f.contentWindow; if (!w || w.document.readyState !== 'complete') return;
        const K = V.konva(w), n = K ? K.seats.length : 0;
        if (!n) { const b = [...w.document.querySelectorAll('button')].find((x) => /^(Continue|Accept)$/i.test(x.textContent.trim())); if (b) b.click(); return; }
        if (n === last) { clearInterval(t); f.remove(); res(n); } last = n;
      } catch (e) { /* frame still loading */ }
    }, 800);
  }),
  async countAll(code) {
    V.plan(code); const P = JSON.parse(localStorage.__vyuPlan);
    for (let i = 0; i < P.list.length; i++) P.counts[i] = P.list.length === 1 ? 1 : await V.inFrame(P.list[i].url);
    let bi = 0; for (const [i, n] of Object.entries(P.counts)) if (+n > +(P.counts[bi] || 0)) bi = +i;
    P.best = bi; localStorage.__vyuPlan = JSON.stringify(P);
    return P.list.map((x, i) => x.screen + '=' + P.counts[i]).join(', ') + ' => ' + P.list[bi].screen;
  },
  start(code) { localStorage.__vyuRes = 'running'; V.countAll(code).then((r) => (localStorage.__vyuRes = r), (e) => (localStorage.__vyuRes = 'ERR ' + e)); return 'started'; },
  async waitGo() {
    for (let k = 0; k < 38 && localStorage.__vyuRes === 'running'; k++) await V.sleep(1000);
    const r = localStorage.__vyuRes; if (r === 'running') return 'still running';
    const P = JSON.parse(localStorage.__vyuPlan); if (location.pathname !== P.list[P.best].url) location.href = P.list[P.best].url; return r;
  },
  async save() {
    const P = JSON.parse(localStorage.__vyuPlan); let K = null;
    for (let k = 0; k < 30 && !(K = V.konva()); k++) { const b = [...document.querySelectorAll('button')].find((x) => /^(Continue|Accept)$/i.test(x.textContent.trim())); if (b) b.click(); await V.sleep(600); }
    if (!K) return P.code + ': NO SEAT DATA';
    const R = V.rowsOut(K), b = P.list[P.best], all = JSON.parse(localStorage.__vyuAll || '{}');
    all[P.code] = { screen: b.screen, attrs: b.attrs, cats: b.cats, url: b.url, screens: P.list.map((x, i) => x.screen + (x.attrs ? '[' + x.attrs + ']' : '') + '=' + (P.counts[i] ?? '?')), allScreens: P.all, n: R.n, warn: R.warn, rows: R.out };
    localStorage.__vyuAll = JSON.stringify(all);
    return P.code + ': ' + b.screen + ' ' + R.n + ' seats' + (R.warn.length ? ' WARN ' + R.warn.join('; ') : '') + ' | saved ' + Object.keys(all).length;
  },
};
