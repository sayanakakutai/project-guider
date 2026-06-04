import React, { useState, useEffect, useRef } from "react";

export default function RepoChat({ project, apiKey }) {
  const [scope, setScope] = useState("project"); // project, file, module
  const [scopeId, setScopeId] = useState("");
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleSend = async () => {
    if (!message.trim() || loading) return;
    const msg = message;
    setMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          scope,
          scopeId,
          message: msg,
          chatHistory
        })
      });
      const data = await response.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: "ai", text: `Error: ${data.message}` }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Connection error: Failed to reach backend." }]);
    } finally {
      setLoading(false);
    }
  };

  const getScopeTargets = () => {
    if (scope === "file") return Object.keys(project.files);
    if (scope === "module") return project.technologies.map(t => t.name);
    return [];
  };

  return (
    <div className="animate-fade-in" style={{ height: "calc(100vh - 140px)", display: "flex", flexDirection: "column" }}>
      <h1 className="section-title">Repository Chat Mode</h1>

      {/* Scope Selector Bar */}
      <div className="card" style={{ padding: "16px", marginBottom: "16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span className="form-label" style={{ margin: 0 }}>Chat Scope:</span>
          
          <select className="form-input" style={{ width: "160px" }} value={scope} onChange={(e) => { setScope(e.target.value); setScopeId(""); }}>
            <option value="project">Entire Repository</option>
            <option value="file">Specific File</option>
            <option value="module">Specific Technology</option>
          </select>

          {scope !== "project" && (
            <select className="form-input" style={{ width: "240px" }} value={scopeId} onChange={(e) => setScopeId(e.target.value)}>
              <option value="">Select Target...</option>
              {getScopeTargets().map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Chat Messages Frame */}
      <div className="chat-container" style={{ flex: 1, height: "auto", marginBottom: "16px" }}>
        <div className="chat-messages">
          {chatHistory.length === 0 ? (
            <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "80px" }}>
              <h3 style={{ marginBottom: "8px", color: "white" }}>Repository Memory Active</h3>
              <p style={{ fontSize: "13px" }}>Ask questions about database designs, imports, threading models, or config files. Scope queries to optimize responses.</p>
            </div>
          ) : (
            chatHistory.map((ch, idx) => (
              <div key={idx} className={`chat-bubble ${ch.role === "user" ? "bubble-user" : "bubble-ai"}`} style={{ whiteSpace: "pre-wrap" }}>
                {ch.text}
              </div>
            ))
          )}
          {loading && <div className="chat-bubble bubble-ai" style={{ color: "var(--text-muted)" }}>Reading context and running queries...</div>}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-bar">
          <input
            type="text"
            className="form-input"
            placeholder={`Ask a question about the ${scope === "project" ? "codebase" : scopeId || "selected target"}...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
          />
          <button className="btn" onClick={handleSend} disabled={loading} style={{ padding: "12px 24px" }}>
            Send Message
          </button>
        </div>
      </div>

    </div>
  );
}
