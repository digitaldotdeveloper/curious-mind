# Curious Mind — where this stands

Static multi-page ebook store. No build step for the site itself, no framework,
no runtime dependency. Open `index.html` and everything works, checkout included.

**Live:** <https://digitaldotdeveloper.github.io/curious-mind/>
**Repo:** `digitaldotdeveloper/curious-mind` (branch `main`, GitHub Pages)
**Slogan:** *Stories today. Ideas forever.*

---

## Layout

| File | What it is |
|---|---|
| `index.html` | Home — 3D hero slider (3 illustrated slides), the twelve, newsletter |
| `shop.html` | Catalogue — search, category chips, sort, saved list, empty states |
| `book.html?id=…` | Book detail — blurb, facts, contents, related |
| `read.html?id=…` | Chapter-one reader — font size, sepia, progress, resume |
| `cart.html` | Bag → details → payment → confirmation |
| `library.html` | Books owned + order history |
| `about.html` | Story, worldwide info, formats, FAQ, contact |

| Asset | Purpose |
|---|---|
| `assets/data.js` | 12 books incl. full chapter one, currencies, countries, promo codes |
| `assets/app.js` | Shared engine — chrome, cart, library, currency, toasts, theme, scroll |
| `assets/site.css` `pages.css` `hero.css` | **Sources you edit** |
| `assets/curious.min.css` | **What the pages load** — built by `tools/build-css.py` |
| `assets/layers/` | Slide 1 illustration, cut into 8 layers + manifest |
| `assets/scenes/shelf/` `scenes/chapter/` | Slides 2 and 3, same treatment |
| `assets/covers/*.webp` | The 12 book covers |
| `assets/og.jpg` | 1200×630 link-share thumbnail |
| `tools/` | Generation + image tooling. Not served. |

**After editing any CSS source, run `py tools/build-css.py`** or the change will
not reach the site. This is the one non-obvious step in the repo.

---

## Facts that cost real debugging — don't re-derive

### The hero slider

- **Covers drift while the parallax moves them, so the browser's own click
  target is unreliable.** `mousedown` lands on the cover, the tilt shifts it a
  few pixels, and `mouseup` lands elsewhere — the click event then retargets to
  a common ancestor and the handler never fires. Anything clickable inside a
  moving 3D stage must record the element at *press* time and act on that at
  release. This cost a full debugging session; don't "simplify" it back.
- **`pointerup` fires before `mouseup`.** Selecting a card on `pointerup` and
  snapping on `mouseup` means the snap silently overwrites the selection. Do
  both in the same handler, selection *after* the snap.
- **Children at negative Z sit behind their `preserve-3d` parent's own plane**,
  so the parent intercepts every hit. Side covers were never clickable until
  `.track` got `pointer-events:none` with `pointer-events:auto` on the cards.
- **The animation loop must park itself.** It ran at 60fps forever, writing
  transforms to eight elements even on a slide that wasn't on screen. That was
  most of the idle cost on a phone.
- **`align-items:center` from the desktop rule collapses the art column** when
  mobile switches to `flex-direction:column` — percentage-width layers then
  resolve against zero and the slide renders empty while every image loads fine.
  The mobile rule sets `align-items:stretch` explicitly.

### Phones

- Live `blur()`, `mix-blend-mode` and `backdrop-filter` are dropped below 900px.
  Repainting all of them at once is what made the **theme toggle** crawl; it is
  now ~40ms on a 4× throttled CPU instead of a 400ms document repaint.
- Pointer and scroll parallax are desktop-only (`pointer:fine`).
- Only the live slide is in the layout; slide changes scroll the hero clear of
  the sticky header (subtract the header height, or the headline tucks under it).

### The preloader

- **Classic scripts are blocked by pending stylesheets.** A JS-driven loader
  therefore sits frozen until every stylesheet *and* the script have arrived —
  which is why it read a literal "0%" for 3.5s on slow 3G. The fix is all three
  of: critical CSS inline in `<head>`, a **CSS-animated** bar (no number to
  freeze at), and fonts loaded async.
