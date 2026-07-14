const express = require('express');
const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

router.use('/auth', require('../modules/auth/auth.routes'));
router.use('/users', require('../modules/user/user.routes'));
router.use('/institutes', require('../modules/institute/institute.routes'));
router.use('/batches', require('../modules/batch/batch.routes'));
router.use('/attendance', require('../modules/attendance/attendance.routes'));
router.use('/fees', require('../modules/fee/fee.routes'));
router.use('/notes', require('../modules/notes/notes.routes'));
router.use('/lectures', require('../modules/lecture/lecture.routes'));
router.use('/tests', require('../modules/test/test.routes'));
router.use('/results', require('../modules/result/result.routes'));
router.use('/homework', require('../modules/homework/homework.routes'));
router.use('/submissions', require('../modules/submission/submission.routes'));
router.use('/notifications', require('../modules/notification/notification.routes'));
router.use('/calendar', require('../modules/calendar/calendar.routes'));
router.use('/gamification', require('../modules/gamification/gamification.routes'));

module.exports = router;