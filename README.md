<div align="center">

# 💺 Seatify

### *See your seat before you sit.*

Step into any seat of **13 Hyderabad cinema halls** in 3D, and see what the view is really like before you go.

**[▶ Try it live](https://abhi68402.github.io/seatify/)**

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES%20Modules-F7DF1E?logo=javascript&logoColor=black)
![three.js](https://img.shields.io/badge/three.js-0.160-000000?logo=threedotjs&logoColor=white)
![Offline](https://img.shields.io/badge/runs-100%25%20offline-2ea44f)
![Accessibility](https://img.shields.io/badge/a11y-WCAG%202.1%20AA%20target-8a5a10)

</div>

---

## ✨ Why Seatify?

Seat maps on booking sites are grids of squares. They hide neck strain, blocked sightlines and balcony overhangs, so you only find out once you're sitting there.

Seatify fixes that. Pick a theatre, pick a seat, and **fly into the hall** to look around from exactly where you would sit.

> Seatify is a view guide, not a booking app. It has no showtimes, no payments and no tickets.

## 🚀 Features

| | |
|---|---|
| 🪑 **Seat-by-seat 3D view** | A human-eye camera with about 105° field of view, realistic seated eye heights and an anatomically sized audience. |
| 📊 **0–100 view score** | Every seat is scored on field of view, off-axis angle, look-up angle, sightline clearance, balcony overhang and sound, with plain-language reasons. |
| 🏛️ **13 Hyderabad theatres** | Maroon curtains, velvet and damask multiplexes, and whitewashed single screens with ceiling fans. |
| ✅ **Honest data** | 7 halls are matched row-for-row to real seat maps. 6 are labelled approximate reconstructions. |
| 🔖 **Saved seats** | Shortlist seats and compare them. Saved in your browser. |
| 📱 **Responsive** | Phones from 360 px up to wide desktops. The desktop layout splits the seat map and the live 3D view. |
| ♿ **Accessible** | Skip link, keyboard seat navigation with arrow keys, screen-reader announcements, focus management and reduced-motion support. |
| 🎬 **Director's seat** | Every hall's top seat is the director's seat: centred, about two-thirds back, where films are mixed and checked. Scores follow SMPTE (30° minimum) and THX (36–40°) viewing guidance. |
| 🪞 **Seat Twin** (only on Seatify) | Mark your seat once, or describe the view you like with two sliders (Seat DNA). Seatify finds that same view in all 17 halls: same screen width in your eyes, same look-up, same side angle. Every theatre then shows "your seat here". |
| 📱 **Motion Look** (only on Seatify) | On a phone, move the phone itself to look around the hall, like a window into the cinema. Uses the motion sensor; no headset or app. |
| 📴 **Works offline** | No backend, CDN, web fonts or API calls: three.js and fonts are vendored. A service worker stores the whole site (~3 MB) on the first visit, so it then opens and runs with no internet. Installable as an app. |

## 🎬 Theatres

**Matched to real seat maps:** Prasads · AMB · AAA · ALLU · ART · PVR Nexus · Lakshmikala

**Approximate reconstructions:** Sudarshan · Sandhya · Devi · INOX GVK · PVR Inorbit · Cinépolis

## 🛠️ Run locally

The app uses ES modules, so it **must be served over HTTP**. Opening `index.html` from disk won't work.

```bash
python3 serve.py          # http://localhost:5317
python3 serve.py 8080     # custom port
```

`serve.py` disables caching so edits show up on reload. There is no build step, npm or install.

## 🧱 Project structure

```
seatify/
├── index.html      # app shell, import map, accessibility landmarks
├── sw.js           # generated offline service worker (node tools/build-sw.mjs)
├── manifest.webmanifest + icons/  # installable app
├── styles.css      # design system: light, coral accent
├── serve.py        # local dev server (no-cache)
├── js/
│   ├── data.js     # tiers, theatres and halls (the single source of truth)
│   ├── layout.js   # hall geometry and per-seat view scoring
│   ├── scene.js    # three.js 3D hall, cameras and device tiers
│   ├── assets.js   # procedural textures
│   ├── movies.js   # procedural screen content
│   ├── app.js      # UI, routing and state
│   └── scene.bundle.js  # generated single-file 3D fallback (node tools/bundle-3d.mjs)
├── tools/
│   ├── bundle-3d.mjs    # zero-dependency bundler for the fallback
│   └── build-sw.mjs     # generates sw.js with a content-hashed cache version
└── vendor/         # three.js 0.160 and self-hosted fonts
```

Data flows one way: `data.js` → `layout.js` → `app.js` (UI) and `scene.js` (3D). Adding or fixing a theatre is a change to `data.js` only.

## 📴 How offline works

There is **no backend**: every file is static, and all scoring and 3D rendering happen in the browser.

1. **No network dependencies.** Fonts, three.js, theatre data and the films on the 3D screen all ship inside the project.
2. **Local:** `python3 serve.py` serves it from your own machine, so it works with Wi-Fi off.
3. **Live site:** on the first visit, `sw.js` downloads and stores every file. After that the site opens, reloads and renders halls in 3D with no connection, and it can be installed to a home screen or dock. Each deploy changes the cache version, so returning visitors get the update automatically.

Before committing, rebuild the generated files:

```bash
node tools/bundle-3d.mjs && node tools/build-sw.mjs
```

## 🌐 Deploy

Seatify is a static site, so it works on **GitHub Pages**. In the repo, open **Settings → Pages**, choose **Deploy from a branch**, then select `main` and `/ (root)`.

## 🤝 Contributing

Ideas and fixes are welcome. Please keep it offline (no CDN links) and accessible (text of at least 12 px, 4.5:1 contrast, 44 px targets). See [`CLAUDE.md`](CLAUDE.md) for detailed conventions.

## 📄 Notes

Seatify is a hackathon project. Theatre names belong to their owners and are used only to describe halls. Approximate halls are labelled as such in the app.
