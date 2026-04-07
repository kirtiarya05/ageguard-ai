/**
 * AgeGuard AI - FCM Token Controller
 * =====================================
 * Handles registration and retrieval of FCM device tokens.
 * Tokens are stored on the User model so the backend can push
 * to any device at any time — not just when it's connected via WebSocket.
 */

const User = require('../models/User');
const { notifyLockdown, notifyContentBlocked, notifyScreenTimeLimit } = require('../services/NotificationService');

// Save or update a device's FCM token
exports.registerFCMToken = async (req, res) => {
    try {
        const { userId, fcmToken } = req.body;
        if (!userId || !fcmToken) {
            return res.status(400).json({ message: 'userId and fcmToken are required.' });
        }

        await User.findByIdAndUpdate(userId, { fcmToken }, { new: true });
        console.log(`🔔 FCM token registered for user ${userId}`);
        res.json({ success: true, message: 'FCM token registered.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get parent's FCM token (used internally when sending alerts)
exports.getParentFCMToken = async (childId) => {
    try {
        const child = await User.findById(childId).populate('parentAccount', 'fcmToken');
        return child?.parentAccount?.fcmToken || null;
    } catch {
        return null;
    }
};

// Test endpoint: send a test push to the requesting user's device
exports.sendTestNotification = async (req, res) => {
    try {
        const userId = req.body.userId;
        const user = await User.findById(userId).select('fcmToken email');

        if (!user?.fcmToken) {
            return res.status(404).json({ message: 'No FCM token registered for this user.' });
        }

        const { sendNotification } = require('../services/NotificationService');
        const result = await sendNotification({
            token: user.fcmToken,
            title: '🛡️ AgeGuard AI — Test Notification',
            body: 'Push notifications are working correctly!',
            data: { event: 'TEST' },
        });

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Called by content proxy route when AI flags content as RESTRICTED
exports.triggerContentBlockedAlert = async (req, res) => {
    try {
        const { childId, content, riskScore } = req.body;
        const child = await User.findById(childId).select('userId parentAccount');
        const parentToken = await exports.getParentFCMToken(childId);

        if (parentToken) {
            await notifyContentBlocked(parentToken, {
                childName: child?.userId || 'Your child',
                content,
                riskScore,
            });
        }

        res.json({ success: true, notified: !!parentToken });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
