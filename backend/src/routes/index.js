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

module.exports = router;