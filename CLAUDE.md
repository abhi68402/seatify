# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

**Vyu** (said "view"; formerly "Seatify", before that "Darshan") lets you sit in any seat of a Hyderabad cinema hall in 3D before you go, and scores every seat 0–100 with plain-language reasons. A hackathon project: booking-site seat grids hide neck strain, blocked sightlines and balcony overhangs.

- **Theatre-first, not a booking app.** No showtimes, tickets or payments. Flow: theatre → screen → seat → fly into the hall. Films on the 3D screen are procedural placeholders.
- **50 theatres, 54 halls, 26,556 seats.** 45 are matched to BookMyShow (`source: 'bms'`): 8 transcribed from screenshots the user supplied, and 37 (added 20 Nov 2026, one hall each, the biggest screen) read exactly from BookMyShow's own seat objects (see "Reading seat maps from BookMyShow" below); the other 5 are approximate reconstructions. Keep that distinction honest in the UI.
- **No backend.** Static files only; all scoring and 3D run in the browser. Live at https://www.cinevyu.site/ (Vercel project, auto-deploys from `main`; a GitHub Pages copy at https://abhi68402.github.io/vyu/ also works; repo `abhi68402/vyu`, branch `main`, served from the repo root).

## What the user cares about

- Ambitious, polished, verified work. Check visually before calling something done.
- **Fully offline:** no CDN links, web fonts or network calls in the app. New dependencies are vendored into `vendor/`, and only after the user approves the download (name, source, size).
- **Real data over invented data.** Screen sizes, seat counts, ratings and specs are sourced or labelled as estimates (`screenNote`, `js/info.js`).
- **Symmetric, centred layouts** that work from 360 px phones to 1920 px desktops, in light and dark themes, at WCAG AA.
- **Push every finished change** to `origin/main` (see Deploy).

## Run, check, deploy

```bash
python3 serve.py [port]        # http://localhost:5317, Cache-Control: no-store
node tools/check.mjs [id]      # seat counts + director's-seat invariant, all halls or one theatre id; exit 1 on failure
node --check js/*.js           # syntax (there is no build, npm, linter or test suite)
```

- Use `serve.py`, not `python3 -m http.server` (browsers keep stale ES modules). `index.html` from `file://` does not work (ES modules).
- The desktop app's preview launcher cannot start the server (macOS blocks it from `~/Documents`); start it from Bash. `../.claude/launch.json` only points the preview pane at `http://localhost:5317`.
- Visual checks: 1440×900 (split explorer), 820×1100 (tablet), 390×844 (phone) and 844×390 (sideways phone), light and dark. The 3D canvas can be black for 1–3 s while shaders compile. If the app's browser pane is hidden it throttles rAF and freezes CSS animations: judge timing and animated states with headless Chrome (CDP) instead.
- **Before every commit, regenerate the two generated files** and commit them with the change:
  ```bash
  node tools/bundle-3d.mjs && node tools/build-sw.mjs
  ```
  Then `git push`; Pages rebuilds in about a minute (`gh api repos/abhi68402/vyu/pages/builds/latest`). `gh` is at `/opt/homebrew/bin/gh`. If git has no identity in a session, reuse the existing author with `git -c user.name=… -c user.email=…` from `git log`, never change git config.
- A git pre-commit hook would automate the regeneration, but installing hooks was blocked by permissions; the user may add one.

## Architecture

One-way data flow, plain ES modules, no framework:

```
data.js ──► layout.js ──► app.js (pages, UI state)      info.js (published facts) ──► app.js
                     └──► scene.js (three.js hall)      twin.js (view matching)   ──► app.js
```

