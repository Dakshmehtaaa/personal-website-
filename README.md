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
| `hobbies.html` | Chess, fitness and travel, in a 3D coverflow carousel |
| `co2-tracker.html` | **Beta.** A free GHG Protocol screening calculator — Scope 1, 2 and 3 |
| `404.html` | Not-found page (GitHub Pages serves it for any missing path) |

### The CO₂ tracker

A screening-level greenhouse gas calculator that runs entirely client-side — no account, no
network calls, no data leaving the browser. Entries are kept in `localStorage` and can be exported
as CSV or printed to PDF.

It covers Scope 1 (natural gas, heating oil, LPG, fleet fuel, refrigerant leakage), Scope 2
(purchased electricity with a per-country grid factor or your supplier's own, plus district heat)
and the Scope 3 categories most companies can estimate from data they already hold: purchased
goods and services (1), fuel- and energy-related activities (3), waste and water (5), business
travel (6) and commuting (7).

Every emission factor lives on its own input as `data-factor` / `data-unit` / `data-source`, and
the methodology table on the page is generated from those attributes — so the factors shown to the
reader and the factors used in the maths cannot drift apart. They are screening-grade and dated
(DEFRA/DESNZ conversion factors, IPCC AR5 GWPs, rounded national grid intensities), and the page
says so plainly: it is not an audit-grade inventory.

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
