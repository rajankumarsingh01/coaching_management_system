const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const { loginSchema, refreshTokenSchema } = require('./auth.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');

router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;