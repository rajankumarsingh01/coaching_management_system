const express = require('express');
const router = express.Router();

const submissionController = require('./submission.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.post(
  '/homework/:homeworkId',
  roleMiddleware(ROLES.STUDENT),
  upload.single('file'),
  submissionController.submitHomework
);

router.get(
  '/homework/:homeworkId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER),
  submissionController.getHomeworkSubmissions
);

router.get('/me', roleMiddleware(ROLES.STUDENT), submissionController.getMySubmissions);

module.exports = router;