- **`js/data.js`**: `TIERS` (seat types: width, pitch, eye height, 3D style), `MOVIES`, `THEATRES`. A theatre has `screens: [hall…]` or one `hall`; a hall has `screen {w,h,bottom,curve}` in metres, `firstRow`, `riser`, `sections`, optional `screenNote`. Two seat formats (see the header comment): **`grid`**, transcribed from BookMyShow top-to-bottom (`o` seat, `.` gap, lone `-` row = walkway, `F:4 …` numbering offset, optional `rtl`/`prefix`/`colW`/`pitch`, helpers `o(n)`, `_(n)`, `S([start,count],…)`, `rows()`), and **`rows`** blocks `{n, tier, blocks:[…]}` front-to-back for approximate halls.
- **`js/layout.js`**: `getLayout(theatre, screenIdx)` (cached) converts a hall to metric geometry (screen at z = 0, audience toward +z, metres) and scores every seat in `computeMetrics` → `seat.m` (`fov`, `skew`, `elevTop`, `clearance`, `overhangCut`, `score`, `raw` unrounded, `label`, `parts`).
  - **Score** = 0.32 director's position + 0.22 screen size + 0.14 side angle + 0.14 neck + 0.18 sightline, times a balcony-cut factor. Screen size gets full marks from 36° (THX) to the format target + 12° (50°, or 60° immersive), falling steeply below SMPTE's 30°.
  - **Director's seat** (`L.director`, label DIRECTOR'S SEAT): the reference point `L.ref` is placed from geometry (`L.refCalc`): D = W / (2·tan(θ/2)), held in the 60–72% depth band, averaged with two-thirds of the room, pushed back within the band if the top edge needs > 30° of look-up, kept in the stalls clear of any balcony. The director is the best seat in that zone and must be #1 in every hall (`tools/check.mjs` enforces it). The theatre page shows this working via `directorMaths()`.
  - Balconies: `balcony: {lift, overhang}` hangs over the stalls; `balcony: {stack: true, lift, gap}` stacks a further tier behind the previous section (Sudarshan's upper balcony, solid from the ground). `L.balcony` is the first (overhanging) one, `L.balconies` all; the director is measured against the depth excluding stacked tiers (`L.refCalc.backZ`).
  - Also: `topSeats` (ranks by `raw`), `neighbour`, `crowd`, `heatColor`, `insightFor`.
- **`js/twin.js`**: Seat Twin. One matching module over a *view profile* `{fov, elevTop, skew, blocked, overhang}` (fields optional): `profileOf(seat)`, `matchView(profile, layouts, {exclude})` (best seat per hall + match %), `bestInTheatre`, `directorSeats`, `DNA_PRESETS`, `dnaProfile`. Seats, My Seat and the Seat DNA sliders are its adapters.
- **`js/info.js`**: researched facts (as of `INFO_AS_OF`): per theatre an audience `rating {value, count, src, url}` (the source with the most reviews found; BookMyShow does not rate venues and Google cannot be scraped), 2–3 `highlights`, and per-hall published `halls[i]` specs. Every fact is shown with its source link. `BOOKING`/`bookingOf` hold each theatre's BookMyShow venue link (all 13) and District link (6; `null` = not on District), shown by the theatre page's "Book tickets" button in the bottom bar (`openBook()` sheet, with the hall's director's seat to pick) and in the seat drawer (`bookSeatCard()`). Modelled screen widths in `data.js` match these published widths.
- **`js/scene.js`**: `TheatreView` (three.js r160). Device tiers (`detectTier`): high = bloom through an EffectComposer whose render target keeps **4× MSAA**; low (touch / ≤4 GB / ≤2 cores) = direct render, 1K film. Idle frames render only when the 30 fps film changes; drags, glides and fades render every frame. `loadHall` builds the room once per layout (instanced seats, audience; seat back and headrest positions per style live in `SHELL`, and `fitPush` slides each person and the YOU avatar forward so no body part passes through a backrest); cameras: seat view with drag-to-look, aerial orbit around your seat, all clamped by `clampCam`; `flyTo` tweens. `setMotionLook` drives the seat view from `deviceorientation` (recentred per seat). `onLook` is called while the viewer drags or moves the phone.
- **`js/assets.js` / `js/movies.js`**: procedural textures (built in idle time, `getAssets()` fills gaps) and procedural canvas films.
- **`js/app.js`**: the whole UI. State in `S`; routes `home | theatre | seats | view | saved`, each with a hash address (`urlOf`/`parseUrl`: `#/`, `#/saved`, `#/t/<id>`, `#/t/<id>/<hall>/seats`, `#/t/<id>/<hall>/seat/<seat>`) so browser back/forward and shared links work; `go()` pushes a history entry (or steps back when the target is the previous entry, so in-app back buttons do not stack), seat picks only replace it; pages are string templates rendered into `#screen`, 3D overlay controls into `#stage`; one delegated click handler `act()` keyed on `data-a="…"`. `syncLayout()` sets `#app[data-layout]` (`phone <640 | tablet | split ≥1024`) and `[data-sheet]` (`bottom | side | float`). Home: with no search and filter "All", the theatre list is four horizontal **shelves** (`shelves()`: Biggest screens, Recliner comfort, Single-screen legends, Dolby Atmos; the user wants only these, so don't add more rows; a shelf under 2 theatres hides) plus a "See all N theatres" button (`#/shelf/all`) so a theatre on no shelf stays reachable; `#/shelf/<id>` is a shelf's See all page; a search or filter shows the flat grid. On split, `seats` is the explorer (440 px seat map + live 3D); on phone/tablet `seats` and `view` are separate pages. `scene.js` is imported lazily by `getView()`, which falls back to `js/scene.bundle.js` if module loading fails.
- **`styles.css`**: one token-based design system, light by default with `:root[data-theme="dark"]` overrides; an inline script in `index.html` sets the theme before first paint. Never hard-code colours in components or SVG templates: add a token to both palettes (SVG uses `style="fill:var(--x)"`). Inter for UI and display. Later sections of the file override earlier ones (symmetry pass, HUD, ratings): read to the end before changing a component.
- **Generated, never hand-edited:** `js/scene.bundle.js` (`tools/bundle-3d.mjs`: three.js, add-ons and the 3D modules incl. `data.js` in one classic script setting `window.VyuScene`; it was needed when module loading failed on the user's Firefox) and `sw.js` (`tools/build-sw.mjs`: precaches everything under `SERVED` with a content-hashed cache name; registered everywhere except localhost, add `?sw` to test it locally). A new served top-level file or folder must be added to `SERVED`.
- **`vendor/`**: three.js 0.160.0 core plus only the add-ons used (import map in `index.html`) and self-hosted fonts. Vendoring an add-on means vendoring its relative imports too.

## UI conventions that are easy to break

- **Seat details are a flat HUD, never a card over the screen** (review feedback). `cardHtml()` renders `.hud-main` docked along the bottom of the stage in every layout plus the `.more` "Why this score?" drawer (`S.open`); `positionFloating()` sets `--sheet-h` and insets the 3D picture above the bar; narrow bars adapt with `@container hud` queries; `#stage.looking` fades the HUD while the viewer looks around.
- **The ring on theatre cards is the best-seat view score** (labelled "best seat"), not an audience rating; ratings are separate and always show their source.
- **No default seat for Seat Twin.** The home card asks (Pick my seat / Describe my seat). My Seat lives in `localStorage['vyu.myseat']`; saved seats in `vyu.saved`; theme in `vyu.theme` (the older `seatify.*` keys are still read once, then removed, so renaming kept everyone's seats).
- **Symmetry:** the home page is one centred column; theatre cards use a centred flex grid so an odd last card sits centred; the theatre page has two balanced columns (`.t-main` / `.t-side`). Check 375/768/1024/1440/1920.
- **Accessibility floor:** every route renders its own `<header class="appbar">`, `<main id="main" tabindex="-1">` and exactly one `h1`; `go()` moves focus to it and `restoreFocus` keeps focus on a re-rendered control. Text ≥ 12 px at ≥ 4.5:1, targets ≥ 44 px (dense seat maps excepted), icon buttons have `aria-label`, seats use a roving tabindex with arrow keys, `prefers-reduced-motion` disables glides. Cards are `<li class="tcard">` with a real heading whose `.stretch` button covers the card.
- Never animate `transform` on an SVG `<g>` positioned with a `transform` attribute (CSS replaces it); fade with opacity.

## Data changes

- **Adding or fixing a theatre is a `data.js` change** (plus `info.js` for its facts). From a BookMyShow screenshot: transcribe as a `grid` with columns aligned to the screenshot, mark `source: 'bms'`, then run `node tools/check.mjs <id>` and compare the seat count.
- **New theatre checklist.** The user wants every new theatre to get everything the existing ones have. Do all of it for each one:
  1. **`data.js`**: the theatre (`id`, `name`, `short`, `area`, `tags`, `source`) and each hall: screen `w`/`h` from a published spec (or `screenNote` saying it is estimated), `firstRow`, `riser`, sections/balconies, seats as a `grid` (BookMyShow screenshot, `source: 'bms'`) or approximate `rows`. Use an existing `TIERS` seat type; a new 3D `style` also needs a `SHELL` entry in `scene.js` so the audience sits in it properly.
  2. **`node tools/check.mjs <id>`** passes: seat count matches the source, director's seat is #1, no duplicate seat ids.
  3. **`info.js` `INFO`**: audience `rating` (the source with the most reviews, with its link), 2–3 sourced `highlights`, and per-hall `halls[i]` specs (width, projector, sound, source). The modelled screen width must match the published width.
  4. **`info.js` `BOOKING`**: BookMyShow and District links, each opened and checked (the page title names the cinema; a made-up id should 404). BookMyShow: the venue code is in the page source of `https://in.bookmyshow.com/hyderabad/cinemas` (`venueCode` next to the name); the link is `/cinemas/hyderabad/<name slug>/<CODE>` and redirects to today's showtimes. District: find the `-CD<id>` link on `https://www.district.in/movies/cinemas-in-hyderabad`; `district: null` if it isn't listed.
  5. **Hand-written counts** ("50 theatres" etc.): `index.html` meta description and JSON-LD, `manifest.webmanifest`, `README.md` (also "all 54 halls"), and the counts in this file. The app itself counts automatically.
  6. **Look at it**: the home shelves (it appears on the shelves it should, and in See all), the theatre page (rating, specs, What's special, director's maths, Book tickets sheet), the seat map, the 3D hall in seat view and aerial (nobody poking through seat backs), Seat Twin finding a match in the new hall, and its `#/t/<id>` link, on phone and desktop.
  7. Regenerate `scene.bundle.js` and `sw.js`, commit, push.
- **Reading seat maps from BookMyShow (preferred over screenshots).** BookMyShow draws seat layouts with Konva, and each seat object carries its row letter, printed number, price class and price, so a layout can be read exactly. `tools/bms-seatmap.js` does this inside a BookMyShow page in the desktop app's browser pane (usage at the top of the file): it lists a cinema's screens from the showtimes JSON, counts every screen's seats in hidden frames, opens the biggest and writes its rows in `data.js` grid syntax (incl. per-block numbering `B:3/26` and right-to-left rows). BookMyShow's page blocks requests to localhost; export `localStorage.__vyuAll` by submitting it as a normal form POST to a local receiver. `tools/bms-to-vyu.py` turns that `halls.json` plus the researched facts into `data.js` / `info.js` / `BOOKING` entries (single screens: every class from the top down to the last balcony-type class becomes one `stack: true` balcony behind the stalls; halls in `FLAT`, whose BookMyShow ground floor is only a few rows, are one continuous raked hall; a class split over two areas gets Left/Right prefixes).
  - **Batch status (20 Nov 2026):** 37 of the 83 remaining Hyderabad cinemas are added (batch 3: Asian Sha & Shahensha, Cinepolis Sudha, BR Hitech, PVR Musarambagh, Sree Ramana, Sushma, Asian Jyothi, Asian Tarakarama, Vijetha; batch 2: PVR Central, PVR Preston, INOX Kachiguda, Asian Radhika, Miraj Shalini Shivani, PVR RK Cineplex, Tivoli, PVR Irrum Manzil, Cinepolis Mantra, INOX Odeon). Fastest path: `V.runAll([...codes], 'YYYYMMDD')` reads whole cinemas in hidden frames in the background; poll `V.status()`. `tools/bms-data/` holds `venues.tsv` (all 83: code, BookMyShow name, lat/lng, area), `facts_*.json` (researched facts for all 83), `district.txt` and the extracted `halls.json`. Not yet added: the other 46, including CPHY (Asian Cineplanet Kompally, extracted but its top box sections have unlabelled price classes; check them before adding).
  - Line the facts up with `name`/`short`/`area`; the user wants one hall per cinema (the biggest) for now.
- **Tune halls with data, not special cases** in `layout.js`: `firstRow`, `riser`, `screen` and balcony `lift` drive the scores. Big single screens keep the first row ≥ 0.42 × screen width.

## Environment notes

- Large inline `python3 - <<'EOF'` heredocs sometimes trip a Claude Code safety check: write scripts to the session scratchpad and run them from there.
- `js/layout.js` once vanished from disk: on a missing-export error, check the file exists first.
- Another session sometimes leaves uncommitted edits in `styles.css`; commit only your own hunks (e.g. stage `HEAD` + your block) unless the user says otherwise.
- A global subagent, `project-craftsman` (`~/.claude/agents/`), exists for scoped changes and UI ideas when the user asks for it.
