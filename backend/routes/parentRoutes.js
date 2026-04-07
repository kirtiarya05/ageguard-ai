const express = require('express');
const { getDashboard, updateRules, updateSubscription, lockDevice, getChildLocations, updateBlockedApps, getRestrictions } = require('../controllers/parentController');
const router = express.Router();

// Middlewares like `protect` or `requireParent` would be added here
router.get('/dashboard', getDashboard);
router.post('/rules', updateRules);
router.post('/subscription', updateSubscription);
router.post('/lock-device', lockDevice);              // 🚨 Emergency Lockdown (real-time socket)
router.get('/child-locations', getChildLocations);    // 📍 Geolocation tracking
router.post('/blocked-apps', updateBlockedApps);       // 📱 App Blocking (real-time socket)
router.get('/restrictions', getRestrictions);          // 📋 Get current restriction state

module.exports = router;
