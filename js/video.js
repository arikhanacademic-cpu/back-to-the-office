// Deterministic timeline for the square promo video (loaded only with ?capture).
// window.__render(t) positions camera, simulation clock and overlays for time t (seconds), then draws one frame.
const B = window.__bto;
const { camera, controls, sim, at, V3, CAMS, COMPANIES, CAT, STATS, officeById } = B;
const FPS = +(new URLSearchParams(location.search).get('fps') || 30);
const BAR = 2.4; // 100 bpm, 4/4
export const DURATION = 22 * BAR; // 52.8 s

/* ───────────── overlay DOM ───────────── */
const css = `
body.capture *, body.capture *::before, body.capture *::after{transition:none!important}
#vo{position:fixed;inset:0;z-index:40;pointer-events:none;font-family:'Barlow Condensed',sans-serif;color:#eef2f8;overflow:hidden}
#vo .mono{font-family:'JetBrains Mono',monospace}
#vo .abs{position:absolute}
.v-shade{inset:0;background:radial-gradient(130% 100% at 30% 40%,rgba(4,6,12,.2),rgba(4,6,12,.85))}
.v-kicker{left:72px;top:150px;font-size:20px;letter-spacing:.16em;text-transform:uppercase;color:#a9b3c4;display:flex;gap:12px;align-items:center}
.v-kicker i{width:12px;height:12px;background:#ff3b4e;box-shadow:0 0 14px #ff3b4e}
.v-title{left:66px;top:190px;font-weight:800;text-transform:uppercase;line-height:.84;font-size:150px}
.v-title .l{display:block;overflow:hidden}
.v-title .l span{display:inline-block}
.v-title .big{font-size:1.38em}
.v-title .big span{color:transparent;background:linear-gradient(90deg,#2de2c8 0 33%,#ffae2b 33% 66%,#ff3b4e 66%);-webkit-background-clip:text;background-clip:text}
.v-sub{left:72px;top:600px;width:820px;font-size:34px;line-height:1.2;color:#c9d1de}
.v-stats{left:72px;top:760px;display:flex;gap:10px}
.v-stat{border-left:5px solid var(--c);padding:0 30px 0 18px}
.v-stat b{display:block;font-family:'JetBrains Mono';font-size:76px;line-height:1;font-weight:700}
.v-stat span{display:block;font-size:20px;letter-spacing:.12em;text-transform:uppercase;color:#a9b3c4;margin-top:8px;width:180px;line-height:1.1}
.v-bug{left:44px;top:40px;display:flex;gap:14px;align-items:center}
.v-bug .m{display:flex;gap:4px;transform:skewX(-14deg)} .v-bug .m i{width:9px;height:40px}
.v-bug b{font-size:34px;font-weight:800;text-transform:uppercase;letter-spacing:.02em;line-height:1}
.v-bug small{display:block;font-family:'JetBrains Mono';font-size:14px;color:#a9b3c4;letter-spacing:.1em;text-transform:uppercase;margin-top:5px}
.v-clock{right:44px;top:36px;display:flex;align-items:stretch}
.v-clock .d{background:#ff3b4e;font-weight:800;font-size:54px;padding:4px 30px 0 22px;clip-path:polygon(0 0,100% 0,calc(100% - 18px) 100%,0 100%)}
.v-clock .h{background:rgba(10,14,24,.85);font-family:'JetBrains Mono';font-size:40px;padding:12px 24px 0 30px;margin-left:-16px;clip-path:polygon(16px 0,100% 0,100% 100%,0 100%)}
.v-week{left:44px;right:44px;bottom:120px;height:8px;background:rgba(255,255,255,.08)}
.v-week i{position:absolute;left:0;top:0;bottom:0;background:linear-gradient(90deg,#2de2c8,#ffae2b,#ff3b4e)}
.v-week span{position:absolute;top:16px;font-size:20px;font-weight:700;letter-spacing:.16em;color:#6c7689;transform:translateX(-50%)}
.v-l3{left:44px;bottom:160px;display:flex;align-items:stretch}
.v-l3 .d{background:#ff3b4e;font-weight:800;font-size:64px;text-transform:uppercase;padding:6px 40px 0 26px;clip-path:polygon(0 0,100% 0,calc(100% - 22px) 100%,0 100%)}
.v-l3 .t{background:rgba(10,14,24,.88);font-size:32px;font-weight:600;padding:0 34px 0 40px;margin-left:-20px;display:flex;align-items:center;max-width:680px;line-height:1.1;clip-path:polygon(20px 0,100% 0,calc(100% - 20px) 100%,0 100%)}
.v-legend{left:44px;bottom:60px;display:flex;gap:26px;font-family:'JetBrains Mono';font-size:17px;letter-spacing:.06em;text-transform:uppercase;color:#a9b3c4}
.v-legend i{display:inline-block;width:14px;height:14px;margin-right:9px;vertical-align:-1px;background:var(--c);box-shadow:0 0 12px var(--c)}
.v-foot{left:44px;right:44px;bottom:22px;font-family:'JetBrains Mono';font-size:14px;color:#6c7689;letter-spacing:.04em;display:flex;justify-content:space-between}
.v-card{right:44px;top:150px;width:520px;background:rgba(14,19,31,.92);border:1px solid rgba(255,255,255,.1)}
.v-card .top{display:flex;border-bottom:1px solid rgba(255,255,255,.1)}
.v-card .tag{background:var(--c);color:#06080f;font-weight:800;font-size:20px;letter-spacing:.14em;text-transform:uppercase;padding:10px 30px 6px 18px;clip-path:polygon(0 0,100% 0,calc(100% - 16px) 100%,0 100%)}
.v-card .ind{padding:10px 16px 6px;font-size:20px;letter-spacing:.14em;text-transform:uppercase;color:#a9b3c4}
.v-card .nm{font-weight:800;font-size:64px;text-transform:uppercase;line-height:.9;padding:22px 26px 6px}
.v-card .hero{display:flex;align-items:flex-end;gap:18px;padding:8px 26px 20px;border-bottom:1px solid rgba(255,255,255,.1)}
.v-card .num{font-family:'JetBrains Mono';font-weight:700;font-size:150px;line-height:.78;color:var(--c);text-shadow:0 0 40px var(--c)}
.v-card .un{font-weight:700;font-size:28px;letter-spacing:.1em;text-transform:uppercase;line-height:1.05;padding-bottom:6px}
.v-card .un small{display:block;font-weight:400;font-size:24px;letter-spacing:.02em;text-transform:none;color:#a9b3c4;margin-top:6px}
.v-card .dots{display:flex;gap:6px;margin-left:auto;padding-bottom:10px} .v-card .dots i{width:20px;height:44px;background:rgba(255,255,255,.08);transform:skewX(-14deg)} .v-card .dots i.on{background:var(--c);box-shadow:0 0 16px var(--c)}
.v-card .tight{margin:18px 26px 0;padding:14px 16px;border-left:4px solid var(--c);background:rgba(255,255,255,.05);font-size:24px}
.v-card .tight b{display:block;font-size:18px;letter-spacing:.14em;text-transform:uppercase;color:var(--c)}
.v-card .sum{padding:16px 26px 6px;font-size:26px;line-height:1.25}
.v-card .src{margin:10px 26px 22px;font-family:'JetBrains Mono';font-size:15px;color:#a9b3c4;line-height:1.45}
.v-card .wipe{position:absolute;inset:-2px;background:var(--c);transform-origin:left}
.v-sum{left:72px;top:230px}
.v-sum h2{margin:0 0 30px;font-size:96px;font-weight:800;text-transform:uppercase;line-height:.88}
.v-sum .row{display:flex;align-items:baseline;gap:22px;border-left:6px solid var(--c);padding:6px 0 6px 22px;margin-bottom:16px}
.v-sum .row b{font-family:'JetBrains Mono';font-size:84px;color:var(--c);width:120px;line-height:1}
.v-sum .row span{font-size:40px;font-weight:700;text-transform:uppercase;letter-spacing:.04em}
.v-sum .row small{font-size:26px;color:#a9b3c4;font-weight:400;letter-spacing:.02em;text-transform:none;margin-left:6px}
.v-end{inset:0;background:#05070c;display:flex;flex-direction:column;justify-content:center;padding:0 90px}
.v-end .m{display:flex;gap:8px;transform:skewX(-14deg);margin-bottom:40px} .v-end .m i{width:22px;height:96px}
.v-end h1{margin:0;font-size:136px;font-weight:800;text-transform:uppercase;line-height:.84}
.v-end p{font-size:34px;color:#a9b3c4;margin:28px 0 70px;max-width:820px;line-height:1.2}
.v-end .by{font-size:30px;letter-spacing:.2em;text-transform:uppercase;color:#a9b3c4}
.v-end .by b{display:block;font-size:84px;letter-spacing:.02em;color:#fff;margin-top:6px}
.v-end .by b::after{content:'';display:block;width:180px;height:6px;background:#ff3b4e;margin-top:16px}
.v-flash{inset:0;background:#fff;mix-blend-mode:overlay}
`;
document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
const vo = document.createElement('div'); vo.id = 'vo'; document.body.appendChild(vo);
const fmt = iso => new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const C = k => CAT[k].hex;

