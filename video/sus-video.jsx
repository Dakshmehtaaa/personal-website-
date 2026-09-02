// Scene file for "Sustainability Video 1x1.dc.html".
// Renders the whole 45s composition from authored time T only.

const W = 1920;
const H = 1080;
const C = {
  bg: '#f7faf8',
  border: 'rgba(16,35,29,.12)',
  text: '#10231d',
  soft: '#41564c',
  muted: '#6b7f75',
  gold: '#b8905a',
};
const FONT = 'Inter, system-ui, -apple-system, sans-serif';
const TOTAL = 45;

/* ---------- three motion helpers; no easing or transform outside them ---------- */

const MOTION = {
  // opacity envelope: rise a→b, hold, fall c→d
  band: (t, a, b, c, d) =>
    interpolate([a, b, c, d], [0, 1, 1, 0], [Easing.easeOutCubic, Easing.linear, Easing.easeInCubic])(t),
  // entrance: progress 0→1 with a distance to travel
  enter: (t, start, dur, dist) => {
    const p = animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeOutQuart })(t);
    return { p, y: (1 - p) * dist };
  },
  // path draw / bar grow: 0→1 to feed strokeDashoffset
  draw: (t, start, dur) =>
    animate({ from: 0, to: 1, start, end: start + dur, ease: Easing.easeInOutQuart })(t),
};

/* ---------- the spark line: the one element that persists end to end ---------- */

const SRC = [[10, 130], [70, 110], [130, 120], [190, 80], [250, 90], [310, 45], [390, 20]];
const tx = (sx) => (sx - 10) / 380;
const heroPt = ([sx, sy]) => [260 + tx(sx) * 1400, 380 + ((sy - 20) / 110) * 300];
const flatPt = ([sx]) => [120 + tx(sx) * 1680, 990];
const lerp = (a, b, k) => a + (b - a) * k;

function sparkGeom(f) {
  return SRC.map((s) => {
    const h = heroPt(s), l = flatPt(s);
    return [lerp(h[0], l[0], f), lerp(h[1], l[1], f)];
  });
}
const toPath = (pts) => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1)).join(' ');

const flatten = interpolate(
  [2.3, 3.5, 35.2, 36.8, 40.6, 41.8],
  [0, 1, 1, 0, 0, 1],
  Easing.easeInOutCubic
);

function SparkLine({ T, accent }) {
  const f = flatten(T);
  const pts = sparkGeom(f);
  const drawn = MOTION.draw(T, 0.25, 1.8);
  const lineOp = MOTION.band(T, 0.2, 0.7, 44.5, 45);
  const dotOpen = MOTION.band(T, 0.5, 0.9, 2.35, 2.75);
  const dotClose = MOTION.band(T, 36.5, 37.0, 40.7, 41.1);
  const progX = 120 + 1680 * clamp(T / TOTAL, 0, 1);

  return (
    <svg viewBox={'0 0 ' + W + ' ' + H} width={W} height={H}
         style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <path d={toPath(pts)} pathLength="1" fill="none"
            stroke={f > 0.5 ? 'rgba(16,35,29,.14)' : accent} strokeWidth={lerp(3.4, 1.6, f)}
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="1" strokeDashoffset={1 - drawn} opacity={lineOp} />
      {f > 0.5 && (
        <path d={toPath(pts)} pathLength="1" fill="none" stroke={accent} strokeWidth={1.8}
              strokeLinecap="round" strokeDasharray="1"
              strokeDashoffset={1 - clamp(T / TOTAL, 0, 1)} opacity={lineOp * (f - 0.5) * 2} />
      )}
      {pts.map((p, i) => {
        const last = i === SRC.length - 1;
        const popA = MOTION.enter(T, 0.55 + i * 0.19, 0.5, 0).p;
        const popB = MOTION.enter(T, 36.55 + i * 0.13, 0.45, 0).p;
        const o = Math.max(dotOpen * popA, dotClose * popB);
        if (o < 0.01) return null;
        return (
          <circle key={i} cx={p[0]} cy={p[1]} r={(last ? 10 : 6.5) * (0.6 + 0.4 * o)}
                  fill={last ? accent : C.bg} stroke={accent} strokeWidth={last ? 0 : 2.4}
                  opacity={o} />
        );
      })}
      <circle cx={progX} cy={990} r={7} fill={accent}
              opacity={f * MOTION.band(T, 3.7, 4.1, 44.4, 44.9)} />
    </svg>
  );
}

