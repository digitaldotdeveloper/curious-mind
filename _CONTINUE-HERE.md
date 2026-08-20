# Curious Mind — where things stand

Static, no-build, no-dependency ebook store. Open `index.html` in a browser and
everything works, including checkout. There is no server and no account system:
bag, saved list, library and orders all live in the visitor's own browser.

- **Local:** `C:\Users\Firass\Desktop\curiousmind`
- **Repo:** https://github.com/digitaldotdeveloper/curious-mind (public)
- **Live:** https://digitaldotdeveloper.github.io/curious-mind/ (Pages, `main` branch, root)

Pushing to `main` republishes the site about a minute later.

## Layout

| File | What it is |
|---|---|
| `index.html` | Home — 3D hero slider, the twelve, newsletter |
| `shop.html` | Catalogue — search, category chips, sort, saved list |
| `book.html?id=…` | Book detail — blurb, facts, contents, related |
| `read.html?id=…` | Chapter-one reader — font size, sepia, resume |
| `cart.html` | Bag → details → payment → confirmation |
| `library.html` | Books owned + order history |
| `about.html` | Story, devices & formats, FAQ, contact |
| `assets/data.js` | The 12 books (with chapter one), currencies, countries, promo codes |
| `assets/app.js` | Shared engine — header/footer, cart, library, currency, toasts, theme |
| `assets/site.css` | Design system: tokens, buttons, cards, forms, dark mode |
| `assets/pages.css` | Page-level components |
| `assets/hero.css` | The home hero slider only |

## Images — keep them WebP

All site art is lossy WebP (quality 82, alpha preserved). The original PNGs were
4.15 MB; the WebP set is 0.44 MB, an 89% cut, and that was the fix for the site
feeling heavy on first load.

Two files are deliberately **not** WebP and should stay as they are:

- `assets/logo-180.png` — the `apple-touch-icon`; iOS wants a PNG
- `assets/favicon.ico`

New art should be converted before it is committed.

## Book covers

`CM.coverHTML()` in `app.js` probes for `assets/covers/<id>.webp` and falls back
to the drawn SVG cover when the file is missing, so a partial set is fine.

```
node tools/generate-covers.mjs                     # all twelve
node tools/generate-covers.mjs small-hours ...     # just these
py tools/covers-to-webp.py                         # shrink raw art into assets/covers
```

`generate-covers.mjs` drives the local Gemini Studio at `http://127.0.0.1:4321`,
so start that dashboard and sign in to Google once before running it. Raw output
lands in `tools/.covers-raw/` (gitignored) — only the WebP get committed.

**The studio token is not in the repo.** The script reads `GEMINI_STUDIO_TOKEN`
from the environment, or `tools/.token`, which is gitignored. The token is
already saved in `tools/.token` on this machine, so the script just runs. If it
ever gets hardcoded back into a tracked file it will be published — this repo is
public.

## Performance rules learned here

- **Never animate `filter`.** The hero bulb once ran an infinite keyframe on
  `filter: drop-shadow(...)`, which re-rasterizes a large transparent image every
  single frame. It is now a `::after` pseudo-element animating only `opacity` and
  `transform`, with a static drop-shadow on the image itself. Same look, no jank.
- A `blur()` over an already-soft radial gradient buys nothing — widen the
  gradient stop instead.
- The hero uses `preserve-3d` throughout, so anything that forces a repaint
  inside it is expensive. Prefer transform and opacity.

## Housekeeping

- The repo is public, so the source is readable by anyone. Never add credentials.
- There is no global `.gitconfig` on this machine; git identity is set per-repo
  (`digitaldotdeveloper` / firass.saab1@gmail.com).
- `gh` CLI is installed at `C:\Program Files\GitHub CLI\gh.exe` and logged in, so
  pushes do not prompt. It is not on PATH in already-open terminals.

## Publishing a change

```
git add -A
git commit -m "what changed"
git push
```
