const express = require('express');
const router = express.Router();

const parentReportController = require('./parentReport.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.get(
  '/student/:studentId',
  roleMiddleware(ROLES.PARENT, ROLES.ADMIN, ROLES.TEACHER),
  parentReportController.getStudentParentReport
);

module.exports = router;