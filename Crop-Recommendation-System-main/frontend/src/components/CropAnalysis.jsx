import React, { useCallback, useEffect, useMemo, useState } from "react";

const pageStyle = {
  minHeight: "100vh",
  background:
    "radial-gradient(circle at top left, rgba(76,175,80,0.16), transparent 30%), linear-gradient(180deg, #06110a 0%, #0b1d13 45%, #112d1d 100%)",
  padding: "34px 18px 80px",
  color: "#f7f1e6",
  fontFamily: "'DM Sans', sans-serif"
};

const shellStyle = {
  maxWidth: "1280px",
  margin: "0 auto"
};

const cardStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "24px",
  boxShadow: "0 14px 40px rgba(0,0,0,0.28)"
};

function statusTone(status) {
  const value = (status || "").toLowerCase();
  if (value === "dense") return "#80e27e";
  if (value === "healthy") return "#55c96d";
  if (value === "moderate") return "#f1bb58";
  if (value === "sparse") return "#f08e59";
  return "#dd5c5c";
}

function logTone(level) {
  if (level === "success") return "#71d36b";
  if (level === "warning") return "#f1bb58";
  if (level === "error") return "#f16a6a";
  return "#8ccf9d";
}

function formatStamp(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

function buildPolylinePoints(reports, width, height, padding) {
  if (!reports.length) return "";

  const stepX = reports.length === 1 ? 0 : (width - padding * 2) / (reports.length - 1);

  return reports
    .map((report, index) => {
      const x = padding + index * stepX;
      const y = height - padding - report.ndviValue * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");
}

function NDVIGraph({ reports }) {
  const width = 760;
  const height = 280;
  const padding = 28;
  const sortedReports = [...reports].reverse();
  const polylinePoints = buildPolylinePoints(sortedReports, width, height, padding);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} style={{ width: "100%", height: "280px" }}>
      {[0.2, 0.4, 0.6, 0.8].map((mark) => {
        const y = height - padding - mark * (height - padding * 2);
        return (
          <g key={mark}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="rgba(255,255,255,0.08)" strokeDasharray="5 5" />
            <text x={8} y={y + 4} fill="rgba(247,241,230,0.55)" fontSize="11">
              {mark.toFixed(1)}
            </text>
          </g>
        );
      })}

      <polyline
        fill="none"
        stroke="#72d46b"
        strokeWidth="4"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={polylinePoints}
      />

      {sortedReports.map((report, index) => {
        const stepX = sortedReports.length === 1 ? 0 : (width - padding * 2) / (sortedReports.length - 1);
        const x = padding + index * stepX;
        const y = height - padding - report.ndviValue * (height - padding * 2);

        return (
          <g key={report.id || report.reportKey || index}>
            <circle cx={x} cy={y} r="5" fill={statusTone(report.status)} />
            <text x={x} y={height - 10} textAnchor="middle" fill="rgba(247,241,230,0.62)" fontSize="10">
              {report.reportKey?.slice(11, 16) || report.reportDate}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function CropAnalysis({ onBack }) {
  const [payload, setPayload] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [triggering, setTriggering] = useState(false);

  const saved = useMemo(() => JSON.parse(localStorage.getItem("ndviData")), []);

  const loadData = useCallback(async () => {
    if (!saved?.plantationId) {
      setError("No plantation selected. Save a plantation from the map first.");
      setLoading(false);
      return;
    }

    try {
      const [healthRes, logsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/health/${saved.plantationId}`),
        fetch(`http://localhost:5000/api/ndvi/logs/${saved.plantationId}`)
      ]);

      const health = await healthRes.json();
      const logPayload = await logsRes.json();

      if (health.error) {
        throw new Error(health.error);
      }

      setPayload({
        ...health,
        logs: logPayload.logs || [],
        saved
      });
      setError("");
    } catch (fetchError) {
      setError(fetchError.message || "Failed to load NDVI history.");
    } finally {
      setLoading(false);
    }
  }, [saved]);

  useEffect(() => {
    loadData();
    const intervalId = window.setInterval(loadData, 30000);
    return () => window.clearInterval(intervalId);
  }, [loadData]);

  const handleTrigger = async () => {
    if (!saved?.plantationId) return;

    setTriggering(true);

    try {
      const response = await fetch(`http://localhost:5000/api/ndvi/run-now/${saved.plantationId}`, {
        method: "POST"
      });
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      await loadData();
    } catch (runError) {
      setError(runError.message || "Failed to trigger NDVI run.");
    } finally {
      setTriggering(false);
    }
  };

  const plantation = payload?.plantation || {};
  const reports = payload?.reports || [];
  const logs = payload?.logs || [];
  const recentReports = reports.slice(0, 18);
  const latestReport = payload?.latestReport || reports[0];

  const weekly = useMemo(() => {
    if (!payload) {
      return [];
    }

    return [
      { label: "Week 1", value: Number(payload.week1 || 0) },
      { label: "Week 2", value: Number(payload.week2 || 0) },
      { label: "Week 3", value: Number(payload.week3 || 0) },
      { label: "Week 4", value: Number(payload.week4 || 0) }
    ];
  }, [payload]);

  if (loading) {
    return <div style={pageStyle}><div style={shellStyle}>Loading NDVI monitoring dashboard...</div></div>;
  }

  if (error && !payload) {
    return <div style={pageStyle}><div style={shellStyle}>{error}</div></div>;
  }

  return (
    <div style={pageStyle}>
      <div style={shellStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap", marginBottom: "26px" }}>
          <div>
            <div style={{ color: "#9fc79c", letterSpacing: "0.18em", fontSize: "0.72rem", textTransform: "uppercase", marginBottom: "10px" }}>
              NDVI Monitoring Center
            </div>
            <h1 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}>
              {plantation.name || saved?.plantationName}
            </h1>
            <p style={{ color: "rgba(247,241,230,0.74)", marginTop: "10px", maxWidth: "760px", lineHeight: 1.7 }}>
              {plantation.locationName || saved?.location} • Continuous monitoring data is stored in MongoDB, shown in logs below, and the scheduler is set to run every minute for testing.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={onBack}
              style={{ padding: "12px 16px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#fff", cursor: "pointer" }}
            >
              Back to Main
            </button>
            <button
              onClick={handleTrigger}
              disabled={triggering}
              style={{ padding: "12px 18px", borderRadius: "12px", border: "none", background: "#4caf50", color: "#07110a", fontWeight: 700, cursor: "pointer" }}
            >
              {triggering ? "Triggering..." : "Run Monitoring Now"}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ ...cardStyle, padding: "14px 18px", marginBottom: "18px", color: "#ffb9b9" }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "20px" }}>
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ color: "#9fc79c", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Monthly Health</div>
            <div style={{ fontSize: "2rem", marginTop: "8px", fontWeight: 700 }}>{payload?.plantationHealth}</div>
          </div>
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ color: "#9fc79c", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Latest NDVI</div>
            <div style={{ fontSize: "2rem", marginTop: "8px", fontWeight: 700 }}>{latestReport?.ndviValue?.toFixed?.(3) || "0.000"}</div>
          </div>
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ color: "#9fc79c", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Email Reports</div>
            <div style={{ fontSize: "1rem", marginTop: "12px", fontWeight: 600 }}>{plantation.email || saved?.email}</div>
          </div>
          <div style={{ ...cardStyle, padding: "20px" }}>
            <div style={{ color: "#9fc79c", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Scheduler Mode</div>
            <div style={{ fontSize: "1rem", marginTop: "12px", fontWeight: 600 }}>Every 1 minute</div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.9fr", gap: "18px", marginBottom: "20px" }}>
          <div style={{ ...cardStyle, padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "14px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem" }}>NDVI Trend Graph</div>
                <div style={{ color: "rgba(247,241,230,0.62)" }}>Recent monitoring readings for better trend visibility</div>
              </div>
              <div style={{ display: "inline-flex", padding: "6px 12px", borderRadius: "999px", background: "rgba(255,255,255,0.08)", color: statusTone(latestReport?.status) }}>
                {latestReport?.status || "No data"}
              </div>
            </div>
            <NDVIGraph reports={recentReports} />
          </div>

          <div style={{ ...cardStyle, padding: "22px" }}>
            <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", marginBottom: "16px" }}>4-Week Snapshot</div>
            <div style={{ display: "grid", gap: "12px" }}>
              {weekly.map((week) => (
                <div key={week.label} style={{ background: "rgba(0,0,0,0.16)", borderRadius: "16px", padding: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <strong>{week.label}</strong>
                    <span>{week.value.toFixed(3)}</span>
                  </div>
                  <div style={{ height: "8px", borderRadius: "999px", background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                    <div style={{ width: `${Math.max(0, Math.min(100, week.value * 100))}%`, height: "100%", background: `linear-gradient(90deg, ${statusTone("sparse")}, ${statusTone("dense")})` }} />
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "18px", padding: "14px", borderRadius: "16px", background: "rgba(255,255,255,0.04)" }}>
              <div style={{ color: "rgba(247,241,230,0.6)", marginBottom: "6px" }}>Latest summary</div>
              <div style={{ lineHeight: 1.7 }}>{latestReport?.summary || "No report available yet."}</div>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "18px" }}>
          <div style={{ ...cardStyle, padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem" }}>Past NDVI Stats</div>
                <div style={{ color: "rgba(247,241,230,0.62)" }}>Stored report history with email and source details</div>
              </div>
              <div style={{ color: "#9fc79c", fontFamily: "monospace" }}>{reports.length} records</div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.92rem" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.05)" }}>
                    {["Timestamp", "NDVI", "Status", "Trend", "Source", "Email"].map((heading) => (
                      <th key={heading} style={{ textAlign: "left", padding: "12px 14px", color: "#9fc79c", fontSize: "0.74rem", letterSpacing: "0.08em", textTransform: "uppercase" }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                      <td style={{ padding: "12px 14px" }}>{formatStamp(report.createdAt || report.reportKey)}</td>
                      <td style={{ padding: "12px 14px", fontFamily: "monospace" }}>{report.ndviValue.toFixed(3)}</td>
                      <td style={{ padding: "12px 14px", color: statusTone(report.status), fontWeight: 700 }}>{report.status}</td>
                      <td style={{ padding: "12px 14px" }}>{report.trend}</td>
                      <td style={{ padding: "12px 14px" }}>{report.source}</td>
                      <td style={{ padding: "12px 14px" }}>{report.emailSentAt ? "Sent" : "Pending"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div style={{ ...cardStyle, padding: "22px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "16px", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem" }}>Monitoring Logs</div>
                <div style={{ color: "rgba(247,241,230,0.62)" }}>Continuous processing and email activity</div>
              </div>
              <div style={{ color: "#9fc79c", fontFamily: "monospace" }}>{logs.length} logs</div>
            </div>

            <div style={{ display: "grid", gap: "10px", maxHeight: "620px", overflowY: "auto", paddingRight: "4px" }}>
              {logs.map((log) => (
                <div key={log.id} style={{ background: "rgba(0,0,0,0.18)", borderRadius: "16px", padding: "14px 16px", borderLeft: `4px solid ${logTone(log.level)}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center", marginBottom: "6px" }}>
                    <div style={{ color: logTone(log.level), fontWeight: 700, textTransform: "capitalize" }}>{log.level}</div>
                    <div style={{ color: "rgba(247,241,230,0.55)", fontSize: "0.82rem" }}>{formatStamp(log.createdAt)}</div>
                  </div>
                  <div style={{ lineHeight: 1.6 }}>{log.message}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
