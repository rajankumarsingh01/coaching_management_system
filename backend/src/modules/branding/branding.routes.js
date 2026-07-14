const express = require('express');
const router = express.Router({ mergeParams: true }); // needs :instituteId from parent mount

const brandingController = require('./branding.controller');
const { updateBrandingSchema } = require('./branding.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.get('/', brandingController.getBranding); // any authenticated user of the institute

router.put('/', roleMiddleware(ROLES.ADMIN), validate(updateBrandingSchema), brandingController.updateBranding);

router.post('/logo', roleMiddleware(ROLES.ADMIN), upload.single('file'), brandingController.uploadLogo);

router.post('/banner', roleMiddleware(ROLES.ADMIN), upload.single('file'), brandingController.uploadBanner);

module.exports = router;