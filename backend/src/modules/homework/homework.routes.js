const express = require('express');
const router = express.Router();

const homeworkController = require('./homework.controller');
const { createHomeworkSchema } = require('./homework.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(ROLES.TEACHER, ROLES.ADMIN),
  upload.single('file'),
  validate(createHomeworkSchema),
  homeworkController.createHomework
);

router.get(
  '/batch/:batchId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT),
  homeworkController.getBatchHomework
);

router.delete('/:id', roleMiddleware(ROLES.TEACHER, ROLES.ADMIN), homeworkController.deleteHomework);

module.exports = router;