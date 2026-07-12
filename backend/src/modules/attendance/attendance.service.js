const ApiError = require('../../utils/ApiError');
const attendanceRepository = require('./attendance.repository');
const batchRepository = require('../batch/batch.repository');
const { ROLES } = require('../../config/constants');

const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// requester = { id, role, instituteId }
const markAttendance = async (requester, { batchId, date, records }) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const batch = await batchRepository.findByIdScoped(batchId, filter);
  if (!batch) {
    throw new ApiError(404, 'Batch not found');
  }

  // teacher must actually be assigned to this batch (unless admin/super_admin)
  if (requester.role === ROLES.TEACHER) {
    const isAssigned = batch.teacherIds.some((id) => String(id) === String(requester.id));
    if (!isAssigned) {
      throw new ApiError(403, 'You are not assigned to this batch');
    }
  }

  const normalizedDate = normalizeDate(date);

  const validStudentIds = new Set(batch.studentIds.map((id) => String(id)));
  const invalidRecord = records.find((r) => !validStudentIds.has(r.studentId));
  if (invalidRecord) {
    throw new ApiError(400, `Student ${invalidRecord.studentId} does not belong to this batch`);
  }

  const payload = records.map((r) => ({
    studentId: r.studentId,
    batchId,
    instituteId: batch.instituteId,
    date: normalizedDate,
    status: r.status,
    markedBy: requester.id,
  }));

  await attendanceRepository.bulkUpsert(payload);

  return attendanceRepository.findByBatchAndDate(batchId, normalizedDate, filter);
};

const getBatchAttendanceForDate = async (requester, batchId, date) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const normalizedDate = normalizeDate(date);
  return attendanceRepository.findByBatchAndDate(batchId, normalizedDate, filter);
};

// Student/Parent view — attendance % for a given student
const getStudentAttendanceSummary = async (requester, studentId) => {
  // students/parents can only view their own (or their child's) attendance;
  // admin/teacher/super_admin can view any student within their institute scope
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };

  const { total, present } = await attendanceRepository.countByStudent(studentId, filter);
  const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

  const records = await attendanceRepository.findByStudent(studentId, filter);

  return { total, present, percentage, records };
};

const getBatchAttendanceReport = async (requester, batchId, startDate, endDate) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const start = normalizeDate(startDate);
  const end = normalizeDate(endDate);
  return attendanceRepository.findByBatchDateRange(batchId, start, end, filter);
};

module.exports = {
  markAttendance,
  getBatchAttendanceForDate,
  getStudentAttendanceSummary,
  getBatchAttendanceReport,
};