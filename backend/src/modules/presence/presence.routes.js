const express = require('express');
const router = express.Router();

const presenceController = require('./presence.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

// Sirf admin apne institute ka live online-users widget dekh sakta hai
router.get('/online-summary', roleMiddleware(ROLES.ADMIN), presenceController.getOnlineSummary);

module.exports = router;