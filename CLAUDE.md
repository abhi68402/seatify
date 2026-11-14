# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is and why

**Seatify** (formerly "Darshan") lets you sit in any seat of a Hyderabad cinema hall in 3D before you go. It is a hackathon project solving a real problem: seat maps on booking sites are grids of squares that hide neck strain, blocked sightlines and balcony overhangs.

- **Theatre-first, not a booking app.** No showtimes, movie listings, prices to pay or tickets. Flow: pick a theatre → pick a screen → tap a seat → fly into the hall and look around. Every seat gets a 0–100 view score with plain-language reasons. Movies on the 3D screen are procedural placeholders.
- **13 theatres.** 7 are **matched row-for-row to BookMyShow seat maps** that the user supplied as screenshots: Prasads, AMB, AAA, ALLU, ART, PVR Nexus, Lakshmikala. 6 are **approximate reconstructions**: Sudarshan, Sandhya, Devi, INOX GVK, PVR Inorbit, Cinépolis. Keep that distinction honest in the UI.
- **Look (3D hall):** a typical Indian cinema. Maroon pleated curtains with gold fringe, velvet walls with damask (multiplexes), whitewashed walls with ceiling fans (old single screens), red-and-gold carpet, green EXIT/निकास signs.
- **Human point of view:** about 105° horizontal lens, anatomically sized audience, realistic seated eye heights, breathing sway. The aerial view orbits around *your* seat. It is never a ceiling bird's-eye shot.

## What the user cares about

- Ambitious, polished, "near perfect" work. Verify visually before calling something done.
- **Everything runs offline.** Never add CDN links, web fonts or network calls. Vendor any new dependency into `vendor/`, after asking: downloads need the user's OK, with filename, source and size.
- Symmetric, centred, stacked layouts on content pages; responsive from 360 px phones to wide desktops; readable and accessible (see Conventions).
- Real data over invented data. Screen sizes, seat counts and so on must be sourced or labelled as estimates (`screenNote` in `data.js`).

## Run and check

```bash
python3 serve.py [port]   # default 5317, serves this folder with Cache-Control: no-store
```

- **Use `serve.py`, not `python3 -m http.server`.** The plain server lets browsers keep stale ES modules after edits.
- **It must be served.** Opening `index.html` from disk won't work, because browsers block ES modules over `file://`.
- **The desktop app's preview launcher can't start it.** That launcher can't read `~/Documents` (macOS privacy block), so start the server from a shell or Bash. `.claude/launch.json` in the parent `Html/` folder only points the preview pane at `http://localhost:5317`.

There is no build, npm, test suite or linter. Checks that work:

```bash
node --check js/app.js js/scene.js js/assets.js js/layout.js js/data.js
# data/geometry sanity: seat counts per hall (compare with the BookMyShow screenshot)
node -e "import('./js/data.js').then(async d=>{const l=await import('./js/layout.js'); for(const t of d.THEATRES)(t.screens||[t.hall]).forEach((h,i)=>{const L=l.getLayout(t,i);console.log(t.id,h.name,L.seats.length)})})"
```

**Visual verification** in the browser pane:
- Check at 1440×900 (split explorer), 820×1100 (tablet), 390×844 (phone, low tier) and 844×390 (sideways phone).
- Screenshots taken right after navigating can show a black canvas while shaders compile. Wait 1–3 s and re-check before assuming a bug.
- The user often clicks around in the same pane. Do scripted tests in a separate tab (`tabs_create`) so you don't fight over state.

## Architecture

Data flows one way: `data.js` → `layout.js` → (`app.js` UI, `scene.js` 3D). Everything is a plain ES module.

- **`js/data.js`**
  - `TIERS`: seat types with width, row pitch, eye height, colour and 3D style (`std` | `recliner` | `motion`).
  - `MOVIES`: screen-content ids.
  - `THEATRES`: a theatre has `screens: [hall, …]` (or one `hall`). A hall has `screen {w,h,bottom,curve}`, `firstRow` (distance to the first row), `riser` (floor rise per row) and `sections`.
  - Two seat formats, documented in the header comment:
    - **`grid`:** copied row-for-row from a BookMyShow map, listed top-to-bottom as on screen (back → front). `o` is a seat, `.` a gap, a lone `-` row is a walkway, `F:4  …` starts numbering at 4. Optional `rtl`, `prefix` (for sections that restart at row A, giving ids like `Silver A1`) and a per-group `colW`/`pitch`. Helpers `o(n)`, `_(n)` and `rows('A B C', pattern)` keep these readable.
    - **`rows`:** generated blocks `{n, tier, blocks:[6,18,6]}`, front-to-back, for approximate halls.
  - `source: 'bms'` / `partial: true` / `screenNote` drive the accuracy badges and the screen-size source note.
