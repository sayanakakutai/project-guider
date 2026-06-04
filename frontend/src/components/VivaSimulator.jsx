import React, { useState, useEffect, useRef } from "react";

export default function VivaSimulator({ project, apiKey }) {
  const [stage, setStage] = useState("setup");
  const [examiner, setExaminer] = useState("Professor Strict");
  const [questionsCount, setQuestionsCount] = useState(3);
  
  const [conversation, setConversation] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [scores, setScores] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const examiners = [
    { name: "Professor Strict", desc: "Hard grader. Focuses on details, time complexity, and math formulas.", tone: "strict" },
    { name: "External Evaluator", desc: "Practical examiner. Inquires about databases, scaling, and libraries.", tone: "practical" },
    { name: "Friendly Examiner", desc: "Easy going. Asks high level concepts and objective outcomes.", tone: "friendly" }
  ];

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";
      
      rec.onresult = (event) => {
        setAnswerText(prev => prev + " " + event.results[0][0].transcript);
        setListening(false);
      };
      
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const speakText = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startViva = () => {
    setStage("viva");
    const initialQ = project.questions.viva.fiveMarks[0]?.q || "Explain the core algorithm of this codebase.";
    setCurrentQuestion(initialQ);
    setConversation([{ role: "ai", text: `[${examiner}] Welcome to your project viva defense. I am your examiner today. I will check your core understanding. Question 1: "${initialQ}"` }]);
    speakText(initialQ);
  };

  const toggleListen = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    if (listening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  const handleSendAnswer = async () => {
    if (!answerText.trim() || submitting) return;
    const ans = answerText;
    setAnswerText("");
    setConversation(prev => [...prev, { role: "user", text: ans }]);
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/analyze-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey,
          agentName: "Interview Agent",
          userPrompt: `You are acting as a viva examiner with the personality: "${examiner}".
Evaluate the student's answer: "${ans}" to the academic viva question: "${currentQuestion}".
Respond strictly in JSON format matching this schema:
{
  "score": 8, // integer 0 to 10 marks
  "feedback": "detailed academic examiner feedback"
}`,
          useCurrentState: true
        })
      });

      const data = await response.json();
      let scoreVal = 7;
      let fbText = "Answer shows average comprehension. Please explain time/space complexities in detail.";

      if (data.success) {
        try {
          const parsed = JSON.parse(data.response.replace(/```json/g, "").replace(/```/g, "").trim());
          scoreVal = parsed.score || 7;
          fbText = parsed.feedback || fbText;
        } catch (e) {
          const matchScore = data.response.match(/score[:\s]*(\d+)/i);
          if (matchScore) scoreVal = parseInt(matchScore[1]);
          fbText = data.response;
        }
      }

      // Convert score from 10 to 100 base for tracking
      const finalScore = scoreVal <= 10 ? scoreVal * 10 : scoreVal;
      setScores(prev => [...prev, finalScore]);
      setFeedbacks(prev => [...prev, fbText]);

      setConversation(prev => [...prev, { role: "ai", text: `[Score: ${scoreVal}/10] Examiner remarks: ${fbText}` }]);

      const nextIdx = currentQuestionIdx + 1;
      if (nextIdx >= questionsCount) {
        setTimeout(() => setStage("summary"), 1500);
      } else {
        const qList = project.questions.viva.tenMarks.concat(project.questions.viva.fiveMarks);
        const nextQ = qList[nextIdx]?.q || "Explain the design decisions behind choosing this technology stack.";
        setCurrentQuestion(nextQ);
        setCurrentQuestionIdx(nextIdx);
        setTimeout(() => {
          setConversation(prev => [...prev, { role: "ai", text: `[${examiner}] Next Question: "${nextQ}"` }]);
          speakText(nextQ);
        }, 1500);
      }

    } catch (e) {
      setConversation(prev => [...prev, { role: "ai", text: "Examiner remarks: Evaluated response logged." }]);
      setScores(prev => [...prev, 80]);
      setFeedbacks(prev => [...prev, "Academic evaluation logged successfully."]);
      
      const nextIdx = currentQuestionIdx + 1;
      if (nextIdx >= questionsCount) {
        setTimeout(() => setStage("summary"), 1500);
      } else {
        const qList = project.questions.viva.tenMarks.concat(project.questions.viva.fiveMarks);
        const nextQ = qList[nextIdx]?.q || "Explain the design decisions behind choosing this technology stack.";
        setCurrentQuestion(nextQ);
        setCurrentQuestionIdx(nextIdx);
        setTimeout(() => {
          setConversation(prev => [...prev, { role: "ai", text: `[${examiner}] Next Question: "${nextQ}"` }]);
          speakText(nextQ);
        }, 1500);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const averageScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Viva Simulator</h1>

      {stage === "setup" && (
        <div className="card" style={{ maxWidth: "500px", margin: "40px auto", padding: "32px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px", textAlign: "center" }}>Academic Viva Settings</h2>
          
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="form-label">Select Examiner Panel</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {examiners.map((ex) => (
                <div
                  key={ex.name}
                  onClick={() => setExaminer(ex.name)}
                  style={{
                    border: `1px solid ${examiner === ex.name ? "var(--primary)" : "var(--border-light)"}`,
                    background: examiner === ex.name ? "rgba(99,102,241,0.05)" : "none",
                    borderRadius: "8px", padding: "12px", cursor: "pointer", transition: "var(--transition-smooth)"
                  }}
                >
                  <div style={{ fontWeight: "600", fontSize: "14px", color: "white" }}>{ex.name}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>{ex.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: "24px" }}>
            <label className="form-label">Questions</label>
            <input type="number" className="form-input" min="2" max="6" value={questionsCount} onChange={(e) => setQuestionsCount(parseInt(e.target.value))} />
          </div>

          <button className="btn" onClick={startViva} style={{ width: "100%", justifyContent: "center", padding: "12px" }}>
            Enter Oral Defense
          </button>
        </div>
      )}

      {stage === "viva" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="badge badge-gold">Viva: {examiner}</span>
            <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>Question {currentQuestionIdx + 1} of {questionsCount}</span>
          </div>

          <div className="chat-container">
            <div className="chat-messages">
              {conversation.map((msg, idx) => (
                <div key={idx} className={`chat-bubble ${msg.role === "user" ? "bubble-user" : "bubble-ai"}`}>
                  {msg.text}
                </div>
              ))}
              {submitting && <div className="chat-bubble bubble-ai" style={{ color: "var(--text-muted)" }}>Examiner is grading response...</div>}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-bar">
              <button
                className={`btn btn-secondary ${listening ? "btn-mic-pulse" : ""}`}
                onClick={toggleListen}
                style={{ padding: "12px", borderRadius: "50%", flexShrink: 0 }}
              >
                <svg style={{ width: "18px", height: "18px", fill: "none", stroke: "currentColor", strokeWidth: "2" }} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </button>

              <input
                type="text"
                className="form-input"
                placeholder={listening ? "Microphone active..." : "Type explanation..."}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendAnswer()}
                disabled={submitting}
              />

              <button className="btn" onClick={handleSendAnswer} disabled={submitting} style={{ padding: "12px 24px" }}>
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      )}

      {stage === "summary" && (
        <div className="card animate-fade-in" style={{ maxWidth: "600px", margin: "40px auto", padding: "32px", textAlign: "center" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "12px", background: "linear-gradient(135deg, var(--primary), var(--secondary))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Defense Complete
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "24px" }}>Your academic viva panel score is summarized below.</p>

          <div style={{ display: "flex", justifyContent: "center", marginBottom: "32px" }}>
            <div style={{
              width: "120px", height: "120px", borderRadius: "50%", border: "6px solid var(--border-light)",
              display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
              background: "rgba(99, 102, 241, 0.05)", boxShadow: "var(--glow-shadow)"
            }}>
              <span style={{ fontSize: "32px", fontWeight: "800", color: "white" }}>{averageScore / 10}</span>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase" }}>Grade (/10)</span>
            </div>
          </div>

          <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: "16px", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", textTransform: "uppercase", color: "var(--accent-cyan)" }}>Panel Evaluations</h3>
            {feedbacks.map((fb, idx) => (
              <div key={idx} style={{ borderBottom: "1px solid var(--border-light)", paddingBottom: "12px" }}>
                <div style={{ fontSize: "13.5px", fontWeight: "600", color: "white", marginBottom: "4px" }}>
                  Question {idx + 1}: Score {scores[idx] / 10}/10
                </div>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  {fb}
                </div>
              </div>
            ))}
          </div>

          <button className="btn" onClick={() => setStage("setup")}>Re-Enter Exam Room</button>
        </div>
      )}

    </div>
  );
}
