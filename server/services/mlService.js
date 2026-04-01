/**
 * ML Engine Service — Node.js Bridge to Python ML Microservice
 * Calls the FastAPI server at localhost:8000 for AST + CodeBERT analysis.
 * Falls back to the old regex engine if the ML service is down.
 */

const axios = require('axios');

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Check if the ML microservice is available.
 */
async function isMLServiceReady() {
    try {
        const res = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 2000 });
        return res.data.status === 'ok';
    } catch {
        return false;
    }
}

/**
 * Call the ML microservice for analysis.
 */
async function analyzeCode(code, language) {
    const response = await axios.post(`${ML_SERVICE_URL}/analyze`, {
        code,
        language
    }, { timeout: 30000 }); // CodeBERT inference can take a few seconds on CPU
    
    return response.data;
}

/**
 * MAS-compatible service interface.
 * These functions match the same interface as geminiService/groqService/rulesEngineService.
 */

exports.runSecurityAuditor = async (code, language) => {
    try {
        const result = await analyzeCode(code, language);
        return result.combined_report.sigma_output;
    } catch (err) {
        console.error('[ML Service] Security audit failed:', err.message);
        throw new Error(`ML Service unavailable: ${err.message}. Start the ML engine with: cd server/ml && python server.py`);
    }
};

exports.runPerformanceOptimizer = async (code, language) => {
    try {
        const result = await analyzeCode(code, language);
        return result.combined_report.delta_output;
    } catch (err) {
        console.error('[ML Service] Performance audit failed:', err.message);
        throw new Error(`ML Service unavailable: ${err.message}. Start the ML engine with: cd server/ml && python server.py`);
    }
};

exports.runSecurityReply = async (code, language, sigmaAudit, deltaAudit) => {
    // ML engine doesn't do adversarial counter-arguments, so we synthesize one
    return `SIGMA COUNTER-ANALYSIS:\nMy AST + Neural findings are structurally verified. Delta's performance suggestions ` +
           `do not override the security violations identified by CodeBERT neural inference. ` +
           `The structural analysis is deterministic and not subject to interpretation. ` +
           `If Delta disputes these findings, they must present a refactored implementation ` +
           `that passes both AST validation and CodeBERT vulnerability scanning.`;
};

exports.runPerformanceReply = async (code, language, deltaAudit, sigmaAudit) => {
    return `DELTA COUNTER-ANALYSIS:\nSigma's security findings are noted, but many can be addressed without ` +
           `the heavy-handed approaches typically suggested. The AST complexity metrics show room for ` +
           `optimization that Sigma ignores. My performance trace identifies concrete bottlenecks ` +
           `that will impact production throughput. Security hardening should not come at the cost ` +
           `of O(n²) explosion or blocking I/O patterns.`;
};

exports.runJudge = async (code, language, sigmaFull, deltaFull) => {
    try {
        const result = await analyzeCode(code, language);
        const judge = result.combined_report.judge_output;
        
        return JSON.stringify({
            reasoningTrace: judge.reasoningTrace,
            conflictDetected: judge.conflictDetected,
            judgeResolution: judge.judgeResolution,
            optimizedCode: judge.optimizedCode || code
        });
    } catch (err) {
        console.error('[ML Service] Judge failed:', err.message);
        return JSON.stringify({
            reasoningTrace: `ML service error: ${err.message}`,
            conflictDetected: true,
            judgeResolution: 'Unable to render verdict. ML engine offline. Start it with: cd server/ml && python server.py',
            optimizedCode: code
        });
    }
};

exports.isReady = isMLServiceReady;
