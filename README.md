# Mishra Optics — frontend-only eyewear storefront

A complete, responsive **limited eyewear catalogue** (six frames) built with **plain HTML, CSS and
vanilla JavaScript**.
There is **no backend, no database and no build step** — the catalogue is static and the wishlist
and form state live in the browser (`localStorage`).

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Editorial hero, shop-by-mood tiles, bestsellers, brand story, face-shape fit finder, reviews, journal, newsletter |
| `shop.html` | Full catalogue with category / shape / colour / price filters, sorting, live counts, empty state and URL-synced filters |
| `product.html` | Product detail with image gallery, colour/size/lens options, accordions, reviews, related frames and a WhatsApp enquiry that includes the selected options |
| `about.html` | Brand story, stats, values, studio timeline and store locations |
| `contact.html` | Validated contact form that hands off to WhatsApp, studio details, stylised map and FAQ accordion |

Global UI: sticky header with mega-menu, rotating announcement bar, search overlay, wishlist drawer,
mobile menu, WhatsApp product enquiries, contact handoff, toast notifications and a wishlist count.

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

- **There is no cart or checkout.** Every product card and the product page has an **Enquire on
  WhatsApp** action that opens a pre-filled message with the frame, price, selected colour/size/lens
  and a link back to the product.
- **The newsletter is demo-only.** It validates in the browser and shows a success state; no data
  is sent or stored on a server.
- **The contact form hands off to WhatsApp.** On submit it validates the fields, builds a pre-filled
  message and opens `wa.me` in a new tab (with a fallback link in the success state). No backend,
  database or form service is involved. The number is set in `BUSINESS` in `js/data.js`.
- **Public social/contact links:** Facebook (`facebook.com/675562649552525`) and WhatsApp
  (`wa.me/919828534548`) are wired from the public "Mishra Optician" Kota listing. Update the
  `BUSINESS` object and the static footer links if the business details change.
- **Footer brand card:** "Designed & engineered by KotaLabs" with a link to `kotalabs.in`, the four
  KotaLabs plans (**Free, Basic, Business, Full end-to-end**) and a highlighted free-plan CTA, plus
  a "Designed by KotaLabs" line in the footer bottom bar. The same card appears on every page.
- The wishlist persists in `localStorage` under `mo_wish`.
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
├── js/app.js         # rendering, filters, wishlist, search, WhatsApp, forms
├── assets/icons.svg  # inline SVG icon sprite
├── assets/fonts/     # self-hosted woff2 files
└── images/           # campaign + product imagery
```
