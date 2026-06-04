import React, { useState } from "react";

export default function ReportGenerator({ project }) {
  const [style, setStyle] = useState("ieee"); // academic, ieee, industry

  const handleDownload = () => {
    const reportText = `
TITLE: ${project.name}
DOMAIN: ${project.domain}

ABSTRACT:
${project.documentation.abstract}

OBJECTIVES:
${project.objective}

PROBLEM STATEMENT:
${project.problemStatement}
`;
    
    const blob = new Blob([reportText], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${project.name.replace(/[^a-zA-Z0-9]/g, "_")}_report.txt`;
    link.click();
  };

  return (
    <div className="animate-fade-in" style={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
        <h1 className="section-title" style={{ margin: 0 }}>Report Generator</h1>
        
        <div style={{ display: "flex", gap: "10px" }}>
          <select className="form-input" style={{ width: "160px" }} value={style} onChange={(e) => setStyle(e.target.value)}>
            <option value="ieee">IEEE style (Double Column)</option>
            <option value="academic">Academic Thesis</option>
            <option value="industry">Industry Report</option>
          </select>
          <button className="btn" onClick={handleDownload}>Download Report (.TXT)</button>
        </div>
      </div>

      {/* Preview Sheet Container */}
      <div style={{
        flex: 1, background: "white", color: "#111", borderRadius: "12px", padding: "40px",
        overflowY: "auto", fontFamily: "'Times New Roman', serif", boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
      }}>
        
        {style === "ieee" ? (
          /* IEEE Style layout */
          <div style={{ fontSize: "12px", lineHeight: "1.5" }}>
            <h2 style={{ textAlign: "center", fontSize: "18px", fontWeight: "bold", margin: "0 0 4px" }}>
              {project.name.toUpperCase()}
            </h2>
            <p style={{ textAlign: "center", fontSize: "10px", fontStyle: "italic", margin: "0 0 16px" }}>
              Systematic Analysis conducted by AI Project Intelligence Platform
            </p>

            <div style={{ display: "flex", gap: "24px" }}>
              {/* Left Column */}
              <div style={{ flex: 1, textAlign: "justify" }}>
                <h3 style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #111", margin: "12px 0 6px" }}>
                  Abstract
                </h3>
                <p style={{ textIndent: "12px", margin: "0 0 10px" }}>{project.documentation.abstract}</p>

                <h3 style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #111", margin: "12px 0 6px" }}>
                  I. Introduction
                </h3>
                <p style={{ textIndent: "12px", margin: "0 0 10px" }}>
                  In modern computing paradigms, assessing code logic modularity serves as a significant bottleneck. This paper presents a structured review of the codebase: {project.name}, operating within the domain of {project.domain}.
                </p>
                <p style={{ textIndent: "12px", margin: "0 0 10px" }}>
                  <strong>Problem Definition:</strong> {project.problemStatement}
                </p>
              </div>

              {/* Right Column */}
              <div style={{ flex: 1, textAlign: "justify" }}>
                <h3 style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #111", margin: "12px 0 6px" }}>
                  II. System Objective & Scope
                </h3>
                <p style={{ textIndent: "12px", margin: "0 0 10px" }}>{project.objective}</p>
                <p style={{ textIndent: "12px", margin: "0 0 10px" }}>
                  <strong>Scope boundary:</strong> {project.scope}
                </p>

                <h3 style={{ fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", borderBottom: "1.5px solid #111", margin: "12px 0 6px" }}>
                  III. Conclusion
                </h3>
                <p style={{ textIndent: "12px", margin: "0 0 10px" }}>
                  By combining deep logic graphs and static checks, the system successfully parsed project files. Overall readiness rating is indexed at {project.healthScores?.iq}%.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Thesis Style layout */
          <div style={{ fontSize: "14px", lineHeight: "1.6", maxWidth: "680px", margin: "0 auto" }}>
            <h1 style={{ textAlign: "center", fontSize: "24px", fontWeight: "bold", margin: "0 0 8px" }}>{project.name}</h1>
            <div style={{ textAlign: "center", fontSize: "12px", color: "#666", marginBottom: "40px" }}>
              A Dissertation submitted in partial fulfillment of project audit standards
            </div>

            <h2 style={{ fontSize: "16px", fontWeight: "bold", marginTop: "24px", borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
              Abstract
            </h2>
            <p style={{ textIndent: "20px", marginTop: "10px" }}>{project.documentation.abstract}</p>

            <h2 style={{ fontSize: "16px", fontWeight: "bold", marginTop: "24px", borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
              Chapter 1: Introduction
            </h2>
            <p style={{ textIndent: "20px", marginTop: "10px" }}>
              The software program targets the execution and scaling of core operations in the domain of {project.domain}. The design system maps out code inputs, processing variables, and database writes.
            </p>
            
            <h2 style={{ fontSize: "16px", fontWeight: "bold", marginTop: "24px", borderBottom: "1px solid #ddd", paddingBottom: "6px" }}>
              Chapter 2: Problem Definition & Methodology
            </h2>
            <p style={{ marginTop: "10px" }}><strong>Statement:</strong> {project.problemStatement}</p>
            <p style={{ marginTop: "10px" }}><strong>Objective:</strong> {project.objective}</p>
          </div>
        )}

      </div>
    </div>
  );
}
