const User = require('../user/user.model');
const Batch = require('../batch/batch.model');
const Attendance = require('../attendance/attendance.model');
const Fee = require('../fee/fee.model');
const Test = require('../test/test.model');
const { ROLES } = require('../../config/constants');

// Analytics is inherently a cross-cutting reporting module — it reads from
// 5 different collections. Unlike other modules, its repository legitimately
// imports multiple models directly (there's no single "Analytics" collection
// to own) rather than going through each module's own repository.

const countActiveUsersByRole = (instituteFilter, role) =>
  User.countDocuments({ ...instituteFilter, role, isActive: true });

const countActiveBatches = (instituteFilter) =>
  Batch.countDocuments({ ...instituteFilter, isActive: true });

const getAttendanceBreakdown = async (instituteFilter, batchFilter, fromDate, toDate) => {
  const rows = await Attendance.aggregate([
    { $match: { ...instituteFilter, ...batchFilter, date: { $gte: fromDate, $lte: toDate } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const breakdown = { present: 0, absent: 0, late: 0 };
  rows.forEach((r) => { breakdown[r._id] = r.count; });

  const total = breakdown.present + breakdown.absent + breakdown.late;
  const percent = total === 0 ? null : Math.round((breakdown.present / total) * 1000) / 10;

  return { ...breakdown, total, presentPercent: percent };
};

const getFeeBreakdown = async (instituteFilter, batchFilter, fromDate, toDate) => {
  const rows = await Fee.aggregate([
    { $match: { ...instituteFilter, ...batchFilter, dueDate: { $gte: fromDate, $lte: toDate } } },
    { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  const breakdown = {
    paid: { amount: 0, count: 0 },
    pending: { amount: 0, count: 0 },
    due: { amount: 0, count: 0 },
  };
  rows.forEach((r) => { breakdown[r._id] = { amount: r.totalAmount, count: r.count }; });

  const totalAmount = breakdown.paid.amount + breakdown.pending.amount + breakdown.due.amount;
  const collectionPercent =
    totalAmount === 0 ? null : Math.round((breakdown.paid.amount / totalAmount) * 1000) / 10;

  return { ...breakdown, totalAmount, collectionPercent };
};

const countTestsPublishedSince = (instituteFilter, sinceDate) =>
  Test.countDocuments({ ...instituteFilter, isPublished: true, createdAt: { $gte: sinceDate } });

const getActiveBatchesWithStudentCounts = (instituteFilter) =>
  Batch.find({ ...instituteFilter, isActive: true }).select('name studentIds').lean();

module.exports = {
  countActiveUsersByRole,
  countActiveBatches,
  getAttendanceBreakdown,
  getFeeBreakdown,
  countTestsPublishedSince,
  getActiveBatchesWithStudentCounts,
};