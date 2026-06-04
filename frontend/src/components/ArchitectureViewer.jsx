import React, { useState, useEffect, useRef } from "react";

// Initialize mermaid inside component wrapper dynamically
let mermaidInstance = null;

export default function ArchitectureViewer({ project }) {
  const [activeDiag, setActiveDiag] = useState("hla");
  const diagContainerRef = useRef(null);

  const diagrams = {
    hla: { title: "High Level Architecture", code: project.architecture.hla, desc: "Describes the decoupled system microservices, client dashboards, FastAPI endpoint gateways, background celery job tasks, and caching layers." },
    lla: { title: "Low Level Architecture", code: project.architecture.lla, desc: "Exposes class structures, local objects, and internal class dependencies." },
    seq: { title: "Sequence Diagram", code: project.architecture.seq, desc: "Traces HTTP requests and WebSocket coordinate streams from driver devices to dispatch clients." }
  };

  useEffect(() => {
    // Dynamically load/import mermaid to avoid server side import issues
    import("mermaid").then((m) => {
      mermaidInstance = m.default;
      mermaidInstance.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "loose",
        themeVariables: {
          background: "#0d0f17",
          primaryColor: "#6366f1",
          primaryTextColor: "#fff",
          lineColor: "#a855f7"
        }
      });
      renderDiagram();
    }).catch(err => console.error("Error loading mermaid:", err));
  }, [activeDiag]);

  const renderDiagram = () => {
    if (!mermaidInstance || !diagContainerRef.current) return;

    try {
      diagContainerRef.current.innerHTML = "";
      const uniqueId = `mermaid-svg-${Date.now()}`;
      const code = diagrams[activeDiag].code;

      mermaidInstance.render(uniqueId, code).then(({ svg }) => {
        if (diagContainerRef.current) {
          diagContainerRef.current.innerHTML = svg;
        }
      }).catch((e) => {
        console.error("Mermaid parsing error:", e);
        diagContainerRef.current.innerHTML = `<p style="color:var(--accent-red)">Error compiling Mermaid diagram. Checking syntax...</p><pre style="font-size:12px;color:var(--text-secondary)">${code}</pre>`;
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Architecture Analyzer</h1>

      <div className="dual-pane" style={{ height: "calc(100vh - 160px)" }}>
        
        {/* Left Side: Controllers and explanations */}
        <div className="pane-left" style={{ width: "320px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="card" style={{ padding: "16px" }}>
            <h3 className="form-label" style={{ marginBottom: "12px" }}>Diagram Viewport</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {Object.entries(diagrams).map(([key, value]) => (
                <button
                  key={key}
                  className={`btn ${activeDiag === key ? "" : "btn-secondary"}`}
                  onClick={() => setActiveDiag(key)}
                  style={{ justifyContent: "flex-start", fontSize: "13px" }}
                >
                  {value.title}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: "16px", flex: 1, overflowY: "auto" }}>
            <h4 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "8px", color: "var(--accent-cyan)" }}>
              {diagrams[activeDiag].title} Details
            </h4>
            <p style={{ fontSize: "13px", lineHeight: "1.5", color: "var(--text-secondary)", marginBottom: "16px" }}>
              {diagrams[activeDiag].desc}
            </p>

            <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--secondary)", marginBottom: "8px" }}>Interactions</h4>
            <ul style={{ fontSize: "13px", paddingLeft: "16px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <li><strong>Module:</strong> High efficiency decoupled packages.</li>
              <li><strong>API:</strong> Low latency REST/WS pipelines.</li>
              <li><strong>Database:</strong> Relational logs and key-value cache memory.</li>
              <li><strong>Cloud:</strong> AWS ECS container orchestration nodes.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Render canvas */}
        <div className="pane-right" style={{ display: "flex", flexDirection: "column" }}>
          <div className="card" style={{
            flex: 1, background: "rgba(10, 11, 19, 0.9)", border: "1px solid var(--border-light)",
            borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center",
            padding: "24px", overflow: "auto"
          }}>
            <div ref={diagContainerRef} style={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
              <p style={{ color: "var(--text-muted)" }}>Loading diagram parser...</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
