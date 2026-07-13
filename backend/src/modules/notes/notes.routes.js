const express = require('express');
const router = express.Router();

const notesController = require('./notes.controller');
const { uploadNotesSchema } = require('./notes.validation');
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
  validate(uploadNotesSchema),
  notesController.uploadNotes
);

router.get(
  '/batch/:batchId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT),
  notesController.getBatchNotes
);

router.delete('/:id', roleMiddleware(ROLES.TEACHER, ROLES.ADMIN), notesController.deleteNotes);

module.exports = router;