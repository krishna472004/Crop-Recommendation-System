import React, { useState } from "react";
import axios from "axios";
import MapSelector from "./components/MapSelector.jsx";
import CropAnalysis from "./components/CropAnalysis";
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --soil:      #3b1f0a;
    --earth:     #6b3f1a;
    --bark:      #8b5a2b;
    --wheat:     #d4a843;
    --sunlight:  #f5c842;
    --leaf:      #2d6a2f;
    --sprout:    #4caf50;
    --meadow:    #76c442;
    --sky:       #c8e6c9;
    --cream:     #fdf6e3;
    --card-bg:   rgba(255,255,255,0.06);
    --radius:    18px;
    --shadow:    0 8px 40px rgba(0,0,0,0.35);
    --glow:      0 0 30px rgba(118,196,66,0.25);
    --harvest:        #D48B2C;
    --harvest-light:  #F0B84A;
    --leaf-light:     #5A9E4F;
    --leaf-pale:      #A8D5A2;
  }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--soil);
    color: var(--cream);
    min-height: 100vh;
    overflow-x: hidden;
  }

  /* ANIMATED BACKGROUND */
  #app-root {
    position: relative;
    min-height: 100vh;
    background:
      radial-gradient(ellipse 80% 60% at 10% 0%, rgba(76,175,80,0.18) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 90% 100%, rgba(212,168,67,0.14) 0%, transparent 55%),
      linear-gradient(160deg, #1a0a02 0%, #2d1507 40%, #1e3a1f 100%);
  }

  /* Floating particles */
  .particle {
    position: fixed;
    border-radius: 50%;
    pointer-events: none;
    opacity: 0;
    animation: floatUp linear infinite;
  }
  @keyframes floatUp {
    0%   { opacity: 0; transform: translateY(0) scale(0.5); }
    10%  { opacity: 0.6; }
    90%  { opacity: 0.3; }
    100% { opacity: 0; transform: translateY(-100vh) scale(1.2); }
  }

  /* HEADER */
  .header-section {
    width: 100%;
    padding: 70px 40px 50px;
    text-align: center;
    position: relative;
    background: linear-gradient(180deg, rgba(0,0,0,0.5) 0%, transparent 100%);
    border-bottom: 1px solid rgba(118,196,66,0.15);
    overflow: hidden;
  }
  .header-section::before {
    content: '';
    position: absolute;
    inset: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234caf50' fill-opacity='0.04'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .header-icon {
    font-size: 64px;
    display: block;
    animation: sway 4s ease-in-out infinite;
    filter: drop-shadow(0 0 20px rgba(212,168,67,0.6));
    margin-bottom: 16px;
  }
  @keyframes sway {
    0%, 100% { transform: rotate(-4deg) scale(1); }
    50%       { transform: rotate(4deg) scale(1.08); }
  }
  .main-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.2rem, 5vw, 4rem);
    font-weight: 900;
    background: linear-gradient(135deg, var(--sunlight) 0%, var(--meadow) 50%, var(--sprout) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.5px;
    line-height: 1.1;
    animation: titlePop 0.8s cubic-bezier(0.22,1,0.36,1) both;
  }
  @keyframes titlePop {
    from { opacity: 0; transform: translateY(30px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .subtitle {
    margin-top: 14px;
    font-size: 1.15rem;
    color: rgba(245,200,66,0.75);
    font-weight: 300;
    letter-spacing: 0.5px;
    animation: titlePop 0.9s 0.15s cubic-bezier(0.22,1,0.36,1) both;
  }

  /* TAGLINE BAND */
  .tagline-band {
    width: 100%;
    background: linear-gradient(90deg, var(--leaf), var(--sprout), var(--meadow), var(--wheat), var(--leaf));
    background-size: 300% 100%;
    animation: gradientSlide 8s linear infinite;
    padding: 10px 0;
    text-align: center;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    color: #fff;
  }
  @keyframes gradientSlide {
    0%   { background-position: 0% 50%; }
    100% { background-position: 300% 50%; }
  }

  /* CONTENT */
  .content-wrapper {
    width: 100%;
    max-width: 100%;
    padding: 40px 32px 80px;
  }

  /* MAP SECTION */
  .map-section {
    width: 100%;
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow), var(--glow);
    border: 1px solid rgba(118,196,66,0.2);
    animation: fadeSlideUp 0.7s 0.3s cubic-bezier(0.22,1,0.36,1) both;
    background: rgba(0,0,0,0.3);
    margin-bottom: 32px;
  }
  .map-label {
    padding: 18px 24px 12px;
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    color: var(--meadow);
    display: flex;
    align-items: center;
    gap: 10px;
    border-bottom: 1px solid rgba(118,196,66,0.12);
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* LOADING */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 60px;
    animation: fadeSlideUp 0.4s ease both;
  }
  .spinner {
    width: 64px; height: 64px;
    border: 4px solid rgba(118,196,66,0.2);
    border-top-color: var(--meadow);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
    box-shadow: 0 0 20px rgba(118,196,66,0.3);
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text {
    color: var(--meadow);
    font-size: 1rem;
    font-weight: 500;
    letter-spacing: 0.5px;
    animation: pulse 1.5s ease-in-out infinite;
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

  /* RESULTS */
  .results-container {
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: fadeSlideUp 0.6s 0.1s cubic-bezier(0.22,1,0.36,1) both;
  }
  .section-main-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(1.8rem, 3vw, 2.6rem);
    font-weight: 900;
    text-align: center;
    margin: 8px 0;
    background: linear-gradient(135deg, var(--sunlight), var(--meadow));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  .section-main-title::after {
    content: '';
    display: block;
    width: 80px;
    height: 3px;
    background: linear-gradient(90deg, var(--leaf), var(--meadow));
    margin: 12px auto 0;
    border-radius: 2px;
  }

  /* CARDS */
  .card {
    width: 100%;
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(118,196,66,0.18);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .card:hover { transform: translateY(-3px); box-shadow: var(--shadow), var(--glow); }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px 16px;
    border-bottom: 1px solid rgba(118,196,66,0.12);
    background: rgba(0,0,0,0.15);
  }
  .card-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  .card-icon.green { background: rgba(76,175,80,0.18); }
  .card-icon.amber { background: rgba(212,168,67,0.18); }
  .card-icon.blue  { background: rgba(199,230,201,0.15); }

  .card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--meadow);
  }
  .card-body { padding: 20px 24px; }

  /* TABLES */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }
  .data-table thead tr { background: rgba(45,106,47,0.35); }
  .data-table th {
    padding: 10px 14px;
    text-align: left;
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--meadow);
    border-bottom: 2px solid rgba(118,196,66,0.25);
    font-weight: 500;
  }
  .data-table td {
    padding: 10px 14px;
    color: rgba(253,246,227,0.85);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    font-family: 'DM Mono', monospace;
    font-size: 0.82rem;
    transition: background 0.2s;
  }
  .data-table tbody tr:hover td { background: rgba(118,196,66,0.07); }
  .data-table tbody tr:last-child td { border-bottom: none; }
  .table-scroll { overflow-x: auto; }

  /* LOCATION GRID */
  .location-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
  }
  .location-item {
    background: rgba(118,196,66,0.07);
    border: 1px solid rgba(118,196,66,0.15);
    border-radius: 12px;
    padding: 14px 18px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background 0.2s, transform 0.2s;
  }
  .location-item:hover { background: rgba(118,196,66,0.14); transform: scale(1.02); }
  .location-label {
    font-size: 0.7rem;
    font-weight: 600;
    font-family: 'DM Mono', monospace;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    color: var(--meadow);
  }
  .location-value { font-size: 1rem; font-weight: 500; color: var(--cream); }

  /* CROP RECOMMENDATIONS */
  .crop-recommendations {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  /* BEST CROP */
  .best-crop-card {
    background: linear-gradient(135deg, rgba(27,60,15,0.9) 0%, rgba(45,106,47,0.7) 100%);
    border-radius: 20px;
    padding: 32px;
    color: var(--cream);
    position: relative;
    overflow: hidden;
    box-shadow: var(--shadow), var(--glow);
    border: 1px solid rgba(118,196,66,0.3);
  }
  .best-crop-card::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212,168,67,0.2), transparent 70%);
  }
  .best-crop-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: rgba(212,168,67,0.25);
    border: 1px solid rgba(212,168,67,0.4);
    color: var(--sunlight);
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 5px 14px;
    border-radius: 100px;
    margin-bottom: 16px;
  }
  .best-crop-name {
    font-family: 'Playfair Display', serif;
    font-size: 2.4rem;
    font-weight: 900;
    color: var(--cream);
    line-height: 1.1;
    margin-bottom: 8px;
  }
  .best-crop-confidence {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 16px 0;
  }
  .best-conf-bar {
    flex: 1;
    height: 6px;
    background: rgba(255,255,255,0.15);
    border-radius: 100px;
    overflow: hidden;
  }
  .best-conf-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--leaf), var(--meadow), var(--sunlight));
    border-radius: 100px;
    box-shadow: 0 0 10px rgba(118,196,66,0.5);
    transition: width 1s ease;
  }
  .best-conf-text {
    font-family: 'DM Mono', monospace;
    font-size: 0.85rem;
    color: var(--meadow);
    white-space: nowrap;
  }
  .best-crop-reason {
    font-size: 0.95rem;
    color: rgba(253,246,227,0.75);
    line-height: 1.7;
    font-weight: 300;
  }

  /* CROP SECTION HEADING */
  .crop-section-heading {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  .crop-section-label {
    font-family: 'Playfair Display', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--meadow);
    white-space: nowrap;
  }
  .crop-section-line {
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, rgba(118,196,66,0.3), transparent);
  }

  /* CROP GRID */
  .crop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 18px;
  }
  .crop-card {
    background: linear-gradient(145deg, rgba(45,106,47,0.25), rgba(27,60,28,0.4));
    border: 1px solid rgba(118,196,66,0.22);
    border-radius: 16px;
    padding: 22px 20px;
    position: relative;
    overflow: hidden;
    transition: all 0.35s cubic-bezier(0.22,1,0.36,1);
    box-shadow: 0 2px 12px rgba(0,0,0,0.25);
  }
  .crop-card::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle at 80% 20%, rgba(212,168,67,0.12), transparent 60%);
    opacity: 0;
    transition: opacity 0.3s;
  }
  .crop-card:hover { transform: translateY(-6px) scale(1.02); box-shadow: 0 20px 50px rgba(0,0,0,0.4), var(--glow); }
  .crop-card:hover::before { opacity: 1; }
  .crop-rank {
    position: absolute;
    top: -10px; right: 14px;
    background: linear-gradient(135deg, var(--wheat), var(--sunlight));
    color: var(--soil);
    font-family: 'DM Mono', monospace;
    font-size: 0.7rem;
    font-weight: 800;
    padding: 3px 10px;
    border-radius: 100px;
  }
  .crop-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--cream);
    margin-bottom: 12px;
    line-height: 1.3;
  }
  .crop-confidence { margin-bottom: 10px; }
  .confidence-bar {
    width: 100%;
    height: 4px;
    background: rgba(255,255,255,0.1);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 6px;
  }
  .confidence-fill {
    height: 100%;
    border-radius: 100px;
    background: linear-gradient(90deg, var(--leaf), var(--meadow));
    animation: fillBar 1s cubic-bezier(0.22,1,0.36,1) both;
    box-shadow: 0 0 8px rgba(118,196,66,0.4);
  }
  @keyframes fillBar { from { width: 0 !important; } }
  .confidence-text {
    font-family: 'DM Mono', monospace;
    font-size: 0.73rem;
    color: var(--meadow);
    font-weight: 500;
  }
  .crop-reason {
    font-size: 0.82rem;
    color: rgba(253,246,227,0.65);
    line-height: 1.6;
    border-top: 1px solid rgba(118,196,66,0.12);
    padding-top: 10px;
    margin-top: 4px;
  }

  /* ════════════════════════════════════════════════
     AI CARD — BOX MODEL & CSS UNTOUCHED FROM DOC3
  ════════════════════════════════════════════════ */
  .ai-card {
    background: linear-gradient(135deg, #0F2417 0%, #1A3D24 100%);
    border-radius: 20px;
    border: none;
    overflow: hidden;
    position: relative;
    box-shadow: 0 8px 32px rgba(15,36,23,0.35);
     max-width: 1200px;  /* ← add this */
    margin: 0 auto; 
  }
  .ai-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background:
      radial-gradient(ellipse at 0% 0%, rgba(90,158,79,0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 100% 100%, rgba(212,139,44,0.1) 0%, transparent 50%);
  }
  .ai-card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 24px 28px 16px;
    position: relative;
    z-index: 1;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .ai-icon-wrap {
    width: 40px; height: 40px;
    border-radius: 10px;
    background: rgba(90,158,79,0.2);
    border: 1px solid rgba(90,158,79,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 1.1rem;
  }
  .ai-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--leaf-pale);
  }
  .ai-card-subtitle {
    font-size: 0.75rem;
    color: rgba(168,213,162,0.5);
    margin-top: 2px;
    font-family: 'DM Mono', monospace;
    letter-spacing: 0.06em;
  }
  .ai-card-body {
    padding: 24px 28px 28px;
    position: relative;
    z-index: 1;
  }

  /* AI RECOMMENDATION PARSER — UNTOUCHED FROM DOC3 */
  .ai-section { margin-bottom: 24px; }
  .ai-section:last-child { margin-bottom: 0; }
  .ai-section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 700;
    color: var(--harvest-light);
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ai-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: rgba(240,184,74,0.15);
  }
  .ai-bullet-list {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .ai-bullet-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 0.9rem;
    color: rgba(245,237,216,0.8);
    line-height: 1.65;
    font-weight: 300;
  }
  .ai-bullet-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--leaf-light);
    flex-shrink: 0;
    margin-top: 8px;
  }
  .ai-bullet-dot.amber { background: var(--harvest); }
  .ai-plain-text {
    font-size: 0.9rem;
    color: rgba(245,237,216,0.75);
    line-height: 1.75;
    font-weight: 300;
    white-space: pre-wrap;
  }
  .ai-crop-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(61,107,53,0.25);
    border: 1px solid rgba(90,158,79,0.3);
    color: var(--leaf-pale);
    font-size: 0.78rem;
    font-weight: 500;
    padding: 3px 10px;
    border-radius: 100px;
    margin: 3px 3px 3px 0;
    font-family: 'DM Sans', sans-serif;
  }

  /* SCROLLBAR */
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
  ::-webkit-scrollbar-thumb { background: var(--sprout); border-radius: 3px; }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .content-wrapper { padding: 24px 16px 60px; }
    .header-section { padding: 50px 20px 36px; }
    .card-body { padding: 16px; }
    .crop-grid { grid-template-columns: 1fr 1fr; }
    .best-crop-name { font-size: 1.8rem; }
    .ai-card-body { padding: 18px 20px 22px; }
  }
  @media (max-width: 480px) {
    .crop-grid { grid-template-columns: 1fr; }
    .location-grid { grid-template-columns: 1fr 1fr; }
  }
