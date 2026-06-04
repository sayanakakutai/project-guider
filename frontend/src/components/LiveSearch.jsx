import React, { useState } from "react";

export default function LiveSearch({ apiKey }) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setSearching(true);
    setResult(null);
    
    // Animate logging steps
    setLogs(["Contacting research agents...", "Formulating search terms..."]);
    
    setTimeout(() => {
      setLogs(prev => [...prev, "Crawling developer documentations (MDN, StackOverflow)..."]);
    }, 1000);

    setTimeout(() => {
      setLogs(prev => [...prev, "Reading academic repository indices..."]);
    }, 2000);

    try {
      const response = await fetch("http://localhost:5000/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, apiKey })
      });
      const data = await response.json();
      if (data.success) {
        setLogs(data.steps || []);
        setResult({
          summary: data.summary,
          citations: data.citations
        });
      } else {
        setLogs(prev => [...prev, `Search failed: ${data.message}`]);
      }
    } catch (e) {
      setLogs(prev => [...prev, "Connection error: Failed to connect to server."]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Live Web Intelligence & Research Assistant</h1>

      {/* Input box */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Ask Any Technical or Academic Topic</h3>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. What is Docker? / Explain RAG / Latest React updates..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={searching}
          />
          <button className="btn" onClick={handleSearch} disabled={searching} style={{ padding: "12px 24px" }}>
            {searching ? "Searching..." : "Research"}
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Research Logs */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "350px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--accent-cyan)" }}>Agent Execution Logs</h3>
          <div style={{
            flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "16px",
            fontFamily: "var(--font-mono)", fontSize: "12px", overflowY: "auto", display: "flex",
            flexDirection: "column", gap: "8px"
          }}>
            {logs.length === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "40px" }}>
                Waiting to begin research pipeline...
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} style={{ color: log.includes("failed") ? "var(--accent-red)" : "var(--accent-green)" }}>
                  &gt; {log}
                </div>
              ))
            )}
            {searching && <div style={{ color: "var(--accent-gold)" }}>&gt; Processing agent inputs...</div>}
          </div>
        </div>

        {/* Research Result */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "350px", overflow: "hidden" }}>
          <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px", color: "var(--secondary)" }}>Synthesis Report</h3>
          
          <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
            {result ? (
              <div style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-secondary)" }}>
                <div style={{ whiteSpace: "pre-wrap", marginBottom: "16px", color: "white" }}>
                  {result.summary}
                </div>

                {result.citations && result.citations.length > 0 && (
                  <div>
                    <h4 style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--accent-cyan)", marginBottom: "8px" }}>References & Citations</h4>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {result.citations.map((c, idx) => (
                        <a key={idx} href={c.url} target="_blank" rel="noopener noreferrer" style={{
                          color: "var(--primary)", textDecoration: "none", fontSize: "13px", display: "flex", alignItems: "center", gap: "4px"
                        }}>
                          <svg style={{ width: "12px", height: "12px", fill: "none", stroke: "currentColor", strokeWidth: "2" }} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          {c.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "40px" }}>
                Results will be displayed here after research completes.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
