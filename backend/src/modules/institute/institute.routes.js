const express = require('express');
const router = express.Router();

const instituteController = require('./institute.controller');
const { createInstituteSchema } = require('./institute.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

// Only super_admin can create institutes — institutes do not self-register
router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN),
  validate(createInstituteSchema),
  instituteController.createInstitute
);

router.get('/', authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN), instituteController.getAllInstitutes);

module.exports = router;