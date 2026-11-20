// Runs inside the app page (loaded by audit-views.mjs). Defines window.__audit(theatreId, hallIdx, opts).
// For each representative seat it renders the REAL hall (scene.js meshes) from the seat's eye, in flat colours:
//   mask pass  = only the screen, white  -> the screen's footprint in view
//   class pass = screen white, one class of objects black (person | seat | room), the rest hidden
//   all pass   = screen white, everything else black
// visible% = white pixels / footprint pixels. No ray-casting approximations.
(async () => {
  const THREE = await import('three');
  const { THEATRES } = await import('/js/data.js');
  const { getLayout, crowd } = await import('/js/layout.js');
  const { TheatreView } = await import('/js/scene.js');
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:0;top:0;width:400px;height:300px;opacity:0;pointer-events:none';
  document.body.appendChild(host);
  const view = new TheatreView(host);
  const W = 640, H = 300;
  const rt = new THREE.WebGLRenderTarget(W, H);
  const cam = new THREE.PerspectiveCamera(110, W / H, 0.3, 120) // near 0.3: software GL has a shallow depth buffer, z-fighting stripes at 0.05;
  const px = new Uint8Array(W * H * 4);
  const white = new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false });
  const black = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });
  white.side = black.side = THREE.DoubleSide;

  function classify(L) {
    const cls = new Map(); // object -> 'screen'|'person'|'seat'|'room'
    const person = new Set(view.audience.children);
    const seatGroup = view.audience.parent;
    view.scene.traverse((o) => {
      if (!(o.isMesh || o.isSprite || o.isLine || o.isPoints)) return;
      if (o.isMesh && o.material === view.screenMat) cls.set(o, 'screen');
      else if (person.has(o)) cls.set(o, 'person');
      else if (o.parent === seatGroup) cls.set(o, o === undefined ? 'x' : 'seat');
      else if (o.isSprite || o.isLine || o.isPoints || o.material?.transparent) cls.set(o, 'fx'); // light beam, dust, glow: not obstructions
      else cls.set(o, 'room');
    });
    return cls;
  }
  function render(cls, show, blackSet) {
    const saved = [];
    cls.forEach((c, o) => {
      saved.push([o, o.visible, o.material]);
      if (!o.isMesh || c === 'fx') { o.visible = false; return; }
      if (c === 'screen') { o.visible = true; o.material = white; }
      else if (blackSet.has(c)) { o.visible = true; o.material = black; }
      else o.visible = false;
    });
    view.renderer.setRenderTarget(rt);
    view.renderer.clear();
    view.renderer.render(view.scene, cam);
    view.renderer.readRenderTargetPixels(rt, 0, 0, W, H, px);
    view.renderer.setRenderTarget(null);
    saved.forEach(([o, v, m]) => { o.visible = v; if (m) o.material = m; });
    let n = 0; const out = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) if (px[i * 4] > 128) { out[i] = 1; n++; }
    return { n, out };
  }

  window.__audit = async (tid, hi, opts = {}) => {
    const t = THEATRES.find((x) => x.id === tid);
    const L = getLayout(t, hi);
    view.loadHall(L, crowd(L), null);
    const bg = view.scene.background; view.scene.background = new THREE.Color(0x777777);
    const sc = L.screen;
    // ---- pick seats
    const centre = (r) => r.seats.reduce((a, s) => (Math.abs(s.x) < Math.abs(a.x) ? s : a));
    const picks = new Map();
    const add = (s, why) => { if (s && !picks.has(s.id)) picks.set(s.id, { s, why }); else if (s) picks.get(s.id).why += '+' + why; };
    add(L.director, 'director');
    add(centre(L.rows[0]), 'front');
    add(centre(L.rows.at(-1)), 'back');
    const groups = new Map();
    L.rows.forEach((r) => { const k = r.section + '/' + r.tier; if (!groups.has(k)) groups.set(k, []); groups.get(k).push(r); });
    groups.forEach((rs, k) => {
      const mid = rs[Math.floor(rs.length / 2)];
      add(centre(rs[0]), `${k}:first`); add(centre(mid), `${k}:mid`); add(centre(rs.at(-1)), `${k}:last`);
      const sorted = mid.seats.slice().sort((a, b) => a.x - b.x);
      add(sorted[0], `${k}:mid-edgeL`); add(sorted.at(-1), `${k}:mid-edgeR`);
      add(sorted[Math.floor(sorted.length * 0.25)], `${k}:mid-q1`);
    });
    // a sweep across one row at ~60% depth of the stalls (neighbour consistency)
    const sweepRow = L.sections[0].rows[Math.floor(L.sections[0].rows.length * 0.6)];
    for (let q = 0; q <= 6; q++) add(sweepRow.seats[Math.round((sweepRow.seats.length - 1) * q / 6)], 'sweep');
    // a sweep down the centre of the stalls
    const stalls = L.sections[0].rows;
    for (let q = 0; q <= 8; q++) add(centre(stalls[Math.round((stalls.length - 1) * q / 8)]), 'col');
    if (opts.extra) opts.extra.forEach((id) => add(L.byId.get(id), 'extra'));

    const cls = classify(L);
    const res = [];
    for (const { s, why } of picks.values()) {
      view.setFocus(s.id);
      view.avatar.visible = false;
      cam.position.set(s.x, s.eyeY, s.z + 0.11);
      cam.up.set(0, 1, 0);
      cam.lookAt(0, sc.midY, 0);
      cam.updateMatrixWorld(true);
      const mask = render(cls, null, new Set());
      const all = render(cls, null, new Set(['person', 'seat', 'room']));
      const pers = render(cls, null, new Set(['person']));
      const seat = render(cls, null, new Set(['seat']));
      const room = render(cls, null, new Set(['room']));
      const f = (r) => +(100 * (1 - r.n / mask.n)).toFixed(1);
      res.push({
        id: s.id, why, tier: s.tier, sec: s.row.section, row: s.row.idx, score: s.m.score, label: s.m.label,
        clr: s.m.clearance == null ? null : Math.round(s.m.clearance * 1000),
        maskPct: +(100 * mask.n / (W * H)).toFixed(1),
        hidden: f(all), person: f(pers), seat: f(seat), room: f(room),
      });
    }
    view.scene.background = bg;
    return { id: tid, hall: hi, name: (t.screens || [t.hall])[hi].name, seats: res };
  };
  // false-colour picture from a seat (screen white, people red, seats blue, room green): window.__shot(tid, hi, seatId) -> PNG data URL
  window.__shot = async (tid, hi, sid, wide = 1) => {
    const t = THEATRES.find((x) => x.id === tid), L = getLayout(t, hi);
    view.loadHall(L, crowd(L), null);
    const s = L.byId.get(sid), sc = L.screen, cls = classify(L);
    view.setFocus(sid); view.avatar.visible = false;
    cam.fov = wide ? 110 : 60; cam.near = 0.3; cam.far = 120; cam.updateProjectionMatrix();
    cam.position.set(s.x, s.eyeY, s.z + 0.11); cam.up.set(0, 1, 0); cam.lookAt(0, sc.midY, 0); cam.updateMatrixWorld(true);
    const mats = { screen: new THREE.MeshBasicMaterial({ color: 0xffffff, side: 2 }), person: new THREE.MeshBasicMaterial({ color: 0xff3030, side: 2 }), seat: new THREE.MeshBasicMaterial({ color: 0x3060ff, side: 2 }), room: new THREE.MeshBasicMaterial({ color: 0x20a040, side: 2 }) };
    const saved = [];
    cls.forEach((c, o) => { saved.push([o, o.visible, o.material]); if (!o.isMesh || c === 'fx') o.visible = false; else o.material = mats[c]; });
    const bg = view.scene.background; view.scene.background = new THREE.Color(0x222222);
    view.renderer.setRenderTarget(rt); view.renderer.render(view.scene, cam); view.renderer.readRenderTargetPixels(rt, 0, 0, W, H, px); view.renderer.setRenderTarget(null);
    saved.forEach(([o, v, m]) => { o.visible = v; if (m) o.material = m; });
    view.scene.background = bg; cam.fov = 110; cam.updateProjectionMatrix();
    const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = ((H - 1 - y) * W + x) * 4, b = (y * W + x) * 4; for (let k = 0; k < 4; k++) im.data[b + k] = px[a + k]; }
    g.putImageData(im, 0, 0); return c.toDataURL('image/png');
  };
  window.__view = view; window.__classify = classify; window.__THREE = THREE;
  window.__ready = true;
})();
