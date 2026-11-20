// Vyu — data for the Hyderabad theatres.
// All distances are in metres.
//
// Each theatre has `screens: [hall, ...]` (or a single `hall`). A hall's seats can be
// described two ways:
//
// 1. Copied from a BookMyShow seat map (exact layout). List price groups and rows
//    TOP-TO-BOTTOM exactly as BookMyShow shows them (screen at the bottom). One
//    character per seat column: 'o' = seat, '.' = empty column. Keep every row padded
//    to the same column grid so aisles line up. A row of just '-' is a walkway.
//
//    sections: [{ name: 'Stalls', grid: [
//      { tier: 'recliner', label: 'Recliner', rows: [
//        'J  o.o.o.o...o.o.o.o.o.o...o.o.o.o',
//      ] },
//      { tier: 'prime', label: 'Prime', rows: [
//        'H  oooo..oooooooooooooooo..oooo',
//        'G  oooo..oooooooooooooooo..oooo',
//        '-',
//        'F  ....oooooooooooooooooo....',
//      ] },
//    ] }]
//    Optional: rtl: true (seat 1 on the right), numbering: 'col' (numbers skip gaps).
//
// 2. Generated blocks (approximate): rows: [{ n, tier, blocks: [6, 18, 6] }],
//    listed front-to-back.
//
// `source: 'bms'` marks a theatre whose layout was matched to BookMyShow;
// anything else is shown as an approximate reconstruction.

export const TIERS = {
  classic:  { label: 'Classic',       seatW: 0.55, pitch: 1.00, eye: 1.15, color: '#8a1520', style: 'std' },
  prime:    { label: 'Prime',         seatW: 0.56, pitch: 1.05, eye: 1.15, color: '#a01a28', style: 'std' },
  semi:     { label: 'Semi recliner', seatW: 0.66, pitch: 1.35, eye: 1.08, color: '#7a2230', style: 'recliner' },
  recliner: { label: 'Recliner',      seatW: 0.80, pitch: 1.70, eye: 1.02, color: '#5a3322', style: 'recliner' },
  lounger:  { label: 'Lounger',       seatW: 0.74, pitch: 1.85, eye: 0.95, color: '#6b4430', style: 'recliner' },
  balcony:  { label: 'Balcony',       seatW: 0.55, pitch: 0.95, eye: 1.15, color: '#86222a', style: 'std' },
  motion:   { label: '4DX Motion',    seatW: 0.62, pitch: 1.35, eye: 1.18, color: '#1f3654', style: 'motion' },
};

// helpers for transcribing BookMyShow maps: same pattern for several row letters
const o = (n) => 'o'.repeat(n);
const _ = (n) => '.'.repeat(n);
// S([start, count], ...): a row of seat runs on the column grid (S([1, 3], [6, 2]) = '.ooo..oo')
const S = (...runs) => { let out = '', at = 0; runs.forEach(([st, n]) => { out += _(st - at) + o(n); at = st + n; }); return out; };
const rows = (letters, pattern) => letters.split(' ').map((l) => `${l}  ${pattern}`);

export const MOVIES = [
  { id: 'sand',   title: 'Ocean of Sand', lang: 'English', genre: 'Sci-Fi · Adventure', cert: 'UA', runtime: '2h 46m', tag: 'One walker. Ten thousand dunes.' },
  { id: 'deccan', title: 'Deccan Skies',  lang: 'Telugu',  genre: 'Action · Drama',     cert: 'UA', runtime: '2h 38m', tag: 'The city never forgets its heroes.' },
  { id: 'jatara', title: 'Jatara',        lang: 'Telugu',  genre: 'Mass · Drama',       cert: 'A',  runtime: '2h 55m', tag: 'When the drums start, nobody sleeps.' },
  { id: 'neon',   title: 'Neon Biryani',  lang: 'Hindi',   genre: 'Comedy',             cert: 'U',  runtime: '2h 12m', tag: 'Old City. New recipe. Total chaos.' },
  { id: 'orbit',  title: 'Orbit 9',       lang: 'English', genre: 'Sci-Fi · Thriller',  cert: 'UA', runtime: '2h 21m', tag: 'Nine minutes of oxygen.' },
];

