const express = require('express');
const router = express.Router();

const batchController = require('./batch.controller');
const { createBatchSchema, updateBatchSchema, assignUserSchema } = require('./batch.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

// admin manages batches (super_admin bypasses automatically via role.middleware)
router.post('/', roleMiddleware(ROLES.ADMIN), validate(createBatchSchema), batchController.createBatch);
router.get('/', roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT), batchController.getAllBatches);
router.get('/:id', roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT), batchController.getBatchById);
router.patch('/:id', roleMiddleware(ROLES.ADMIN), validate(updateBatchSchema), batchController.updateBatch);
router.delete('/:id', roleMiddleware(ROLES.ADMIN), batchController.deleteBatch);

router.post(
  '/:id/assign-student',
  roleMiddleware(ROLES.ADMIN),
  validate(assignUserSchema),
  batchController.assignStudent
);
router.post(
  '/:id/assign-teacher',
  roleMiddleware(ROLES.ADMIN),
  validate(assignUserSchema),
  batchController.assignTeacher
);

module.exports = router;