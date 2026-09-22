(() => {
  const { SKILLS, players, placements, socials } = window.V1;
  const $ = (s) => document.querySelector(s);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ordinal = (n) => {
    const s = ["th", "st", "nd", "rd"], v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
  };

  const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]/g, "");

  const ICONS = {
    github: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"/></svg>',
    linkedin: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13ZM7.12 20.45H3.56V9h3.56v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0Z"/></svg>',
    website: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9.5"/><path d="M2.5 12h19M12 2.5c2.6 2.6 3.9 5.8 3.9 9.5s-1.3 6.9-3.9 9.5c-2.6-2.6-3.9-5.8-3.9-9.5S9.4 5.1 12 2.5Z"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.9 1.5h3.68l-8.04 9.19L24 22.5h-7.4l-5.8-7.58-6.63 7.58H.49l8.6-9.83L0 1.5h7.59l5.24 6.93L18.9 1.5Zm-1.29 18.8h2.04L6.48 3.6H4.3l13.31 16.7Z"/></svg>',
    ctftime: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 21V3.5"/><path d="M5 4h11.5l-2 4 2 4H5"/></svg>',
    arrow: '<svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  };
  const LINK_LABEL = { github: "GitHub", linkedin: "LinkedIn", website: "Website", x: "X" };

  /* ------------------------------------------------------------ facts */
  const podiumCount = placements.filter((p) => p.rank <= 3).length;
  const best = Math.min(...placements.map((p) => p.rank));
  $("#facts").innerHTML = [
    [players.length, "players"],
    [placements.length, "CTFs on this page"],
    [podiumCount, "podium finishes"],
    [best + ordinal(best), "best finish"],
  ]
    .map(([v, l]) => `<div><dt>${l}</dt><dd>${v}</dd></div>`)
    .join("");

  /* -------------------------------------------------------- placements */
  const sorted = [...placements].sort((a, b) => a.rank - b.rank);
  const top = sorted.filter((p) => p.rank <= 3);
  const rest = sorted.filter((p) => p.rank > 3);

  const metaLine = (p) => [p.note, p.field].filter(Boolean).map(esc).join(", ");

  $("#podium").innerHTML = top
    .map(
      (p, i) => `
      <li class="${p.rank === 1 && i === 0 ? "first" : ""}">
        <span class="rank" aria-label="${p.rank}${ordinal(p.rank)} place">${p.rank}<sup>${ordinal(p.rank)}</sup></span>
        <div>
          <h3>${esc(p.event)}</h3>
          <p class="meta">${metaLine(p)}</p>
        </div>
        ${p.url ? `<a class="cover" href="${esc(p.url)}" target="_blank" rel="noopener" aria-label="${esc(p.event)} scoreboard"></a>` : ""}
      </li>`
    )
    .join("");

  $("#ledger").innerHTML = rest
    .map((p) => {
      const tag = p.url ? "a" : "div";
      const attrs = p.url ? ` href="${esc(p.url)}" target="_blank" rel="noopener"` : "";
      return `
      <li>
        <${tag} class="row"${attrs}>
          <span class="rank">${p.rank}<sup>${ordinal(p.rank)}</sup></span>
          <span class="event">${esc(p.event)}${p.note ? `<span class="note">${esc(p.note)}</span>` : ""}</span>
          <span class="field">${p.field ? esc(p.field) : ""}</span>
          ${p.url ? ICONS.arrow : "<span></span>"}
        </${tag}>
      </li>`;
    })
    .join("");

  /* ----------------------------------------------------------- players */
  const hue = (name) => {
    let h = 0;
    for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return 245 + (h % 60); // stays inside the violet range
  };
  const initials = (name) => {
    const clean = name.replace(/[^a-zA-Z0-9]/g, "");
    return (clean.slice(0, 2) || "?").toUpperCase();
  };

  $("#player-count").textContent = players.length;

  const roster = $("#roster");
  const hasProfile = (p) => p.quote || (p.skills && p.skills.length) || (p.links && Object.keys(p.links).length);
  // captains first, then everyone with a profile, then the rest (original order kept within each group)
  const rosterMore = $("#roster-more");
  const full = [...players.filter((p) => p.role), ...players.filter((p) => !p.role && hasProfile(p))];
  const compact = players.filter((p) => !p.role && !hasProfile(p));
  const cardHTML = (p, i) => {
      const skills = p.skills || [];
      const links = Object.entries(p.links || {});
      const sparse = !p.quote && !skills.length && !links.length;
      const h = hue(p.name);
      return `
      <li class="card${p.role ? " is-captain" : ""}${sparse ? " is-sparse" : ""}" data-skills="${skills.join(" ")}" data-i="${i}">
        <div class="card-top">
          <div class="avatar" style="background:linear-gradient(135deg,hsl(${h} 70% 45%),hsl(${h + 25} 60% 22%))" data-slug="${slug(p.name)}" data-initials="${esc(initials(p.name))}">${esc(initials(p.name))}</div>
          <div class="card-id">
            <h3 class="card-name">${esc(p.name)}${p.role ? `<span class="role">${esc(p.role)}</span>` : ""}</h3>
            ${p.focus ? `<p class="card-focus">${esc(p.focus)}</p>` : ""}
          </div>
        </div>
        ${p.quote ? `<blockquote class="card-quote">${esc(p.quote)}</blockquote>` : ""}
        <div class="card-foot">
          <ul class="skills">${skills.map((s) => `<li>${esc(SKILLS[s] || s)}</li>`).join("")}</ul>
          ${
            links.length
              ? `<div class="links">${links
                  .map(
                    ([k, url]) =>
                      `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${esc(p.name)} on ${LINK_LABEL[k] || k}">${ICONS[k] || ICONS.website}</a>`
                  )
                  .join("")}</div>`
              : ""
          }
        </div>
      </li>`;
  };
  roster.innerHTML = full.map(cardHTML).join("");
  rosterMore.innerHTML = compact.map(cardHTML).join("");
  const allCards = () => document.querySelectorAll("#players .card");

  // Avatars: try assets/avatars/<slug>.webp → .png → .jpg, keep initials otherwise.
  document.querySelectorAll("#players .avatar").forEach((el) => {
    const exts = ["webp", "png", "jpg"];
    const tryNext = () => {
      const ext = exts.shift();
      if (!ext) return;
      const img = new Image();
      img.alt = "";
      img.decoding = "async";
      img.onload = () => {
        el.textContent = "";
        el.style.background = "";
        el.appendChild(img);
      };
      img.onerror = tryNext;
      img.src = `assets/avatars/${el.dataset.slug}.${ext}`;
    };
    tryNext();
  });

  /* ------------------------------------------------------------ filters */
  const counts = {};
  players.forEach((p) => (p.skills || []).forEach((s) => (counts[s] = (counts[s] || 0) + 1)));
  const skillOrder = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  const filters = $("#filters");
  filters.innerHTML =
    `<button class="chip" type="button" data-skill="" aria-pressed="true">All<span>${players.length}</span></button>` +
    skillOrder
      .map((s) => `<button class="chip" type="button" data-skill="${s}" aria-pressed="false">${esc(SKILLS[s] || s)}<span>${counts[s]}</span></button>`)
      .join("");

  filters.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filters.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
    const skill = btn.dataset.skill;
    let n = 0;
    allCards().forEach((card) => {
      const show = !skill || card.dataset.skills.split(" ").includes(skill);
      card.classList.toggle("is-hidden", !show);
      card.classList.remove("is-entering");
      if (show && !reduceMotion) {
        void card.offsetWidth;
        card.style.animationDelay = `${Math.min(n++ * 25, 300)}ms`;
        card.classList.add("is-entering");
      }
    });
  });

  /* --------------------------------------------------------- card tilt */
  if (!reduceMotion && matchMedia("(hover: hover)").matches) {
    const players$ = $("#players");
    players$.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", `${x * 100}%`);
      card.style.setProperty("--my", `${y * 100}%`);
      card.style.setProperty("--ry", `${(x - 0.5) * 9}deg`);
      card.style.setProperty("--rx", `${(0.5 - y) * 9}deg`);
    });
    players$.addEventListener(
      "pointerout",
      (e) => {
        const card = e.target.closest(".card");
        if (card && !card.contains(e.relatedTarget)) {
          card.style.setProperty("--rx", "0deg");
          card.style.setProperty("--ry", "0deg");
        }
      },
      true
    );
  }

  /* ------------------------------------------------------------ footer */
  $("#year").textContent = new Date().getFullYear();
  const footerLinks = [
    ["linkedin", socials.linkedin, "v1olet on LinkedIn"],
    ["ctftime", socials.ctftime, "v1olet on CTFtime"],
    ["website", socials.website, "v1olet.xyz"],
  ];
  $("#footer-social").innerHTML = footerLinks
    .filter(([, url]) => url)
    .map(([k, url, label]) => `<li><a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${label}" title="${label}">${ICONS[k]}</a></li>`)
    .join("");

  /* --------------------------------------------------------------- nav */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > innerHeight * 0.6);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  requestAnimationFrame(() => document.body.classList.add("is-ready"));

  console.log("%cv1olet", "font: 800 28px sans-serif; color:#6840f4", "\nlooking around? there's a flag in the source.");
})();
