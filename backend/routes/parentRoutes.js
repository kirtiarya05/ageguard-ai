const express = require('express');
const { getDashboard, updateRules } = require('../controllers/parentController');
const router = express.Router();

// Middlewares like `protect` or `requireParent` would be added here
router.get('/dashboard', getDashboard);
router.post('/rules', updateRules);

module.exports = router;
