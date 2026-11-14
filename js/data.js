// Seatify — data for the Hyderabad theatres.
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
        name: 'PCX Screen', format: 'PCX', immersive: true, atmos: true, screenNote: 'Reported 101.6 × 64 ft',
        screen: { w: 31.0, h: 19.5, bottom: 0.9, curve: 0 },
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
        name: 'Barco 4K Laser', format: 'LASER', screenNote: 'Screen size estimated from seating width',
        screen: { w: 15.5, h: 6.5, bottom: 1.3, curve: 0 },
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
        name: 'HDR by Barco', format: 'HDR', atmos: true, screenNote: 'Screen size estimated (≈1.9:1)',
        screen: { w: 16.5, h: 8.7, bottom: 1.2, curve: 0 },
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
        name: 'Barco Laser hall', format: 'LASER', atmos: true, screenNote: 'Screen size estimated',
        screen: { w: 14.5, h: 7.6, bottom: 1.2, curve: 0 },
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
        name: 'M B Luxe', format: 'LUXE', screenNote: 'Screen size estimated',
        screen: { w: 8.5, h: 4.5, bottom: 1.1, curve: 0 }, starCeiling: true,
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
        name: 'Laser Hall (larger)', format: 'LASER', screenNote: 'Screen size estimated',
        screen: { w: 13, h: 6.8, bottom: 1.3, curve: 0 },
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
        name: 'Laser 4K Atmos', format: 'LASER', atmos: true, screenNote: 'Screen size estimated',
        screen: { w: 14, h: 7.4, bottom: 1.3, curve: 0 },
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
        name: 'Screen · 4K', format: '4K', screenNote: 'Screen size estimated (ART\'s 57 ft EPIQ screen may be a different hall)',
        screen: { w: 12, h: 6.3, bottom: 1.2, curve: 0 },
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
        name: 'Main Screen', format: '2D', rtl: true, screenNote: 'Screen size estimated; top rows partly inferred',
        screen: { w: 17, h: 7.2, bottom: 2.0, curve: 0 },
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

  // ───────────── Approximate reconstructions (no seat map yet) ─────────────
  {
    id: 'sudarshan', name: 'Sudarshan 35mm', short: 'Sudarshan 35mm', area: 'RTC X Roads',
    lat: 17.4062, lng: 78.4955, single: true, tags: ['Single screen', 'Balcony'],
    movies: ['deccan'],
    hall: {
      name: 'Main Screen · 35mm', format: '35MM',
      screen: { w: 14.5, h: 6.1, bottom: 2.2, curve: 0 },
      firstRow: 5.5, riser: 0.14, aisle: 1.2, labels: 'front',
      sections: [
        { name: 'Stalls', rows: [
          { n: 4, tier: 'classic', blocks: [6, 16, 6], price: 110, label: 'Front Stalls' },
          { n: 10, tier: 'classic', blocks: [6, 18, 6], price: 150, label: 'Rear Stalls' },
        ] },
        { name: 'Balcony', balcony: { lift: 2.9, overhang: 6 }, riser: 0.45, rows: [
          { n: 7, tier: 'balcony', blocks: [6, 18, 6], price: 175 },
        ] },
      ],
    },
  },
  {
    id: 'sandhya', name: 'Sandhya 70mm', short: 'Sandhya 70mm', area: 'RTC X Roads',
    lat: 17.4048, lng: 78.4972, single: true, tags: ['Single screen', 'Balcony', '70mm'],
    movies: ['jatara'],
    hall: {
      name: 'Main Screen · 70mm', format: '70MM', immersive: true,
      screen: { w: 18.5, h: 8, bottom: 2.0, curve: 30 },
      firstRow: 6, riser: 0.16, aisle: 1.2, labels: 'front',
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
      name: 'Main Screen · 70mm', format: '70MM', immersive: true, atmos: true,
      screen: { w: 19.5, h: 8.4, bottom: 2.1, curve: 0 },
      firstRow: 6.2, riser: 0.15, aisle: 1.2, labels: 'front',
      sections: [
        { name: 'Stalls', rows: [
          { n: 3, tier: 'classic', blocks: [6, 20, 6], price: 110, label: 'Front Stalls' },
          { n: 10, tier: 'classic', blocks: [6, 22, 6], price: 175, label: 'Rear Stalls' },
        ] },
        { name: 'Balcony', balcony: { lift: 3.0, overhang: 6 }, riser: 0.5, rows: [
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
];

export const theatreById = (id) => THEATRES.find((t) => t.id === id);
export const movieById = (id) => MOVIES.find((m) => m.id === id);
