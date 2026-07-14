const express = require('express');
const router = express.Router();

const resultController = require('./result.controller');
const { submitTestSchema } = require('./result.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.post(
  '/test/:testId/submit',
  roleMiddleware(ROLES.STUDENT),
  validate(submitTestSchema),
  resultController.submitTest
);

router.get(
  '/test/:testId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER),
  resultController.getTestResults
);

router.get('/me', roleMiddleware(ROLES.STUDENT), resultController.getMyResults);

router.get(
  '/leaderboard/:batchId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT),
  resultController.getLeaderboard
);

router.get('/weak-topics/me', roleMiddleware(ROLES.STUDENT), resultController.getMyWeakTopics);

module.exports = router;