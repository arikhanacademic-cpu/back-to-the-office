import { chromium } from 'playwright';
import fs from 'fs';
// usage: node render.mjs outDir size fps [tStart tEnd] | --stills t1,t2,...
const [,, out, size='1080', fps='30', a, b] = process.argv;
fs.mkdirSync(out, { recursive: true });
const br = await chromium.launch({ args: ['--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
const p = await br.newPage({ viewport: { width: +size, height: +size } });
p.on('pageerror', e => console.log('ERR', e.message));
await p.goto(`http://localhost:8765/?capture&size=${size}&fps=${fps}`);
await p.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
await p.evaluate(() => document.fonts.ready);
const F = +fps;
if (a === '--stills') {
  for (const t of b.split(',').map(Number)) {
    for (let k = 12; k >= 0; k--) await p.evaluate(tt => window.__render(tt), Math.max(0, t - k * 4 / F));
    await p.screenshot({ timeout: 120000, path: `${out}/still-${String(t).replace('.', '_')}.png` });
    console.log('still', t);
  }
} else {
  const dur = await p.evaluate(() => window.__duration);
  const t0 = a ? +a : 0, t1 = b ? +b : dur;
  const f0 = Math.round(t0 * F), f1 = Math.round(t1 * F);
  // warm-up so lerped state matches a continuous render
  await p.evaluate(([f0, F]) => { for (let k = 0; k < f0; k++) window.__advance(k / F); }, [f0, F]);
  const st = Date.now();
  for (let f = f0; f < f1; f++) {
    await p.evaluate(tt => window.__render(tt), f / F);
    await p.screenshot({ path: `${out}/f${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93, timeout: 120000 });
    if (f % 30 === 0) console.log('frame', f, ((Date.now() - st) / (f - f0 + 1) / 1000).toFixed(2), 's/frame');
  }
}
await br.close();
