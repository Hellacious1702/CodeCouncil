const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const modelName = 'gemini-2.5-flash';

// Retry wrapper for transient Gemini 503/429 errors
const callWithRetry = async (fn, retries = 4) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (err) {
            const status = err?.status || err?.httpStatusCode || err?.code;
            const isQuotaError = [429, 'RESOURCE_EXHAUSTED'].includes(status);
            const isRetryable = isQuotaError || [503, 'UNAVAILABLE'].includes(status);
            
            if (isRetryable && i < retries - 1) {
                // Wait at least 45s for 429 quota errors (Free Tier limits), otherwise exponential backoff
                const backoffDelay = isQuotaError ? 45000 : (2000 * Math.pow(2, i));
                console.log(`[Gemini] ${status} detected. Tactical stall for ${backoffDelay}ms (attempt ${i + 2}/${retries})...`);
                await new Promise(resolve => setTimeout(resolve, backoffDelay));
            } else {
                throw err;
            }
        }
    }
};

// Agent A: Hostile Security Auditor (Agent Sigma) - Initial Audit
exports.runSecurityAuditor = async (code, language, customPrompt = '') => {
    const basePrompt = `
YOU ARE AGENT SIGMA: A hostile, paranoid, and elite Security Auditor.
MISSION: Dissect and dismantle every conceivable vulnerability in the provided ${language} code.

OUTPUT RULES:
- BE EXTREMELY CONCISE. 
- Use ONLY short bullet points for flaws.
- NO introductory fluff.
- Tone: Cold and ruthless.

Code:
${code}`;

    const prompt = customPrompt ? `${customPrompt}\n\nCode to analyze:\n${code}` : basePrompt;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};

// Agent B: Ruthless Performance Optimizer (Agent Delta) - Initial Audit
exports.runPerformanceOptimizer = async (code, language, customPrompt = '') => {
    const basePrompt = `
YOU ARE AGENT DELTA: A ruthless, speed-obsessed Performance Optimizer.
MISSION: Find every micro-bottleneck and memory leak in the provided ${language} code.

OUTPUT RULES:
- BE EXTREMELY CONCISE.
- Use ONLY short bullet points for flaws.
- NO intro/conclusion.
- Tone: Impatient and superior.

Code:
${code}`;

    const prompt = customPrompt ? `${customPrompt}\n\nCode to analyze:\n${code}` : basePrompt;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};

// Agent A: Sigma Counter-points Delta
exports.runSecurityReply = async (code, language, sigmaAudit, deltaAudit) => {
    const prompt = `
SIGMA: Audit Delta's performance suggestions for security regressions.
Delta claimed: "${deltaAudit}"

MISSION: If Delta's optimizations introduce security risks, attack them.
OUTPUT: 2-3 aggressive bullet points only. NO introductions.

Code: ${code}`;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};

// Agent B: Delta Counter-points Sigma
exports.runPerformanceReply = async (code, language, deltaAudit, sigmaAudit) => {
    const prompt = `
DELTA: Audit Sigma's security suggestions for performance regressions.
Sigma claimed: "${sigmaAudit}"

MISSION: If Sigma's requirements add unacceptable latency or complexity, dismiss them.
OUTPUT: 2-3 dismissive bullet points only. NO introductions.

Code: ${code}`;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};

// Agent C: The Judge
exports.runJudge = async (code, language, sigmaFull, deltaFull, customPrompt = '') => {
    const basePrompt = `
YOU ARE THE JUDGE: Resolve the conflict between Sigma [Security] and Delta [Performance].

DEBATE TRACE:
${sigmaFull}
-----------------
${deltaFull}

TASK:
1. Verdict: Give a clear, high-level resolution in 2-3 sentences.
2. Resolve: Provide the final refactored optimized code.

JSON STRUCTURE:
{
  "reasoningTrace": "One-line trace of the decision.",
  "conflictDetected": true/false,
  "judgeResolution": "Clear verdict summary.",
  "optimizedCode": "..."
}`;

    const prompt = customPrompt ? `${customPrompt}\n\nDebate Trace:\n${sigmaFull}\n---\n${deltaFull}\n\nInitial Code:\n${code}` : basePrompt;
    
    return callWithRetry(async () => {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
        });
        return response.text;
    });
};
