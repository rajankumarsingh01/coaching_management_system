const express = require('express');
const router = express.Router();

const attendanceController = require('./attendance.controller');
const { markAttendanceSchema } = require('./attendance.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

// teacher marks attendance (admin/super_admin can too, for corrections)
router.post(
  '/',
  roleMiddleware(ROLES.TEACHER, ROLES.ADMIN),
  validate(markAttendanceSchema),
  attendanceController.markAttendance
);

router.get(
  '/batch/:batchId',
  roleMiddleware(ROLES.TEACHER, ROLES.ADMIN),
  attendanceController.getBatchAttendanceForDate
);

router.get(
  '/batch/:batchId/report',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER),
  attendanceController.getBatchReport
);

// student views their own attendance %
router.get('/me', roleMiddleware(ROLES.STUDENT), attendanceController.getMyAttendance);

// admin/teacher/parent view a specific student's attendance
router.get(
  '/student/:studentId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT),
  attendanceController.getStudentAttendance
);

module.exports = router;