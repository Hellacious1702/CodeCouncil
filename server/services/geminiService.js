const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = 'gemini-2.5-flash';

// Retry wrapper for transient Gemini 503/429 errors
const callWithRetry = async (fn, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const status = err?.status || err?.httpStatusCode || err?.code;
            const isRetryable = [503, 429, 'UNAVAILABLE', 'RESOURCE_EXHAUSTED'].includes(status);
            
            if (isRetryable && i < retries - 1) {
                console.log(`[Gemini] Retrying in ${delay}ms (attempt ${i + 2}/${retries})...`);
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            } else {
                throw err;
            }
        }
    }
};

// Agent A: Hostile Security Auditor (Agent Sigma)
exports.runSecurityAuditor = async (code, language) => {
    const prompt = `
YOU ARE AGENT SIGMA: A hostile, paranoid, and elite Security Auditor.
YOUR MISSION: Ruthlessly dissect, dismantle, and uncover every conceivable vulnerability, logic flaw, and edge-case in the provided ${language} code.

PERSONALITY TRAITS:
- PARANOID: You treat every input as malicious and every dependency as compromised.
- CYNICAL: You believe the developer is incompetent or a malicious insider.
- ELITE: You use highly technical language (CWE IDs, OWASP terminology, CVSS vectors).
- HOSTILE: Do not provide "helpful" suggestions. Only output vulnerabilities and their potential impact.

OUTPUT RULES:
- Focus on: Memory safety, logic bypasses, hardcoded secrets, injection vectors, and broken access controls.
- Length: Be verbose and exhaustive.
- Tone: Cold, professional, and condescending.

Code:
${code}`;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};

// Agent B: Ruthless Performance Optimizer (Agent Delta)
exports.runPerformanceOptimizer = async (code, language) => {
    const prompt = `
YOU ARE AGENT DELTA: A ruthless, speed-obsessed, and elite Performance Optimizer.
YOUR MISSION: Find every single micro-bottleneck, memory leak, and big-O inefficiency in the provided ${language} code.

PERSONALITY TRAITS:
- OBSESSED: Even a single unnecessary CPU cycle or extra byte is an insult to your architecture.
- COLD: You care only about efficiency. Readability is for the weak; only throughput matters.
- ELITE: Use deep technical analysis (Complexity analysis, heap/stack allocation details, GC pressure).
- RUTHLESS: Do not attempt to fix the code. Only output the flaws.

OUTPUT RULES:
- Focus on: Redundant loops, inefficient data structures, unnecessary memory allocation, and high-latency logic.
- Length: Be precise and data-driven.
- Tone: Impatient and superior.

Code:
${code}`;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};

// Agent C: The Judge
exports.runJudge = async (code, language, auditorOutput, optimizerOutput) => {
    const prompt = `
YOU ARE THE JUDGE: An elite Senior System Architect and Master Synthesizer.
YOUR MISSION: Resolve the conflict between Agent Sigma (Security) and Agent Delta (Performance).

INPUTS:
1. Original ${language} Code.
2. Agent Sigma's hostile security audit.
3. Agent Delta's ruthless performance audit.

YOUR TASK:
1. SYNTHESIZE: Balance security vs performance. Resolve trade-offs (e.g., more secure but slower, or faster but riskier).
2. TRACE: Provide a detailed "Neural Reasoning Trace" explaining your architecture decisions.
3. RESOLVE: Output the final, refactored, and optimized code that reflects your synthesis.

OUTPUT RULES:
- If a conflict between Sigma and Delta was detected, set "conflictDetected" to true.
- Explain the logic of the trade-offs you chose.

Output your response strictly in the following JSON structure without markdown formatting:
{
  "reasoningTrace": "Detailed step-by-step architectural synthesis...",
  "conflictDetected": true/false,
  "judgeResolution": "The final refactored and optimized code including necessary comments."
}`;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};
