const express = require('express');
const { getSleepSchedule, setSleepSchedule, deleteSleepSchedule } = require('../controllers/sleepController');
const { protect, requireParent } = require('../middleware/protect');
const router = express.Router();

router.use(protect, requireParent);

router.get('/:childId',    getSleepSchedule);
router.post('/:childId',   setSleepSchedule);
router.delete('/:childId', deleteSleepSchedule);

module.exports = router;
