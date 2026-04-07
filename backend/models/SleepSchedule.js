const mongoose = require('mongoose');

const SleepScheduleSchema = new mongoose.Schema({
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    child:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enabled: { type: Boolean, default: true },
    sleepStart: { type: String, default: '22:00' }, // HH:MM (24h)
    sleepEnd:   { type: String, default: '07:00' }, // HH:MM (24h)
    activeDays: { type: [String], default: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] },
    updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SleepSchedule', SleepScheduleSchema);
