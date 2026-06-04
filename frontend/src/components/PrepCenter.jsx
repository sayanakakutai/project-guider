import React, { useState } from "react";

export default function PrepCenter({ project }) {
  const [mode, setMode] = useState("interview"); // interview or viva
  const [filterKey, setFilterKey] = useState("beginner"); // beginner, intermediate, advanced OR twoMarks, fiveMarks, tenMarks
  const [expandedIdx, setExpandedIdx] = useState(null);

  const toggleExpand = (idx) => {
    setExpandedIdx(expandedIdx === idx ? null : idx);
  };

  const setModeAndReset = (newMode) => {
    setMode(newMode);
    setFilterKey(newMode === "interview" ? "beginner" : "twoMarks");
    setExpandedIdx(null);
  };

  const getActiveList = () => {
    if (mode === "interview") {
      return project.questions[filterKey] || [];
    } else {
      return project.questions.viva[filterKey] || [];
    }
  };

  const questionsList = getActiveList();

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Interview & Viva Preparation Engine</h1>

      {/* Main Switcher */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
        <button
          className={`btn ${mode === "interview" ? "" : "btn-secondary"}`}
          onClick={() => setModeAndReset("interview")}
        >
          Interview Preparation Coach
        </button>
        <button
          className={`btn ${mode === "viva" ? "" : "btn-secondary"}`}
          onClick={() => setModeAndReset("viva")}
        >
          Academic Viva Preparation
        </button>
      </div>

      <div className="dual-pane" style={{ height: "calc(100vh - 220px)" }}>
        
        {/* Left Side: filters */}
        <div className="pane-left" style={{ width: "240px" }}>
          <h3 className="form-label" style={{ marginBottom: "12px" }}>Categories</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {mode === "interview" ? (
              <>
                <button
                  className={`btn ${filterKey === "beginner" ? "" : "btn-secondary"}`}
                  onClick={() => { setFilterKey("beginner"); setExpandedIdx(null); }}
                  style={{ justifyContent: "flex-start", fontSize: "13px" }}
                >
                  Beginner Questions
                </button>
                <button
                  className={`btn ${filterKey === "intermediate" ? "" : "btn-secondary"}`}
                  onClick={() => { setFilterKey("intermediate"); setExpandedIdx(null); }}
                  style={{ justifyContent: "flex-start", fontSize: "13px" }}
                >
                  Intermediate Questions
                </button>
                <button
                  className={`btn ${filterKey === "advanced" ? "" : "btn-secondary"}`}
                  onClick={() => { setFilterKey("advanced"); setExpandedIdx(null); }}
                  style={{ justifyContent: "flex-start", fontSize: "13px" }}
                >
                  Advanced System Design
                </button>
              </>
            ) : (
              <>
                <button
                  className={`btn ${filterKey === "twoMarks" ? "" : "btn-secondary"}`}
                  onClick={() => { setFilterKey("twoMarks"); setExpandedIdx(null); }}
                  style={{ justifyContent: "flex-start", fontSize: "13px" }}
                >
                  2 Mark Definitions
                </button>
                <button
                  className={`btn ${filterKey === "fiveMarks" ? "" : "btn-secondary"}`}
                  onClick={() => { setFilterKey("fiveMarks"); setExpandedIdx(null); }}
                  style={{ justifyContent: "flex-start", fontSize: "13px" }}
                >
                  5 Mark Short Answers
                </button>
                <button
                  className={`btn ${filterKey === "tenMarks" ? "" : "btn-secondary"}`}
                  onClick={() => { setFilterKey("tenMarks"); setExpandedIdx(null); }}
                  style={{ justifyContent: "flex-start", fontSize: "13px" }}
                >
                  10 Mark Architecture Qs
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Accordion list */}
        <div className="pane-right" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {questionsList.length === 0 ? (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              No preparation questions loaded for this block.
            </div>
          ) : (
            questionsList.map((q, idx) => {
              const isExpanded = expandedIdx === idx;
              return (
                <div key={idx} className="card" style={{ padding: "16px", cursor: "pointer" }} onClick={() => toggleExpand(idx)}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "white", paddingRight: "16px" }}>
                      {idx + 1}. {q.q}
                    </span>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>

                  {isExpanded && (
                    <div style={{
                      marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-light)",
                      fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5"
                    }}>
                      {q.a}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
