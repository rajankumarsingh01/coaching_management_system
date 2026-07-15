const ApiError = require('../../utils/ApiError');
const salaryRepository = require('./salary.repository');
const userRepository = require('../user/user.repository');
const { ROLES } = require('../../config/constants');
const { SALARY_STATUS } = require('./salary.model');
const { getTenantFilter } = require('../../utils/tenantFilter');

// baseSalary, advanceTaken aur amountPaid dekh kar status decide karta hai —
// isse har jagah alag-alag if/else likhne ki zarurat nahi padti.
const computeStatus = (salary) => {
  const totalSettled = salary.advanceTaken + salary.amountPaid;

  if (totalSettled >= salary.baseSalary) return SALARY_STATUS.PAID;
  if (totalSettled > 0) return SALARY_STATUS.PARTIAL;
  return SALARY_STATUS.PENDING;
};

// requester = { id, role, instituteId }
const createSalaryRecord = async (requester, { teacherId, month, year, baseSalary, remarks }) => {
  const teacher = await userRepository.findById(teacherId);
  if (!teacher || teacher.role !== ROLES.TEACHER) {
    throw new ApiError(400, 'Provided teacherId is not a valid teacher');
  }
  if (requester.role !== ROLES.SUPER_ADMIN && String(teacher.instituteId) !== String(requester.instituteId)) {
    throw new ApiError(403, 'Teacher does not belong to your institute');
  }

  try {
    const salary = await salaryRepository.create({
      teacherId,
      instituteId: teacher.instituteId,
      month,
      year,
      baseSalary,
      remarks: remarks || '',
      markedBy: requester.id,
    });
    return salary;
  } catch (err) {
    // duplicate teacherId+month+year (unique index) — friendly message instead of raw Mongo error
    if (err.code === 11000) {
      throw new ApiError(409, 'Salary record for this teacher and month already exists');
    }
    throw err;
  }
};

// Admin — saare salary records, optional filters ke saath (teacherId / month / year)
const getAllSalaries = async (requester, { teacherId, month, year } = {}) => {
  const filter = getTenantFilter(requester);
  if (teacherId) filter.teacherId = teacherId;
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);

  return salaryRepository.findAll(filter);
};

const getSalaryById = async (requester, salaryId) => {
  const filter = getTenantFilter(requester);
  const salary = await salaryRepository.findByIdScoped(salaryId, filter);
  if (!salary) throw new ApiError(404, 'Salary record not found');
  return salary;
};

// "kitne mahine ka salary mila, kitna advance liya" — poora history + summary totals
const getTeacherSalaryHistory = async (requester, teacherId) => {
  const filter = getTenantFilter(requester);
  const records = await salaryRepository.findByTeacher(teacherId, filter);

  const summary = records.reduce(
    (acc, r) => {
      acc.totalBaseSalary += r.baseSalary;
      acc.totalAdvanceTaken += r.advanceTaken;
      acc.totalPaid += r.amountPaid;
      acc.monthsRecorded += 1;
      if (r.status === SALARY_STATUS.PAID) acc.monthsFullyPaid += 1;
      return acc;
    },
    { totalBaseSalary: 0, totalAdvanceTaken: 0, totalPaid: 0, monthsRecorded: 0, monthsFullyPaid: 0 }
  );

  return { records, summary };
};

// Teacher khud apna salary history dekhta hai
const getMySalaryHistory = async (requester) => getTeacherSalaryHistory(requester, requester.id);

// Admin ek teacher ko is mahine ke against advance deta hai — advance kabhi bhi
// baseSalary se zyada nahi ho sakta (jitna abhi tak settle nahi hua utna hi milega)
const addAdvance = async (requester, salaryId, { amount, remarks }) => {
  if (amount <= 0) throw new ApiError(400, 'Advance amount must be greater than 0');

  const salary = await getSalaryById(requester, salaryId);

  const alreadySettled = salary.advanceTaken + salary.amountPaid;
  const remaining = salary.baseSalary - alreadySettled;
  if (amount > remaining) {
    throw new ApiError(400, `Advance exceeds remaining salary. Only ₹${remaining} is available to advance`);
  }

  salary.advanceTaken += amount;
  salary.status = computeStatus(salary);
  if (remarks) salary.remarks = remarks;
  if (salary.status === SALARY_STATUS.PAID) salary.paidDate = new Date();

  await salary.save();
  return salary;
};

// Admin month-end (ya kabhi bhi) salary settle karta hai — amount na diya ho to
// poora remaining amount ek saath pay kar diya jata hai
const paySalary = async (requester, salaryId, { amount, remarks } = {}) => {
  const salary = await getSalaryById(requester, salaryId);

  const alreadySettled = salary.advanceTaken + salary.amountPaid;
  const remaining = salary.baseSalary - alreadySettled;

  if (remaining <= 0) {
    throw new ApiError(400, 'This salary is already fully settled');
  }

  const payAmount = amount ?? remaining;
  if (payAmount <= 0) throw new ApiError(400, 'Payment amount must be greater than 0');
  if (payAmount > remaining) {
    throw new ApiError(400, `Payment exceeds remaining salary. Only ₹${remaining} is due`);
  }

  salary.amountPaid += payAmount;
  salary.status = computeStatus(salary);
  if (remarks) salary.remarks = remarks;
  if (salary.status === SALARY_STATUS.PAID) salary.paidDate = new Date();

  await salary.save();
  return salary;
};

// Admin dashboard overview — ek mahine ke saare teachers ka total salary snapshot
const getSalaryOverview = async (requester, { month, year } = {}) => {
  const filter = getTenantFilter(requester);
  if (month) filter.month = Number(month);
  if (year) filter.year = Number(year);

  const records = await salaryRepository.findAll(filter);

  const totals = records.reduce(
    (acc, r) => {
      acc.totalBaseSalary += r.baseSalary;
      acc.totalAdvanceGiven += r.advanceTaken;
      acc.totalPaid += r.amountPaid;
      return acc;
    },
    { totalBaseSalary: 0, totalAdvanceGiven: 0, totalPaid: 0 }
  );

  return {
    ...totals,
    totalPending: totals.totalBaseSalary - totals.totalAdvanceGiven - totals.totalPaid,
    teacherCount: records.length,
    records,
  };
};

module.exports = {
  createSalaryRecord,
  getAllSalaries,
  getSalaryById,
  getTeacherSalaryHistory,
  getMySalaryHistory,
  addAdvance,
  paySalary,
  getSalaryOverview,
};
