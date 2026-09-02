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
| `404.html` | Not-found page (GitHub Pages serves it for any missing path) |

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
