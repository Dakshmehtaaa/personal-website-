/* Framework and tool names in the body copy (CSRD, EcoVadis, GRI, Power BI...) become underlined links to the official site,
   and hovering or focusing one shows its logo in a small card that follows the pointer along the word.
   Ported from js/story.js on honeybees.consulting (itself a vanilla take on 21st.dev's animated-highlight-text).
   The words are found at runtime, so they keep working after the EN/FR switch rewrites the copy: add a term here, not in the HTML. */
(function () {
  const L = 'assets/logos/resources/', T = 'assets/logos/tools/', MS = 'https://www.microsoft.com/';
  const TERMS = {
    'CSRD': ['https://finance.ec.europa.eu/capital-markets-union-and-financial-markets/company-reporting-and-auditing/company-reporting/corporate-sustainability-reporting_en', L + 'csrd.svg'],
    'ESRS': ['https://www.efrag.org/en/sustainability-reporting', L + 'esrs.webp'],
    'EcoVadis': ['https://ecovadis.com/', L + 'ecovadis.png'],
    'B Corp': ['https://www.bcorporation.net/', L + 'b-impact-assessment.png'],
    'ISO': ['https://www.iso.org/', L + 'iso.png'],
    'SBTi': ['https://sciencebasedtargets.org/', L + 'sbti.webp'],
    'CDP': ['https://www.cdp.net/', L + 'cdp.webp'],
    'GRI': ['https://www.globalreporting.org/', L + 'gri.webp'],
    'GHG Protocol': ['https://ghgprotocol.org/', L + 'ghg-protocol.webp'],
    'EU Taxonomy': ['https://finance.ec.europa.eu/sustainable-finance/tools-and-standards/eu-taxonomy-sustainable-activities_en', L + 'eu-taxonomy.webp'],
    'UN Global Compact': ['https://unglobalcompact.org/', L + 'un-global-compact.svg'],
    'ADEME': ['https://www.ademe.fr/', L + 'ademe.svg'],
    'Power Automate': [MS + 'power-platform/products/power-automate', T + 'power-automate.webp'],
    'Power BI': [MS + 'power-platform/products/power-bi', T + 'power-bi.svg'],
    'PowerPoint': [MS + 'microsoft-365/powerpoint', T + 'powerpoint.webp'],
    'Excel': [MS + 'microsoft-365/excel', T + 'excel.svg'],
    'Python': ['https://www.python.org/', T + 'python.webp'],
    'SAP': ['https://www.sap.com/', T + 'sap.webp'],
    'Canva': ['https://www.canva.com/', T + 'canva.webp'],
    'Figma': ['https://www.figma.com/', T + 'figma.webp'],
    'Google Slides': ['https://workspace.google.com/products/slides/', T + 'google-slides.png'],
    // "Make" is also an everyday word: only taken as the tool inside a list ("..., Make, ...")
    'Make': ['https://www.make.com/', T + 'make.png']
  };
  const BLOCKS = 'main p, main li';
  const SKIP = 'a, button, label, select, option, table, form, svg, script, h1, h2, h3, [aria-hidden="true"], .term';
  const alt = Object.keys(TERMS).sort((a, b) => b.length - a.length)
    .map((t) => (t === 'Make' ? '(?<=,\\s)Make(?=,|\\sand\\b|\\.)' : t.replace(/ /g, '\\s')));
  const pattern = new RegExp('\\b(' + alt.join('|') + ')\\b(?![\\w-])', 'g');

  function mark(block) {
    if (block.closest(SKIP)) return;
    const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      if (!n.parentElement.closest(SKIP)) nodes.push(n);
    }
    nodes.forEach((node) => {
      const text = node.nodeValue;
      pattern.lastIndex = 0;
      if (!pattern.test(text)) return;
      pattern.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let last = 0;
      text.replace(pattern, (match, term, at) => {
        const entry = TERMS[term.replace(/\s/g, ' ')];
        if (!entry) return match;
        frag.append(text.slice(last, at));
        const a = document.createElement('a');
        a.className = 'term';
        a.href = entry[0];
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.dataset.logo = entry[1];
        a.textContent = match;
        frag.append(a);
        last = at + match.length;
        return match;
      });
      frag.append(text.slice(last));
      node.replaceWith(frag);
    });
  }
  const markAll = () => document.querySelectorAll(BLOCKS).forEach(mark);
  markAll();

  // the language switch rewrites textContent and drops the links: put them back once it is done
  let queued = false;
  new MutationObserver(() => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; markAll(); });
  }).observe(document.querySelector('main') || document.body, { childList: true, subtree: true, characterData: true });

  /* one shared logo card, fixed to the viewport so no scrolling or clipped container can cut it off */
  const tip = document.createElement('div');
  tip.className = 'term-tip';
  tip.setAttribute('aria-hidden', 'true');
  tip.innerHTML = '<span class="term-tip-card"><img alt="" decoding="async"></span>';
  document.body.append(tip);
  const img = tip.querySelector('img');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let current = null, x = 0, tx = 0, raf = 0;

  const place = () => {
    if (!current) return;
    const r = current.getBoundingClientRect();
    const min = r.left + 8, max = r.right - 8;
    tx = Math.min(max, Math.max(min, tx));
    const edge = 87; // half the card plus a 12px gutter: keep it on screen near the window edges
    tx = Math.min(window.innerWidth - edge, Math.max(edge, tx));
    x = reduce.matches ? tx : x + (tx - x) * 0.35; // a light spring towards the pointer
    const below = r.top < 120; // no room above: show it under the word
    tip.classList.toggle('is-below', below);
    tip.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + (below ? r.bottom + 12 : r.top - 12).toFixed(1) + 'px,0)';
    if (Math.abs(tx - x) > 0.5) raf = requestAnimationFrame(place); else raf = 0;
  };
  const show = (term, clientX) => {
    const r = term.getBoundingClientRect();
    if (img.getAttribute('src') !== term.dataset.logo) img.src = term.dataset.logo;
    tx = clientX == null ? r.left + r.width / 2 : clientX;
    if (current !== term) x = tx;
    current = term;
    tip.classList.add('is-on');
    if (!raf) raf = requestAnimationFrame(place);
  };
  const hide = (term) => {
    if (term && term !== current) return;
    current = null;
    tip.classList.remove('is-on');
  };
  document.addEventListener('pointerover', (e) => {
    const term = e.target.closest && e.target.closest('.term');
    if (term && e.pointerType !== 'touch') show(term, e.clientX);
  });
  document.addEventListener('pointermove', (e) => {
    if (current && e.target.closest && e.target.closest('.term') === current) { tx = e.clientX; if (!raf) raf = requestAnimationFrame(place); }
  }, { passive: true });
  document.addEventListener('pointerout', (e) => {
    const term = e.target.closest && e.target.closest('.term');
    if (term && !term.contains(e.relatedTarget)) hide(term);
  });
  document.addEventListener('focusin', (e) => { if (e.target.classList && e.target.classList.contains('term')) show(e.target); });
  document.addEventListener('focusout', (e) => { if (e.target.classList && e.target.classList.contains('term')) hide(e.target); });
  window.addEventListener('scroll', () => hide(), { passive: true });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
})();
