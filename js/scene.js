// 3D auditorium renderer: builds the hall from layout data and flies the camera to any
// seat's eye position, or orbits around it in aerial view.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TIERS } from './data.js';
import { drawMovie } from './movies.js';
import { rng } from './layout.js';
import { configureAssets, getAssets, surface, fabric } from './assets.js';

const V3 = THREE.Vector3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeOut = (k) => 1 - Math.pow(1 - k, 3);
const smooth = (a, b, k) => { const t = clamp((k - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const DEG = Math.PI / 180;
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
const SOFT = new RoundedBoxGeometry(1, 1, 1, 3, 0.3); // soft unit box for bodies
const HEAD = new THREE.SphereGeometry(0.1, 28, 20);
const SHARED = new Set([UNIT_BOX, SOFT, HEAD]);
const UP = new V3(0, 1, 0);
const M4 = new THREE.Matrix4();

function disposeTree(obj) {
  obj.traverse((o) => {
    if (o.geometry && !SHARED.has(o.geometry)) o.geometry.dispose();
    if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
      // cloned (tiled) maps belong to this hall; shared base textures are kept
      ['map', 'normalMap'].forEach((k) => { if (m[k]?.userData?.tiled) m[k].dispose(); });
      m.dispose();
    });
  });
}
// Phone motion sensor -> camera orientation (same maths as three's old DeviceOrientationControls):
// alpha/beta/gamma are the phone's compass, front-back tilt and left-right tilt; the extra turns map
// "phone screen facing you" onto "camera looking forward" and undo the screen's rotation.
const ZEE = new V3(0, 0, 1), EUL = new THREE.Euler(), Q0 = new THREE.Quaternion(), Q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));
function deviceQuat(q, a, b, g, orient) {
  EUL.set(b * DEG, a * DEG, -g * DEG, 'YXZ');
  q.setFromEuler(EUL).multiply(Q1).multiply(Q0.setFromAxisAngle(ZEE, -orient * DEG));
  return q;
}
const screenAngle = () => (screen.orientation && typeof screen.orientation.angle === 'number' ? screen.orientation.angle : +window.orientation || 0);
const wrapPi = (r) => Math.atan2(Math.sin(r), Math.cos(r));

const lookQuat = (from, to, up = UP) => new THREE.Quaternion().setFromRotationMatrix(M4.lookAt(from, to, up));

// Device tier: phones, tablets and low-memory machines get the light path.
function detectTier() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const mem = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  return coarse || mem <= 4 || cores <= 2 ? 'low' : 'high';
}

export class TheatreView {
  constructor(el) {
    this.el = el;
    this.tier = detectTier();
    this.low = this.tier === 'low';
    this.reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Performance (no visual change):
    // - High tier anti-aliases inside the composer's 4× MSAA target; the canvas only receives a
    //   full-screen quad, so a multisampled canvas would be pure extra fill and resolve work.
    // - preserveDrawingBuffer forces a full-screen copy every frame (costly in Firefox). snapshot()
    //   reads the canvas right after draw() in the same task, which works without it.
    const r = (this.renderer = new THREE.WebGLRenderer({ antialias: this.low, preserveDrawingBuffer: false, powerPreference: 'high-performance' }));
    this.maxDpr = Math.min(window.devicePixelRatio || 1, this.low ? 1.5 : 2);
    this.dpr = this.maxDpr;
    r.setPixelRatio(this.dpr);
    r.toneMapping = THREE.ACESFilmicToneMapping;
    r.toneMappingExposure = 1.25;
    r.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(r.domElement);
    configureAssets({ anisotropy: r.capabilities.getMaxAnisotropy(), low: this.low });

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0809);
    this.camera = new THREE.PerspectiveCamera(60, 1, 0.05, 400);

