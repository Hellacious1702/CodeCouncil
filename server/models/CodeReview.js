const mongoose = require('mongoose');

const codeReviewSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // temporarily false to allow anonymous testing if needed, though we will try to enforce it
    },
    originalCode: {
        type: String,
        required: true
    },
    language: {
        type: String,
        default: 'javascript'
    },
    auditorOutput: {
        type: String,
        required: true
    },
    optimizerOutput: {
        type: String,
        required: true
    },
    judgeResolution: {
        type: String,
        required: true
    },
    reasoningTrace: {
        type: String,
        required: true
    },
    conflictDetected: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

const CodeReview = mongoose.model('CodeReview', codeReviewSchema);
module.exports = CodeReview;
