import React, { useState } from "react";

export default function TechAnalyzer({ project }) {
  const [selectedTech, setSelectedTech] = useState(project.technologies[0]?.name || "");

  const techData = project.technologies.find(t => t.name === selectedTech) || project.technologies[0];
  const learningData = project.projectSpecificLearning.find(l => l.tech === selectedTech) || project.projectSpecificLearning[0];

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Technology Analyzer & Project Learning</h1>

      <div className="dual-pane" style={{ height: "calc(100vh - 160px)" }}>
        
        {/* Left pane: tech list */}
        <div className="pane-left" style={{ width: "260px" }}>
          <h3 className="form-label" style={{ marginBottom: "12px" }}>Detected Stack</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {project.technologies.map((tech) => (
              <button
                key={tech.name}
                className={`btn ${selectedTech === tech.name ? "" : "btn-secondary"}`}
                onClick={() => setSelectedTech(tech.name)}
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
              >
                {tech.name}
              </button>
            ))}
          </div>
        </div>

        {/* Right pane: details */}
        {techData ? (
          <div className="pane-right" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Context Card: Why it was used here */}
            {learningData && (
              <div className="card" style={{ border: "1px solid rgba(6,182,212,0.2)", background: "rgba(6,182,212,0.03)" }}>
                <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--accent-cyan)", marginBottom: "8px", fontWeight: "700" }}>
                  Project Usage: How it works here
                </h3>
                <p style={{ fontSize: "14px", color: "white", lineHeight: "1.5", marginBottom: "8px" }}>
                  <strong>Local Integration:</strong> {learningData.projectUsage}
                </p>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  <strong>General Utility:</strong> {learningData.generalUsage}
                </p>
              </div>
            )}

            {/* Core Tech Data Grid */}
            <div className="grid-2">
              <div className="card">
                <h4 style={{ fontSize: "13px", color: "var(--primary)", textTransform: "uppercase", marginBottom: "8px" }}>Overview & Selection</h4>
                <p style={{ fontSize: "14px", lineHeight: "1.4", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  <strong>What it is:</strong> {techData.whyUsed}
                </p>
                <p style={{ fontSize: "14px", lineHeight: "1.4", color: "var(--text-secondary)" }}>
                  <strong>Why Chosen:</strong> {techData.whyChosen}
                </p>
              </div>

              <div className="card">
                <h4 style={{ fontSize: "13px", color: "var(--secondary)", textTransform: "uppercase", marginBottom: "8px" }}>Trade-offs</h4>
                <p style={{ fontSize: "14px", lineHeight: "1.4", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  <strong>Advantages:</strong> {techData.advantages}
                </p>
                <p style={{ fontSize: "14px", lineHeight: "1.4", color: "var(--text-secondary)" }}>
                  <strong>Disadvantages:</strong> {techData.disadvantages}
                </p>
              </div>
            </div>

            <div className="grid-3">
              <div className="card">
                <h5 style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Alternatives</h5>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>{techData.alternatives}</p>
              </div>
              <div className="card">
                <h5 style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Industry Applications</h5>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>{techData.industry}</p>
              </div>
              <div className="card">
                <h5 style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "4px" }}>Best Practices</h5>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)" }}>{techData.practices}</p>
              </div>
            </div>

            {/* Questions Tab */}
            {techData.questions && techData.questions.length > 0 && (
              <div className="card">
                <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Interview prep on {techData.name}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {techData.questions.map((q, idx) => (
                    <div key={idx} style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "10px" }}>
                      <div style={{ fontSize: "13.5px", fontWeight: "600", color: "white", marginBottom: "4px" }}>Q: {q.q}</div>
                      <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>A: {q.a}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
            No technologies analyzed. Upload a project file to see details.
          </div>
        )}
      </div>
    </div>
  );
}
