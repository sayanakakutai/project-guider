import React from "react";

export default function ImprovementHub({ project }) {
  const improvements = project.improvements || [];

  const getImpactBadge = (impact) => {
    switch (impact.toLowerCase()) {
      case "high": return <span className="badge badge-red">High Impact</span>;
      case "medium": return <span className="badge badge-gold">Medium Impact</span>;
      default: return <span className="badge">Low Impact</span>;
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Project Improvement Engine</h1>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.5" }}>
        Specialized AI agents reviewed your codebase to suggest architectural updates and features ranked by business and engineering impact.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {improvements.map((imp, idx) => (
          <div key={idx} className="card" style={{ display: "flex", gap: "24px", alignItems: "center" }}>
            <div style={{ flexShrink: 0 }}>
              {getImpactBadge(imp.impact)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>{imp.title}</h3>
                <span className="badge badge-cyan" style={{ fontSize: "10px", padding: "2px 6px" }}>{imp.type}</span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                {imp.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
