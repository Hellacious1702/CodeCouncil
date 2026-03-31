const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = 'gemini-2.5-flash'; // Google GenAI recommended model, or we can use gemini-3.1-pro if available

// Agent A: Hostile Security Auditor
exports.runSecurityAuditor = async (code, language) => {
    const prompt = `You are a hostile, elite Security Auditor. Your sole purpose is to ruthlessly find security vulnerabilities, edge-cases, and logical flaws in the provided ${language} code. Be incredibly critical. Output exclusively the vulnerabilities and explanations. Do not attempt to fix the code.

Code:
${code}`;
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    return response.text;
};

// Agent B: Ruthless Performance Optimizer
exports.runPerformanceOptimizer = async (code, language) => {
    const prompt = `You are a ruthless Performance Optimizer. Your sole purpose is to find bottlenecks, memory leaks, and big-O inefficiencies in the provided ${language} code. Be incredibly critical. Output exclusively the performance issues and architectural flaws. Do not attempt to fix the code.

Code:
${code}`;
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    return response.text;
};

// Agent C: The Judge
exports.runJudge = async (code, language, auditorOutput, optimizerOutput) => {
    const prompt = `You are The Judge, an elite Senior System Architect.
You must analyze the original ${language} code, the Security Auditor's hostile review, and the Performance Optimizer's ruthless review.

Original Code:
${code}

Security Auditor Review:
${auditorOutput}

Performance Optimizer Review:
${optimizerOutput}

Your task:
1. Synthesize their arguments and resolve trade-offs.
2. If their recommendations conflict, explain how you decided to resolve it (conflictDetected).
3. Output a detailed "Reasoning Trace" explaining your thoughts step-by-step.
4. Output the final, refactored, and optimized code that addresses both security and performance concerns.

Output your response strictly in the following JSON structure without markdown formatting wrapper like \`\`\`json:
{
  "reasoningTrace": "Your detailed reasoning here...",
  "conflictDetected": true/false,
  "judgeResolution": "The synthesized final code..."
}`;
    
    const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
    });
    
    return response.text;
};