/* ---------- opening ---------- */

function Opening({ T }) {
  const o = MOTION.band(T, 2.55, 3.35, 4.05, 4.6);
  const e = MOTION.enter(T, 2.55, 1.0, 30);
  const l = MOTION.enter(T, 2.95, 1.0, 22);
  return (
    <div style={{ position: 'absolute', left: 160, top: 330, width: 1160, opacity: o,
                  transform: 'translateY(' + e.y.toFixed(2) + 'px)' }}>
      <div style={{ font: '500 25px ' + FONT, letterSpacing: '.24em', textTransform: 'uppercase',
                    color: C.muted, marginBottom: 36 }}>For business leaders</div>
      <div style={{ font: '600 96px ' + FONT, letterSpacing: '-0.032em', lineHeight: 1.06,
                    color: C.text, textWrap: 'pretty' }}>
        Make Sustainability<br />Your Strategic Advantage.
      </div>
      <div style={{ font: '400 34px ' + FONT, lineHeight: 1.5, color: C.soft, marginTop: 38,
                    maxWidth: 900, opacity: l.p, transform: 'translateY(' + l.y.toFixed(2) + 'px)' }}>
        Six ways an active sustainability strategy pays back.
      </div>
    </div>
  );
}

/* ---------- triple bottom line ---------- */

const RINGS = [
  { label: 'Planet', cx: 960, cy: 372, lx: 960, ly: 152 },
  { label: 'People', cx: 830, cy: 566, lx: 664, ly: 782 },
  { label: 'Profit', cx: 1090, cy: 566, lx: 1256, ly: 782 },
];

function Triple({ T, accent }) {
  const start = 4.4;
  const o = MOTION.band(T, start, start + 0.5, 10.3, 11.0);
  const colors = [accent, '#1f6d50', C.gold];
  const conv = animate({ from: 0, to: 1, start: 7.4, end: 8.6, ease: Easing.easeInOutCubic })(T);
  const core = MOTION.band(T, 8.0, 8.9, 10.3, 10.9);
  const cap = MOTION.enter(T, 8.5, 1.0, 20);
  const R = 168;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o }}>
      <svg viewBox={'0 0 ' + W + ' ' + H} width={W} height={H}
           style={{ position: 'absolute', inset: 0 }}>
        <circle cx={960} cy={502} r={74} fill={accent} opacity={core * 0.13} />
        {RINGS.map((r, i) => {
          const p = MOTION.draw(T, start + 0.1 + i * 0.42, 1.1);
          const cx = lerp(r.cx, 960 + (r.cx - 960) * 0.82, conv);
          const cy = lerp(r.cy, 502 + (r.cy - 502) * 0.82, conv);
          return (
            <circle key={i} cx={cx} cy={cy} r={R} pathLength="1" fill="none"
                    stroke={colors[i]} strokeWidth={2.2} strokeDasharray="1"
                    strokeDashoffset={1 - p} opacity={0.82}
                    transform={'rotate(-90 ' + cx + ' ' + cy + ')'} />
          );
        })}
        <circle cx={960} cy={502} r={7.5} fill={accent} opacity={core} />
      </svg>
      {RINGS.map((r, i) => (
        <div key={i} style={{ position: 'absolute', left: r.lx - 170, top: r.ly, width: 340,
                              textAlign: 'center', font: '500 32px ' + FONT,
                              letterSpacing: '.04em', color: C.text,
                              opacity: MOTION.enter(T, start + 0.5 + i * 0.42, 0.7, 0).p }}>
          {r.label}
        </div>
      ))}
      <div style={{ position: 'absolute', left: 360, top: 876, width: 1200, textAlign: 'center',
                    font: '400 33px ' + FONT, lineHeight: 1.4, color: C.soft, opacity: cap.p,
                    transform: 'translateY(' + cap.y.toFixed(2) + 'px)' }}>
        A better world, and a better business. One strategy pays into all three.
      </div>
    </div>
  );
}

