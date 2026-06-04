import React, { useState } from "react";

export default function DocGenerator({ project }) {
  const [selectedDoc, setSelectedDoc] = useState("readme");
  const [content, setContent] = useState(project.documentation.readme || "");

  const docTemplates = [
    { id: "readme", label: "README.md", data: project.documentation.readme },
    { id: "abstract", label: "Abstract / Synopsis", data: project.documentation.abstract },
    { id: "installation", label: "Installation Guide", data: project.documentation.installation },
    { id: "api", label: "API Reference", data: project.documentation.api }
  ];

  const handleSelectTemplate = (template) => {
    setSelectedDoc(template.id);
    setContent(template.data || `# ${template.label}\n\n[Auto-Generated Content]`);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    alert("Copied to clipboard!");
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Documentation Generator</h1>

      <div className="dual-pane" style={{ height: "calc(100vh - 160px)" }}>
        
        {/* Left Side: Template selector */}
        <div className="pane-left" style={{ width: "220px" }}>
          <h3 className="form-label" style={{ marginBottom: "12px" }}>Templates</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {docTemplates.map((t) => (
              <button
                key={t.id}
                className={`btn ${selectedDoc === t.id ? "" : "btn-secondary"}`}
                onClick={() => handleSelectTemplate(t)}
                style={{ justifyContent: "flex-start", fontSize: "13px" }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Markdown Editor and Preview */}
        <div className="pane-right" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "14px", color: "var(--accent-cyan)", fontWeight: "600" }}>
              Editing: {docTemplates.find(t => t.id === selectedDoc)?.label}
            </span>
            <button className="btn" onClick={handleCopy} style={{ padding: "6px 12px", fontSize: "12px" }}>
              Copy to Clipboard
            </button>
          </div>

          <div style={{ display: "flex", gap: "20px", flex: 1, overflow: "hidden" }}>
            
            {/* Editor Panel */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
              <textarea
                className="form-textarea"
                style={{
                  flex: 1, fontFamily: "var(--font-mono)", fontSize: "13.5px", background: "rgba(0,0,0,0.3)",
                  border: "1px solid var(--border-light)", color: "white", padding: "16px", resize: "none",
                  borderRadius: "8px"
                }}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {/* Preview Panel */}
            <div style={{
              flex: 1, border: "1px solid var(--border-light)", borderRadius: "8px",
              background: "var(--bg-card)", padding: "20px", overflowY: "auto", height: "100%"
            }}>
              <h4 style={{ fontSize: "12px", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: "12px" }}>Markdown Preview</h4>
              <div style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
                {content}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
