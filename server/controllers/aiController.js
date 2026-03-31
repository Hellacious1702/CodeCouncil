const geminiService = require('../services/geminiService');
const groqService = require('../services/groqService');
const rulesEngineService = require('../services/rulesEngineService');
const CodeReview = require('../models/CodeReview');

exports.reviewCode = async (req, res, next) => {
    try {
        const { code, language, provider = 'gemini', customSigmaPrompt, customDeltaPrompt, customJudgePrompt } = req.body;
        const lang = language || 'javascript';
        
        if (!code) {
            return res.status(400).json({ success: false, message: 'Code snippet is required' });
        }

        // PROVIDER FACTORY: SELECT NEURAL CORE
        let service;
        switch (provider) {
            case 'groq':
                service = groqService;
                break;
            case 'local':
                service = rulesEngineService;
                break;
            case 'gemini':
            default:
                service = geminiService;
        }

        console.log(`[MAS] Initiating Review via [${provider.toUpperCase()}] Provider...`);

        // STEP 1: INITIAL PASS (Parallel)
        console.log(`[MAS] Tasking Sigma & Delta Agents...`);
        const [sigmaInitial, deltaInitial] = await Promise.all([
            service.runSecurityAuditor(code, lang, customSigmaPrompt),
            service.runPerformanceOptimizer(code, lang, customDeltaPrompt)
        ]);

        // STEP 2: COUNTER-POINTS (Parallel)
        console.log(`[MAS] Initiating Adversarial Contextualization...`);
        const [sigmaCounter, deltaCounter] = await Promise.all([
            service.runSecurityReply(code, lang, sigmaInitial, deltaInitial),
            service.runPerformanceReply(code, lang, deltaInitial, sigmaInitial)
        ]);

        // Full Traces for the Judge
        const sigmaFull = `INITIAL_AUDIT:\n${sigmaInitial}\n\nREACTION_TO_DELTA:\n${sigmaCounter}`;
        const deltaFull = `INITIAL_AUDIT:\n${deltaInitial}\n\nREACTION_TO_SIGMA:\n${deltaCounter}`;

        // STEP 3: ARBITRATION
        console.log(`[MAS] Initiating Judicial Settlement...`);
        const rawJudgeOutput = await service.runJudge(code, lang, sigmaFull, deltaFull, customJudgePrompt);
        
        let judgeParsed;
        try {
            judgeParsed = typeof rawJudgeOutput === 'object' ? rawJudgeOutput : JSON.parse(rawJudgeOutput);
        } catch (e) {
            judgeParsed = {
                reasoningTrace: rawJudgeOutput,
                conflictDetected: true,
                judgeResolution: "Neural synthesis parsed as text due to format variance.",
                optimizedCode: code 
            };
        }

        // Save to Database
        const review = await CodeReview.create({
            user: req.user ? req.user._id : null,
            originalCode: code,
            language: lang,
            auditorOutput: sigmaFull,
            optimizerOutput: deltaFull,
            judgeResolution: judgeParsed.judgeResolution,
            optimizedCode: judgeParsed.optimizedCode || code,
            reasoningTrace: judgeParsed.reasoningTrace,
            conflictDetected: judgeParsed.conflictDetected || false,
            provider // Track which provider was used
        });

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error) {
        console.error(`[MAS] Internal Protocol Error:`, error);
        next(error);
    }
};

// Get all reviews for the current user
exports.getReviews = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'Authentication required for history' });
        }

        const reviews = await CodeReview.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        });
    } catch (error) {
        next(error);
    }
};

// Get single review by ID
exports.getReviewById = async (req, res, next) => {
    try {
        const review = await CodeReview.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Check ownership
        if (review.user && review.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ success: false, message: 'Not authorized to view this review' });
        }

        res.status(200).json({
            success: true,
            data: review
        });
    } catch (error) {
        next(error);
    }
};
