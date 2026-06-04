import path from "path";
import fs from "fs";

// Detect file language
export function getLanguage(filename) {
  const ext = path.extname(filename).toLowerCase();
  switch (ext) {
    case ".py": return "python";
    case ".js": case ".jsx": return "javascript";
    case ".ts": case ".tsx": return "typescript";
    case ".java": return "java";
    case ".c": return "c";
    case ".cpp": case ".h": case ".hpp": return "cpp";
    case ".kt": case ".kts": return "kotlin";
    case ".swift": return "swift";
    case ".php": return "php";
    case ".go": return "go";
    case ".rs": return "rust";
    case ".sql": return "sql";
    case ".html": return "html";
    case ".css": return "css";
    case ".json": return "json";
    case ".yml": case ".yaml": return "yaml";
    case ".md": return "markdown";
    default: return "text";
  }
}

// Scans text for import patterns and maps file-to-file connections
export function parseDependencies(files) {
  const nodes = [];
  const links = [];
  const fileNames = Object.keys(files);

  // Create nodes
  fileNames.forEach((file) => {
    const ext = path.extname(file).toLowerCase();
    let group = "other";
    if ([".py", ".rs", ".go", ".php", ".java", ".c", ".cpp", ".kt"].includes(ext)) {
      group = "backend";
    } else if ([".js", ".jsx", ".ts", ".tsx", ".html", ".css"].includes(ext)) {
      group = "frontend";
    } else if ([".sql"].includes(ext)) {
      group = "database";
    }

    nodes.push({
      id: file,
      group: group,
      label: path.basename(file)
    });
  });

  // Extract links
  fileNames.forEach((file) => {
    const content = files[file];
    if (typeof content !== "string") return;

    const basename = path.basename(file, path.extname(file));
    
    // JS/TS imports: import X from './Y' or require('./Y')
    const jsImportRegex = /(?:import|from|require)\s*['"]\.\.?\/([^'"]+)['"]/g;
    // Python imports: from app.core import optimizer
    const pyImportRegex = /(?:from|import)\s+([a-zA-Z0-9_\.]+)/g;
    // C/C++ includes: #include "helper.h"
    const cppIncludeRegex = /#include\s*["']([^"']+)["']/g;

    let match;
    const addedLinks = new Set();

    if (file.endsWith(".js") || file.endsWith(".jsx") || file.endsWith(".ts") || file.endsWith(".tsx")) {
      while ((match = jsImportRegex.exec(content)) !== null) {
        let importName = match[1];
        // Strip extensions if present, match base name
        importName = path.basename(importName, path.extname(importName));
        const matchedTarget = fileNames.find(f => path.basename(f, path.extname(f)) === importName);
        if (matchedTarget && matchedTarget !== file && !addedLinks.has(matchedTarget)) {
          links.push({ source: file, target: matchedTarget });
          addedLinks.add(matchedTarget);
        }
      }
    } else if (file.endsWith(".py")) {
      while ((match = pyImportRegex.exec(content)) !== null) {
        const importParts = match[1].split(".");
        const importName = importParts[importParts.length - 1];
        const matchedTarget = fileNames.find(f => path.basename(f, path.extname(f)) === importName);
        if (matchedTarget && matchedTarget !== file && !addedLinks.has(matchedTarget)) {
          links.push({ source: file, target: matchedTarget });
          addedLinks.add(matchedTarget);
        }
      }
    } else if (file.endsWith(".cpp") || file.endsWith(".h") || file.endsWith(".c")) {
      while ((match = cppIncludeRegex.exec(content)) !== null) {
        const importName = path.basename(match[1], path.extname(match[1]));
        const matchedTarget = fileNames.find(f => path.basename(f, path.extname(f)) === importName);
        if (matchedTarget && matchedTarget !== file && !addedLinks.has(matchedTarget)) {
          links.push({ source: file, target: matchedTarget });
          addedLinks.add(matchedTarget);
        }
      }
    }
  });

  return { nodes, links };
}

