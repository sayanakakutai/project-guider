import React from "react";

export default function Header({ projectName, apiKeyValue, setApiKey, onOpenUpload, onResetToDemo, isDemo }) {
  return (
    <header className="top-header">
      <div className="header-project-info">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="header-title">{projectName || "AI Project Intelligence"}</span>
          {isDemo && <span className="badge badge-cyan" style={{ fontSize: "10px", padding: "2px 6px" }}>Demo Project</span>}
        </div>
        <span className="header-subtitle">
          {isDemo ? "Exploring pre-loaded vehicle route optimizer" : "Live Codebase Intelligence Mode"}
        </span>
      </div>

      <div className="header-controls">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span className="form-label" style={{ margin: 0, fontSize: "10px" }}>Gemini Key:</span>
          <input
            type="password"
            className="api-key-input"
            placeholder="AI API Key (Stored locally)"
            value={apiKeyValue}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div>

        {!isDemo && (
          <button className="btn btn-secondary" onClick={onResetToDemo} style={{ fontSize: "12px", padding: "6px 12px" }}>
            Reset to Demo
          </button>
        )}

        <button className="btn" onClick={onOpenUpload}>
          <svg style={{ width: "16px", height: "16px", fill: "none", stroke: "currentColor", strokeWidth: "2" }} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Upload Project (ZIP)
        </button>
      </div>
    </header>
  );
}
