import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";
import pdfParse from "pdf-parse";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { demoProjectData } from "./demoProjectData.js";
import { getLanguage, parseDependencies, detectTechnologies, parseFileEntities, scanBugsAndIssues, computeHealthScores } from "./analyzer.js";
import { invokeAgent } from "./agents.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure upload storage
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// Temporary global variable to hold the currently analyzed project state
let currentProjectState = null;

// Helper: Download ZIP from GitHub repository
async function downloadGithubZip(githubUrl) {
  const cleanUrl = githubUrl.replace(/\.git$/, "").replace(/\/$/, "");
  const parts = cleanUrl.split("/");
  const repo = parts.pop();
  const owner = parts.pop();

  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL format. Use https://github.com/owner/repo");
  }

  let zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/main.zip`;
  let response = await fetch(zipUrl);
  if (!response.ok) {
    zipUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/master.zip`;
    response = await fetch(zipUrl);
  }

  if (!response.ok) {
    throw new Error(`Failed to download repository ZIP from GitHub. HTTP status: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Helper: Fetch and clean text from web URL
async function fetchWebUrlText(webUrl) {
  const response = await fetch(webUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch web URL. HTTP status: ${response.status}`);
  }
  const html = await response.text();

  // Strip scripts, styles, and html tags
  const cleanText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  return cleanText.slice(0, 15000); // Limit to 15k characters
}

// Helper: Call Gemini to analyze technical images/architecture diagrams
async function analyzeImageWithGemini(apiKey, buffer, mimeType) {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const promptText = `
You are the Architecture Agent and Project Analyst Agent.
Analyze this uploaded project architecture diagram or technical image.
Identify the components, module interactions, databases, APIs, and cloud services shown.
Generate a valid Mermaid.js diagram representing the architecture diagram.
Also, output the result in JSON format matching this schema:
{
  "name": "Project Name from Diagram",
  "domain": "Detected Domain",
  "summary": "Detailed summary of the diagram architecture and components",
  "components": ["Component A", "Component B"],
  "mermaidDiagram": "graph TD\\n  A --> B"
}
Ensure your output is strictly valid JSON inside the tags \`\`\`json ... \`\`\`. Do not include any text before or after the JSON tags.
`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: buffer.toString("base64"),
          mimeType: mimeType
        }
      },
      promptText
    ]);

    const responseText = await result.response.text();
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || [null, responseText];
    const cleanJson = jsonMatch[1].trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Gemini image analysis failed:", err);
    return null;
  }
}

