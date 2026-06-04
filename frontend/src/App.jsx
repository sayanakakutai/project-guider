import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import UploadModal from "./components/UploadModal";

// Import modules
import ProjectExplainer from "./components/ProjectExplainer";
import CodeExplorer from "./components/CodeExplorer";
import ArchitectureViewer from "./components/ArchitectureViewer";
import TechAnalyzer from "./components/TechAnalyzer";
import LiveSearch from "./components/LiveSearch";
import DocGenerator from "./components/DocGenerator";
import PrepCenter from "./components/PrepCenter";
import MockInterview from "./components/MockInterview";
import VivaSimulator from "./components/VivaSimulator";
import Debugger from "./components/Debugger";
import ImprovementHub from "./components/ImprovementHub";
import ResumeLinkedIn from "./components/ResumeLinkedIn";
import CareerRoadmap from "./components/CareerRoadmap";
import RepoChat from "./components/RepoChat";
import DependencyGraph from "./components/DependencyGraph";
import AgentVisualizer from "./components/AgentVisualizer";
import ProjectHealth from "./components/ProjectHealth";
import PresentationMaker from "./components/PresentationMaker";
import ReportGenerator from "./components/ReportGenerator";
import FutureReady from "./components/FutureReady";

export default function App() {
  const [activeModule, setActiveModule] = useState("explainer");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");
  const [project, setProject] = useState(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  // Sync API Key to localStorage
  useEffect(() => {
    localStorage.setItem("gemini_api_key", apiKey);
  }, [apiKey]);

  // Load Demo Project on startup
  useEffect(() => {
    const fetchDemo = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/demo-project");
        const resJson = await response.json();
        if (resJson.success) {
          setProject(resJson.data);
        } else {
          loadLocalDemoFallback();
        }
      } catch (err) {
        console.warn("Backend not yet running. Falling back to local static import.");
        loadLocalDemoFallback();
      }
    };
    fetchDemo();
  }, []);

  const loadLocalDemoFallback = async () => {
    // Dynamic import to avoid bundle bloat if needed, or import directly
    try {
      const { demoProjectData } = await import("../../backend/demoProjectData.js");
      setProject(demoProjectData);
    } catch (e) {
      console.error("Local fallback import failed:", e);
    }
  };

  const handleResetToDemo = async () => {
    setIsDemo(true);
    try {
      const response = await fetch("http://localhost:5000/api/demo-project");
      const resJson = await response.json();
      if (resJson.success) {
        setProject(resJson.data);
      }
    } catch (e) {
      loadLocalDemoFallback();
    }
  };

  // Render view depending on sidebar select
  const renderModuleContent = () => {
    if (!project) {
      return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
          Loading Project Data...
        </div>
      );
    }

    switch (activeModule) {
      case "explainer":
        return <ProjectExplainer project={project} />;
      case "explorer":
        return <CodeExplorer project={project} apiKey={apiKey} />;
      case "architecture":
        return <ArchitectureViewer project={project} />;
      case "tech-analyzer":
      case "learning":
        return <TechAnalyzer project={project} />;
      case "graph":
        return <DependencyGraph project={project} />;
      case "agent-visualizer":
        return <AgentVisualizer />;
      case "chat":
        return <RepoChat project={project} apiKey={apiKey} />;
      case "live-search":
        return <LiveSearch apiKey={apiKey} />;
      case "prep":
        return <PrepCenter project={project} />;
      case "mock-interview":
        return <MockInterview project={project} apiKey={apiKey} />;
      case "viva-simulator":
        return <VivaSimulator project={project} apiKey={apiKey} />;
      case "docs":
        return <DocGenerator project={project} />;
      case "reports":
        return <ReportGenerator project={project} />;
      case "slides":
        return <PresentationMaker project={project} />;
      case "debugger":
        return <Debugger project={project} />;
      case "improvements":
        return <ImprovementHub project={project} />;
      case "health":
        return <ProjectHealth project={project} />;
      case "career":
        return <CareerRoadmap project={project} />;
      case "resume-linkedin":
        return <ResumeLinkedIn project={project} />;
      case "future-ready":
        return <FutureReady />;
      default:
        return <ProjectExplainer project={project} />;
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        healthScore={project?.healthScores?.iq || null}
      />

      {/* Main Content Area */}
      <div className="main-panel">
        <Header
          projectName={project?.name}
          apiKeyValue={apiKey}
          setApiKey={setApiKey}
          onOpenUpload={() => setIsUploadOpen(true)}
          onResetToDemo={handleResetToDemo}
          isDemo={isDemo}
        />

        <main className="panel-content">
          {renderModuleContent()}
        </main>
      </div>

      {/* Upload ZIP Modal Overlay */}
      <UploadModal
        isOpen={isUploadOpen}
        apiKey={apiKey}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={(data) => {
          setProject(data);
          setIsDemo(false);
        }}
      />
    </div>
  );
}
