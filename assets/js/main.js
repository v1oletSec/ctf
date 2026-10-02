(() => {
  const { SKILLS, players, placements, socials } = window.V1;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const canHover = matchMedia("(hover: hover)").matches;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };
  const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

  // the logo flower (traced from the wordmark, defined once as <symbol> in index.html)
  const FLOWER =
    '<svg viewBox="-50 -50 100 100" aria-hidden="true"><use href="#v1-flower" fill="currentColor"/>' +
    '<circle r="8.6" fill="var(--flower-core, #fff)"/></svg>';

  const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5c-2.6-2.6-3.9-5.8-3.9-9.5S9.4 5.1 12 2.5Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.5h3.68l-8.04 9.19L24 22.5h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.5h7.59l5.24 6.93L18.9 1.5Zm-1.29 18.8h2.04L6.48 3.6H4.3l13.31 16.7Z"/></svg>',
    ctftime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V3.5"/><path d="M5 4h11.5l-2 4 2 4H5"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  };
  const LINK_LABEL = { github: "GitHub", linkedin: "LinkedIn", website: "Website", x: "X" };

  /* ============================================================ hero type */
  const heroLines = ["capture the flag team", "web / pwn / rev / crypto / forensics", "est. august 2026", "we play to win"];
  const heroEl = $("#hero-type");
  if (!reduceMotion && heroEl) {
    let li = 0;
    const type = (text, i = 0) => {
      heroEl.textContent = text.slice(0, i);
      if (i < text.length) return setTimeout(() => type(text, i + 1), 45 + Math.random() * 40);
      setTimeout(() => erase(text, text.length), 2600);
    };
    const erase = (text, i) => {
      heroEl.textContent = text.slice(0, i);
      if (i > 0) return setTimeout(() => erase(text, i - 1), 22);
      li = (li + 1) % heroLines.length;
      setTimeout(() => type(heroLines[li]), 300);
    };
    heroEl.textContent = "";
    (window.V1Intro || Promise.resolve()).then(() => setTimeout(() => type(heroLines[0]), 900));
  }

  /* ========================================================= category strip */
  const skillCounts = {};
  players.forEach((p) => (p.skills || []).forEach((s) => (skillCounts[s] = (skillCounts[s] || 0) + 1)));
  const skillOrder = Object.keys(skillCounts).sort((a, b) => skillCounts[b] - skillCounts[a]);
  const stripItems = ["web", "pwn", "rev", "crypto", "forensics", "osint", "misc", "dfir", "ai", "mobile", "cloud", "sigint"]
    .map((s) => `<span>${esc(SKILLS[s] || s)}</span><i>${FLOWER}</i>`)
    .join("");
  $("#strip").innerHTML = `<div>${stripItems}</div><div>${stripItems}</div>`;

  /* ============================================================== terminal */
  const podiumCount = placements.filter((p) => p.rank <= 3).length;
  const topSkills = skillOrder
    .slice(0, 3)
    .map((k) => `${String(skillCounts[k]).padStart(4)} ${(SKILLS[k] || k).toLowerCase()}`)
    .join("\n");
  const bestP = [...placements].sort((a, b) => a.rank - b.rank)[0];
  const termLines = [
    ["cmd", "whoami"],
    ["out", "v1olet, ctf team since august 2026"],
    ["cmd", "wc -l roster.txt"],
    ["out", `${players.length} players`],
    ["cmd", "grep -c . placements.log"],
    ["out", `${placements.length} ctfs, ${podiumCount} on the podium`],
    ["cmd", "head -1 placements.log"],
    ["out", `${bestP.rank}${ordinal(bestP.rank)}  ${bestP.event}${bestP.note ? " (" + bestP.note.toLowerCase() + ")" : ""}`],
    ["cmd", "cut -d, -f2 roster.csv | sort | uniq -c | sort -rn | head -3"],
    ["out", topSkills],
  ];
  const term = $("#term");
  const termHTML = (lines, partial = "") =>
    lines
      .map(([k, s]) => (k === "cmd" ? `<span class="t-p">$</span> <span class="t-c">${esc(s)}</span>` : `<span class="t-o">${esc(s)}</span>`))
      .join("\n") + partial;

  const termFinal = () => (term.innerHTML = termHTML(termLines, `\n<span class="t-p">$</span> <span class="t-cur"></span>`));
  if (reduceMotion) termFinal();
  else {
    term.innerHTML = `<span class="t-p">$</span> <span class="t-cur"></span>`;
    const run = () => {
      const done = [];
      let li = 0;
      const next = () => {
        if (li >= termLines.length) return termFinal();
        const [k, s] = termLines[li];
        if (k === "out") {
          done.push(termLines[li++]);
          term.innerHTML = termHTML(done);
          return setTimeout(next, 260);
        }
        let i = 0;
        const typeCmd = () => {
          term.innerHTML = termHTML(done) + (done.length ? "\n" : "") + `<span class="t-p">$</span> <span class="t-c">${esc(s.slice(0, i))}</span><span class="t-cur"></span>`;
          if (i++ < s.length) return setTimeout(typeCmd, 38 + Math.random() * 45);
          done.push(termLines[li++]);
          setTimeout(next, 180);
        };
        typeCmd();
      };
      next();
    };
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        io.disconnect();
        run();
      }
    }, { threshold: 0.4 });
    io.observe(term);
  }

  /* ============================================================ placements */
  // "731 teams" -> 731, "1k+ teams" -> 1000, "7000+ teams" -> 7000
  const teamsOf = (p) => {
    const m = String(p.field || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*(k)?/i);
    return m ? Math.round(parseFloat(m[1]) * (m[2] ? 1000 : 1)) : 0;
  };
  const topPct = (p) => {
    const n = teamsOf(p);
    if (!n || n < p.rank) return null;
    const v = (p.rank / n) * 100;
    return v < 1 ? v.toFixed(1).replace(/\.0$/, "") : String(Math.max(1, Math.round(v)));
  };
  const sorted = [...placements].sort((a, b) => a.rank - b.rank || teamsOf(b) - teamsOf(a));
  const top = sorted.filter((p) => p.rank <= 3);
  const rest = sorted.filter((p) => p.rank > 3);

  /* stats row */
  const best = sorted
    .map((p) => ({ p, v: topPct(p) }))
    .filter((x) => x.v !== null)
    .sort((a, b) => parseFloat(a.v) - parseFloat(b.v) || teamsOf(b.p) - teamsOf(a.p))[0];
  const stats = [
    { n: placements.length, label: "CTFs on the board" },
    { n: top.length, label: "podium finishes" },
    { n: placements.filter((p) => p.rank === 1).length, label: placements.filter((p) => p.rank === 1).length === 1 ? "first place" : "first places" },
  ];
  if (best) stats.push({ n: parseFloat(best.v), pre: "top ", suf: "%", dec: best.v.includes(".") ? 1 : 0, label: `best finish, ${best.p.event}` });
  $("#stats").innerHTML = stats
    .map(
      (s) => `
      <div class="stat">
        <dt>${esc(s.label)}</dt>
        <dd>${s.pre ? `<small>${s.pre}</small>` : ""}<span data-count="${s.n}" data-dec="${s.dec || 0}">${reduceMotion ? s.n : 0}</span>${s.suf ? `<small>${s.suf}</small>` : ""}</dd>
      </div>`
    )
    .join("");

  /* medal cards */
  const TIER = { 1: "gold", 2: "silver", 3: "bronze" };
  $("#medals").innerHTML = top
    .map((p, i) => {
      const pct = topPct(p);
      const meta = [p.note, p.field].filter(Boolean).map(esc).join(" · ");
      const inner = `
        <div class="medal-inner">
          <div class="medal-top">
            <span class="medal-tier">${TIER[p.rank]}</span>
            ${p.url ? `<span class="medal-go">${ICONS.arrow}</span>` : ""}
          </div>
          <div class="medal-disc" aria-hidden="true">
            <span class="medal-ribbon"></span>
            <span class="medal-face">${FLOWER}</span>
          </div>
          <p class="medal-rank">${p.rank}<sup>${ordinal(p.rank)}</sup></p>
          <h3 class="medal-event">${esc(p.event)}</h3>
          <p class="medal-meta">${meta || "&nbsp;"}</p>
          ${pct ? `<span class="medal-pct">top ${pct}%</span>` : ""}
          <div class="pc-holo" aria-hidden="true"></div>
          <div class="pc-glare" aria-hidden="true"></div>
        </div>`;
      const attrs = `class="medal tilt t-${TIER[p.rank]}" style="--i:${i}"`;
      return p.url
        ? `<a ${attrs} href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${esc(p.event)}: ${p.rank}${ordinal(p.rank)} place">${inner}</a>`
        : `<div ${attrs}>${inner}</div>`;
    })
    .join("");

  /* ledger */
  $("#ledger").innerHTML = rest
    .map((p, i) => {
      const tag = p.url ? "a" : "div";
      const attrs = p.url ? ` href="${esc(p.url)}" target="_blank" rel="noopener"` : "";
      const pct = topPct(p);
      return `
        <${tag} class="lg-row" role="listitem" style="--i:${i}"${attrs}>
          <span class="lg-rank" aria-label="Rank ${p.rank}">${String(p.rank).padStart(2, "0")}</span>
          <span class="lg-main">
            <span class="lg-event">${esc(p.event)}</span>
            ${p.note ? `<span class="lg-note">${esc(p.note)}</span>` : ""}
          </span>
          <span class="lg-field">${p.field ? esc(p.field) : ""}</span>
          <span class="lg-pct">${pct ? `top ${pct}%` : ""}</span>
          <span class="lg-go">${p.url ? ICONS.arrow : ""}</span>
        </${tag}>`;
    })
    .join("");

  /* count-up + staggered reveal when the section scrolls in */
  const countUp = (el) => {
    const end = parseFloat(el.dataset.count);
    const dec = +el.dataset.dec || 0;
    const t0 = performance.now();
    const dur = 1400;
    const tick = (now) => {
      const k = Math.min(1, (now - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      // "top x%" counts down from 100 so it reads as climbing the board
      const v = dec ? 100 - (100 - end) * e : end * e;
      el.textContent = dec ? v.toFixed(dec) : Math.round(v);
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const reveal = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        reveal.unobserve(e.target);
        e.target.classList.add("is-in");
        if (!reduceMotion) $$("[data-count]", e.target).forEach(countUp);
      }),
    { threshold: 0, rootMargin: "0px 0px -12% 0px" }
  );
  ["#stats", "#medals", "#ledger"].forEach((s) => reveal.observe($(s)));
  if (reduceMotion) $$("[data-count]").forEach((el) => (el.textContent = el.dataset.count));

  /* =============================================================== players */
  const hue = (name) => {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return 248 + (h % 26);
  };
  const initials = (name) => (name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 2) || "?").toUpperCase();
  const hasProfile = (p) => p.quote || (p.skills && p.skills.length) || (p.links && Object.keys(p.links).length);

  const pad = (n) => String(n).padStart(2, "0");
  const deckOrder = [
    ...players.filter((p) => p.role),
    ...players.filter((p) => !p.role && hasProfile(p)),
    ...players.filter((p) => !p.role && !hasProfile(p)),
  ];

  const front = (p, no) => {
    const skills = p.skills || [];
    const links = Object.entries(p.links || {});
    const main = skills[0] ? SKILLS[skills[0]] || skills[0] : "";
    return `
      <div class="pc-art">
        <div class="pc-pattern">${FLOWER}</div>
        ${main ? `<span class="pc-type">${esc(main)}</span>` : ""}
        ${p.role ? `<span class="pc-role">${esc(p.role)}</span>` : ""}
        <div class="pc-avatar" data-slug="${slug(p.name)}">${esc(initials(p.name))}</div>
        <span class="pc-no">No.${pad(no)}</span>
      </div>
      <div class="pc-body">
        <h3 class="pc-name">${esc(p.name)}</h3>
        ${p.focus ? `<p class="pc-focus">${esc(p.focus)}</p>` : ""}
        ${skills.length ? `<ul class="pc-skills">${skills.map((s) => `<li>${esc(SKILLS[s] || s)}</li>`).join("")}</ul>` : ""}
        ${p.quote ? `<blockquote class="pc-quote">${esc(p.quote)}</blockquote>` : ""}
        ${
          links.length
            ? `<div class="pc-links">${links
                .map(([k, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(p.name)} on ${LINK_LABEL[k] || k}">${ICONS[k] || ICONS.website}</a>`)
                .join("")}</div>`
            : ""
        }
        <div class="pc-foot"><span>v1olet</span><span>${skills.length} ${skills.length === 1 ? "skill" : "skills"}</span><i>${FLOWER}</i></div>
      </div>`;
  };

  const back = (p, no) => `
      <div class="pc-back">
        <div class="pc-back-flower">${FLOWER}</div>
        <div class="pc-back-avatar" data-slug="${slug(p.name)}"></div>
        <h3 class="pc-name">${esc(p.name)}</h3>
        <p class="pc-back-mark">v1olet · No.${pad(no)} · profile soon</p>
      </div>`;

  const deck = $("#deck");
  deck.innerHTML = deckOrder
    .map((p, i) => {
      const full = hasProfile(p) || p.role;
      return `
      <li class="pc tilt${p.role ? " is-captain" : ""}${full ? "" : " is-back"}" data-skills="${(p.skills || []).join(" ")}" style="--h:${hue(p.name)}">
        <div class="pc-inner">
          ${full ? front(p, i + 1) : back(p, i + 1)}
          <div class="pc-holo" aria-hidden="true"></div>
          <div class="pc-glare" aria-hidden="true"></div>
        </div>
      </li>`;
    })
    .join("");
  $("#player-count").textContent = players.length;

  // avatars: assets/avatars/<slug>.webp → .png → .jpg, otherwise keep initials / blank back
  $$("[data-slug]", deck).forEach((el) => {
    const exts = ["webp", "png", "jpg"];
    const tryNext = () => {
      const ext = exts.shift();
      if (!ext) return;
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.onload = () => {
        el.textContent = "";
        el.appendChild(img);
        el.classList.add("has-img");
      };
      img.onerror = tryNext;
      img.src = `assets/avatars/${el.dataset.slug}.${ext}`;
    };
    tryNext();
  });

  /* filters */
  const filters = $("#filters");
  filters.innerHTML =
    `<button class="chip" type="button" data-skill="" aria-pressed="true">All<span>${players.length}</span></button>` +
    skillOrder.map((s) => `<button class="chip" type="button" data-skill="${s}" aria-pressed="false">${esc(SKILLS[s] || s)}<span>${skillCounts[s]}</span></button>`).join("");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    $$(".chip", filters).forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
    const skill = btn.dataset.skill;
    let n = 0;
    $$(".pc", deck).forEach((card) => {
      const show = !skill || card.dataset.skills.split(" ").includes(skill);
      card.hidden = !show;
      card.classList.remove("is-dealt");
      if (show && !reduceMotion) {
        void card.offsetWidth;
        card.style.setProperty("--d", `${Math.min(n++ * 35, 420)}ms`);
        card.classList.add("is-dealt");
      }
    });
  });

  /* holo tilt (player cards + medal cards) */
  if (!reduceMotion && canHover) {
    addEventListener(
      "pointermove",
      (e) => {
        const card = e.target.closest && e.target.closest(".tilt");
        if (!card) return;
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        card.classList.add("is-active");
        card.style.setProperty("--mx", `${x * 100}%`);
        card.style.setProperty("--my", `${y * 100}%`);
        card.style.setProperty("--ry", `${(x - 0.5) * 16}deg`);
        card.style.setProperty("--rx", `${(0.5 - y) * 14}deg`);
        card.style.setProperty("--hyp", Math.min(1, Math.hypot(x - 0.5, y - 0.5) * 2).toFixed(3));
      },
      { passive: true }
    );
    addEventListener(
      "pointerout",
      (e) => {
        const card = e.target.closest && e.target.closest(".tilt");
        if (card && !card.contains(e.relatedTarget)) {
          card.classList.remove("is-active");
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        }
      },
      true
    );
  }

  /* deal the deck in when it first scrolls into view */
  if (!reduceMotion) {
    deck.classList.add("is-waiting");
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      $$(".pc", deck).forEach((c, i) => c.style.setProperty("--d", `${Math.min(i * 40, 900)}ms`));
      deck.classList.remove("is-waiting");
      deck.classList.add("is-in");
    }, { threshold: 0, rootMargin: "0px 0px -10% 0px" });
    io.observe(deck);
  }

  /* ============================================================ scramble */
  const GLYPHS = "!<>-_\\/[]{}=+*^?#01v1";
  const scramble = (el) => {
    const final = el.dataset.text || el.textContent;
    el.dataset.text = final;
    el.setAttribute("aria-label", final);
    let frame = 0;
    const total = final.length * 2.2 + 12;
    const tick = () => {
      let out = "";
      for (let i = 0; i < final.length; i++) {
        const lock = i * 2.2 + 6;
        if (final[i] === " " || frame >= lock) out += final[i];
        else out += `<span class="sc">${GLYPHS[(Math.random() * GLYPHS.length) | 0]}</span>`;
      }
      el.innerHTML = out;
      if (frame++ < total) requestAnimationFrame(tick);
      else el.textContent = final;
    };
    tick();
  };
  if (!reduceMotion) {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            io.unobserve(e.target);
            scramble(e.target);
          }
        }),
      { threshold: 0.6 }
    );
    $$(".scramble").forEach((el) => io.observe(el));
  }

  /* ============================================================== footer */
  $("#year").textContent = new Date().getFullYear();
  $("#footer-social").innerHTML = [
    ["linkedin", socials.linkedin, "v1olet on LinkedIn"],
    ["ctftime", socials.ctftime, "v1olet on CTFtime"],
    ["website", socials.website, "v1olet.xyz"],
  ]
    .filter(([, u]) => u)
    .map(([k, u, l]) => `<li><a href="${esc(u)}" target="_blank" rel="noopener" aria-label="${l}" title="${l}">${ICONS[k]}</a></li>`)
    .join("");

  /* ================================================================= nav */
  const nav = $("#nav");
  const prog = $("#nav-progress");
  const onScroll = () => {
    nav.classList.toggle("is-scrolled", scrollY > 40);
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const navLinks = $$(".nav-links a");
  const spy = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-current", a.getAttribute("href") === `#${e.target.id}`));
      }),
    { rootMargin: "-45% 0px -50% 0px" }
  );
  ["about", "placements", "players"].forEach((id) => spy.observe(document.getElementById(id)));
  new IntersectionObserver(([e]) => e.isIntersecting && navLinks.forEach((a) => a.classList.remove("is-current"))).observe($("#hero"));

  $("#hud-r").innerHTML = `${players.length} players<i></i>${placements.length} ctfs`;

  /* outro flower spins with scroll */
  const outroFlower = $(".outro-flower");
  if (outroFlower && !reduceMotion) {
    addEventListener(
      "scroll",
      () => {
        const r = outroFlower.parentElement.getBoundingClientRect();
        const k = 1 - (r.top + r.height / 2) / (innerHeight + r.height);
        outroFlower.style.setProperty("--spin", `${k * 140}deg`);
      },
      { passive: true }
    );
  }

  (window.V1Intro || Promise.resolve()).then(() => requestAnimationFrame(() => document.body.classList.add("is-ready")));
  console.log("%cv1olet", "font: 800 28px sans-serif; color:#6840f4", "\nlooking around? there's a flag in the source.");
})();
