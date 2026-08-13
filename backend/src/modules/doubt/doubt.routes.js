const express = require('express');
const router = express.Router();

const doubtController = require('./doubt.controller');
const { askDoubtSchema } = require('./doubt.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const upload = require('../../middlewares/upload.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

// upload.single('image') runs BEFORE validate — multer needs to parse the
// multipart body first so req.body.question/subject are populated for zod.
router.post(
  '/',
  roleMiddleware(ROLES.STUDENT),
  upload.single('image'),
  validate(askDoubtSchema),
  doubtController.askDoubt
);
router.get('/me', roleMiddleware(ROLES.STUDENT), doubtController.getMyDoubts);

module.exports = router;