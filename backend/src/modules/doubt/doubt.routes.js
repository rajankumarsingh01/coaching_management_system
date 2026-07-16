const express = require('express');
const router = express.Router();

const doubtController = require('./doubt.controller');
const { askDoubtSchema } = require('./doubt.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

router.post('/', roleMiddleware(ROLES.STUDENT), validate(askDoubtSchema), doubtController.askDoubt);
router.get('/me', roleMiddleware(ROLES.STUDENT), doubtController.getMyDoubts);

module.exports = router;