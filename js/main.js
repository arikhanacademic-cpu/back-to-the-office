import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { COMPANIES, CAT, AREAS, THAMES, ROUTES, LANDMARKS, AS_OF } from './data.js';

/* ════════════════════════════ setup ════════════════════════════ */
const qs = new URLSearchParams(location.search);
const CAPTURE = qs.has('capture');
const MOBILE = matchMedia('(max-width: 760px)').matches || /Mobi|Android/i.test(navigator.userAgent);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fmtDate = (iso, opts = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  new Date(iso + (iso.length === 7 ? '-01' : '') + 'T12:00:00Z').toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' });
$$('[data-asof]').forEach(el => (el.textContent = fmtDate(AS_OF)));

// 1 world unit ≈ 10 m. x = east, z = south.
const LAT0 = 51.512, LNG0 = -0.095;
const P = (lng, lat) => new THREE.Vector2((lng - LNG0) * 6930, -(lat - LAT0) * 11054);

const canvas = $('#gl');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
const DPR = Math.min(devicePixelRatio || 1, MOBILE ? 1.5 : 2);
renderer.setPixelRatio(DPR);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
const FOG = new THREE.Color('#1a1430');
scene.fog = new THREE.FogExp2(FOG, 0.0015);
const camera = new THREE.PerspectiveCamera(40, 1, 1, 9000);
camera.position.set(-200, 260, 520);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.maxPolarAngle = 1.32; controls.minDistance = 30; controls.maxDistance = 1500;
controls.screenSpacePanning = false; controls.rotateSpeed = 0.6;
controls.target.set(150, 0, 0);

const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: MOBILE ? 0 : 4 });
const composer = new EffectComposer(renderer, rt);
composer.addPass(new RenderPass(scene, camera));
// Guard: a single NaN/Inf pixel (e.g. a specular spike overflowing half-float) gets smeared by the bloom blur into black blocks.
composer.addPass(new ShaderPass({
  uniforms: { tDiffuse: { value: null } },
  vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
  fragmentShader: 'uniform sampler2D tDiffuse; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv); bvec4 bad = bvec4(isnan(c.r)||isinf(c.r), isnan(c.g)||isinf(c.g), isnan(c.b)||isinf(c.b), isnan(c.a)||isinf(c.a)); if (any(bad)) c = vec4(0.,0.,0.,1.); gl_FragColor = vec4(clamp(c.rgb, 0., 40.), 1.); }',
}));
const bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.85, 0.5, 0.7);
composer.addPass(bloom);
composer.addPass(new OutputPass());

function resize() {
  const w = CAPTURE ? +(qs.get('size') || 1080) : innerWidth, h = CAPTURE ? +(qs.get('size') || 1080) : innerHeight;
  renderer.setSize(w, h, !CAPTURE);
  composer.setPixelRatio(CAPTURE ? 1 : DPR);
  if (CAPTURE) renderer.setPixelRatio(1);
  composer.setSize(w, h);
  bloom.resolution.set(w / 2, h / 2);
  camera.aspect = w / h; camera.fov = w / h < 0.8 ? 62 : 40; camera.updateProjectionMatrix();
}
addEventListener('resize', resize);

/* ═════════════════════ seeded random ═════════════════════ */
function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const rand = mulberry32(20261015);
const gauss = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));

/* ═════════════════════ lights + sky ═════════════════════ */
scene.add(new THREE.HemisphereLight(0x5a64a8, 0x0a0a12, 0.7));
const sun = new THREE.DirectionalLight(0xff8a5a, 1.1); sun.position.set(-900, 160, 300); scene.add(sun);

const SUN_DIR = new THREE.Vector3(-0.86, 0.04, 0.5).normalize();
const sky = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 24), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, fog: false,
  uniforms: { uSun: { value: SUN_DIR }, uFog: { value: FOG } },
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); vec4 p = projectionMatrix*modelViewMatrix*vec4(position,1.); gl_Position = p.xyww; }`,
  fragmentShader: `varying vec3 vDir; uniform vec3 uSun; uniform vec3 uFog;
    void main(){
      vec3 d = normalize(vDir); float h = d.y;
      vec3 zen = vec3(0.012,0.02,0.055), mid = vec3(0.07,0.06,0.16), hor = vec3(0.62,0.22,0.24), low = vec3(0.10,0.07,0.13);
      vec3 c = mix(hor, mid, smoothstep(0.0,0.16,h)); c = mix(c, zen, smoothstep(0.14,0.6,h));
      c = mix(uFog, c, smoothstep(0.0,0.07,h));
      float s = max(dot(d,uSun),0.);
      c += vec3(1.0,0.45,0.18) * pow(s,6.) * 0.55 * smoothstep(-0.05,0.08,h+0.04);
      c += vec3(1.0,0.6,0.3) * pow(s,60.) * 0.7;
      // a few stars
      vec3 q = floor(d*420.); float r = fract(sin(dot(q,vec3(12.9898,78.233,37.719)))*43758.5453);
      c += step(0.9985,r) * smoothstep(0.25,0.6,h) * 0.6;
      gl_FragColor = vec4(c,1.);
    }`
}));
scene.add(sky);

/* ═════════════════════ Thames ═════════════════════ */
const riverCurve = new THREE.CatmullRomCurve3(THAMES.map(([lng, lat]) => { const p = P(lng, lat); return new THREE.Vector3(p.x, 0, p.y); }), false, 'centripetal');
const RIVER_N = 600, RIVER_HALF = 12.5;
const riverPts = riverCurve.getSpacedPoints(RIVER_N);
function riverDist(x, z) {
  let best = 1e9;
  for (let i = 0; i < riverPts.length - 1; i += 2) {
    const a = riverPts[i], b = riverPts[Math.min(i + 2, riverPts.length - 1)];
    const abx = b.x - a.x, abz = b.z - a.z, t = Math.max(0, Math.min(1, ((x - a.x) * abx + (z - a.z) * abz) / (abx * abx + abz * abz)));
    const dx = a.x + abx * t - x, dz = a.z + abz * t - z, d = dx * dx + dz * dz;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}
function riverWidthAt(i) { // slightly wider downstream
  return RIVER_HALF * (0.85 + 0.6 * (i / RIVER_N));
}
{
  const pos = [], uv = [], idx = [];
  let acc = 0;
  for (let i = 0; i <= RIVER_N; i++) {
    const p = riverPts[i], t = riverCurve.getTangentAt(i / RIVER_N);
    const n = new THREE.Vector3(-t.z, 0, t.x), w = riverWidthAt(i);
    if (i) acc += p.distanceTo(riverPts[i - 1]);
    pos.push(p.x + n.x * w, 0.05, p.z + n.z * w, p.x - n.x * w, 0.05, p.z - n.z * w);
    uv.push(acc, 0, acc, 1);
    if (i < RIVER_N) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  const m = new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uTime: { value: 0 } }]),
    vertexShader: `varying vec2 vUv; varying vec3 vW; \n#include <fog_pars_vertex>\n
      void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition; \n#include <fog_vertex>\n }`,
    fragmentShader: `varying vec2 vUv; varying vec3 vW; uniform float uTime; \n#include <fog_pars_fragment>\n
      float h(vec2 p){ return fract(sin(dot(p,vec2(41.3,289.1)))*45758.5); }
      float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){
        vec3 V = normalize(cameraPosition - vW);
        float fres = pow(1.-max(V.y,0.),4.);
        vec3 c = mix(vec3(0.012,0.02,0.05), vec3(0.34,0.14,0.22), fres*0.8);
        float across = abs(vUv.y*2.-1.);
        float ripple = n(vec2(vUv.x*0.35, vUv.y*22. + uTime*0.6)) * n(vec2(vUv.x*1.3 - uTime*0.4, vUv.y*60.));
        c += vec3(1.0,0.62,0.35) * pow(ripple, 6.) * 0.45;
        c += vec3(0.5,0.6,1.0) * pow(n(vec2(vUv.x*0.8+uTime*0.2, vUv.y*40.)),10.) * 0.12;
        // embankment lamps
        float lamp = step(0.93, fract(vUv.x*0.16)) * smoothstep(0.9,0.97,across);
        c += vec3(1.0,0.72,0.42) * lamp * 1.3;
        c = mix(c, vec3(0.02,0.02,0.03), smoothstep(0.97,1.0,across));
        gl_FragColor = vec4(c,1.);
        \n#include <fog_fragment>\n
      }`
  });
  m.side = THREE.DoubleSide;
  const river = new THREE.Mesh(g, m); river.name = 'river'; scene.add(river);
}

