const mongoose = require('mongoose');

const AgeProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    predictedAge: { type: Number, required: true },
    ageGroup: { 
        type: String, 
        enum: ['CHILD', 'EARLY_TEEN', 'TEEN', 'ADULT'], 
        required: true 
    },
    confidenceScore: { type: Number },
    lastScannedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('AgeProfile', AgeProfileSchema);