// Detect tech tags based on filenames and import statements
export function detectTechnologies(files) {
  const techs = new Set();
  const fileNames = Object.keys(files);

  const keywords = {
    React: [/import\s+React/i, /react-dom/i, /react-router/i],
    Express: [/require\(['"]express['"]\)/i, /import\s+express/i],
    FastAPI: [/from\s+fastapi/i, /FastAPI\(/],
    TensorFlow: [/import\s+tensorflow/i, /tf\./],
    PyTorch: [/import\s+torch/i, /torch\.nn/i],
    OpenCV: [/import\s+cv2/i, /cv2\./],
    Docker: [/FROM\s+/],
    MongoDB: [/mongodb:\/\//, /mongoose/],
    PostgreSQL: [/postgres:\/\//, /psycopg2/i, /pg\./],
    MySQL: [/mysql:\/\//, /mysql2/i],
    Firebase: [/firebase/i],
    Flask: [/from\s+flask/i, /Flask\(/],
    Django: [/django/i],
    Angular: [/@angular\/core/i],
    Vue: [/vue/i, /from\s+['"]vue['"]/i]
  };

  fileNames.forEach((file) => {
    const content = files[file];
    const base = path.basename(file).toLowerCase();

    if (base === "dockerfile") techs.add("Docker");
    if (base === "docker-compose.yml" || base === "docker-compose.yaml") techs.add("Docker Compose");
    if (base === "requirements.txt") techs.add("Python Pip");
    if (base === "package.json") techs.add("NodeJS / npm");
    if (base === "cargo.toml") techs.add("Rust Cargo");
    if (base === "go.mod") techs.add("Go modules");
    if (base === "pom.xml" || base === "build.gradle") techs.add("Java Build");

    if (typeof content !== "string") return;

    for (const [tech, regexes] of Object.entries(keywords)) {
      for (const regex of regexes) {
        if (regex.test(content)) {
          techs.add(tech);
          break;
        }
      }
    }
  });

  return Array.from(techs);
}

// Perform simple syntax search and AST definitions (Functions, Classes, Variables)
export function parseFileEntities(code, language) {
  const functions = [];
  const classes = [];
  const variables = [];

  if (typeof code !== "string") return { functions, classes, variables };

  const lines = code.split("\n");

  if (language === "python") {
    lines.forEach((line, idx) => {
      // Functions: def my_func(a, b):
      const funcMatch = /^\s*def\s+([a-zA-Z0-9_]+)\s*\(/g.exec(line);
      if (funcMatch) {
        functions.push({ name: funcMatch[1], line: idx + 1, desc: `Python function def at line ${idx + 1}` });
      }
      // Classes: class MyClass:
      const classMatch = /^\s*class\s+([a-zA-Z0-9_]+)/g.exec(line);
      if (classMatch) {
        classes.push({ name: classMatch[1], line: idx + 1, desc: `Python class at line ${idx + 1}` });
      }
    });
  } else if (language === "javascript" || language === "typescript") {
    lines.forEach((line, idx) => {
      // Functions: function myFunc() or const myFunc = () =>
      const funcMatch = /(?:function\s+([a-zA-Z0-9_]+)|const\s+([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>)/g.exec(line);
      if (funcMatch) {
        const name = funcMatch[1] || funcMatch[2];
        if (name && !["require", "import"].includes(name)) {
          functions.push({ name, line: idx + 1, desc: `JS function at line ${idx + 1}` });
        }
      }
      // Classes: class MyClass
      const classMatch = /class\s+([a-zA-Z0-9_]+)/g.exec(line);
      if (classMatch) {
        classes.push({ name: classMatch[1], line: idx + 1, desc: `JS class at line ${idx + 1}` });
      }
      // Constants/Vars
      const varMatch = /(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=/g.exec(line);
      if (varMatch) {
        variables.push({ name: varMatch[1], line: idx + 1, desc: `JS variable declaration` });
      }
    });
  } else {
    // Basic C-style/General
    lines.forEach((line, idx) => {
      const funcMatch = /^\s*[a-zA-Z0-9_<>*&]+\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/g.exec(line);
      if (funcMatch) {
        functions.push({ name: funcMatch[1], line: idx + 1, desc: `Function declaration` });
      }
    });
  }

  return { functions, classes, variables };
}

// Scans files for potential issues (Secrets, long functions, lacks of comments)
export function scanBugsAndIssues(files) {
  const issues = [];
  const fileNames = Object.keys(files);

  fileNames.forEach((file) => {
    const content = files[file];
    if (typeof content !== "string") return;

    const lines = content.split("\n");
    let commentLines = 0;

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;

      // 1. Secret detection
      if (/(password|passwd|api_key|apikey|secret|private_key|token)\s*=\s*['"][a-zA-Z0-9_\-]{8,}['"]/i.test(line)) {
        issues.push({
          id: `SEC-${issues.length + 100}`,
          type: "Security / Risk",
          title: "Hardcoded API Key / Credentials detected",
          description: `Line ${lineNum} in ${file} appears to expose credentials directly.`,
          rootCause: "Config/Secret hardcoded in source files.",
          diff: `- ${line.trim()}\n+ # Load credential from environment file\n+ import os\n+ API_KEY = os.getenv('MY_API_KEY')`,
          fix: "Move sensitive variables to an environment configuration file (.env) and read using runtime configurations.",
          optimized: "Deploy AWS Secrets Manager or HashiCorp Vault for key rotation."
        });
      }

      // 2. Comments counter
      if (line.includes("//") || line.includes("#") || line.includes("/*")) {
        commentLines++;
      }
    });

    // 3. Size warning
    if (lines.length > 500) {
      issues.push({
        id: `PERF-${issues.length + 100}`,
        type: "Performance / Maintainability",
        title: "Very long file detected",
        description: `${file} has ${lines.length} lines. Refactoring is advised.`,
        rootCause: "Accumulating multiple helper components/classes in a single file module.",
        diff: `// Split into smaller sub-modules and load them as components`,
        fix: "Divide functions into logical groups and store in dedicated sub-files.",
        optimized: "Decouple services to adhere to Single Responsibility Principle."
      });
    }
  });

  return issues;
}

// Calculate project metrics (0 to 100)
export function computeHealthScores(files, issues) {
  const fileCount = Object.keys(files).length;
  if (fileCount === 0) return { quality: 100, security: 100, scalability: 100, maintainability: 100, documentation: 100, readiness: 100, iq: 100 };

  const securityIssues = issues.filter(i => i.type.includes("Security")).length;
  const perfIssues = issues.filter(i => i.type.includes("Performance") || i.type.includes("Complexity")).length;

  const security = Math.max(50, 100 - (securityIssues * 20));
  const quality = Math.max(60, 95 - (perfIssues * 5));
  const maintainability = Math.max(55, 90 - (fileCount > 20 ? 5 : 0) - (perfIssues * 5));
  const scalability = Math.max(70, 80 + (fileCount > 10 ? 10 : 0));
  
  // Calculate average comments percentage
  let totalLines = 0;
  let commentLines = 0;
  Object.values(files).forEach(c => {
    if (typeof c !== "string") return;
    const l = c.split("\n");
    totalLines += l.length;
    l.forEach(line => {
      if (line.includes("//") || line.includes("#") || line.includes("/*")) commentLines++;
    });
  });

  const commentRatio = totalLines > 0 ? (commentLines / totalLines) * 100 : 0;
  const documentation = Math.min(100, Math.max(50, Math.round(50 + commentRatio * 2)));

  const readiness = Math.round((quality + security + scalability) / 3);
  const iq = Math.round((quality + security + scalability + maintainability + documentation + readiness) / 6);

  return { quality, security, scalability, maintainability, documentation, readiness, iq };
}
