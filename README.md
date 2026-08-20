# Curious Mind — ebook store

A complete, static, multi-page ebook shop. No build step, no dependencies, no server —
open `index.html` and everything works, including checkout.

## Pages

| File | What it is |
|---|---|
| `index.html` | Home — 3D hero slider (3 slides), the twelve, newsletter |
| `shop.html` | Catalogue — search, category chips, sort, saved list, empty states |
| `book.html?id=…` | Book detail — blurb, facts, contents, related titles |
| `read.html?id=…` | Chapter-one reader — font size, sepia, progress, resume |
| `cart.html` | Bag → details → payment → confirmation (4 steps) |
| `library.html` | Books you own + order history |
| `about.html` | Story, worldwide info, devices & formats, FAQ, contact |

## Assets

| File | Purpose |
|---|---|
| `assets/data.js` | The 12 books (with full chapter one), currencies, countries, promo codes |
| `assets/app.js` | Shared engine — header/footer, cart, library, currency, toasts, theme |
| `assets/site.css` | Design system: tokens, buttons, cards, forms, dark mode |
| `assets/pages.css` | Page-level components |
| `assets/hero.css` | The 3D hero slider |
| `assets/logo.png` | Logo, background removed |
| `assets/hero-art.png` | Hero illustration, background removed |

## Worldwide

- **10 currencies** (USD, EUR, GBP, CAD, AUD, AED, SAR, INR, JPY, BRL), switchable in the
  header. The starting currency is guessed from the browser locale.
- **70+ countries** with per-country VAT applied at checkout. Choosing a country also
  switches the currency.
- Everything is an instant download, so there is no shipping, address or customs logic.

## Checkout

Bag → details (email, country, optional VAT ID) → payment (card / PayPal / bank transfer)
→ confirmation. Card entry validates with a real Luhn check and a future-expiry check.

**It is a demo.** Nothing is transmitted anywhere; the page says so plainly and asks people
not to enter a real card. Test card: `4242 4242 4242 4242`, any future expiry, any CVC.
Promo codes: `SLOWREAD` (15%), `MARGINALIA` (20%), `FIRSTSHELF` (10%).

To take real money you would swap `CM.placeOrder()` in `assets/app.js` for a Stripe Checkout
or Lemon Squeezy / Paddle redirect — those handle worldwide VAT and act as merchant of record,
which is the part you do not want to build yourself.

## State

Bag, saved list, library, reading position, currency, country and theme all live in
`localStorage`. No accounts, no server. Clear it from the console with `localStorage.clear()`.

## Accessibility & motion

Skip link, focus-visible rings, labelled controls, `aria-current` on nav and slides,
keyboard support on the slider and reader, a pause control on the hero, and a full
`prefers-reduced-motion` path that stops the autoplay, the float and the page-turn.

Dark mode follows the system by default and can be toggled in the header.
