import React, { useState } from "react";

export default function CodeExplorer({ project, apiKey }) {
  const [selectedFile, setSelectedFile] = useState(Object.keys(project.files)[0] || "");
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [rightTab, setRightTab] = useState("analysis");

  const fileData = project.files[selectedFile] || { code: "", explanation: "", functions: [], classes: [], variables: [] };

  const renderTree = (node, depth = 0) => {
    if (node.type === "file") {
      const fullPath = getFullPath(project.folderStructure, node.name);
      const isActive = selectedFile === fullPath;
      return (
        <div
          key={node.name}
          className={`tree-node ${isActive ? "file-active" : ""}`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
          onClick={() => {
            setSelectedFile(fullPath);
            setChatHistory([]);
          }}
        >
          <svg style={{ width: "14px", height: "14px", color: "var(--text-muted)", fill: "none", stroke: "currentColor", strokeWidth: "2" }} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{node.name}</span>
        </div>
      );
    }

    return (
      <div key={node.name}>
        <div className="tree-node" style={{ paddingLeft: `${depth * 12 + 8}px`, fontWeight: "600", color: "var(--text-primary)" }}>
          <svg style={{ width: "14px", height: "14px", color: "var(--primary)", fill: "none", stroke: "currentColor", strokeWidth: "2" }} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>{node.name}</span>
        </div>
        {node.children && node.children.map(child => renderTree(child, depth + 1))}
      </div>
    );
  };

  // Find relative full path of a file in the tree
  const getFullPath = (node, fileName, currentPath = "") => {
    const segment = currentPath ? `${currentPath}/${node.name}` : node.name;
    if (node.name === fileName && node.type === "file") {
      // Strip starting "root/" or "smartfleet/"
      return segment.replace(/^(root|smartfleet)\//, "");
    }
    if (node.children) {
      for (const child of node.children) {
        const found = getFullPath(child, fileName, segment);
        if (found) return found;
      }
    }
    return null;
  };

  const handleAskFile = async () => {
    if (!chatMessage.trim()) return;
    const msg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: msg }]);
    setLoadingChat(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          scope: "file",
          scopeId: selectedFile,
          message: msg,
          chatHistory: chatHistory
        })
      });
      const data = await response.json();
      if (data.success) {
        setChatHistory(prev => [...prev, { role: "ai", text: data.response }]);
      } else {
        setChatHistory(prev => [...prev, { role: "ai", text: `Error: ${data.message}` }]);
      }
    } catch (e) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Failed to connect to backend server." }]);
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div className="dual-pane animate-fade-in" style={{ height: "calc(100vh - 140px)" }}>
      
      {/* Left File Tree Pane */}
      <div className="pane-left" style={{ width: "240px" }}>
        <h3 className="form-label" style={{ marginBottom: "12px" }}>Workspace Directory</h3>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {project.folderStructure ? renderTree(project.folderStructure) : <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>No tree available</p>}
        </div>
      </div>

      {/* Middle Code Viewer Pane */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "1px solid var(--border-light)", paddingRight: "20px", height: "100%", overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexShrink: 0 }}>
          <span style={{ fontSize: "14px", fontWeight: "600", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
            {selectedFile || "Select a file..."}
          </span>
          <span className="badge" style={{ fontSize: "10px" }}>{fileData.language || "text"}</span>
        </div>

        <div style={{
          flex: 1, background: "rgba(10, 11, 19, 0.7)", border: "1px solid var(--border-light)",
          borderRadius: "8px", overflow: "auto", fontFamily: "var(--font-mono)", fontSize: "13px",
          lineHeight: "1.6", padding: "16px"
        }}>
          {fileData.code ? (
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
              <tbody>
                {fileData.code.split("\n").map((line, idx) => (
                  <tr key={idx} style={{ verticalAlign: "top" }}>
                    <td style={{
                      width: "30px", color: "var(--text-muted)", textAlign: "right",
                      paddingRight: "16px", borderRight: "1px solid var(--border-light)", userSelect: "none"
                    }}>
                      {idx + 1}
                    </td>
                    <td style={{ paddingLeft: "16px", whiteSpace: "pre", color: "var(--text-primary)" }}>
                      {line || " "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "40px 0", textAlign: "center", color: "var(--text-muted)" }}>
              No file content loaded. Select a file from the workspace explorer.
            </div>
          )}
        </div>
      </div>

      {/* Right Analysis Pane */}
      <div style={{ width: "350px", flexShrink: 0, display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border-light)", paddingBottom: "12px", marginBottom: "16px", flexShrink: 0 }}>
          <button
            onClick={() => setRightTab("analysis")}
            style={{
              background: "none", border: "none", color: rightTab === "analysis" ? "white" : "var(--text-secondary)",
              fontSize: "12px", fontWeight: rightTab === "analysis" ? "600" : "400", cursor: "pointer",
              borderBottom: rightTab === "analysis" ? "2px solid var(--primary)" : "none", paddingBottom: "4px"
            }}
          >
            Module Explanations
          </button>
          <button
            onClick={() => setRightTab("chat")}
            style={{
              background: "none", border: "none", color: rightTab === "chat" ? "white" : "var(--text-secondary)",
              fontSize: "12px", fontWeight: rightTab === "chat" ? "600" : "400", cursor: "pointer",
              borderBottom: rightTab === "chat" ? "2px solid var(--primary)" : "none", paddingBottom: "4px"
            }}
          >
            Review Chat
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }}>
          {rightTab === "analysis" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="card" style={{ padding: "16px" }}>
                <h4 style={{ fontSize: "12px", color: "var(--accent-cyan)", textTransform: "uppercase", marginBottom: "6px" }}>File Purpose</h4>
                <p style={{ fontSize: "13px", lineHeight: "1.4", color: "var(--text-secondary)" }}>{fileData.explanation}</p>
              </div>

              {fileData.classes && fileData.classes.length > 0 && (
                <div className="card" style={{ padding: "16px" }}>
                  <h4 style={{ fontSize: "12px", color: "var(--secondary)", textTransform: "uppercase", marginBottom: "6px" }}>Classes ({fileData.classes.length})</h4>
                  {fileData.classes.map((cls, idx) => (
                    <div key={idx} style={{ fontSize: "13px", marginBottom: "4px" }}>
                      <code style={{ color: "white", fontWeight: "600" }}>{cls.name}</code>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{cls.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              {fileData.functions && fileData.functions.length > 0 && (
                <div className="card" style={{ padding: "16px" }}>
                  <h4 style={{ fontSize: "12px", color: "var(--accent-green)", textTransform: "uppercase", marginBottom: "6px" }}>Functions ({fileData.functions.length})</h4>
                  {fileData.functions.map((func, idx) => (
                    <div key={idx} style={{ fontSize: "13px", marginBottom: "4px" }}>
                      <code style={{ color: "white" }}>{func.name}()</code>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{func.desc}</div>
                    </div>
                  ))}
                </div>
              )}

              <div className="card" style={{ padding: "16px" }}>
                <h4 style={{ fontSize: "12px", color: "var(--accent-gold)", textTransform: "uppercase", marginBottom: "6px" }}>Algorithm & Data Flow</h4>
                <p style={{ fontSize: "13px", marginBottom: "6px" }}><strong>Algo:</strong> {fileData.algorithm}</p>
                <p style={{ fontSize: "13px" }}><strong>Flow:</strong> {fileData.dataFlow}</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <div style={{
                flex: 1, border: "1px solid var(--border-light)", borderRadius: "8px",
                background: "rgba(0,0,0,0.2)", padding: "12px", overflowY: "auto", marginBottom: "12px",
                fontSize: "13px", display: "flex", flexDirection: "column", gap: "8px"
              }}>
                {chatHistory.length === 0 ? (
                  <p style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "20px" }}>
                    Ask a question about this file. E.g., "Explain what the ordered_crossover function does here."
                  </p>
                ) : (
                  chatHistory.map((ch, idx) => (
                    <div key={idx} style={{
                      padding: "8px 12px", borderRadius: "6px",
                      background: ch.role === "user" ? "rgba(99, 102, 241, 0.15)" : "rgba(255,255,255,0.03)",
                      alignSelf: ch.role === "user" ? "flex-end" : "flex-start",
                      maxWidth: "90%", whiteSpace: "pre-line"
                    }}>
                      <strong>{ch.role === "user" ? "You" : "Reviewer"}:</strong>
                      <div style={{ marginTop: "4px", color: "var(--text-secondary)" }}>{ch.text}</div>
                    </div>
                  ))
                )}
                {loadingChat && <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>Thinking...</div>}
              </div>

              <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ask about code..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAskFile()}
                  disabled={loadingChat}
                />
                <button className="btn" onClick={handleAskFile} disabled={loadingChat} style={{ padding: "8px 12px" }}>Send</button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