`;

/* Floating particle component */
function Particles() {
  const items = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    left: Math.random() * 100,
    delay: Math.random() * 12,
    duration: Math.random() * 15 + 10,
    color: i % 3 === 0 ? "#4caf50" : i % 3 === 1 ? "#d4a843" : "#76c442",
  }));
  return (
    <>
      {items.map((p) => (
        <div
          key={p.id}
          className="particle"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.left}%`,
            bottom: 0,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: 0,
          }}
        />
      ))}
    </>
  );
}

// ─── AI Recommendation Renderer — UNTOUCHED FROM DOC3 ────────────────────────
function AIRecommendationDisplay({ text }) {
  if (!text) return null;

  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const blocks = [];
  let currentBlock = null;

  const isHeading = (line) =>
    /^(#+\s|[A-Z][A-Za-z\s&,\/]+:$|[🌾🌱🌿🌟🤖💧☀️🌦️🧪✅⚠️📌🗓️🏆]+.{0,60}:$)/.test(line) ||
    (line.endsWith(":") && line.length < 60 && line === line);

  const isBullet = (line) =>
    /^[-•*➤→✓✅⚠️📌]\s/.test(line) || /^\d+\.\s/.test(line);

  for (const line of lines) {
    if (isHeading(line)) {
      if (currentBlock) blocks.push(currentBlock);
      currentBlock = { type: "section", title: line.replace(/:$/, "").replace(/^#+\s*/, ""), items: [] };
    } else if (isBullet(line) && currentBlock?.type === "section") {
      currentBlock.items.push(line.replace(/^[-•*➤→✓✅⚠️📌\d+\.]\s*/, "").trim());
    } else if (currentBlock?.type === "section") {
      currentBlock.items.push(line);
    } else {
      if (currentBlock?.type !== "plain") {
        if (currentBlock) blocks.push(currentBlock);
        currentBlock = { type: "plain", text: line };
      } else {
        currentBlock.text += "\n" + line;
      }
    }
  }
  if (currentBlock) blocks.push(currentBlock);

  if (blocks.length === 0 || (blocks.length === 1 && blocks[0].type === "plain")) {
    return <p className="ai-plain-text">{text}</p>;
  }

  return (
    <div>
      {blocks.map((block, bi) => {
        if (block.type === "plain") {
          return <p key={bi} className="ai-plain-text" style={{ marginBottom: "14px" }}>{block.text}</p>;
        }
        return (
          <div key={bi} className="ai-section">
            <div className="ai-section-title">{block.title}</div>
            <ul className="ai-bullet-list">
              {block.items.map((item, ii) => (
                <li key={ii} className="ai-bullet-item">
                  <span className="ai-bullet-dot amber" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
function App() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [health, setHealth] = useState(null);
  const [showAnalysisPage, setShowAnalysisPage] = useState(false);
  const handlePolygonSelect = async (polygon) => {
    if (!polygon || !polygon.coordinates) {
      alert("Invalid polygon data");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/map/analyze", { polygon });
setAnalysis(res.data);

// NDVI health API
const healthRes = await axios.get("http://localhost:5000/api/health/1");
setHealth(healthRes.data);
    } catch (err) {
      alert("Error analyzing polygon. Check backend console.");
    } finally {
      setLoading(false);
    }
  };

  const renderTopCropCard = (crop, index) => (
    <div key={index} className="crop-card" id={`crop-card-${index}`}>
      {index !== undefined && crop.confidence && (
        <div className="crop-rank" id={`crop-rank-${index}`}>#{index + 1}</div>
      )}
      <div className="crop-name" id={`crop-name-${index}`}>{crop.name}</div>
      {crop.confidence !== undefined && (
        <div className="crop-confidence" id={`crop-confidence-${index}`}>
          <div className="confidence-bar" id={`confidence-bar-${index}`}>
            <div className="confidence-fill" id={`confidence-fill-${index}`}
              style={{ width: `${crop.confidence}%` }} />
          </div>
          <span className="confidence-text" id={`confidence-text-${index}`}>
            {crop.confidence}% Confidence
          </span>
        </div>
      )}
      {crop.reason && (
        <div className="crop-reason" id={`crop-reason-${index}`}>{crop.reason}</div>
      )}
    </div>
  );
   if (showAnalysisPage) {
  return <CropAnalysis />;
}
  return (
    <>
      <style>{styles}</style>
      <div id="app-root">
        <Particles />

        {/* ── Header ── */}
        <header className="header-section" id="header-section">
          <span className="header-icon">🌾</span>
          <h1 className="main-title" id="main-title">
            Smart Crop Recommendation System
          </h1>
          <p className="subtitle" id="subtitle">
            Analyze your land and get AI-powered crop suggestions
          </p>
        </header>

        {/* TAGLINE BAND */}
        <div className="tagline-band">
          🌱 Soil · Weather · AI Intelligence · Precision Agriculture · Sustainable Farming 🌿
        </div>

        <main className="content-wrapper" id="content-wrapper">

          {/* ── Map ── */}
          <section className="map-section" id="map-section">
            <div className="map-label">🗺️ Draw your field boundary on the map</div>
            <MapSelector onPolygonSelect={handlePolygonSelect} />
          </section>

          {/* ── Loading ── */}
          {loading && (
            <div className="loading-container" id="loading-container">
              <div className="spinner" id="spinner" />
              <p className="loading-text" id="loading-text">
                🌍 Analyzing soil &amp; climate data, please wait…
              </p>
            </div>
          )}

          {/* ── Results ── */}
          {analysis && (
            
            <section className="results-container" id="results-container">
              <h2 className="section-main-title" id="analysis-title">Analysis Results</h2>
             {/* NDVI Plantation Health */}
{health && (
  <div className="card" id="ndvi-card">
    <div className="card-header">
      <div className="card-icon green">🌿</div>
      <div className="card-title">Plantation Health (NDVI Analysis)</div>
    </div>

    <div className="card-body">
      <div className="location-grid">

        <div className="location-item">
          <span className="location-label">Week 1 NDVI</span>
          <span className="location-value">{health.week1}</span>
        </div>

        <div className="location-item">
          <span className="location-label">Week 2 NDVI</span>
          <span className="location-value">{health.week2}</span>
        </div>

        <div className="location-item">
          <span className="location-label">Week 3 NDVI</span>
          <span className="location-value">{health.week3}</span>
        </div>

        <div className="location-item">
          <span className="location-label">Week 4 NDVI</span>
          <span className="location-value">{health.week4}</span>
        </div>

        <div className="location-item">
          <span className="location-label">Overall Plantation Health</span>
          <span className="location-value">{health.plantationHealth}</span>
        </div>

      </div>
    </div>
  </div>
)}
              {/* Coordinates */}
              {analysis.coordinates?.length > 0 && (
                <div className="card coordinates-card" id="coordinates-card">
                  <div className="card-header">
                    <div className="card-icon blue">📍</div>
                    <div className="card-title" id="coordinates-title">Polygon Coordinates</div>
                  </div>
                  <div className="card-body">
                    <div className="table-scroll">
                      <table className="data-table" id="coordinates-table">
                        <thead>
                          <tr><th>Latitude</th><th>Longitude</th></tr>
                        </thead>
                        <tbody>
                          {analysis.coordinates.map((c, i) => (
                            <tr key={i} id={`coordinate-row-${i}`}>
                              <td id={`lat-${i}`}>{c.lat}</td>
                              <td id={`lng-${i}`}>{c.lng}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Location */}
              {analysis.areaDetails && (
                <div className="card location-card" id="location-card">
                  <div className="card-header">
                    <div className="card-icon amber">🗺️</div>
                    <div className="card-title" id="location-title">Location Details</div>
                  </div>
                  <div className="card-body">
                    <div className="location-grid" id="location-grid">
                      {Object.entries(analysis.areaDetails).map(([key, value]) => (
                        <div className="location-item" id={`location-${key}`} key={key}>
                          <span className="location-label">{key}</span>
                          <span className="location-value">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Soil & Weather */}
              {analysis.soilTable?.length > 0 && (
                <div className="card soil-card" id="soil-card">
                  <div className="card-header">
                    <div className="card-icon green">🌱</div>
                    <div className="card-title" id="soil-title">Soil &amp; Weather Analysis</div>
                  </div>
                  <div className="card-body" style={{ padding: "0" }}>
                    <div className="table-scroll">
                      <table className="data-table soil-table" id="soil-table">
                        <thead>
                          <tr>
                            <th>Lat</th><th>Lng</th><th>Soil Type</th>
                            <th>pH</th><th>N</th><th>P</th><th>K</th>
                            <th>Temp (°C)</th><th>Humidity (%)</th><th>Rainfall (mm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysis.soilTable.map((row, i) => (
                            <tr key={i} id={`soil-row-${i}`}>
                              <td id={`soil-lat-${i}`}>{row.lat}</td>
                              <td id={`soil-lng-${i}`}>{row.lng}</td>
                              <td id={`soil-type-${i}`}>{row.soil}</td>
                              <td id={`soil-ph-${i}`}>{row.ph}</td>
                              <td id={`soil-n-${i}`}>{row.n}</td>
                              <td id={`soil-p-${i}`}>{row.p}</td>
                              <td id={`soil-k-${i}`}>{row.k}</td>
                              <td id={`soil-temp-${i}`}>{row.temperature}</td>
                              <td id={`soil-humidity-${i}`}>{row.humidity}</td>
                              <td id={`soil-rainfall-${i}`}>{row.rainfall}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Crop Recommendations */}
              {(analysis.best_crop || analysis.top_5_crops?.length > 0 ||
                analysis.alternate_top_5_crops?.length > 0 || analysis.other_possible_crops?.length > 0) && (
                <div className="crop-recommendations" id="crop-recommendations">

                  {/* Best Crop */}
                  {analysis.best_crop && (
                    <section id="best-crop-section">
                      <div className="best-crop-card">
                        <div className="best-crop-badge">🏆 Best Recommendation</div>
                        <div className="best-crop-name" id="best-crop-title">
                          {analysis.best_crop.name}
                        </div>
                        {analysis.best_crop.confidence !== undefined && (
                          <div className="best-crop-confidence">
                            <div className="best-conf-bar">
                              <div className="best-conf-fill"
                                style={{ width: `${analysis.best_crop.confidence}%` }} />
                            </div>
                            <span className="best-conf-text">{analysis.best_crop.confidence}%</span>
                          </div>
                        )}
                        {analysis.best_crop.reason && (
                          <div className="best-crop-reason">{analysis.best_crop.reason}</div>
                        )}
                      </div>
                    </section>
                  )}

                  {/* Top 5 */}
                  {analysis.top_5_crops?.length > 0 && (
                    <section id="top5-crops-section">
                      <div className="crop-section-heading">
                        <div className="crop-section-label" id="top5-crops-title">🌱 Top 5 Crops</div>
                        <div className="crop-section-line" />
                      </div>
                      <div className="crop-grid" id="top5-crops-grid">
                        {analysis.top_5_crops.map(renderTopCropCard)}
                      </div>
                    </section>
                  )}

                  {/* Alternate Crops */}
                  {analysis.alternate_top_5_crops?.length > 0 && (
                    <section id="alternate-crops-section">
                      <div className="crop-section-heading">
                        <div className="crop-section-label" id="alternate-crops-title">🌿 Alternate Crops &amp; Trees</div>
                        <div className="crop-section-line" />
                      </div>
                      <div className="crop-grid" id="alternate-crops-grid">
                        {analysis.alternate_top_5_crops.map(renderTopCropCard)}
                      </div>
                    </section>
                  )}

                  {/* Other Crops */}
                  {analysis.other_possible_crops?.length > 0 && (
                    <section id="other-crops-section">
                      <div className="crop-section-heading">
                        <div className="crop-section-label" id="other-crops-title">🌾 Other Possible Crops</div>
                        <div className="crop-section-line" />
                      </div>
                      <div className="crop-grid" id="other-crops-grid">
                        {analysis.other_possible_crops.map((crop, idx) => (
                          <div className="crop-card" id={`other-crop-card-${idx}`} key={idx}>
                            <div className="crop-name" id={`other-crop-name-${idx}`}>{crop.name}</div>
                            {crop.reason && (
                              <div className="crop-reason" id={`other-crop-reason-${idx}`}>{crop.reason}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}

              {/* AI Recommendation — box model & CSS pixel-perfect from doc3 */}
              {analysis.aiRecommendation && (
                <div className="ai-card" id="ai-card">
                  <div className="ai-card-header">
                    <div className="ai-icon-wrap"></div>
                    <div>
                      <div className="ai-card-title" id="ai-title">AI Smart Crop Insight</div>
                      <div className="ai-card-subtitle">Generated by crop analysis model</div>
                    </div>
                  </div>
                  <div className="ai-card-body">
                    <AIRecommendationDisplay text={analysis.aiRecommendation} />
                  </div>
                </div>
              )}
             <div style={{ textAlign: "center", marginTop: "20px" }}>
  <button
    style={{
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      background: "#4CAF50",
      color: "white",
      cursor: "pointer"
    }}
    onClick={() => {

      localStorage.setItem("ndviData", JSON.stringify({
        location: "Selected Field",
        lat: analysis.coordinates?.[0]?.lat,
        lon: analysis.coordinates?.[0]?.lng,
        week1: health.week1,
        week2: health.week2,
        week3: health.week3,
        week4: health.week4
      }));

      setShowAnalysisPage(true);

    }}
  >
    View Full Crop Analysis
  </button>
</div>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

export default App;