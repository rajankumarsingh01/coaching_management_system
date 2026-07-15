const analyticsRepository = require('./analytics.repository');
const { getTenantFilter } = require('../../utils/tenantFilter');
const { ROLES } = require('../../config/constants');

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const endOfToday = () => {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};
const daysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};
const startOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
};
const endOfMonth = () => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
};

const getDashboardOverview = async (requester) => {
  const filter = getTenantFilter(requester);

  const [totalStudents, totalTeachers, totalBatches, attendanceToday, attendanceLast30Days, feeThisMonth, testsThisWeek] =
    await Promise.all([
      analyticsRepository.countActiveUsersByRole(filter, ROLES.STUDENT),
      analyticsRepository.countActiveUsersByRole(filter, ROLES.TEACHER),
      analyticsRepository.countActiveBatches(filter),
      analyticsRepository.getAttendanceBreakdown(filter, {}, startOfToday(), endOfToday()),
      analyticsRepository.getAttendanceBreakdown(filter, {}, daysAgo(30), endOfToday()),
      analyticsRepository.getFeeBreakdown(filter, {}, startOfMonth(), endOfMonth()),
      analyticsRepository.countTestsPublishedSince(filter, daysAgo(7)),
    ]);

  return {
    totalStudents,
    totalTeachers,
    totalBatches,
    attendance: {
      today: attendanceToday,
      last30Days: attendanceLast30Days,
    },
    fees: {
      thisMonth: feeThisMonth,
    },
    testsPublishedThisWeek: testsThisWeek,
  };
};

const getBatchWiseBreakdown = async (requester) => {
  const filter = getTenantFilter(requester);
  const batches = await analyticsRepository.getActiveBatchesWithStudentCounts(filter);

  const results = await Promise.all(
    batches.map(async (batch) => {
      const batchFilter = { batchId: batch._id };
      const [attendance, fees] = await Promise.all([
        analyticsRepository.getAttendanceBreakdown(filter, batchFilter, daysAgo(30), endOfToday()),
        analyticsRepository.getFeeBreakdown(filter, batchFilter, startOfMonth(), endOfMonth()),
      ]);

      return {
        batchId: batch._id,
        batchName: batch.name,
        studentCount: batch.studentIds.length,
        attendanceLast30DaysPercent: attendance.presentPercent,
        feeCollectionPercentThisMonth: fees.collectionPercent,
      };
    })
  );

  return results;
};

module.exports = { getDashboardOverview, getBatchWiseBreakdown };