/* ═════════════════════ procedural city ═════════════════════ */
const parks = [
  [-0.170, 51.5070, 78, 36], [-0.1545, 51.5290, 42, 40], [-0.1360, 51.5030, 30, 14], [-0.0400, 51.5360, 30, 22],
  [0.0010, 51.4770, 34, 30], [-0.1570, 51.4790, 24, 20], [-0.1060, 51.5440, 18, 18],
].map(([lng, lat, rx, rz]) => { const p = P(lng, lat); return { x: p.x, z: p.y, rx, rz }; });
const offices = COMPANIES.filter(c => c.lat != null).map(c => { const p = P(c.lng, c.lat); return { c, x: p.x, z: p.y }; });
const cCity = P(-0.083, 51.5140), cWharf = P(-0.0190, 51.5045), cWest = P(-0.138, 51.514), cKX = P(-0.125, 51.532), cCentre = P(-0.10, 51.512);

const bldgs = [];
const STEP = MOBILE ? 11 : 8.2;
for (let x = -980; x <= 1050; x += STEP) for (let z = -720; z <= 560; z += STEP) {
  const jx = x + (rand() - 0.5) * STEP * 0.5, jz = z + (rand() - 0.5) * STEP * 0.5;
  const dc = Math.hypot(jx - cCentre.x, jz - cCentre.y);
  let dens = 0.32 + 0.6 * Math.exp(-dc / 520) + 0.4 * gauss(jx, jz, cCity.x, cCity.y, 90) + 0.4 * gauss(jx, jz, cWharf.x, cWharf.y, 60);
  if (rand() > dens) continue;
  if (parks.some(p => ((jx - p.x) / p.rx) ** 2 + ((jz - p.z) / p.rz) ** 2 < 1)) continue;
  if (riverDist(jx, jz) < RIVER_HALF * 1.45 + 3) continue;
  if (offices.some(o => Math.hypot(o.x - jx, o.z - jz) < 7)) continue;
  let h = (0.8 + 2.2 * Math.exp(-dc / 500)) * (0.5 + rand() * 0.9);
  h += 15 * gauss(jx, jz, cCity.x, cCity.y, 26) * rand() ** 1.5 * 1.6;
  h += 18 * gauss(jx, jz, cWharf.x, cWharf.y, 24) * (0.4 + rand());
  h += 2.5 * gauss(jx, jz, cWest.x, cWest.y, 60) + 3 * gauss(jx, jz, cKX.x, cKX.y, 30) * rand();
  if (rand() < 0.012 * Math.exp(-dc / 500)) h += 6 + rand() * 10;
  const w = STEP * (0.42 + rand() * 0.42), d = STEP * (0.42 + rand() * 0.42);
  bldgs.push({ x: jx, z: jz, w, d, h: Math.max(0.8, h), r: (Math.floor(rand() * 4) * Math.PI / 2) + (rand() - 0.5) * 0.25, lit: 0.05 + rand() * rand() * 0.42 });
}
// landmark towers that share the generic glass shader
const lmTower = (lng, lat, w, d, h) => { const p = P(lng, lat); bldgs.push({ x: p.x, z: p.y, w, d, h, r: 0, lit: 0.55 }); };
lmTower(-0.0195, 51.5049, 5, 5, 23.5); // One Canada Square body

const buildingVS = `
  attribute float aSeed; attribute float aLit;
  varying vec3 vW; varying vec3 vN; varying vec3 vL; varying vec3 vS; varying float vSeed; varying float vLit;
  \n#include <fog_pars_vertex>\n
  void main(){
    mat4 im = instanceMatrix;
    vec4 w = modelMatrix * im * vec4(position,1.);
    vW = w.xyz; vL = position;
    vS = vec3(length(im[0].xyz), length(im[1].xyz), length(im[2].xyz));
    vN = normalize(mat3(modelMatrix) * mat3(im) * normal);
    vSeed = aSeed; vLit = aLit;
    vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
    \n#include <fog_vertex>\n
  }`;
const buildingFS = `
  varying vec3 vW; varying vec3 vN; varying vec3 vL; varying vec3 vS; varying float vSeed; varying float vLit;
  uniform float uNight;
  \n#include <fog_pars_fragment>\n
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  void main(){
    vec3 n = normalize(vN); vec3 V = normalize(cameraPosition - vW);
    float fres = pow(1.-max(dot(n,V),0.),3.);
    vec3 base = vec3(0.006,0.008,0.015) + fres*vec3(0.022,0.022,0.04) + vec3(0.012,0.008,0.02)*vL.y;
    base += max(dot(n, normalize(vec3(-0.86,0.2,0.5))),0.) * vec3(0.025,0.01,0.008) * vL.y;
    if (n.y > 0.5) { gl_FragColor = vec4(vec3(0.006,0.007,0.011),1.);
      \n#include <fog_fragment>\n
      return; }
    float hz = abs(n.x) > 0.5 ? (vL.z+0.5)*vS.z : (vL.x+0.5)*vS.x;
    vec2 cell = vec2(hz/0.34, (vL.y*vS.y)/0.38);
    vec2 id = floor(cell), f = fract(cell);
    float win = step(0.16,f.x)*step(f.x,0.84)*step(0.22,f.y)*step(f.y,0.82);
    float r = hash(id + vSeed*13.7 + n.xz*7.1);
    float on = step(r, vLit*uNight);
    vec3 warm = mix(vec3(1.0,0.70,0.40), vec3(0.70,0.82,1.0), step(0.72, fract(r*9.1)));
    vec3 lit = warm * (0.35 + 0.45*hash(id*1.31+vSeed));
    vec3 det = base + on*win*lit;
    vec3 avg = base + warm*0.5*vLit*uNight*0.16;
    float aa = clamp(1.6 - max(fwidth(cell.x),fwidth(cell.y))*1.4, 0., 1.);
    gl_FragColor = vec4(mix(avg, det, aa),1.);
    \n#include <fog_fragment>\n
  }`;
const buildingMat = new THREE.ShaderMaterial({
  fog: true, vertexShader: buildingVS, fragmentShader: buildingFS,
  uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uNight: { value: 1 } }]),
});
{
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const seeds = new Float32Array(bldgs.length), lits = new Float32Array(bldgs.length);
  const mesh = new THREE.InstancedMesh(geo, buildingMat, bldgs.length);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), Y = new THREE.Vector3(0, 1, 0);
  bldgs.forEach((b, i) => { q.setFromAxisAngle(Y, b.r); s.set(b.w, b.h, b.d); p.set(b.x, 0, b.z); m.compose(p, q, s); mesh.setMatrixAt(i, m); seeds[i] = rand() * 100; lits[i] = b.lit; });
  geo.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 1));
  geo.setAttribute('aLit', new THREE.InstancedBufferAttribute(lits, 1));
  mesh.frustumCulled = false;
  scene.add(mesh);
}

/* ═════════════════════ ground with street-light map ═════════════════════ */
{
  const S = 2400, RES = MOBILE ? 1024 : 2048;
  const cv = document.createElement('canvas'); cv.width = cv.height = RES;
  const g = cv.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, RES, RES);
  const toC = (x, z) => [(x / S + 0.5) * RES, (z / S + 0.5) * RES];
  g.globalCompositeOperation = 'lighter';
  // street grid haze
  for (const b of bldgs) {
    const [cx, cy] = toC(b.x, b.z);
    const a = 0.05 + 0.05 * Math.min(1, b.h / 6);
    g.fillStyle = `rgba(255,${150 + (rand() * 50) | 0},80,${a})`;
    const r = 1.4 + rand() * 1.6;
    g.fillRect(cx + (rand() - 0.5) * 6, cy + (rand() - 0.5) * 6, r, r);
  }
  // main roads: soft warm strokes between random dense points
  g.strokeStyle = 'rgba(255,170,90,0.09)'; g.lineWidth = 1.2;
  for (let i = 0; i < 260; i++) {
    const a = bldgs[(rand() * bldgs.length) | 0], b = bldgs[(rand() * bldgs.length) | 0];
    if (Math.hypot(a.x - b.x, a.z - b.z) > 220) continue;
    const [x1, y1] = toC(a.x, a.z), [x2, y2] = toC(b.x, b.z);
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke();
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.NoColorSpace; tex.anisotropy = 4;
  const mat = new THREE.ShaderMaterial({
    fog: true,
    uniforms: THREE.UniformsUtils.merge([THREE.UniformsLib.fog, { uMap: { value: null } }]),
    vertexShader: `varying vec2 vUv; varying vec3 vW; \n#include <fog_pars_vertex>\n
      void main(){ vUv = uv; vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition; \n#include <fog_vertex>\n }`,
    fragmentShader: `varying vec2 vUv; varying vec3 vW; uniform sampler2D uMap; \n#include <fog_pars_fragment>\n
      void main(){
        vec3 c = vec3(0.012,0.014,0.022);
        vec3 l = texture2D(uMap, vUv).rgb;
        c += l * vec3(1.0,0.7,0.45) * 1.6;
        vec2 g = abs(fract(vW.xz/8.2 + 0.5) - 0.5);
        c += vec3(0.008,0.008,0.014) * (1. - smoothstep(0.0, 0.04, min(g.x,g.y)));
        gl_FragColor = vec4(c,1.);
        \n#include <fog_fragment>\n
      }`
  });
  mat.uniforms.uMap.value = tex;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(S, S), mat);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02;
  scene.add(ground);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(12000, 12000), new THREE.MeshBasicMaterial({ color: 0x07080d }));
  far.rotation.x = -Math.PI / 2; far.position.y = -0.2; scene.add(far);
}