    // High tier: bloom via a composer whose render target keeps 4× MSAA (otherwise the
    // composer silently drops anti-aliasing and everything looks soft). Low tier renders
    // straight to the canvas with the browser's native anti-aliasing.
    if (!this.low) {
      const rt = new THREE.WebGLRenderTarget(1, 1, { samples: 4, type: THREE.HalfFloatType });
      this.composer = new EffectComposer(r, rt);
      this.composer.addPass(new RenderPass(this.scene, this.camera));
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.26, 0.5, 0.9);
      this.composer.addPass(this.bloom);
      this.composer.addPass(new OutputPass());
    }

    this.mc = document.createElement('canvas');
    this.mcW = this.low ? 1024 : 2048;
    this.mc.width = this.mcW; this.mc.height = this.mcW / 2;
    this.mctx = this.mc.getContext('2d');
    this.tex = new THREE.CanvasTexture(this.mc);
    this.sampler = document.createElement('canvas');
    this.sampler.width = this.sampler.height = 4;
    this.sctx = this.sampler.getContext('2d', { willReadFrequently: true });

    // lighting: screen spill + "house lights" that dim smoothly
    this.hemi = new THREE.HemisphereLight(0xfff1e2, 0x3a2a2a, 1.2);
    this.screenLight = new THREE.DirectionalLight(0xffffff, 1.6);
    this.fill = new THREE.DirectionalLight(0xffe2c4, 0.8);
    this.scene.add(this.hemi, this.screenLight, this.screenLight.target, this.fill, this.fill.target);
    this.ceilingLights = [0, 1, 2, 3].map(() => { const p = new THREE.PointLight(0xffd6a8, 40, 0, 2); this.scene.add(p); return p; });
    this.house = 1;
    this.houseTarget = 1;

    this.camPos = new V3(0, 20, 20);
    this.camQuat = new THREE.Quaternion();
    this.tween = null;
    this.mode = 'seat';
    this.look = { yaw: 0, pitch: 0, ty: 0, tp: 0, drag: false };
    this.orbit = { yaw: 0, pitch: 32, dist: 5, tYaw: 0, tPitch: 32, tDist: 5 };
    this.frame = 0;
    this.fastFrames = 0;
    this.slowCheck = 0;
    this.t0 = performance.now();
    this.bindInput(el);

    document.addEventListener('visibilitychange', () => { this.last = performance.now(); });
    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(el);
    this.loop = this.loop.bind(this);
  }

  // ---------- input: head-look in seat view, orbit + zoom in aerial view ----------
  bindInput(el) {
    const pts = new Map();
    let pinch0 = 0;
    el.addEventListener('pointerdown', (e) => {
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { el.setPointerCapture(e.pointerId); } catch {}
      if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); }
      this.look.drag = true;
      this.interact = performance.now();
    });
    el.addEventListener('pointermove', (e) => {
      const p = pts.get(e.pointerId);
      if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY;
      this.interact = performance.now();
      if (pts.size === 2 && this.mode === 'aerial') {
        const [a, b] = [...pts.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (pinch0 > 0) this.zoomBy(pinch0 / d);
        pinch0 = d;
        return;
      }
      if (this.mode === 'aerial') {
        this.orbit.tYaw -= dx * 0.35;
        this.orbit.tPitch = clamp(this.orbit.tPitch + dy * 0.25, 12, 70);
      } else {
        this.look.ty = clamp(this.look.ty + dx * 0.22, -75, 75);
        this.look.tp = clamp(this.look.tp + dy * 0.18, -40, 40);
      }
    });
    const end = (e) => { pts.delete(e.pointerId); if (!pts.size) this.look.drag = false; pinch0 = 0; };
    el.addEventListener('pointerup', end);
    el.addEventListener('pointercancel', end);
    el.addEventListener('wheel', (e) => {
      if (this.mode !== 'aerial') return;
      e.preventDefault();
      this.zoomBy(Math.exp(e.deltaY * 0.0012));
      this.interact = performance.now();
    }, { passive: false });
    el.addEventListener('dblclick', () => { if (this.mode === 'aerial') this.resetOrbit(); });
  }

  zoomBy(f) { this.orbit.tDist = clamp(this.orbit.tDist * f, 2, 14); }
  defaultDist() { return clamp(3.6 + (this.L ? this.L.depth : 10) * 0.07, 4, 7); }
  resetOrbit() { Object.assign(this.orbit, { tYaw: 0, tPitch: 32, tDist: this.defaultDist() }); this.interact = performance.now(); }

  resize() {
    const w = this.el.clientWidth, h = this.el.clientHeight;
    if (!w || !h) return;
    this.interact = performance.now(); // render every frame while the window is being resized (no stale/black frames)
    this.renderer.setSize(w, h);
    this.composer?.setSize(w, h);
    const aspect = w / h;
    this.camera.aspect = aspect;
    // Human binocular field ≈ 120° wide: a wide ~105° horizontal lens, capped at 94° vertical.
    const vfov = (2 * Math.atan(Math.tan((105 * Math.PI) / 360) / aspect) * 180) / Math.PI;
    this.camera.fov = clamp(vfov, 50, 94);
    const insetY = Math.min(this.inset || 0, h * 0.5);
    const insetX = Math.min(this.insetX || 0, w * 0.5);
    if (insetX > 0) this.camera.setViewOffset(w + insetX, h, insetX, 0, w, h);
    else if (insetY > 0) this.camera.setViewOffset(w, h + insetY, 0, insetY, w, h);
    else this.camera.clearViewOffset();
    this.camera.updateProjectionMatrix();
  }

  // px = size of the seat card; horizontal = card is a side panel
  setInset(px, horizontal = false) {
    const y = horizontal ? 0 : Math.round(px * 0.8);
    const x = horizontal ? Math.round(px) : 0;
    if (y === this.inset && x === this.insetX) return;
    this.inset = y; this.insetX = x;
    this.resize();
  }

  setActive(on) {
    if (on === this.active) return;
    this.active = on;
    if (on) { this.resize(); this.last = performance.now(); requestAnimationFrame(this.loop); }
  }

  setHouseLights(on) { this.houseTarget = on ? 1 : 0.12; }
  setContent(id) { this.movieId = id; }

  // ---------- hall ----------
  loadHall(L, crowdSet, contentId) {
    if (contentId) this.movieId = contentId;
    if (this.L === L && this.hall) return;
    if (this.hall) { this.scene.remove(this.hall); disposeTree(this.hall); }
    this.L = L;
    this.orbit.dist = this.orbit.tDist = this.defaultDist();
    const g = (this.hall = new THREE.Group());
    this.scene.add(g);
    const sc = L.screen;
    const { halfW, backZ, height: H } = L.room;
    const low = this.low;
    const std = (c, rough = 0.92, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: rough, ...extra });
    const glow = (c) => new THREE.MeshBasicMaterial({ color: c, toneMapped: false });
    const add = (geo, mat, pos, rot) => { const m = new THREE.Mesh(geo, mat); m.position.set(...pos); if (rot) m.rotation.set(...rot); g.add(m); return m; };
    const box = (mat, size, pos) => { const m = add(UNIT_BOX, mat, pos); m.scale.set(...size); return m; };

    // the film on screen, at 2K (1K on low-power devices)
    this.mc.width = this.mcW;
    this.mc.height = Math.round(this.mcW / (sc.w / sc.h));
    this.tex.dispose();
    this.tex = new THREE.CanvasTexture(this.mc);
    this.tex.colorSpace = THREE.SRGBColorSpace;
    this.tex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();

    const A = (this.assets = getAssets());
    const single = !!L.theatre.single;
    const goldM = std(0xc9a24a, 0.32, { metalness: 0.75 });
    const darkM = std(0x0d0b0c, 1);
    const ceilM = std(single ? 0x7a6850 : 0x2d2226);
    const depth = backZ + 0.4;
    const wallMat = (w) => (single ? surface(A.plaster, w, H) : fabric(A.velvet, w, H, { low }));
    add(new THREE.PlaneGeometry(depth, H), wallMat(depth), [-halfW, H / 2, depth / 2 - 0.4], [0, Math.PI / 2, 0]);
    add(new THREE.PlaneGeometry(depth, H), wallMat(depth), [halfW, H / 2, depth / 2 - 0.4], [0, -Math.PI / 2, 0]);
    add(new THREE.PlaneGeometry(halfW * 2, H), wallMat(halfW * 2), [0, H / 2, backZ], [0, Math.PI, 0]);
    add(new THREE.PlaneGeometry(halfW * 2, H), darkM, [0, H / 2, -0.4]);
    add(new THREE.PlaneGeometry(halfW * 2, depth), ceilM, [0, H, depth / 2 - 0.4], [Math.PI / 2, 0, 0]);

    // teak pilasters, gold picture-rail, warm cove strips
    const woodM = surface(A.wood, 0.34, H, { roughness: 0.55 });
    const pil = new RoundedBoxGeometry(0.16, H, 0.36, 2, 0.04);
    for (let z = 1.8; z < backZ - 0.8; z += 2.4) [-1, 1].forEach((d) => add(pil, woodM, [d * (halfW - 0.08), H / 2, z]));
    [-1, 1].forEach((d) => box(goldM, [0.1, 0.1, backZ], [d * (halfW - 0.05), H - 0.9, backZ / 2]));
    this.coveMat = glow(0xffb070);
    [-1, 1].forEach((d) => box(this.coveMat, [0.05, 0.05, backZ], [d * (halfW - 0.1), H - 0.25, backZ / 2]));

    // ceiling: fans in older halls, recessed downlights in multiplexes
    this.fans = [];
    if (single) {
      const bladeM = std(0xcfc3a8, 0.5), hubM = std(0x3a3028, 0.4, { metalness: 0.4 });
      const blade = new RoundedBoxGeometry(0.9, 0.016, 0.16, 2, 0.006);
      const hubG = new THREE.CylinderGeometry(0.12, 0.14, 0.12, 20);
      const rodG = new THREE.CylinderGeometry(0.018, 0.018, 0.6, 8);
      for (let z = 3.5; z < backZ - 1.5; z += 4.8) {
        [-0.5, 0.5].forEach((fx) => {
          const grp = new THREE.Group();
          grp.position.set(fx * halfW, H - 0.9, z);
          const rod = new THREE.Mesh(rodG, hubM); rod.position.y = 0.36; grp.add(rod);
          grp.add(new THREE.Mesh(hubG, hubM));
          for (let k = 0; k < 3; k++) {
            const a = (k * Math.PI * 2) / 3;
            const bl = new THREE.Mesh(blade, bladeM);
            bl.position.set(Math.cos(a) * 0.55, 0, Math.sin(a) * 0.55); bl.rotation.y = -a;
            grp.add(bl);
          }
          g.add(grp); this.fans.push(grp);
        });
      }
    } else {
      const dl = [];
      for (let z = 2.5; z < backZ - 1; z += 3) [-0.55, 0, 0.55].forEach((fx) => dl.push([fx * halfW, H - 0.02, z]));
      const dm = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 24), glow(0xfff0d8), dl.length);
      const o3 = new THREE.Object3D();
      dl.forEach((q, i) => { o3.position.set(...q); o3.updateMatrix(); dm.setMatrixAt(i, o3.matrix); });
      g.add(dm);
    }

    // floor: carpeted apron + one riser per row (carpet tiled at world scale)
    const floorM = (w, d) => surface(A.carpet, w, d, { roughness: 0.96 });
    box(floorM(halfW * 2, L.firstEdge + 0.4), [halfW * 2, 0.2, L.firstEdge + 0.4], [0, -0.1, L.firstEdge / 2 - 0.2]);
    box(darkM, [halfW * 2 - 1, 0.55, 2.2], [0, 0.275, 1.1]); // stage
    const rowFloorM = floorM(halfW * 2, 1.1);
    L.rows.forEach((row) => {
      const bottom = row.section === 0 ? -0.2 : L.balcony.undersideY;
      const hgt = row.floorY - bottom;
      box(rowFloorM, [halfW * 2, hgt, row.pitch + 0.002], [0, bottom + hgt / 2, row.z]);
      box(this.coveMat, [halfW * 2, 0.012, 0.012], [0, row.floorY + 0.006, row.z - row.pitch / 2 - 0.004]);
    });
    const stall = L.sections[0];
    if (stall.endZ < backZ) {
      const dd = backZ - stall.endZ, hgt = stall.rows.at(-1).floorY + 0.2;
      box(rowFloorM, [halfW * 2, hgt, dd], [0, hgt / 2 - 0.2, stall.endZ + dd / 2]);
    }
    if (L.balcony) {
      const b = L.balcony;
      const bs = L.sections.find((s) => s.balcony);
      const tailD = backZ - bs.endZ;
      if (tailD > 0) { const hgt = bs.rows.at(-1).floorY - b.undersideY; box(rowFloorM, [halfW * 2, hgt, tailD], [0, b.undersideY + hgt / 2, bs.endZ + tailD / 2]); }
      box(rowFloorM, [halfW * 2, 0.35, bs.startZ - b.parapetZ + 0.2], [0, b.floorY - 0.175, (b.parapetZ + bs.startZ) / 2]);
      add(new RoundedBoxGeometry(halfW * 2, 1.0, 0.24, 2, 0.05), std(0x4a3236, 0.7), [0, b.floorY + 0.4, b.parapetZ]);
      box(glow(0xffa55a), [halfW * 2, 0.03, 0.02], [0, b.floorY + 0.25, b.parapetZ - 0.13]);
      for (let x = -halfW + 2; x < halfW - 1; x += 3) add(new THREE.CylinderGeometry(0.12, 0.12, 0.02, 20), glow(0xffe3c0), [x, b.undersideY - 0.01, (b.parapetZ + backZ) / 2]);
    }

    // screen (bent for curved screens), masking and gold frame
    const geo = new THREE.PlaneGeometry(sc.w, sc.h, 96, 1);
    if (sc.curve) {
      const p = geo.attributes.position;
      for (let i = 0; i < p.count; i++) { const a = p.getX(i) / sc.curve; p.setX(i, sc.curve * Math.sin(a)); p.setZ(i, sc.curve * (1 - Math.cos(a))); }
    }
    this.screenMat = new THREE.MeshBasicMaterial({ map: this.tex, color: 0xe6e6e6, toneMapped: false });
    add(geo, this.screenMat, [0, sc.midY, 0]);
    box(darkM, [sc.w + 1.2, sc.h + 1.0, 0.05], [0, sc.midY, -0.08]);
    const rail = (w, h) => new RoundedBoxGeometry(w, h, 0.1, 2, 0.03);
    add(rail(sc.w + 0.3, 0.1), goldM, [0, sc.top + 0.05, 0.04]);
    add(rail(sc.w + 0.3, 0.1), goldM, [0, sc.bottom - 0.05, 0.04]);
    [-1, 1].forEach((d) => add(rail(0.1, sc.h + 0.3), goldM, [d * (sc.w / 2 + 0.05), sc.midY, 0.04]));

    // pleated velvet curtains: real folds in the geometry, plus a valance with gold fringe
    const pleated = (w, h, pleat = 0.34, amp = 0.07) => {
      const pg = new THREE.PlaneGeometry(w, h, Math.max(8, Math.round(w / 0.04)), 1);
      const p = pg.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, amp * Math.sin((p.getX(i) / pleat) * Math.PI * 2));
      pg.computeVertexNormals();
      return pg;
    };
    const wd = Math.max(1.2, halfW - sc.w / 2 - 0.1);
    const curtH = H - 0.55;
    [-1, 1].forEach((d) => add(pleated(wd, curtH), fabric(A.curtain, wd, curtH, { low, side: THREE.DoubleSide }), [d * (sc.w / 2 + 0.1 + wd / 2), 0.55 + curtH / 2, 0.24]));
    add(pleated(halfW * 2, 1.3, 0.24, 0.05), fabric(A.curtain, halfW * 2, 1.3, { low, side: THREE.DoubleSide }), [0, H - 0.65, 0.3]);
    add(rail(halfW * 2, 0.07), goldM, [0, H - 1.33, 0.32]);
    const tn = Math.floor((halfW * 2) / 0.45);
    const tass = new THREE.InstancedMesh(new THREE.ConeGeometry(0.035, 0.2, 10), goldM, tn);
    const o4 = new THREE.Object3D();
    o4.rotation.set(Math.PI, 0, 0);
    for (let i = 0; i < tn; i++) { o4.position.set(-halfW + 0.22 + i * 0.45, H - 1.46, 0.34); o4.updateMatrix(); tass.setMatrixAt(i, o4.matrix); }
    g.add(tass);

    // floor heights, used by EXIT signs, sconces and the aerial camera's collision
    this.floorAt = (z, balconyLevel = false) => {
      let y = 0;
      L.rows.forEach((r) => {
        const inSec = balconyLevel ? r.section !== 0 : r.section === 0;
        if (inSec && z >= r.z - r.pitch / 2) y = r.floorY;
      });
      return y;
    };
    const exitM = new THREE.MeshBasicMaterial({ map: A.exit, toneMapped: false });
    const signG = new THREE.PlaneGeometry(0.9, 0.34);
    [-1, 1].forEach((d) => {
      add(signG, exitM, [d * (halfW - 0.03), 2.7, 1.8], [0, (-d * Math.PI) / 2, 0]);
      add(signG, exitM, [d * (halfW - 0.03), this.floorAt(backZ - 1.6) + 2.6, backZ - 1.6], [0, (-d * Math.PI) / 2, 0]);
    });
    const sconceG = new RoundedBoxGeometry(0.06, 0.12, 0.6, 2, 0.02);
    for (let z = 3; z < backZ - 1; z += 3.6) [-1, 1].forEach((d) => add(sconceG, glow(0xffb070), [d * (halfW - 0.06), this.floorAt(z) + 2.3, z]));

    // aisle step lights
    const lights = [];
    L.rows.forEach((row) => {
      row.aisles.forEach((ax) => lights.push([ax, row.floorY + 0.03, row.z - row.pitch / 2 + 0.03]));
      lights.push([-halfW + 0.5, row.floorY + 0.03, row.z - row.pitch / 2 + 0.03]);
      lights.push([halfW - 0.5, row.floorY + 0.03, row.z - row.pitch / 2 + 0.03]);
    });
    const lm = new THREE.InstancedMesh(UNIT_BOX, glow(0xff9a40), lights.length);
    const o5 = new THREE.Object3D();
    lights.forEach((p, i) => { o5.position.set(...p); o5.scale.set(0.16, 0.03, 0.03); o5.updateMatrix(); lm.setMatrixAt(i, o5.matrix); });
    g.add(lm);

    // projector booth + faint beam
    const apex = new V3(0, H - 0.9, backZ - 0.05);
    box(glow(0xcfe0ff), [0.5, 0.3, 0.05], [apex.x, apex.y, apex.z]);
    const c = [[-sc.w / 2, sc.bottom], [sc.w / 2, sc.bottom], [sc.w / 2, sc.top], [-sc.w / 2, sc.top]];
    const verts = [];
    for (let i = 0; i < 4; i++) { const a = c[i], b = c[(i + 1) % 4]; verts.push(apex.x, apex.y, apex.z, a[0], a[1], 0.05, b[0], b[1], 0.05); }
    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(verts, 3));
    this.beamMat = new THREE.MeshBasicMaterial({ color: 0xaec4ff, transparent: true, opacity: 0.02, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    add(bg, this.beamMat, [0, 0, 0]);

    if (L.hall.starCeiling) {
      const R = rng(7);
      const pts = [];
      for (let i = 0; i < 600; i++) pts.push((R() * 2 - 1) * halfW, H - 0.05, R() * backZ);
      const pg = new THREE.BufferGeometry();
      pg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
      g.add(new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xfff1d0, size: 0.05, toneMapped: false })));
    }

    this.screenLight.position.set(0, sc.midY, 0.5);
    this.screenLight.target.position.set(0, 0, backZ);
    this.fill.position.set(0, H, backZ);
    this.fill.target.position.set(0, 0, backZ * 0.3);
    this.ceilingLights.forEach((p, i) => p.position.set(0, H - 0.6, backZ * (0.15 + i * 0.25)));

    this.buildSeats(crowdSet);
  }

  // Upholstered seats: rounded cushions, backs and headrests in velvet, darker arms.
  // Seats are grouped by style + width so each group shares exact (unstretched) geometry.
  buildSeats(crowdSet) {
    const L = this.L, A = this.assets, low = this.low;
    const g = new THREE.Group();
    this.hall.add(g);
    const seg = low ? 2 : 3;
    const fabricM = low
      ? new THREE.MeshStandardMaterial({ map: A.upholstery.map, normalMap: A.upholstery.normal, roughness: 0.85 })
      : new THREE.MeshPhysicalMaterial({ map: A.upholstery.map, normalMap: A.upholstery.normal, roughness: 0.82, sheen: 1, sheenRoughness: 0.4, sheenColor: new THREE.Color(0xff8f8f) });
    fabricM.normalScale.set(0.6, 0.6);
    const armM = new THREE.MeshStandardMaterial({ color: 0x1d1416, roughness: 0.42, metalness: 0.1 });

    const groups = new Map();
    L.seats.forEach((s) => {
      const style = TIERS[s.tier].style;
      const key = style + ':' + s.sw.toFixed(2);
      if (!groups.has(key)) groups.set(key, { style, w: s.sw, seats: [] });
      groups.get(key).seats.push(s);
    });

    this.seatRef = new Map();
    this.seatColors = new Map();
    const o = new THREE.Object3D();
    const put = (im, i, x, y, z, rx = 0) => { o.position.set(x, y, z); o.rotation.set(rx, 0, 0); o.updateMatrix(); im.setMatrixAt(i, o.matrix); };
    groups.forEach(({ style, w, seats }) => {
      const n = seats.length, rec = style === 'recliner', motion = style === 'motion';
      const dims = rec
        ? { cush: [w * 0.84, 0.24, 0.68, 0.08], back: [w * 0.84, 0.78, 0.2, 0.08], rest: [w * 0.5, 0.2, 0.14, 0.06], arm: [0.12, 0.26, 0.78, 0.05] }
        : { cush: [w * 0.86, 0.12, 0.5, 0.05], back: [w * 0.86, motion ? 0.72 : 0.64, 0.1, 0.045], rest: [w * 0.6, 0.16, 0.12, 0.05], arm: [0.06, 0.07, 0.46, 0.025] };
      const geom = (k) => new RoundedBoxGeometry(dims[k][0], dims[k][1], dims[k][2], seg, dims[k][3]);
      const cush = new THREE.InstancedMesh(geom('cush'), fabricM, n);
      const back = new THREE.InstancedMesh(geom('back'), fabricM, n);
      const rest = new THREE.InstancedMesh(geom('rest'), fabricM, n);
      const arms = new THREE.InstancedMesh(geom('arm'), armM, n * 2);
      seats.forEach((s, i) => {
        const y = s.floorY, z = s.z;
        if (rec) {
          put(cush, i, s.x, y + 0.36, z - 0.02);
          put(back, i, s.x, y + 0.78, z + 0.4, 0.22);
          put(rest, i, s.x, y + 1.24, z + 0.46, 0.22);
          put(arms, i * 2, s.x - w / 2 + 0.07, y + 0.5, z + 0.05);
          put(arms, i * 2 + 1, s.x + w / 2 - 0.07, y + 0.5, z + 0.05);
        } else {
          put(cush, i, s.x, y + 0.44, z + 0.02);
          put(back, i, s.x, y + 0.82, z + 0.3, 0.14);
          put(rest, i, s.x, y + 1.2, z + 0.33, 0.14);
          put(arms, i * 2, s.x - w / 2, y + 0.64, z + 0.06);
          put(arms, i * 2 + 1, s.x + w / 2, y + 0.64, z + 0.06);
        }
        const col = new THREE.Color(TIERS[s.tier].color).offsetHSL(0, 0.05, 0.1);
        [cush, back, rest].forEach((m) => m.setColorAt(i, col));
        this.seatColors.set(s.id, col);
        this.seatRef.set(s.id, { meshes: [cush, back, rest], i });
      });
      g.add(cush, back, rest, arms);
    });

    // A simulated full house of anatomically proportioned people (head ≈ 16×23×19 cm,
    // 42 cm shoulders). Seated eye height varies (adult SD ≈ 4 cm, ~8% children, some slouch).
    const people = L.seats.filter((s) => crowdSet.has(s.id));
    const R = rng(people.length * 31 + 7);
    const gauss = () => (R() + R() + R() + R() - 2) * 1.73;
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.62 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75 });
    const clothMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.92 });
    const N2 = people.length;
    const heads = new THREE.InstancedMesh(HEAD, skinMat, N2);
    const hair = new THREE.InstancedMesh(HEAD, hairMat, N2);
    const necks = new THREE.InstancedMesh(SOFT, skinMat, N2);
    const shoulders = new THREE.InstancedMesh(SOFT, clothMat, N2);
    const torsos = new THREE.InstancedMesh(SOFT, clothMat, N2);
    this.personMeshes = [heads, hair, necks, shoulders, torsos];
    this.personIndex = new Map();
    this.personMats = [];
    const SKIN = [0x8d5a3b, 0x9a6642, 0xa87049, 0x7a4a30, 0xb98059, 0x6b4129, 0xc48f68];
    const HAIR = [0x0c0a09, 0x14100d, 0x1b1410, 0x241912, 0x3a3a3c, 0x6e6e70];
    const CLOTH = [0x2b3a55, 0x1f2a22, 0x4a2a2a, 0x3b3b40, 0x6a5a48, 0x23232a, 0x5b6b7a, 0x7a3a3a, 0x2f4a4a, 0xb8b0a0];
    const pick = (arr) => arr[Math.floor(R() * arr.length)];
    const col = new THREE.Color();
    people.forEach((s, i) => {
      const t = TIERS[s.tier];
      const child = R() < 0.08;
      const slouch = R() < 0.25 ? 0.03 + R() * 0.04 : 0;
      const eye = s.floorY + t.eye + (child ? -0.2 - R() * 0.06 : gauss() * 0.04) - slouch;
      const k = child ? 0.78 : 0.94 + R() * 0.12;
      const zh = s.z + 0.2 + (slouch ? 0.04 : 0);
      const X = s.x + (R() - 0.5) * 0.05;
      const place = (mesh, x, y, z, sx, sy, sz) => { o.rotation.set(0, 0, 0); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.updateMatrix(); const m = o.matrix.clone(); mesh.setMatrixAt(i, m); return m; };
      const mats = [
        place(heads, X, eye + 0.01 * k, zh, 0.78 * k, 1.15 * k, 0.95 * k),
        place(hair, X, eye + 0.055 * k, zh + 0.018, 0.82 * k, 0.9 * k, 1.0 * k),
        place(necks, X, eye - 0.13 * k, zh + 0.02, 0.1 * k, 0.12 * k, 0.1 * k),
        place(shoulders, X, eye - 0.25 * k, zh + 0.05, 0.44 * k, 0.14 * k, 0.21 * k),
        place(torsos, X, eye - 0.5 * k, zh + 0.07, 0.36 * k, 0.42 * k, 0.21 * k),
      ];
      o.scale.set(1, 1, 1);
      this.personIndex.set(s.id, i);
      this.personMats.push(mats);
      col.setHex(pick(SKIN)); heads.setColorAt(i, col); necks.setColorAt(i, col);
      col.setHex(pick(HAIR)); hair.setColorAt(i, col);
      col.setHex(pick(CLOTH)); shoulders.setColorAt(i, col); torsos.setColorAt(i, col);
    });
    this.audience = new THREE.Group();
    this.audience.add(...this.personMeshes);
    g.add(this.audience);

    // the viewer's own avatar + "YOU" tag, shown whenever the camera is away from the head
    const av = (this.avatar = new THREE.Group());
    const me = (hex, emissive) => new THREE.MeshStandardMaterial({ color: hex, roughness: 0.6, emissive, emissiveIntensity: 0.5 });
    const part = (geo, mat, x, y, z, sx, sy, sz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.scale.set(sx, sy, sz); av.add(m); };
    part(HEAD, me(0xb98059, 0x331a0a), 0, 0.01, 0, 0.78, 1.15, 0.95);
    part(HEAD, me(0x15100d, 0x050403), 0, 0.055, 0.018, 0.82, 0.9, 1.0);
    part(SOFT, me(0xb98059, 0x331a0a), 0, -0.13, 0.02, 0.1, 0.12, 0.1);
    part(SOFT, me(0xe3b04b, 0x5a3c08), 0, -0.25, 0.05, 0.44, 0.14, 0.21);
    part(SOFT, me(0xe3b04b, 0x5a3c08), 0, -0.5, 0.07, 0.36, 0.42, 0.21);
    const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: A.you, depthTest: false, transparent: true }));
    tag.scale.set(0.62, 0.23, 1); tag.position.set(0, 0.5, 0); tag.renderOrder = 10;
    av.add(tag);
    av.visible = false;
    g.add(av);
    this.focusId = null;
    this.renderer.compile(this.scene, this.camera);
  }

  // Idle hall preview (before any seat is picked): a slow drift from behind the back row.
  previewPose(t = 0) {
    const { halfW, backZ } = this.L.room;
    const top = Math.max(...this.L.rows.map((r) => r.floorY));
    const sc = this.L.screen;
    const p = new V3(Math.sin(t * 0.18) * halfW * 0.3, top + 2.6, backZ - 0.6);
    return { p, q: lookQuat(p, new V3(0, sc.midY - sc.h * 0.15, 0)) };
  }
  preview() {
    this.previewing = true;
    const end = this.previewPose((performance.now() - this.t0) / 1000);
    if (!this.hadPose) { this.camPos.copy(end.p); this.camQuat.copy(end.q); this.hadPose = true; this.tween = null; return; }
    const start = { p: this.camPos.clone(), q: this.camQuat.clone() };
    this.tween = { start, end, mid: start.p.clone().lerp(end.p, 0.5), t0: performance.now(), dur: this.reduce ? 1 : 1400, intro: false };
  }

  setAudience(on) { if (this.audience) this.audience.visible = on; }

  // highlight the chosen seat and make sure nobody is sitting in it
  setFocus(id) {
    const prev = this.focusId;
    if (prev === id) return;
    const Z = new THREE.Matrix4().makeScale(0, 0, 0);
    const paint = (sid, col) => { const ref = this.seatRef.get(sid); if (!ref) return; ref.meshes.forEach((m) => { m.setColorAt(ref.i, col); m.instanceColor.needsUpdate = true; }); };
    const person = (sid, show) => {
      const p = this.personIndex.get(sid);
      if (p == null) return;
      this.personMeshes.forEach((m, j) => { m.setMatrixAt(p, show ? this.personMats[p][j] : Z); m.instanceMatrix.needsUpdate = true; });
    };
    if (prev != null) { paint(prev, this.seatColors.get(prev)); person(prev, true); }
    this.focusId = id;
    if (id == null) { if (this.avatar) this.avatar.visible = false; return; }
    paint(id, new THREE.Color(0xe3b04b));
    person(id, false);
    const fs = this.L.byId.get(id);
    this.avatar.position.set(fs.x, fs.eyeY, fs.z + 0.2);
  }

  // ---------- camera poses ----------
  eyeOf(seat) {
    const sc = this.L.screen;
    const p = new V3(seat.x, seat.eyeY, seat.z + 0.11); // eyes ~9 cm in front of the head centre
    return { p, q: lookQuat(p, new V3(0, sc.midY, 0)) };
  }

  // Keep a free camera inside the hall: within the walls, above the heads of whoever sits
  // below it, and under the ceiling or the balcony slab.
  clampCam(p, seat) {
    const { halfW, backZ, height } = this.L.room;
    const B = this.L.balcony;
    p.x = clamp(p.x, -halfW + 0.4, halfW - 0.4);
    p.z = clamp(p.z, 0.6, backZ - 0.35);
    const onBalcony = !!(B && seat.row.section !== 0);
    let floor = this.floorAt(p.z, onBalcony && p.z > B.parapetZ);
    if (!onBalcony && B && p.z > B.parapetZ - 0.3) floor = Math.max(floor, this.floorAt(p.z));
    let ceil = height - 0.6;
    if (B && !onBalcony && p.z > B.parapetZ - 0.4) ceil = B.undersideY - 0.25;
    if (onBalcony && p.z < B.parapetZ) floor = Math.max(floor, B.floorY + 1.0);
    p.y = clamp(p.y, floor + 1.75, Math.max(floor + 1.75, ceil));
    return p;
  }

  // Aerial: orbit around a point just in front of your head. yaw 0 = behind you facing
  // the screen; pitch = how far the camera looks down; dist = distance from that point.
  orbitPose(seat, o = this.orbit, useTarget = false) {
    const yaw = (useTarget ? o.tYaw : o.yaw) * DEG, pitch = (useTarget ? o.tPitch : o.pitch) * DEG, dist = useTarget ? o.tDist : o.dist;
    const T = new V3(seat.x, seat.eyeY - 0.15, seat.z - 1.5);
    const p = new V3(T.x + Math.sin(yaw) * Math.cos(pitch) * dist, T.y + Math.sin(pitch) * dist, T.z + Math.cos(yaw) * Math.cos(pitch) * dist);
    this.clampCam(p, seat);
    return { p, q: lookQuat(p, T) };
  }

  // a gentle approach pose for the seat-view intro: just behind and above the head, facing the screen
  behindOf(seat) {
    const sc = this.L.screen;
    const p = this.clampCam(new V3(seat.x, seat.eyeY + 1.4, seat.z + 3.2), seat);
    return { p, q: lookQuat(p, new V3(0, sc.midY - sc.h * 0.2, 0)) };
  }

  poseOf(seat) { return this.mode === 'aerial' ? this.orbitPose(seat, this.orbit, true) : this.eyeOf(seat); }

  // Motion Look: move the phone to look around (seat view). "Straight ahead" is wherever the phone
  // points when it starts, and again after every new seat. Calls onFail if no sensor data arrives.
  setMotionLook(on, onFail) {
    if (!!on === !!this.motion) return;
    clearTimeout(this.motionTimer);
    if (on) {
      const M = (this.motion = { q: new THREE.Quaternion(), e: new THREE.Euler(), base: null, yaw: 0, pitch: 0, ty: 0, tp: 0, got: false });
      this.onOrient = (ev) => {
        if (ev.alpha == null || ev.beta == null || ev.gamma == null) return;
        deviceQuat(M.q, ev.alpha, ev.beta, ev.gamma, screenAngle());
        M.e.setFromQuaternion(M.q, 'YXZ'); // yaw (y) and pitch (x) against the real horizon, no roll
        if (!M.base) M.base = { yaw: M.e.y, pitch: M.e.x };
        M.ty = wrapPi(M.e.y - M.base.yaw);
        M.tp = clamp(M.e.x - M.base.pitch, -1.4, 1.4);
        M.got = true;
      };
      window.addEventListener('deviceorientation', this.onOrient);
      this.motionTimer = setTimeout(() => { if (this.motion && !this.motion.got) { this.setMotionLook(false); onFail?.(); } }, 1500);
    } else {
      window.removeEventListener('deviceorientation', this.onOrient);
      this.motion = null;
    }
    this.interact = performance.now();
  }
  recentreMotion() { if (this.motion) { this.motion.base = null; this.motion.yaw = this.motion.pitch = this.motion.ty = this.motion.tp = 0; } }

  setMode(mode, seat) {
    this.mode = mode;
    this.recentreMotion();
    this.look.ty = this.look.tp = 0;
    if (seat) this.flyTo(seat, false);
  }

  // intro: start behind/above and glide into your pose
  flyTo(seat, intro) {
    this.previewing = false;
    this.hadPose = true;
    this.seat = seat;
    if (this.mode === 'aerial') { this.orbit.yaw = this.orbit.tYaw; this.orbit.pitch = this.orbit.tPitch; this.orbit.dist = this.orbit.tDist; }
    const end = this.poseOf(seat);
    let start;
    if (intro) {
      start = this.mode === 'aerial' ? this.orbitPose(seat, { yaw: 0, pitch: 55, dist: this.orbit.tDist * 1.8 }) : this.behindOf(seat);
      this.camPos.copy(start.p); this.camQuat.copy(start.q);
    } else {
      start = { p: this.camPos.clone(), q: this.camQuat.clone() };
    }
    const mid = start.p.clone().lerp(end.p, 0.5);
    mid.y += intro ? 0.5 : 0.3;
    this.clampCam(mid, seat);
    this.tween = { start, end, mid, t0: performance.now() + (intro && !this.reduce ? 350 : 0), dur: this.reduce ? 1 : intro ? 2100 : 900, intro };
    this.look.ty = this.look.tp = 0;
    this.recentreMotion();
  }

  // ---------- frame loop ----------
  loop() {
    if (!this.active) return;
    requestAnimationFrame(this.loop);
    if (document.hidden) return;
    const now = performance.now();
    const raw = now - this.last; // display-frame interval (kept per rAF, so adaptive resolution stays accurate)
    this.last = now;
    this.frame++;

    const busy = !!this.tween || this.look.drag || this.previewing || !!this.motion || now - (this.interact || 0) < 1200 || Math.abs(this.house - this.houseTarget) > 0.01
      || (this.mode === 'aerial' && Math.abs(this.orbit.tDist - this.orbit.dist) + Math.abs(this.orbit.tYaw - this.orbit.yaw) + Math.abs(this.orbit.tPitch - this.orbit.pitch) > 0.01)
      || Math.abs(this.look.ty - this.look.yaw) + Math.abs(this.look.tp - this.look.pitch) > 0.05;
    // The film plays at 30 fps whatever the display rate (it was tied to every other frame, i.e.
    // 60 fps on 120 Hz screens): same 2K/1K resolution, half the canvas draws and texture uploads.
    const filmDue = now - (this.filmAt || 0) >= 1000 / 30 - 2;
    // When nothing moves, the only change on screen is the film, so render only on new film frames.
    // Any drag, glide, zoom or house-light fade renders at the full display rate.
    if (!busy && !filmDue) return;
    // animation step = time since the last RENDERED frame, so fans and fades keep their speed when idle
    const dt = Math.min(0.05, (now - (this.drawnAt || now - 16)) / 1000);
    this.drawnAt = now;

    // adaptive resolution: drop a notch when frames stay slow, recover when fast again
    this.avg = this.avg ? this.avg * 0.95 + Math.min(raw, 100) * 0.05 : 16;
    if (++this.slowCheck > 90) {
      this.slowCheck = 0;
      const budget = this.low && !busy ? 40 : 30;
      if (this.avg > budget && this.dpr > 1) { this.dpr = Math.max(1, this.dpr - 0.25); this.renderer.setPixelRatio(this.dpr); this.resize(); this.avg = 16; }
      else if (this.avg < 18 && this.dpr < this.maxDpr) { this.dpr = Math.min(this.maxDpr, this.dpr + 0.25); this.renderer.setPixelRatio(this.dpr); this.resize(); }
    }

    if (filmDue) {
      this.filmAt = now;
      drawMovie(this.mctx, this.mc.width, this.mc.height, (now - this.t0) / 1000, this.movieId);
      this.tex.needsUpdate = true;
    }
    // Screen-spill tint: a 4×4 GPU readback, ~3× a second is plenty (the light lerps smoothly anyway).
    if (filmDue && now - (this.tintAt || 0) > 300) {
      this.tintAt = now;
      this.sctx.drawImage(this.mc, 0, 0, 4, 4);
      const px = this.sctx.getImageData(0, 0, 4, 4).data;
      let r = 0, gg = 0, b = 0;
      for (let i = 0; i < px.length; i += 4) { r += px[i]; gg += px[i + 1]; b += px[i + 2]; }
      const n = (px.length / 4) * 255;
      this.screenTint = [r / n, gg / n, b / n];
    }
    if (this.screenTint) {
      const [r, gg, b] = this.screenTint;
      this.screenLight.color.lerp(new THREE.Color(r * 0.6 + 0.4, gg * 0.6 + 0.4, b * 0.6 + 0.4), 0.08);
    }

    // house lights fade
    this.house += (this.houseTarget - this.house) * Math.min(1, dt * 3);
    const H = this.house;
    this.hemi.intensity = 0.35 + 1.15 * H;
    this.fill.intensity = 0.15 + 0.85 * H;
    this.screenLight.intensity = 1.2 + 0.6 * (1 - H);
    this.ceilingLights.forEach((p) => (p.intensity = 6 + 55 * H));
    if (this.coveMat) this.coveMat.color.setRGB(0.35 + 0.65 * H, 0.69 * (0.35 + 0.65 * H), 0.44 * (0.35 + 0.65 * H));
    if (this.beamMat) this.beamMat.opacity = 0.012 + 0.03 * (1 - H);
    if (this.fans) this.fans.forEach((f, i) => (f.rotation.y += dt * (5.5 + (i % 3) * 0.4)));

    if (this.previewing && !this.tween) {
      const pp = this.previewPose(now / 1000);
      this.camPos.copy(pp.p); this.camQuat.copy(pp.q);
    }

    const tw = this.tween;
    if (tw) {
      const k = clamp((now - tw.t0) / tw.dur, 0, 1);
      const e = tw.intro ? easeInOut(k) : easeOut(k);
      const u = 1 - e;
      this.camPos.set(
        u * u * tw.start.p.x + 2 * u * e * tw.mid.x + e * e * tw.end.p.x,
        u * u * tw.start.p.y + 2 * u * e * tw.mid.y + e * e * tw.end.p.y,
        u * u * tw.start.p.z + 2 * u * e * tw.mid.z + e * e * tw.end.p.z,
      );
      this.camQuat.slerpQuaternions(tw.start.q, tw.end.q, tw.intro ? smooth(0.1, 0.9, e) : e);
      if (k >= 1) this.tween = null;
    } else if (this.mode === 'aerial' && this.seat && !this.previewing) {
      // orbit follows drag / wheel / pinch with a little smoothing
      const o = this.orbit, s = Math.min(1, dt * 10);
      o.yaw += (o.tYaw - o.yaw) * s; o.pitch += (o.tPitch - o.pitch) * s; o.dist += (o.tDist - o.dist) * s;
      const pose = this.orbitPose(this.seat);
      this.camPos.copy(pose.p); this.camQuat.copy(pose.q);
    }

    if (this.avatar) this.avatar.visible = this.focusId != null && this.camPos.distanceTo(this.avatar.position) > 0.9;

    const L = this.look;
    if (!L.drag) { L.ty *= 0.95; L.tp *= 0.95; }
    L.yaw += (L.ty - L.yaw) * 0.15;
    L.pitch += (L.tp - L.pitch) * 0.15;
    this.camera.position.copy(this.camPos);
    if (!this.tween && !this.reduce && !this.previewing && this.mode === 'seat') {
      const t = now / 1000; // breathing + tiny head sway
      this.camera.position.y += Math.sin(t * 1.4) * 0.0035;
      this.camera.position.x += Math.sin(t * 0.55) * 0.004;
    }
    this.camera.quaternion.copy(this.camQuat);
    if (this.mode === 'seat') {
      const M = this.motion;
      if (M && !this.tween) { // phone motion first (smoothed), then any finger drag on top
        M.yaw += wrapPi(M.ty - M.yaw) * 0.3; M.pitch += (M.tp - M.pitch) * 0.3;
        this.camera.rotateY(M.yaw); this.camera.rotateX(M.pitch);
      }
      this.camera.rotateY(L.yaw * DEG);
      this.camera.rotateX(L.pitch * DEG);
    }
    this.draw();
  }

  draw() {
    if (this.composer) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }

  snapshot(width = 520) {
    this.draw();
    const src = this.renderer.domElement;
    const c = document.createElement('canvas');
    c.width = width;
    c.height = Math.round((width * src.height) / src.width);
    c.getContext('2d').drawImage(src, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  }
}
