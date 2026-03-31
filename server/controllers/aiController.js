const geminiService = require('../services/geminiService');
const CodeReview = require('../models/CodeReview');

exports.reviewCode = async (req, res, next) => {
    try {
        const { code, language } = req.body;
        
        if (!code) {
            return res.status(400).json({ success: false, message: 'Code snippet is required' });
        }

        // Concurrent execution of Auditor and Optimizer (Cognitive Friction)
        const [auditorOutput, optimizerOutput] = await Promise.all([
            geminiService.runSecurityAuditor(code, language || 'javascript'),
            geminiService.runPerformanceOptimizer(code, language || 'javascript')
        ]);

        // Sequential execution of The Judge
        const rawJudgeOutput = await geminiService.runJudge(code, language || 'javascript', auditorOutput, optimizerOutput);
        
        let judgeParsed;
        try {
            judgeParsed = JSON.parse(rawJudgeOutput);
        } catch (e) {
            // Fallback if the AI fails to return strictly JSON
            judgeParsed = {
                reasoningTrace: rawJudgeOutput,
                conflictDetected: false,
                judgeResolution: "Failed to parse Judge's strict JSON output. Please see reasoning trace."
            };
        }

        // Save to Database
        const review = await CodeReview.create({
            user: req.user ? req.user._id : null, // Handle both authenticated and anonymous
            originalCode: code,
            language: language || 'javascript',
            auditorOutput,
            optimizerOutput,
            judgeResolution: judgeParsed.judgeResolution,
            reasoningTrace: judgeParsed.reasoningTrace,
            conflictDetected: judgeParsed.conflictDetected || false
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};
