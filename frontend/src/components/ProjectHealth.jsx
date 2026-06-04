import React from "react";

export default function ProjectHealth({ project }) {
  const scores = project.healthScores || { quality: 80, security: 80, scalability: 80, maintainability: 80, documentation: 80, readiness: 80, iq: 80 };

  const getMetricColor = (val) => {
    if (val >= 85) return "var(--accent-green)";
    if (val >= 75) return "var(--accent-gold)";
    return "var(--accent-red)";
  };

  const metrics = [
    { label: "Code Quality", val: scores.quality, color: "var(--primary)" },
    { label: "Vulnerability Scan", val: scores.security, color: "var(--accent-red)" },
    { label: "System Scalability", val: scores.scalability, color: "var(--accent-cyan)" },
    { label: "Maintainability Index", val: scores.maintainability, color: "var(--secondary)" },
    { label: "Doc Coverage", val: scores.documentation, color: "var(--accent-green)" }
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Project Health Scoring & IQ</h1>

      <div className="grid-2" style={{ marginBottom: "24px", alignItems: "stretch" }}>
        
        {/* Main IQ Gauge Card */}
        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "1px", marginBottom: "20px" }}>
            Overall Project IQ Score
          </h3>
          
          <div style={{
            position: "relative", width: "160px", height: "160px", borderRadius: "50%",
            background: "rgba(99, 102, 241, 0.03)", border: `8px solid var(--border-light)`,
            borderTopColor: getMetricColor(scores.iq), display: "flex", flexDirection: "column",
            justifyContent: "center", alignItems: "center", boxShadow: "var(--glow-shadow)",
            transform: "rotate(-45deg)", margin: "0 auto"
          }}>
            <div style={{ transform: "rotate(45deg)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={{ fontSize: "48px", fontWeight: "900", color: "white" }}>{scores.iq}</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>IQ Rating</span>
            </div>
          </div>

          <div style={{ marginTop: "24px", textAlign: "center", fontSize: "14px", color: "var(--text-secondary)" }}>
            Your project shows <strong>{scores.iq >= 80 ? "High Readiness" : "Medium Readiness"}</strong> for production deployments.
          </div>
        </div>

        {/* Audit Metrics List */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Detailed Audit Checklists</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {metrics.map((m, idx) => (
              <div key={idx}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "4px" }}>
                  <span style={{ color: "var(--text-secondary)" }}>{m.label}</span>
                  <span style={{ fontWeight: "700", color: getMetricColor(m.val) }}>{m.val}%</span>
                </div>
                
                {/* Horizontal bar */}
                <div style={{ width: "100%", height: "6px", background: "var(--border-light)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${m.val}%`, height: "100%", background: m.color, borderRadius: "3px" }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Checklist Card */}
      <div className="card">
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Codebase Best Practices Checklist</h3>
        <div className="grid-2" style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--accent-green)" }}>✓</span> Decoupled Environment Configs</div>
            <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--accent-green)" }}>✓</span> Clean package scopes</div>
            <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--accent-green)" }}>✓</span> Structured modules</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--accent-green)" }}>✓</span> Async IO Loops implemented</div>
            <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--accent-green)" }}>✓</span> Custom exceptions defined</div>
            <div style={{ display: "flex", gap: "8px" }}><span style={{ color: "var(--accent-green)" }}>✓</span> In-Memory data logging</div>
          </div>
        </div>
      </div>
    </div>
  );
}
