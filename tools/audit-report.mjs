// Summarise audit-views output.   node tools/audit-report.mjs after.json [before.json]
// Per hall: median / worst % of screen hidden over the sampled seats, the worst seat and what blocks it
// (people | seats | room), seats the score calls good (≥ 70) that still lose > 10%, and neighbour jumps
// (adjacent samples in the same row or down the centre column differing by > 15 points).
import { readFileSync } from 'node:fs';
const [aF, bF] = process.argv.slice(2);
const A = JSON.parse(readFileSync(aF, 'utf8')), B = bF ? JSON.parse(readFileSync(bF, 'utf8')) : null;
const bOf = (r) => (B || []).find((x) => x.id === r.id && x.hall === r.hall);
const med = (a) => { const s = a.slice().sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
const blk = (s) => { const k = [['people', s.person], ['seats', s.seat], ['room', s.room]].sort((x, y) => y[1] - x[1])[0]; return s.hidden < 0.5 ? '-' : k[0]; };
const stat = (r) => { const h = r.seats.map((s) => s.hidden); const w = r.seats.reduce((a, s) => (s.hidden > a.hidden ? s : a)); return { med: med(h), max: w.hidden, w }; };
const pad = (v, n) => String(v).padEnd(n), lpad = (v, n) => String(v).padStart(n);
let flagsGood = 0, jumps = 0;
console.log(pad('hall', 46) + (B ? pad('before med/max', 16) : '') + pad('after med/max', 15) + pad('worst seat', 18) + pad('blocker', 8) + 'flags');
const tot = { b: [], a: [] };
for (const r of A) {
  const s = stat(r), b = B && bOf(r) ? stat(bOf(r)) : null;
  const flags = [];
  const goodBad = r.seats.filter((x) => x.score >= 70 && x.hidden > 10);
  if (goodBad.length) { flags.push('good-but-blocked: ' + goodBad.map((x) => `${x.id}(${x.score}/${x.hidden}%)`).join(' ')); flagsGood += goodBad.length; }
  const sweep = r.seats.filter((x) => x.why.includes('sweep')).sort((x, y) => x.id.localeCompare(y.id));
  const col = r.seats.filter((x) => x.why.includes('col'));
  const jump = (list) => list.some((x, i) => i && Math.abs(x.hidden - list[i - 1].hidden) > 15);
  const rowSweep = r.seats.filter((x) => x.why.includes('sweep'));
  if (rowSweep.length > 2 && Math.max(...rowSweep.map((x) => x.hidden)) - Math.min(...rowSweep.map((x) => x.hidden)) > 15) { flags.push('row varies'); jumps++; }
  if (col.length > 2 && jump(col)) { flags.push('column jumps'); jumps++; }
  tot.a.push(s.max); if (b) tot.b.push(b.max);
  console.log(pad((r.id + '/' + r.name).slice(0, 45), 46) + (b ? pad(`${b.med}/${b.max}%`, 16) : '') + pad(`${s.med}/${s.max}%`, 15) + pad(s.w.id.slice(0, 17), 18) + pad(blk(s.w), 8) + flags.join('; '));
}
const n = A.length, over = (arr, t) => arr.filter((v) => v > t).length;
console.log(`\n${n} halls. Worst-seat hidden > 10%: ${B ? over(tot.b, 10) + ' -> ' : ''}${over(tot.a, 10)}; > 5%: ${B ? over(tot.b, 5) + ' -> ' : ''}${over(tot.a, 5)}. Good-score seats losing > 10%: ${flagsGood}. Irregular rows/columns: ${jumps}.`);
