const express = require('express');
const router = express.Router();

const salaryController = require('./salary.controller');
const { createSalarySchema, advanceSchema, paySchema } = require('./salary.validation');
const validate = require('../../middlewares/validate.middleware');
const authMiddleware = require('../../middlewares/auth.middleware');
const roleMiddleware = require('../../middlewares/role.middleware');
const { ROLES } = require('../../config/constants');

router.use(authMiddleware);

// admin — teacher ke liye ek mahine ka salary record banata hai
router.post('/', roleMiddleware(ROLES.ADMIN), validate(createSalarySchema), salaryController.createSalaryRecord);

// admin — saare salary records (filters: ?teacherId=&month=&year=)
router.get('/', roleMiddleware(ROLES.ADMIN), salaryController.getAllSalaries);

// admin — ek mahine ke saare teachers ka total salary/advance/paid snapshot
router.get('/overview', roleMiddleware(ROLES.ADMIN), salaryController.getSalaryOverview);

// teacher — apna khud ka salary history (kitne mahine ka mila, kitna advance liya)
router.get('/me', roleMiddleware(ROLES.TEACHER), salaryController.getMySalaryHistory);

// admin — kisi bhi specific teacher ka salary history
router.get('/teacher/:teacherId', roleMiddleware(ROLES.ADMIN), salaryController.getTeacherSalaryHistory);

// admin — is mahine ke against teacher ko advance dena
router.patch('/:id/advance', roleMiddleware(ROLES.ADMIN), validate(advanceSchema), salaryController.addAdvance);

// admin — salary settle karna (full ya partial payment)
router.patch('/:id/pay', roleMiddleware(ROLES.ADMIN), validate(paySchema), salaryController.paySalary);

module.exports = router;
