const express = require('express');
const router = express.Router();

const userController = require('./user.controller');
const { registerSchema } = require('./user.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// Only a tenant ADMIN registers teacher/student/parent (super_admin bypasses automatically
// via role.middleware, but super_admin creating users should go through /institutes instead)
router.post(
  '/register',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(registerSchema),
  userController.register
);

router.get('/me', authMiddleware, userController.getMe);

module.exports = router;