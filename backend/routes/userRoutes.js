const express = require('express');
const { getChildren, registerChild } = require('../controllers/userController');
const router = express.Router();

router.get('/children', getChildren);
router.post('/register-child', registerChild);

module.exports = router;
