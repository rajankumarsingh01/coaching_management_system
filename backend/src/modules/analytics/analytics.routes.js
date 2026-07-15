const express = require('express');
const router = express.Router();

const analyticsController = require('./analytics.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.get(
  '/dashboard',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  analyticsController.getDashboardOverview
);

router.get(
  '/batch-wise',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  analyticsController.getBatchWiseBreakdown
);

module.exports = router;