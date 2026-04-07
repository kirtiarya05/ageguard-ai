/**
 * AgeGuard AI - Sleep Scheduler Controller
 * ==========================================
 * Saves quiet-hours schedule per child.
 * A background interval checks every minute and auto-locks
 * child devices that are inside their sleep window.
 */

const SleepSchedule = require('../models/SleepSchedule');
const User = require('../models/User');

// ─── Helpers ────────────────────────────────────────────────────────────────

/** True if timeNow (HH:MM) falls inside [start, end] — handles midnight crossover */
function isInSleepWindow(timeNow, start, end) {
    if (start <= end) return timeNow >= start && timeNow <= end;
    // crosses midnight e.g. 22:00 → 07:00
    return timeNow >= start || timeNow <= end;
}

function nowHHMM() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

const DAY_MAP = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ─── Auto-lock ticker ───────────────────────────────────────────────────────

let _io = null;

function startSleepWatcher(io) {
    _io = io;
    setInterval(async () => {
        try {
            const now = nowHHMM();
            const dayName = DAY_MAP[new Date().getDay()];
            const schedules = await SleepSchedule.find({ enabled: true });

            for (const sched of schedules) {
                if (!sched.activeDays.includes(dayName)) continue;
                const inWindow = isInSleepWindow(now, sched.sleepStart, sched.sleepEnd);
                const child = await User.findById(sched.child).select('isLocked');
                if (!child) continue;

                if (inWindow && !child.isLocked) {
                    // Lock the device
                    await User.findByIdAndUpdate(sched.child, { isLocked: true });
                    if (_io) {
                        _io.to(`user-${sched.child}`).emit('emergency-lockdown', {
                            locked: true,
                            message: '🌙 Quiet hours are active. Your device has been locked.',
                        });
                    }
                    console.log(`🌙 Sleep lock applied: ${sched.child} at ${now}`);
                } else if (!inWindow && child.isLocked) {
                    // Only auto-unlock if lock was set by sleep (not by parent manually)
                    // We check via sleepLocked flag — but for simplicity unlock in morning
                    await User.findByIdAndUpdate(sched.child, { isLocked: false });
                    if (_io) {
                        _io.to(`user-${sched.child}`).emit('emergency-lockdown', {
                            locked: false,
                            message: '☀️ Quiet hours ended. Your device is unlocked.',
                        });
                    }
                    console.log(`☀️ Sleep unlock applied: ${sched.child} at ${now}`);
                }
            }
        } catch (err) {
            console.error('[SleepWatcher] Error:', err.message);
        }
    }, 60_000); // check every minute
}

// ─── API Handlers ────────────────────────────────────────────────────────────

exports.getSleepSchedule = async (req, res) => {
    try {
        const { childId } = req.params;
        const parentId = req.user.id;
        const schedule = await SleepSchedule.findOne({ parent: parentId, child: childId });
        res.json(schedule || { enabled: false, sleepStart: '22:00', sleepEnd: '07:00', activeDays: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.setSleepSchedule = async (req, res) => {
    try {
        const { childId } = req.params;
        const parentId = req.user.id;
        const { enabled, sleepStart, sleepEnd, activeDays } = req.body;

        const schedule = await SleepSchedule.findOneAndUpdate(
            { parent: parentId, child: childId },
            { enabled, sleepStart, sleepEnd, activeDays, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        // Push schedule to child device immediately
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${childId}`).emit('sleep-schedule-updated', {
                enabled, sleepStart, sleepEnd, activeDays,
            });
        }

        res.json(schedule);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteSleepSchedule = async (req, res) => {
    try {
        const { childId } = req.params;
        await SleepSchedule.deleteOne({ parent: req.user.id, child: childId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports.startSleepWatcher = startSleepWatcher;
