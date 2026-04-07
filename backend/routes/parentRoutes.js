const express = require('express');
const { getDashboard, updateRules, updateSubscription } = require('../controllers/parentController');
const router = express.Router();

// Middlewares like `protect` or `requireParent` would be added here
router.get('/dashboard', getDashboard);
router.post('/rules', updateRules);
router.post('/subscription', updateSubscription);

module.exports = router;