/* ---------- the six advantages ---------- */

const CARDS = [
  {
    cue: 'Risk', n: '01', title: 'Risk & Compliance', sw: 1.8,
    icon: ['M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z', 'M9.5 12l1.8 1.8L15 10'],
    body: 'CSRD, the EU Taxonomy and supply-chain due-diligence law are moving from voluntary to mandatory. A strategy already in motion means less scramble when the deadline lands.',
  },
  {
    cue: 'Costs', n: '02', title: 'Lower Operating Costs', sw: 1.8,
    icon: ['M12 21c5-3 8-6.5 8-11a8 8 0 10-16 0c0 4.5 3 8 8 11z', 'M9.5 11.5l2 2 3.5-4'],
    body: 'Measuring emissions and resource use surfaces waste — energy, materials, logistics — that was invisible before. What gets measured usually gets managed down.',
  },
  {
    cue: 'Capital', n: '03', title: 'Access to Capital', sw: 3.2,
    icon: ['M5 19V10', 'M12 19V6', 'M19 19V13'],
    body: "Lenders and investors increasingly screen ESG performance before price. A credible rating — CDP, EcoVadis — opens financing that simply isn't there without one.",
  },
  {
    cue: 'Talent', n: '04', title: 'Talent Attraction', sw: 1.8,
    icon: ['M9 4.8a3.2 3.2 0 100 6.4 3.2 3.2 0 100-6.4z', 'M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6',
           'M16 8.5a3 3 0 110-6', 'M21 20c0-2.8-1.8-5-4.5-5.7'],
    body: "Sustainability commitments show up in where people choose to work. It's something candidates actively screen for, especially early- and mid-career hires.",
  },
  {
    cue: 'Market', n: '05', title: 'Market Access', sw: 1.8,
    icon: ['M12 3.5a8.5 8.5 0 100 17 8.5 8.5 0 100-17z', 'M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 100-9z',
           'M12 11a1 1 0 100 2 1 1 0 100-2z'],
    body: "Large clients increasingly require ESG data before they'll sign. RFIs, tenders and supplier questionnaires now carry real commercial weight, not just paperwork.",
  },
  {
    cue: 'Brand', n: '06', title: 'Brand & Trust', sw: 1.8,
    icon: ['M12 20s-7-4.4-9.3-9C1.3 7.8 3 5 6 5c2 0 3.3 1.1 4 2.2C10.7 6.1 12 5 14 5c3 0 4.7 2.8 3.3 6-2.3 4.6-9.3 9-9.3 9z'],
    body: 'Customers and partners notice the gap between claims and evidence. A real strategy is what lets a company make claims it can actually defend.',
  },
];

