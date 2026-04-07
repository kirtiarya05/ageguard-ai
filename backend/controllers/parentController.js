const Restriction = require('../models/Restriction');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');

exports.getDashboard = async (req, res) => {
    try {
        const parentId = req.user.id;
        const parent = await User.findById(parentId);

        const isSubscribed = parent.subscription && parent.subscription.status === 'active';
        const logLimit = isSubscribed ? 50 : 2;

        const logs = await ActivityLog.find()
            .populate({ path: 'user', match: { parentAccount: parentId } })
            .limit(logLimit)
            .sort({ timestamp: -1 });

        const restrictions = await Restriction.find({ parent: parentId });

        res.json({ 
            logs: logs.filter(l => l.user), 
            restrictions,
            subscription: parent.subscription,
            isLocked: !isSubscribed
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateSubscription = async (req, res) => {
    try {
        const { plan } = req.body;
        const parentId = req.user.id;
        
        const expiryDate = new Date();
        if (plan === 'monthly') expiryDate.setMonth(expiryDate.getMonth() + 1);
        else if (plan === 'bi-monthly') expiryDate.setMonth(expiryDate.getMonth() + 2);
        else if (plan === 'yearly') expiryDate.setFullYear(expiryDate.getFullYear() + 1);

        const user = await User.findByIdAndUpdate(parentId, {
            subscription: { status: 'active', plan, expiry: expiryDate }
        }, { new: true });

        res.json(user.subscription);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.updateRules = async (req, res) => {
    try {
        const { childId, blockedCategories, blockedDomains, screenTimeLimitHours } = req.body;
        const parentId = req.user.id;

        const restriction = await Restriction.findOneAndUpdate(
            { parent: parentId, child: childId },
            { blockedCategories, blockedDomains, screenTimeLimitHours },
            { new: true, upsert: true }
        );

        // ✅ Emit real-time event to child device — no more polling lag!
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${childId}`).emit('rules-updated', {
                blockedCategories,
                blockedDomains,
                screenTimeLimitHours,
                updatedAt: new Date()
            });
            console.log(`📡 Rules pushed to device user-${childId}`);
        }

        res.json(restriction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 🚨 New: Emergency Lockdown — instantly locks a child's device
exports.lockDevice = async (req, res) => {
    try {
        const { childId, locked } = req.body;
        const io = req.app.get('io');

        if (io) {
            io.to(`user-${childId}`).emit('emergency-lockdown', {
                locked: locked !== false, // default true
                message: locked !== false
                    ? '🔒 Your device has been locked by your parent.'
                    : '🔓 Device lockdown has been lifted.',
                timestamp: new Date()
            });
            console.log(`${locked ? '🔒' : '🔓'} Lockdown signal sent to device user-${childId}`);
        }

        // Persist lock state
        await User.findByIdAndUpdate(childId, { isLocked: locked !== false });

        res.json({ success: true, childId, locked: locked !== false });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📱 New: Update blocked apps list — instantly pushed to child device
exports.updateBlockedApps = async (req, res) => {
    try {
        const { childId, blockedApps } = req.body;
        const parentId = req.user ? req.user.id : 'demo-parent';

        await Restriction.findOneAndUpdate(
            { parent: parentId, child: childId },
            { blockedApps, updatedAt: new Date() },
            { new: true, upsert: true }
        );

        // Push to child device instantly via socket
        const io = req.app.get('io');
        if (io) {
            io.to(`user-${childId}`).emit('apps-blocked', {
                blockedApps,
                updatedAt: new Date()
            });
            console.log(`📱 App block list pushed to user-${childId}:`, blockedApps);
        }

        res.json({ success: true, childId, blockedApps });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 📋 Get current restrictions for a child
exports.getRestrictions = async (req, res) => {
    try {
        const { childId } = req.query;
        const parentId = req.user ? req.user.id : 'demo-parent';
        const restriction = await Restriction.findOne({ parent: parentId, child: childId });
        res.json(restriction || { blockedApps: [], blockedCategories: [], blockedDomains: [], screenTimeLimitHours: 2 });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
