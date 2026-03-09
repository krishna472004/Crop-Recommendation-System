// CropReportPage.jsx
// Drop this file in src/components/ and import it in App.jsx
// Usage: <CropReportPage analysis={analysis} onClose={() => setShowReport(false)} />

const reportStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,600&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  :root {
    --ink:        #1A1208;
    --ink-mid:    #3D2810;
    --ink-soft:   #7A5535;
    --gold:       #C8882A;
    --gold-lt:    #EDB84A;
    --green:      #2E5E28;
    --green-lt:   #4E9444;
    --green-pale: #C8E8C2;
    --cream:      #FAF5E8;
    --cream-dk:   #F0E8D0;
    --sand:       #DEC89A;
    --sand-lt:    #EDD9B2;
    --white:      #FFFFFF;
    --page-bg:    #F5EFE0;
  }

  .rp-overlay {
    position: fixed; inset: 0; z-index: 999;
    background: var(--page-bg);
    overflow-y: auto;
    font-family: 'DM Sans', sans-serif;
    color: var(--ink);
    animation: rpFade .35s ease;
  }
  @keyframes rpFade { from{opacity:0;} to{opacity:1;} }

  /* ── REPORT HEADER ── */
  .rp-header {
    background: linear-gradient(135deg, #1A0E06 0%, #3D2810 55%, #6B3E1A 100%);
    padding: 0;
    position: relative; overflow: hidden;
  }
  .rp-header::after {
    content: '';
    position: absolute; bottom:0; left:0; right:0; height:3px;
    background: linear-gradient(90deg, var(--green), var(--gold), var(--green-lt), var(--gold-lt));
  }
  .rp-header-inner {
    max-width: 960px; margin: 0 auto;
    padding: 40px 32px 36px;
    display: flex; align-items: flex-start; justify-content: space-between; gap: 20px;
    position: relative; z-index: 1;
  }
  .rp-header::before {
    content: '';
    position: absolute; inset: 0;
    background: radial-gradient(ellipse at 80% 50%, rgba(200,136,42,.12) 0%, transparent 55%);
  }
  .rp-logo-area {}
  .rp-report-label {
    font-family: 'DM Mono', monospace; font-size: .68rem;
    letter-spacing: .14em; text-transform: uppercase;
    color: rgba(237,184,74,.6); margin-bottom: 8px;
    display: flex; align-items: center; gap: 8px;
  }
  .rp-report-label::before {
    content: ''; width: 24px; height: 1px; background: rgba(237,184,74,.35);
  }
  .rp-main-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.6rem, 3.5vw, 2.3rem);
    font-weight: 900; color: var(--cream); line-height: 1.15;
  }
  .rp-main-title em { font-style: italic; color: var(--gold-lt); }
  .rp-close-btn {
    background: rgba(255,255,255,.07);
    border: 1px solid rgba(255,255,255,.15);
    color: rgba(250,245,232,.7);
    padding: 9px 20px; border-radius: 8px;
    font-family: 'DM Sans', sans-serif; font-size: .85rem; font-weight: 500;
    cursor: pointer; white-space: nowrap; flex-shrink: 0;
    transition: background .15s, color .15s;
    display: flex; align-items: center; gap: 7px;
    margin-top: 4px;
  }
  .rp-close-btn:hover { background: rgba(255,255,255,.13); color: var(--cream); }

  /* ── PAGE BODY ── */
  .rp-body {
    max-width: 960px; margin: 0 auto;
    padding: 36px 32px 80px;
    display: flex; flex-direction: column; gap: 28px;
  }

  /* ── SECTION LABEL ── */
  .rp-section-label {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 14px;
  }
  .rp-section-icon {
    width: 36px; height: 36px; border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1rem; flex-shrink: 0;
  }
  .rp-section-icon.gold  { background: rgba(200,136,42,.12); }
  .rp-section-icon.green { background: rgba(46,94,40,.1); }
  .rp-section-icon.earth { background: rgba(74,44,20,.1); }
  .rp-section-icon.dark  { background: rgba(20,50,28,.15); }
  .rp-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem; font-weight: 700; color: var(--ink);
  }
  .rp-section-rule { flex:1; height:1px; background: var(--sand-lt); }

  /* ── BEST CROP BOX ── */
  .rp-best-box {
    background: linear-gradient(135deg, #1A0E06 0%, #3A2010 100%);
    border-radius: 18px; overflow: hidden; position: relative;
    box-shadow: 0 6px 28px rgba(26,14,6,.28);
  }
  .rp-best-box::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 85% 20%, rgba(200,136,42,.15) 0%, transparent 50%),
      radial-gradient(ellipse at 10% 80%, rgba(46,94,40,.12) 0%, transparent 45%);
  }
  .rp-best-inner {
    position: relative; z-index: 1;
    display: grid; grid-template-columns: 1fr auto;
    gap: 0; align-items: stretch;
  }
  .rp-best-left { padding: 28px 28px 24px; border-right: 1px solid rgba(255,255,255,.06); }
  .rp-best-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(237,184,74,.14); border: 1px solid rgba(237,184,74,.28);
    color: var(--gold-lt); font-family: 'DM Mono', monospace;
    font-size: .65rem; letter-spacing: .12em; text-transform: uppercase;
    padding: 3px 11px; border-radius: 100px; margin-bottom: 10px;
  }
  .rp-best-name {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; font-weight: 900;
    color: var(--cream); line-height: 1.1; margin-bottom: 16px;
  }
  .rp-why-label {
    font-family: 'DM Mono', monospace; font-size: .65rem;
    letter-spacing: .1em; text-transform: uppercase;
    color: rgba(200,232,194,.45); margin-bottom: 9px;
  }
  .rp-why-list { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 7px; }
  .rp-why-item { display: flex; align-items: flex-start; gap: 9px; }
  .rp-why-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 8px; }
  .rp-why-text { font-size: .9rem; color: rgba(250,245,232,.7); line-height: 1.7; font-weight: 300; }

  .rp-best-right {
    padding: 28px 24px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px;
    min-width: 130px;
  }
  .rp-medal { font-size: 2.2rem; }
  .rp-conf-ring-wrap { position: relative; width: 80px; height: 80px; }
  .rp-conf-svg { width: 80px; height: 80px; transform: rotate(-90deg); }
  .rp-conf-bg { fill: none; stroke: rgba(255,255,255,.1); stroke-width: 6; }
  .rp-conf-arc { fill: none; stroke: var(--gold); stroke-width: 6; stroke-linecap: round; transition: stroke-dashoffset 1s ease; }
  .rp-conf-num {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
  }
  .rp-conf-pct { font-family: 'DM Mono', monospace; font-size: 1.2rem; font-weight: 500; color: var(--gold-lt); }
  .rp-conf-lbl { font-size: .6rem; color: rgba(250,245,232,.4); font-family: 'DM Mono', monospace; letter-spacing: .06em; }

  /* ── THREE-COLUMN GRID for crops ── */
  .rp-three-col {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  @media(max-width:750px){ .rp-three-col{ grid-template-columns:1fr; } }
  @media(min-width:751px) and (max-width:900px){ .rp-three-col{ grid-template-columns:repeat(2,1fr); } }

  /* ── CROP TABLE CARD ── */
  .rp-crop-table {
    background: var(--white); border-radius: 14px;
    border: 1px solid var(--sand-lt);
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(26,14,6,.08);
    display: flex; flex-direction: column;
  }
  .rp-crop-table-head {
    padding: 13px 18px 11px;
    background: var(--cream-dk);
    border-bottom: 2px solid var(--sand);
    display: flex; align-items: center; gap: 8px;
  }
  .rp-crop-table-icon { font-size: .95rem; }
  .rp-crop-table-title {
    font-family: 'Playfair Display', serif;
    font-size: .95rem; font-weight: 700; color: var(--ink-mid);
    flex: 1;
  }
  .rp-crop-table-count {
    font-family: 'DM Mono', monospace; font-size: .68rem; font-weight: 500;
    background: var(--sand-lt); color: var(--ink-soft);
    padding: 2px 9px; border-radius: 100px;
  }
  .rp-crop-table-body { flex: 1; }

  /* each crop row inside a table card */
  .rp-crop-item {
    padding: 14px 18px;
    border-bottom: 1px solid rgba(222,200,154,.35);
    display: flex; flex-direction: column; gap: 6px;
  }
  .rp-crop-item:last-child { border-bottom: none; }
  .rp-crop-item:hover { background: rgba(240,232,208,.3); }

  .rp-ci-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .rp-ci-num {
    font-family: 'Playfair Display', serif; font-size: 1rem; font-weight: 900;
    color: var(--sand); line-height: 1; flex-shrink: 0; padding-top: 2px;
  }
  .rp-ci-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.05rem; font-weight: 700; color: var(--ink); flex: 1; line-height: 1.2;
  }
  .rp-ci-conf {
    font-family: 'DM Mono', monospace; font-size: .72rem; font-weight: 500;
    padding: 3px 9px; border-radius: 100px; white-space: nowrap; flex-shrink: 0;
  }
  .rp-ci-conf.hi  { background: rgba(46,94,40,.1);  color: var(--green);    border: 1px solid rgba(46,94,40,.2); }
  .rp-ci-conf.mid { background: rgba(200,136,42,.1); color: var(--gold);     border: 1px solid rgba(200,136,42,.2); }
  .rp-ci-conf.lo  { background: rgba(122,85,53,.08); color: var(--ink-soft); border: 1px solid rgba(122,85,53,.15); }

  .rp-ci-reasons { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 4px; }
  .rp-ci-reason  { display: flex; align-items: flex-start; gap: 7px; font-size: .8rem; color: var(--ink-soft); line-height: 1.6; }
  .rp-ci-rdot    { width: 4px; height: 4px; border-radius: 50%; flex-shrink: 0; margin-top: 8px; }
  .rp-ci-rdot.g  { background: var(--green-lt); }
  .rp-ci-rdot.a  { background: var(--gold); }
  .rp-ci-rdot.b  { background: var(--sand); }

  /* confidence mini bar */
  .rp-ci-bar { height: 3px; background: var(--sand-lt); border-radius: 100px; margin-top: 2px; overflow: hidden; }
  .rp-ci-bar-fill { height: 100%; border-radius: 100px; }
  .rp-ci-bar-fill.g { background: linear-gradient(90deg, var(--green), var(--green-lt)); }
  .rp-ci-bar-fill.a { background: linear-gradient(90deg, var(--gold), var(--gold-lt)); }

  /* ── AI BOX ── */
  .rp-ai-box {
    background: linear-gradient(140deg, #0C1E12 0%, #162E1C 100%);
    border-radius: 18px; overflow: hidden; position: relative;
    box-shadow: 0 6px 28px rgba(12,30,18,.3);
  }
  .rp-ai-box::before {
    content: ''; position: absolute; inset: 0;
    background:
      radial-gradient(ellipse at 0% 0%, rgba(78,148,68,.12) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba(200,136,42,.08) 0%, transparent 50%);
  }
  .rp-ai-head {
    display: flex; align-items: center; gap: 13px;
    padding: 20px 26px 16px;
    border-bottom: 1px solid rgba(255,255,255,.06);
    position: relative; z-index: 1;
  }
  .rp-ai-icon {
    width: 40px; height: 40px; border-radius: 10px;
    background: rgba(78,148,68,.18); border: 1px solid rgba(78,148,68,.28);
    display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;
  }
  .rp-ai-title { font-family: 'Playfair Display', serif; font-size: 1.05rem; font-weight: 700; color: var(--green-pale); }
  .rp-ai-sub   { font-size: .68rem; color: rgba(200,232,194,.4); font-family: 'DM Mono', monospace; letter-spacing: .06em; margin-top: 2px; }

  .rp-ai-body {
    padding: 20px 26px 26px;
    position: relative; z-index: 1;
    display: flex; flex-direction: column; gap: 13px;
  }
  .rp-ai-step { display: flex; align-items: flex-start; gap: 13px; }
  .rp-ai-stepnum {
    width: 26px; height: 26px; border-radius: 50%;
    background: rgba(200,136,42,.17); border: 1px solid rgba(200,136,42,.28);
    display: flex; align-items: center; justify-content: center;
    font-family: 'DM Mono', monospace; font-size: .68rem; font-weight: 500;
    color: var(--gold-lt); flex-shrink: 0; margin-top: 1px;
  }
  .rp-ai-steptext { font-size: .88rem; color: rgba(250,245,232,.72); line-height: 1.75; font-weight: 300; }
  .rp-ai-ctag {
    display: inline-flex; align-items: center;
    background: rgba(46,94,40,.22); border: 1px solid rgba(78,148,68,.25);
    color: var(--green-pale); font-size: .74rem; font-weight: 500;
    padding: 2px 8px; border-radius: 100px; margin: 1px 2px;
  }

  /* ── BACK BUTTON (bottom) ── */
  .rp-back-wrap { display: flex; justify-content: center; padding-top: 10px; }
  .rp-back-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--ink); color: var(--cream);
    border: none; border-radius: 10px;
    padding: 13px 32px; font-family: 'DM Sans', sans-serif;
    font-size: .95rem; font-weight: 600; cursor: pointer;
    box-shadow: 0 4px 16px rgba(26,14,6,.22);
    transition: background .15s, transform .1s;
  }
  .rp-back-btn:hover { background: var(--ink-mid); transform: translateY(-1px); }

  @media(max-width:600px){
    .rp-header-inner { flex-direction: column; }
    .rp-best-inner   { grid-template-columns: 1fr; }
    .rp-best-right   { border-top: 1px solid rgba(255,255,255,.06); flex-direction: row; padding: 18px 24px; }
    .rp-body { padding: 22px 16px 60px; }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function ccls(v) { return !v ? "lo" : v >= 75 ? "hi" : v >= 62 ? "mid" : "lo"; }
function cbar(v) { return v >= 70 ? "g" : "a"; }

function splitBullets(text) {
  if (!text) return [];
  const parts = text.split(/(?<=[a-zA-Z\)])[,;]\s+/).map(s => s.trim()).filter(Boolean);
  return parts.length > 1 ? parts : [text];
}

