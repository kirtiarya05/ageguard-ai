const mongoose = require('mongoose');

const RestrictionSchema = new mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    child: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    blockedCategories: [{ type: String }],
    blockedDomains: [{ type: String }],
    blockedApps: [{ type: String }],
    screenTimeLimitHours: { type: Number, default: 2 },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Restriction', RestrictionSchema);
