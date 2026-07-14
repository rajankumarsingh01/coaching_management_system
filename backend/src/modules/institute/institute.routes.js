const express = require('express');
const router = express.Router();

const instituteController = require('./institute.controller');
const { createInstituteSchema } = require('./institute.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.post(
  '/',
  authMiddleware,
  roleMiddleware(ROLES.SUPER_ADMIN),
  validate(createInstituteSchema),
  instituteController.createInstitute
);

router.get('/', authMiddleware, roleMiddleware(ROLES.SUPER_ADMIN), instituteController.getAllInstitutes);

// mounted here so URLs are /api/v1/institutes/:instituteId/branding/...
router.use('/:instituteId/branding', require('../branding/branding.routes'));

module.exports = router;