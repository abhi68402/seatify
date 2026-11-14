// Seatify — published facts about each theatre: audience rating, what's special, and per-hall specs.
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
};

export const infoOf = (tid) => INFO[tid] || null;
