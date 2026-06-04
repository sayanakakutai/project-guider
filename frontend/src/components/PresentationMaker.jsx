import React, { useState } from "react";

export default function PresentationMaker({ project }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [presentationStyle, setPresentationStyle] = useState("viva"); // viva or investor

  const slides = project.presentation || [];

  const handleNext = () => {
    if (slideIdx < slides.length - 1) setSlideIdx(slideIdx + 1);
  };

  const handlePrev = () => {
    if (slideIdx > 0) setSlideIdx(slideIdx - 1);
  };

  const currentSlide = slides[slideIdx] || { title: "Title", bullets: [], notes: "Notes" };

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">PPT Presentation Generator</h1>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            className={`btn ${presentationStyle === "viva" ? "" : "btn-secondary"}`}
            onClick={() => { setPresentationStyle("viva"); setSlideIdx(0); }}
          >
            Academic Viva Slides
          </button>
          <button
            className={`btn ${presentationStyle === "investor" ? "" : "btn-secondary"}`}
            onClick={() => { setPresentationStyle("investor"); setSlideIdx(0); }}
          >
            Investor Pitch Slides
          </button>
        </div>

        <span style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Slide {slideIdx + 1} of {slides.length}
        </span>
      </div>

      <div className="grid-2" style={{ alignItems: "stretch" }}>
        {/* Slide Frame */}
        <div className="slide-frame">
          <h2 style={{ fontSize: "28px", fontWeight: "800", color: "white", marginBottom: "24px" }}>
            {currentSlide.title}
          </h2>
          
          <ul style={{
            textAlign: "left", fontSize: "16px", color: "var(--text-secondary)",
            display: "flex", flexDirection: "column", gap: "12px", maxWidth: "80%", margin: "0 auto"
          }}>
            {currentSlide.bullets.map((bullet, idx) => (
              <li key={idx} style={{ lineHeight: "1.5" }}>{bullet}</li>
            ))}
          </ul>

          {/* Slide Navigation Controls overlay */}
          <div style={{ position: "absolute", bottom: "24px", left: "0", width: "100%", display: "flex", justifyContent: "center", gap: "16px" }}>
            <button className="btn btn-secondary" onClick={handlePrev} disabled={slideIdx === 0} style={{ padding: "8px 16px" }}>
              Previous
            </button>
            <button className="btn btn-secondary" onClick={handleNext} disabled={slideIdx === slides.length - 1} style={{ padding: "8px 16px" }}>
              Next
            </button>
          </div>
        </div>

        {/* Speaker Notes */}
        <div className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <h3 style={{ fontSize: "14px", textTransform: "uppercase", color: "var(--accent-cyan)", marginBottom: "12px", fontWeight: "700" }}>
              Speaker Delivery Notes
            </h3>
            <p style={{ fontSize: "14.5px", lineHeight: "1.6", color: "var(--text-secondary)", whiteSpace: "pre-wrap" }}>
              {currentSlide.notes}
            </p>
          </div>

          <div style={{ borderTop: "1px solid var(--border-light)", paddingTop: "16px", marginTop: "16px" }}>
            <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              Tip: Click "Copy Slide Outline" below to extract this presentation as a structured text document.
            </div>
            <button
              className="btn btn-secondary"
              style={{ marginTop: "12px", width: "100%", justifyContent: "center" }}
              onClick={() => {
                navigator.clipboard.writeText(slides.map((s, i) => `Slide ${i+1}: ${s.title}\nBullets:\n${s.bullets.map(b => `- ${b}`).join("\n")}`).join("\n\n"));
                alert("Slide outlines copied!");
              }}
            >
              Copy Slide Outline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
