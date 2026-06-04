import React, { useState } from "react";

export default function ResumeLinkedIn({ project }) {
  const [activeSubTab, setActiveSubTab] = useState("resume");

  const subTabs = [
    { id: "resume", label: "ATS Resume Points", data: project.socials.resume },
    { id: "linkedin", label: "LinkedIn Post", data: project.socials.linkedin },
    { id: "github", label: "GitHub Readme Tagline", data: project.socials.github },
    { id: "portfolio", label: "Portfolio Pitch", data: project.socials.portfolio }
  ];

  const handleCopy = () => {
    const textToCopy = subTabs.find(t => t.id === activeSubTab)?.data || "";
    navigator.clipboard.writeText(textToCopy);
    alert("Copied to clipboard!");
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Resume & LinkedIn Engine</h1>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
            {subTabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                style={{
                  background: activeSubTab === t.id ? "rgba(99,102,241,0.12)" : "none",
                  border: "none", borderRadius: "6px", padding: "8px 16px",
                  color: activeSubTab === t.id ? "white" : "var(--text-secondary)",
                  cursor: "pointer", fontSize: "13px", fontWeight: activeSubTab === t.id ? "600" : "400"
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button className="btn" onClick={handleCopy} style={{ padding: "6px 12px", fontSize: "12px" }}>
            Copy Output
          </button>
        </div>

        <div style={{
          background: "rgba(0,0,0,0.25)", border: "1px solid var(--border-light)", borderRadius: "8px",
          padding: "20px", fontFamily: activeSubTab === "resume" ? "inherit" : "var(--font-sans)",
          fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)", whiteSpace: "pre-wrap"
        }}>
          {subTabs.find(t => t.id === activeSubTab)?.data}
        </div>
      </div>
    </div>
  );
}
