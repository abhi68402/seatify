// Vyu — published facts about each theatre: audience rating, what's special, and per-hall specs.
// Researched from public pages on 2026-11-14. Every fact carries its source; the UI shows and links it.
// Ratings: the source with the MOST reviews we could find for that theatre (BookMyShow does not
// rate venues, and Google ratings can't be scraped), so sources differ between theatres on purpose.
// Specs (screen width, projector, sound) come from hyderabadtheatres.com unless noted.
// Update this file by hand when re-checking; keep `asOf` current.

export const INFO_AS_OF = '14 Nov 2026';

const HT = (slug) => `https://www.hyderabadtheatres.com/theaters/${slug}/`;
const HT_SPECS = 'https://www.hyderabadtheatres.com/specs/';

export const INFO = {
  prasads: {
    rating: { value: 4.4, count: 130468, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/762529/prasads-multiplex' },
    highlights: [
      { text: "India's third IMAX screen until 2014, when Prasads turned it into its own giant format, PCX.", src: 'Wikipedia', url: 'https://en.wikipedia.org/wiki/Prasads_Multiplex' },
      { text: 'PCX: a 98.6 ft screen with dual 4K laser projection and Dolby Atmos.', src: 'hyderabadtheatres.com', url: HT('prasads-multiplex') },
      { text: 'New PCX HDR by Barco hall with 390 seats and Barco 4K laser HDR (2026).', src: 'Telangana Today', url: 'https://telanganatoday.com/prasads-multiplex-launches-pcx-hdr-by-barco-premium-screen-in-hyderabad' },
    ],
    halls: [
      { width: '98.6 ft', projector: 'Dual 4K laser', sound: 'Dolby Atmos', which: 'Screen 6 (PCX)', url: HT('prasads-multiplex') },
      { width: '59.2 ft', projector: 'Barco 4K laser', sound: 'Dolby Atmos', which: 'Screens 3 and 4', url: HT('prasads-multiplex') },
    ],
  },
  amb: {
    rating: { value: 4.3, count: 42, src: 'Tripadvisor', url: 'https://www.tripadvisor.com/Attraction_Review-g297586-d15595119-Reviews-AMB_Cinemas-Hyderabad_Hyderabad_District_Telangana.html' },
    highlights: [
      { text: "Mahesh Babu and Asian Group's superplex in Sarath City Capital Mall, opened in 2018.", src: 'The News Minute', url: 'https://www.thenewsminute.com/flix/asian-group-and-mahesh-babu-s-7-screen-superplex-amb-cinemas-opens-hyd-92668' },
      { text: 'HDR by Barco screen: 60.3 ft with Barco HDR projection and Dolby Atmos.', src: 'hyderabadtheatres.com', url: HT('amb-cinemas') },
      { text: 'Every main screen runs Barco 4K RGB laser with Dolby Atmos.', src: 'hyderabadtheatres.com', url: HT_SPECS },
    ],
    halls: [
      { width: '60.3 ft', projector: 'Barco HDR', sound: 'Dolby Atmos', which: 'Screen 1 (HDR by Barco)', url: HT('amb-cinemas') },
      { width: '40 ft', projector: 'Barco 4K RGB laser', sound: 'Dolby Atmos', which: 'Screens 2, 3 and 6', url: HT('amb-cinemas') },
      { width: '18 ft', projector: 'Barco 4K laser', sound: 'Dolby 5.1', which: 'Screen 8 (MB Luxe)', url: HT('amb-cinemas') },
    ],
  },
  aaa: {
    rating: { value: 4.2, count: 6, src: 'hyderabadtheatres.com', url: HT('aaa-cinemas') },
    highlights: [
      { text: "Allu Arjun's multiplex, built where Ameerpet's Satyam theatre used to stand.", src: 'Deccan Chronicle', url: 'https://www.deccanchronicle.com/lifestyle/viral-and-trending/110623/allu-arjun-to-open-satyam-mall-and-aaa-food-court-in-ameerpet.html' },
      { text: 'Screen 1: a 67 ft screen with Barco 4K laser and Dolby Atmos.', src: 'hyderabadtheatres.com', url: HT('aaa-cinemas') },
      { text: 'Screen 2 is an EPIQ Luxon LED screen: no projector, deep blacks.', src: 'hyderabadtheatres.com', url: HT('aaa-cinemas') },
    ],
    halls: [
      { width: '67 ft', projector: 'Barco 4K laser', sound: 'Dolby Atmos', which: 'Screen 1', url: HT('aaa-cinemas') },
      { width: null, projector: '4K laser', sound: 'Dolby 7.1', which: 'Screens 3 to 5', url: HT('aaa-cinemas') },
    ],
  },
  allu: {
    rating: { value: 4.3, count: 2564, src: 'magicpin', url: 'https://magicpin.in/Hyderabad/Kokapet/Entertainment/Allu-Cinemas-Dolby-Cinema-and-Cineplex/store/1c9b023' },
    highlights: [
      { text: "Home to India's largest Dolby Cinema screen, about 75 ft wide.", src: 'Telangana Today', url: 'https://telanganatoday.com/hyderabad-gets-indias-largest-dolby-cinema-screen-with-launch-of-allu-cinemas' },
      { text: 'Dolby Cinema hall: Dolby Vision 4K laser projection and Dolby Atmos.', src: 'hyderabadtheatres.com', url: HT('allu-cinemas') },
      { text: 'Its three other screens are 46 ft with Barco 4K laser and Dolby Atmos.', src: 'hyderabadtheatres.com', url: HT('allu-cinemas') },
    ],
    halls: [
      { width: '46 ft', projector: 'Barco 4K laser', sound: 'Dolby Atmos', which: 'Screens 2 to 4', url: HT('allu-cinemas') },
    ],
  },
  art: {
    rating: { value: 4.3, count: null, src: 'hyderabadtheatres.com', url: HT('art-cinemas') },
    highlights: [
      { text: "Ravi Teja and Asian Cinemas' six-screen multiplex in Tattva Mall.", src: '123telugu', url: 'https://www.123telugu.com/mnews/art-cinemas-opens-with-kingdom-hk.html?amp=1' },
      { text: 'A 57 ft EPIQ premium screen with Dolby Atmos.', src: 'Bizz Buzz', url: 'https://www.bizzbuzz.news/entertainment/ravi-tejas-art-cinemas-opens-in-vanasthalipuram-hyderabad-with-57-foot-epiq-screen-dolby-atmos-1368769' },
    ],
    halls: [
      { width: '38 ft', projector: '4K laser', sound: 'Dolby 7.1', which: 'Screen 1', url: HT('art-cinemas') },
    ],
  },
  nexus: {
    rating: { value: 2.5, count: 2, src: 'hyderabadtheatres.com', url: HT('pvr-nexus-mall') },
    highlights: [
      { text: 'Nine screens in Nexus Mall, including a 4DX hall with motion seats and effects.', src: 'hyderabadtheatres.com', url: HT('pvr-nexus-mall') },
      { text: 'Projection here is mostly 2K xenon with Dolby 7.1 sound.', src: 'hyderabadtheatres.com', url: HT_SPECS },
    ],
    halls: [
      { width: null, projector: '2K xenon', sound: 'Dolby 7.1', which: 'Audi 5 (4DX)', url: HT('pvr-nexus-mall') },
    ],
  },
  lakshmikala: {
    rating: { value: 4.0, count: null, src: 'hyderabadtheatres.com', url: HT('asian-lakshmikala-cinepride') },
    highlights: [
      { text: 'Main Lakshmikala screen: 58.2 ft, Barco 4K laser and Dolby Atmos.', src: 'hyderabadtheatres.com', url: HT('asian-lakshmikala-cinepride') },
      { text: 'Four screens named Lakshmikala, Chandrakala, Lalitha and Shashikala.', src: 'hyderabadtheatres.com', url: HT_SPECS },
    ],
    halls: [
      { width: '58.2 ft', projector: 'Barco 4K laser', sound: 'Dolby Atmos', which: 'Lakshmikala screen', url: HT('asian-lakshmikala-cinepride') },
    ],
  },
  sudarshan: {
    rating: { value: 4.4, count: 8, src: 'hyderabadtheatres.com', url: HT('sudarshan-35mm') },
    highlights: [
      { text: 'Single screen at RTC X Roads: 55 ft Scope screen, Barco 4K laser.', src: 'hyderabadtheatres.com', url: HT('sudarshan-35mm') },
      { text: '32-channel Dolby Atmos sound.', src: 'hyderabadtheatres.com', url: HT('sudarshan-35mm') },
    ],
    halls: [
      { width: '55 ft', projector: 'Barco 4K laser', sound: '32-channel Dolby Atmos', which: 'Scope 2.39:1', url: HT('sudarshan-35mm') },
    ],
  },
  sandhya: {
    rating: { value: 4.3, count: 1560, src: 'Yappe', url: 'https://yappe.in/telangana/hyderabad/sandhya-70-mm/668136' },
    highlights: [
      { text: 'A 68 ft ultra-wide screen (2.76:1), one of the widest single screens in the city.', src: 'hyderabadtheatres.com', url: HT('sandhya-70mm') },
      { text: '32-channel Dolby Atmos sound.', src: 'hyderabadtheatres.com', url: HT('sandhya-70mm') },
      { text: 'Reviewers rate the screen highly; the lower-class seats are basic.', src: 'Yappe', url: 'https://yappe.in/telangana/hyderabad/sandhya-70-mm/668136' },
    ],
    halls: [
      { width: '68 ft', projector: '4K xenon', sound: '32-channel Dolby Atmos', which: 'Ultra-wide 2.76:1', url: HT('sandhya-70mm') },
    ],
  },
  devi: {
    rating: { value: 4.2, count: 14551, src: 'LyfSkills', url: 'https://discover.lyfskills.com/listing/36859' },
    highlights: [
      { text: 'An 83 ft screen with Barco 4K laser and Dolby Atmos: one of the biggest single screens in Hyderabad.', src: 'hyderabadtheatres.com', url: HT('devi-70mm') },
      { text: 'A landmark at RTC X Roads for big star films and re-releases.', src: 'Siasat', url: 'https://www.siasat.com/6-theatres-that-make-hyderabad-one-of-indias-best-movie-cities-3469238/' },
      { text: 'A makeover was reported recently: check it is open before you go.', src: 'Siasat', url: 'https://www.siasat.com/hyderabads-iconic-rtc-x-roads-theatre-is-currently-closed-why-3374714/' },
    ],
    halls: [
      { width: '83 ft', projector: 'Barco 4K laser', sound: 'Dolby Atmos', which: 'Main screen', url: HT('devi-70mm') },
    ],
  },
  inox: {
    rating: { value: 4.1, count: null, src: 'hyderabadtheatres.com', url: HT('inox-gvk-one') },
    highlights: [
      { text: 'Six screens in GVK One mall, Banjara Hills.', src: 'hyderabadtheatres.com', url: HT('inox-gvk-one') },
      { text: 'Projection is 2K xenon; Screen 4 has Dolby Atmos, the others Dolby 7.1.', src: 'hyderabadtheatres.com', url: HT_SPECS },
    ],
    halls: [
      { width: null, projector: '2K xenon', sound: 'Dolby 7.1', which: 'Screen 6', url: HT('inox-gvk-one') },
    ],
  },
  inorbit: {
    rating: { value: 3.7, count: 1714, src: 'magicpin', url: 'https://magicpin.in/Hyderabad/Inorbit-Cyberabad-Mall/Entertainment/Pvr-Cinemas/store/9ca845' },
    highlights: [
      { text: 'PXL premium screen: 55 ft wall-to-wall Scope, RGB laser, Dolby Atmos and recliners.', src: 'Siasat', url: 'https://www.siasat.com/inorbit-mall-introduces-pxl-hyderabads-latest-premium-movie-theatre-3311760/' },
      { text: '11-screen PVR INOX superplex with PXL, LUXE and 4DX halls.', src: 'The Hans India', url: 'https://assets.thehansindia.com/business/pvr-inox-adds-five-new-screens-unveils-11-screen-superplex-at-inorbit-mall-hyderabad-1032091' },
    ],
    halls: [
      { width: '55 ft', projector: 'RGB laser', sound: 'Dolby Atmos', which: 'PXL', url: 'https://www.siasat.com/inorbit-mall-introduces-pxl-hyderabads-latest-premium-movie-theatre-3311760/' },
    ],
  },
  cinepolis: {
    rating: { value: 3.0, count: 1, src: 'hyderabadtheatres.com', url: HT('cinepolis-ccpl-mall') },
    highlights: [
      { text: 'Five screens with 703 seats in CCPL Mall, Malkajgiri.', src: 'hyderabadtheatres.com', url: HT('cinepolis-ccpl-mall') },
      { text: 'All screens use 2K xenon projection with Dolby 7.1 sound.', src: 'hyderabadtheatres.com', url: HT_SPECS },
    ],
    halls: [
      { width: null, projector: '2K xenon', sound: 'Dolby 7.1', which: 'Screens 1 to 5', url: HT('cinepolis-ccpl-mall') },
    ],
  },
  // Researched 20 Nov 2026 (hyderabadtheatres.com specs; ratings from the source with the most reviews)
  'aparna-nallagandla': {
    asOf: '20 Nov 2026',
    highlights: [
      { text: 'Opened with Aparna Neo Mall in May 2024; the builder invested Rs 32 crore in the 1,200-plus seat cinema.', src: 'Deccan Chronicle', url: 'https://www.deccanchronicle.com/news/aparna-invests-rs-284-crore-in-neo-mall-aparna-cinemas-896020' },
      { text: 'Screen 5 is its largest hall, with a 48.4 ft wide scope screen, Barco 4K laser and Dolby Atmos.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/aparna-cinemas-screen-5/' },
    ],
    halls: [
      { width: '48.4 ft', projector: 'Barco 4K Laser', sound: 'Dolby Atmos', which: 'Screen 5', url: 'https://www.hyderabadtheatres.com/screen/aparna-cinemas-screen-5/' },
    ],
  },
  'cinepolis-tnr': {
    asOf: '20 Nov 2026',
    rating: { value: 4.3, count: 4, src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/cinepolis-tnr-north-city/' },
    highlights: [
      { text: 'Cinepolis opened this 10-screen multiplex in October 2025 with nearly 1,900 seats.', src: 'The Tribune', url: 'https://www.tribuneindia.com/news/business/cinepolis-launches-a-new-10-screen-multiplex-in-hyderabad' },
      { text: 'Audi 7 is a Macro XE premium large-format hall with a 57 ft wide screen, 4K laser and Dolby Atmos.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/cinepolis-tnr-north-city-audi-7-macro-xe/' },
    ],
    halls: [
      { width: '57 ft', projector: '4K Laser', sound: 'Dolby Atmos', which: 'Audi 7 (Macro XE)', url: 'https://www.hyderabadtheatres.com/screen/cinepolis-tnr-north-city-audi-7-macro-xe/' },
    ],
  },
  'sree-ramulu': {
    asOf: '20 Nov 2026',
    rating: { value: 4.0, count: 18149, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/15202081' },
    highlights: [
      { text: 'Shut in May 2026 so its lessee, Sri Venkateswara Creations, could completely renovate it.', src: 'TeluguCinema.com', url: 'https://telugucinema.com/?p=229041' },
      { text: 'Reopened in June 2026 with a 70 ft screen, a Barco 4K laser projector and Dolby 7.1 sound with 20 subwoofers.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/sree-ramulu-70mm/' },
      { text: 'Listed among Hyderabad\'s 7 legendary theatres.', src: 'Siasat', url: 'https://www.siasat.com/hyderabads-7-legendary-theatres-that-fans-still-worship-3477076/' },
    ],
    halls: [
      { width: '70 ft', projector: '4K RGB laser', sound: 'Dolby 7.1', which: 'Sree Ramulu 70MM', url: 'https://www.hyderabadtheatres.com/screen/sree-ramulu-70mm-sree-ramulu-70mm/' },
    ],
  },
  'miraj-cinetown': {
    asOf: '20 Nov 2026',
    highlights: [
      { text: 'Screens 1 and 2 are large halls with 704 and 700 seats.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/miraj-cinemas-cine-town/' },
    ],
    halls: [
      { width: null, projector: '2K Digital', sound: 'Dolby 7.1', which: 'Screen 1', url: 'https://www.hyderabadtheatres.com/screen/miraj-cinemas-cine-town-screen-1/' },
    ],
  },
  'inox-gsm': {
    asOf: '20 Nov 2026',
    highlights: [
      { text: 'Audi 1 is the largest hall, with 403 seats, 4K Xenon projection and Dolby Atmos.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/inox-gsm-mall-audi-1/' },
    ],
    halls: [
      { width: null, projector: '4K Xenon', sound: 'Dolby Atmos', which: 'Audi 1', url: 'https://www.hyderabadtheatres.com/screen/inox-gsm-mall-audi-1/' },
    ],
  },
  'moviemax-amr': {
    asOf: '20 Nov 2026',
    rating: { value: 4.5, count: 4956, src: 'Explurger', url: 'https://www.explurger.com/pd/a2nlj1lj2r9p6tddk' },
    highlights: [
      { text: 'MovieMax opened this 7-screen multiplex at AMR Planet Mall in December 2022.', src: 'Telangana Today', url: 'https://telanganatoday.com/moviemax-cinemas-unveils-7-screen-multiplex-in-hyderabad' },
      { text: 'The opening announcement said every auditorium has reclining seats.', src: 'Telangana Today', url: 'https://telanganatoday.com/moviemax-cinemas-unveils-7-screen-multiplex-in-hyderabad' },
    ],
    halls: [
      { width: null, projector: '2K Laser', sound: 'Dolby Atmos', which: 'Screen 3', url: 'https://www.hyderabadtheatres.com/screen/moviemax-amr-ecil-screen-3/' },
    ],
  },
  'pvr-lakeshore': {
    asOf: '20 Nov 2026',
    rating: { value: 4.3, count: 16, src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/pvr-lakeshore-mall-y-junction/' },
    highlights: [
      { text: 'Opened in January 2026 as PVR INOX\'s 18th cinema in Hyderabad, with 9 screens and 1,476 seats.', src: 'Investywise', url: 'https://www.investywise.com/?p=41088' },
      { text: 'Audi 6 is a P[XL] large-format hall with a 55 ft wide screen, Barco 4K laser and Dolby Atmos.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/pvr-lakeshore-mall-y-junction-audi-6-pxl/' },
    ],
    halls: [
      { width: '55 ft', projector: 'Barco 4K Laser', sound: 'Dolby Atmos', which: 'Audi 6 (P[XL])', url: 'https://www.hyderabadtheatres.com/screen/pvr-lakeshore-mall-y-junction-audi-6-pxl/' },
    ],
  },
  'cineverse-uppal': {
    asOf: '20 Nov 2026',
    rating: { value: 4.1, count: 34212, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/12559544' },
    highlights: [
      { text: 'Formerly Asian Cine Square, now leased and operated by Cineverse Multiplex.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/cineverse-multiplex-uppal/' },
      { text: 'Screen 5 (Magnus) is the premium hall, with 496 seats, 4K RGB laser and Dolby Atmos.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/cineverse-multiplex-uppal-screen-5/' },
    ],
    halls: [
      { width: null, projector: '4K RGB Laser', sound: 'Dolby Atmos', which: 'Screen 5 (Magnus)', url: 'https://www.hyderabadtheatres.com/screen/cineverse-multiplex-uppal-screen-5/' },
    ],
  },
  'cinepolis-lulu': {
    asOf: '20 Nov 2026',
    highlights: [
      { text: 'Cinepolis opened this 5-screen, 1,427-seat multiplex at Lulu Mall in November 2023.', src: 'BizzBuzz', url: 'https://bizzbuzz.news/economy/cinepolis-multiplex-now-open-at-lulu-mall-in-hyd-1267651' },
      { text: 'Audi 4 is the 4K laser hall; the other four audis use 2K laser.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/cinepolis-lulu-mall/' },
    ],
    halls: [
      { width: null, projector: '4K Laser', sound: 'Dolby 7.1', which: 'Audi 4', url: 'https://www.hyderabadtheatres.com/screen/cinepolis-lulu-mall-audi-4/' },
    ],
  },
  'gpr-nizampet': {
    asOf: '20 Nov 2026',
    rating: { value: 4.6, count: 5, src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/gpr-multiplex-nizampet/' },
    highlights: [
      { text: 'Screen 3 is the big hall, with 655 seats, a 54 ft screen, 4K laser and Dolby Atmos.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/gpr-multiplex-nizampet-screen-3/' },
    ],
    halls: [
      { width: '54 ft', projector: '4K Laser', sound: 'Dolby Atmos', which: 'Screen 3', url: 'https://www.hyderabadtheatres.com/screen/gpr-multiplex-nizampet-screen-3/' },
    ],
  },
  'asian-cinemart': {
    asOf: '20 Nov 2026',
    rating: { value: 3.7, count: 780, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/15202024' },
    highlights: [
      { text: 'Asian Cinemas opened this 5-screen multiplex in January 2024 with a combined 1,100 seats.', src: 'Telugu Rajyam', url: 'https://e.telugurajyam.com/entertainment/asian-vaishnavi-asian-cinemart-celebrates-opening-of-new-multiplex.html' },
      { text: 'All five screens use 4K Xenon projection with Dolby 7.1.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/asian-cinemart-rc-puram/' },
    ],
    halls: [
      { width: null, projector: 'Digital 4K Xenon', sound: 'Dolby 7.1', which: 'Screen 1', url: 'https://www.hyderabadtheatres.com/screen/asian-cinemart-rc-puram-screen-1/' },
    ],
  },
  'sai-ranga': {
    asOf: '20 Nov 2026',
    rating: { value: 3.9, count: 18579, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/15202021' },
    highlights: [
      { text: 'A 1,055-seat single screen with a 58.6 ft wide screen and 4K RGB laser projection.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/sai-ranga-70mm-sai-ranga-70mm/' },
    ],
    halls: [
      { width: '58.6 ft', projector: '4K RGB Laser', sound: 'Dolby 7.1', which: 'Sai Ranga 70MM', url: 'https://www.hyderabadtheatres.com/screen/sai-ranga-70mm-sai-ranga-70mm/' },
    ],
  },
  'bhramaramba': {
    asOf: '20 Nov 2026',
    rating: { value: 4.3, count: 25708, src: 'Explurger', url: 'https://www.explurger.com/pd/z3ghcstt0n6z77fuv' },
    highlights: [
      { text: 'Bhramaramba and Mallikarjuna form one theatre complex, described as one of the most popular in the twin cities.', src: 'M9 News', url: 'https://www.m9.news/movienews/bramarambha-mallikarjuna-theaters-to-become-history/' },
      { text: 'Listed among Hyderabad\'s 7 legendary theatres, with a 70 ft by 30 ft screen and 861 seats.', src: 'Siasat', url: 'https://www.siasat.com/hyderabads-7-legendary-theatres-that-fans-still-worship-3477076/' },
    ],
    halls: [
      { width: '70 ft', projector: '4K Xenon', sound: 'Dolby 7.1', which: 'Bhramaramba 70MM', url: 'https://www.hyderabadtheatres.com/screen/bhramaramba-70mm-bhramaramba-70mm/' },
    ],
  },
  'mallikarjuna': {
    asOf: '20 Nov 2026',
    highlights: [
      { text: 'Mallikarjuna and Bhramaramba form one theatre complex, described as one of the most popular in the twin cities.', src: 'M9 News', url: 'https://www.m9.news/movienews/bramarambha-mallikarjuna-theaters-to-become-history/' },
      { text: 'A single screen with Barco 2K projection and DTS sound.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/mallikarjuna-70mm/' },
    ],
    halls: [
      { width: null, projector: '2K Xenon', sound: 'DTS', which: 'Mallikarjuna 70mm', url: 'https://www.hyderabadtheatres.com/screen/mallikarjuna-70mm-mallikarjuna-70mm/' },
    ],
  },
  'asian-mcube': {
    asOf: '20 Nov 2026',
    rating: { value: 4.1, count: 18939, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/13925185' },
    highlights: [
      { text: 'Screen 4 is the Dolby Atmos hall, with 344 seats and 4K Xenon projection.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/asian-m-cube-mall-attapur-screen-4/' },
    ],
    halls: [
      { width: null, projector: '2K Xenon', sound: 'Dolby 7.1', which: 'Screen 1', url: 'https://www.hyderabadtheatres.com/screen/asian-m-cube-mall-attapur-screen-1/' },
    ],
  },
  'cinepolis-dsl': {
    asOf: '20 Nov 2026',
    rating: { value: 3.0, count: 6, src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/cinepolis-dsl-virtue-mall/' },
    highlights: [
      { text: 'All six audis use 2K digital projection with Dolby 7.1.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/cinepolis-dsl-virtue-mall/' },
    ],
    halls: [
      { width: null, projector: '2K Digital', sound: 'Dolby 7.1', which: 'Audi 2', url: 'https://www.hyderabadtheatres.com/screen/cinepolis-dsl-virtue-mall-audi-2/' },
    ],
  },
  'gokul': {
    asOf: '20 Nov 2026',
    rating: { value: 3.8, count: 22707, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/12871568' },
    highlights: [
      { text: 'A 970-seat single screen with 4K projection and DTS sound.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/screen/gokul-70mm-screen-1/' },
    ],
    halls: [
      { width: null, projector: '4K Xenon', sound: 'DTS Digital Surround', which: 'Screen 1', url: 'https://www.hyderabadtheatres.com/screen/gokul-70mm-screen-1/' },
    ],
  },
  'pvr-galleria': {
    asOf: '20 Nov 2026',
    rating: { value: 4.3, count: 37736, src: 'Google, via Wanderlog', url: 'https://wanderlog.com/place/details/125398' },
    highlights: [
      { text: 'Audi 3 is a 54-seat Play House hall; Audi 1 and Audi 8 have Dolby Atmos.', src: 'HyderabadTheatres.com', url: 'https://www.hyderabadtheatres.com/theaters/pvr-next-galleria-mall/' },
    ],
    halls: [
      { width: null, projector: '2K Xenon', sound: 'Dolby Atmos', which: 'Audi 8', url: 'https://www.hyderabadtheatres.com/screen/pvr-next-galleria-mall-audi-8/' },
    ],
  },
};

export const infoOf = (tid) => INFO[tid] || null;

// Where to book each theatre. Checked by opening every link on 18 Nov 2026: each BookMyShow
// address (/cinemas/hyderabad/<slug>/<venue code>) opens that cinema's showtimes for today, and each
// District address opens that cinema's page. null = the theatre is not listed on District (the Asian
// Cinemas group, Prasads and ART sell through BookMyShow only). Re-check when a link breaks.
const BMS = (path) => `https://in.bookmyshow.com/cinemas/hyderabad/${path}`;
const DISTRICT = (path) => `https://www.district.in/movies/${path}`;
export const BOOKING = {
  prasads: { bms: BMS('prasads-multiplex-hyderabad/PRHN'), district: null },
  amb: { bms: BMS('amb-cinemas-gachibowli/AMBH'), district: null },
  aaa: { bms: BMS('aaa-cinemas-ameerpet/ACAS'), district: null },
  allu: { bms: BMS('allu-cinemas-kokapet/ALUC'), district: null },
  art: { bms: BMS('art-cinemas-vanasthalipuram/ACEV'), district: null },
  nexus: { bms: BMS('pvr-nexus-mall-kukatpally-hyderabad/PVFS'), district: DISTRICT('pvr-nexus-mall-formerly-forum-sujana-kukatpally-hyderabad-CD1022267') },
  lakshmikala: { bms: BMS('asian-lakshmikala-cinepride-moosapet/ACPM'), district: null },
  sudarshan: { bms: BMS('sudarshan-35mm-4k-laser-dolby-atmos-rtc-x-roads/SUDA'), district: DISTRICT('sudarshan-35mm-4k-laser-dolby-atmos-rtc-x-roads-hyderabad-CD1065725') },
  sandhya: { bms: BMS('sandhya-70mm-4k-dolby-atmos-rtc-x-roads/SMMR'), district: null },
  devi: { bms: BMS('devi-70mm-4k-laser-dolby-atmos-rtc-x-roads/DVRR'), district: DISTRICT('devi-70mm-4k-laser-dolby-atmos-rtc-x-roads-hyderabad-CD1065724') },
  inox: { bms: BMS('inox-gvk-one-banjara-hills-hyderabad/INHY'), district: DISTRICT('inox-gvk-one-banjara-hills-hyderabad-CD1020776') },
  inorbit: { bms: BMS('pvr-superplex-inorbit-luxe-pxl-4dx-cyberabad/PIIC'), district: DISTRICT('pvr-superplex-inorbit-luxe-pxl-4dx-cyberabad-CD1022263') },
  cinepolis: { bms: BMS('cinepolis-ccpl-mall-malkajgiri-hyderabad/CPCL'), district: DISTRICT('cinepolis-ccpl-mall-malkajgiri-hyderabad-CD126') },
  'aparna-nallagandla': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/aparna-cinemas-nallagandla/AACN', district: null },
  'cinepolis-tnr': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/cinepolis-tnr-north-city-suchitra-hyderabad/CTNR', district: 'https://www.district.in/movies/cinepolis-tnr-north-city-suchitra-hyderabad-CD1039952' },
  'sree-ramulu': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/sree-ramulu-70mm-4k-laser-moosapet/SRMO', district: null },
  'miraj-cinetown': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/miraj-cinemas-cinetown-miyapur/MMCA', district: 'https://www.district.in/movies/miraj-cinemas-cinetown-miyapur-CD24951' },
  'inox-gsm': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/inox-gsm-mall-hyderabad/IGMH', district: 'https://www.district.in/movies/inox-gsm-mall-madinaguda-hyderabad-CD1020780' },
  'moviemax-amr': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/moviemax-amr-ecil-secunderabad/MMAH', district: 'https://www.district.in/movies/moviemax-amr-ecil-secunderabad-hyderabad-CD52274' },
  'pvr-lakeshore': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/pvr-lakeshore-pxl-4k-laser-atmos-dts-x-y-junction/ILKS', district: 'https://www.district.in/movies/pvr-lakeshore-mall-y-junction-hyderabad-CD1102157' },
  'cineverse-uppal': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/cineverse-multiplex-uppal/CVMU', district: null },
  'cinepolis-lulu': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/cinepolis-lulu-mall-hyderabad/CPMH', district: 'https://www.district.in/movies/cinepolis-lulu-mall-formerly-manjeera-hyderabad-CD124' },
  'gpr-nizampet': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/gpr-multiplex-nizampet-hyderabad/GPRH', district: null },
  'asian-cinemart': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/asian-cinemart-rc-puram/ASHN', district: null },
  'sai-ranga': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/sai-ranga70mm-4klaser-dolby7-1-aircooled-miyapur/SRCM', district: null },
  'bhramaramba': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/bhramaramba-70mm-a-c-4k-dolby-kukatpally/BRKH', district: null },
  'mallikarjuna': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/mallikarjuna-70mm-a-c-dts-kukatpally/MAHM', district: null },
  'asian-mcube': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/asian-m-cube-mall-attapur/AMCA', district: null },
  'cinepolis-dsl': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/cinepolis-dsl-virtue-mall-uppal-hyderabad/ABCS', district: 'https://www.district.in/movies/cinepolis-dsl-virtue-mall-uppal-hyderabad-CD9123' },
  'gokul': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/gokul-70mm-4k-dts-erragadda/GOKU', district: null },
  'pvr-galleria': { bms: 'https://in.bookmyshow.com/cinemas/hyderabad/pvr-next-galleria-mall-panjagutta/PNNG', district: 'https://www.district.in/movies/pvr-next-galleria-mall-panjagutta-hyderabad-CD1022281' },
};
export const bookingOf = (tid) => BOOKING[tid] || null;
