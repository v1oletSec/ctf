// v1olet hero: the logo flower built from ~30k particles.
// Particles swirl in out of a cloud on load, the cursor pushes them apart,
// and scrolling blows the bloom away.
import * as THREE from "three";

const host = document.getElementById("scene");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const small = matchMedia("(max-width: 760px)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

if (host && webglOK()) init();
else document.body.classList.add("no-webgl");

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
  const DPR = Math.min(devicePixelRatio, 2);
  renderer.setPixelRatio(DPR);
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  /* ---------------------------------------------------- geometry */
  // petal outline, same shape family as the logo flower
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.2);
  shape.bezierCurveTo(0.14, 0.26, 0.4, 0.55, 0.34, 0.88);
  shape.bezierCurveTo(0.28, 1.13, -0.28, 1.13, -0.34, 0.88);
  shape.bezierCurveTo(-0.4, 0.55, -0.14, 0.26, 0, 0.2);
  const outline = shape.getSpacedPoints(400);

  const inside = (x, y) => {
    let c = false;
    for (let i = 0, j = outline.length - 1; i < outline.length; j = i++) {
      const a = outline[i], b = outline[j];
      if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
    }
    return c;
  };

  const PETALS = 6;
  const SCALE = 1.9;
  const N_FILL = small ? 11000 : 20000;
  const N_EDGE = small ? 3200 : 6000;
  const N_CORE = small ? 500 : 900;
  const N_RING = small ? 1400 : 2600;
  const N_DUST = small ? 700 : 1400;
  const TOTAL = N_FILL + N_EDGE + N_CORE + N_RING + N_DUST;

  const target = new Float32Array(TOTAL * 3);
  const start = new Float32Array(TOTAL * 3);
  const seed = new Float32Array(TOTAL);
  const kind = new Float32Array(TOTAL);

  const cup = (x, y) => 0.22 * (x * x + y * y); // petals curve towards the viewer
  let k = 0;
  const push = (x, y, z, type) => {
    target[k * 3] = x;
    target[k * 3 + 1] = y;
    target[k * 3 + 2] = z;
    const r = 5 + Math.random() * 7;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    start[k * 3] = r * Math.sin(ph) * Math.cos(th);
    start[k * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
    start[k * 3 + 2] = r * Math.cos(ph) - 2;
    seed[k] = Math.random();
    kind[k] = type;
    k++;
  };
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];

  for (let i = 0; i < N_FILL; ) {
    const x = (Math.random() - 0.5) * 0.8;
    const y = 0.18 + Math.random() * 0.98;
    if (!inside(x, y)) continue;
    const a = ((i % PETALS) / PETALS) * Math.PI * 2 + 0.26;
    const [rx, ry] = rot(x * SCALE, y * SCALE, a);
    push(rx, ry, cup(rx, ry) + (Math.random() - 0.5) * 0.06, 0);
    i++;
  }
  for (let i = 0; i < N_EDGE; i++) {
    const p = outline[(Math.random() * outline.length) | 0];
    const a = ((i % PETALS) / PETALS) * Math.PI * 2 + 0.26;
    const [rx, ry] = rot(p.x * SCALE, p.y * SCALE, a);
    push(rx, ry, cup(rx, ry) + 0.02, 1);
  }
  for (let i = 0; i < N_CORE; i++) {
    const r = Math.sqrt(Math.random()) * 0.24;
    const a = Math.random() * Math.PI * 2;
    push(Math.cos(a) * r, Math.sin(a) * r, 0.05 + (Math.random() - 0.5) * 0.04, 2);
  }
  for (let i = 0; i < N_RING; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 2.75 + (Math.random() - 0.5) * 0.05;
    push(Math.cos(a) * r, Math.sin(a) * r, (Math.random() - 0.5) * 0.04, 3);
  }
  for (let i = 0; i < N_DUST; i++) {
    const r = 3.2 + Math.random() * 6;
    const a = Math.random() * Math.PI * 2;
    push(Math.cos(a) * r, (Math.random() - 0.5) * 7, Math.sin(a) * r - 3, 4);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(target, 3));
  geo.setAttribute("aTarget", new THREE.BufferAttribute(target, 3));
  geo.setAttribute("aStart", new THREE.BufferAttribute(start, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
  geo.setAttribute("aKind", new THREE.BufferAttribute(kind, 1));

  const uniforms = {
    uTime: { value: 0 },
    uProgress: { value: reduceMotion ? 1 : 0 },
    uScatter: { value: 0 },
    uMouse: { value: new THREE.Vector2(9, 9) },
    uMouseStrength: { value: 0 },
    uAspect: { value: 1 },
    uPixel: { value: DPR * (small ? 0.9 : 1) },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec3 aTarget;
      attribute vec3 aStart;
      attribute float aSeed;
      attribute float aKind;
      uniform float uTime, uProgress, uScatter, uMouseStrength, uAspect, uPixel;
      uniform vec2 uMouse;
      varying float vKind, vSeed, vAlpha;

      void main() {
        float t = clamp((uProgress - aSeed * 0.5) / 0.5, 0.0, 1.0);
        t = 1.0 - pow(1.0 - t, 4.0);

        vec3 from = aStart;
        float ang = (1.0 - t) * 3.0 * (aSeed - 0.5);
        from.xy = mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * from.xy;
        vec3 p = mix(from, aTarget, t);

        float w = aKind == 4.0 ? 0.25 : 0.018;
        p += w * vec3(sin(uTime * 0.9 + aSeed * 40.0), cos(uTime * 0.7 + aSeed * 31.0), sin(uTime * 0.8 + aSeed * 17.0));

        vec3 dir = normalize(aTarget + vec3(0.0, 0.0, 0.4) + (vec3(aSeed, fract(aSeed * 7.3), fract(aSeed * 13.1)) - 0.5));
        p += dir * uScatter * (1.0 + aSeed * 5.0);

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vec4 clip = projectionMatrix * mv;
        vec2 ndc = clip.xy / clip.w;
        vec2 d = ndc - uMouse;
        d.x *= uAspect;
        float len = length(d);
        float f = smoothstep(0.32, 0.0, len) * uMouseStrength;
        mv.xy += normalize(d + 1e-5) * f * (0.55 + aSeed * 0.6);
        mv.z += f * 0.6;

        gl_Position = projectionMatrix * mv;

        float size = aKind == 0.0 ? 1.0 : aKind == 1.0 ? 1.35 : aKind == 2.0 ? 1.6 : aKind == 3.0 ? 0.8 : 1.1;
        size *= 0.55 + aSeed * 0.9;
        gl_PointSize = size * 28.0 * uPixel / -mv.z;

        vKind = aKind;
        vSeed = aSeed;
        vAlpha = t * (1.0 - clamp(uScatter * 0.9, 0.0, 0.85)) + f * 0.4;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      varying float vKind, vSeed, vAlpha;

      void main() {
        float r = length(gl_PointCoord - 0.5);
        if (r > 0.5) discard;
        float a = smoothstep(0.5, 0.0, r);
        a *= a;

        vec3 violet = vec3(0.408, 0.251, 0.957);
        vec3 lilac = vec3(0.76, 0.69, 1.0);
        vec3 white = vec3(1.0);
        vec3 col = mix(violet, lilac, vSeed * 0.45);
        float alpha = 0.5;

        if (vKind == 1.0) { col = mix(lilac, white, vSeed * 0.5); alpha = 0.55; }
        else if (vKind == 2.0) { col = white; alpha = 0.7; }
        else if (vKind == 3.0) { col = lilac; alpha = 0.28; }
        else if (vKind == 4.0) { col = mix(lilac, white, vSeed); alpha = 0.35 * (0.5 + 0.5 * sin(uTime * 1.6 + vSeed * 60.0)); }

        gl_FragColor = vec4(col, a * alpha * vAlpha);
      }
    `,
  });

  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  const group = new THREE.Group();
  group.add(points);
  scene.add(group);

  /* ----------------------------------------------------- state */
  const mouse = { x: 9, y: 9, active: 0 };
  const tilt = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollTarget = 0;
  let visible = true;
  let t0 = performance.now();
  let lastMove = -1e9;

  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    uniforms.uAspect.value = w / h;
    const portrait = w / h < 0.85;
    camera.position.z = portrait ? 17 : 10.5;
    group.position.y = portrait ? 1.8 : 0.8;
    camera.updateProjectionMatrix();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - t0) / 1000;
    uniforms.uTime.value = reduceMotion ? 0 : t;
    if (!reduceMotion) uniforms.uProgress.value = Math.min(1.001, t / 2.6);

    uniforms.uScatter.value += (scrollTarget - uniforms.uScatter.value) * 0.08;

    const idle = now - lastMove > 1400;
    mouse.active += ((idle ? 0 : 1) - mouse.active) * 0.06;
    uniforms.uMouseStrength.value = mouse.active;
    uniforms.uMouse.value.set(mouse.x, mouse.y);

    tilt.x += (tilt.tx - tilt.x) * 0.04;
    tilt.y += (tilt.ty - tilt.y) * 0.04;
    points.rotation.z = reduceMotion ? 0 : -t * 0.05;
    group.rotation.y = tilt.x * 0.35;
    group.rotation.x = -tilt.y * 0.28 - 0.08;

    renderer.render(scene, camera);
  }

  addEventListener(
    "pointermove",
    (e) => {
      const r = host.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      tilt.tx = (e.clientX / innerWidth) * 2 - 1;
      tilt.ty = (e.clientY / innerHeight) * 2 - 1;
      if (!reduceMotion) lastMove = performance.now();
    },
    { passive: true }
  );
  addEventListener("scroll", () => (scrollTarget = reduceMotion ? 0 : Math.min(scrollY / innerHeight, 1.3)), { passive: true });

  new ResizeObserver(layout).observe(host);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);

  layout();
  host.classList.add("is-live");
  t0 = performance.now();
  requestAnimationFrame(frame);
}
