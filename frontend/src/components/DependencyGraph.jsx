import React, { useEffect, useRef, useState } from "react";

export default function DependencyGraph({ project }) {
  const canvasRef = useRef(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [draggedNode, setDraggedNode] = useState(null);

  const graphData = project.knowledgeGraph || { nodes: [], links: [] };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Set dimensions
    const width = canvas.parentElement.clientWidth;
    const height = 450;
    canvas.width = width;
    canvas.height = height;

    // Initialize node positions and velocities
    const nodes = graphData.nodes.map((node, idx) => {
      const angle = (idx / graphData.nodes.length) * 2 * Math.PI;
      const radius = 100 + Math.random() * 80;
      return {
        ...node,
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        r: 12
      };
    });

    const links = graphData.links.map(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      return {
        ...link,
        sourceNode,
        targetNode
      };
    }).filter(l => l.sourceNode && l.targetNode);

    let animationFrameId;

    // Simple force-directed physics engine
    const tick = () => {
      // 1. Repulsion force between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 180) {
            const force = (180 - dist) * 0.05;
            const fx = (dx / dist) * force;
            const fy = (dy / dist) * force;
            if (nodes[j] !== draggedNode) {
              nodes[j].vx += fx;
              nodes[j].vy += fy;
            }
            if (nodes[i] !== draggedNode) {
              nodes[i].vx -= fx;
              nodes[i].vy -= fy;
            }
          }
        }
      }

      // 2. Attraction force along links
      links.forEach(link => {
        const dx = link.targetNode.x - link.sourceNode.x;
        const dy = link.targetNode.y - link.sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = 100;
        const force = (dist - targetDist) * 0.015;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        if (link.targetNode !== draggedNode) {
          link.targetNode.vx -= fx;
          link.targetNode.vy -= fy;
        }
        if (link.sourceNode !== draggedNode) {
          link.sourceNode.vx += fx;
          link.sourceNode.vy += fy;
        }
      });

      // 3. Central gravity force
      nodes.forEach(node => {
        if (node === draggedNode) return;
        const dx = width / 2 - node.x;
        const dy = height / 2 - node.y;
        node.vx += dx * 0.005;
        node.vy += dy * 0.005;
      });

      // 4. Update coordinates and apply damping friction
      nodes.forEach(node => {
        if (node === draggedNode) return;
        node.x += node.vx;
        node.y += node.vy;
        node.vx *= 0.85;
        node.vy *= 0.85;

        // Keep inside bounds
        node.x = Math.max(node.r, Math.min(width - node.r, node.x));
        node.y = Math.max(node.r, Math.min(height - node.r, node.y));
      });

      // Draw Canvas Frame
      ctx.clearRect(0, 0, width, height);

      // Draw grid backing
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Links
      links.forEach(link => {
        ctx.beginPath();
        ctx.moveTo(link.sourceNode.x, link.sourceNode.y);
        ctx.lineTo(link.targetNode.x, link.targetNode.y);
        
        const isRelated = hoveredNode && (link.sourceNode.id === hoveredNode.id || link.targetNode.id === hoveredNode.id);
        ctx.strokeStyle = isRelated ? "rgba(99, 102, 241, 0.6)" : "rgba(255, 255, 255, 0.08)";
        ctx.lineWidth = isRelated ? 2 : 1;
        ctx.stroke();
      });

      // Draw Nodes
      nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.r, 0, 2 * Math.PI);
        
        let color = "#6366f1"; // Primary Indigo
        if (node.group === "frontend") color = "#06b6d4"; // Cyan
        if (node.group === "database") color = "#10b981"; // Green

        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = hoveredNode?.id === node.id ? 15 : 0;
        ctx.fill();
        ctx.shadowBlur = 0; // reset

        // Label
        ctx.fillStyle = hoveredNode?.id === node.id ? "white" : "rgba(255,255,255,0.7)";
        ctx.font = hoveredNode?.id === node.id ? "bold 11px var(--font-mono)" : "9px var(--font-mono)";
        ctx.textAlign = "center";
        ctx.fillText(node.label, node.x, node.y - node.r - 6);
      });

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    // Event listeners
    const getMousePos = (e) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseDown = (e) => {
      const pos = getMousePos(e);
      const clicked = nodes.find(n => {
        const dx = n.x - pos.x;
        const dy = n.y - pos.y;
        return Math.sqrt(dx * dx + dy * dy) < n.r + 5;
      });

      if (clicked) {
        setDraggedNode(clicked);
      }
    };

    const handleMouseMove = (e) => {
      const pos = getMousePos(e);
      
      if (draggedNode) {
        draggedNode.x = pos.x;
        draggedNode.y = pos.y;
        draggedNode.vx = 0;
        draggedNode.vy = 0;
      } else {
        const hover = nodes.find(n => {
          const dx = n.x - pos.x;
          const dy = n.y - pos.y;
          return Math.sqrt(dx * dx + dy * dy) < n.r + 5;
        });
        setHoveredNode(hover || null);
      }
    };

    const handleMouseUp = () => {
      setDraggedNode(null);
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [graphData]);

  return (
    <div className="animate-fade-in">
      <h1 className="section-title">Knowledge Graph Engine</h1>
      <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px" }}>
        Interactive dependency network showing files, imports, databases, and APIs. Drag nodes around to see relationships bounce and align.
      </p>

      <div className="card" style={{ padding: "10px", background: "rgba(10,11,18,0.85)" }}>
        <canvas ref={canvasRef} style={{ display: "block", borderRadius: "8px", background: "#06070a" }} />
      </div>

      <div style={{ display: "flex", gap: "20px", marginTop: "16px", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#6366f1" }} />
          <span>Backend Files</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#06b6d4" }} />
          <span>Frontend UI</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10b981" }} />
          <span>Databases / Cache</span>
        </div>
      </div>
    </div>
  );
}
