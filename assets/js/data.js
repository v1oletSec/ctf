/*
 * v1olet CTF – site data
 * ------------------------------------------------------------------
 * This is the only file you need to edit to update the site.
 *
 * PLAYERS
 *   name     – handle as displayed
 *   role     – optional, e.g. "Captain" (shown as a tag)
 *   focus    – optional one-line specialty
 *   quote    – optional
 *   skills   – optional list, keys from SKILLS below
 *   links    – optional { github, linkedin, website, x }
 *
 *   Profile pictures are picked up automatically from
 *   assets/avatars/<handle>.webp (or .png / .jpg), where <handle> is the
 *   name in lowercase with everything except a–z and 0–9 removed.
 *   Example: "0x00knull" -> assets/avatars/0x00knull.webp
 *   No file? The card shows initials instead.
 *
 * PLACEMENTS
 *   rank     – number
 *   note     – optional (e.g. "Average placement")
 *   field    – optional field size text
 *   url      – optional link to the scoreboard / event
 */

window.V1 = {
  SKILLS: {
    web: "Web",
    pwn: "Pwn",
    rev: "Reversing",
    crypto: "Crypto",
    forensics: "Forensics",
    osint: "OSINT",
    misc: "Misc",
    cloud: "Cloud",
    blockchain: "Blockchain",
    quantum: "Quantum",
    ai: "AI",
    redteam: "Red teaming",
    pentest: "Pentesting",
  },

  players: [
    {
      name: "Existing",
      role: "Captain",
      focus: "Web exploitation",
      quote: "At every point of Existence, meaning lurks",
      skills: ["web", "misc", "osint"],
    },
    {
      name: "ctxzero",
      role: "Captain",
      focus: "Penetration testing",
      quote: "Sky is the Limit",
      skills: ["pentest", "redteam", "web", "pwn"],
      links: { website: "https://www.ctxzero.dev/" },
    },
    {
      name: "Cyul",
      focus: "OSINT",
      quote: "I bring together pieces to create a story",
      skills: ["osint", "web", "misc"],
    },
    { name: "Ame" },
    {
      name: "0x00knull",
      focus: "Offensive security",
      skills: ["redteam", "pentest", "pwn"],
    },
    { name: "AmeenRMD" },
    { name: "ecstasy" },
    { name: "evlion48" },
    { name: "Havel29" },
    {
      name: "KeyboardCat",
      focus: "Generalist",
      quote: "I'm just here collecting skills until freedom becomes affordable.",
      skills: ["web", "rev", "osint", "misc"],
    },
    { name: "LANGSOMT" },
    {
      name: "Shedo",
      focus: "Crypto & quantum",
      skills: ["crypto", "quantum"],
      links: { github: "https://github.com/Shivansh0x/" },
    },
    {
      name: "Sleep",
      focus: "OSINT & forensics",
      skills: ["osint", "forensics"],
      links: { linkedin: "https://www.linkedin.com/in/laykyaw-tun/" },
    },
    { name: "4y4n0k0j1" },
    {
      name: "0xTrojan",
      focus: "Generalist",
      quote: "If you can't convince them, confuse them",
      skills: ["redteam", "ai", "web", "osint", "misc", "rev"],
      links: { github: "https://github.com/Tr0j4n1", website: "https://tr0j4n.tech/" },
    },
    { name: "bambo" },
    {
      name: "ChampOfAll",
      focus: "Generalist",
      skills: ["redteam", "pentest", "misc"],
      links: { github: "https://github.com/champOfAll" },
    },
    {
      name: "lyssec",
      focus: "Generalist",
      quote: "Out of control geek and self-proclaimed engineer",
      skills: ["web", "rev", "pentest", "misc"],
      links: { github: "https://github.com/thomas-lysens" },
    },
    {
      name: "d4ytox",
      focus: "Binary exploitation",
      quote: "as above, so below",
      skills: ["pwn", "rev"],
    },
    { name: "dalwyn" },
    { name: "dem0z" },
    { name: "dudlu121" },
    { name: "dzban" },
    {
      name: "ff",
      focus: "Cloud & offensive security",
      quote: "The way to get started is to quit talking and begin doing",
      skills: ["cloud", "pwn", "pentest", "forensics"],
    },
    {
      name: "holysith",
      focus: "Generalist",
      skills: ["osint", "rev", "web", "misc"],
    },
    { name: "rax" },
    {
      name: "overtsleeping",
      focus: "OSINT",
      quote: "1 larping minion against the world",
      skills: ["osint"],
      links: { github: "https://github.com/justina1387/", website: "https://overtsleeping.com/" },
    },
    { name: "sg0924" },
  ],

  placements: [
    { event: "PwnSec CTF", rank: 1, note: "Human category" },
    { event: "0xVoid CTF", rank: 2 },
    { event: "BrunnerCTF", rank: 2 },
    { event: "BroncoCTF", rank: 3, field: "731 teams", url: "https://broncoctf.ctfd.io/teams/378" },
    { event: "OmniCTF 2026 Qualifier", rank: 4, note: "Average placement", field: "1k+ teams", url: "https://ctftime.org/event/3104/" },
    { event: "UIUCTF", rank: 14 },
    { event: "Operation Heist CTF 2026", rank: 17, url: "https://ctftime.org/event/3327" },
    { event: "BDSecCTF", rank: 19 },
    { event: "Guardians Qualifications 2026", rank: 22, note: "Blue team defence", field: "130 teams", url: "https://www.guardians.sk/guardians2026/" },
    { event: "HTB Cyber Apocalypse 2026", rank: 28, note: "The Salt Crown", field: "7000+ teams", url: "https://ctf.hackthebox.com/event/details/cyber-apocalypse-ctf-2026-the-salt-crown-3432" },
    { event: "THEM?!CTF 2026", rank: 28, field: "920 teams", url: "https://ctftime.org/event/3209" },
  ],

  socials: {
    linkedin: "https://www.linkedin.com/company/v1olet/",
    ctftime: "https://ctftime.org/team/442036",
    website: "https://v1olet.xyz",
  },
};
