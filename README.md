# Mishra Optics — frontend-only eyewear storefront

A complete, responsive eyewear storefront built with **plain HTML, CSS and vanilla JavaScript**.
There is **no backend, no database and no build step** — the catalogue is static and the cart,
wishlist and form state live in the browser (`localStorage`).

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Editorial hero, shop-by-mood tiles, bestsellers, brand story, face-shape fit finder, reviews, journal, newsletter |
| `shop.html` | Full catalogue with category / shape / colour / price filters, sorting, live counts, empty state and URL-synced filters |
| `product.html` | Product detail with image gallery, colour and size options, lens pricing, quantity, accordions, reviews and related frames |
| `about.html` | Brand story, stats, values, studio timeline and store locations |
| `contact.html` | Validated contact form that hands off to WhatsApp, studio details, stylised map and FAQ accordion |

Global UI: sticky header with mega-menu, rotating announcement bar, search overlay, cart drawer,
wishlist drawer, mobile menu, WhatsApp handoff, toast notifications and a persistent cart count.

## Frontend patterns borrowed from well-known optics sites

The design was researched against the following category leaders. Only frontend patterns were
borrowed — no code, content or backend architecture.

- **Warby Parker** — clean DTC layout, a reassurance bar under the hero, product-first photography,
  and a low-commitment guided selection tool (our fit finder).
- **EyeBuyDirect** — faceted filtering by category, shape, colour and price, plus a strong
  education/try-on mindset.
- **Zenni** — guided buying content, fit guidance and transparent pricing.
- **GlassesUSA** — trust signals, reviews and offer-led merchandising.
- **Ray-Ban / Oakley** — bold campaign imagery and product storytelling.
- **MODO / State Optical / Silhouette** — premium editorial typography, generous whitespace and
  product-focused layouts.

## Run it

```bash
cd mishra-optics
python3 -m http.server 8080
# open http://localhost:8080
```

No environment variables, API keys or services are required.

## Notes

- **Checkout and newsletter are demo-only.** They validate in the browser and show a success
  state; no data is sent or stored on a server.
- **The contact form hands off to WhatsApp.** On submit it validates the fields, builds a pre-filled
  message and opens `wa.me` in a new tab (with a fallback link in the success state). No backend,
  database or form service is involved. The number is set in `BUSINESS` in `js/data.js`.
- **Public social/contact links:** Facebook (`facebook.com/675562649552525`) and WhatsApp
  (`wa.me/919828534548`) are wired from the public "Mishra Optician" Kota listing. Update the
  `BUSINESS` object and the static footer links if the business details change.
- **Footer credit:** "Designed & engineered by KotaLabs" with a link to `kotalabs.in`, plus a
  "Designed by KotaLabs" line in the footer bottom bar.
- Cart and wishlist persist in `localStorage` under `mo_cart` and `mo_wish`.
- Fonts (Fraunces + Manrope) are self-hosted in `assets/fonts`, so the site has no external
  runtime dependencies.
- All product and campaign imagery is generated for this demo and stored in `images/`.
- Responsive at 1440 / 1100 / 960 / 720 / 390 px, with keyboard focus states, ARIA labels and
  `prefers-reduced-motion` support.

## Structure

```
.
├── index.html
├── shop.html
├── product.html
├── about.html
├── contact.html
├── css/styles.css
├── js/data.js        # catalogue, reviews, journal, stores, FAQs
├── js/app.js         # rendering, filters, cart, wishlist, search, forms
├── assets/icons.svg  # inline SVG icon sprite
├── assets/fonts/     # self-hosted woff2 files
└── images/           # campaign + product imagery
```