/* ───────────── easing helpers ───────────── */
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lin = (t, a, b) => clamp((t - a) / (b - a));
const eio = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eout = x => 1 - Math.pow(1 - x, 3);
// slanted wipe: reveal from left with a 14° edge
const wipe = p => { const e = eio(clamp(p)); const r = e * 130 - 15; return `polygon(0 0, ${r}% 0, ${r - 15}% 100%, 0 100%)`; };
const unwipe = p => { const e = eio(clamp(p)); const l = e * 130 - 15; return `polygon(${l}% 0, 120% 0, 120% 100%, ${l - 15}% 100%)`; };
const inOut = (t, a, b, d = 0.45) => t < a || t > b ? null : t < a + d ? wipe((t - a) / d) : t > b - d ? unwipe(1 - (b - t) / d) : 'none';

/* ───────────── camera path ───────────── */
const SQ = 1.25; // square frame needs a little more distance
const preset = (k, mul = 1, dy = 0) => { const c = CAMS[k]; return { t: c.t.clone(), p: c.t.clone().add(c.o.clone().multiplyScalar(SQ * mul)).add(V3(0, dy, 0)) }; };
const officeShot = (id, side = 1) => { const o = officeById[id]; const t = V3(o.x, o.h * 0.55, o.z); return { t, p: t.clone().add(V3(-70 * side, 55 + o.h * 1.6, 95)) }; };
const CITY_T = at(-0.070, 51.511);
const orbit = (ang, r, y, tgt) => ({ t: tgt.clone(), p: V3(tgt.x + Math.sin(ang) * r, y, tgt.z + Math.cos(ang) * r) });
const KEYS = [
  [0, orbit(-1.25, 470, 175, CITY_T)],
  [7.2, orbit(-0.85, 430, 165, CITY_T)],
  [9.6, preset('overview', 1)],
  [14.0, preset('overview', 0.82)],
  [15.4, preset('kx', 1.1)],
  [18.6, preset('kx', 0.95)],
  [20.2, preset('city', 1.05)],
  [23.4, preset('city', 0.9)],
  [25.0, preset('wharf', 1.05)],
  [28.2, preset('wharf', 0.92)],
  [29.8, preset('city', 1.5, 40)],
  [33.6, preset('city', 1.35, 30)],
  [34.6, officeShot('jpm', 1)],
  [36.8, officeShot('jpm', 0.8)],
  [37.8, officeShot('barclays', -1)],
  [40.0, officeShot('barclays', -0.8)],
  [41.0, officeShot('revolut', 1)],
  [43.2, officeShot('revolut', 0.85)],
  [45.0, preset('overview', 1.15, 60)],
  [52.8, preset('overview', 1.05, 40)],
];
const tmpP = V3(0, 0, 0), tmpT = V3(0, 0, 0);
function cameraAt(t) {
  if (t < 7.2) { // slow orbit flyover
    const a = -1.25 + (t / 7.2) * 0.4; const o = orbit(a, 470 - t * 5.5, 175 - t * 1.4, CITY_T);
    camera.position.copy(o.p); controls.target.copy(o.t); camera.lookAt(o.t); return;
  }
  let i = 0; while (i < KEYS.length - 2 && t > KEYS[i + 1][0]) i++;
  const [t0, a] = KEYS[i], [t1, b] = KEYS[i + 1];
  const k = eio(lin(t, t0, t1));
  tmpP.lerpVectors(a.p, b.p, k); tmpT.lerpVectors(a.t, b.t, k);
  tmpP.y += Math.sin(k * Math.PI) * a.p.distanceTo(b.p) * 0.08;
  camera.position.copy(tmpP); controls.target.copy(tmpT); camera.lookAt(tmpT);
}

