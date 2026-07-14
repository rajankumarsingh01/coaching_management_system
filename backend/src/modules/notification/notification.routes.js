const express = require('express');
const router = express.Router();

const notificationController = require('./notification.controller');
const { registerTokenSchema } = require('./notification.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/register-token', validate(registerTokenSchema), notificationController.registerToken);

module.exports = router;