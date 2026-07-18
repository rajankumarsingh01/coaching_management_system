const express = require('express');
const router = express.Router();

const userController = require('./user.controller');
const { registerSchema, updateUserSchema } = require('./user.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');   // NEW
const { ROLES } = require('../../config/constants');

router.post('/register', authMiddleware, roleMiddleware(ROLES.ADMIN), validate(registerSchema), userController.register);

router.get('/me', authMiddleware, userController.getMe);

// NEW — self-service profile picture (koi bhi logged-in role use kar sakta hai,
// isliye roleMiddleware nahi hai — sirf authMiddleware). ':id' wale generic
// routes se pehle rakha hai taaki '/me/avatar' unse clash na kare.
router.post('/me/avatar', authMiddleware, upload.single('avatar'), userController.uploadAvatar);
router.delete('/me/avatar', authMiddleware, userController.deleteAvatar);

router.get('/', authMiddleware, roleMiddleware(ROLES.ADMIN, ROLES.TEACHER), userController.getUsersByRole);

router.get('/my-children', authMiddleware, roleMiddleware(ROLES.PARENT), userController.getMyChildren);

router.get('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), userController.getUserById);
router.patch('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), validate(updateUserSchema), userController.updateUser);
router.delete('/:id', authMiddleware, roleMiddleware(ROLES.ADMIN), userController.deactivateUser);
router.patch('/:id/reactivate', authMiddleware, roleMiddleware(ROLES.ADMIN), userController.reactivateUser);

module.exports = router;