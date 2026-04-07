const express = require('express');
const {
    getDashboard, updateRules, updateSubscription, lockDevice,
    getChildLocations, updateBlockedApps, getRestrictions,
    getChildren, getReport,
} = require('../controllers/parentController');
const { protect, requireParent } = require('../middleware/protect');
const router = express.Router();

// All parent routes require a valid JWT + PARENT role
router.use(protect, requireParent);

router.get('/dashboard',              getDashboard);
router.get('/children',               getChildren);         // 👶 list children
router.post('/rules',                 updateRules);
router.post('/subscription',          updateSubscription);
router.post('/lock-device',           lockDevice);          // 🚨 Emergency Lockdown
router.get('/child-locations',        getChildLocations);   // 📍 Geolocation
router.post('/blocked-apps',          updateBlockedApps);   // 📱 App Blocking
router.get('/restrictions',           getRestrictions);     // 📋 Get restriction state
router.get('/report/:childId',        getReport);           // 📊 Weekly report

module.exports = router;
