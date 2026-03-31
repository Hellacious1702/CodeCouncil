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
