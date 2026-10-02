// v1olet intro: the wordmark rises out of a mask while a counter loads to
// 100, then the panel lifts away like a curtain (with a violet layer trailing
// behind it) and the hero builds itself underneath.
// Plays once per browser session. Click / Esc / Enter / Space skips it.
// main.js and bloom.js wait on window.V1Intro before starting the hero.
(() => {
  const root = document.documentElement;
  const intro = document.getElementById("intro");

  if (!root.classList.contains("intro-on") || !intro) {
    intro && intro.remove();
    window.V1Intro = Promise.resolve();
    return;
  }

  try { sessionStorage.setItem("v1-intro", "1"); } catch (e) {}
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  scrollTo(0, 0);

  const bar = document.getElementById("intro-bar");
  const count = document.getElementById("intro-count");
  const skip = document.getElementById("intro-skip");

  let resolve;
  window.V1Intro = new Promise((r) => (resolve = r));
  let leaving = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  // counter 000 -> 100, eased so it slows down near the end
  const DUR = 1350;
  const t0 = performance.now() + 150;
  let raf = 0;
  const tick = (now) => {
    const k = Math.min(1, Math.max(0, (now - t0) / DUR));
    const e = 1 - Math.pow(1 - k, 3);
    const v = Math.round(e * 100);
    count.textContent = String(v).padStart(3, "0");
    bar.style.transform = `scaleX(${e})`;
    if (k < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);

  requestAnimationFrame(() => intro.classList.add("is-in"));
  later(leave, 1700);

  function leave() {
    if (leaving) return;
    leaving = true;
    timers.forEach(clearTimeout);
    cancelAnimationFrame(raf);
    count.textContent = "100";
    bar.style.transform = "scaleX(1)";

    intro.classList.add("is-in", "is-out");            // wordmark + labels leave
    setTimeout(() => intro.classList.add("is-lift"), 260); // panel lifts
    setTimeout(() => {
      root.classList.remove("intro-on");
      resolve();                                         // hero builds underneath
    }, 560);
    setTimeout(() => intro.remove(), 1500);
  }

  const onKey = (e) => {
    if (["Escape", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      removeEventListener("keydown", onKey);
      leave();
    }
  };
  addEventListener("keydown", onKey);
  intro.addEventListener("click", leave);
  skip.addEventListener("click", leave);

  // safety net: never leave the page covered
  setTimeout(leave, 5000);
})();
