const attendanceService = require('../attendance/attendance.service');
const feeService = require('../fee/fee.service');
const resultService = require('../result/result.service');
const userRepository = require('../user/user.repository');
const agenticService = require('../../config/agenticService.config');
const { FEE_STATUS } = require('../fee/fee.model');

const getStudentParentReport = async (requester, studentId) => {
  // Teeno existing service calls — har ek apni khud ki access-check
  // (assertCanAccessStudent / assertParentOwnsStudent) internally karta hai
  const [attendanceSummary, fees, weakTopicsData, student] = await Promise.all([
    attendanceService.getStudentAttendanceSummary(requester, studentId),
    feeService.getStudentFees(requester, studentId),
    resultService.getStudentWeakTopics(requester, studentId),
    userRepository.findById(studentId),
  ]);

  const paidAmount = fees
    .filter((f) => f.status === FEE_STATUS.PAID)
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingFees = fees.filter((f) => f.status === FEE_STATUS.PENDING || f.status === FEE_STATUS.DUE);
  const pendingAmount = pendingFees.reduce((sum, f) => sum + f.amount, 0);

  const nextDueDate = pendingFees.length
    ? pendingFees.reduce((earliest, f) => (f.dueDate < earliest ? f.dueDate : earliest), pendingFees[0].dueDate)
    : null;

  const { report } = await agenticService.generateParentReport({
    studentName: student.name,
    attendance: {
      total: attendanceSummary.total,
      present: attendanceSummary.present,
      percentage: attendanceSummary.percentage,
    },
    fees: {
      paid_amount: paidAmount,
      pending_amount: pendingAmount,
      next_due_date: nextDueDate ? new Date(nextDueDate).toISOString().split('T')[0] : null,
    },
    weakTopics: weakTopicsData.weakTopics,
    allTopics: weakTopicsData.allTopics,
  });

  return {
    report,
    attendance: attendanceSummary,
    fees: { paidAmount, pendingAmount, nextDueDate },
    weakTopics: weakTopicsData.weakTopics,
  };
};

module.exports = { getStudentParentReport };