export const THEATRES = [
  // ───────────── Matched to BookMyShow seat maps (12 Nov 2026) ─────────────
  {
    id: 'prasads', name: 'Prasads Multiplex', short: 'Prasads', area: 'Necklace Road',
    lat: 17.4129, lng: 78.4665, single: false, source: 'bms', tags: ['PCX · India\'s largest screen', 'Barco Laser'],
    screens: [
      {
        // Screen: 101.6 ft × 64 ft (31.0 × 19.5 m), ~630 seats — our transcription has 629.
        name: 'PCX Screen', format: 'PCX', immersive: true, atmos: true, screenNote: '98.6 ft wide (hyderabadtheatres.com); earlier reports said 101.6 × 64 ft',
        screen: { w: 30.05, h: 18.93, bottom: 0.9, curve: 0 },
        firstRow: 11, riser: 0.5, rtl: true,
        sections: [{ name: 'Gold', grid: [
          { tier: 'prime', label: 'Gold', rows: [
            ...rows('N M L K J I H G F E', o(47)),
            `D  ${_(1)}${o(45)}`,
            `C  ${_(3)}${o(41)}`,
            `B  ${_(4)}${o(39)}`,
            `A  ${_(7)}${o(34)}`,
          ] },
        ] }],
      },
      {
        // Same layout seen on the "Barco 4K Laser" and "Barco 4K Smart Laser" shows.
        name: 'Barco 4K Laser', format: 'LASER', screenNote: '59.2 ft wide (hyderabadtheatres.com); height estimated',
        screen: { w: 18.04, h: 7.57, bottom: 1.3, curve: 0 },
        firstRow: 5.6, riser: 0.36,
        sections: [{ name: 'Executive', grid: [
          { tier: 'classic', label: 'Executive', rows: [
            `A  ${o(30)}`,
            ...rows('B C D E F', `${o(14)}${_(2)}${o(14)}`),
            '-',
            ...rows('G H I J K L M', `${o(14)}${_(2)}${o(14)}`),
            `N  ${_(2)}${o(12)}${_(2)}${o(12)}`,
          ] },
        ] }],
      },
    ],
  },
  {
    id: 'amb', name: 'AMB Cinemas', short: 'AMB Cinemas', area: 'Gachibowli',
    lat: 17.4575, lng: 78.3640, single: false, source: 'bms', tags: ['Barco HDR', 'Loungers', 'Luxe'],
    screens: [
      {
        name: 'HDR by Barco', format: 'HDR', atmos: true, screenNote: '60.3 ft wide (hyderabadtheatres.com); height estimated',
        screen: { w: 18.38, h: 9.69, bottom: 1.2, curve: 0 },
        firstRow: 4.6, riser: 0.36,
        sections: [{ name: 'Stalls', grid: [
          { tier: 'prime', label: 'Platinum', rows: [`A  ${_(7)}${o(14)}`] },
          { tier: 'classic', label: 'Gold', rows: [
            ...rows('B C D E F G H', `${o(4)}.${o(14)}.${o(8)}`),
            '-',
            ...rows('I J K L M N O P', `${o(4)}.${o(14)}.${o(7)}`),
          ] },
          { tier: 'lounger', label: 'Loungers', colW: 0.66, rows: [`Q  ${_(5)}${o(3)}.${o(11)}.${o(5)}`] },
        ] }],
      },
      {
        // Header was cropped in the screenshot — one of AMB's Barco laser halls.
        name: 'Barco Laser hall', format: 'LASER', atmos: true, screenNote: '40 ft wide (hyderabadtheatres.com); height estimated',
        screen: { w: 12.19, h: 6.39, bottom: 1.2, curve: 0 },
        firstRow: 4.6, riser: 0.36,
        sections: [{ name: 'Stalls', grid: [
          { tier: 'prime', label: 'Platinum', rows: [`A  ${_(4)}${o(8)}.${o(4)}`] },
          { tier: 'classic', label: 'Gold', rows: [
            ...rows('B C D E F G H', `${o(14)}.${o(7)}`),
            '-',
            ...rows('I J K L M N O P', `${o(14)}.${o(3)}`),
          ] },
          { tier: 'lounger', label: 'Loungers', colW: 0.66, rows: [`Q  ${_(4)}${o(11)}.${o(2)}`] },
        ] }],
      },
      {
        name: 'M B Luxe', format: 'LUXE', screenNote: '18 ft wide (hyderabadtheatres.com); height estimated',
        screen: { w: 5.49, h: 2.91, bottom: 1.1, curve: 0 }, starCeiling: true,
        firstRow: 4.2, riser: 0.45, colW: 0.8,
        sections: [{ name: 'Luxe', grid: [
          { tier: 'semi', label: 'Semi recliner', pitch: 1.6, rows: rows('A B C D', o(8)) },
        ] }],
      },
    ],
  },
  {
    id: 'aaa', name: 'AAA Cinemas', short: 'AAA Cinemas', area: 'Ameerpet',
    lat: 17.4375, lng: 78.4482, single: false, source: 'bms', tags: ['Laser', 'Dolby 7.1', 'Semi recliners'],
    screens: [
      {
        name: 'Laser Hall (larger)', format: 'LASER', screenNote: '67 ft wide, Screen 1 (hyderabadtheatres.com); height estimated',
        screen: { w: 20.42, h: 10.68, bottom: 1.3, curve: 0 },
        firstRow: 5.0, riser: 0.34,
        sections: [{ name: 'Stalls', grid: [
          { tier: 'semi', label: 'Semi recliners', rows: [`A  ${o(16)}`] },
          { tier: 'classic', label: 'Gold', rows: [
            ...rows('B C D E F', `${o(2)}.${o(13)}`),
            '-',
            ...rows('G H J K L', `${o(2)}.${o(13)}.${o(4)}`),
            ...rows('M N P Q', `${o(2)}.${o(13)}`),
            '-',
            ...rows('R S T', `${o(2)}.${o(13)}.${o(4)}`),
          ] },
        ] }],
      },
      {
        name: 'Laser Hall (compact)', format: 'LASER', screenNote: 'Screen size estimated',
        screen: { w: 9, h: 4.7, bottom: 1.2, curve: 0 },
        firstRow: 4.2, riser: 0.32, numbering: 'seq',
        sections: [{ name: 'Stalls', grid: [
          { tier: 'semi', label: 'Semi recliners', rows: [`A  ${o(10)}`] },
          { tier: 'classic', label: 'Gold', rows: [
            `B  ${o(10)}`,
            '-',
            ...rows('C D E F G H J K', o(13)),
            `L  ${_(3)}${o(6)}`,
          ] },
        ] }],
      },
    ],
  },
  {
    id: 'allu', name: 'ALLU Cinemas', short: 'ALLU Cinemas', area: 'Kokapet',
    lat: 17.3960, lng: 78.3350, single: false, source: 'bms', tags: ['Laser 4K', 'Dolby Atmos'],
    screens: [
      {
        // The flagship Dolby Cinema hall (75 × 40.5 ft, ~644 seats) isn't in the screenshots;
        // this is the Laser 4K Atmos hall.
        name: 'Laser 4K Atmos', format: 'LASER', atmos: true, screenNote: '46 ft wide (hyderabadtheatres.com); height estimated',
        screen: { w: 14.02, h: 7.41, bottom: 1.3, curve: 0 },
        firstRow: 5.0, riser: 0.38,
        sections: [{ name: 'Stalls', grid: [
          { tier: 'prime', label: 'Platinum', rows: [`A  ${o(14)}`] },
          { tier: 'classic', label: 'Gold', rows: [
            `B  ${o(23)}`,
            ...rows('C D E F', `${o(7)}${_(2)}${o(14)}`),
            '-',
            ...rows('G H I J K L M', `${_(4)}${o(3)}${_(2)}${o(14)}`),
          ] },
        ] }],
      },
    ],
  },
  {
    id: 'art', name: 'ART Cinemas', short: 'ART Cinemas', area: 'Vanasthalipuram',
    lat: 17.3305, lng: 78.5640, single: false, source: 'bms', tags: ['4K', 'Recliners'],
    screens: [
      {
        name: 'Screen · 4K', format: '4K', screenNote: '38 ft wide, Screen 1 (hyderabadtheatres.com); height estimated. The 57 ft EPIQ screen is a different hall',
        screen: { w: 11.58, h: 6.08, bottom: 1.2, curve: 0 },
        firstRow: 4.6, riser: 0.36,
        sections: [{ name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliners', colW: 0.62, rows: [`R  ${_(3)}${o(10)}`] },
          { tier: 'classic', label: 'Gold', rows: [
            ...rows('M L K', `${o(3)}${_(2)}${o(10)}`),
            '-',
            ...rows('J H G', `${o(3)}${_(2)}${o(14)}`),
            ...rows('F:4 E:4 D:4 C:4 B:4 A:4', `${_(5)}${o(14)}`),
          ] },
        ] }],
      },
    ],
  },
  {
    id: 'nexus', name: 'PVR Nexus Mall', short: 'PVR Nexus', area: 'Kukatpally',
    lat: 17.4850, lng: 78.3895, single: false, source: 'bms', tags: ['4DX'],
    screens: [
      {
        name: '4DX', format: '4DX', screenNote: 'Screen size estimated',
        screen: { w: 11, h: 5.8, bottom: 1.4, curve: 0 },
        firstRow: 5.4, riser: 0.5, colW: 0.62,
        sections: [{ name: 'Motion', grid: [
          { tier: 'motion', label: '4DX', rows: [
            `J  ${o(4)}.${o(4)}.${o(4)}`,
            '-',
            ...rows('H G F E D C B A', `${o(4)}.${o(4)}.${o(4)}`),
          ] },
        ] }],
      },
    ],
  },
  {
    id: 'lakshmikala', name: 'Asian Lakshmikala Cinepride', short: 'Lakshmikala', area: 'Moosapet',
    lat: 17.4690, lng: 78.4250, single: true, source: 'bms', partial: true, tags: ['Single screen', '860+ seats'],
    screens: [
      {
        // Rows A–F of the upper section were scrolled off-screen in the screenshot;
        // they're filled with the same 14 + 14 pattern as G–I.
        name: 'Main Screen', format: '2D', rtl: true, screenNote: '58.2 ft wide (hyderabadtheatres.com); height estimated; top rows partly inferred',
        screen: { w: 17.74, h: 7.51, bottom: 2.0, curve: 0 },
        firstRow: 5.5, riser: 0.2,
        sections: [{ name: 'Hall', grid: [
          { tier: 'classic', label: 'Upper class', rows: [
            ...rows('A B C D E F G H I', `${o(14)}${_(6)}${o(14)}`),
            '-',
            ...rows('J K L M', `${o(14)}${_(6)}${o(14)}`),
            '-',
            `N  ${o(15)}${_(4)}${o(15)}`,
            ...rows('O P', `${o(14)}${_(6)}${o(14)}`),
            ...rows('Q R S T', `${o(15)}${_(4)}${o(15)}`),
            '-',
            `U  ${o(14)}${_(6)}${o(14)}`,
            ...rows('V W', `${o(15)}${_(4)}${o(15)}`),
            '-',
          ] },
          { tier: 'classic', label: 'Gold', prefix: 'Gold', rtl: false, rows: [
            `A  ${o(32)}`,
            `B  ${o(15)}${_(2)}${o(15)}`,
            '-',
          ] },
          { tier: 'classic', label: 'Silver', prefix: 'Silver', rows: [
            `E  .${o(15)}.${o(14)}`,
            `D  .${o(15)}.${o(15)}`,
            ...rows('C B', `.${o(14)}${_(2)}${o(14)}`),
            `A  .${o(15)}.${o(15)}`,
          ] },
        ] }],
      },
    ],
  },

  {
    id: 'sudarshan', name: 'Sudarshan 35mm', short: 'Sudarshan 35mm', area: 'RTC X Roads',
    lat: 17.4062, lng: 78.4955, single: true, source: 'bms', tags: ['Single screen', 'Two balconies'],
    movies: ['deccan'],
    hall: {
      // Seat map matched to BookMyShow (14 Nov 2026): 1,211 seats in four classes, each with its own
      // row letters starting at A nearest the screen. Seats shown as sold on BookMyShow are kept as
      // seats. Columns are 0.5 m apart and shared by every row (like the BookMyShow canvas), so the
      // aisles line up: the upper balcony's middle blocks have a void in rows F-H and E (a 5-seat gap,
      // the projection-box cut-out); in the second class the right block steps in behind row B.
      name: 'Main Screen · 35mm', format: '35MM', screenNote: '55 ft wide, Scope 2.39:1 (hyderabadtheatres.com)',
      screen: { w: 16.76, h: 7.01, bottom: 2.2, curve: 0 },
      firstRow: 7.0, riser: 0.14, colW: 0.5, // first row ≥ 0.42 × screen width
      sections: [
        // Stalls: ₹100 second class at the front, ₹150 first class behind it (under the lower balcony)
        { name: 'Stalls', grid: [
          { tier: 'prime', label: 'First Class', prefix: 'First', price: 150, rows: [
            `C  ${S([1, 40])}`,
            `B  ${S([1, 40])}`,
            `A  ${S([0, 44])}`,
          ] },
          { tier: 'classic', label: 'Second Class', prefix: 'Second', price: 100, rows: [
            `G  ${S([0, 16], [20, 16])}`,
            `F  ${S([0, 16], [20, 17])}`,
            `E  ${S([0, 17], [21, 17])}`,
            `D  ${S([0, 17], [21, 17])}`,
            `C  ${S([0, 18], [22, 18])}`,
            `B  ${S([0, 20], [24, 19])}`,
            `A  ${S([1, 42])}`,
          ] },
        ] },
        // Lower balcony, ₹200: over the first class
        { name: 'Lower Balcony', balcony: { lift: 2.6, overhang: 3 }, riser: 0.3, grid: [
          { tier: 'balcony', label: 'Lower Balcony', prefix: 'Lower', price: 200, rows: [
            `H  ${S([0, 13], [14, 14], [29, 13])}`,
            ...rows('G F', S([0, 12], [14, 14], [32, 12])),
            ...rows('E D C', S([0, 12], [14, 15], [32, 12])),
            `B  ${S([0, 12], [14, 16], [33, 11])}`,
            `A  ${S([1, 40])}`,
          ] },
        ] },
        // Upper balcony, ₹200: the raised tier at the very back, seen stacked behind the lower balcony
        { name: 'Upper Balcony', balcony: { stack: true, lift: 0.8, gap: 1 }, riser: 0.3, grid: [
          { tier: 'balcony', label: 'Upper Balcony', prefix: 'Upper', price: 200, pitch: 0.9, rows: [
            `Q  ${S([7, 6], [15, 4], [28, 3], [34, 6])}`,
            `P  ${S([6, 6], [14, 3], [27, 3], [33, 6])}`,
            ...rows('O N M L K J I', S([4, 8], [14, 16], [33, 8])),
            ...rows('H G F', S([4, 8], [14, 6], [25, 6], [33, 8])),
            `E  ${S([1, 11], [14, 6], [25, 6], [33, 9])}`,
            ...rows('D C B A', S([1, 11], [14, 15], [31, 11])),
          ] },
        ] },
      ],
    },
  },

  // ───────────── Approximate reconstructions (no seat map yet) ─────────────
  {
    id: 'sandhya', name: 'Sandhya 70mm', short: 'Sandhya 70mm', area: 'RTC X Roads',
    lat: 17.4048, lng: 78.4972, single: true, tags: ['Single screen', 'Balcony', '70mm'],
    movies: ['jatara'],
    hall: {
      name: 'Main Screen · 70mm', format: '70MM', immersive: true, screenNote: '68 ft wide, ultra-wide 2.76:1 (hyderabadtheatres.com)',
      screen: { w: 20.73, h: 7.51, bottom: 2.0, curve: 30 },
      firstRow: 8.7, riser: 0.16, aisle: 1.2, labels: 'front', // first row ≥ 0.42 × screen width
      sections: [
        { name: 'Stalls', rows: [
          { n: 4, tier: 'classic', blocks: [7, 18, 7], price: 110, label: 'Front Stalls' },
          { n: 11, tier: 'classic', blocks: [7, 20, 7], price: 150, label: 'Rear Stalls' },
        ] },
        { name: 'Balcony', balcony: { lift: 3.0, overhang: 7 }, riser: 0.48, rows: [
          { n: 8, tier: 'balcony', blocks: [7, 20, 7], price: 200 },
        ] },
      ],
    },
  },
  {
    id: 'devi', name: 'Devi 70mm', short: 'Devi 70mm', area: 'RTC X Roads',
    lat: 17.4078, lng: 78.4940, single: true, tags: ['Single screen', 'Balcony', '70mm', 'Dolby Atmos'],
    movies: ['sand'],
    hall: {
      name: 'Main Screen · 70mm', format: '70MM', immersive: true, atmos: true, screenNote: '83 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 25.3, h: 10.9, bottom: 2.1, curve: 0 },
      firstRow: 10.6, riser: 0.15, aisle: 1.2, labels: 'front', // first row ≥ 0.42 × screen width
      sections: [
        { name: 'Stalls', rows: [
          { n: 3, tier: 'classic', blocks: [6, 20, 6], price: 110, label: 'Front Stalls' },
          { n: 10, tier: 'classic', blocks: [6, 22, 6], price: 175, label: 'Rear Stalls' },
        ] },
        { name: 'Balcony', balcony: { lift: 3.6, overhang: 6 }, riser: 0.5, rows: [ // raised for the taller 83 ft screen
          { n: 6, tier: 'balcony', blocks: [6, 22, 6], price: 250 },
        ] },
      ],
    },
  },
  {
    id: 'inox', name: 'INOX GVK One', short: 'INOX GVK One', area: 'Banjara Hills',
    lat: 17.4193, lng: 78.4487, single: false, tags: ['Recliners'],
    movies: ['neon', 'orbit', 'sand'],
    hall: {
      name: 'Screen 6', format: '2D',
      screenNote: 'Recliner layout is an approximation; screens listed as 2K xenon, Dolby 7.1 (hyderabadtheatres.com)',
      screen: { w: 12, h: 5.1, bottom: 1.3, curve: 0 },
      firstRow: 5.0, riser: 0.45, aisle: 1.3, labels: 'back',
      sections: [{ name: 'Lounge', rows: [
        { n: 5, tier: 'recliner', blocks: [3, 6, 3], price: 950 },
      ] }],
    },
  },
  {
    id: 'inorbit', name: 'PVR Inorbit', short: 'PVR Inorbit', area: 'Madhapur',
    lat: 17.4344, lng: 78.3868, single: false, tags: ['PXL', 'Recliners', 'Dolby Atmos'],
    movies: ['sand', 'orbit', 'deccan'],
    hall: {
      name: 'PXL · Screen 1', format: 'PXL', immersive: true, atmos: true,
      screenNote: 'PXL is about 55 ft (16.8 m) wide, wall-to-wall Scope (Siasat); height estimated from 2.39:1',
      screen: { w: 16.8, h: 7.0, bottom: 1.2, curve: 0 },
      firstRow: 6.4, riser: 0.52, aisle: 1.1, labels: 'back',
      sections: [{ name: 'Stalls', rows: [
        { n: 2, tier: 'classic', blocks: [4, 14, 4], price: 350 },
        { n: 9, tier: 'prime', blocks: [5, 16, 5], price: 450 },
        { n: 2, tier: 'recliner', blocks: [3, 10, 3], price: 750 },
      ] }],
    },
  },
  {
    id: 'cinepolis', name: 'Cinépolis CCPL', short: 'Cinépolis', area: 'Malkajgiri',
    lat: 17.4532, lng: 78.5255, single: false, tags: ['Recliners'],
    movies: ['neon', 'jatara', 'deccan'],
    hall: {
      name: 'Screen 2 · Standard', format: '2D',
      screen: { w: 12.5, h: 5.3, bottom: 1.4, curve: 0 },
      firstRow: 4.6, riser: 0.3, aisle: 1.0, labels: 'back',
      sections: [{ name: 'Stalls', rows: [
        { n: 2, tier: 'classic', blocks: [4, 10, 4], price: 160 },
        { n: 7, tier: 'prime', blocks: [4, 11, 4], price: 220 },
        { n: 1, tier: 'recliner', blocks: [2, 7, 2], price: 420 },
      ] }],
    },
  },
  // ───────────── Read from BookMyShow seat objects (20–21 Nov 2026): one hall per cinema, the biggest ─────────────
  {
    id: 'aparna-nallagandla', name: 'Aparna Cinemas Nallagandla', short: 'Aparna Cinemas', area: 'Nallagandla',
    lat: 17.4669, lng: 78.3104, single: false, source: 'bms', tags: ['Dolby Atmos', '4K Laser', 'Recliners'],
    hall: {
      // BookMyShow seat objects, 292 seats (SCREEN 5, read 21 Nov 2026). Biggest of: SCREEN 3[VIP SCREEN]=52; SCREEN 6[INFINITY VISION DOLBY ATMOS]=185; SCREEN 5[INFINITY VISION DOLBY ATMOS]=292; SCREEN 7[INFINITY VISION DOLBY ATMOS]=246; SCREEN 4[INFINITY VISION DOLBY ATMOS]=193; SCREEN 2[4K DOLBY 7.1]=120; SCREEN 1[4K DOLBY 7.1]=120
      name: 'Screen 5 · Infinity Vision', format: 'LARGE', atmos: true, screenNote: '48.4 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 14.75, h: 7.08, bottom: 1.2, curve: 0 },
      firstRow: 5.9, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'prime', label: 'Gold', price: 350, rows: [
            'R  ..oooo...oooooooo',
            'Q  .ooooo...oooooooooo',
          ] },
          { tier: 'classic', label: 'Executive', price: 200, rows: [
            'P  ooooooo.oooooooooooooo',
            'N  ooooooo.oooooooooooooo',
            'M  ooooooo.oooooooooooooo',
            'L  ooooooo.oooooooooooooo',
            'K  ooooooo.oooooooooooooo',
            'J  ooooooo.oooooooooooooo',
            'H  ooooooo.ooooooooooo',
            'G  ooooooo.ooooooooooo',
            'F  ooooooo.ooooooooooo',
            'E  ooooooo.ooooooooooo',
            'D  ooooooo.ooooooooooo',
            'C  ooooooo.ooooooooooo',
            'B  ooooooo.ooooooooooo',
          ] },
          { tier: 'lounger', label: 'Lounges', price: 200, colW: 0.7, rows: [
            'A  .ooooo...oooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'cinepolis-tnr', name: 'Cinepolis TNR North City', short: 'Cinepolis TNR', area: 'Suchitra',
    lat: 17.503, lng: 78.4773, single: false, source: 'bms', tags: ['Macro XE', 'Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 334 seats (MACROXE, read 21 Nov 2026). Biggest of: MACROXE[MACRO XE]=1
      name: 'Audi 7 · Macro XE', format: 'LARGE', atmos: true, screenNote: '57 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 17.37, h: 8.34, bottom: 1.2, curve: 0 },
      firstRow: 6.9, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Executive', price: 295, rows: [
            'N  ....ooooooooooooooooooooooooooo',
            'M  ......ooooooooooooooo...oooooooo',
            'L  ......ooooooooooooooo...oooooooo',
            'K  ......ooooooooooooooo...oooooooo',
            'J  ......ooooooooooooooo...oooooooo',
            'I  ......ooooooooooooooo...oooooooo',
            'H  ......ooooooooooooooo...oooooooo',
            '-',
            'G  oooo..ooooooooooooooo...oooooooo',
            'F  oooo..ooooooooooooooo...oooooooo',
            'E  ......ooooooooooooooo...oooooooo',
            'D  ......ooooooooooooooo...oooooooo',
            'C  ......ooooooooooooooo...oooooooo',
            'B  ......ooooooooooooooo...oooooooo',
            'A  ......ooooooooooooooo...oooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'sree-ramulu', name: 'Sree Ramulu 70MM', short: 'Sree Ramulu', area: 'Moosapet',
    lat: 17.4679, lng: 78.4292, single: true, source: 'bms', tags: ['Single screen', '70mm', '4K Laser'],
    hall: {
      // BookMyShow seat objects, 1166 seats (Sree Ramulu 029, read 21 Nov 2026). Biggest of: Sree Ramulu 029=1
      name: 'Main Screen · 70mm', format: '70MM', screenNote: '70 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 21.34, h: 10.24, bottom: 1.2, curve: 0 },
      firstRow: 9.0, riser: 0.25,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'First Class', prefix: 'First', price: 150, rows: [
            'A  ooooooooooooooooooooooooooooooooooooooooooooooo',
            'B  oooooooooo..ooooooooooo.ooooooooooo..oooooooooo',
            'C  oooooooooo..ooooooooooo.ooooooooooo..ooooooooo',
            'D  ooooooooo...ooooooooooo.ooooooooooo..ooooooooo',
            'E  oooooooooo..ooooooooooo.ooooooooooo..ooooooooo',
          ] },
          { tier: 'classic', label: 'Second Class', prefix: 'Second', price: 50, rows: [
            'A  ooooooooooooooooooooooooooooooooooooooooooooooooo',
            'B  oooooooooo..ooooooooooo..ooooooooooo.ooooooooooo',
            'C  oooooooooo..ooooooooooo..ooooooooooo.oooooooooo',
            'D  oooooooooo..ooooooooooo..ooooooooooo.oooooooooo',
            'E  oooooooooo..ooooooooooo..ooooooooooo.oooooooooo',
            'F  oooooooooo..oooo',
          ] },
        ] },
        { name: 'Balcony', balcony: { stack: true, lift: 1.2, gap: 1 }, riser: 0.3, grid: [
          { tier: 'balcony', label: 'Box A', prefix: 'Box A', price: 175, rows: [
            '1  ooooooooooo',
          ] },
          { tier: 'balcony', label: 'Box B', prefix: 'Box B', price: 175, rows: [
            '1  ooooooooooo',
          ] },
          { tier: 'balcony', label: 'Balcony', price: 175, rows: [
            'A  oooooooooooooooooooooooooooooooooooooooooooooo',
            'B  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'C  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'D  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'E  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'F  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'G  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'H  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'I  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'J  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'K  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            'L  oooooooooo.ooooooooooo.ooooooooooo.oooooooooo',
            '-',
            'M  oooooooooo.ooooooooo...oooooooooo..oooooooooo',
            'N  oooooooooo.ooooooooo...oooooooooo..oooooooooo',
            'O  oooooooooo.ooooooooo...oooooooooo..oooooooooo',
            'P  oooooooooo.ooooooooo...oooooooooo..oooooooooo',
            'Q  ooooooooo..ooooooooo...oooooooooo..ooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'miraj-cinetown', name: 'Miraj Cinemas CineTown', short: 'Miraj CineTown', area: 'Miyapur',
    lat: 17.4956, lng: 78.3533, single: false, source: 'bms', tags: ['Dolby 7.1'],
    hall: {
      // BookMyShow seat objects, 702 seats (SCREEN 1, read 21 Nov 2026). Biggest of: SCREEN 1=702; SCREEN 2=702; SCREEN 3=313
      name: 'Screen 1', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 16.0, h: 7.68, bottom: 1.2, curve: 0 },
      firstRow: 6.4, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Executive', price: 175, rows: [
            'A:1/26  oooooooooo.................oooooooooo',
            'B:3/26  ..ooooooooo................ooooooooo',
            'C:3/26  ..ooooooooo................ooooooooo',
            'D:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'E:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'F:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'G:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'H:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            '-',
            'I:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'J:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'K:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'L:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'M:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'N:3  ..ooooooooo.oooooooooooooo.ooooooooo',
          ] },
          { tier: 'prime', label: 'Gold', price: 235, rows: [
            'O  ..oooooo.....oooooooooo.....oooooo',
          ] },
          { tier: 'prime', label: 'Executivep', price: 175, rows: [
            'P:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'Q:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'R:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'S:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'T:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'U:3  ..ooooooooo.oooooooooooooo.ooooooooo',
            'V:7  ......ooooo.oooooooooooooo.ooooo',
            '-',
            'W  oooooooooooooooooooooooooooooooo',
            'X:2/10/26  .ooooo...oooooooooooooo..ooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'inox-gsm', name: 'INOX GSM Mall', short: 'INOX GSM Mall', area: 'Madinaguda',
    lat: 17.4964, lng: 78.3357, single: false, source: 'bms', tags: ['Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 403 seats (SCREEN 1, read 21 Nov 2026). Biggest of: SCREEN 2[ATMOS]=304; SCREEN 1[ATMOS]=403; SCREEN 4=152; SCREEN 3=192; SCREEN 6=163; SCREEN 8=205; SCREEN 5=153; SCREEN 7=119
      name: 'Screen 1', format: '2D', atmos: true, screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 10.5, h: 5.04, bottom: 1.2, curve: 0 },
      firstRow: 4.2, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'prime', label: 'Royal', price: 354, rows: [
            'A  oooooooooooooo........ooo',
          ] },
          { tier: 'classic', label: 'Executive', price: 295, rows: [
            'B  ooooo.oooooooooooooo.oooo',
            'C  ooooo.oooooooooooooo.oooo',
            'D  ooooo.oooooooooooooo.oooo',
            'E  ooooo.oooooooooooooo.oooo',
            'F  ooooo.oooooooooooooo.oooo',
            'G  ooooo.oooooooooooooo.oooo',
            'H  ooooo.oooooooooooooo.oooo',
            'I  ooooo.oooooooooooooo.oooo',
            'J  ooooo.oooooooooooooo.oooo',
            '-',
            'K  ooooo.oooooooooooooo.oooo',
            'L  ooooo.oooooooooooooo.oooo',
            'M  ooooo.oooooooooooooo',
            'N  ooooo.oooooooooooooo',
            'O  ooooo.oooooooooooooo',
            'P  ooooo.oooooooooooooo',
            'Q  ooooo.oooooooooooooo',
            'R  ooooo.oooooooooooooo',
            'S  ooooo.oooooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'moviemax-amr', name: 'MovieMax AMR Planet Mall', short: 'MovieMax AMR', area: 'ECIL',
    lat: 17.4631, lng: 78.5607, single: false, source: 'bms', tags: ['Laser', 'Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 242 seats (SCREEN3, read 21 Nov 2026). Biggest of: SCREEN2[LASER & 7.1]=236; SCREEN7[DOLBY 7.1  ]=182; SCREEN5[ATMOS]=240; SCREEN4[DOLBY 7.1  ]=212; SCREEN1[LASER & 7.1]=239; SCREEN6[LASER & 7.1]=184; SCREEN3[ATMOS + LASER]=242
      name: 'Screen 3', format: 'LASER', atmos: true, screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 11.0, h: 5.28, bottom: 1.2, curve: 0 },
      firstRow: 4.4, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliner', price: 354, colW: 0.7, rows: [
            'A  oooooooo.oooo',
          ] },
          { tier: 'prime', label: 'Prime', price: 295, rows: [
            'B  oooo..oooooooooooooo',
            'C  oooo..oooooooooooooo',
            '-',
            'D  oooo..oooooooooooooo..oooo',
            'E  oooo..oooooooooooooo..oooo',
            'F  oooo..oooooooooooooo..oooo',
            'G  oooo..oooooooooooooo..oooo',
            'H  oooo..oooooooooooooo',
            'I  oooo..oooooooooooooo',
            'J  oooo..oooooooooooooo',
            'K  oooo..oooooooooooooo',
          ] },
          { tier: 'classic', label: 'Classic', price: 250, rows: [
            'L  oooo..oooooooooooooo',
            'M  oooo..oooo.oooo.oooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'pvr-lakeshore', name: 'PVR Lakeshore Mall', short: 'PVR Lakeshore', area: 'Kukatpally Y Junction',
    lat: 17.4771, lng: 78.4223, single: false, source: 'bms', tags: ['PXL', 'Dolby Atmos', 'DTS:X'],
    hall: {
      // BookMyShow seat objects, 293 seats (PXL Audi 6, read 21 Nov 2026). Biggest of: PXL Audi 6[PXL]=1
      name: 'Audi 6 · P[XL]', format: 'PXL', atmos: true, screenNote: '55 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 16.76, h: 8.04, bottom: 1.2, curve: 0 },
      firstRow: 6.7, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliner', price: 354, colW: 0.7, rows: [
            'Q  oo.......oooooooooo....oo',
          ] },
          { tier: 'prime', label: 'Prime', price: 295, rows: [
            'P  oooo..ooooooooooooo..oooo',
            'N  oooo..ooooooooooooo..oooo',
            'M  oooo..ooooooooooooo..oooo',
            'L  oooo..ooooooooooooo..oooo',
          ] },
          { tier: 'classic', label: 'Classic', price: 295, rows: [
            'K  oooo..ooooooooooooo..oooo',
            'J  oooo..ooooooooooooo..oooo',
            'H  oooo..ooooooooooooo..oooo',
            'G  oooo..ooooooooooooo..oooo',
            'F  oooo..ooooooooooooo..oooo',
            'E  oooo..ooooooooooooo..oooo',
            'D  oooo..ooooooooooooo..oooo',
            'C  oooo..ooooooooooooo..oooo',
            'B  oooo..ooooooooooooo',
          ] },
          { tier: 'lounger', label: 'Lounger', price: 354, colW: 0.7, rows: [
            'A  ........oooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'cineverse-uppal', name: 'Cineverse Multiplex Uppal', short: 'Cineverse Uppal', area: 'Uppal',
    lat: 17.402, lng: 78.5719, single: false, source: 'bms', tags: ['Laser', 'Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 496 seats (5.MAGNUS, read 21 Nov 2026). Biggest of: 3.CLASSIC[2K DOLBY]=197; 5.MAGNUS[4K RGB LASER LARGE SCREEN DOLBY ATMOS]=496; 2.VINTAGE[7.1 DOLBY]=198; 4.BELLEZIA[4K RGB LASER LARGE SCREEN DOLBY 7.1]=475; 1.RETRO[7.1 DOLBY]=150
      name: 'Screen 5 · Magnus', format: 'LARGE', atmos: true, screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 13.5, h: 6.48, bottom: 1.2, curve: 0 },
      firstRow: 5.4, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'semi', label: 'Platinum Sofa', price: 350, colW: 0.7, rows: [
            'A  oooo.ooooooooooooooo',
          ] },
          { tier: 'prime', label: 'Gold', prefix: 'Gold', price: 295, rows: [
            'A  oooooooo.ooooooooooooooo.ooooooo',
            'B  oooooooo.ooooooooooooooo.ooooooo',
            'C  oooooooo.ooooooooooooooo.ooooooo',
            'D  oooooooo.ooooooooooooooo.ooooooo',
            'E  oooooooo.ooooooooooooooo.ooooooo',
            'F  oooooooo.ooooooooooooooo.ooooooo',
            'G  oooooooo.ooooooooooooooo.ooooooo',
            'H  oooooooo.ooooooooooooooo.ooooooo',
            'I  oooooooo.ooooooooooooooo.ooooooo',
            'J  ....oooo.ooooooooooooooo.ooooooo',
            '-',
            'K  ....oooo.ooooooooooooooo.ooooooo',
            'L  ....oooo.ooooooooooooooo.ooooooo',
            'M  ....oooo.ooooooooooooooo.ooooooo',
            'N  ....oooo.ooooooooooooooo.ooooooo',
            'O  ....oooo.ooooooooooooooo.ooooooo',
            'P  ....oooo.ooooooooooooooo.ooooooo',
            'Q  ....oooo.ooooooooooooooo.oooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'cinepolis-lulu', name: 'Cinepolis Lulu Mall', short: 'Cinepolis Lulu', area: 'Kukatpally',
    lat: 17.4901, lng: 78.3933, single: false, source: 'bms', tags: ['Laser'],
    hall: {
      // BookMyShow seat objects, 295 seats (AUDI 04, read 21 Nov 2026). Biggest of: AUDI 02[2K LASER DOLBY 7.1]=293; AUDI 04[4K LASER]=295; AUDI 01[2K LASER DOLBY 7.1]=253; AUDI 03[2K LASER DOLBY 7.1]=293; AUDI 05[2K LASER DOLBY 7.1]=293
      name: 'Audi 4', format: 'LASER', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 12.0, h: 5.76, bottom: 1.2, curve: 0 },
      firstRow: 4.8, riser: 0.35, rtl: true,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'VIP', price: 354, colW: 0.7, rows: [
            'O  oo..oo..oo.oo.oo.oo.oo',
            'N  oo..oo..oo.oo.oo.oo.oo',
          ] },
          { tier: 'classic', label: 'Normal', price: 199, rows: [
            'M  oooooo..oooooooooooooo',
            'L  oooooo..oooooooooooooo',
            'K  oooooo..oooooooooooooo',
            'J  oooooo..oooooooooooooo',
            'I  oooooo..oooooooooooooo',
            '-',
            'H  oooooo..oooooooooooooo..oooo',
            'G  oooooo..oooooooooooooo..oooo',
            'F  oooooo..oooooooooooooo',
            'E  oooooo..oooooooooooooo',
            'D  oooooo..oooooooooooooo',
            'C  oooooo..oooooooooooooo',
            'B  oooooo..oooooooooooooo',
            'A  oooooo..ooooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'gpr-nizampet', name: 'GPR Multiplex Nizampet', short: 'GPR Multiplex', area: 'Nizampet',
    lat: 17.4993, lng: 78.3907, single: false, source: 'bms', tags: ['Laser', 'Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 683 seats (SCREEN 3, read 21 Nov 2026). Biggest of: SCREEN 3[Dolby Atmos]=683; SCREEN 2=230; SCREEN 1=230
      name: 'Screen 3', format: 'LASER', atmos: true, screenNote: '54 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 16.46, h: 7.9, bottom: 1.2, curve: 0 },
      firstRow: 6.6, riser: 0.35, rtl: true,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliner', price: 350, colW: 0.7, rows: [
            'A  ooo..oooooooooooooooooooooo',
          ] },
          { tier: 'prime', label: 'Gold', price: 200, rows: [
            'B  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'C  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'D  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'E  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'F  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'G  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'H  ........oooooooooooooo.oooooooooooooo.oooo',
            '-',
            'I:5  .oooooo.oooooooooooooo.oooooooooooooo',
            'J  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'K  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'L  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'M  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'N  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'O  .oooooo.oooooooooooooo.oooooooooooooo.oooo',
            'P  .oooooo.oooooooooooooo.oooooooooooooo',
            'Q  .oooooo.oooooooooooooo.oooooooooooooo',
            'R  .oooooo.oooooooooooooo.oooooooooooooo',
            '-',
            'S  .oooooo.oooooooooooooo.oooooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'asian-cinemart', name: 'Asian Cinemart RC Puram', short: 'Asian Cinemart', area: 'RC Puram',
    lat: 17.5107, lng: 78.2952, single: false, source: 'bms', tags: ['4K'],
    hall: {
      // BookMyShow seat objects, 387 seats (SCREEN 1, read 21 Nov 2026). Biggest of: SCREEN 3[4K DOLBY 7.1]=212; SCREEN 4[4K DOLBY 7.1]=125; SCREEN 2[4K DOLBY 7.1]=319; SCREEN 5[4K DOLBY 7.1]=125; SCREEN 1[4K DOLBY 7.1]=387
      name: 'Screen 1', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 12.0, h: 5.76, bottom: 1.2, curve: 0 },
      firstRow: 4.8, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'semi', label: 'Sofa', price: 250, colW: 0.7, rows: [
            'A  ...ooo.oooooooooooooooooo',
          ] },
          { tier: 'prime', label: 'Platinum', price: 200, rows: [
            'B  oooooo.oooooooooooooo.oooooo',
            'C  oooooo.oooooooooooooo.oooooo',
            'D  oooooo.oooooooooooooo.oooooo',
            'E  oooooo.oooooooooooooo.oooooo',
            'F  oooooo.oooooooooooooo.oooooo',
            'G  oooooo.oooooooooooooo.oooooo',
            'H  oooooo.oooooooooooooo.oooooo',
            'I  oooooo.oooooooooooooo.oooooo',
            'J  oooooo.oooooooooooooo.oooooo',
            '-',
            'K  ....oo.oooooooooooooo.oooooo',
            'L  ....oo.oooooooooooooo.oooooo',
            'M  ....oo.oooooooooooooo.oooooo',
            'N  ....oo.oooooooooooooo.oooooo',
            'O  ....oo.oooooooooooooo.oooooo',
            'P  ....oo.oooooooooooooo.oooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'sai-ranga', name: 'Sai Ranga 70MM', short: 'Sai Ranga', area: 'Miyapur',
    lat: 17.4955, lng: 78.3597, single: true, source: 'bms', tags: ['Single screen', '70mm', '4K Laser'],
    hall: {
      // BookMyShow seat objects, 1055 seats (Sai Ranga, read 21 Nov 2026). Biggest of: Sai Ranga[Christie 4k Laser]=1
      name: 'Main Screen · 70mm', format: '70MM', screenNote: '58.6 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 17.86, h: 8.57, bottom: 1.2, curve: 0 },
      firstRow: 7.5, riser: 0.25,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Dress Circle', prefix: 'Dress Circle', price: 150, rows: [
            'A  oooooooooooooooooooooooooooooooooooo',
            'B  .oooooooooooooooo.ooooooooooooooooo',
            'C  .oooooooooooooooo.ooooooooooooooooo',
            'D  .oooooooooooooooo.ooooooooooooooooo',
            'E  .oooooooooooooooo.ooooooooooooooooo',
          ] },
          { tier: 'classic', label: 'Lower Class', prefix: 'Lower', price: 50, rows: [
            'A  oooooooooooooooooooooooooooooooooooooooo',
            'B  .oooooooooooooooooo.ooooooooooooooooooo',
            'C  .oooooooooooooooooo.ooooooooooooooooooo',
            'D  .oooooooooooooooooo.ooooooooooooooooooo',
            'E  .oooooooooooooooooo.ooooooooooooooooooo',
            'F  .........oooooooooo.oooooooooo',
          ] },
        ] },
        { name: 'Balcony', balcony: { stack: true, lift: 1.2, gap: 1 }, riser: 0.3, grid: [
          { tier: 'balcony', label: 'Upper Balcony', price: 175, rows: [
            'A  oooooooooooooooooooooooooooooooooo',
            'B  ooooooooooooooooooo...oooooooooooo',
            'C  ooooooooooooooooooo...oooooooooooo',
            'D  ooooooooooooooooooo...oooooooooooo',
            'E  ooooooooooooooooooo...oooooooooooo',
            'F  ooooooooooooooooooo...oooooooooooo',
            'G  oooooo....ooooooooo...ooooooooo',
            'H  oooooo....oooooooo....ooooooooo',
            'I  oooooo....oooooooo....ooooooooo',
            'J  oooooo....oooooooo....ooooooooo',
            'K  oooooo....oooooooo....ooooooooo',
          ] },
          { tier: 'balcony', label: 'Lower Balcony', price: 175, rows: [
            'L  oooooooooooooooooooooooooooooooooo',
            'M  ooooooooooooooo...oooooooooooooooo',
            'N  ooooooooooooooo...oooooooooooooooo',
            'O  ooooooooooooooo...oooooooooooooooo',
            'P  ooooooooooooooo...oooooooooooooooo',
            'Q  ooooooooooooooo...oooooooooooooooo',
            'R  ooooooooooooooo...oooooooooooooooo',
            'S  ooooooooooooooo...oooooooooooooooo',
            'T  ooooooooooooooo...ooooooooooooooo',
            '-',
            'U  ooooooooooooooo...oooooooooooooooo',
            'V  ooooooooooooooo...oooooooooooooooo',
            'W  ooooooooooooooo...oooooooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'bhramaramba', name: 'Bhramaramba 70MM', short: 'Bhramaramba', area: 'Kukatpally',
    lat: 17.5002, lng: 78.3866, single: true, source: 'bms', tags: ['Single screen', '70mm'],
    hall: {
      // BookMyShow seat objects, 861 seats (BHRAMARAMBA 70MM, read 21 Nov 2026). Biggest of: BHRAMARAMBA 70MM=1
      name: 'Main Screen · 70mm', format: '70MM', screenNote: '70 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 21.34, h: 10.24, bottom: 1.2, curve: 0 },
      firstRow: 9.0, riser: 0.25,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Dress Circle', prefix: 'Dress Circle', price: 150, rows: [
            'A  .ooooooooooooooooooooooooooooooooooo',
            'B  oooooo..ooooooooooooooooooo...oooooo',
            'C  oooooo..ooooooooooooooooooo...oooooo',
            'D  oooooo..ooooooooooooooooooo...oooooo',
            'E  oooooo..ooooooooooooooooooo...oooooo',
            'F  oooooo..ooooooooooooooooooo...oooooo',
          ] },
          { tier: 'classic', label: 'First Class', prefix: 'First', price: 50, rows: [
            'A  oooooooooooooooooooooooooooooooooooooo',
            'B  oooooo..ooooooooooooooooooooo...oooooo',
            'C  oooooo..ooooooooooooooooooooo...oooooo',
            'D  oooooo..ooooooooooooooooooooo...oooooo',
            'E  oooooo..ooooooooooooooooooooo...oooooo',
          ] },
        ] },
        { name: 'Balcony', balcony: { stack: true, lift: 1.2, gap: 1 }, riser: 0.3, grid: [
          { tier: 'balcony', label: 'Box', price: 175, rows: [
            'A  ....................ooooooooooooo',
          ] },
          { tier: 'balcony', label: 'Maharaja Circle', prefix: 'Maharaja Circle', price: 175, rows: [
            'A  .oooooooo.oooooooooooooooo..oooooo',
            'B  oooooo...oooooooooooooooo...oooooo',
            'C  oooooo...oooooooooooooooo...oooooo',
            'D  oooooo...oooooooooooooooo...oooooo',
            'E  oooooo..oooooooooooooooooo..oooooo',
            'F  oooooo..oooooooooooooooooo..oooooo',
            'G  oooooo..oooooooooooooooooo..oooooo',
            'H  oooooo..oooooooooooooooooo..oooooo',
            'I  oooooo..oooooooooooooooooo..oooooo',
            'J  oooooo..oooooooooooooooooo..oooooo',
            'K  oooooo..oooooooooooooooooo..oooooo',
            'L  oooooo..oooooooooooooooooo..oooooo',
            'M  oooooo..oooooooooooooooooo..oooooo',
            'N  oooooo..ooooooo....ooooooo..oooooo',
            'O  oooooo..ooooooo....ooooooo..oooooo',
            'P  oooooo..ooooooo....ooooooo..oooooo',
            'Q  oooooo..ooooooo....ooooooo..oooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'mallikarjuna', name: 'Mallikarjuna 70MM', short: 'Mallikarjuna', area: 'Kukatpally',
    lat: 17.4999, lng: 78.3866, single: true, source: 'bms', tags: ['Single screen', '70mm', 'DTS'],
    hall: {
      // BookMyShow seat objects, 861 seats (MALLIKARJUNA 70MM, read 21 Nov 2026). Biggest of: MALLIKARJUNA 70MM=1
      name: 'Main Screen · 70mm', format: '70MM', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 16.5, h: 7.92, bottom: 1.2, curve: 0 },
      firstRow: 6.9, riser: 0.25,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Dress Circle', prefix: 'Dress Circle', price: 100, rows: [
            'A  .ooooooooooooooooooooooooooooooooooo',
            'B  oooooo..ooooooooooooooooooo...oooooo',
            'C  oooooo..ooooooooooooooooooo...oooooo',
            'D  oooooo..ooooooooooooooooooo...oooooo',
            'E  oooooo..ooooooooooooooooooo...oooooo',
            'F  oooooo..ooooooooooooooooooo...oooooo',
          ] },
          { tier: 'classic', label: 'First Class', prefix: 'First', price: 50, rows: [
            'A  oooooooooooooooooooooooooooooooooooooo',
            'B  oooooo..ooooooooooooooooooooo...oooooo',
            'C  oooooo..ooooooooooooooooooooo...oooooo',
            'D  oooooo..ooooooooooooooooooooo...oooooo',
            'E  oooooo..ooooooooooooooooooooo...oooooo',
          ] },
        ] },
        { name: 'Balcony', balcony: { stack: true, lift: 1.2, gap: 1 }, riser: 0.3, grid: [
          { tier: 'balcony', label: 'Box', price: 150, rows: [
            'A  .....................ooooooooooooo',
          ] },
          { tier: 'balcony', label: 'Maharaja Circle', prefix: 'Maharaja Circle', price: 150, rows: [
            'A  .oooooooo.oooooooooooooooo..oooooo',
            'B  oooooo...oooooooooooooooo...oooooo',
            'C  oooooo...oooooooooooooooo...oooooo',
            'D  oooooo...oooooooooooooooo...oooooo',
            'E  oooooo..oooooooooooooooooo..oooooo',
            'F  oooooo..oooooooooooooooooo..oooooo',
            'G  oooooo..oooooooooooooooooo..oooooo',
            'H  oooooo..oooooooooooooooooo..oooooo',
            'I  oooooo..oooooooooooooooooo..oooooo',
            'J  oooooo..oooooooooooooooooo..oooooo',
            'K  oooooo..oooooooooooooooooo..oooooo',
            'L  oooooo..oooooooooooooooooo..oooooo',
            'M  oooooo..oooooooooooooooooo..oooooo',
            'N  oooooo..ooooooo....ooooooo..oooooo',
            'O  oooooo..ooooooo....ooooooo..oooooo',
            'P  oooooo..ooooooo....ooooooo..oooooo',
            'Q  oooooo..ooooooo....ooooooo..oooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'asian-mcube', name: 'Asian M Cube Mall Attapur', short: 'Asian M Cube', area: 'Attapur',
    lat: 17.3717, lng: 78.4302, single: false, source: 'bms', tags: ['Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 356 seats (SCREEN 1, read 21 Nov 2026). Biggest of: SCREEN 4[4K DOLBY ATMOS]=320; SCREEN 1[DOLBY 7.1]=356; SCREEN 3[DOLBY 7.1]=352; SCREEN 2[DOLBY 7.1]=324
      name: 'Screen 1', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 10.5, h: 5.04, bottom: 1.2, curve: 0 },
      firstRow: 4.2, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'prime', label: 'Gold', price: 200, rows: [
            'A  oooooooooooo.oooooooooooo',
            'B  .oooo.oooooooooooo.oooooo',
            'C  .oooo.oooooooooooo.oooooo',
            'D  .oooo.oooooooooooo.oooooo',
            'E  .oooo.oooooooooooo.oooooo',
            'F  .oooo.oooooooooooo.oooooo',
            'G  .oooo.oooooooooooo.oooooo',
            'H  .oooo.oooooooooooo.oooooo',
            '-',
            'I  .oooo.oooooooooooo.oooooo',
            'J  .oooo.oooooooooooo.oooooo',
            'K  .oooo.oooooooooooo.oooooo',
            'L  .oooo.oooooooooooo.oooooo',
            'M  ......oooooooooooo.oooooo',
            'N  ......oooooooooooo.oooooo',
            'O  ......oooooooooooo.oooooo',
            'P  ......oooooooooooo.oooooo',
            'Q  ......oooooooooooo.oooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'cinepolis-dsl', name: 'Cinepolis DSL Virtue Mall', short: 'Cinepolis DSL', area: 'Uppal',
    lat: 17.4005, lng: 78.5548, single: false, source: 'bms', tags: ['Dolby 7.1'],
    hall: {
      // BookMyShow seat objects, 245 seats (AUDI02, read 21 Nov 2026). Biggest of: AUDI02=245; AUDI05=168; AUDI06=209; AUDI03=245; AUDI01=209; AUDI04=164
      name: 'Audi 2', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 11.0, h: 5.28, bottom: 1.2, curve: 0 },
      firstRow: 4.4, riser: 0.35, rtl: true,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'VIP', price: 354, colW: 0.7, rows: [
            'M  oo.oo.oo.oo.oo.oo..oo',
          ] },
          { tier: 'classic', label: 'Executive', price: 295, rows: [
            'L  oooo..oooooooooooooo',
            'K  oooo..oooooooooooooo',
            'J  oooo..oooooooooooooo',
            '-',
            'I  oooo..oooooooooooooo..oooo',
            'H  oooo..oooooooooooooo..oooo',
            'G  oooo..oooooooooooooo..oooo',
            'F  oooo..oooooooooooooo..oooo',
            'E  oooo..oooooooooooooo',
            'D  oooo..oooooooooooooo',
            'C  oooo..oooooooooooooo',
          ] },
          { tier: 'classic', label: 'Normal', price: 295, rows: [
            'B  oooo..oooooooooooooo',
            'A  oooo...ooooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'gokul', name: 'Gokul 70MM', short: 'Gokul 70MM', area: 'Erragadda',
    lat: 17.4536, lng: 78.4344, single: true, source: 'bms', tags: ['Single screen', '70mm', 'DTS'],
    hall: {
      // BookMyShow seat objects, 981 seats (GOKUL 70MM A/C DTS, read 21 Nov 2026). Biggest of: GOKUL 70MM A/C DTS=1
      name: 'Main Screen · 70mm', format: '70MM', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 16.5, h: 7.92, bottom: 1.2, curve: 0 },
      firstRow: 6.9, riser: 0.25,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'First Class', prefix: 'First', price: 100, rows: [
            'A  ...oooooooo.ooooooooooooo.oooooooo',
            'B  ...oooooooo.ooooooooooooo.oooooooo',
            'C  ...oooooooo.ooooooooooooo.oooooooo',
            'D  ...oooooooo.ooooooooooooo.oooooooo',
            'E  ...oooooooo.ooooooooooooo.oooooooo',
            'F  ...oooooooo.ooooooooooooo.oooooooo',
          ] },
          { tier: 'classic', label: 'Second Class', prefix: 'Second', price: 50, rows: [
            'A  oooooooooooooooooooooooooooooooooooooo',
            'B  oooooooo..ooooooooooooooooooo..oooooooo',
            'C  oooooooo..oooooooooooooooooooo..ooooooo',
            'D  ooooooooo.oooooooooooooooooo...oooooooo',
            'E  oooooo....ooooooooooooooooooo...ooooooo',
            'F  ooooo.....oooooooooooooooooo....ooooooo',
          ] },
        ] },
        { name: 'Balcony', balcony: { stack: true, lift: 1.2, gap: 1 }, riser: 0.3, grid: [
          { tier: 'balcony', label: 'Upper Balcony', price: 150, rows: [
            'A  ...oooooooooooooooooooooooooooooo',
            'B  ...ooooooo..oooooooooooo..ooooooo',
            'C  ...ooooooo..oooooooooooo..ooooooo',
            'D  ...ooooooo..oooooooooooo..ooooooo',
            'E  ...ooooooo..oooooooooooo..ooooooo',
            'F  ....oooooo..oooooooooooo..oooooo',
            'G  ...ooooooo..oooooooooooo..ooooooo',
            'H  ...ooooooo..oooooooooooo..ooooooo',
            'I  ...ooooooo..oooooooooooo..ooooooo',
            'J  ...ooooooo..oooooooooooo..ooooooo',
            'K  ...ooooooo..oooooooooooo..ooooooo',
            'L  ...ooooooo..oooooooooooo..ooooooo',
            'M  ...ooooooo..oooooooooooo..ooooooo',
          ] },
          { tier: 'balcony', label: 'Lower Balcony', price: 150, rows: [
            'N  ...ooooooo...oooooooooo...ooooooo',
            'O  ...ooooooo.oooooooooooo..oooooooo',
            'P  ...ooooooo.oooooooooooo...ooooooo',
            'Q  ...ooooooo.oooooooooooo...ooooooo',
            'R  ...ooooooo.oooooooooooo...ooooooo',
            'S  ...ooooooo.oooooooooooo..oooooooo',
            'T  ...ooooooo.oooooooooooo...ooooooo',
            'U  ...ooooooo.oooooooooooo..oooooooo',
            'V  ...ooooooo.oooooooooooo...ooooooo',
            'W  ...ooooooo.oooooooooooo..oooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'pvr-galleria', name: 'PVR Next Galleria Mall', short: 'PVR Galleria', area: 'Panjagutta',
    lat: 17.4294, lng: 78.4501, single: false, source: 'bms', tags: ['Dolby Atmos', 'Recliners'],
    hall: {
      // BookMyShow seat objects, 220 seats (AUDI 08, read 21 Nov 2026). Biggest of: AUDI 01[ATMOS]=203; AUDI 05=190; AUDI 06=144; AUDI 08[ATMOS]=220; AUDI 07=170; AUDI 04=152; AUDI 03 PLAY HOUSE[PLAYHOUSE]=54; AUDI 02=145
      name: 'Audi 8', format: '2D', atmos: true, screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 8.5, h: 4.08, bottom: 1.2, curve: 0 },
      firstRow: 4.2, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliner', price: 349, colW: 0.7, rows: [
            'M  .....ooooooo.oooo',
          ] },
          { tier: 'classic', label: 'Classic', price: 199, rows: [
            'L  oooooooooooo.ooooooo',
            '-',
            'K  oooooooooooo.ooooooo',
            'J  oooooooooooo.ooooooo',
            'H  oooooooooooo.ooooooo',
            'G  oooooooooooo.ooooooo',
            'F  oooooooooooo.ooooooo',
            'E  oooooooooooo.ooooooo',
            'D  oooooooooooo.ooooooo',
            'C  oooooooooooo.ooooooo',
            'B  oooooooooooo.ooooooo',
            'A  oooooooooooo.ooooooo',
          ] },
        ] },
      ],
    },
  },
  // ───────────── Read from BookMyShow seat objects (20 Nov 2026, second batch): the biggest hall of each ─────────────
  {
    id: 'pvr-central', name: 'PVR Central Mall', short: 'PVR Central', area: 'Panjagutta',
    lat: 17.4268, lng: 78.4532, single: false, source: 'bms', tags: ['Recliners', 'Dolby 7.1'],
    hall: {
      // BookMyShow seat objects, 416 seats (AUDI 5, read 21 Nov 2026). Biggest of: AUDI 2=234; AUDI 1=255; AUDI 3=141; AUDI 5=416; AUDI 4=255
      name: 'Audi 5', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 13.0, h: 6.24, bottom: 1.2, curve: 0 },
      firstRow: 5.2, riser: 0.35, rtl: true,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Classic', price: 295, rows: [
            'S  oooooooooooooooooooooooooooooo',
            'R  oooo..ooooooooooooooooooo..ooo',
            'Q  oooo..ooooooooooooooooooo..ooo',
            'P  oooo..ooooooooooooooooooo..ooo',
            'N  oooo..ooooooooooooooooooo..ooo',
            'M  oooo..ooooooooooooooooooo..ooo',
            'L  oooo..ooooooooooooooooooo..ooo',
            'K  oooo..ooooooooooooooooooo',
            '-',
            'J  oooo..ooooooooooooooooooo',
            'H  oooo..ooooooooooooooooooo',
            'G  oooo..ooooooooooooooooooo',
            'F  oooo..ooooooooooooooooooo',
            'E  oooo..ooooooooooooooooooo',
            'D  oooo..ooooooooooooooooooo',
            'C  oooo..ooooooooooooooooooo',
            'B  oooo..ooooooooooooooooooo',
            'A  oooo..ooooooooooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'pvr-preston', name: 'PVR Preston Prime', short: 'PVR Preston', area: 'Gachibowli',
    lat: 17.4308, lng: 78.3735, single: false, source: 'bms', tags: ['Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 256 seats (AUDI 03, read 21 Nov 2026). Biggest of: AUDI 04[ATMOS]=217; AUDI 03[ATMOS]=256; AUDI 02[ATMOS]=256; AUDI 01[ATMOS]=217
      name: 'Audi 3', format: '2D', atmos: true, screenNote: '42 ft wide (hyderabadtheatres.com); height estimated',
      screen: { w: 12.8, h: 6.14, bottom: 1.2, curve: 0 },
      firstRow: 5.1, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Classic', price: 295, rows: [
            'A:8  .......ooooooooooooooooo',
            'B:1/6/22  ooo..oooooooooooooo..ooo',
            'C:1/6/22  ooo..oooooooooooooo..ooo',
            'D:1/6/22  ooo..oooooooooooooo..ooo',
            'E:1/6/22  ooo..oooooooooooooo..ooo',
            'F:6/22  .....oooooooooooooo..ooo',
            'G:6/22  .....oooooooooooooo..ooo',
            'H:6/22  .....oooooooooooooo..ooo',
            'I:6/22  .....oooooooooooooo..ooo',
            'J:6/22  .....oooooooooooooo..ooo',
            '-',
            'K:1/6/22  ooo..oooooooooooooo..ooo',
            'L:1/6/22  ooo..oooooooooooooo..ooo',
            'M:1/6/22  ooo..oooooooooooooo..ooo',
            'N:6  .....oooooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'inox-kachiguda', name: 'INOX Maheshwari Parmeshwari', short: 'INOX Kachiguda', area: 'Kachiguda',
    lat: 17.3907, lng: 78.4884, single: false, source: 'bms', tags: ['Dolby 7.1'],
    hall: {
      // BookMyShow seat objects, 244 seats (Screen 5, read 21 Nov 2026). Biggest of: Screen 5=244; Screen 2=161; Screen 1=236; Screen 3=139; Screen 4=241
      name: 'Screen 5', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 11.5, h: 5.52, bottom: 1.2, curve: 0 },
      firstRow: 4.6, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'classic', label: 'Executive', price: 249, rows: [
            'A  ooooooooooooooooooooooooooo',
            'B:1/7/22  ooo...ooooooooooooo..oooooo',
            'C:1/7/22  ooo...ooooooooooooo..oooooo',
            'D:1/7/22  ooo...ooooooooooooo..oooooo',
            'E:7/22  ......ooooooooooooo..oooooo',
            'F:7/22  ......ooooooooooooo..oooooo',
            'G:7/22  ......ooooooooooooo..oooooo',
            'H:7/22  ......ooooooooooooo..oooooo',
            'I:7/22  ......ooooooooooooo..oooooo',
            'J:7/22  ......ooooooooooooo..oooooo',
            'K:1/7/22  ooo...ooooooooooooo..oooooo',
            'L:7/22  ......ooooooooooooo..oo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'asian-radhika', name: 'Asian Radhika Multiplex', short: 'Asian Radhika', area: 'ECIL',
    lat: 17.4767, lng: 78.5632, single: false, source: 'bms', tags: ['Dolby 7.1', '3D'],
    hall: {
      // BookMyShow seat objects, 382 seats (SCREEN 2, read 21 Nov 2026). Biggest of: SCREEN 2[2K]=382; SCREEN 1[2K]=341; SCREEN 3[2K]=201
      name: 'Screen 2', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 11.5, h: 5.52, bottom: 1.2, curve: 0 },
      firstRow: 4.6, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'prime', label: 'Box', rows: [
            'A  oo',
            'A:3  oo',
            'A:5  oo',
            'A:7/11  oo..oooooo',
            'A:9/17  oo..oooooo',
          ] },
          { tier: 'prime', label: 'Gold', prefix: 'Gold', price: 200, rows: [
            'A  ...........oooooooooooooooo',
            'B  ...........ooooooooooo..ooo',
            'C  ...........ooooooooooo..ooo',
            'D  oooooooooooooooooooooo..ooo',
            'E  oooooo.oooooooooooooo...ooo',
            'F  oooooo.oooooooooooooo',
            'G  oooooo.oooooooooooooo',
            'H  oooooo.oooooooooooooo',
            'I  oooooo.oooooooooooooo',
            'J  oooooo.oooooooooooooo',
            '-',
            'K  oooooo.oooooooooooooo..oooo',
            'L  oooooo.oooooooooooooo..oooo',
            'M  oooooo.oooooooooooooo..oooo',
            'N  oooooo.oooooooooooooo..oooo',
            'O  oooooo.oooooooooooooo..oooo',
            'P  oooooo.oooooooooooooo..oooo',
            'Q  oooooo.oooooooooooooo..oooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'miraj-shalini-shivani', name: 'Miraj Shalini Shivani', short: 'Miraj Shalini', area: 'Kothapet',
    lat: 17.3678, lng: 78.5363, single: false, source: 'bms', tags: ['Dolby 7.1', '3D'],
    hall: {
      // BookMyShow seat objects, 569 seats (SCREEN4, read 21 Nov 2026). Biggest of: SCREEN4=569; SCREEN 2=454; SCREEN 3=130; SCREEN 1=94
      name: 'Screen 4', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 15.0, h: 7.2, bottom: 1.2, curve: 0 },
      firstRow: 6.0, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'prime', label: 'Gold', price: 350, rows: [
            'A  ...ooooooooooooooooooooooooooooo',
          ] },
          { tier: 'classic', label: 'Executive', price: 295, rows: [
            'B  oooooooo..ooooooooooooooo..oooooooo',
            'C  oooooooo..ooooooooooooooo..oooooooo',
            'D  oooooooo..ooooooooooooooo..oooooooo',
            'E  oooooooo..ooooooooooooooo..oooooooo',
            'F  oooooooo..ooooooooooooooo..oooooooo',
            'G  oooooooo..ooooooooooooooo..oooooooo',
            'H  oooooooo..ooooooooooooooo..oooooooo',
            '-',
            'J  oooooooo..ooooooooooooooo..oooooooo',
            '-',
            'K  ooooooooo..ooo......oooo..oooooooo',
            'L  ooooooooo..ooo......oooo..oooooooo',
            'M  .oooooooo..ooo......oooo..oooooooo',
            'N  .oooooooo..ooo......oooo..oooooooo',
            'O  ...........oooo.....oooo..ooooooo',
            '-',
            'P  .oooooooo..oooooooooooo...ooooooo',
            'Q  ..ooooooo..oooooooooooo...ooooooo',
            'R  ..ooooooo..oooooooooooo...ooooooo',
            'S  ..ooooooo..oooooooooooo....oooooo',
            'T  ..ooooooo..oooooooooooo....oooooo',
            'U  ...oooooo..oooooooooooo....oooooo',
            'V  ......ooo..oooooooooooo....ooo',
            'W  ...........oooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'pvr-rk-cineplex', name: 'PVR RK Cineplex', short: 'PVR RK Cineplex', area: 'Banjara Hills',
    lat: 17.4232, lng: 78.4277, single: false, source: 'bms', tags: ['Dolby Atmos', 'Recliners'],
    hall: {
      // BookMyShow seat objects, 481 seats (SCREEN 1, read 21 Nov 2026). Biggest of: SCREEN 1[ATMOS]=481; SCREEN 3=270; SCREEN 2=250
      name: 'Screen 1', format: '2D', atmos: true, screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 15.0, h: 7.2, bottom: 1.2, curve: 0 },
      firstRow: 6.0, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliner', price: 354, colW: 0.7, rows: [
            'Q  ....oooooooooooooooooooooooooooo',
            'P  ....ooooo.ooooooooooo..oooooooo',
          ] },
          { tier: 'classic', label: 'Classic', price: 295, rows: [
            'N  ooooooo.oooooooooooooo.oooooooooooo',
            'M  ooooooo.oooooooooooooo.oooooooooooo',
            'L  ooooooo.oooooooooooooo.oooooooooooo',
            'K  ooooooo.oooooooooooooo.oooooooooooo',
            'J  ooooooo.oooooooooooooo.oooooooooooo',
            '-',
            'H  ooooooo.oooooooooooooo.oooooooooooo',
            'G  ooooooo.oooooooooooooo.oooooooooooo',
            'F  ooooooo.oooooooooooooo.oooooooooooo',
            'E  ooooooo.oooooooooooooo.oooooooooooo',
            'D  ooooooo.oooooooooooooo.oooooooooooo',
            'C  ooooooo.oooooooooooooo.oooooooooooo',
            'B  ooooooo.oooooooooooooo.oooooooooooo',
            'A  ooooooo.oooooooooooooo.oooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'tivoli', name: 'Tivoli Cinemas', short: 'Tivoli', area: 'Secunderabad',
    lat: 17.4481, lng: 78.4928, single: false, source: 'bms', tags: ['Laser', 'Dolby 7.1', '3D'],
    hall: {
      // BookMyShow seat objects, 757 seats (EXTREEME, read 21 Nov 2026). Biggest of: SCREEN 1[LASER DOLBY 7.1]=397; SCREEN 2[LASER DOLBY 7.1]=223; EXTREEME[DOLBY 7.1 EXTREME ]=757; SCREEN 3[SCREEN 3]=56
      name: 'Screen 4 · EXTREEME', format: 'LASER', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 16.5, h: 7.92, bottom: 1.2, curve: 0 },
      firstRow: 6.6, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'prime', label: 'Gold Upper', price: 295, rows: [
            'A  .ooooooooo',
            'B  .oooooooooo',
            'C  .oooooooooooooooooooooooooooooooooooo',
            'D  .ooooooooooo..oooooooooo..ooooooooooo',
            'E  .ooooooooooo..oooooooooo..ooooooooooo',
            'F  .ooooooooooo..oooooooooo..ooooooooooo',
            'G:1//19  .ooooooooooo..ooo....ooo..ooooooooooo',
            'H:1//19  .ooooooooooo..ooo....ooo..ooooooooooo',
            'I:1//19  .ooooooooooo..ooo....ooo..ooooooooooo',
            'J:1//19  .ooooooooooo..ooo....ooo..ooooooooooo',
            'K:1//19  .ooooooooooo..ooo....ooo..ooooooooooo',
            'L:1//19  .ooooooooooo..ooo....ooo..ooooooooooo',
            '-',
            'M  .ooooooooooo..oooooooooo..oooooooooo',
            'N  .ooooooooooo..oooooooooo..oooooooooo',
          ] },
          { tier: 'prime', label: 'Gold Lower', price: 295, rows: [
            'O  ooooooooooooooooo....ooooooooooooooooo',
            'P:1/22  .ooooooooooo.............ooooooooooo',
            'Q  .ooooooooooo.oooooooooo..ooooooooooo',
            'R  .ooooooooooo.oooooooooo..ooooooooooo',
            'S  .ooooooooooo.oooooooooo..ooooooooooo',
            'T  .ooooooooooo.oooooooooo..ooooooooooo',
            'U  .ooooooooooo.oooooooooo..ooooooooooo',
            'V  .ooooooooooo.oooooooooo..ooooooooooo',
            'W  .ooooooooooo.oooooooooo..ooooooooooo',
            'X  .ooooooooooo.oooooooooo..ooooooooooo',
            'Y  .ooooooooooo.oooooooooo..ooooooooooo',
            'Z  .ooooooooooo.oooooooooo..ooooooooooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'pvr-irrum-manzil', name: 'PVR Irrum Manzil', short: 'PVR Irrum Manzil', area: 'Irrum Manzil',
    lat: 17.4209, lng: 78.4553, single: false, source: 'bms', tags: ['4DX', 'Dolby Atmos'],
    hall: {
      // BookMyShow seat objects, 282 seats (AUDI 06, read 21 Nov 2026). Biggest of: AUDI 07=242; AUDI 04=140; AUDI 02=104; AUDI 01 4DX[4DX]=96; AUDI 06=282; AUDI 05=150; AUDI 03=168
      name: 'Audi 6', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 11.0, h: 5.28, bottom: 1.2, curve: 0 },
      firstRow: 4.4, riser: 0.35, rtl: true,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliner', price: 354, colW: 0.7, rows: [
            'M  .....oooooooooooooooo.oo',
          ] },
          { tier: 'classic', label: 'Classic', price: 295, rows: [
            'L  ooooooo.ooooooooooooo.oooo',
            '-',
            'K  ooooooo.ooooooooooooo.oooo',
            'J  ooooooo.ooooooooooooo.oooo',
            'H  ooooooo.ooooooooooooo.oooo',
            'G  ooooooo.ooooooooooooo.oooo',
            'F  ooooooo.ooooooooooooo.oooo',
            'E  ooooooo.ooooooooooooo.oooo',
            'D  ooooooo.ooooooooooooo.oooo',
            'C  ooooooo.ooooooooooooo.oooo',
            'B  ooooooo.ooooooooooooo.oooo',
            'A  ooooooo.ooooooooooooo.oooo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'cinepolis-mantra', name: 'Cinepolis Mantra Mall', short: 'Cinepolis Mantra', area: 'Attapur',
    lat: 17.3538, lng: 78.4206, single: false, source: 'bms', tags: ['Dolby 7.1'],
    hall: {
      // BookMyShow seat objects, 225 seats (AUDI04, read 21 Nov 2026). Biggest of: AUDI01=219; AUDI05=218; AUDI04=225; AUDI06=217; AUDI02=215; AUDI03=166
      name: 'Audi 4', format: '2D', screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 12.0, h: 5.76, bottom: 1.2, curve: 0 },
      firstRow: 4.8, riser: 0.35, rtl: true,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'VIP', price: 404, colW: 0.7, rows: [
            'K  oo..oo..oo..oo..oo..oo',
          ] },
          { tier: 'classic', label: 'Normal', price: 345, rows: [
            'J  oooo..oooooooooooooo',
            '-',
            'I  oooo..oooooooooooooo..oooooo',
            'H  oooo..oooooooooooooo..oooooo',
            'G  oooo..oooooooooooooo..oooooo',
            'F  oooo..oooooooooooooo..oooooo',
            'E  oooo..oooooooooooooo..oo',
            'D  oooo..oooooooooooooo..oo',
            'C  oooo..oooooooooooooo..oo',
            'B  oooo..oooooooooooooo..oo',
            'A  oooo...ooooooooooooo..oo',
          ] },
        ] },
      ],
    },
  },
  {
    id: 'inox-odeon', name: 'INOX Odeon', short: 'INOX Odeon', area: 'RTC X Roads',
    lat: 17.4056, lng: 78.4964, single: false, source: 'bms', tags: ['Dolby Atmos', 'DTS:X'],
    hall: {
      // BookMyShow seat objects, 257 seats (SCREEN 5, read 21 Nov 2026). Biggest of: SCREEN 2[ATMOS]=203; SCREEN 6=179; SCREEN 5[ATMOS]=257; SCREEN 7=163; SCREEN 1=183; SCREEN 3[ATMOS]=191; SCREEN 4=139; SCREEN 8=91
      name: 'Screen 5', format: '2D', atmos: true, screenNote: 'Screen size estimated from the seating width; height estimated',
      screen: { w: 10.0, h: 4.8, bottom: 1.2, curve: 0 },
      firstRow: 4.2, riser: 0.35,
      sections: [
        { name: 'Stalls', grid: [
          { tier: 'recliner', label: 'Recliner', price: 354, colW: 0.7, rows: [
            'O  ooo....oooooooo....ooo',
          ] },
          { tier: 'prime', label: 'Prime', price: 295, rows: [
            'N  ooo.ooooooooooooo..oooo',
            'M  ooo.ooooooooooooo..oooo',
            'L  ooo.ooooooooooooo..oooo',
            'K  ooo.ooooooooooooo..oooo',
            'J  ooo.ooooooooooooo..oooo',
            'H  ooo.ooooooooooooo..oooo',
          ] },
          { tier: 'classic', label: 'Classic', price: 295, rows: [
            'G  ....oooooooooooooo.oooo',
            'F  ....oooooooooooooo.oooo',
            'E  ....oooooooooooooo.oooo',
            'D  ....oooooooooooooo.oooo',
            'C  ....oooooooooooooo.oooo',
            'B  ....oooooooooooooo.oooo',
            'A  .......ooooooooooo.oooo',
          ] },
        ] },
      ],
    },
  },
];

export const theatreById = (id) => THEATRES.find((t) => t.id === id);
export const movieById = (id) => MOVIES.find((m) => m.id === id);
