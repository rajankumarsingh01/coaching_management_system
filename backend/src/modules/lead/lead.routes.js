const express = require('express');
const router = express.Router();

const leadController = require('./lead.controller');
const {
  createLeadSchema,
  updateLeadSchema,
  changeStatusSchema,
  addNoteSchema,
} = require('./lead.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

// Abhi ke liye sirf admin isse manage karta hai (teacher access baad me add ho sakta hai)
router.post('/', roleMiddleware(ROLES.ADMIN), validate(createLeadSchema), leadController.createLead);
router.get('/', roleMiddleware(ROLES.ADMIN), leadController.getAllLeads);
router.get('/follow-ups-due', roleMiddleware(ROLES.ADMIN), leadController.getFollowUpsDueToday);
router.get('/:id', roleMiddleware(ROLES.ADMIN), leadController.getLeadById);
router.patch('/:id', roleMiddleware(ROLES.ADMIN), validate(updateLeadSchema), leadController.updateLead);
router.patch(
  '/:id/status',
  roleMiddleware(ROLES.ADMIN),
  validate(changeStatusSchema),
  leadController.changeStatus
);
router.post('/:id/notes', roleMiddleware(ROLES.ADMIN), validate(addNoteSchema), leadController.addNote);
router.delete('/:id', roleMiddleware(ROLES.ADMIN), leadController.deleteLead);

module.exports = router;