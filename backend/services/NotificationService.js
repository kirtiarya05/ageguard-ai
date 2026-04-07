/**
 * AgeGuard AI - FCM Notification Service (Backend)
 * ==================================================
 * Sends Firebase Cloud Messaging push notifications.
 * Firebase is initialized from FIREBASE_SERVICE_ACCOUNT_JSON env var
 * (paste the entire service account JSON as a single-line string on Render).
 * Falls back to console mock if env var is missing.
 */

const path = require('path');

let admin      = null;
let messaging  = null;

function initFirebase() {
    if (admin) return true;
    try {
        admin = require('firebase-admin');

        let credential;

        // 1. Try env var (production / Render)
        if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
            credential = admin.credential.cert(serviceAccount);
            console.log('🔔 Firebase: using FIREBASE_SERVICE_ACCOUNT_JSON env var');
        } else {
            // 2. Try local file (development)
            const filePath = path.join(__dirname, '..', 'firebase-service-account.json');
            const serviceAccount = require(filePath);
            credential = admin.credential.cert(serviceAccount);
            console.log('🔔 Firebase: using local firebase-service-account.json');
        }

        if (!admin.apps.length) {
            admin.initializeApp({
                credential,
                projectId: process.env.FIREBASE_PROJECT_ID,
            });
        }
        messaging = admin.messaging();
        console.log('✅ Firebase Admin SDK initialized — FCM ready.');
        return true;
    } catch (err) {
        console.warn('⚠️  FCM unavailable — push notifications disabled:', err.message);
        admin    = null;
        messaging = null;
        return false;
    }
}

initFirebase();

const sendNotification = async ({ token, title, body, data = {} }) => {
    if (!messaging || !token) {
        console.log(`[FCM MOCK] "${title}" → ${token?.slice(0, 20) || 'no token'}`);
        return { success: false, reason: 'FCM not configured' };
    }
    try {
        const message = {
            token,
            notification: { title, body },
            data: Object.fromEntries(
                Object.entries(data).map(([k, v]) => [k, String(v)])
            ),
            android: {
                priority: 'high',
                notification: { sound: 'default', channelId: 'ageguard_alerts', color: '#6366f1' },
            },
        };
        const response = await messaging.send(message);
        console.log(`🔔 FCM sent — messageId: ${response}`);
        return { success: true, messageId: response };
    } catch (err) {
        console.error('❌ FCM send error:', err.message);
        return { success: false, error: err.message };
    }
};

const sendMulticast = async ({ tokens, title, body, data = {} }) => {
    if (!messaging || !tokens?.length) return;
    const message = {
        tokens,
        notification: { title, body },
        data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
        android: { priority: 'high' },
    };
    const response = await messaging.sendEachForMulticast(message);
    console.log(`🔔 FCM multicast: ${response.successCount}/${tokens.length} delivered`);
    return response;
};

const notifyContentBlocked = (parentToken, { childName, content, riskScore }) =>
    sendNotification({
        token: parentToken,
        title: `🚫 Content Blocked — ${childName}`,
        body: `"${content}" was blocked (Risk: ${riskScore})`,
        data: { event: 'CONTENT_BLOCKED', content, riskScore },
    });

const notifyLockdown = (parentToken, { childName, locked }) =>
    sendNotification({
        token: parentToken,
        title: locked ? `🔒 Device Locked — ${childName}` : `🔓 Device Unlocked — ${childName}`,
        body: locked ? `${childName}'s device has been locked remotely.` : `${childName}'s lockdown has been lifted.`,
        data: { event: 'LOCKDOWN', locked: String(locked) },
    });

const notifyScreenTimeLimit = (parentToken, { childName, limitHours }) =>
    sendNotification({
        token: parentToken,
        title: `⏰ Screen Time Limit — ${childName}`,
        body: `${childName} has used ${limitHours}h of screen time today.`,
        data: { event: 'SCREEN_TIME_LIMIT', limitHours },
    });

const notifyLocationAlert = (parentToken, { childName, address }) =>
    sendNotification({
        token: parentToken,
        title: `📍 Location Alert — ${childName}`,
        body: `${childName} left a safe zone. Last seen: ${address || 'Unknown'}`,
        data: { event: 'LOCATION_ALERT', address },
    });

const notifyAppBlocked = (parentToken, { childName, appName }) =>
    sendNotification({
        token: parentToken,
        title: `📱 App Block Triggered — ${childName}`,
        body: `${childName} tried to open "${appName}" which is blocked.`,
        data: { event: 'APP_BLOCKED', appName },
    });

module.exports = {
    sendNotification,
    sendMulticast,
    notifyContentBlocked,
    notifyLockdown,
    notifyScreenTimeLimit,
    notifyLocationAlert,
    notifyAppBlocked,
};
