import React, { useState } from "react";

export default function ProjectExplainer({ project }) {
  const [activeTab, setActiveTab] = useState("executive");

  const tabs = [
    { id: "executive", label: "Executive Summary" },
    { id: "beginner", label: "Beginner Analogy" },
    { id: "technical", label: "Technical Overview" },
    { id: "interview", label: "Interview Pitch" },
    { id: "viva", label: "Academic Viva Prep" },
    { id: "nonTechnical", label: "Non-Technical Brief" }
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Project Understanding Engine</h1>

      {/* Core Properties Cards */}
      <div className="grid-2" style={{ marginBottom: "24px" }}>
        <div className="card">
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--accent-cyan)", marginBottom: "8px" }}>Domain & Objective</h3>
          <p style={{ fontSize: "15px", fontWeight: "600", marginBottom: "12px" }}>Domain: {project.domain}</p>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{project.objective}</p>
        </div>

        <div className="card">
          <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--secondary)", marginBottom: "8px" }}>Problem Statement</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.5" }}>{project.problemStatement}</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: "24px" }}>
        <div className="card">
          <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>Scope</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{project.scope}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>Target Audience</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{project.targetAudience}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px" }}>Business Impact</h3>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{project.businessUseCase}</p>
        </div>
      </div>

      {/* Explanation Tabs Panel */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "16px", overflowX: "auto" }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: activeTab === tab.id ? "rgba(99,102,241,0.15)" : "none",
                border: "none",
                borderRadius: "6px",
                padding: "8px 16px",
                color: activeTab === tab.id ? "white" : "var(--text-secondary)",
                cursor: "pointer",
                fontWeight: activeTab === tab.id ? "600" : "400",
                fontSize: "13px",
                whiteSpace: "nowrap",
                borderBottom: activeTab === tab.id ? "2px solid var(--primary)" : "none"
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ fontSize: "15px", color: "var(--text-primary)", lineHeight: "1.6", whiteSpace: "pre-line" }}>
          {project.explanations[activeTab] || "Generating explanation..."}
        </div>
      </div>

      {/* Features List */}
      <div className="card">
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>Core Platform Features</h3>
        <div className="grid-2">
          {project.features.map((feat, idx) => (
            <div key={idx} style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%", background: "var(--primary)", marginTop: "8px", flexShrink: 0
              }} />
              <span style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{feat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
