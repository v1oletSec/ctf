// v1olet hero background: a field of logo flowers on a hex grid.
// They breathe on a slow wave, open up around the cursor, and a click
// sends a ripple through the field. Plain 2D canvas, no dependencies.
(() => {
  const host = document.getElementById("bloom");
  const pathEl = document.getElementById("v1-flower");
  if (!host || !pathEl || !window.Path2D) return;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;
  const hero = host.parentElement;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  host.appendChild(canvas);

  /* sprites: the flower in two tints, centre punched out */
  const P = new Path2D(pathEl.getAttribute("d"));
  const SPR = 128;
  const sprite = (fill) => {
    const c = document.createElement("canvas");
    c.width = c.height = SPR;
    const x = c.getContext("2d");
    x.translate(SPR / 2, SPR / 2);
    x.scale(SPR / 100, SPR / 100);
    x.fillStyle = fill;
    x.fill(P);
    x.globalCompositeOperation = "destination-out";
    x.beginPath();
    x.arc(0, 0, 8.6, 0, Math.PI * 2);
    x.fill();
    return c;
  };
  const VIOLET = sprite("#8a66ff");
  const WHITE = sprite("#f3efff");

  let W = 0, H = 0, DPR = 1, cells = [], origin = { x: 0, y: 0 }, centre = { x: 0, y: 0 };

  function layout() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = host.clientWidth;
    H = host.clientHeight;
    if (!W || !H) return;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";

    const gap = W < 760 ? 40 : 50;
    const rowH = gap * 0.866;
    const cols = Math.ceil(W / gap) + 2;
    const rows = Math.ceil(H / rowH) + 2;
    const ox = (W - (cols - 1) * gap) / 2;
    const oy = (H - (rows - 1) * rowH) / 2;
    cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          x: ox + c * gap + (r % 2 ? gap / 2 : 0),
          y: oy + r * rowH,
          rot: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.25,
          seed: Math.random(),
          heat: 0,
        });
      }
    }
    const h = host.getBoundingClientRect();
    const o = document.getElementById("mark-o");
    if (o) {
      const r = o.getBoundingClientRect();
      origin = { x: r.left + r.width / 2 - h.left, y: r.top + r.height / 2 - h.top };
    } else origin = { x: W / 2, y: H / 2 };
    centre = { x: W / 2, y: H * 0.46 };
  }

  /* pointer */
  const ptr = { x: -999, y: -999, tx: -999, ty: -999, on: 0, last: -1e9 };
  const ripples = [];

  if (canHover) {
    addEventListener(
      "pointermove",
      (e) => {
        const r = host.getBoundingClientRect();
        ptr.tx = e.clientX - r.left;
        ptr.ty = e.clientY - r.top;
        if (ptr.x < -900) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
        ptr.last = performance.now();
      },
      { passive: true }
    );
  }
  hero.addEventListener("pointerdown", (e) => {
    if (e.target.closest("a, button")) return;
    const r = host.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, t: performance.now() });
    if (ripples.length > 6) ripples.shift();
  });

  /* loop */
  let start = null; // set when the hero reveal begins
  let visible = true;
  let raf = 0;
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };

  function draw(now) {
    raf = 0;
    if (!W) return;
    const t = now / 1000;
    const since = start == null ? 0 : (now - start) / 1000;

    // touch devices: a slow wandering "cursor" so the field still feels alive
    if (!canHover && !reduceMotion) {
      ptr.tx = W * (0.5 + 0.34 * Math.sin(t * 0.37));
      ptr.ty = H * (0.5 + 0.3 * Math.sin(t * 0.53 + 1.3));
      ptr.last = now;
      if (ptr.x < -900) { ptr.x = ptr.tx; ptr.y = ptr.ty; }
    }
    ptr.x += (ptr.tx - ptr.x) * 0.14;
    ptr.y += (ptr.ty - ptr.y) * 0.14;
    const active = now - ptr.last < 2200 ? 1 : 0;
    ptr.on += (active - ptr.on) * 0.05;

    const R = Math.min(220, Math.max(150, W * 0.14));
    const legR = Math.min(W, H) * 0.42;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < ripples.length; i++) {
      if (now - ripples[i].t > 2600) { ripples.splice(i, 1); i--; }
    }

    for (const c of cells) {
      // fade the field in softly, each flower at its own moment
      const born = reduceMotion ? 1 : smooth(c.seed * 1.2, c.seed * 1.2 + 0.8, since);
      if (born <= 0.001) continue;

      const wave = 0.5 + 0.5 * Math.sin(c.x * 0.011 + t * 0.55) * Math.cos(c.y * 0.014 - t * 0.4);
      let base = 0.035 + wave * 0.07;


      const dx = c.x - ptr.x, dy = c.y - ptr.y;
      const dp = Math.sqrt(dx * dx + dy * dy);
      let f = Math.max(0, 1 - dp / R);
      f = f * f * ptr.on;

      let g = 0;
      for (const rp of ripples) {
        const age = (now - rp.t) / 1000;
        const rr = age * 620;
        const d = Math.hypot(c.x - rp.x, c.y - rp.y);
        g += Math.exp(-(((d - rr) / 46) ** 2)) * Math.max(0, 1 - age / 2.6);
      }
      g = Math.min(1, g);

      c.heat += (Math.max(f, g) - c.heat) * 0.18;
      const h = c.heat;

      // keep the wordmark readable
      const dc = Math.hypot((c.x - centre.x) * 0.7, c.y - centre.y);
      const legible = 0.3 + 0.7 * smooth(legR * 0.35, legR, dc);

      const alpha = Math.min(1, (base + h * 0.75) * legible) * born;
      if (alpha < 0.01) continue;

      const size = (9 + wave * 4 + h * 20) * (0.6 + 0.4 * born);
      const rot = c.rot + (reduceMotion ? 0 : t * c.spin) + h * 1.4;
      const cs = Math.cos(rot) * DPR, sn = Math.sin(rot) * DPR;
      ctx.setTransform(cs, sn, -sn, cs, c.x * DPR, c.y * DPR);
      ctx.globalAlpha = alpha;
      ctx.drawImage(VIOLET, -size / 2, -size / 2, size, size);
      if (h > 0.35) {
        ctx.globalAlpha = (h - 0.35) * 0.9 * legible * born;
        ctx.drawImage(WHITE, -size / 2, -size / 2, size, size);
      }
    }
    ctx.globalAlpha = 1;

    if (!reduceMotion && visible) raf = requestAnimationFrame(draw);
  }

  const kick = () => { if (!raf) raf = requestAnimationFrame(draw); };

  new ResizeObserver(() => { layout(); kick(); }).observe(host);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(host);

  // fade the field as you scroll away
  const onScroll = () => {
    const p = Math.min(1, scrollY / (innerHeight * 0.9));
    host.style.opacity = String(1 - p * 0.85);
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const begin = () => {
    layout();
    start = performance.now();
    kick();
  };
  layout();
  (window.V1Intro || Promise.resolve()).then(() => setTimeout(begin, 120));
})();
