const express = require('express');
const {
    registerFCMToken,
    sendTestNotification,
    triggerContentBlockedAlert,
} = require('../controllers/notificationController');

const router = express.Router();

// Register or refresh an FCM token for a device
router.post('/register-token', registerFCMToken);

// Test: send a push to the specified user's device
router.post('/test', sendTestNotification);

// Trigger a "content blocked" push alert to the parent
router.post('/content-blocked', triggerContentBlockedAlert);

module.exports = router;
