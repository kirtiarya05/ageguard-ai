const Restriction = require('../models/Restriction');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboard = async (req, res) => {
    try {
        const parentId = req.user.id;
        const parent = await User.findById(parentId);

        const isSubscribed = parent.subscription && parent.subscription.status === 'active';
        
        // If not subscribed, limit to last 2 logs and show "LOCKED" state
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
            subscription: {
                status: 'active',
                plan,
                expiry: expiryDate
            }
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

        res.json(restriction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
