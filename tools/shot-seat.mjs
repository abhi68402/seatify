// Screenshot the real app's seat view (headless Chrome via CDP, no dependencies).
//   node tools/shot-seat.mjs out.png "#/t/gokul/0/seat/L26" [width=1440] [height=900] [baseUrl=http://localhost:5317]
// Waits for the hall to build and the intro fly-in to finish, then captures the page.
import { spawn } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
const [out, hash, W = '1440', Hh = '900', base = 'http://localhost:5317'] = process.argv.slice(2);
const PORT = +(process.env.PORT || 9450);
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), 'vyu-shot-'))}`, `--window-size=${W},${Hh}`,
  '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', 'about:blank'], { stdio: 'ignore' });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) { try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json(); if (targets.find((t) => t.type === 'page')) break; } catch {} await sleep(200); }
const ws = new WebSocket(targets.find((t) => t.type === 'page').webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
try {
  const w = +W, h = +Hh;
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 640 });
  await send('Page.navigate', { url: base + '/index.html' });
  await sleep(2500);
  await send('Runtime.evaluate', { expression: `location.hash = ${JSON.stringify(hash)}` });
  await sleep(14000); // swiftshader: shaders compile slowly, then the fly-in plays
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(out, Buffer.from(r.result.data, 'base64'));
  console.log('wrote', out);
} finally { ws.close(); proc.kill(); }
