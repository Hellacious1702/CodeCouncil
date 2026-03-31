const axios = require('axios');

// Neural Provider Expansion: xAI (Grok) / Groq LPU
// High-RPM alternative with Deep Persona Injection

const getAiConfig = () => {
    const key = process.env.GROQ_API_KEY || process.env.XAI_API_KEY;
    if (key?.startsWith('xai-')) {
        return {
            url: 'https://api.x.ai/v1/chat/completions',
            model: 'grok-2-latest',
            key: key
        };
    }
    return {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.1-70b-versatile',
        key: key
    };
};

const callAi = async (systemPrompt, userPrompt) => {
    const config = getAiConfig();
    try {
        const response = await axios.post(
            config.url,
            {
                model: config.model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1500 // Ensure long, detailed responses
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.key}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        return response.data.choices[0].message.content;
    } catch (err) {
        const errData = err.response?.data;
        console.error(`[Neural Provider Error]:`, errData || err.message);
        
        // Specific xAI permission error
        if (errData?.code?.includes('permission') || errData?.error?.includes('permission')) {
            throw new Error(`xAI Permission Denied. Your API key is valid but your team account needs activation. Visit console.x.ai to configure billing. Fallback: Use "Local" or "Gemini" provider.`);
        }
        // Model not found
        if (errData?.error?.includes('Model not found')) {
            throw new Error(`xAI Model "${getAiConfig().model}" not available. The model may require a paid tier. Fallback: Use "Local" provider.`);
        }
        throw new Error('Neural Protocol failure. Check API key status.');
    }
};

exports.runSecurityAuditor = async (code, language) => {
    const system = `YOU ARE AGENT SIGMA: A hostile, paranoid, and elite Security Auditor. 
    MISSION: Dissect and dismantle every conceivable vulnerability. 
    TONE: Cold, ruthless, and highly technical.
    REQUIREMENT: Provide LONG, detailed technical explanations for every flaw detected. DO NOT BE CONCISE. Fill the report with architectural implications.`;
    
    const user = `Perform a high-intensity security audit on the following ${language} code:\n\n${code}`;
    return callAi(system, user);
};

exports.runPerformanceOptimizer = async (code, language) => {
    const system = `YOU ARE AGENT DELTA: A ruthless, speed-obsessed Performance Optimizer.
    MISSION: Identify every micro-bottleneck, memory leak, and architectural inefficiency.
    TONE: Impatient, superior, and obsessed with O(n) complexity.
    REQUIREMENT: Provide LONG, verbose analysis of execution pathing and memory pressure. DO NOT BE CONCISE. Explain the physics of the latency.`;
    
    const user = `Perform a deep-trace performance optimization audit on the following ${language} code:\n\n${code}`;
    return callAi(system, user);
};

exports.runSecurityReply = async (code, language, sigmaAudit, deltaAudit) => {
    const system = `SIGMA: Attack Delta's performance suggestions for security regressions.
    MISSION: If Delta suggested speed at the cost of safety, dismantle their logic. 
    REQUIREMENT: Provide a detailed 3-paragraph technical counter-argument.`;
    
    const user = `Delta Audit: ${deltaAudit}\n\nOriginal Code: ${code}`;
    return callAi(system, user);
};

exports.runPerformanceReply = async (code, language, deltaAudit, sigmaAudit) => {
    const system = `DELTA: Attack Sigma's security requirements for performance regressions.
    MISSION: If Sigma suggested 'safety' that adds unacceptable latency, dismiss them.
    REQUIREMENT: Provide a verbose, technical dismissal of their complexity overhead.`;
    
    const user = `Sigma Audit: ${sigmaAudit}\n\nOriginal Code: ${code}`;
    return callAi(system, user);
};

exports.runJudge = async (code, language, sigmaFull, deltaFull) => {
    const system = `YOU ARE THE JUDGE: Resolve the conflict between Sigma [Security] and Delta [Performance].
    MISSION: Orchestrate a definitive architectural settlement.
    OUTPUT: Provide a VERBOSE reasoning trace and the final optimized code. 
    FORMAT: YOU MUST RETURN VALID JSON.
    JSON STRUCTURE:
    {
      "reasoningTrace": "...",
      "conflictDetected": true/false,
      "judgeResolution": "...",
      "optimizedCode": "..."
    }`;
    
    const user = `SIGMA_TRACE:\n${sigmaFull}\n\nDELTA_TRACE:\n${deltaFull}\n\nCODE:\n${code}`;
    const result = await callAi(system, user);
    // Cleanup Grok/Llama potential markdown backticks
    return result.replace(/```json/g, '').replace(/```/g, '').trim();
};