/* ═════════════════════ bridges ═════════════════════ */
const glowMat = (hex, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), toneMapped: true });
const darkMat = new THREE.MeshStandardMaterial({ color: 0x141821, roughness: 0.55, metalness: 0.4 });
function nearestRiver(x, z) {
  let bi = 0, bd = 1e9;
  riverPts.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; bi = i; } });
  return { i: bi, p: riverPts[bi], t: riverCurve.getTangentAt(bi / RIVER_N) };
}
[[-0.1278, 51.4874], [-0.1225, 51.4943], [-0.1218, 51.5009], [-0.1200, 51.5066], [-0.1160, 51.5090], [-0.1045, 51.5097], [-0.0985, 51.5094], [-0.0945, 51.5088], [-0.0877, 51.5079]].forEach(([lng, lat]) => {
  const p = P(lng, lat), r = nearestRiver(p.x, p.y), len = riverWidthAt(r.i) * 2 + 8;
  const grp = new THREE.Group();
  const deck = new THREE.Mesh(new THREE.BoxGeometry(len, 0.5, 2.2), darkMat); deck.position.y = 0.9; grp.add(deck);
  for (const s of [-1, 1]) { const strip = new THREE.Mesh(new THREE.BoxGeometry(len, 0.08, 0.08), glowMat('#ffbf80', 2.2)); strip.position.set(0, 1.25, s * 1.1); grp.add(strip); }
  grp.position.set(r.p.x, 0, r.p.z);
  grp.lookAt(r.p.x + r.t.x, 0, r.p.z + r.t.z);
  scene.add(grp);
});

/* ═════════════════════ landmarks ═════════════════════ */
const landmarkLabels = [];
function edges(geo, hex, op = 0.6, k = 1.6) {
  return new THREE.LineSegments(new THREE.EdgesGeometry(geo, 25), new THREE.LineBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k), transparent: true, opacity: op }));
}
const blinkers = [];
for (const L of LANDMARKS) {
  const p = P(L.lng, L.lat), g = new THREE.Group(); g.position.set(p.x, 0, p.y);
  let top = 10;
  if (L.type === 'shard') {
    const geo = new THREE.ConeGeometry(5.6, 31, 4, 1); geo.rotateY(Math.PI / 4); geo.translate(0, 15.5, 0);
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x1a2236, roughness: 0.4, metalness: 0.7 })), edges(geo, '#a9c4ff', 0.55, 1.8));
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.75, 4, 4), glowMat('#cfe0ff', 3)); tip.position.y = 29.5; g.add(tip);
    top = 32;
  } else if (L.type === 'gherkin') {
    const pts = [[0, 0], [2.2, 0], [2.8, 4], [2.9, 8], [2.5, 12.5], [1.6, 16], [0.4, 17.9], [0, 18]].map(([r, y]) => new THREE.Vector2(r, y));
    const geo = new THREE.LatheGeometry(pts, 28);
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x121a26, roughness: 0.4, metalness: 0.7 })));
    const wire = new THREE.Mesh(new THREE.LatheGeometry(pts, 14), new THREE.MeshBasicMaterial({ color: new THREE.Color('#7fe0ff').multiplyScalar(0.8), wireframe: true, transparent: true, opacity: 0.22 }));
    wire.scale.setScalar(1.01); g.add(wire); top = 19;
  } else if (L.type === 'dome') {
    const stone = new THREE.MeshStandardMaterial({ color: 0x8c7a62, roughness: 0.8, emissive: 0x3b2a18, emissiveIntensity: 0.9 });
    const nave = new THREE.Mesh(new THREE.BoxGeometry(15, 3.2, 3.6), stone); nave.position.y = 1.6; g.add(nave);
    const tr = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.2, 9), stone); tr.position.y = 1.6; g.add(tr);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(2.5, 2.6, 3.4, 32), stone); drum.position.y = 4.9; g.add(drum);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(2.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa8957a, emissive: 0x6a4a2a, emissiveIntensity: 1.2, roughness: 0.6 }));
    dome.scale.y = 1.25; dome.position.y = 6.6; g.add(dome);
    const lan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 2, 12), glowMat('#ffd9a0', 2.2)); lan.position.y = 10.6; g.add(lan);
    g.rotation.y = 0.05; top = 12;
  } else if (L.type === 'eye') {
    const wheel = new THREE.Group(); wheel.position.y = 7.4;
    const ringMat = glowMat('#ff4fa8', 2.4);
    wheel.add(new THREE.Mesh(new THREE.TorusGeometry(6.7, 0.1, 6, 96), ringMat));
    const sp = [];
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; sp.push(0, 0, 0, Math.cos(a) * 6.7, Math.sin(a) * 6.7, 0); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(sp, 3));
    wheel.add(new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ color: new THREE.Color('#ff86c8').multiplyScalar(0.9), transparent: true, opacity: 0.45 })));
    for (let i = 0; i < 32; i++) { const a = i / 32 * Math.PI * 2; const c = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 6), glowMat('#ffd0ec', 2.6)); c.position.set(Math.cos(a) * 6.95, Math.sin(a) * 6.95, 0); wheel.add(c); }
    g.add(wheel);
    const r = nearestRiver(p.x, p.y); g.lookAt(p.x + r.t.x, 0, p.y + r.t.z); g.rotateY(Math.PI / 2);
    blinkers.push({ spin: wheel });
    top = 15;
  } else if (L.type === 'clock') {
    const stone = new THREE.MeshStandardMaterial({ color: 0x9a8360, emissive: 0x5a3e1e, emissiveIntensity: 0.9, roughness: 0.8 });
    const t = new THREE.Mesh(new THREE.BoxGeometry(1.2, 8.2, 1.2), stone); t.position.y = 4.1; g.add(t);
    const sp = new THREE.Mesh(new THREE.ConeGeometry(0.95, 2.6, 4), stone); sp.rotation.y = Math.PI / 4; sp.position.y = 9.5; g.add(sp);
    for (let i = 0; i < 4; i++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.8), glowMat('#fff1c8', 2.6)); const a = i * Math.PI / 2; f.position.set(Math.sin(a) * 0.61, 7.1, Math.cos(a) * 0.61); f.rotation.y = a; g.add(f); }
    const r = nearestRiver(p.x, p.y);
    const pal = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 26), stone); pal.position.set(0.5, 1.3, 13.5); g.add(pal);
    g.lookAt(p.x + r.t.x, 0, p.y + r.t.z); top = 11;
  } else if (L.type === 'bridge') {
    const r = nearestRiver(p.x, p.y), half = riverWidthAt(r.i) * 0.55;
    const stone = new THREE.MeshStandardMaterial({ color: 0x7c7a78, emissive: 0x2e2a2a, roughness: 0.7 });
    for (const s of [-1, 1]) {
      const tw = new THREE.Mesh(new THREE.BoxGeometry(1.6, 6.5, 2.4), stone); tw.position.set(s * half, 3.25, 0); g.add(tw);
      for (const dx of [-0.6, 0.6]) for (const dz of [-1, 1]) { const pn = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.2, 4), stone); pn.position.set(s * half + dx, 7.1, dz); g.add(pn); }
      const ap = new THREE.Mesh(new THREE.BoxGeometry(riverWidthAt(r.i) * 2 - half * 2 + 2, 0.5, 2.2), darkMat); ap.position.set(s * (half + (riverWidthAt(r.i) - half) / 2 + 2), 0.9, 0); g.add(ap);
    }
    const deck = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.5, 2.2), darkMat); deck.position.y = 0.9; g.add(deck);
    const walk = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.5, 1.6), glowMat('#6fa8ff', 1.6)); walk.position.y = 5.7; g.add(walk);
    // suspension curves
    for (const s of [-1, 1]) {
      const c = new THREE.QuadraticBezierCurve3(new THREE.Vector3(s * half, 5.2, 0), new THREE.Vector3(s * (half + 5), 1.2, 0), new THREE.Vector3(s * (half + 9), 1.1, 0));
      const tg = new THREE.TubeGeometry(c, 16, 0.08, 4); g.add(new THREE.Mesh(tg, glowMat('#6fa8ff', 2.2)));
    }
    g.position.set(r.p.x, 0, r.p.z); g.lookAt(r.p.x + r.t.x, 0, r.p.z + r.t.z); top = 8;
  } else if (L.type === 'ocs') {
    const pyr = new THREE.Mesh(new THREE.ConeGeometry(3.4, 3.4, 4), new THREE.MeshStandardMaterial({ color: 0x8b93a6, metalness: 0.7, roughness: 0.45, emissive: 0x202634 })); pyr.rotation.y = Math.PI / 4; pyr.position.y = 25.2; g.add(pyr);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 6), glowMat('#ff2a2a', 4)); b.position.y = 27.2; g.add(b); blinkers.push({ mesh: b, phase: 0 });
    top = 28;
  } else if (L.type === 'bttower') {
    const geo = new THREE.CylinderGeometry(0.9, 1.1, 17.7, 16); geo.translate(0, 8.85, 0);
    g.add(new THREE.Mesh(geo, darkMat));
    for (const y of [12.4, 13.1, 13.8]) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.25, 24), glowMat('#4fc3ff', 2.4)); ring.position.y = y; g.add(ring); }
    top = 19;
  } else if (L.type === 'walkie') {
    const geo = new THREE.BoxGeometry(5, 16, 3.4, 1, 6, 1);
    const pa = geo.attributes.position;
    for (let i = 0; i < pa.count; i++) { const y = pa.getY(i) + 8; pa.setX(i, pa.getX(i) * (1 + 0.45 * (y / 16) ** 1.6)); }
    geo.translate(0, 8, 0); geo.computeVertexNormals();
    g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x18202e, roughness: 0.4, metalness: 0.7 })), edges(geo, '#b8ffd8', 0.35, 1.2));
    const garden = new THREE.Mesh(new THREE.BoxGeometry(7.1, 0.6, 3.5), glowMat('#b6ff9a', 1.6)); garden.position.y = 15.2; g.add(garden);
    g.rotation.y = 0.2; top = 17;
  } else if (L.type === 'battersea') {
    const brick = new THREE.MeshStandardMaterial({ color: 0x6d4836, emissive: 0x3a1c10, emissiveIntensity: 1, roughness: 0.9 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(15, 5, 9), brick); body.position.y = 2.5; g.add(body);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 10.5, 16), new THREE.MeshStandardMaterial({ color: 0xe6e2da, emissive: 0x5c5850, roughness: 0.6 }));
      ch.position.set(sx * 6.6, 5.25, sz * 3.8); g.add(ch);
    }
    top = 11;
  }
  scene.add(g);
  landmarkLabels.push({ name: L.name, pos: new THREE.Vector3(p.x, top + 2, p.y) });
}

