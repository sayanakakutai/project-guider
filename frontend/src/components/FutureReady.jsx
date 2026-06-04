import React, { useState } from "react";

export default function FutureReady() {
  const [vectorDb, setVectorDb] = useState("ChromaDB");
  const [chunkSize, setChunkSize] = useState(500);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  
  const [ocrFile, setOcrFile] = useState(null);
  const [ocrRunning, setOcrRunning] = useState(false);
  const [ocrLogs, setOcrLogs] = useState([]);
  const [ocrDiagramCode, setOcrDiagramCode] = useState("");

  const handleSimulateOCR = () => {
    if (!ocrFile) {
      alert("Please upload a mock diagram image first.");
      return;
    }
    setOcrRunning(true);
    setOcrLogs(["Loading image array into GPU memory...", "Executing Vision-Language Model..."]);

    setTimeout(() => {
      setOcrLogs(p => [...p, "Detecting flow chart nodes and arrows..."]);
    }, 1000);

    setTimeout(() => {
      setOcrLogs(p => [...p, "Running Tesseract OCR for text segments..."]);
    }, 2000);

    setTimeout(() => {
      setOcrLogs(p => [...p, "Synthesizing Mermaid.js diagram sequence..."]);
      setOcrDiagramCode(`graph LR\n  Client[React App] -->|HTTPS| Server[FastAPI Gateway]\n  Server -->|Write| DB[(Postgres Database)]`);
      setOcrRunning(false);
    }, 3000);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Future-Ready AI Settings</h1>

      <div className="grid-2">
        
        {/* RAG Settings */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--accent-cyan)" }}>RAG & Semantic Search Config</h3>
          
          <div className="form-group">
            <label className="form-label">Vector Database</label>
            <select className="form-input" value={vectorDb} onChange={(e) => setVectorDb(e.target.value)}>
              <option value="ChromaDB">ChromaDB (Local SQLite)</option>
              <option value="Pinecone">Pinecone (Cloud SaaS)</option>
              <option value="FAISS">FAISS (Meta library)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Chunk Size (Characters)</label>
            <input type="number" className="form-input" value={chunkSize} onChange={(e) => setChunkSize(parseInt(e.target.value))} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "10px" }}>
            <input
              type="checkbox"
              id="voice-toggle"
              checked={voiceEnabled}
              onChange={(e) => {
                setVoiceEnabled(e.target.checked);
                if (e.target.checked && window.speechSynthesis) {
                  const u = new SpeechSynthesisUtterance("Voice responses activated.");
                  window.speechSynthesis.speak(u);
                }
              }}
              style={{ cursor: "pointer", width: "16px", height: "16px" }}
            />
            <label htmlFor="voice-toggle" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
              Enable Voice Interactions (Text-to-Speech)
            </label>
          </div>
        </div>

        {/* OCR Simulator */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--secondary)" }}>Diagram OCR & Parsing Simulator</h3>
          
          <div className="form-group">
            <label className="form-label">Upload Architecture Image</label>
            <input
              type="file"
              className="form-input"
              accept="image/*"
              onChange={(e) => {
                setOcrFile(e.target.files[0]);
                setOcrLogs([]);
                setOcrDiagramCode("");
              }}
            />
          </div>

          <button className="btn" onClick={handleSimulateOCR} disabled={ocrRunning || !ocrFile} style={{ width: "100%", justifyContent: "center" }}>
            {ocrRunning ? "Analyzing Image..." : "Parse Architecture Image"}
          </button>

          {ocrLogs.length > 0 && (
            <div style={{
              background: "rgba(0,0,0,0.3)", padding: "12px", borderRadius: "8px",
              fontFamily: "var(--font-mono)", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px"
            }}>
              {ocrLogs.map((l, i) => <div key={i} style={{ color: "var(--accent-green)" }}>&gt; {l}</div>)}
            </div>
          )}

          {ocrDiagramCode && (
            <div className="card" style={{ background: "#06070a", padding: "12px" }}>
              <div style={{ fontSize: "11px", color: "var(--text-muted)", marginBottom: "6px" }}>Extracted Diagram Code:</div>
              <pre style={{ margin: 0, fontSize: "12px", color: "white", fontFamily: "var(--font-mono)" }}>
                {ocrDiagramCode}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
