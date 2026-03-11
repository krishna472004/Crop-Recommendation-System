import React, { useEffect, useState } from "react";

function CropAnalysis() {

  const [analysis, setAnalysis] = useState("Loading NDVI analysis...");

  useEffect(() => {

    const data = JSON.parse(localStorage.getItem("ndviData"));

    if (!data) {
      setAnalysis("No NDVI data found.");
      return;
    }

    const { location, lat, lon, week1, week2, week3, week4 } = data;

    const prompt = `You are a remote sensing and agricultural AI analyst specializing in vegetation health monitoring.

The user's location is:
- Location Name: ${location}
- Coordinates: Latitude ${lat}, Longitude ${lon}

Analyze the NDVI for the past 4 weeks at the given coordinates.

You must display the output EXACTLY in this format, no changes, no deviations:

══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                                   NDVI PLANT MONITORING ANALYSIS
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

Location      : ${location}

Coordinates   : ${lat}, ${lon}

══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                                      WEEKLY NDVI VALUES
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

  Week 1 NDVI Value  :  [value]  (Scale 0 → 1)

  Week 2 NDVI Value  :  [value]  (Scale 0 → 1)

  Week 3 NDVI Value  :  [value]  (Scale 0 → 1)

  Week 4 NDVI Value  :  [value]  (Scale 0 → 1)

══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                                        SUMMARY
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

  Average NDVI              :  [value]
  Monthly Health Percentage :  [average x 100]%
  Trend                     :  [Improving / Declining / Stable / Recovering]

After the summary section, display the visual representation exactly like this:

══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                                     NDVI VISUAL REPORT
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

Week 1  [squares]  [actual week 1 ndvi value]  [label]

Week 2  [squares]  [actual week 2 ndvi value]  [label]

Week 3  [squares]  [actual week 3 ndvi value]  [label]

Week 4  [squares]  [actual week 4 ndvi value]  [label]

══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════


Rule:
Total always 20 squares
🟩 green squares = round(actual ndvi value x 20)
🟥 red squares = 20 minus green squares
Use the real NDVI values you calculated for ${location}
Do not use example values, every location will have different squares

Label rule:
0.00-0.20 = Bare
0.21-0.40 = Sparse
0.41-0.60 = Moderate
0.61-0.80 = Healthy
0.81-1.00 = Dense
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════
                                                    PLANTATION HEALTH REPORT
══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

  [2 to 3 sentences describing how plantation health
  changed from Week 1 to Week 4, noting stress,
  growth, or recovery patterns]

══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════

Rules:
- Display output EXACTLY in the format shown above
- NDVI values between 0.00 and 1.00
- Average NDVI = mean of all 4 weeks
- Monthly Health Percentage = average x 100
- Base values on climate zone and season from coordinates
- Plain text only, no JSON, no code, no extra commentary`;

    fetch("http://localhost:5000/api/ndvi-analysis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ prompt })
    })
      .then(res => res.json())
      .then(data => {
        setAnalysis(data.result);
      })
      .catch(() => {
        setAnalysis("Failed to generate analysis.");
      });

  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#030d07",
      padding: "40px 100px 100px 100px",
      fontFamily: "monospace",
      backgroundImage: "radial-gradient(#00ff9c08 1px, transparent 1px)",
      backgroundSize: "32px 32px",
    }}>

      {/* Title */}
      <h2 style={{
        color: "#00ff9c",
        fontSize: "32px",
        fontWeight: 900,
        letterSpacing: "6px",
        textTransform: "uppercase",
        textShadow: "0 0 30px #00ff9c88",
        marginBottom: "6px",
      }}>
        NDVI Plantation Analysis
      </h2>
      <div style={{ color: "#00ff9c55", fontSize: "13px", letterSpacing: "4px", marginBottom: "32px" }}>
        4-WEEK VEGETATION INDEX REPORT
      </div>
      <div style={{ width: "100%", height: "1px", background: "linear-gradient(90deg, #00ff9c44, transparent)", marginBottom: "32px" }} />

      {/* Terminal Window */}
      <div style={{
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "0 0 80px #00ff9c11, 0 0 40px #00000088",
        border: "1px solid #00ff9c33",
      }}>

        {/* Terminal Header Bar */}
        <div style={{
          background: "#0a1f10",
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid #00ff9c22",
        }}>
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", display: "inline-block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#ffbd2e", display: "inline-block" }} />
          <span style={{ width: 13, height: 13, borderRadius: "50%", background: "#28ca41", display: "inline-block" }} />
          <span style={{ flex: 1, textAlign: "center", color: "#00ff9c66", fontSize: "12px", letterSpacing: "4px" }}>
            ◈ SATELLITE TERMINAL
          </span>
        </div>

        {/* Pre Content */}
        <pre style={{
          background: "#111",
          color: "#00ff9c",
          padding: "20px",
          borderRadius: "0 0 12px 12px",
          whiteSpace: "pre-wrap",
          fontSize: "25px",
          margin: 0,
          boxShadow: "0 0 40px #00ff9c11 inset",
          overflowX: "auto",
        }}>
          {analysis}
        </pre>

      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          div[style*="padding: 40px 100px"] {
            padding: 16px !important;
          }
        }
      `}</style>

    </div>
  );
}

export default CropAnalysis;