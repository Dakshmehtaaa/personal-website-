# Daksh Mehta — personal website

Portfolio site for Daksh Mehta, CSR / ESG / sustainability project manager based in Paris.

**Live:** https://dakshmehtaaa.github.io/personal-website-/

## Running it

There is no build step and no dependencies. Either open `index.html` directly in a browser, or
serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

A local server is preferable — the language switch and theme toggle use `localStorage`, which some
browsers restrict on `file://` URLs.

## Pages

| File | What it is |
| --- | --- |
| `index.html` | The main single-page site: hero, about, experience, portfolio, insights, contact |
| `why-sustainability-matters.html` | The business case for sustainability strategy, aimed at companies, plus free resources |
| `hobbies.html` | Chess, fitness and travel, in a scroll-driven photo spread |
| `co2-tracker.html` | **Beta.** A free GHG Protocol screening calculator — Scope 1, 2 and 3 |
| `404.html` | Not-found page (GitHub Pages serves it for any missing path) |

### The CO₂ tracker

A screening-level greenhouse gas calculator that runs entirely client-side — no account, no
network calls, no data leaving the browser. Entries are kept in `localStorage` and can be exported
as CSV or printed to PDF.

The form uses the GHG Protocol scope structure with **partial coverage**. It covers common
fuels and refrigerants (Scope 1), location-based electricity and district heat (Scope 2),
and selected purchased goods, capital goods, upstream fuel, travel, commuting, waste and water
activities (Scope 3). It does not produce a complete inventory or a market-based Scope 2 result.
GRI is identified as a disclosure framework, not a factor source or certification.

Built-in factors were checked against the official DESNZ 2026 revised flat file, version 1.2.
Most are UK proxies; hotel stays use France. Flights exclude non-CO₂ radiative forcing.
The factor IDs and units are recorded in `reference/factor-audit-2026.json`.
Electricity uses a cited custom grid factor or the verified UK factor. Spending has no assumed
factor: source, price year and currency basis must be supplied. Positive activity without a
factor is flagged and blocks export. A supplied factor of zero is valid; blank activity is
excluded rather than treated as confirmed zero. Upstream fuels use individual activity-based
factors, not a percentage uplift.

Factors and source labels live on form inputs and generate the visible factor table.
`carbon-core.js` computes the inventory, including auditable separate upstream lines.
Run `node --test tests/carbon-core.test.cjs` for the calculation regression checks.

The page is deliberately unlisted while in beta — reachable from the footer, `noindex`, and absent
from `sitemap.xml`.

## How it's put together

- **`style.css`** — all styling in one file, in commented sections that mirror the HTML. Colors,
  radii and shadows are CSS custom properties on `:root` and `:root[data-theme="dark"]`.
- **`script.js`** — small vanilla-JS IIFEs, one per feature (theme toggle, language switch, nav,
  intro animation, portfolio accordion, carousels, scroll reveal). Each returns early if its
  element is absent, so the same file is safe to include on every page.
- **`i18n.js`** — French translations keyed by `data-i18n`. English lives in the HTML markup and is
  captured at runtime as the fallback, so every `data-i18n` added to a page needs a matching entry
  in the `fr` dictionary.
- **`assets/`** — logos, the CV PDF, hobby photos, Notion project exports.
- **`reference/`** — original React sources for the two 21st.dev effects adapted here (spotlight
  card, coverflow carousel), kept for reference only; nothing imports them.

Contributor conventions — portfolio entry structure, i18n parity, the intro-animation scope — are
in `CLAUDE.md`.

## Editorial redesign

The main site now uses the approved About beta theme: DM Sans and Instrument Serif,
warm paper, forest green, generous spacing and restrained motion. The original
`about-me-beta.html` remains available as the reference.

- `editorial-base.css`: shared visual foundation from the beta.
- `editorial.css`: readable sizing, responsive layouts, original-colour logo plates,
  company page and styles for the existing portfolio, gallery and calculator.
- `editorial.js`: shared navigation, EN/FR switching, theme and video playback.
- `editorial-copy.js`: French translations for the concise revised content.
- `narrative.css`: dimensional journey cards, visual project covers, a distinct LinkedIn
  gallery, wide company video and hobby photo spread.

On the four updated pages, `data-beta-i18n` is handled by `editorial.js`, which also
loads the existing `i18n.js` dictionary. Keep new keys translated in
`editorial-copy.js`. Existing portfolio downloads remain available in native expandable cards. The calculator
retains local saving and CSV/print actions with the verified factor changes described above.

The company video has a play/pause control, pauses off-screen and in background
tabs, and respects reduced-motion preferences. Company logos retain their source
colours and aspect ratios on neutral plates; they identify work experience, not
client endorsements.

GitHub Pages continues to serve the root files unchanged. For the private Sites
preview only, run `node prepare-preview.mjs` to stage public assets in `dist/`;
this adapts the 404 paths for the preview origin and excludes source documentation.

The user-supplied React/GSAP cinematic-scroll and Motion photo-spread examples informed the
movement. Their effects are adapted to the existing vanilla-JavaScript site without introducing
a framework. Text remains visible before JavaScript loads; reduced-motion and narrow-screen
layouts keep the content in a readable document flow.

## Five design directions

`concepts/index.html` compares Noir, Grid, Canopy, Signal and Atelier. Each is a complete
portfolio with all 11 projects, four experience entries, company resources, video, hobbies,
LinkedIn posts and contact links. They share content but use different layouts and motion.
`node concepts/build.mjs` regenerates the pages from `concepts/content.json`; presentation
and progressive interactions live in `concepts.css` and `concepts.js`. The comparison dock,
language control and motion pause work across the five directions. The original homepage
and screening calculator remain accessible.
