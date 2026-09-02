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
  intro animation, portfolio accordion, show-more, spotlight glow, carousels, scroll reveal).
  Each guards on `if (!element) return;` so it's safe to include on every page even though not
  every page has every element.
- `i18n.js` — French translations keyed by `data-i18n` attribute. English lives directly in the
  HTML markup and is captured at runtime as the fallback/source of truth.
- `assets/` — logos, the CV PDF, hobby photos, notion project exports, the `og-cover.png` share
  card, `videos/` (the sustainability page's hero video — see its own README for expected
  filenames).
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
- **One content width.** Every full-width section (hero, about, timeline, portfolio, insights,
  resources, footer) uses `max-width:var(--maxw)` (1280px) so left/right edges line up all the
  way down the page. Don't give a section its own narrower cap to "fix" long paragraph lines —
  cap the text instead (`max-width` in `ch` on the `p`/`ul`, e.g. `.project-detail-copy p`,
  `.timeline-body ul`), so the card/section background still reaches the shared edge. The only
  legitimate narrower caps are: `.section-head`/`.panel-note` (760px, a centered headline
  measure) and `.contact-card` (960px, a deliberately focused CTA box) — both are sub-elements,
  not full section containers, and adding a third one reintroduces the "different width per
  section" bug this fixed.
- **The top bar (`.site-nav`) is a full-width fixed bar, not a floating pill** — it spans
  edge-to-edge like the rest of the site's sections, not inset with its own border-radius. Note
  the class: the selector is scoped to `.site-nav` rather than the bare `nav` tag specifically
  *because* `#side-index` (below) is also a `<nav>` landmark — a bare `nav{}` rule leaks into it
  (this bit us once: `#side-index` inherited `width:100%` and `right:0` from it and rendered as a
  full-width invisible strip). Never restyle the top bar via a bare `nav` selector.
- **`#side-index`** is the scroll-spy rail on the left (index.html, why-sustainability-matters.html)
  — hidden over the hero, faded in by script.js once `#top` scrolls out of view, reusing the same
  IntersectionObserver-driven `.active` class the top nav's dropdown links get (`.nav-links a,
  .side-index a` share one spy). Only shown above 1240px, and even then the label text is
  hover-only, capped to `var(--avail-label)` (derived from the actual margin beside the maxw
  column at the current viewport width) rather than a fixed px value — a fixed width overlapped
  card content around common laptop widths (~1440px) when the active item's label was left open
  permanently. If you add a page with its own anchor sections, copy the pattern rather than
  reintroducing a fixed label width.
- **`.nav-drop-top::after` is a CSS border-triangle, not the "▾" character.** That glyph sits low
  in its own box in most fonts and read as visibly off-center against the link text next to it,
  however the spacing was tuned. A `border` triangle centers on the line itself regardless of
  font/platform — don't swap it back for a text glyph.
- Chips in the About section's Frameworks & Tools cloud are plain text, not `data-i18n` — they're
  acronyms/proper nouns and intentionally aren't translated.
- **The sustainability hero's right-hand visual is a video** (`.sus-hero-visual` →
  `.sus-video-card`) — it replaced a small animated SVG chart (the `.spark-*` classes; deleted,
  don't resurrect them for a similar chart elsewhere without rebuilding from scratch). Autoplays
  muted+looped — required for autoplay to work at all — with a click-to-unmute button
  (`#sus-video-mute`, swapping two SVG icons via `data-muted`, same pattern as the theme toggle's
  sun/moon swap). script.js pauses it outright under `prefers-reduced-motion`, and otherwise
  pauses/resumes it via `IntersectionObserver` so it's not decoding off-screen. `.sus-video`'s CSS
  background is a light gradient rather than a flat fill — it's what shows before the poster/video
  paints, and a flat box reads as broken rather than loading.
- **All `#insights` cards use `.insight-image`** — a fixed `aspect-ratio:16/10` box with a real
  `<img>`, `object-fit:contain`. There used to be a `.li-embed` variant (a raw LinkedIn `<iframe>`
  with a hardcoded `height` attribute baked into LinkedIn's own embed snippet) for whichever post
  didn't have a cropped screenshot yet; it was removed once all three cards had one, along with
  the script.js IIFE that degraded it when the iframe failed to load. Do not bring `.li-embed`
  back for a new post — every LinkedIn post's iframe embed height is different (whatever LinkedIn
  assigned it), so mixing it with `.insight-image` cards makes the row visibly uneven; get a
  screenshot of the post from the user instead and add it the same way as the others.
- **The site URL is hardcoded** as `https://dakshmehtaaa.github.io/personal-website-/` in the
  canonical/`og:` tags of all three pages, in `sitemap.xml`, `robots.txt`, the JSON-LD block at
  the end of `index.html`, and in `404.html`'s root-relative paths. Renaming the repo or adding a
  custom domain means updating all of those together.

## Environment notes

- Outbound network access to almost everything except a small allowlist (WebSearch works,
  WebFetch to most third-party domains — LinkedIn, GHG Protocol, CDP, etc. — returns
  `EGRESS_BLOCKED`) is blocked in this sandbox. Logos or images from external orgs/LinkedIn posts
  can't be downloaded programmatically here; ask the user to upload the files directly instead.
- **Where an uploaded file actually lands**: check `/root/.claude/uploads/<session-id>/` (not the
  repo). Mentioning a filename in chat is not the same as attaching it — if the user names a file
  you can't find there or anywhere under the repo, it didn't come through; say so and ask them to
  attach it directly (drag-and-drop / paste) rather than assuming it'll show up later.
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