// Helper: Synthesize full project state from document text
async function synthesizeProjectState(apiKey, sourceName, textContent) {
  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are the Project Intelligence Synthesizer.
We have parsed the following project content:
Source: ${sourceName}
Source Content:
${textContent.slice(0, 15000)}

Based on this content, generate a complete project intelligence object in JSON format.
Make sure you include realistic details, academic/viva prep, questions, documentation, tech stack analysis, health scores, and architecture representations.
Output exactly a JSON object conforming to this template:
{
  "name": "Project Name",
  "domain": "Project Domain",
  "objective": "Objective",
  "problemStatement": "Problem Statement",
  "scope": "Project Scope",
  "features": ["Feature 1", "Feature 2"],
  "functionalRequirements": ["FR1: ...", "FR2: ..."],
  "nonFunctionalRequirements": ["NFR1: ...", "NFR2: ..."],
  "targetAudience": "Target Audience",
  "businessUseCase": "Business Use Case",
  "technicalUseCase": "Technical Use Case",
  "technologyStack": {
    "languages": ["Language 1"],
    "frameworks": ["Framework 1"],
    "databases": ["Database 1"],
    "devops": ["DevOps 1"]
  },
  "explanations": {
    "executive": "Executive Summary",
    "beginner": "Beginner explanation",
    "technical": "Technical explanation",
    "interview": "Interview answer",
    "viva": "Viva explanation",
    "nonTechnical": "Non-technical explanation"
  },
  "folderStructure": {
    "name": "root",
    "type": "directory",
    "children": [{"name": "${sourceName}", "type": "file", "language": "text", "size": ${textContent.length}}]
  },
  "files": {
    "${sourceName}": {
      "code": ${JSON.stringify(textContent)},
      "language": "text",
      "explanation": "Explanation of this document content",
      "functions": [],
      "classes": [],
      "variables": [],
      "apis": [],
      "algorithm": "Static review",
      "logic": "Document analysis",
      "dataFlow": "None"
    }
  },
  "architecture": {
    "hla": "graph TD\\n  Client[Client View] -->|Scraped Content| Parser[AI Platform]\\n  Parser -->|Synthesize| Gemini[Gemini VLM]",
    "lla": "classDiagram\\n  class Document {\\n    +content string\\n  }",
    "seq": "sequenceDiagram\\n  User->>Platform: Upload ${sourceName}\\n  Platform->>Gemini: Run Synthesis\\n  Gemini-->>User: Render Dashboard"
  },
  "technologies": [
    {
      "name": "Gemini AI",
      "category": "Artificial Intelligence",
      "whyUsed": "For synthesizing multi-format inputs into structured schemas.",
      "whyChosen": "Industry leading reasoning capability.",
      "advantages": "High output format adherence.",
      "disadvantages": "Requires network connectivity.",
      "alternatives": "None",
      "industry": "Agentic workflows.",
      "practices": "Use structured outputs.",
      "updates": "Recent Flash speedups.",
      "questions": [{"q": "What is Gemini Flash?", "a": "A high-performance lightweight LLM model optimized for low latency."}]
    }
  ],
  "liveSearch": {
    "query": "Recent updates on the technology stack",
    "steps": ["Querying info..."],
    "summary": "Summary of updates",
    "citations": [{"title": "Source", "url": "https://example.com"}]
  },
  "projectSpecificLearning": [
    {
      "tech": "Gemini AI",
      "projectUsage": "Synthesizes documentation context.",
      "generalUsage": "Powers conversational bots and text generation."
    }
  ],
  "documentation": {
    "readme": "# README\\n\\n${sourceName} parsed successfully.",
    "abstract": "Abstract detailing the uploaded document contents.",
    "installation": "N/A",
    "api": "N/A"
  },
  "questions": {
    "beginner": [{"q": "What does this document contain?", "a": "It contains the text content of the uploaded resource."}],
    "intermediate": [{"q": "Explain the domain of this project.", "a": "Detected domain is related to the contents of the upload."}],
    "advanced": [{"q": "Describe the main architectural setup of the system.", "a": "It centers around parsing and structuring input data."}],
    "viva": {
      "twoMarks": [{"q": "What is the source file name?", "a": "${sourceName}"}],
      "fiveMarks": [{"q": "Synthesize the main problem statement.", "a": "Extracting insights from unstructured documents."}],
      "tenMarks": [{"q": "Describe the methodology in the document.", "a": "The methodology is parsed from the uploaded report."}]
    }
  },
  "bugs": [
    {
      "id": "DOC-101",
      "type": "Documentation check",
      "title": "Raw text unstructured",
      "description": "The input document has clean text but lacks code files.",
      "rootCause": "This is a document-only upload rather than a full source repository.",
      "diff": "+ Add code files to run static debugging checks",
      "fix": "Upload a full ZIP package to get code line scans.",
      "optimized": "Upload code repository."
    }
  ],
  "improvements": [
    {
      "title": "Provide complete codebase",
      "impact": "High",
      "type": "New Feature",
      "description": "Upload a ZIP file containing the source code files to run full bug scanners."
    }
  ],
  "socials": {
    "resume": "* Processed and reviewed technical assets from ${sourceName} using Gemini API.",
    "linkedin": "🚀 Just analyzed my technical document ${sourceName}! The Project Intelligence platform parsed it in seconds.",
    "github": "${sourceName} document audit.",
    "portfolio": "Audit of ${sourceName} technical document."
  },
  "careerRoadmap": {
    "roles": ["Technical Auditor"],
    "skills": ["Document Analysis"],
    "missing": ["Software architecture design"],
    "roadmap": [{"step": "Step 1", "desc": "Study software project repositories."}]
  },
  "research": {
    "papers": [{"title": "Document Intelligence System", "authors": "AI Lab", "journal": "AI Journal", "abstract": "Parsing pdf/url text to structured schemas."}],
    "trends": "Trend is moving toward large context windows.",
    "competitors": "Standard text search."
  },
  "knowledgeGraph": {
    "nodes": [{"id": "${sourceName}", "group": "other", "label": "${sourceName}"}],
    "links": []
  },
  "healthScores": {
    "quality": 90,
    "security": 90,
    "scalability": 90,
    "maintainability": 90,
    "documentation": 95,
    "readiness": 90,
    "iq": 91
  },
  "presentation": [
    {"title": "${sourceName} Review", "bullets": ["Audit of document content"], "notes": "Auditing and explaining ${sourceName}."}
  ]
}
Ensure your output is strictly valid JSON inside the tags \`\`\`json ... \`\`\`. Do not include any text before or after the JSON tags.
`;

    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();
    const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || [null, responseText];
    const cleanJson = jsonMatch[1].trim();
    return JSON.parse(cleanJson);
  } catch (err) {
    console.error("Gemini project synthesis failed:", err);
    return null;
  }
}

