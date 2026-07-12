const express = require('express');
const router = express.Router();

const userController = require('./user.controller');
const { registerSchema } = require('./user.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.post(
  '/register',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN),
  validate(registerSchema),
  userController.register
);

router.get('/me', authMiddleware, userController.getMe);

// used to populate dropdowns — e.g. GET /users?role=student
router.get(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER),
  userController.getUsersByRole
);

// parent viewing their own linked children
router.get('/my-children', authMiddleware, roleMiddleware(ROLES.PARENT), userController.getMyChildren);

module.exports = router;