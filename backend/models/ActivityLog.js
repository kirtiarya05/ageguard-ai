const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    actionType: { type: String, enum: ['APP_OPENED', 'URL_VISITED', 'CONTENT_BLOCKED'], required: true },
    targetContent: { type: String }, // Can be an app package name or URL
    riskScore: { type: Number },
    timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);
