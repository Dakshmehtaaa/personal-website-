# personal-website-

Daksh Mehta's personal portfolio site — CSR / ESG / sustainability project manager.
Static site, no build step, no framework, no dependencies. Open `index.html` directly
or serve the folder with any static file server.

## Files

- `index.html` — the main single-page site (hero, about, experience, portfolio, insights, contact)
- `why-sustainability-matters.html` — a second standalone page: the business case for
  sustainability strategy, aimed at companies. Shares the same nav/footer shell, style.css and
  script.js as index.html.
- `hobbies.html` — chess / fitness / travel, in a 3D coverflow carousel.
- `404.html` — GitHub Pages serves this for any missing path. **Its asset links are
  root-relative (`/personal-website-/…`) on purpose**: relative URLs would resolve against the
  requested path, not this file's location, and break on any nested 404.
- `style.css` — all styling, one file, organized in commented sections matching the HTML
  structure. Design tokens (colors, radii, shadows) are CSS custom properties on `:root` /
  `:root[data-theme="dark"]`.
- `script.js` — small vanilla-JS IIFEs, one per feature (theme toggle, language switch, nav,
  intro animation, portfolio accordion, LinkedIn embed fallback, show-more, spotlight glow,
  carousels, scroll reveal). Each guards on `if (!element) return;` so it's safe to include on
  every page even though not every page has every element.
- `i18n.js` — French translations keyed by `data-i18n` attribute. English lives directly in the
  HTML markup and is captured at runtime as the fallback/source of truth.
- `assets/` — logos, the CV PDF, hobby photos, notion project exports, the `og-cover.png` share
  card.
- `reference/21st-dev-effects/` — the original React sources for the two 21st.dev effects adapted
  here (spotlight card, coverflow carousel). Reference only; nothing imports them.

## Conventions

- **i18n parity is required.** Every `data-i18n="x.y"` added to either HTML file needs a matching
  `'x.y': '...'` entry in `i18n.js`'s `fr` dictionary. Missing keys don't break anything (they
  silently fall back to English) but that's a quality regression, not a feature — check for it
  before considering a content change done.
- **Portfolio entries** use a fixed `Name` / `Type | Language` structure (title line, then a
  one-line `accordion-sub`), with one tight paragraph of description — not two. Keep new entries
  consistent with this.
- **The intro typing animation** (`#intro-overlay` in script.js) is homepage-only. Other pages set
  `document.documentElement.setAttribute('data-intro', 'skip')` in their head script before
  paint, which the CSS reads to hide the overlay instantly with no flash.
- **Logo assets**: if a logo looks tiny/off in the `.logo-strip` or `.timeline-logo`, check the
  source file for dead padding around the mark (KBS.png had ~65% empty canvas) before touching
  CSS — cropping the asset is the real fix, not inflating the display size.
- **Size logo plates in px, not percentages.** `.res-logo` is a fixed-size grid plate; a
  percentage `max-height` on the `img` resolves against an indefinite grid track, so square marks
  (GRI, ESRS) render at full width and get clipped. The plate's dimensions live in
  `--plate-w`/`--plate-h`/`--plate-p` and the image bounds are `calc()`d from them.
- Chips in the About section's Frameworks & Tools cloud are plain text, not `data-i18n` — they're
  acronyms/proper nouns and intentionally aren't translated.
- **The site URL is hardcoded** as `https://dakshmehtaaa.github.io/personal-website-/` in the
  canonical/`og:` tags of all three pages, in `sitemap.xml`, `robots.txt`, the JSON-LD block at
  the end of `index.html`, and in `404.html`'s root-relative paths. Renaming the repo or adding a
  custom domain means updating all of those together.

## Environment notes

- Outbound network access to almost everything except a small allowlist (WebSearch works,
  WebFetch to most third-party domains — LinkedIn, GHG Protocol, CDP, etc. — returns
  `EGRESS_BLOCKED`) is blocked in this sandbox. Logos or images from external orgs/LinkedIn posts
  can't be downloaded programmatically here; ask the user to upload the files directly instead.
- Pillow is available for image work (including animated WebP); `ffmpeg`, `cwebp` and
  ImageMagick are not.

## Screenshot testing

Playwright with `executable_path="/opt/pw-browsers/chromium"`. Two artifacts will make a healthy
page look broken — both have bitten more than once:

- **Blank sections below the hero.** Scroll-reveal only marks elements `revealed` as they enter
  the viewport, and a `full_page=True` capture doesn't trigger that. Pass
  `reduced_motion="reduce"` to `new_context()` (not `page.emulate_media()` after `goto`, which is
  too late) — the reveal script has a reduced-motion path that reveals everything up front.
- **Missing logos/images.** `loading="lazy"` images below the fold never load for a full-page
  capture. Flip them eager in an init script before asserting anything about them.

Verify behaviour by querying the DOM (`naturalWidth`, computed styles, `aria-expanded`) rather
than by eyeballing a screenshot — that is what caught the `.res-logo` clipping above.

## Workflow

- Development branch: `claude/personal-website-redesign-oet18n`. If its PR has already merged,
  restart it from `origin/main` (same branch name) rather than stacking new commits on merged
  history.
- **Merge PRs automatically.** The user doesn't want to merge manually — once a PR on this repo
  has no failing CI and no unaddressed review comments, merge it without waiting for explicit
  go-ahead. (This repo has no CI configured, so in practice that means: merge once pushed and
  clean.)