function toSteps(text) {
  if (!text) return [];
  return (text.match(/[^.!?]+[.!?]+/g) || [text]).map(s => s.trim()).filter(Boolean);
}

function highlightCrops(sentence, names) {
  if (!names?.length) return sentence;
  const out = []; let rest = sentence; let hit = false;
  for (const n of names) {
    const i = rest.toLowerCase().indexOf(n.toLowerCase());
    if (i !== -1) {
      if (i > 0) out.push(rest.slice(0, i));
      out.push(<span key={n + i} className="rp-ai-ctag">{rest.slice(i, i + n.length)}</span>);
      rest = rest.slice(i + n.length); hit = true;
    }
  }
  out.push(rest);
  return hit ? out : sentence;
}

// circumference for SVG ring: r=34 → C ≈ 213.6
const CIRC = 2 * Math.PI * 34;

// ── Component ─────────────────────────────────────────────────────────────────
export default function CropReportPage({ analysis, onClose }) {
  if (!analysis) return null;

  const allNames = [
    analysis.best_crop?.name,
    ...(analysis.top_5_crops || []).map(c => c.name),
    ...(analysis.alternate_top_5_crops || []).map(c => c.name),
    ...(analysis.other_possible_crops || []).map(c => c.name),
  ].filter(Boolean);

  const conf = analysis.best_crop?.confidence ?? 0;
  const dashOffset = CIRC - (CIRC * conf) / 100;

  // ── Reusable crop table card ──
  const CropTableCard = ({ icon, title, crops, dotColor, iconClass }) => (
    <div className="rp-crop-table">
      <div className="rp-crop-table-head">
        <span className="rp-crop-table-icon">{icon}</span>
        <span className="rp-crop-table-title">{title}</span>
        <span className="rp-crop-table-count">{crops.length}</span>
      </div>
      <div className="rp-crop-table-body">
        {crops.map((crop, idx) => (
          <div className="rp-crop-item" key={idx}>
            <div className="rp-ci-top">
              {crop.confidence != null && <span className="rp-ci-num">#{idx + 1}</span>}
              <span className="rp-ci-name">{crop.name}</span>
              {crop.confidence != null && (
                <span className={`rp-ci-conf ${ccls(crop.confidence)}`}>{crop.confidence}%</span>
              )}
            </div>
            {crop.confidence != null && (
              <div className="rp-ci-bar">
                <div className={`rp-ci-bar-fill ${cbar(crop.confidence)}`}
                  style={{ width: `${crop.confidence}%` }} />
              </div>
            )}
            {crop.reason && (
              <ul className="rp-ci-reasons">
                {splitBullets(crop.reason).map((b, bi) => (
                  <li key={bi} className="rp-ci-reason">
                    <span className={`rp-ci-rdot ${dotColor}`} />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style>{reportStyles}</style>
      <div className="rp-overlay" id="rp-overlay">

        {/* Header */}
        <div className="rp-header">
          <div className="rp-header-inner">
            <div className="rp-logo-area">
              <div className="rp-report-label">Crop Analysis Report</div>
              <div className="rp-main-title">
                <em>Cultivation</em> Recommendation<br />Summary
              </div>
            </div>
            <button className="rp-close-btn" onClick={onClose}>
              ← Back to Map
            </button>
          </div>
        </div>

        <div className="rp-body">

          {/* ── BEST CROP ── */}
          {analysis.best_crop && (
            <div>
              <div className="rp-section-label">
                <div className="rp-section-icon gold">🏆</div>
                <div className="rp-section-title">Best Crop</div>
                <div className="rp-section-rule" />
              </div>
              <div className="rp-best-box">
                <div className="rp-best-inner">
                  <div className="rp-best-left">
                    <div className="rp-best-badge">⭐ Top Recommendation</div>
                    <div className="rp-best-name">{analysis.best_crop.name}</div>
                    {analysis.best_crop.reason && (
                      <>
                        <div className="rp-why-label">Why this crop?</div>
                        <ul className="rp-why-list">
                          {splitBullets(analysis.best_crop.reason).map((b, i) => (
                            <li key={i} className="rp-why-item">
                              <span className="rp-why-dot" />
                              <span className="rp-why-text">{b}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                  <div className="rp-best-right">
                    <div className="rp-medal">🌾</div>
                    <div className="rp-conf-ring-wrap">
                      <svg className="rp-conf-svg" viewBox="0 0 80 80">
                        <circle className="rp-conf-bg" cx="40" cy="40" r="34" />
                        <circle
                          className="rp-conf-arc"
                          cx="40" cy="40" r="34"
                          strokeDasharray={CIRC}
                          strokeDashoffset={dashOffset}
                        />
                      </svg>
                      <div className="rp-conf-num">
                        <span className="rp-conf-pct">{conf}%</span>
                        <span className="rp-conf-lbl">match</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── THREE COLUMN CROP TABLES ── */}
          {(analysis.top_5_crops?.length > 0 ||
            analysis.alternate_top_5_crops?.length > 0 ||
            analysis.other_possible_crops?.length > 0) && (
            <div>
              <div className="rp-section-label">
                <div className="rp-section-icon green">🌱</div>
                <div className="rp-section-title">Crop Recommendations</div>
                <div className="rp-section-rule" />
              </div>
              <div className="rp-three-col">
                {analysis.top_5_crops?.length > 0 && (
                  <CropTableCard
                    icon="🌱" title="Top Crops"
                    crops={analysis.top_5_crops}
                    dotColor="g" iconClass="green"
                  />
                )}
                {analysis.alternate_top_5_crops?.length > 0 && (
                  <CropTableCard
                    icon="🌿" title="Alternate Crops"
                    crops={analysis.alternate_top_5_crops}
                    dotColor="a" iconClass="gold"
                  />
                )}
                {analysis.other_possible_crops?.length > 0 && (
                  <CropTableCard
                    icon="🌾" title="Other Possible Crops"
                    crops={analysis.other_possible_crops}
                    dotColor="b" iconClass="earth"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── AI RECOMMENDATION ── */}
          {analysis.aiRecommendation && (
            <div>
              <div className="rp-section-label">
                <div className="rp-section-icon dark">🤖</div>
                <div className="rp-section-title">AI Cultivation Guidance</div>
                <div className="rp-section-rule" />
              </div>
              <div className="rp-ai-box">
                <div className="rp-ai-head">
                  <div className="rp-ai-icon">🤖</div>
                  <div>
                    <div className="rp-ai-title">Smart Crop Insight</div>
                    <div className="rp-ai-sub">Step-by-step cultivation guidance</div>
                  </div>
                </div>
                <div className="rp-ai-body">
                  {toSteps(analysis.aiRecommendation).map((step, i) => (
                    <div className="rp-ai-step" key={i}>
                      <div className="rp-ai-stepnum">{i + 1}</div>
                      <p className="rp-ai-steptext">{highlightCrops(step, allNames)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Back button */}
          <div className="rp-back-wrap">
            <button className="rp-back-btn" onClick={onClose}>
              ← Back to Analysis
            </button>
          </div>

        </div>
      </div>
    </>
  );
}