- **`js/layout.js`**
  - `getLayout(theatre, screenIdx)` (cached) turns a hall into metric geometry: rows, seats, sections, room, balcony slab, `byId`. Coordinates: screen at z = 0, audience toward +z, x right, y up, metres. All grid rows share one column grid centred on the screen. A gap is an aisle if it is ≥2 columns wide, or sits between two runs of ≥2 seats.
  - `computeMetrics` scores each seat (`m`) on field of view, off-axis skew, look-up angle, sightline clearance (C-value), balcony-overhang cut and distance to the audio sweet spot. It produces the weighted `score` and `label`.
  - Also exports `crowd()` (deterministic audience), `topSeats`, `neighbour` (arrow-key moves), `heatColor`, `insightFor` and a seeded `rng`.
- **`js/scene.js`:** `TheatreView` (three.js).
  - **Device tiers** (`detectTier`):
    - **high:** pixel ratio ≤2, bloom through an EffectComposer whose render target has **4× MSAA** (without it the composer drops anti-aliasing and the scene goes soft), 2K film canvas.
    - **low** (touch, ≤4 GB memory or ≤2 cores): pixel ratio ≤1.5, direct `renderer.render`, 1K film, about 30 fps when idle.
    - Adaptive pixel ratio never drops below 1 and recovers when frames are fast.
  - **`loadHall(L, crowdSet, contentId)`** builds the room once per layout: pleated curtain geometry, rounded instanced seats grouped by style and width (`seatRef`: id → meshes and index), and the audience. `setFocus` recolours the chosen seat gold and hides its occupant.
  - **Cameras:**
    - **Seat view:** eye pose with drag-to-look.
    - **Aerial:** orbits a point 1.5 m in front of your head (`orbitPose`, drag/wheel/pinch, `resetOrbit`). Every free camera passes through **`clampCam`**: inside the walls, above heads, below the ceiling or balcony slab.
    - `flyTo(seat, intro)` tweens between poses; `preview()` drifts behind the back row until a seat is picked.
- **`js/assets.js`:** procedural textures with normal maps, 1K (512 on the low tier): curtain, velvet + damask, carpet, teak, plaster, upholstery, EXIT, YOU tag.
  - Noise is computed at half resolution, then upsampled.
  - `prepareAssets()` builds one texture per idle slot after page load, and `getAssets()` fills any gaps synchronously.
  - `surface()` / `fabric()` tile a texture at world scale. Clones carry `userData.tiled`, so `disposeTree` frees only those.
- **`js/movies.js`:** procedural canvas "films" via `drawMovie(ctx, w, h, t, id)`.
- **`js/app.js`:** single-file UI.
  - String templates go into `#screen` (pages) and `#stage` (3D overlay controls + seat card). One delegated click handler, `act()`, is keyed on `data-a="…"`. State lives in `S`.
  - Routes: `home | theatre | seats | view | saved`.
  - `syncLayout()` sets two attributes on `#app`: `data-layout` = `phone <640 | tablet 640–1023 | split ≥1024`, and `data-sheet` = `bottom | side | float` (how the seat card docks).
  - **Split (desktop):** the `seats` route is the explorer, with the seat map in a 440 px left panel and live 3D on the right. `chooseSeat()` flies the camera without changing page.
  - **Phone/tablet:** `seats` and `view` are separate pages.
  - `startScene()` loads the hall and flies to the focused seat, or previews the hall when no seat is chosen.
  - Saved seats live in `localStorage` (`seatify.saved`; the old `darshan.saved` key is read once and migrated). `scene.js` is imported lazily; three.js and the textures are warmed up in idle time after load.
