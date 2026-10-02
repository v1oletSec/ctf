// v1olet intro: the "o" of the logo draws itself, the flower blooms in,
// then the whole thing flies into its place in the hero wordmark.
// Plays once per browser session. Click / Esc / Enter / Space skips it.
// main.js waits on window.V1Intro before starting the hero reveal.
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

  const o = document.getElementById("intro-o");
  const log = document.getElementById("intro-log");
  const skip = document.getElementById("intro-skip");
  const { players = [], placements = [] } = window.V1 || {};
  const podiums = placements.filter((p) => p.rank <= 3).length;

  const lines = [
    "$ ./v1olet --init",
    `  roster ......... ${players.length} players`,
    `  placements ..... ${placements.length} ctfs / ${podiums} podiums`,
    "  status ......... blooming",
  ];

  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  let resolve;
  window.V1Intro = new Promise((r) => (resolve = r));
  let finished = false;

  // type the log fast, line by line
  let text = "";
  let li = 0, ci = 0;
  const typeLog = () => {
    if (li >= lines.length) return;
    const line = lines[li];
    text += line[ci++] || "";
    if (ci > line.length) { text += "\n"; li++; ci = 0; }
    log.textContent = text;
    later(typeLog, ci === 0 ? 70 : 9);
  };
  later(typeLog, 120);

  later(() => intro.classList.add("s-ring"), 150);
  later(() => intro.classList.add("s-flower"), 520);
  later(() => intro.classList.add("s-disk"), 980);
  later(() => intro.classList.add("s-pulse"), 1350);
  later(handoff, 1950);

  function handoff() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);
    log.textContent = lines.join("\n");

    const target = document.getElementById("mark-o");
    const a = o.getBoundingClientRect();
    const b = target ? target.getBoundingClientRect() : null;

    intro.classList.add("s-ring", "s-flower", "s-disk", "s-fly");
    root.classList.add("intro-flying");
    resolve(); // hero starts revealing underneath

    if (b && b.width) {
      const dx = b.left + b.width / 2 - (a.left + a.width / 2);
      const dy = b.top + b.height / 2 - (a.top + a.height / 2);
      const s = b.width / a.width;
      o.style.transform = `translate(${dx}px, ${dy}px) scale(${s})`;
    } else {
      o.style.opacity = "0";
    }

    setTimeout(() => {
      root.classList.remove("intro-on", "intro-flying");
      intro.remove();
    }, 1000);
  }

  const onKey = (e) => {
    if (["Escape", "Enter", " "].includes(e.key)) {
      e.preventDefault();
      handoff();
      removeEventListener("keydown", onKey);
    }
  };
  addEventListener("keydown", onKey);
  intro.addEventListener("click", handoff);
  skip.addEventListener("click", handoff);

  // safety net: never leave the page covered
  setTimeout(handoff, 5000);
})();
