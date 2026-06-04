import React, { useState } from "react";

export default function UploadModal({ isOpen, apiKey, onClose, onUploadSuccess }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [githubUrl, setGithubUrl] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError("");
  };

  const handleUpload = async () => {
    if (!selectedFile && !githubUrl && !webUrl) {
      setError("Please select a file, input a GitHub URL, or input a Web URL.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      if (apiKey) {
        formData.append("apiKey", apiKey);
      }

      if (selectedFile) {
        formData.append("projectFile", selectedFile);
      } else if (githubUrl) {
        formData.append("githubUrl", githubUrl);
      } else {
        formData.append("webUrl", webUrl);
      }

      const response = await fetch("http://localhost:5000/api/upload", {
        method: "POST",
        body: formData
      });

      const resJson = await response.json();
      if (resJson.success) {
        onUploadSuccess(resJson.data);
        onClose();
      } else {
        setError(resJson.message || "Failed to analyze codebase.");
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Make sure your Node.js backend is running on port 5000.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.75)", zIndex: 100, display: "flex",
      alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)"
    }}>
      <div className="card animate-fade-in" style={{ width: "500px", padding: "32px", border: "1px solid rgba(255,255,255,0.1)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700" }}>Upload Codebase or Resource</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "18px" }}>&times;</button>
        </div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label className="form-label">Drag & Drop ZIP, PDF, Image or code files</label>
          <div style={{
            border: "2px dashed var(--border-light)", borderRadius: "8px", padding: "32px",
            textAlign: "center", background: "rgba(255,255,255,0.01)", cursor: "pointer",
            transition: "var(--transition-smooth)"
          }}
               onClick={() => document.getElementById("file-uploader").click()}
               onDragOver={(e) => e.preventDefault()}
               onDrop={(e) => { e.preventDefault(); setSelectedFile(e.dataTransfer.files[0]); }}
          >
            <svg style={{ width: "32px", height: "32px", color: "var(--text-muted)", margin: "0 auto 12px", display: "block" }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {selectedFile ? selectedFile.name : "Select ZIP, PDF, Image or Source file"}
            </span>
            <input
              type="file"
              id="file-uploader"
              accept=".zip,.pdf,.py,.js,.jsx,.ts,.tsx,.java,.c,.cpp,.h,.kt,.swift,.php,.go,.rs,.sql,.png,.jpg,.jpeg,.webp,.gif"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>

        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "11px", margin: "8px 0" }}>OR</div>

        <div className="form-group" style={{ marginBottom: "16px" }}>
          <label className="form-label">Import from GitHub Repository</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://github.com/user/repo"
            value={githubUrl}
            onChange={(e) => { setGithubUrl(e.target.value); setError(""); }}
          />
        </div>

        <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "11px", margin: "8px 0" }}>OR</div>

        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label className="form-label">Import from Web Documentation URL</label>
          <input
            type="text"
            className="form-input"
            placeholder="https://docs.example.com/guide"
            value={webUrl}
            onChange={(e) => { setWebUrl(e.target.value); setError(""); }}
          />
        </div>

        {error && <div style={{ color: "var(--accent-red)", fontSize: "13px", marginBottom: "16px" }}>{error}</div>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button className="btn btn-secondary" onClick={onClose} disabled={uploading}>Cancel</button>
          <button className="btn" onClick={handleUpload} disabled={uploading}>
            {uploading ? "Analyzing..." : "Confirm & Import"}
          </button>
        </div>
      </div>
    </div>
  );
}