/* ═════════════════════ offices ═════════════════════ */
const HEIGHTS = { jpm: 15.3, hsbc: 20, citi: 20, barclays: 15.6, morganstanley: 14, revolut: 9, salesforce: 23, ubs: 7, amazon: 7, google: 5.5, meta: 5.5, goldman: 5.5, deutsche: 7.5, lloyds: 5.5, santander: 5, uber: 8, checkout: 4.5, wise: 4.5, stanchart: 5.5, apple: 6, microsoft: 6, bofa: 5, monzo: 5, starling: 4, gocardless: 4, natwest: 6, lseg: 4.5, aviva: 5, lg: 5, schroders: 7, bloomberg: 5, blackrock: 5, klarna: 4.5, oaknorth: 4, bt: 6, deliveroo: 4.5, tiktok: 4.5 };
const officeVS = `
  varying vec3 vW; varying vec3 vN; varying vec3 vL;
  \n#include <fog_pars_vertex>\n
  void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; vL=position; vN=normalize(mat3(modelMatrix)*normal);
    vec4 mvPosition = viewMatrix*w; gl_Position = projectionMatrix*mvPosition; \n#include <fog_vertex>\n }`;
const officeFS = `
  varying vec3 vW; varying vec3 vN; varying vec3 vL;
  uniform vec3 uColor; uniform vec3 uSize; uniform float uFill; uniform float uDim; uniform float uHover; uniform float uGrey; uniform float uSeed; uniform float uTime;
  \n#include <fog_pars_fragment>\n
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  void main(){
    vec3 n = normalize(vN); vec3 V = normalize(cameraPosition - vW);
    float fres = pow(1.-max(dot(n,V),0.),3.);
    vec3 base = vec3(0.02,0.026,0.042) + fres*vec3(0.18,0.12,0.18);
    float y = vL.y; // 0..1
    float floors = max(uSize.y/0.4, 4.);
    float fl = floor(y*floors);
    float hz = abs(n.x) > 0.5 ? (vL.z+0.5)*uSize.z : (vL.x+0.5)*uSize.x;
    vec2 cell = vec2(hz/0.3, y*floors);
    vec2 id = floor(cell), f = fract(cell);
    float win = step(0.12,f.x)*step(f.x,0.88)*step(0.2,f.y)*step(f.y,0.86);
    float r = hash(id + uSeed);
    float occ = step(fl+1., uFill*floors + 0.001) * step(r, 0.9);
    float edgeFloor = smoothstep(1.0, 0.0, abs(fl - floor(uFill*floors))) * step(0.01,uFill) * (1.-step(0.995,uFill));
    vec3 col = uGrey > 0.5 ? vec3(0.55,0.6,0.7) : uColor;
    float k = uGrey > 0.5 ? 0.6 : 2.7;
    vec3 c = base;
    if (n.y > 0.5) { c = vec3(0.02,0.022,0.03) + col*0.25*uFill; }
    else {
      float aa = clamp(1.6 - max(fwidth(cell.x),fwidth(cell.y))*1.3, 0., 1.);
      float lit = mix(occ*0.78, occ*win, aa);
      c += col * lit * k * (0.75+0.35*hash(id*3.1));
      c += col * edgeFloor * 0.6 * k * win;
      // corner edges
      float ex = abs(n.x) > 0.5 ? abs(vL.z) : abs(vL.x);
      c += col * smoothstep(0.47,0.5,ex) * (0.35 + 0.9*uHover) * (uGrey > 0.5 ? 0.6 : 1.4);
      c += col * smoothstep(0.985,1.0,y) * (uGrey > 0.5 ? 0.5 : 2.0);
    }
    c += col * uHover * 0.12;
    c = mix(vec3(0.015,0.017,0.024) + base*0.4, c, uDim);
    gl_FragColor = vec4(c,1.);
    \n#include <fog_fragment>\n
  }`;
