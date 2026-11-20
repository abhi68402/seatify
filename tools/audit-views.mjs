// Seat-view obstruction audit (headless Chrome via CDP, no dependencies).
//   python3 serve.py &                                  (port 5317)
//   node tools/audit-views.mjs [out.json] [theatreId…]  default out: /tmp/audit-views.json
// For every theatre/hall it opens a representative set of seats in the real 3D hall (tools/audit-views.page.js)
// and measures how much of the screen is hidden, split by blocker (people | seats | room). Prints a table of
// the worst seats per hall and flags irregularities. Needs Google Chrome at the usual macOS path (or CHROME=…).
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = process.argv[2] || join(tmpdir(), 'audit-views.json');
const only = process.argv.slice(3);
const PORT = +(process.env.PORT || 9333), BASE = process.env.BASE || 'http://localhost:5317';
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'vyu-audit-'))}`,
  '--window-size=1440,900', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling',
  '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.find((t) => t.type === 'page')) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true, timeout: 600000 });
  if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails.exception?.description || r.result.exceptionDetails).slice(0, 500));
  return r.result.result.value;
};
try {
  await send('Page.enable');
  await send('Page.navigate', { url: BASE + '/index.html' });
  await sleep(3500);
  console.log('page', await evaluate('location.href'));
  await evaluate(readFileSync(join(root, 'tools/audit-views.page.js'), 'utf8'));
  for (let i = 0; i < 100 && !(await evaluate('!!window.__ready')); i++) await sleep(300);
  if (process.env.EXPR) { console.log(JSON.stringify(await evaluate(process.env.EXPR), null, 1)); proc.kill(); process.exit(0); }
  if (process.env.SHOT) { // SHOT="theatre,hallIdx,seatId,out.png[,narrow]": false-colour view (screen white, people red, seats blue, room green)
    const [tid, hi, sid, file, narrow] = process.env.SHOT.split(',');
    const url = await evaluate(`window.__shot(${JSON.stringify(tid)}, ${+hi}, ${JSON.stringify(sid)}, ${narrow ? 0 : 1})`);
    writeFileSync(file, Buffer.from(url.split(',')[1], 'base64')); console.log('wrote', file); proc.kill(); process.exit(0);
  }
  const { THEATRES } = await import(pathToFileURL(join(root, 'js/data.js')).href);
  const results = [];
  for (const t of THEATRES) {
    if (only.length && !only.includes(t.id)) continue;
    for (let h = 0; h < (t.screens || [t.hall]).length; h++) {
      let r;
      for (let attempt = 0; !r; attempt++) {
        try { r = await Promise.race([evaluate(`window.__audit(${JSON.stringify(t.id)}, ${h})`), sleep(120000).then(() => { throw new Error('timeout'); })]); }
        catch (e) { // a stuck GL context: reload the page and try again
          if (attempt >= 2) throw e;
          console.log('retry', t.id, e.message.slice(0, 80));
          await send('Page.navigate', { url: BASE + '/index.html' }); await sleep(3500);
          await evaluate(readFileSync(join(root, 'tools/audit-views.page.js'), 'utf8'));
          for (let i = 0; i < 100 && !(await evaluate('!!window.__ready')); i++) await sleep(300);
        }
      }
      results.push(r);
      const worst = r.seats.reduce((a, s) => (s.hidden > a.hidden ? s : a));
      console.log(`${(t.id + '/' + r.name).padEnd(44)} seats ${String(r.seats.length).padStart(2)}  worst ${worst.id.padEnd(8)} ${String(worst.hidden).padStart(5)}%  (people ${worst.person}, seats ${worst.seat}, room ${worst.room})  score ${worst.score}`);
    }
  }
  writeFileSync(out, JSON.stringify(results));
  console.log('wrote', out);
} finally { ws.close(); proc.kill(); }