- The failsafe counts **from navigation**, not from when the script ran, so a
  slow start cannot extend the wait. Verified with `app.js` blocked entirely:
  the overlay still clears. A loader that can trap someone is worse than none.

### Gemini Studio (image generation)

- Runs at `Gemini Prompt Sender/dashboard` → `Start Dashboard.cmd`, API on
  `127.0.0.1:4321`. Full notes in that folder's `_CONTINUE-HERE.md`.
- **Its Chrome profile signs in separately from your browser.** If jobs fail
  with "Not signed in" *after* you have signed in, the server is holding a
  session from before — **restart the server**. `node diagnose.js` reports the
  truth.
- **Match generated images to their subject by the prompt text, never by job
  order.** Jobs run concurrently and finish out of order; ordering silently put
  every cover on the wrong book the first time, and the images all looked
  plausible, so only reading them against their titles caught it.
- Prompt for layering: ask for objects **with clear space around them, not
  touching, on a flat cream ground**. That is what makes `segment-scene.py` find
  them as separate components instead of one fused blob.

### Segmentation

- The watercolour has wide soft edges (`0 < alpha ≤ 40`) belonging to no
  component. Hand each to its **nearest labelled pixel** or a third of the
  artwork silently disappears.
- Verify by restacking the layers and comparing **alpha exactly**, and colour
  only where `alpha > 0`. Comparing RGB in transparent regions is meaningless
  and reports a huge, fake difference.

---

## Regenerating things

```bash
# book covers
node tools/generate-covers.mjs        # -> tools/.covers-raw
py   tools/covers-to-webp.py          # -> assets/covers/*.webp

# hero scenes for slides 2 and 3
node tools/generate-hero-scenes.mjs   # -> tools/.scenes-raw (2 variants each)
py   tools/segment-scene.py shelf   tools/.scenes-raw/shelf-2.png
py   tools/segment-scene.py chapter tools/.scenes-raw/chapter-4.png

py   tools/make-og.py                 # link thumbnail
py   tools/build-css.py               # REQUIRED after any CSS edit
```

The studio token lives in `tools/.token` (gitignored) or `GEMINI_STUDIO_TOKEN`.

---

## Checkout

Bag → details (email, country, optional VAT ID) → payment (card / PayPal / bank)
→ confirmation. Luhn and future-expiry validation are real.

**It is a demo** and says so plainly; nothing is transmitted. Test card
`4242 4242 4242 4242`. Promo codes `SLOWREAD` 15%, `MARGINALIA` 20%,
`FIRSTSHELF` 10%.

To take real money, swap `CM.placeOrder()` for Stripe Checkout or Lemon
Squeezy — they act as merchant of record and handle worldwide VAT, which is the
part not worth building.

## Worldwide

10 currencies (seeded from browser locale), 70+ countries each with their own
VAT rate applied at checkout. Choosing a country switches the currency too.
Everything is an instant download — no shipping, address or customs logic.

## State

Bag, saved list, library, reading position, currency, country and theme all live
in `localStorage`. No accounts, no server. `localStorage.clear()` resets.

---

## Tests

Three CDP suites drive a real headless Chrome with real mouse events. They live
in the scratchpad, not the repo:

- **store** (48 checks) — hero, cover→book navigation, cart, reader, shop
  filters, currency, full checkout incl. validation rejections, library, theme
- **mobile** (20) — preloader, paint costs, theme-toggle timing, slider layout,
  drawer, idle cost
- **scroll** (19) — layer counts, reveal in *and* out, parallax, every page

Assertions must be able to fail. `width <= viewport` passes at zero — which is
exactly how the collapsed art column got through. Assert a *range*.

## Known / deliberate

- The interactive coverflow is retired from the hero. Every cover still opens
  its own book from the grid below and on the shelf page.
- `tools/source/` holds the original artwork. In the repo, not served.
- Shipped payload ~1.1MB including all covers and three layered scenes.
