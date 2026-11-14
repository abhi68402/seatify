// Sanity checks for the hall data and scoring. No dependencies.
//   node tools/check.mjs            all halls
//   node tools/check.mjs prasads    one theatre (by id)
// Per hall it prints the seat count (compare with the BookMyShow screenshot), the director's seat and
// its score, and the centre seats of the front and back stalls rows. It fails (exit 1) unless the
// director's seat is the #1 seat, 55-78% of the room depth back, and not in the last two rows.
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const { THEATRES } = await import(pathToFileURL(resolve(root, 'js/data.js')).href);
const { getLayout, topSeats } = await import(pathToFileURL(resolve(root, 'js/layout.js')).href);

const only = process.argv[2];
let fail = 0, seats = 0;
for (const t of THEATRES) {
  if (only && t.id !== only) continue;
  (t.screens || [t.hall]).forEach((h, i) => {
    const L = getLayout(t, i), best = topSeats(L, 1)[0], D = L.director, n = L.rows.length, ri = L.rows.indexOf(best.row);
    const centre = (r) => r.seats.reduce((a, s) => (Math.abs(s.x) < Math.abs(a.x) ? s : a));
    const front = centre(L.sections[0].rows[0]), back = centre(L.sections[0].rows.at(-1));
    const minX = Math.min(...D.row.seats.map((s) => Math.abs(s.x))), depth = D.z / L.refCalc.backZ;
    const ok = best === D && depth >= 0.55 && depth <= 0.78 && Math.abs(D.x) <= minX + 0.6 && (n <= 5 || ri < n - 2);
    if (!ok) fail++;
    seats += L.seats.length;
    console.log(`${ok ? 'ok ' : 'BAD'} ${(t.id + ' / ' + h.name).padEnd(38)} ${String(L.seats.length).padStart(4)} seats · director ${D.id.padEnd(9)} ${D.m.score} (row ${ri + 1}/${n}, ${(depth * 100).toFixed(0)}% back, ${D.m.fov.toFixed(0)}°) · front ${front.m.score} · back ${back.m.score}`);
  });
}
console.log(fail ? `${fail} hall(s) failed the director's-seat check` : `all halls ok · ${seats} seats`);
process.exit(fail ? 1 : 0);
