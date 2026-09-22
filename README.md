# ctf.v1olet.xyz

Static site, no build step. GitHub Pages serves it straight from `main` / root.

## Updating

Everything editable lives in `assets/js/data.js`:

- **Players**: add/remove entries in `players`. `role`, `focus`, `quote`, `skills`, `links` are all optional.
- **Profile pictures**: drop a square image into `assets/avatars/` named after the handle in lowercase, letters and digits only (`AmeenRMD` → `ameenrmd.webp`, `.png` or `.jpg`). It's picked up automatically; no code change needed.
- **Placements**: add an entry to `placements` with `event` and `rank`. The list sorts itself; ranks 1–3 go on the podium.
- **Socials** (footer): `socials`.

## Files

```
index.html
CNAME
favicon.png
assets/css/style.css
assets/js/data.js      ← edit this
assets/js/main.js      rendering, filters, card effects
assets/js/flower.js    3D hero (three.js from jsDelivr)
assets/img/            logo
assets/avatars/        profile pictures
```
