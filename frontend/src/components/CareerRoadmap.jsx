import React from "react";

export default function CareerRoadmap({ project }) {
  const data = project.careerRoadmap || { roles: [], skills: [], missing: [], roadmap: [] };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Career Mentor & Learning Roadmap</h1>

      <div className="grid-3" style={{ marginBottom: "24px" }}>
        
        {/* Roles Card */}
        <div className="card">
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--accent-cyan)", marginBottom: "12px", fontWeight: "700" }}>
            Recommended Job Roles
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {data.roles.map((role, idx) => (
              <span key={idx} className="badge badge-cyan" style={{ fontSize: "12px" }}>{role}</span>
            ))}
          </div>
        </div>

        {/* Existing Skills */}
        <div className="card">
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--accent-green)", marginBottom: "12px", fontWeight: "700" }}>
            Skills Demonstrated Here
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {data.skills.map((skill, idx) => (
              <span key={idx} className="badge badge-green" style={{ fontSize: "12px" }}>{skill}</span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        <div className="card">
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--accent-red)", marginBottom: "12px", fontWeight: "700" }}>
            Missing Industry Skills
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {data.missing.map((sk, idx) => (
              <span key={idx} className="badge badge-red" style={{ fontSize: "12px" }}>{sk}</span>
            ))}
          </div>
        </div>

      </div>

      {/* Step by Step Roadmap */}
      <div className="card">
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "20px" }}>Strategic Learning Roadmap</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px", position: "relative" }}>
          {/* Vertical indicator line */}
          <div style={{
            position: "absolute", top: "8px", left: "20px", width: "2px", height: "calc(100% - 24px)",
            background: "linear-gradient(180deg, var(--primary), var(--secondary))", zIndex: 1
          }} />

          {data.roadmap.map((node, idx) => (
            <div key={idx} style={{ display: "flex", gap: "20px", position: "relative", zIndex: 2 }}>
              
              {/* Bullet circle */}
              <div style={{
                width: "42px", height: "42px", borderRadius: "50%", background: "#0b0c13",
                border: "3px solid var(--primary)", display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: "800", color: "white", fontSize: "14px", flexShrink: 0
              }}>
                {idx + 1}
              </div>

              {/* Node description */}
              <div className="card" style={{ flex: 1, padding: "16px", background: "rgba(255,255,255,0.01)" }}>
                <h4 style={{ fontWeight: "700", color: "white", marginBottom: "4px" }}>{node.step}</h4>
                <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{node.desc}</p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
