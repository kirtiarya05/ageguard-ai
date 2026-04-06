const Restriction = require('../models/Restriction');
const ActivityLog = require('../models/ActivityLog');

exports.getDashboard = async (req, res) => {
    try {
        const parentId = req.user.id; // From JWT middleware
        
        // Let's get logs for their children
        const logs = await ActivityLog.find()
            .populate({ path: 'user', match: { parentAccount: parentId } })
            .limit(50)
            .sort({ timestamp: -1 });

        const restrictions = await Restriction.find({ parent: parentId });

        res.json({ logs: logs.filter(l => l.user), restrictions });
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
