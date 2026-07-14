const express = require('express');
const router = express.Router();

const gamificationController = require('./gamification.controller');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.get('/me', roleMiddleware(ROLES.STUDENT), gamificationController.getMyProfile);

module.exports = router;