const officeObjs = [];
const hitTargets = [];
const haloGeo = new THREE.PlaneGeometry(1, 1); haloGeo.rotateX(-Math.PI / 2);
const beamGeo = new THREE.CylinderGeometry(0.28, 0.28, 1, 8, 1, true); beamGeo.translate(0, 0.5, 0);
const ringGeo = new THREE.RingGeometry(0.94, 1, 72); ringGeo.rotateX(-Math.PI / 2);
const fxVS = `varying vec2 vUv; varying vec3 vP; void main(){ vUv=uv; vP=position; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`;
for (const o of offices) {
  const c = o.c, catC = new THREE.Color(CAT[c.cat].hex), grey = c.cat === 'unconfirmed';
  const h = HEIGHTS[c.id] || 5, w = h > 12 ? 5.2 : 4.4, d = h > 12 ? 5.2 : 4.0;
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const u = THREE.UniformsUtils.merge([THREE.UniformsLib.fog, {
    uColor: { value: catC.clone().convertSRGBToLinear() }, uSize: { value: new THREE.Vector3(w, h, d) }, uFill: { value: 0.7 }, uDim: { value: 1 },
    uHover: { value: 0 }, uGrey: { value: grey ? 1 : 0 }, uSeed: { value: rand() * 50 }, uTime: { value: 0 },
  }]);
  const mesh = new THREE.Mesh(geo, new THREE.ShaderMaterial({ fog: true, uniforms: u, vertexShader: officeVS, fragmentShader: officeFS }));
  mesh.scale.set(w, h, d); mesh.position.set(o.x, 0, o.z); mesh.rotation.y = (rand() - 0.5) * 0.4;
  scene.add(mesh);
  // pool of light
  const halo = new THREE.Mesh(haloGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: catC.clone() }, uA: { value: grey ? 0.25 : 0.8 } },
    vertexShader: fxVS, fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uA; void main(){ float d = length(vUv-0.5)*2.; float a = pow(max(1.-d,0.),2.2)*uA; gl_FragColor = vec4(uColor*a,1.); }`,
  }));
  halo.scale.setScalar(grey ? 16 : 46); halo.position.set(o.x, 0.12, o.z); scene.add(halo);
  // beacon
  const beam = new THREE.Mesh(beamGeo, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uColor: { value: catC.clone() }, uA: { value: 1 } },
    vertexShader: fxVS, fragmentShader: `varying vec2 vUv; uniform vec3 uColor; uniform float uA; void main(){ float a = pow(1.-vUv.y,1.6)*uA; gl_FragColor = vec4(uColor*a*1.6,1.); }`,
  }));
  beam.position.set(o.x, h, o.z); beam.scale.set(1, grey ? 8 : 34, 1); scene.add(beam);
  // ripple (only when a tightening is on record)
  const ripples = [];
  if (c.tightened) for (let k = 0; k < 2; k++) {
    const rp = new THREE.Mesh(ringGeo, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uColor: { value: catC.clone() }, uA: { value: 0 } },
      vertexShader: fxVS, fragmentShader: `uniform vec3 uColor; uniform float uA; void main(){ gl_FragColor = vec4(uColor*uA*2.,1.); }`,
    }));
    rp.position.set(o.x, 0.3, o.z); scene.add(rp); ripples.push(rp);
  }
  // hit proxy
  const hit = new THREE.Mesh(new THREE.CylinderGeometry(Math.max(w, 6), Math.max(w, 6), h + 12, 8), new THREE.MeshBasicMaterial({ visible: false }));
  hit.position.set(o.x, (h + 12) / 2, o.z); hit.userData.c = c; scene.add(hit); hitTargets.push(hit);
  officeObjs.push({ c, mesh, halo, beam, ripples, h, x: o.x, z: o.z, jitter: (rand() - 0.5) * 0.9, fill: 0.7, dim: 1, phase: rand() });
}
const officeById = Object.fromEntries(officeObjs.map(o => [o.c.id, o]));

/* ═════════════════════ attendance model (illustrative) ═════════════════════ */
const ATT = {
  office: [0.92, 0.95, 0.96, 0.95, 0.88],
  hybrid3: [0.48, 0.93, 0.96, 0.9, 0.14],
  hybrid2: [0.34, 0.86, 0.8, 0.5, 0.1],
  remote: [0.22, 0.3, 0.32, 0.28, 0.1],
};
function attendance(c, day) {
  if (c.cat === 'office') return ATT.office[day];
  if (c.cat === 'hybrid') return (c.days <= 2 ? ATT.hybrid2 : ATT.hybrid3)[day];
  if (c.cat === 'remote') return ATT.remote[day];
  return null;
}
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
function officeFill(o, simH) {
  const day = Math.min(4, Math.floor(simH / 24)), hod = simH - day * 24;
  const att = attendance(o.c, day);
  if (att == null) return 0.32;
  const j = o.jitter, late = o.c.cat === 'office' ? 0.7 : 0;
  const v = att * ss(6.9 + j, 9.5 + j, hod) * (1 - ss(16.9 + j + late, 19.6 + j + late, hod));
  return Math.max(0.035, v);
}
const dayVol = [0, 1, 2, 3, 4].map(d => { const xs = officeObjs.map(o => attendance(o.c, d)).filter(v => v != null); return xs.reduce((a, b) => a + b, 0) / xs.length; });
const volMax = Math.max(...dayVol);
function flows(simH) {
  const day = Math.min(4, Math.floor(simH / 24)), hod = simH - day * 24, v = dayVol[day] / volMax;
  return { inb: v * (Math.exp(-(((hod - 8.4) / 0.95) ** 2)) + 0.06 * ss(7, 9, hod) * (1 - ss(16, 18, hod))), out: v * Math.exp(-(((hod - 17.9) / 1.15) ** 2)) };
}

/* ═════════════════════ commuter light-trails ═════════════════════ */
const routeData = ROUTES.map(r => {
  const curve = new THREE.CatmullRomCurve3(r.pts.map(([lng, lat]) => { const p = P(lng, lat); return new THREE.Vector3(p.x, 1.2, p.y); }), false, 'centripetal');
  const len = curve.getLength(), pts = curve.getSpacedPoints(Math.max(40, Math.round(len / 1.5)));
  const lg = new THREE.BufferGeometry().setFromPoints(pts);
  const line = new THREE.Line(lg, new THREE.LineBasicMaterial({ color: new THREE.Color(r.color).multiplyScalar(0.9), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(line);
  return { ...r, curve, len, pts, line };
});
const totalLen = routeData.reduce((a, r) => a + r.len, 0);
const NP = MOBILE ? 900 : 2200, TRAIL = 7;
const parts = [];
for (let i = 0; i < NP; i++) {
  let pick = rand() * totalLen, ri = 0;
  while (pick > routeData[ri].len && ri < routeData.length - 1) { pick -= routeData[ri].len; ri++; }
  parts.push({ r: ri, u: rand(), speed: (0.75 + rand() * 0.5) * 34 / routeData[ri].len, th: rand(), off: (rand() - 0.5) * 1.6, a: 0 });
}
const pPos = new Float32Array(NP * TRAIL * 3), pCol = new Float32Array(NP * TRAIL * 3), pSize = new Float32Array(NP * TRAIL);
const pGeo = new THREE.BufferGeometry();
pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute('color', new THREE.BufferAttribute(pCol, 3));
pGeo.setAttribute('size', new THREE.BufferAttribute(pSize, 1));
const pMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true,
  uniforms: { uScale: { value: 1 } },
  vertexShader: `attribute float size; varying vec3 vC; uniform float uScale; void main(){ vC = color; vec4 mv = modelViewMatrix*vec4(position,1.); gl_PointSize = clamp(size*(300./-mv.z), 2.2, 16.)*uScale; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord-0.5)*2.; float a = pow(max(1.-d,0.),1.8); gl_FragColor = vec4(vC*a,1.); }`,
});
const points = new THREE.Points(pGeo, pMat); points.frustumCulled = false; scene.add(points);
const tmpV = new THREE.Vector3(), tmpC = new THREE.Color();
const WARM = new THREE.Color('#ffd7a0');
function updateParticles(dt, simH) {
  const f = flows(simH), vol = Math.min(1, f.inb + f.out), dir = f.inb >= f.out ? 1 : -1;
  for (let i = 0; i < NP; i++) {
    const p = parts[i], R = routeData[p.r];
    p.u = (p.u + dir * p.speed * dt + 1) % 1;
    const target = p.th < vol * 0.95 ? 1 : 0;
    p.a += (target - p.a) * Math.min(1, dt * 3);
    tmpC.set(R.color).lerp(WARM, 0.55);
    for (let k = 0; k < TRAIL; k++) {
      const uu = ((p.u - dir * k * (1.6 / R.len)) % 1 + 1) % 1;
      const idx = Math.min(R.pts.length - 1, Math.round(uu * (R.pts.length - 1)));
      const q = R.pts[idx];
      const j = (i * TRAIL + k) * 3;
      // fade near endpoints so trails "arrive" rather than pop
      const ends = Math.min(1, uu * 12, (1 - uu) * 12);
      const tail = Math.pow(1 - k / TRAIL, 1.6) * p.a * ends;
      pPos[j] = q.x + p.off; pPos[j + 1] = q.y + (k ? 0 : 0.1); pPos[j + 2] = q.z + p.off * 0.6;
      const b = tail * (k === 0 ? 3.2 : 1.6);
      pCol[j] = tmpC.r * b; pCol[j + 1] = tmpC.g * b; pCol[j + 2] = tmpC.b * b;
      pSize[i * TRAIL + k] = (k === 0 ? 5.5 : 4.2) * (MOBILE ? 1.2 : 1);
    }
  }
  pGeo.attributes.position.needsUpdate = pGeo.attributes.color.needsUpdate = pGeo.attributes.size.needsUpdate = true;
  routeData.forEach(R => (R.line.material.opacity = 0.3 + 0.5 * vol));
}

/* ═════════════════════ filters + counts ═════════════════════ */
const state = { wfh: false, industry: new Set(), area: null, selected: null, hover: null };
const INDUSTRIES = [...new Set(COMPANIES.map(c => c.industry))];
const AREA_NAMES = [...new Set(COMPANIES.filter(c => c.lat != null).map(c => c.area))];
const matches = c => (!state.wfh || (c.cat !== 'unconfirmed' && c.days != null && c.days <= 2)) && (!state.industry.size || state.industry.has(c.industry)) && (!state.area || c.area === state.area);
const ORDER = ['remote', 'hybrid', 'office', 'unconfirmed'];

function renderCounts() {
  const list = COMPANIES.filter(matches);
  $('#pCount').innerHTML = ORDER.map(k => `<div class="pc" style="--c:${CAT[k].hex}"><b>${list.filter(c => c.cat === k).length}</b><span>${CAT[k].name}</span></div>`).join('');
  const rows = AREA_NAMES.map(a => ({ a, n: ORDER.map(k => COMPANIES.filter(c => c.area === a && c.cat === k && matches({ ...c, area: state.area ? c.area : c.area })).length) }));
  $('#areaTable').innerHTML = `<div class="area-row area-head"><span>Area</span>${ORDER.map(k => `<span class="n" style="--c:${CAT[k].hex}">●</span>`).join('')}</div>` +
    rows.map(r => `<div class="area-row" data-area="${r.a}"><span>${r.a}</span>${r.n.map((v, i) => `<span class="n ${v ? '' : 'z'}" style="--c:${CAT[ORDER[i]].hex}">${v}</span>`).join('')}</div>`).join('');
  $$('#areaTable [data-area]').forEach(el => el.onclick = () => { state.area = state.area === el.dataset.area ? null : el.dataset.area; syncFilterUI(); applyFilters(); flyToArea(el.dataset.area); });
  // office list
  const sorted = [...COMPANIES].sort((a, b) => ['office', 'hybrid', 'remote', 'unconfirmed'].indexOf(a.cat) - ['office', 'hybrid', 'remote', 'unconfirmed'].indexOf(b.cat) || a.name.localeCompare(b.name));
  $('#officeList').innerHTML = sorted.map(c => `<button class="ol-item ${matches(c) ? '' : 'dim'}" data-id="${c.id}" style="--c:${CAT[c.cat].hex}"><i></i>${c.name}<small>${c.cat === 'unconfirmed' ? 'n/c' : c.label}</small></button>`).join('');
  $$('#officeList [data-id]').forEach(el => el.onclick = () => select(el.dataset.id, true));
  // area labels
  areaLabels.forEach(L => {
    const n = ORDER.map(k => COMPANIES.filter(c => c.area === L.area.name && c.cat === k && matches(c)).length);
    L.el.querySelector('.ac').innerHTML = n.map((v, i) => v ? `<b style="--c:${CAT[ORDER[i]].hex}">${v}</b>` : '').join('');
  });
}
function applyFilters() {
  officeObjs.forEach(o => (o.targetDim = matches(o.c) ? 1 : 0.08));
  renderCounts();
}
function syncFilterUI() {
  $('#fWfh').checked = state.wfh;
  $$('#fIndustry button').forEach(b => b.classList.toggle('on', state.industry.has(b.dataset.v)));
  $$('#fArea button').forEach(b => b.classList.toggle('on', state.area === b.dataset.v));
}
$('#fIndustry').innerHTML = INDUSTRIES.map(v => `<button data-v="${v}">${v}</button>`).join('');
$('#fArea').innerHTML = AREA_NAMES.map(v => `<button data-v="${v}">${v}</button>`).join('');
$$('#fIndustry button').forEach(b => b.onclick = () => { state.industry.has(b.dataset.v) ? state.industry.delete(b.dataset.v) : state.industry.add(b.dataset.v); syncFilterUI(); applyFilters(); });
$$('#fArea button').forEach(b => b.onclick = () => { state.area = state.area === b.dataset.v ? null : b.dataset.v; syncFilterUI(); applyFilters(); if (state.area) flyToArea(state.area); });
$('#fWfh').onchange = e => { state.wfh = e.target.checked; applyFilters(); };
$('#fReset').onclick = () => { state.wfh = false; state.industry.clear(); state.area = null; syncFilterUI(); applyFilters(); };
$$('.p-tabs button').forEach(b => b.onclick = () => { $$('.p-tabs button').forEach(x => x.classList.toggle('on', x === b)); $$('[data-pane]').forEach(p => (p.hidden = p.dataset.pane !== b.dataset.tab)); });
$('#btnPanel').onclick = () => $('#panel').classList.toggle('open');

/* ═════════════════════ labels (HTML overlay) ═════════════════════ */
const labelsEl = $('#labels');
const areaLabels = AREAS.filter(a => a.label).map(a => {
  const p = P(a.lng, a.lat), el = document.createElement('div'); el.className = 'alabel';
  el.innerHTML = `<div class="an">${a.short || a.name}</div><div class="ac"></div>`; labelsEl.appendChild(el);
  return { area: a, el, pos: new THREE.Vector3(p.x, a.name === 'Canary Wharf' ? 40 : 34, p.y) };
});
const lmEls = landmarkLabels.map(l => { const el = document.createElement('div'); el.className = 'llabel'; el.textContent = l.name; labelsEl.appendChild(el); return { ...l, el }; });
const tagEls = officeObjs.filter(o => o.c.tightened).map(o => {
  const el = document.createElement('div'); el.className = 'llabel';
  el.style.color = CAT[o.c.cat].hex; el.style.fontWeight = 700;
  el.textContent = `▲ ${fmtDate(o.c.tightened.date, { month: 'short', year: 'numeric' })}`;
  labelsEl.appendChild(el); return { o, el, pos: new THREE.Vector3(o.x, o.h + 3, o.z) };
});
const proj = new THREE.Vector3();
function place(el, pos, minD, maxD, extraHide = false) {
  proj.copy(pos).project(camera);
  const d = camera.position.distanceTo(pos);
  const vis = proj.z < 1 && Math.abs(proj.x) < 1.1 && Math.abs(proj.y) < 1.1 && d > minD && d < maxD && !extraHide;
  el.style.opacity = vis ? 1 : 0;
  if (vis) el.style.transform = `translate(${((proj.x + 1) / 2 * innerWidth).toFixed(1)}px, ${((1 - proj.y) / 2 * innerHeight).toFixed(1)}px)` + (el.classList.contains('llabel') ? ' translate(-50%,-100%)' : ' translate(0,-100%)');
}
function updateLabels() {
  areaLabels.forEach(L => place(L.el, L.pos, 60, 1700));
  lmEls.forEach(L => place(L.el, L.pos, 30, MOBILE ? 0 : 520));
  tagEls.forEach(T => place(T.el, T.pos, 20, MOBILE ? 260 : 420, T.o.dim < 0.5));
}

/* ═════════════════════ camera choreography ═════════════════════ */
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const at = (lng, lat) => { const p = P(lng, lat); return V3(p.x, 0, p.y); };
const CAMS = {
  overview: { t: at(-0.066, 51.5125), o: V3(210, 230, 330) },
  city: { t: at(-0.088, 51.5145), o: V3(-60, 105, 175) },
  wharf: { t: at(-0.019, 51.5045), o: V3(-150, 95, 140) },
  kx: { t: at(-0.128, 51.530), o: V3(60, 95, 170) },
  west: { t: at(-0.138, 51.515), o: V3(40, 110, 180) },
};
let tween = null;
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function flyTo(target, pos, dur = 2.2) {
  tween = { t0: performance.now() / 1000, dur, fromT: controls.target.clone(), fromP: camera.position.clone(), toT: target.clone(), toP: pos.clone() };
}
function flyPreset(k, dur) { const c = { ...CAMS[k] }; if (camera.aspect < 0.8) { c.o = c.o.clone().multiplyScalar(k === 'overview' ? 1.15 : 1.25); c.o.y *= 1.6; } flyTo(c.t, c.t.clone().add(c.o), dur); $$('#camBar button').forEach(b => b.classList.toggle('on', b.dataset.cam === k)); }
function flyToArea(name) {
  const map = { 'Canary Wharf': 'wharf', 'The City': 'city', "King's Cross & Euston": 'kx', 'West End': 'west' };
  if (map[name]) return flyPreset(map[name]);
  const a = AREAS.find(x => x.name === name); if (!a) return;
  const t = at(a.lng, a.lat); flyTo(t, t.clone().add(V3(-40, 110, 170)));
}
function flyToOffice(o) {
  const dir = camera.position.clone().sub(controls.target).setY(0).normalize();
  if (!isFinite(dir.x)) dir.set(0, 0, 1);
  const t = V3(o.x, o.h * 0.5, o.z);
  const dist = 55 + o.h * 2.2;
  flyTo(t, t.clone().add(dir.multiplyScalar(dist)).add(V3(0, dist * 0.55, 0)), 1.8);
}
function updateTween(now) {
  if (!tween) return;
  const k = Math.min(1, (now - tween.t0) / tween.dur), e = ease(k);
  controls.target.lerpVectors(tween.fromT, tween.toT, e);
  camera.position.lerpVectors(tween.fromP, tween.toP, e);
  // gentle arc
  camera.position.y += Math.sin(k * Math.PI) * tween.fromP.distanceTo(tween.toP) * 0.12;
  if (k >= 1) tween = null;
}
$$('#camBar button').forEach(b => b.onclick = () => flyPreset(b.dataset.cam));

/* ═════════════════════ explainer card ═════════════════════ */
const cardEl = $('#card');
const scopeTxt = { london: 'London-specific', uk: 'UK-specific', global: 'Company-wide' };
function cardHTML(c) {
  const col = CAT[c.cat].hex, nc = c.cat === 'unconfirmed';
  const num = nc ? '—' : (c.days === 0 ? '0' : c.days);
  const unit = nc ? 'Not confirmed<small>No reputable public source for London</small>' : c.days === 0 ? `Days required<small>${c.label}</small>` : `Days a week<small>${c.label}</small>`;
  const dots = [1, 2, 3, 4, 5].map(i => `<i class="${!nc && c.days >= i ? 'on' : ''}"></i>`).join('');
  const src = c.source ? `<div class="k-src"><span class="lbl">Source</span><a href="${c.source.url}" target="_blank" rel="noopener">${c.source.title}</a><span class="meta">${c.source.publisher} · ${c.source.accessed ? 'accessed ' : ''}${fmtDate(c.source.date)}</span>${(c.extra || []).map(e => `<span class="meta">+ <a href="${e.url}" target="_blank" rel="noopener">${e.publisher}</a> · ${e.accessed ? 'accessed ' : ''}${fmtDate(e.date)}</span>`).join('')}</div>`
    : `<div class="k-src"><span class="lbl">Source</span>No reputable public source found as of ${fmtDate(AS_OF)}.</div>`;
  const tight = c.tightened ? `<div class="k-tight"><div class="pulse"></div><div><b>Policy tightened · ${c.tightened.approx ? 'from ' : ''}${fmtDate(c.tightened.date, c.tightened.approx ? { month: 'short', year: 'numeric' } : undefined)}</b><span>${c.tightened.what}</span></div></div>` : '';
  return `<div class="k-wipe"></div><div class="k-inner">
    <div class="k-top"><div class="k-tag">${CAT[c.cat].name}</div><div class="k-ind">${c.industry}</div><button class="k-x" aria-label="Close">✕</button></div>
    <div class="k-name">${c.name}</div>
    <div class="k-addr">${c.address || 'London office not mapped'}${c.lat != null ? ' · approx. location' : ''}</div>
    <div class="k-hero"><div class="k-num">${num}</div><div class="k-unit">${unit}</div>${nc ? '' : `<div class="k-dots">${dots}</div>`}</div>
    ${nc ? '' : '<div class="k-dots-l"><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span></div>'}
    <dl class="k-rows">${c.changed !== '—' ? `<dt>Changed</dt><dd>${c.changed}</dd>` : ''}${nc && !c.source ? '' : `<dt>Scope</dt><dd>${nc ? 'Reported policy: ' : ''}${scopeTxt[c.scope] || c.scope}</dd>`}<dt>Area</dt><dd>${c.area}</dd></dl>
    ${tight}
    <p class="k-sum">${c.summary}</p>
    ${c.note ? `<p class="k-note">${c.note}</p>` : ''}
    ${src}</div>`;
}
function select(id, fly = false) {
  const c = COMPANIES.find(x => x.id === id); if (!c) return;
  state.selected = id;
  cardEl.style.setProperty('--c', CAT[c.cat].hex);
  cardEl.classList.remove('open'); void cardEl.offsetWidth;
  cardEl.innerHTML = cardHTML(c); cardEl.classList.add('open'); cardEl.scrollTop = 0;
  cardEl.querySelector('.k-x').onclick = deselect;
  const o = officeById[id];
  if (o && fly) flyToOffice(o);
  if (o) o.burst = performance.now() / 1000;
  if (MOBILE) $('#panel').classList.remove('open');
}
function deselect() { state.selected = null; cardEl.classList.remove('open'); }
addEventListener('keydown', e => { if (e.key === 'Escape') { deselect(); $('#sources').hidden = true; } });

/* ═════════════════════ picking ═════════════════════ */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const tip = $('#tip');
function pick(e) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = ray.intersectObjects(hitTargets, false);
  return hits.length ? hits[0].object.userData.c : null;
}
let downAt = null;
canvas.addEventListener('pointerdown', e => (downAt = [e.clientX, e.clientY, performance.now()]));
canvas.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6 || document.body.classList.contains('intro')) return;
  const c = pick(e); if (c) select(c.id, true); else if (!MOBILE) deselect();
});
canvas.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse' || document.body.classList.contains('intro')) return;
  const c = pick(e);
  state.hover = c ? c.id : null;
  canvas.style.cursor = c ? 'pointer' : '';
  if (c) { tip.style.setProperty('--c', CAT[c.cat].hex); tip.innerHTML = `${c.name}<small>${c.cat === 'unconfirmed' ? 'not confirmed' : c.label}</small>`; tip.style.left = e.clientX + 'px'; tip.style.top = e.clientY + 'px'; tip.style.opacity = 1; }
  else tip.style.opacity = 0;
});

/* ═════════════════════ timelapse ═════════════════════ */
const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const DAY_FULL = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const CAPTIONS = [
  'The week starts. Five-day offices fill first.',
  'Hybrid anchor days begin. Commuter trails thicken.',
  'Midweek peak. Most confirmed offices are busy.',
  'The last anchor day for most hybrid firms.',
  'Friday: hybrid offices go dark. Five-day offices stay lit.',
];
const STATIC_H = 2 * 24 + 9.25; // Wed 09:15
const qDay = ['mon', 'tue', 'wed', 'thu', 'fri'].indexOf((qs.get('day') || '').toLowerCase());
const sim = { h: qDay >= 0 ? qDay * 24 + (+qs.get('hour') || 11) : STATIC_H, playing: false, lastDay: -1 };
const simRate = hod => (hod >= 6 && hod < 21 ? 2.0 : 10.0); // sim hours per real second
function setPlaying(on) {
  sim.playing = on;
  $('#btnPlay').setAttribute('aria-pressed', on);
  $('#btnPlay .ico').textContent = on ? '❚❚' : '▶';
  $('#btnPlay .lbl').textContent = on ? 'Pause' : 'Play week';
  if (on) { if (sim.h >= 4 * 24 + 21 || sim.h === STATIC_H) sim.h = 5.6; sim.lastDay = -1; deselect(); }
}
function lowerThird(day, txt) {
  const l3 = $('#lower3');
  l3.innerHTML = `<div class="l3-day">${day}</div><div class="l3-txt">${txt}</div>`;
  l3.classList.remove('anim'); void l3.offsetWidth; l3.classList.add('anim', 'on');
  clearTimeout(l3._t); l3._t = setTimeout(() => l3.classList.remove('on'), 3800);
}
const DAY_CAM = ['overview', 'kx', 'city', 'wharf', 'overview'];
function stepSim(dt) {
  if (!sim.playing) return;
  const day = Math.floor(sim.h / 24), hod = sim.h - day * 24;
  sim.h += simRate(hod) * dt;
  const nd = Math.floor(sim.h / 24), nh = sim.h - nd * 24;
  if (nd !== sim.lastDay && nh >= 6 && nd < 5) {
    sim.lastDay = nd; lowerThird(DAY_FULL[nd], CAPTIONS[nd]);
    if (!CAPTURE) flyPreset(DAY_CAM[nd], 3.2);
  }
  if (sim.h >= 4 * 24 + 21) {
    sim.h = 4 * 24 + 21; setPlaying(false);
    const lit = officeObjs.filter(o => o.c.cat !== 'unconfirmed' && attendance(o.c, 4) > 0.5).length;
    const conf = officeObjs.filter(o => o.c.cat !== 'unconfirmed').length;
    lowerThird('Fri', `${lit} of ${conf} confirmed offices expect a full house on Fridays.`);
    setTimeout(() => { if (!sim.playing) sim.h = STATIC_H; }, 6000);
  }
}
function updateTimelineUI() {
  const day = Math.min(4, Math.floor(sim.h / 24)), hod = sim.h - day * 24;
  $('#tlDay').textContent = DAYS[day];
  $('#tlTime').textContent = `${String(Math.floor(hod)).padStart(2, '0')}:${String(Math.floor((hod % 1) * 60)).padStart(2, '0')}`;
  $('#tlFill').style.width = `${(sim.h / 120) * 100}%`;
  $$('.tl-days span').forEach((s, i) => s.classList.toggle('on', i === day));
}
$('#btnPlay').onclick = () => setPlaying(!sim.playing);
{
  const tr = $('#tlTrack');
  const scrub = e => { const r = tr.getBoundingClientRect(); sim.h = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * 119.9; };
  tr.addEventListener('pointerdown', e => { setPlaying(false); scrub(e); tr.setPointerCapture(e.pointerId); tr.onpointermove = scrub; });
  tr.addEventListener('pointerup', () => (tr.onpointermove = null));
}

/* ═════════════════════ title screen ═════════════════════ */
const nTight = COMPANIES.filter(c => c.tightened && c.tightened.date >= '2023-01-01').length;
const STATS = [
  { v: COMPANIES.length, l: 'Employers tracked', c: '#eef2f8' },
  { v: COMPANIES.filter(c => c.cat === 'office').length, l: 'Five-day mandates', c: CAT.office.hex },
  { v: nTight, l: 'Rules tightened since 2023', c: CAT.hybrid.hex },
  { v: COMPANIES.filter(c => c.cat === 'unconfirmed').length, l: 'Not publicly confirmed', c: CAT.unconfirmed.hex },
];
$('#tStats').innerHTML = STATS.map(s => `<div class="stat" style="--c:${s.c}"><b data-to="${s.v}">0</b><span>${s.l}</span></div>`).join('');
$('#tLegend').innerHTML = ORDER.map(k => `<span><i style="--c:${CAT[k].hex}"></i>${CAT[k].name} · ${CAT[k].short}</span>`).join('');
function countUp(delay = 1100) {
  $$('#tStats b').forEach((b, i) => {
    const to = +b.dataset.to, t0 = performance.now() + delay + i * 120;
    const f = now => { const k = Math.min(1, Math.max(0, (now - t0) / 1400)); b.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  });
}
document.body.classList.add('intro');
function enterMap(play) {
  document.body.classList.remove('intro');
  $('#title').classList.remove('show');
  flyPreset('overview', 2.6);
  if (play) setTimeout(() => setPlaying(true), 1200);
}
$('#btnExplore').onclick = () => enterMap(false);
$('#btnPlayIntro').onclick = () => enterMap(true);

/* ═════════════════════ sources + ticker ═════════════════════ */
$('#sTable').innerHTML = [...COMPANIES].sort((a, b) => a.name.localeCompare(b.name)).map(c => {
  const s = c.source;
  const main = s ? `<a href="${s.url}" target="_blank" rel="noopener">${s.title}</a><span class="m">${s.publisher} · ${s.accessed ? 'accessed ' : 'published '}${fmtDate(s.date)}</span>` : `<span>No reputable public source found as of ${fmtDate(AS_OF)}.</span>`;
  const extra = (c.extra || []).map(e => `<a href="${e.url}" target="_blank" rel="noopener">${e.title}</a><span class="m">${e.publisher} · ${e.accessed ? 'accessed ' : 'published '}${fmtDate(e.date)}</span>`).join('');
  return `<div class="s-row" style="--c:${CAT[c.cat].hex}"><div class="s-co">${c.name}<small>${c.address || 'Not mapped'}</small></div>
    <div class="s-pol"><b>${c.cat === 'unconfirmed' ? 'Not confirmed' : c.label}</b>${c.changed !== '—' ? c.changed + '<br>' : ''}${c.source ? (c.cat === 'unconfirmed' ? 'Reported policy: ' : 'Scope: ') + scopeTxt[c.scope] : ''}</div>
    <div class="s-src">${main}${extra}${c.note ? `<span class="nt">${c.note}</span>` : ''}</div></div>`;
}).join('');
$('#btnSources').onclick = () => ($('#sources').hidden = false);
$('#btnCloseSources').onclick = () => ($('#sources').hidden = true);
{
  const items = COMPANIES.filter(c => c.tightened).sort((a, b) => b.tightened.date.localeCompare(a.tightened.date))
    .map(c => `<span><em style="--c:${CAT[c.cat].hex}">▲ ${fmtDate(c.tightened.date, { month: 'short', year: 'numeric' })}</em><b>${c.name}</b>${c.tightened.what}</span>`).join('');
  $('#tkRun').innerHTML = items + items;
}

/* ═════════════════════ main loop ═════════════════════ */
let last = performance.now() / 1000, introAngle = 0;
const CITY_T = at(-0.070, 51.511);
function frame(nowMs, dtOverride, noRender = false) {
  const now = nowMs / 1000;
  const dt = dtOverride ?? Math.min(0.05, now - last); last = now;
  const T = (frame.t = (frame.t || 0) + dt);

  stepSim(dt);
  const simH = sim.h;
  // intro flyover
  if (document.body.classList.contains('intro') && !CAPTURE) {
    introAngle += dt * 0.045;
    const r = 430, a = -1.05 + introAngle;
    camera.position.set(CITY_T.x + Math.sin(a) * r, 150 + Math.sin(introAngle * 0.7) * 25, CITY_T.z + Math.cos(a) * r);
    controls.target.lerp(V3(CITY_T.x + Math.sin(introAngle * 0.5) * 120, 0, CITY_T.z), 0.05);
    camera.lookAt(controls.target);
  } else {
    updateTween(now);
    if (!CAPTURE) controls.update();
  }

  // offices
  for (const o of officeObjs) {
    const target = officeFill(o, simH);
    o.fill += (target - o.fill) * Math.min(1, dt * 4);
    o.dim += ((o.targetDim ?? 1) - o.dim) * Math.min(1, dt * 5);
    const u = o.mesh.material.uniforms;
    u.uFill.value = o.fill; u.uDim.value = o.dim; u.uTime.value = T;
    const hov = state.hover === o.c.id || state.selected === o.c.id ? 1 : 0;
    u.uHover.value += (hov - u.uHover.value) * Math.min(1, dt * 8);
    const live = o.c.cat === 'unconfirmed' ? 0.35 : Math.min(1, 0.15 + o.fill * 1.1);
    o.halo.material.uniforms.uA.value = (o.c.cat === 'unconfirmed' ? 0.22 : 0.85 * live) * o.dim;
    o.beam.material.uniforms.uA.value = (o.c.cat === 'unconfirmed' ? 0.25 : live) * o.dim;
    o.beam.scale.y = o.c.cat === 'unconfirmed' ? 8 : 16 + 50 * o.fill;
    // ripples
    o.ripples.forEach((rp, k) => {
      const burst = o.burst && now - o.burst < 4 ? 1.8 : 1;
      const per = 3.4, ph = ((T + o.phase * per + k * per / 2) % per) / per;
      rp.scale.setScalar(4 + ph * 46 * burst);
      rp.material.uniforms.uA.value = Math.pow(1 - ph, 2.2) * 0.75 * o.dim * (state.selected === o.c.id ? 1.6 : 1);
    });
  }
  updateParticles(dt, simH);
  pMat.uniforms.uScale.value = renderer.getPixelRatio();
  scene.getObjectByName('river').material.uniforms.uTime.value = T;
  for (const b of blinkers) {
    if (b.mesh) b.mesh.visible = Math.sin(T * 3.4) > 0.2;
    if (b.spin) b.spin.rotation.z = -T * 0.04;
  }
  if (noRender) return;
  composer.render();
  updateLabels();
  updateTimelineUI();
}

/* ═════════════════════ boot ═════════════════════ */
resize();
applyFilters();
syncFilterUI();
camera.position.set(CITY_T.x - 380, 160, CITY_T.z + 210);
camera.lookAt(CITY_T);
if (CAPTURE) {
  document.body.classList.add('capture');
  window.__bto = { renderer, frame, sim, setPlaying, flyPreset, flyTo, select, deselect, camera, controls, officeById, P, V3, at, CAMS, lowerThird, state, applyFilters, COMPANIES, CAT, STATS };
  document.body.classList.remove('intro');
  $('#loader').classList.add('done');
  import('./video.js').then(() => (window.__ready = true));
} else {
  renderer.setAnimationLoop(t => frame(t));
  if (qs.has('explore') || qDay >= 0) { enterMap(false); }
  if (qs.get('cam') && CAMS[qs.get('cam')]) setTimeout(() => flyPreset(qs.get('cam'), 0.01), 50);
  requestAnimationFrame(() => setTimeout(() => { $('#loader').classList.add('done'); countUp(); }, 250));
}