/* ───────────── simulated week ───────────── */
const W0 = 9.6, W1 = 33.6, DAY = (W1 - W0) / 5;
function simAt(t) {
  if (t < W0) return 2 * 24 + 9.0; // Wed morning look for intro
  if (t > W1) return 2 * 24 + 10.5; // midweek for the cards
  const d = Math.floor((t - W0) / DAY), f = ((t - W0) % DAY) / DAY;
  // each day runs 05:30 → 21:30 with time slowing through the rush hours
  const hod = 5.5 + 16 * (f < 0.5 ? 0.5 * Math.pow(f * 2, 0.85) : 1 - 0.5 * Math.pow((1 - f) * 2, 0.85));
  return d * 24 + hod;
}

/* ───────────── content ───────────── */
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const CAPS = [
  'Five-day offices fill first.',
  'Hybrid anchor days begin. The Tube lines light up.',
  'Midweek peak across the City and Canary Wharf.',
  'The last anchor day for most hybrid firms.',
  'Hybrid offices go dark. Five-day offices stay lit.',
];
const CARDS = [
  { id: 'jpm', t0: 34.0, t1: 37.4 },
  { id: 'barclays', t0: 37.4, t1: 40.8 },
  { id: 'revolut', t0: 40.8, t1: 44.0 },
];
function cardHTML(c) {
  const nc = c.cat === 'unconfirmed';
  const dots = [1, 2, 3, 4, 5].map(i => `<i class="${c.days >= i ? 'on' : ''}"></i>`).join('');
  const tight = c.tightened ? `<div class="tight"><b>▲ Tightened · ${c.tightened.approx ? 'from ' + new Date(c.tightened.date + 'T12:00:00Z').toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }) : fmt(c.tightened.date)}</b>${c.tightened.what}</div>` : '';
  const short = { jpm: 'Five days a week for all staff since early 2025, ending its hybrid model.', barclays: 'UK minimum rising from two days to three from October 2026; four for senior staff.', revolut: 'February 2025 CEO memo: staff are not required to come into the office.' }[c.id] || c.summary;
  return `<div class="top"><div class="tag">${CAT[c.cat].name}</div><div class="ind">${c.industry}</div></div>
    <div class="nm">${c.name}</div>
    <div class="hero"><div class="num">${nc ? '—' : c.days}</div><div class="un">${c.days === 0 ? 'Days required' : 'Days a week'}<small>${c.label}</small></div><div class="dots">${dots}</div></div>
    ${tight}<div class="sum">${short}</div>
    <div class="src">SOURCE · ${c.source.publisher} · ${fmt(c.source.date)}</div><div class="wipe"></div>`;
}
const nOffice = COMPANIES.filter(c => c.cat === 'office').length, nHybrid = COMPANIES.filter(c => c.cat === 'hybrid').length,
  nRemote = COMPANIES.filter(c => c.cat === 'remote').length, nNC = COMPANIES.filter(c => c.cat === 'unconfirmed').length;

