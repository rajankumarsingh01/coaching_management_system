const express = require('express');
const router = express.Router();

const feeController = require('./fee.controller');
const { createFeeSchema, markPaidSchema, verifyPaymentSchema } = require('./fee.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');
const feeReminderService = require('./feeReminder.service');

// NOTE: /webhook is intentionally NOT under authMiddleware — Razorpay's servers
// call it directly, verified instead via HMAC signature inside the controller.
router.post('/webhook', feeController.webhook);

router.use(authMiddleware);

router.post('/send-reminders', roleMiddleware(ROLES.SUPER_ADMIN, ROLES.ADMIN), async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const result = await feeReminderService.sendFeeDueReminders(requester);
  res.status(200).json({ success: true, data: result, message: 'Fee reminders triggered' });
});



router.post('/', roleMiddleware(ROLES.ADMIN), validate(createFeeSchema), feeController.createFee);

router.patch(
  '/:id/mark-paid',
  roleMiddleware(ROLES.ADMIN),
  validate(markPaidSchema),
  feeController.markFeePaid
);

router.post('/:id/create-order', roleMiddleware(ROLES.STUDENT, ROLES.ADMIN), feeController.createOrder);

router.post(
  '/verify-payment',
  roleMiddleware(ROLES.STUDENT, ROLES.ADMIN),
  validate(verifyPaymentSchema),
  feeController.verifyPayment
);

router.get('/overview', roleMiddleware(ROLES.ADMIN), feeController.getFeeOverview);

router.get('/batch/:batchId', roleMiddleware(ROLES.ADMIN, ROLES.TEACHER), feeController.getBatchFees);

router.get('/me', roleMiddleware(ROLES.STUDENT), feeController.getMyFees);

router.get('/:id/receipt', roleMiddleware(ROLES.ADMIN, ROLES.STUDENT, ROLES.PARENT), feeController.getReceipt);

router.get(
  '/student/:studentId',
  roleMiddleware(ROLES.ADMIN, ROLES.TEACHER, ROLES.PARENT),
  feeController.getStudentFees
);

module.exports = router;