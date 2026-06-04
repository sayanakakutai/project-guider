import React, { useState } from "react";

export default function AgentVisualizer() {
  const [activeStep, setActiveStep] = useState(0);
  const [promptInput, setPromptInput] = useState("");
  const [simulating, setSimulating] = useState(false);

  const agents = [
    { name: "Project Analyst Agent", role: "Summarizes objective & target scope", color: "var(--primary)" },
    { name: "Code Review Agent", role: "Evaluates syntax rules & scopes", color: "var(--accent-cyan)" },
    { name: "Architecture Agent", role: "Traces component diagrams", color: "var(--secondary)" },
    { name: "Security Agent", role: "Scans exposed secrets", color: "var(--accent-red)" },
    { name: "Debugging Agent", role: "Prepares optimization diffs", color: "var(--accent-gold)" },
    { name: "Documentation Agent", role: "Compiles manuals & readmes", color: "var(--accent-green)" }
  ];

  const steps = [
    { agentIdx: 0, text: "Project Analyst Agent is loading directory mapping..." },
    { agentIdx: 1, text: "Code Review Agent is checking line conventions..." },
    { agentIdx: 3, text: "Security Agent is searching for exposed credentials..." },
    { agentIdx: 2, text: "Architecture Agent is verifying network integrations..." },
    { agentIdx: 4, text: "Debugging Agent is parsing heap and time complexities..." },
    { agentIdx: 5, text: "Documentation Agent is compiling report sections..." }
  ];

  const handleSimulate = () => {
    if (simulating) return;
    setSimulating(true);
    setActiveStep(0);

    const runStep = (idx) => {
      if (idx >= steps.length) {
        setSimulating(false);
        return;
      }
      setActiveStep(idx);
      setTimeout(() => runStep(idx + 1), 1500);
    };

    runStep(0);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">AI Multi-Agent System</h1>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>
        Triggers collaborative chains where specialized AI agents negotiate code explanations, security reviews, and architecture diagrams.
      </p>

      {/* Input query */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "12px" }}>Input Complex Multi-Agent Instruction</h3>
        <div style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Generate a complete security audit, architecture chart, and developer readme."
            value={promptInput}
            onChange={(e) => setPromptInput(e.target.value)}
            disabled={simulating}
          />
          <button className="btn" onClick={handleSimulate} disabled={simulating}>
            {simulating ? "Collaborating..." : "Execute Chain"}
          </button>
        </div>
      </div>

      <div className="grid-2">
        {/* Agent Grid */}
        <div className="card">
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Specialized Agents Directory</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {agents.map((agent, idx) => {
              const isActive = simulating && steps[activeStep]?.agentIdx === idx;
              return (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${isActive ? agent.color : "var(--border-light)"}`,
                    background: isActive ? "rgba(255,255,255,0.03)" : "none",
                    boxShadow: isActive ? `0 0 10px ${agent.color}` : "none",
                    borderRadius: "8px", padding: "12px", display: "flex", alignItems: "center", gap: "12px",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <div style={{
                    width: "12px", height: "12px", borderRadius: "50%", background: agent.color,
                    animation: isActive ? "pulseMic 1s infinite" : "none"
                  }} />
                  <div>
                    <div style={{ fontWeight: "700", fontSize: "13.5px", color: "white" }}>{agent.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>{agent.role}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live message queue */}
        <div className="card" style={{ display: "flex", flexDirection: "column", height: "390px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px", color: "var(--accent-cyan)" }}>Collaborative Message Queue</h3>
          
          <div style={{
            flex: 1, background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "16px",
            fontFamily: "var(--font-mono)", fontSize: "12.5px", overflowY: "auto", display: "flex",
            flexDirection: "column", gap: "12px"
          }}>
            {!simulating && activeStep === 0 ? (
              <div style={{ color: "var(--text-muted)", textAlign: "center", marginTop: "80px" }}>
                Click "Execute Chain" to watch the agents communicate in real time.
              </div>
            ) : (
              steps.slice(0, activeStep + 1).map((s, idx) => (
                <div key={idx} style={{
                  padding: "8px 12px", borderRadius: "6px", background: "rgba(255,255,255,0.02)",
                  borderLeft: `3px solid ${agents[s.agentIdx].color}`
                }}>
                  <div style={{ fontSize: "10px", color: "var(--text-muted)", marginBottom: "4px" }}>
                    {agents[s.agentIdx].name} &rarr; Broadcast Queue
                  </div>
                  <div style={{ color: "white" }}>{s.text}</div>
                </div>
              ))
            )}
            {simulating && <div style={{ color: "var(--accent-gold)", animation: "pulseMic 1s infinite" }}>&gt; Ingesting message events...</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