vo.innerHTML = `
  <div class="abs v-shade" id="vShade"></div>
  <div class="abs v-kicker mono" id="vKick"><i></i>London · return-to-office tracker · as of 15 Oct 2026</div>
  <div class="abs v-title" id="vTitle"><span class="l"><span>Back to the</span></span><span class="l big"><span>Office</span></span></div>
  <div class="abs v-sub" id="vSub">How many days a week do London's biggest tech &amp; finance employers want you at your desk?</div>
  <div class="abs v-stats" id="vStats">${STATS.map(s => `<div class="v-stat" style="--c:${s.c}"><b data-to="${s.v}">0</b><span>${s.l}</span></div>`).join('')}</div>
  <div class="abs v-bug" id="vBug"><div class="m"><i style="background:${C('remote')}"></i><i style="background:${C('hybrid')}"></i><i style="background:${C('office')}"></i></div><div><b>Back to the Office</b><small>London RTO map</small></div></div>
  <div class="abs v-clock" id="vClock"><div class="d" id="vDay">MON</div><div class="h" id="vHour">06:00</div></div>
  <div class="abs v-l3" id="vL3"><div class="d" id="vL3d"></div><div class="t" id="vL3t"></div></div>
  <div class="abs v-week" id="vWeek"><i id="vWeekI"></i>${['MON', 'TUE', 'WED', 'THU', 'FRI'].map((d, i) => `<span style="left:${10 + i * 20}%">${d}</span>`).join('')}</div>
  <div class="abs v-legend" id="vLeg">${['remote', 'hybrid', 'office', 'unconfirmed'].map(k => `<span><i style="--c:${C(k)}"></i>${CAT[k].name}</span>`).join('')}</div>
  <div class="abs v-card" id="vCard"></div>
  <div class="abs v-sum" id="vSum"><h2>Where London<br>stands</h2>
    <div class="row" style="--c:${C('office')}"><b>${nOffice}</b><span>Five-day<small>office-first</small></span></div>
    <div class="row" style="--c:${C('hybrid')}"><b>${nHybrid}</b><span>Hybrid<small>2–3 days</small></span></div>
    <div class="row" style="--c:${C('remote')}"><b>${nRemote}</b><span>Remote-friendly<small>no fixed minimum</small></span></div>
    <div class="row" style="--c:${C('unconfirmed')}"><b>${nNC}</b><span>Not confirmed<small>no public source</small></span></div></div>
  <div class="abs v-foot mono" id="vFoot"><span>Policies sourced &amp; dated · as of 15 Oct 2026</span><span>Lights &amp; trails: illustrative model</span></div>
  <div class="abs v-end" id="vEnd"><div class="m"><i style="background:${C('remote')}"></i><i style="background:${C('hybrid')}"></i><i style="background:${C('office')}"></i></div>
    <h1>Back to the<br>Office</h1><p>Explore the interactive 3D map. Every policy sourced and dated.</p><div class="by">Built by<b>Ari Khan</b></div></div>
  <div class="abs v-flash" id="vFlash"></div>`;
