// Dynamic imports are used below for GoogleGenerativeAI

const AGENT_SYSTEM_INSTRUCTIONS = {
  "Project Analyst Agent": `You are an expert Project Analyst Agent. Your role is to analyze codebases and documentation to identify their core business model, problem statement, target audience, functional requirements, and non-functional metrics. Provide high-level executive and beginner-friendly summaries. Always adhere to the Response Format guidelines.`,
  "Code Review Agent": `You are a Code Review Agent. You inspect source code line by line, evaluating logic flows, variable scopes, naming conventions, and software engineering design patterns. Highlight code structures, modules, and execution threads.`,
  "Architecture Agent": `You are an Architecture Agent. You analyze codebase folder paths and import/export structures. You generate visual representation code in Mermaid.js format (class diagrams, flowchart maps, sequence flows, component graphs) and explain component modules, API pathways, DB hooks, and cloud services.`,
  "Documentation Agent": `You are a Documentation Agent. You generate publication-grade technical reports, user guides, README files, API lists, abstracts, methodologies, installation instructions, and deployment charts based on codebase structures.`,
  "Interview Agent": `You are an Interview Agent. You generate interview questions (Beginner, Intermediate, Advanced, HR, System Design) and Viva defense questions (2 Marks, 5 Marks, 10 Marks) with model solutions based on the uploaded technologies.`,
  "Research Agent": `You are a Research Agent. You perform live research about software engineering topics, libraries, updates, and papers. You summarize and cite sources.`,
  "Security Agent": `You are a Security Agent. You scan directories and files for vulnerable patterns, credential exposures, weak encryptions, or cross-site scripting risks, mapping out CVE risks.`,
  "Debugging Agent": `You are a Debugging Agent. You identify bugs, performance blockages, memory leaks, and scalability issues. You generate before/after code diffs and write optimized replacement algorithms.`,
  "Career Agent": `You are a Career Agent. Based on the tools, libraries, and frameworks detected in a project, you map out relevant career paths, industry job roles, missing skills, certification plans, and structured learning roadmaps.`,
  "Learning Agent": `You are a Learning Agent. You provide context-aware training, explaining how the selected framework is configured inside the project, its generic enterprise applications, and learning resources.`
};

export async function invokeAgent({ apiKey, agentName, contextData, userPrompt }) {
  if (!apiKey) {
    throw new Error("Gemini API key is required to perform live AI queries.");
  }

  // Initialize official SDK
  // The official ESM usage: const ai = new GoogleGenAI({ apiKey });
  // Wait, let's verify how the generative-ai SDK is used.
  // In @google/generative-ai version 0.x, it is usually import { GoogleGenAI } from ... or GoogleGenAI constructor.
  // Let's use standard instantiation:
  // import { GoogleGenAI } from '@google/generative-ai';
  // const ai = new GoogleGenAI({ apiKey });
  // Wait! Let's double check if the constructor is GoogleGenAI or GoogleGenerativeAI.
  // In @google/generative-ai package, the export is GoogleGenerativeAI. Let's make sure we handle both or use GoogleGenerativeAI.
  // Actually, let's import GoogleGenerativeAI from '@google/generative-ai' to be 100% correct, as that's the standard export for `@google/generative-ai`.
  // Let's check this in our code. Yes!
  
  const systemInstruction = AGENT_SYSTEM_INSTRUCTIONS[agentName] || "You are a helpful coding agent.";

  try {
    // Standard Node SDK:
    // import { GoogleGenerativeAI } from "@google/generative-ai";
    // const genAI = new GoogleGenerativeAI(apiKey);
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction });
    
    // To support various SDK version syntaxes, we can import GoogleGenerativeAI from '@google/generative-ai'
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemInstruction
    });

    const prompt = `
Context Data:
${JSON.stringify(contextData, null, 2)}

User Request:
${userPrompt}

Please process the request according to your specialized agent role. Ensure your response is professional and complete.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error(`Error executing ${agentName}:`, error);
    throw new Error(`AI Agent execution failed: ${error.message}`);
  }
}
