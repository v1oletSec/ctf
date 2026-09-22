// 3D version of the v1olet flower: six extruded petals that bloom open on load,
// sitting inside a thin ring (the "o" of the wordmark), with a slow drift of dust.
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const host = document.getElementById("scene");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function webglOK() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
}

if (host && webglOK()) init();

function init() {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 0, 9);

  // lights: a cool key and a violet rim so the petals read against the dark page
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 4, 6);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0x8f6bff, 3);
  rim.position.set(-5, -2, -4);
  scene.add(rim);
  scene.add(new THREE.AmbientLight(0x6b5aa8, 0.35));

  const root = new THREE.Group();
  scene.add(root);

  /* ---------------------------------------------------------- petals */
  const petalShape = new THREE.Shape();
  petalShape.moveTo(0, 0.2);
  petalShape.bezierCurveTo(0.12, 0.26, 0.36, 0.55, 0.31, 0.86);
  petalShape.bezierCurveTo(0.26, 1.1, -0.26, 1.1, -0.31, 0.86);
  petalShape.bezierCurveTo(-0.36, 0.55, -0.12, 0.26, 0, 0.2);

  const petalGeo = new THREE.ExtrudeGeometry(petalShape, {
    depth: 0.1,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.06,
    bevelSegments: 8,
    curveSegments: 48,
  });
  petalGeo.translate(0, 0, -0.05);
  petalGeo.computeVertexNormals();

  const petalMat = new THREE.MeshPhysicalMaterial({
    color: 0x6840f4,
    roughness: 0.42,
    metalness: 0.0,
    envMapIntensity: 0.35,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    iridescence: 0.25,
    iridescenceIOR: 1.3,
  });

  const flower = new THREE.Group();
  root.add(flower);

  const PETALS = 6;
  const petals = [];
  for (let i = 0; i < PETALS; i++) {
    const pivot = new THREE.Group(); // rotation around the flower centre
    pivot.rotation.z = (i / PETALS) * Math.PI * 2 + 0.26;
    const hinge = new THREE.Group(); // tilt = open/closed
    const mesh = new THREE.Mesh(petalGeo, petalMat);
    hinge.add(mesh);
    pivot.add(hinge);
    flower.add(pivot);
    petals.push({ hinge, mesh, delay: i * 0.09 });
  }
  flower.scale.setScalar(1.45);

  // centre dot
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 48, 32),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.25, clearcoat: 1, emissive: 0xffffff, emissiveIntensity: 0.15 })
  );
  core.scale.z = 0.7;
  flower.add(core);

  /* ------------------------------------------------------------ ring */
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(2.05, 0.014, 16, 200),
    new THREE.MeshBasicMaterial({ color: 0xb9a5ff, transparent: true, opacity: 0.35 })
  );
  root.add(ring);

  const ring2 = new THREE.Mesh(
    new THREE.TorusGeometry(2.6, 0.007, 12, 200),
    new THREE.MeshBasicMaterial({ color: 0x6840f4, transparent: true, opacity: 0.5 })
  );
  ring2.rotation.x = 1.15;
  ring2.rotation.y = 0.4;
  root.add(ring2);

  /* ------------------------------------------------------------ dust */
  const DUST = 420;
  const pos = new Float32Array(DUST * 3);
  const seed = new Float32Array(DUST);
  for (let i = 0; i < DUST; i++) {
    const r = 2.2 + Math.random() * 4.5;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random() - 0.5) * 6;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = Math.sin(a) * r - 1;
    seed[i] = Math.random();
  }
  const dustGeo = new THREE.BufferGeometry();
  dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(
    dustGeo,
    new THREE.PointsMaterial({ color: 0xcbbcff, size: 0.028, transparent: true, opacity: 0.7, depthWrite: false, sizeAttenuation: true })
  );
  scene.add(dust);

  /* ----------------------------------------------------------- state */
  const OPEN = 0.3; // petal tilt when fully open (tips cupped slightly forward)
  const CLOSED = 1.5; // folded towards the viewer, like a bud
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  let scrollP = 0;
  let start = performance.now();
  let visible = true;
  let raf = 0;

  const easeOutBack = (t) => {
    const c1 = 1.4, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  };
  const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

  function layout() {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // keep the flower comfortably inside narrow containers
    camera.position.z = w / h < 0.9 ? 11.5 : 9;
    camera.updateProjectionMatrix();
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!visible) return;
    const t = (now - start) / 1000;

    // bloom
    const bloomT = reduceMotion ? 10 : t;
    petals.forEach((p) => {
      const k = Math.min(Math.max((bloomT - 0.15 - p.delay) / 1.4, 0), 1);
      p.hinge.rotation.x = CLOSED + (OPEN - CLOSED) * easeOutBack(k);
      const s = 0.2 + 0.8 * easeOutExpo(k);
      p.mesh.scale.setScalar(s);
    });
    const ringK = easeOutExpo(Math.min(Math.max((bloomT - 0.6) / 1.6, 0), 1));
    ring.scale.setScalar(0.6 + 0.4 * ringK);
    ring.material.opacity = 0.35 * ringK;
    ring2.material.opacity = 0.5 * ringK;
    dust.material.opacity = 0.7 * ringK;

    // idle motion
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    const idle = reduceMotion ? 0 : t;

    flower.rotation.z = -idle * 0.12 - scrollP * 1.2;
    root.rotation.y = pointer.x * 0.45 + Math.sin(idle * 0.4) * 0.08;
    root.rotation.x = -pointer.y * 0.35 + Math.cos(idle * 0.33) * 0.06 + scrollP * 0.6;
    root.position.y = Math.sin(idle * 0.7) * 0.08 + scrollP * 1.5;

    ring2.rotation.z = idle * 0.15;
    dust.rotation.y = idle * 0.025;
    const arr = dustGeo.attributes.position.array;
    if (!reduceMotion) {
      for (let i = 0; i < DUST; i++) {
        arr[i * 3 + 1] += 0.0015 + seed[i] * 0.002;
        if (arr[i * 3 + 1] > 3) arr[i * 3 + 1] = -3;
      }
      dustGeo.attributes.position.needsUpdate = true;
    }

    renderer.render(scene, camera);
  }

  addEventListener("pointermove", (e) => {
    pointer.tx = (e.clientX / innerWidth) * 2 - 1;
    pointer.ty = (e.clientY / innerHeight) * 2 - 1;
  }, { passive: true });

  addEventListener("scroll", () => {
    scrollP = Math.min(scrollY / innerHeight, 1.2);
  }, { passive: true });

  new ResizeObserver(layout).observe(host);
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);

  layout();
  host.classList.add("is-live");
  start = performance.now();
  raf = requestAnimationFrame(frame);
}