const $ = id => document.getElementById(id);
const show = (id, clip, op = 1) => { const el = $(id); if (clip === null) { el.style.display = 'none'; return el; } el.style.display = ''; el.style.clipPath = clip === 'none' ? '' : clip; el.style.opacity = op; return el; };
const nums = [...vo.querySelectorAll('#vStats b')];
let lastCard = null;

function overlays(t) {
  // area/landmark labels only while exploring the map
  document.getElementById('labels').style.opacity = t > 7.6 && t < 33.4 ? Math.min(1, (t - 7.6) / 0.6, (33.4 - t) / 0.4) : 0;
  // title block
  const tOut = 6.6;
  show('vShade', t < 9.6 ? 'none' : t > 47.6 ? 'none' : (t > 44.2 && t < 48 ? 'none' : null), t < 9.6 ? 1 - lin(t, 7.0, 9.4) : 0.9 * lin(t, 44.2, 45));
  show('vKick', inOut(t, 0.3, tOut + 0.2));
  const title = show('vTitle', t < tOut + 0.6 ? 'none' : null);
  if (t < tOut + 0.6) {
    title.querySelectorAll('.l span').forEach((s, i) => { const p = eout(lin(t, 0.4 + i * 0.35, 1.3 + i * 0.35)); const q = eio(lin(t, tOut - 0.2 + i * 0.12, tOut + 0.4 + i * 0.12)); s.style.transform = `translateY(${(1 - p) * 105 - q * 105}%)`; });
  }
  show('vSub', inOut(t, 1.6, tOut + 0.3));
  show('vStats', inOut(t, 2.4, tOut + 0.4));
  nums.forEach((b, i) => { const k = eout(lin(t, 2.6 + i * 0.25, 4.4 + i * 0.25)); b.textContent = Math.round(+b.dataset.to * k); });
  // bug + footer
  show('vBug', t > 8.2 && t < 47.8 ? (t < 8.7 ? wipe((t - 8.2) / 0.5) : 'none') : null);
  show('vFoot', t > 8.2 && t < 47.8 ? 'none' : null, lin(t, 8.2, 8.8));
  show('vLeg', inOut(t, 8.0, 13.6));
  // week clock + progress + lower thirds
  const inWeek = t >= W0 - 0.2 && t <= W1 + 0.4;
  show('vClock', inWeek ? (t < W0 + 0.3 ? wipe((t - W0 + 0.2) / 0.5) : t > W1 ? unwipe((t - W1) / 0.4) : 'none') : null);
  show('vWeek', inWeek ? 'none' : null, inWeek ? 1 : 0);
  if (inWeek) {
    const h = sim.h, d = Math.min(4, Math.floor(h / 24)), hod = h - d * 24;
    $('vDay').textContent = ['MON', 'TUE', 'WED', 'THU', 'FRI'][d];
    $('vHour').textContent = `${String(Math.floor(hod)).padStart(2, '0')}:${String(Math.floor((hod % 1) * 60)).padStart(2, '0')}`;
    $('vWeekI').style.width = `${clamp((t - W0) / (W1 - W0)) * 100}%`;
    const di = Math.min(4, Math.floor((t - W0) / DAY)), dt0 = W0 + di * DAY + 0.25;
    const fri = di === 4;
    const l3 = show('vL3', inOut(t, dt0, dt0 + (fri ? 4.6 : 3.4), 0.4));
    if (l3.style.display !== 'none') { $('vL3d').textContent = DAYS[di]; $('vL3t').textContent = CAPS[di]; }
  } else show('vL3', null);
  // explainer cards
  let active = null;
  for (const c of CARDS) if (t >= c.t0 && t < c.t1) active = c;
  if (active) {
    const co = COMPANIES.find(x => x.id === active.id);
    const el = $('vCard');
    if (lastCard !== active.id) { el.innerHTML = cardHTML(co); el.style.setProperty('--c', CAT[co.cat].hex); lastCard = active.id; }
    show('vCard', inOut(t, active.t0 + 0.1, active.t1, 0.4));
    const w = el.querySelector('.wipe'), p = lin(t, active.t0 + 0.1, active.t0 + 0.55);
    w.style.transform = `scaleX(${p < 0.5 ? 1 : 1 - eio((p - 0.5) * 2)})`; w.style.transformOrigin = 'right';
    B.state.selected = active.id;
  } else { show('vCard', null); B.state.selected = null; }
  // summary
  show('vSum', inOut(t, 44.4, 47.9));
  // end card
  show('vEnd', t >= 47.9 ? (t < 48.5 ? wipe((t - 47.9) / 0.6) : 'none') : null);
  // flash on section hits
  const hits = [7.2, 9.6, 33.6, 48.0];
  let f = 0; for (const h of hits) if (t >= h && t < h + 0.35) f = 0.35 * (1 - (t - h) / 0.35);
  show('vFlash', f > 0 ? 'none' : null, f);
}

window.__duration = DURATION;
window.__render = async (t) => {
  sim.playing = false;
  sim.h = simAt(t);
  cameraAt(t);
  overlays(t);
  B.frame(t * 1000, 1 / FPS);
  B.renderer.getContext().finish();
  await new Promise(r => requestAnimationFrame(() => r()));
};
window.__advance = (t) => { sim.playing = false; sim.h = simAt(t); cameraAt(t); overlays(t); B.frame(t * 1000, 1 / FPS, true); };
window.__videoReady = true;
