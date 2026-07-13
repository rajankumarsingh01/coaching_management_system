const express = require('express');
const router = express.Router();

const lectureController = require('./lecture.controller');
const { createLectureSchema } = require('./lecture.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(ROLES.TEACHER, ROLES.ADMIN),
  validate(createLectureSchema),
  lectureController.createLecture
);

router.get(
  '/batch/:batchId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT),
  lectureController.getBatchLectures
);

router.delete('/:id', roleMiddleware(ROLES.TEACHER, ROLES.ADMIN), lectureController.deleteLecture);

module.exports = router;