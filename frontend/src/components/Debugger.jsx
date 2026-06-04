import React, { useState } from "react";

export default function Debugger({ project }) {
  const [selectedBugIdx, setSelectedBugIdx] = useState(0);
  const bugs = project.bugs || [];

  const activeBug = bugs[selectedBugIdx];

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Code Debugging & Vulnerability Engine</h1>

      {bugs.length === 0 ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          No bugs or security warnings detected in static scans.
        </div>
      ) : (
        <div className="dual-pane" style={{ height: "calc(100vh - 160px)" }}>
          
          {/* Left panel: List */}
          <div className="pane-left" style={{ width: "320px", display: "flex", flexDirection: "column", gap: "10px" }}>
            <h3 className="form-label">Identified Vulnerabilities ({bugs.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", flex: 1 }}>
              {bugs.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedBugIdx(idx)}
                  className={`card ${selectedBugIdx === idx ? "active" : ""}`}
                  style={{
                    padding: "12px 16px", cursor: "pointer", borderLeft: `4px solid ${b.type.includes("Security") ? "var(--accent-red)" : "var(--accent-gold)"}`,
                    background: selectedBugIdx === idx ? "rgba(255,255,255,0.03)" : ""
                  }}
                >
                  <div style={{ fontWeight: "700", fontSize: "13.5px", color: "white" }}>{b.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>{b.type}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel: Details */}
          {activeBug && (
            <div className="pane-right" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span className="badge badge-red">{activeBug.id}</span>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Type: {activeBug.type}</span>
                </div>
                <h2 style={{ fontSize: "18px", fontWeight: "700", color: "white", marginBottom: "8px" }}>{activeBug.title}</h2>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{activeBug.description}</p>
              </div>

              <div className="card">
                <h4 style={{ fontSize: "13px", color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "6px" }}>Root Cause Analysis</h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{activeBug.rootCause}</p>
              </div>

              {/* Code Diff Box */}
              <div className="card" style={{ padding: "0", background: "#06070a", overflow: "hidden" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 16px", borderBottom: "1px solid var(--border-light)", fontSize: "12px", color: "var(--text-secondary)" }}>
                  Unified Resolution Diff
                </div>
                <pre style={{
                  padding: "16px", fontFamily: "var(--font-mono)", fontSize: "12.5px", lineHeight: "1.6",
                  overflowX: "auto", margin: "0"
                }}>
                  {activeBug.diff.split("\n").map((line, lIdx) => {
                    const isAddition = line.startsWith("+");
                    const isDeletion = line.startsWith("-");
                    const color = isAddition ? "var(--accent-green)" : isDeletion ? "var(--accent-red)" : "var(--text-secondary)";
                    const bg = isAddition ? "rgba(16,185,129,0.08)" : isDeletion ? "rgba(239,68,68,0.08)" : "none";
                    return (
                      <div key={lIdx} style={{ color, background: bg, padding: "2px 8px" }}>
                        {line}
                      </div>
                    );
                  })}
                </pre>
              </div>

              <div className="grid-2">
                <div className="card">
                  <h4 style={{ fontSize: "13px", color: "var(--accent-green)", textTransform: "uppercase", marginBottom: "6px" }}>Applied Fix</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{activeBug.fix}</p>
                </div>
                <div className="card">
                  <h4 style={{ fontSize: "13px", color: "var(--secondary)", textTransform: "uppercase", marginBottom: "6px" }}>Optimized Solution</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{activeBug.optimized}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
