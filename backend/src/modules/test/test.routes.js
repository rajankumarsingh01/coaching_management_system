const express = require('express');
const router = express.Router();

const testController = require('./test.controller');
const { createTestSchema, addQuestionSchema } = require('./test.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');

const { ROLES } = require('../../config/constants');
const uploadSpreadsheet = require('../../middlewares/uploadSpreadsheet.middleware');

router.use(authMiddleware);

router.post('/', roleMiddleware(ROLES.TEACHER, ROLES.ADMIN), validate(createTestSchema), testController.createTest);

router.get(
  '/batch/:batchId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT),
  testController.getBatchTests
);

router.get('/:id/edit', roleMiddleware(ROLES.TEACHER, ROLES.ADMIN), testController.getTestForEdit);

router.get(
  '/:id/attempt',
  roleMiddleware(ROLES.STUDENT),
  testController.getTestForAttempt
);

router.post(
  '/:id/questions',
  roleMiddleware(ROLES.TEACHER, ROLES.ADMIN),
  validate(addQuestionSchema),
  testController.addQuestion
);

router.post(
  '/:id/questions/bulk-upload',
  roleMiddleware(ROLES.TEACHER, ROLES.ADMIN),
  uploadSpreadsheet.single('file'),
  testController.bulkUploadQuestions
);

router.patch('/:id/publish', roleMiddleware(ROLES.TEACHER, ROLES.ADMIN), testController.publishTest);

router.delete('/:id', roleMiddleware(ROLES.TEACHER, ROLES.ADMIN), testController.deleteTest);

module.exports = router;