// Helper: Generates realistic mock project state when Gemini API key is missing
function generateFallbackProjectState(sourceName, textContent, ext) {
  const isImage = [".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext);
  const summary = textContent ? textContent.slice(0, 200) + "..." : "Parsed document representation.";
  let domain = "Document Analysis";
  let objective = "Static audit of uploaded project file.";
  let problemStatement = "Interactive review of document contents.";
  let hla = `graph TD\n  Client[Frontend UI] -->|Browse| Doc[${sourceName}]\n  Doc -->|Audit| Platform[AI Platform]`;
  let lla = `classDiagram\n  class Document {\n    +name: string\n    +size: number\n  }`;

  if (isImage) {
    domain = "System Architecture / Diagram";
    objective = "Analyze components and pathways depicted in the image.";
    problemStatement = "Translate visual architecture components to structured models.";
    hla = `graph TD\n  WebBrowser[Web UI Client] -->|API Calls| APIGateway[API Gateway Server]\n  APIGateway -->|Read/Write| Postgres[(PostgreSQL Database)]\n  APIGateway -->|Cache| Redis[(Redis Cache)]\n  APIGateway -->|Job Queue| Celery[Celery Optimizer Workers]`;
    lla = `classDiagram\n  class APIGateway {\n    +routes\n    +authenticate()\n  }\n  class Database {\n    +tables\n    +query()\n  }`;
  }

  return {
    name: sourceName,
    domain: domain,
    objective: objective,
    problemStatement: problemStatement,
    scope: `1 file parsed.`,
    features: ["Statically parsed document text metadata", "Interactive chat support"],
    functionalRequirements: ["FR1: System must render the text/visual audit view.", "FR2: Users must be able to ask questions about the upload."],
    nonFunctionalRequirements: ["NFR1: Privacy - files parsed locally on server.", "NFR2: Performance - index document under 2 seconds."],
    targetAudience: "Reviewers and Students.",
    businessUseCase: "Accelerates reading and studying technical papers or diagrams.",
    technicalUseCase: "Creates interactive Q&A modules from text/image uploads.",
    technologyStack: {
      languages: isImage ? ["Mermaid.js"] : ["Plain Text"],
      frameworks: [],
      databases: [],
      devops: []
    },
    explanations: {
      executive: `Executive Summary: This project is a static review of the uploaded resource "${sourceName}".`,
      beginner: "A document or diagram you uploaded. The system reads the content and helps you ask questions about it, like a smart helper.",
      technical: `Text parsed from raw file ${sourceName}. Syntactic elements are stored in a key-value dictionary.`,
      interview: `We parsed ${sourceName} to support interactive career mentoring and viva preparation.`,
      viva: `An oral examination context generated based on the file: ${sourceName}.`,
      nonTechnical: "An interactive page showing the contents of your uploaded document."
    },
    folderStructure: {
      name: "root",
      type: "directory",
      children: [{ name: sourceName, type: "file", language: isImage ? "image" : "text", size: textContent ? textContent.length : 1024 }]
    },
    files: {
      [sourceName]: {
        code: textContent || "Raw binary visual media data.",
        language: isImage ? "image" : "text",
        explanation: `Parsed content from ${sourceName}.`,
        functions: [],
        classes: [],
        variables: [],
        apis: [],
        algorithm: "Static read",
        logic: "Document parse",
        dataFlow: "Local file module"
      }
    },
    architecture: {
      hla: hla,
      lla: lla,
      seq: `sequenceDiagram\n  User->>Dashboard: Browse ${sourceName}\n  Dashboard->>FileTree: Click Node\n  FileTree-->>User: Render File Content`
    },
    technologies: [
      {
        name: isImage ? "Architecture Diagram" : "Technical Document",
        category: "Resource",
        whyUsed: "Used as input reference for learning and review.",
        whyChosen: "Provided directly by user upload.",
        advantages: "Specific to your project domain.",
        disadvantages: "Requires LLM to extract full code semantics.",
        alternatives: "ZIP codebase repository.",
        industry: "System design, audit reports.",
        practices: "Keep documents updated.",
        updates: "N/A",
        questions: [{ q: `What is the main topic of ${sourceName}?`, a: `It covers: ${summary}` }]
      }
    ],
    liveSearch: {
      query: "Latest developments in this project stack",
      steps: ["Parsing imports...", "Querying local tech catalog..."],
      summary: `The project primarily depends on: ${sourceName}.`,
      citations: []
    },
    projectSpecificLearning: [
      {
        tech: isImage ? "Architecture Diagram" : "Technical Document",
        projectUsage: "Provides system guidelines.",
        generalUsage: "Used to communicate specifications."
      }
    ],
    documentation: {
      readme: `# ${sourceName}\n\nDocument uploaded: ${sourceName}\n\n## Content Summary\n${summary}`,
      abstract: `This report details the analysis of: ${sourceName}. Content preview: ${summary}`,
      installation: "No setup required for document files.",
      api: "N/A"
    },
    questions: {
      beginner: [
        { q: "What is this file?", a: `This is the uploaded file: ${sourceName}.` },
        { q: "What content is inside?", a: summary }
      ],
      intermediate: [
        { q: "How can I use this details?", a: "Ask the review chat or mock interviewer questions about the file." }
      ],
      advanced: [
        { q: "How is it analyzed?", a: "Statically parsed on the Node backend." }
      ],
      viva: {
        twoMarks: [{ q: "What is the source file?", a: sourceName }],
        fiveMarks: [{ q: "Explain the purpose of this upload.", a: `It provides the user-specified text context: ${summary}` }],
        tenMarks: [{ q: "Analyze the objective.", a: objective }]
      }
    },
    bugs: [
      {
        id: "OK-200",
        type: "Clean",
        title: "No immediate vulnerability risks",
        description: "Static file parsed successfully.",
        rootCause: "Adhering to standard environment conventions.",
        diff: "+ No changes needed",
        fix: "None required.",
        optimized: "None required."
      }
    ],
    improvements: [
      { title: "Upload full repository code", impact: "High", type: "New Feature", description: "To run detailed code scanners and class maps, upload a ZIP folder." }
    ],
    socials: {
      resume: `* Processed and structured technical details from ${sourceName}.`,
      linkedin: `🚀 Codebase review: Uploaded my file ${sourceName}! Check out the analysis!`,
      github: `${sourceName} parsed successfully.`,
      portfolio: `Static preview of ${sourceName}.`
    },
    careerRoadmap: {
      roles: ["Technical Reviewer"],
      skills: ["Analysis"],
      missing: ["Full stack coding"],
      roadmap: [
        { step: "Step 1", desc: "Upload code repository." }
      ]
    },
    research: {
      papers: [
        { title: "Static Document Analysis", authors: "Developer AI", journal: "Software Engineering", abstract: "Static parsing provides fast, client-side insights." }
      ],
      trends: "Context windows are expanding to ingest larger PDF/diagram files.",
      competitors: "Manual reviews."
    },
    knowledgeGraph: {
      nodes: [{ id: sourceName, group: "other", label: sourceName }],
      links: []
    },
    healthScores: {
      quality: 80,
      security: 80,
      scalability: 80,
      maintainability: 80,
      documentation: 90,
      readiness: 80,
      iq: 82
    },
    presentation: [
      { title: `${sourceName} Walkthrough`, bullets: ["Static content audit", `File: ${sourceName}`], notes: "Introduction walkthrough." }
    ]
  };
}

// Endpoint 1: Get Demo Project
app.get("/api/demo-project", (req, res) => {
  res.json({ success: true, data: demoProjectData });
});

// Endpoint 2: Upload codebase ZIP or individual files
app.post("/api/upload", upload.single("projectFile"), async (req, res) => {
  try {
    const apiKey = req.body.apiKey;
    const githubUrl = req.body.githubUrl;
    const webUrl = req.body.webUrl;

    let filesContent = {};
    let sourceName = "";
    let ext = "";
    let imageBuffer = null;
    let mimeType = "";

    // 1. Handle GitHub Imports
    if (githubUrl) {
      sourceName = githubUrl.split("/").pop() || "github-repo";
      ext = ".zip";
      const buffer = await downloadGithubZip(githubUrl);
      const zip = new AdmZip(buffer);
      const zipEntries = zip.getEntries();
      
      zipEntries.forEach((entry) => {
        if (!entry.isDirectory && !entry.entryName.includes("__MACOSX") && !entry.entryName.includes(".git/")) {
          const fileExt = path.extname(entry.entryName).toLowerCase();
          const skipExtensions = [".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".exe", ".bin", ".mp4", ".mp3", ".wav"];
          if (!skipExtensions.includes(fileExt)) {
            const content = entry.getData().toString("utf8");
            filesContent[entry.entryName] = content;
          }
        }
      });
    }
    // 2. Handle general Web URLs
    else if (webUrl) {
      sourceName = webUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "").replace(/[^a-zA-Z0-9_\-]/g, "_");
      ext = ".html";
      const parsedText = await fetchWebUrlText(webUrl);
      filesContent[`${sourceName}.html`] = parsedText;
    }
    // 3. Handle File Uploads
    else if (req.file) {
      const filePath = req.file.path;
      sourceName = req.file.originalname;
      ext = path.extname(sourceName).toLowerCase();

      if (ext === ".zip") {
        const zip = new AdmZip(filePath);
        const zipEntries = zip.getEntries();

        zipEntries.forEach((entry) => {
          if (!entry.isDirectory && !entry.entryName.includes("__MACOSX") && !entry.entryName.includes(".git/")) {
            const fileExt = path.extname(entry.entryName).toLowerCase();
            const skipExtensions = [".png", ".jpg", ".jpeg", ".gif", ".pdf", ".zip", ".exe", ".bin", ".mp4", ".mp3", ".wav"];
            if (!skipExtensions.includes(fileExt)) {
              const content = entry.getData().toString("utf8");
              filesContent[entry.entryName] = content;
            }
          }
        });
      } else if (ext === ".pdf") {
        const fileBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(fileBuffer);
        filesContent[sourceName] = pdfData.text || "Empty PDF file content.";
      } else if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) {
        imageBuffer = fs.readFileSync(filePath);
        mimeType = req.file.mimetype;
      } else {
        // Individual file upload
        const content = fs.readFileSync(filePath, "utf8");
        filesContent[sourceName] = content;
      }

      // Clean up uploaded file
      try {
        fs.unlinkSync(filePath);
      } catch (e) {
        console.error("Error deleting temp file:", e);
      }
    } else {
      return res.status(400).json({ success: false, message: "No upload file, GitHub link, or URL provided." });
    }

    // 4. Handle Visual Media (Image/Diagram)
    if (imageBuffer) {
      let finalState = generateFallbackProjectState(sourceName, "", ext);
      if (apiKey) {
        const geminiAnalysis = await analyzeImageWithGemini(apiKey, imageBuffer, mimeType);
        if (geminiAnalysis) {
          finalState.name = geminiAnalysis.name || finalState.name;
          finalState.domain = geminiAnalysis.domain || finalState.domain;
          finalState.objective = geminiAnalysis.summary || finalState.objective;
          finalState.architecture.hla = geminiAnalysis.mermaidDiagram || finalState.architecture.hla;
          finalState.features = geminiAnalysis.components || finalState.features;
        }
      }
      currentProjectState = finalState;
      return res.json({ success: true, data: currentProjectState });
    }

    const fileNames = Object.keys(filesContent);
    if (fileNames.length === 0) {
      return res.status(400).json({ success: false, message: "No parseable text contents found in upload." });
    }

    // 5. Synthesis logic for single PDF/URL document
    if ((ext === ".pdf" || ext === ".html") && fileNames.length === 1) {
      const docName = fileNames[0];
      const textVal = filesContent[docName];
      if (apiKey) {
        const synthesized = await synthesizeProjectState(apiKey, docName, textVal);
        if (synthesized) {
          currentProjectState = synthesized;
          return res.json({ success: true, data: currentProjectState });
        }
      }
      // Fallback
      currentProjectState = generateFallbackProjectState(docName, textVal, ext);
      return res.json({ success: true, data: currentProjectState });
    }

    // 6. Multi-file codebase synthesis (ZIP or multiple sources)
    const detectedTech = detectTechnologies(filesContent);
    const dependencyMap = parseDependencies(filesContent);
    const bugs = scanBugsAndIssues(filesContent);
    const healthScores = computeHealthScores(filesContent, bugs);

    const folderStructure = buildTreeFromFlatList(fileNames);

    const fileMetadata = {};
    for (const [filename, content] of Object.entries(filesContent)) {
      const lang = getLanguage(filename);
      const entities = parseFileEntities(content, lang);
      fileMetadata[filename] = {
        code: content,
        language: lang,
        explanation: `Source code file: ${filename}. Contains ${entities.functions.length} functions, ${entities.classes.length} classes.`,
        functions: entities.functions,
        classes: entities.classes,
        variables: entities.variables,
        apis: [],
        algorithm: "Static flow",
        logic: "Static analysis",
        dataFlow: "Local file module"
      };
    }

    currentProjectState = {
      name: sourceName.replace(".zip", ""),
      domain: detectedTech.includes("TensorFlow") || detectedTech.includes("PyTorch") ? "Machine Learning / AI" : "General Software Application",
      objective: "Analyzed code codebase representing developer uploaded files.",
      problemStatement: "Dynamic review and coaching on uploaded code repository.",
      scope: `${fileNames.length} files parsed.`,
      features: detectedTech.map(t => `${t} integration and implementation`),
      functionalRequirements: ["System must compile and run matching codebase configurations.", "Interactive dashboard must render custom tree modules."],
      nonFunctionalRequirements: ["Source code analyzed statically.", "Scalability checks performed."],
      targetAudience: "Developers and Reviewers.",
      businessUseCase: "Accelerates onboarding and reviews of the codebase.",
      technicalUseCase: "Provides class diagrams and health metrics of standard languages.",
      technologyStack: {
        languages: Array.from(new Set(fileNames.map(f => getLanguage(f)))),
        frameworks: detectedTech.filter(t => !["Docker", "Docker Compose", "PostgreSQL", "MySQL", "MongoDB", "Redis"].includes(t)),
        databases: detectedTech.filter(t => ["PostgreSQL", "MySQL", "MongoDB", "Redis"].includes(t)),
        devops: detectedTech.filter(t => ["Docker", "Docker Compose"].includes(t))
      },
      explanations: {
        executive: `Executive summary: The project contains ${fileNames.length} modules using technologies like ${detectedTech.join(", ") || "Vanilla JS/Python"}.`,
        beginner: "A custom software program that you uploaded. It is structured into files and folders, running code modules.",
        technical: `Modular design built with ${detectedTech.join(", ")}. Statically analyzed imports map out the service architecture.`,
        interview: `Uploaded repository contains ${fileNames.length} packages. Utilizes standard coding conventions.`,
        viva: `An application codebase submitted for assessment. Employs dependency packages like ${detectedTech.join(", ") || "none"}.`,
        nonTechnical: "A software folder containing code logic to perform a specific job."
      },
      folderStructure: folderStructure,
      files: fileMetadata,
      architecture: {
        hla: `graph TD\n  Client[Operator Dashboard] -->|Local Queries| Backend[Uploaded Codebase]\n  ` + detectedTech.map(t => `Backend -->|Depends| ${t.replace(/[^a-zA-Z0-9]/g, "")}[${t}]`).join("\n  "),
        lla: `classDiagram\n` + fileNames.slice(0, 8).map((f) => {
          const base = path.basename(f, path.extname(f)).replace(/[^a-zA-Z0-9]/g, "");
          return `  class ${base} {\n    +lineCount int\n  }`;
        }).join("\n"),
        seq: `sequenceDiagram\n  User->>Dashboard: Browse ${sourceName}\n  Dashboard->>FileTree: Click Node\n  FileTree-->>User: Render File Content`
      },
      technologies: detectedTech.map((t) => ({
        name: t,
        category: "Module Dependency",
        whyUsed: `Detected in uploaded package directories.`,
        whyChosen: "Required stack dependency.",
        advantages: "Industry standard library.",
        disadvantages: "Requires configuration updates.",
        alternatives: "Alternative package solutions.",
        industry: "Enterprise deployments.",
        practices: "Keep package versions pinned.",
        updates: "Check package repository updates.",
        questions: [{ q: `What is the role of ${t} in this project?`, a: `It forms the core technology stack used to run/serve code logic.` }]
      })),
      liveSearch: {
        query: "Latest developments in this project stack",
        steps: ["Parsing imports...", "Querying local tech catalog..."],
        summary: `The project primarily depends on: ${detectedTech.join(", ") || "Standard script files"}.`,
        citations: []
      },
      projectSpecificLearning: detectedTech.map((t) => ({
        tech: t,
        projectUsage: `Implemented across codebase imports.`,
        generalUsage: `Widely utilized in web and backend architectures.`
      })),
      documentation: {
        readme: `# ${sourceName.replace(".zip", "")}\n\nProject uploaded for analysis.\n\n## Tech Stack\n${detectedTech.join(", ")}`,
        abstract: `This report details the static structural analysis of the codebase: ${sourceName}. Contains ${fileNames.length} code units.`,
        installation: "Check code contents for standard package files like requirements.txt or package.json.",
        api: "Statically parsed APIs."
      },
      questions: {
        beginner: [
          { q: "What is this project?", a: `This is the uploaded codebase: ${sourceName.replace(".zip", "")}.` },
          { q: "What files are in this project?", a: `It contains files like: ${fileNames.slice(0, 5).join(", ")}.` }
        ],
        intermediate: [
          { q: "What dependencies does it use?", a: `Detected tools include: ${detectedTech.join(", ") || "Standard functions"}.` }
        ],
        advanced: [
          { q: "Explain the class interactions.", a: "Classes interact via local imports mapped in the Knowledge Graph." }
        ],
        viva: {
          twoMarks: [{ q: "List 2 primary files in this project.", a: fileNames.slice(0, 2).join(", ") || "None" }],
          fiveMarks: [{ q: "Explain the stack detected.", a: `The backend analyzer found imports matching: ${detectedTech.join(", ") || "Vanilla programming scripts"}.` }],
          tenMarks: [{ q: "Elaborate on the project structure.", a: `The project contains ${fileNames.length} files structured hierarchically. The main entrance modules handle operations, importing supporting utility packages.` }]
        }
      },
      bugs: bugs.length > 0 ? bugs : [
        {
          id: "OK-200",
          type: "Clean",
          title: "No immediate vulnerabilities detected",
          description: "Statically checked code looks clean of direct hardcoded passwords.",
          rootCause: "Adhering to standard environment conventions.",
          diff: "+ No changes needed",
          fix: "Continue maintaining environment decoupling.",
          optimized: "Set up regular dynamic scanning checks."
        }
      ],
      improvements: [
        { title: "Refactor complex code blocks", impact: "High", type: "Code Quality", description: "Identify files exceeding 200 lines and partition them." },
        { title: "Add docker containers", impact: "Medium", type: "DevOps", description: "Containerize the code using Docker to unify runtime environments." }
      ],
      socials: {
        resume: `* Developed and structured ${sourceName.replace(".zip", "")} utilizing ${detectedTech.join(", ") || "Vanilla script frameworks"}.\n* Configured modular classes and routed files cleanly.`,
        linkedin: `🚀 Codebase review: Uploaded my project ${sourceName.replace(".zip", "")}! Built using ${detectedTech.join(", ") || "modern structures"}. Check out the analysis!`,
        github: `${sourceName.replace(".zip", "")} codebase. Static analysis parsed successfully.`,
        portfolio: `Static preview of ${sourceName.replace(".zip", "")} showing code structures and class components.`
      },
      careerRoadmap: {
        roles: ["Software Engineer", "Fullstack Developer"],
        skills: detectedTech.concat(["Software Design Patterns", "System Modularity"]),
        missing: ["Cloud deployment blueprints"],
        roadmap: [
          { step: "Step 1", desc: "Write comprehensive unit tests for all classes." },
          { step: "Step 2", desc: "Configure GitHub Actions workflows." }
        ]
      },
      research: {
        papers: [
          { title: "Static Analysis tools in Code Reviewing", authors: "Developer AI", journal: "Software Engineering", abstract: "Static parsing provides fast, client-side insights on project modules before dynamic runtime evaluations." }
        ],
        trends: "Multi-agent review chains are replacing single-prompt analysis scripts.",
        competitors: "Manual code reviews."
      },
      knowledgeGraph: dependencyMap,
      healthScores: healthScores,
      presentation: [
        { title: `${sourceName.replace(".zip", "")} Walkthrough`, bullets: ["Static code walkthrough", `Files parsed: ${fileNames.length}`], notes: "Introduction to the uploaded repository walkthrough." }
      ]
    };

    res.json({ success: true, data: currentProjectState });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint 3: Run AI Agent Query
app.post("/api/analyze-project", async (req, res) => {
  const { apiKey, agentName, userPrompt, useCurrentState } = req.body;
  const keyToUse = apiKey || process.env.GEMINI_API_KEY;
  
  const contextData = useCurrentState && currentProjectState ? currentProjectState : demoProjectData;

  try {
    if (!keyToUse) {
      return res.status(400).json({ success: false, message: "Please provide a valid Gemini API key." });
    }

    const aiResult = await invokeAgent({
      apiKey: keyToUse,
      agentName,
      contextData,
      userPrompt
    });

    res.json({ success: true, response: aiResult });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint 4: Chat Mode Endpoint (Handles multi-turn or contextual chat)
app.post("/api/chat", async (req, res) => {
  const { apiKey, scope, scopeId, message, chatHistory } = req.body;
  const keyToUse = apiKey || process.env.GEMINI_API_KEY;
  const project = currentProjectState || demoProjectData;

  let fileContext = "";
  if (scope === "file" && scopeId) {
    fileContext = `Currently viewing file: ${scopeId}\nCode:\n${project.files[scopeId]?.code || "Not found"}`;
  } else if (scope === "module" && scopeId) {
    fileContext = `Module Technologies: ${JSON.stringify(project.technologies.find(t => t.name === scopeId) || "Not found")}`;
  }

  try {
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    if (!keyToUse) {
      // Return a smart mock answer if no API key is provided
      const responseText = `[Demo Sandbox] You asked about scope "${scope}" (${scopeId || "Project Wide"}): "${message}".\n\nSince no Gemini API key is configured, the system is running in demo mode. Input your Gemini API key in the top header to ask live questions about this project codebase!`;
      return res.json({ success: true, response: responseText });
    }

    const genAI = new GoogleGenerativeAI(keyToUse);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are the Repository Chat Assistant. The user is asking about the project "${project.name}".
Scope: ${scope} ${scopeId ? `(${scopeId})` : ""}
${fileContext}

Chat History:
${chatHistory.map(h => `${h.role === "user" ? "User" : "AI"}: ${h.text}`).join("\n")}

User Question: ${message}

Provide a detailed, helpful answer using both project context and live development best practices. Keep it concise.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    res.json({ success: true, response: response.text() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint 5: Live Web Search Simulator/API
app.post("/api/search", async (req, res) => {
  const { query, apiKey } = req.body;
  const keyToUse = apiKey || process.env.GEMINI_API_KEY;

  try {
    if (keyToUse) {
      const { GoogleGenerativeAI } = await import("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(keyToUse);
      // We use Gemini model to synthesize search grounding or web research content
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Perform live internet research (simulate search crawling StackOverflow, GitHub, official documentation) and answer: "${query}". Format the response with Citations (markdown links: [Title](URL)).`;
      const result = await model.generateContent(prompt);
      const response = await result.response;

      return res.json({
        success: true,
        summary: response.text(),
        steps: [
          `Searching web index for "${query}"...`,
          "Crawling official documentation and blogs...",
          "Comparing developer forums (StackOverflow)...",
          "Synthesizing references..."
        ],
        citations: [
          { title: "Official Documentation Reference", url: "https://docs.google.com" },
          { title: "Stack Overflow Developer Thread", url: "https://stackoverflow.com" }
        ]
      });
    }

    // Default mock response for search queries
    res.json({
      success: true,
      summary: `[Demo Sandbox] Research result for "${query}":\n\nAgentic workflows and RAG systems represent the latest state-of-the-art configurations. Typically implemented using Vector Databases (ChromaDB/Pinecone) to store semantic embeddings, dynamic agent runtimes evaluate prompts and route them across code files.\n\nConfigure an API key in the top header to fetch live search queries from Google/StackOverflow.`,
      steps: [
        `Searching database for "${query}"...`,
        "Found matching standard definitions...",
        "Formatting summary..."
      ],
      citations: [
        { title: "W3Schools developer guide", url: "https://w3schools.com" },
        { title: "GitHub Awesome repositories", url: "https://github.com" }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper: Converts flat list of paths to a tree structure
function buildTreeFromFlatList(paths) {
  const root = { name: "root", type: "directory", children: [] };

  paths.forEach((filepath) => {
    const parts = filepath.split("/");
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      let existing = current.children.find((c) => c.name === part);

      if (!existing) {
        existing = {
          name: part,
          type: isLast ? "file" : "directory"
        };
        if (!isLast) {
          existing.children = [];
        } else {
          existing.language = getLanguage(part);
          // Sample size
          existing.size = 100 + Math.floor(Math.random() * 4000);
        }
        current.children.push(existing);
      }
      current = existing;
    });
  });

  // Return the contents of root
  return root.children[0] && root.children[0].type === "directory" ? root.children[0] : root;
}

// Start Server
app.listen(PORT, () => {
  console.log(`AI Project Intelligence server running on port ${PORT}`);
});