function Card({ T, start, data, accent }) {
  const o = MOTION.band(T, start + 0.02, start + 0.3, start + 3.56, start + 3.94);
  const u = T - start;
  const ic = MOTION.enter(u, 0.04, 0.42, 24);
  const ti = MOTION.enter(u, 0.16, 0.5, 30);
  const bo = MOTION.enter(u, 0.34, 0.58, 24);
  const rule = MOTION.enter(u, 0.2, 0.65, 0).p;
  const glow = MOTION.band(T, start + 0.05, start + 0.6, start + 2.5, start + 3.9);
  const glowK = animate({ from: 0.9, to: 1.5, start, end: start + 4, ease: Easing.easeOutSine })(T);
  const drift = -12 * clamp(u / 4, 0, 1);

  return (
    <div style={{ position: 'absolute', inset: 0, opacity: o,
                  transform: 'translateY(' + drift.toFixed(2) + 'px)' }}>
      <div style={{ position: 'absolute', left: 1364, top: 356, width: 360, height: 360,
                    borderRadius: '50%', background: accent, opacity: glow * 0.10,
                    filter: 'blur(40px)', transform: 'scale(' + glowK.toFixed(3) + ')' }} />
      <div style={{ position: 'absolute', left: 160, top: 284, font: '500 24px ' + FONT,
                    letterSpacing: '.26em', color: C.gold, opacity: ic.p }}>
        {data.n} <span style={{ color: C.muted, opacity: 0.55 }}>/ 06</span>
      </div>
      <svg viewBox="0 0 24 24" width={184} height={184} fill="none" stroke={accent}
           strokeWidth={data.sw} strokeLinecap="round" strokeLinejoin="round"
           style={{ position: 'absolute', left: 1452, top: 444, opacity: ic.p,
                    transform: 'translateY(' + ic.y.toFixed(2) + 'px)' }}>
        {data.icon.map((d, i) => (
          <path key={i} d={d} pathLength="1" strokeDasharray="1"
                strokeDashoffset={1 - MOTION.draw(u, 0.14 + i * 0.11, 0.7)} />
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 160, top: 340, height: 1,
                    width: (420 * rule).toFixed(1) + 'px', background: 'rgba(16,35,29,.16)' }} />
      <div style={{ position: 'absolute', left: 160, top: 376, width: 1120,
                    font: '600 86px ' + FONT, letterSpacing: '-0.032em', lineHeight: 1.08,
                    color: C.text, opacity: ti.p,
                    transform: 'translateY(' + ti.y.toFixed(2) + 'px)' }}>
        {data.title}
      </div>
      <div style={{ position: 'absolute', left: 160, top: 552, width: 940,
                    font: '400 36px ' + FONT, lineHeight: 1.5, color: C.soft,
                    textWrap: 'pretty', opacity: bo.p,
                    transform: 'translateY(' + bo.y.toFixed(2) + 'px)' }}>
        {data.body}
      </div>
    </div>
  );
}

/* ---------- close + contact ---------- */

function Close({ T }) {
  const e = MOTION.enter(T, 36.9, 0.9, 24);
  const o = MOTION.band(T, 36.9, 37.6, 40.5, 41.1);
  return (
    <div style={{ position: 'absolute', left: 160, top: 792, width: 1000, opacity: o,
                  transform: 'translateY(' + e.y.toFixed(2) + 'px)' }}>
      <div style={{ font: '600 68px ' + FONT, letterSpacing: '-0.028em', color: C.text }}>
        Small steps. Big impact.
      </div>
    </div>
  );
}

function Contact({ T, accent }) {
  const o = MOTION.band(T, 41.1, 41.6, 44.4, 44.95);
  const h = MOTION.enter(T, 41.15, 0.75, 30);
  const s = MOTION.enter(T, 41.45, 0.8, 24);
  const b1 = MOTION.enter(T, 41.8, 0.6, 18);
  const b2 = MOTION.enter(T, 41.98, 0.6, 18);
  const pill = {
    display: 'inline-flex', alignItems: 'center', borderRadius: 999,
    padding: '19px 32px', font: '500 27px ' + FONT, letterSpacing: '-0.01em',
  };
  return (
    <div style={{ position: 'absolute', left: 160, top: 296, width: 1240, opacity: o }}>
      <div style={{ font: '600 78px ' + FONT, letterSpacing: '-0.032em', lineHeight: 1.1,
                    color: C.text, opacity: h.p,
                    transform: 'translateY(' + h.y.toFixed(2) + 'px)' }}>
        Building this for your organisation?
      </div>
      <div style={{ font: '400 34px ' + FONT, lineHeight: 1.5, color: C.soft, marginTop: 34,
                    maxWidth: 960, textWrap: 'pretty', opacity: s.p,
                    transform: 'translateY(' + s.y.toFixed(2) + 'px)' }}>
        I help companies turn sustainability commitments into evidence — reporting, ratings
        and the systems behind them.
      </div>
      <div style={{ display: 'flex', gap: 20, marginTop: 60, flexWrap: 'wrap' }}>
        <div style={Object.assign({}, pill, {
          background: accent, color: '#ffffff', opacity: b1.p,
          transform: 'translateY(' + b1.y.toFixed(2) + 'px)',
          boxShadow: '0 16px 40px rgba(16,35,29,.12)',
        })}>Dakshmehta077@gmail.com</div>
        <div style={Object.assign({}, pill, {
          border: '1px solid rgba(43,140,103,.34)', color: accent, opacity: b2.p,
          transform: 'translateY(' + b2.y.toFixed(2) + 'px)',
        })}>linkedin.com/in/mehtadaksh</div>
      </div>
    </div>
  );
}

/* ---------- the one piece ---------- */

function Piece(props) {
  const { T, CUES } = useComposition();
  const accent = props.accent;
  const ken = animate({ from: 1, to: 1.024, start: 0, end: TOTAL, ease: Easing.linear })(T);
  const mark = MOTION.band(T, 3.0, 3.8, 44.5, 45);

  return (
    <div style={{ position: 'absolute', inset: 0, background: C.bg, overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0,
                    background: 'radial-gradient(90% 120% at 14% 10%, rgba(43,140,103,.07), transparent 62%)' }} />
      <div style={{ position: 'absolute', inset: 0, transformOrigin: '50% 50%',
                    transform: 'scale(' + ken.toFixed(4) + ')' }}>
        <SparkLine T={T} accent={accent} />

        {props.showWordmark && (
          <div style={{ position: 'absolute', left: 160, top: 88, font: '600 26px ' + FONT,
                        letterSpacing: '-0.01em', color: C.text, opacity: mark }}>
            Daksh Mehta
            <span style={{ color: C.muted, fontWeight: 400, marginLeft: 14 }}>
              CSR · ESG · Sustainability
            </span>
          </div>
        )}

        <Shot from={0} to={CUES.Triple + 0.7}><Opening T={T} /></Shot>
        <Shot from={CUES.Triple - 0.2} to={CUES.Risk + 0.1}><Triple T={T} accent={accent} /></Shot>
        {CARDS.map((c) => (
          <Shot key={c.cue} from={CUES[c.cue] - 0.1} to={CUES[c.cue] + 4.05}>
            <Card T={T} start={CUES[c.cue]} data={c} accent={accent} />
          </Shot>
        ))}
        <Shot from={CUES.Close} to={CUES.Contact + 0.3}><Close T={T} /></Shot>
        <Shot from={CUES.Contact - 0.2} to={TOTAL}><Contact T={T} accent={accent} /></Shot>
      </div>
    </div>
  );
}

function SusVideo() {
  const [t, setTweak] = useTweaks(window.TWEAK_DEFAULTS || {});
  const accent = t.accent || '#2b8c67';
  return (
    <React.Fragment>
      <CompositionStage width={W} height={H} bg={C.bg}
                        scenes={window.OM_SCENES} playback={window.OM_PLAYBACK}>
        <Piece accent={accent} showWordmark={t.showWordmark !== false} />
      </CompositionStage>
      <TweaksPanel>
        <TweakSection label="Video" />
        <TweakColor label="Accent" value={accent}
                    options={['#2b8c67', '#1f6d50', '#b8905a']}
                    onChange={(v) => setTweak('accent', v)} />
        <TweakToggle label="Wordmark" value={t.showWordmark !== false}
                     onChange={(v) => setTweak('showWordmark', v)} />
        <TweakSection label="Editing" />
        <TweakToggle label="Motion editor" value={t.motionEditor !== false}
                     onChange={(v) => setTweak('motionEditor', v)} />
      </TweaksPanel>
    </React.Fragment>
  );
}

window.SusVideo = SusVideo;