- **`styles.css`:** one design system, light "product" look (warm white #f7f6f3, near-black text, coral accent `--accent` #c8432e; `--gold` is a legacy alias of the accent), tokens in `:root`, Inter for display and UI (Fraunces is vendored but unused). Controls floating over the dark 3D hall are white glass. Home app bar: location on the left (user asked for that swap); the hero headline is the brand (logo + "Seatify"), with the tagline as a smaller second line. **Two themes:** `:root` is light, `:root[data-theme="dark"]` overrides the tokens (warm charcoal, lighter coral `#f07a62` with dark `--ink` text on it). An inline script in `index.html` sets `data-theme` before first paint (saved `seatify.theme`, else the system setting); the sun/moon button in the home app bar calls `setTheme()`. Never hard-code a colour in components or SVG templates: add a token to both palettes (SVG uses `style="fill:var(--x)"`). Modes are driven by `#app[data-layout|data-sheet|data-route]`. Content pages are one centred column, max 760 px. On `(pointer: coarse)`, backdrop blur over the canvas is swapped for solid panels.
- **`vendor/`:** three.js 0.160.0 core plus only the add-ons used, under `vendor/three/examples/jsm/...` (mapped by the import map in `index.html`), and self-hosted fonts in `vendor/fonts/`. To use another add-on, vendor it **and** any relative imports it pulls in.

## Conventions and gotchas

- **Director's seat = best seat.** `computeMetrics` (layout.js) scores 0.32 position (Gaussian distance from `L.ref`: centre line, two-thirds of the room depth back, in the stalls clear of any balcony overhang; height above it counts too) + 0.22 screen size (full marks from 36° (THX) to target+12°, steep below SMPTE's 30°) + 0.14 side angle + 0.14 neck + 0.18 sightline, times the balcony-cut factor. `m.raw` is the unrounded score used for ranking. `L.ref.z` is computed from the screen (`L.refCalc`, shown step by step on the theatre page by `directorMaths()`): D = W / (2·tan(θ/2)) with θ = 50° (60° immersive), clamped to the director's band 60-72% of room depth, averaged with two-thirds of the room, then pushed back (within the band) if the top edge would need more than 30° of look-up. `L.director` = best seat in the director zone (±6% of room depth from the two-thirds mark, as central as the row allows) and gets the label DIRECTOR'S SEAT; it is #1 in all 17 halls (check script in the session history: topSeats(L,1)[0] === L.director). Seat map marks it (`.seat.dir`). Seat maps open with the view-quality heat map on (`S.heat` defaults to true; the toggle stays).
- **Seat Twin** (`js/twin.js`, the one place matching lives): a *view profile* `{fov, elevTop, skew, blocked, overhang}` (fields optional) → `matchView(profile, layouts, {exclude})` best seat per hall with match %, `bestInTheatre`, `directorSeats`, `profileOf(seat)`, `DNA_PRESETS`, `dnaProfile(fov, skew)`. Adapters that make profiles: a seat (seat card), My Seat, and the Seat DNA sliders. **No default seat anywhere**: the home card asks (Pick my seat / Describe my seat). My Seat = `localStorage['seatify.myseat']` {tid, si, id}; when set, theatre cards show "Your seat here", the theatre page has a "Your seat here" panel, and seat maps mark the twin (`.seat.twin`) or the seat itself (`.seat.mine`).
- **Motion Look** (`setMotionLook(on, onFail)` in `scene.js`): `deviceorientation` → device quaternion → yaw/pitch relative to where the phone pointed when it started (recentred on every `flyTo`/`setMode`), applied before finger drag in seat mode, marks the loop busy. `toggleMotion()` in `app.js` asks iOS permission inside the tap; the button shows only on touch devices with the API and hides in aerial view. Test without a phone: stub `DeviceOrientationEvent.requestPermission` to return 'granted', click the button for real, dispatch `new DeviceOrientationEvent('deviceorientation', {alpha, beta, gamma})`.
- **Symmetry rules (user asked for it, check at 375/768/1024/1440/1920):** home is one centred column: hero (brand, tagline, lede, two equal CTAs, live seat-map preview `heroPreview()` of AMB HDR, three equal stat columns), three equal step cards, two equal "Only on Seatify" cards with actions pinned to the bottom, centred finder with a List/Map switch (`S.homeView`), theatre cards in a centred flex grid (1/2/3 columns) so an odd last card sits centred, centred footer. Theatre page: two balanced columns (`.t-main` = hall + director's seat; `.t-side` = notes + your seat + best seats). Never animate `transform` on an SVG `<g>` that is positioned with a transform attribute (CSS replaces it); fade with opacity.
- **Published facts live in `js/info.js`** (not `data.js`): per theatre an audience `rating` {value, count, src, url} (the source with the most reviews we found: BookMyShow doesn't rate venues and Google can't be scraped), 2-3 `highlights` {text, src, url}, and per-hall `halls[i]` specs {width, projector, sound, which, url}, mostly from hyderabadtheatres.com. Researched 14 Nov 2026 (`INFO_AS_OF`); every fact shows its source link in the UI. The ring on theatre cards is Seatify's *best-seat view score*, labelled "best seat"; never present it as an audience rating. Research also corrected `data.js`: PVR Inorbit's premium hall is PXL (no IMAX), INOX GVK One's Insignia screen is unconfirmed (now "Screen 6"). Published screen widths differ from several modelled halls (e.g. Devi 83 ft, AAA Screen 1 67 ft): aligning the 3D geometry is a pending follow-up.
- **Offline service worker: rebuild before EVERY commit.** `sw.js` is GENERATED by `node tools/build-sw.mjs`: it precaches every served file (`index.html`, `styles.css`, `manifest.webmanifest`, `js/`, `vendor/`, `icons/`) under a cache named from a content hash, serves them cache-first (page: network first with 3 s timeout, then cache), and deletes old caches on activate. Forgetting to rebuild means returning visitors keep the old files. Run `node tools/bundle-3d.mjs && node tools/build-sw.mjs` before each commit (a git pre-commit hook would automate it; installing one was blocked by permissions, so the user can add it). `app.js` registers the worker except on localhost (add `?sw` to test it there). Adding a new served top-level file or folder: add it to `SERVED` in `build-sw.mjs`.
- **3D fallback bundle: rebuild after any 3D change.** `js/scene.bundle.js` is GENERATED by `node tools/bundle-3d.mjs`: three.js, the add-ons and `scene/assets/movies/layout/data.js` packed into one classic script that sets `window.SeatifyScene`. `getView()` in `app.js` tries `import('./scene.js')` first and falls back to this bundle when module loading fails, which happened on the user's Firefox on GitHub Pages. **After editing any of those modules (including `data.js` theatres), rerun the bundler and commit the bundle too,** or the fallback serves stale halls. Never hand-edit the bundle.

- Accessibility structure: `#screen` is a plain `div`; every route template renders its own `<header class="appbar">`, `<main id="main" tabindex="-1">` (target of the skip link) and exactly one `h1` (on the seat-map and saved pages it lives in the app bar). In `view`, `#stage` gets `role="main"` and a visually hidden `h1`; in split `seats` it is a labelled region. `go()` moves focus to the new page's `h1` (`focusPage`), and the click handler's `restoreFocus` re-focuses a control that its own action re-rendered. Cards are `<li class="tcard">` with a real heading whose `.stretch` button covers the card; keep that pattern instead of putting headings inside buttons.

- **Adding or fixing a theatre is a `data.js`-only change.** Geometry, scoring, the 2D map and the 3D hall all derive from it. When the user sends a BookMyShow screenshot:
  - transcribe it as a `grid`, with columns aligned to the screenshot's grid;
  - recheck the seat count with the node snippet;
  - mark the theatre `source: 'bms'`.
- **Tune halls with data, not special cases.** Row `pitch` and floor `riser` drive the neck-strain and sightline labels, so adjust `firstRow`, `riser` and `screen` in `data.js` rather than special-casing `layout.js`.
- **Page structure** (`index.html`):
  - a skip link to `#main`;
  - each route renders its own `<header>`, `<main id="main">` and `<footer>` into `#screen`;
  - `#announce` is a polite live region for screen-reader messages;
  - `#toast` is for visible confirmations.
- **Accessibility floor:**
  - text at least 12 px, and at least 4.5:1 contrast;
  - UI colours at least 3:1;
  - targets at least 44 px (dense seat-map seats excepted);
  - every icon button has an `aria-label`;
  - seats use a roving tabindex with arrow keys;
  - `prefers-reduced-motion` turns off camera glides.
- **Shell editing in this environment:** large inline `python3 - <<'EOF'` heredocs sometimes trip a Claude Code safety check. Write the script to the session scratchpad and run it from there instead.
- **Missing file:** `js/layout.js` once vanished from disk. If the app fails with a missing-export error, check that file exists before debugging anything else.
- **Delegating changes:** a global subagent, `project-craftsman` (`~/.claude/agents/`), exists for scoped changes and new UI ideas. It returns a report of under 150 words.
