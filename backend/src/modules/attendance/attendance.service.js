const ApiError = require('../../utils/ApiError');
const attendanceRepository = require('./attendance.repository');
const batchRepository = require('../batch/batch.repository');
const userRepository = require('../user/user.repository');
const { ROLES } = require('../../config/constants');
const { assertCanAccessStudent } = require('../../utils/ownershipGuard');
const { getTenantFilter } = require('../../utils/tenantFilter');
const { emitToUser, emitToBatch } = require('../../socket/socket');


const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// batch.teacherIds/studentIds may come back either as raw ObjectIds or as
// populated objects ({_id, name, email}) depending on which repository method
// was used — this normalizes either shape down to a plain string id.
const toIdString = (entry) => String(entry?._id ?? entry);

// Realtime: har student ko (aur uske parent ko, agar linked hai) turant unka
// khud ka status mil jaye — poore batch ka data dobara fetch karne ki zarurat nahi.
// Batch room ko sirf ek generic "refresh" signal jaata hai, kisi ka individual
// status us broadcast me nahi hota (privacy).
const emitAttendanceUpdates = async (batchId, date, records) => {
  const studentIds = records.map((r) => r.studentId);

  const students = await userRepository
    .findAll({ _id: { $in: studentIds } })
    .select('parentId');

  const parentIdByStudent = new Map(
    students.map((s) => [String(s._id), s.parentId ? String(s.parentId) : null])
  );

  records.forEach((r) => {
    const payload = { batchId, studentId: r.studentId, date, status: r.status };

    emitToUser(r.studentId, 'attendance:marked', payload);

    const parentId = parentIdByStudent.get(String(r.studentId));
    if (parentId) {
      emitToUser(parentId, 'attendance:marked', payload);
    }
  });

  emitToBatch(batchId, 'attendance:batch-updated', { batchId, date });
};

// requester = { id, role, instituteId }
const markAttendance = async (requester, { batchId, date, records }) => {
  const filter = getTenantFilter(requester);

  const batch = await batchRepository.findByIdScoped(batchId, filter);
  if (!batch) {
    throw new ApiError(404, 'Batch not found');
  }

  // teacher must actually be assigned to this batch (unless admin/super_admin)
  if (requester.role === ROLES.TEACHER) {
    const isAssigned = batch.teacherIds.some((entry) => toIdString(entry) === String(requester.id));
    if (!isAssigned) {
      throw new ApiError(403, 'You are not assigned to this batch');
    }
  }

  const normalizedDate = normalizeDate(date);

  const validStudentIds = new Set(batch.studentIds.map((entry) => toIdString(entry)));
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

  await emitAttendanceUpdates(batchId, normalizedDate, records);

  return attendanceRepository.findByBatchAndDate(batchId, normalizedDate, filter);
};

const getBatchAttendanceForDate = async (requester, batchId, date) => {
  const filter = getTenantFilter(requester);

  const normalizedDate = normalizeDate(date);
  return attendanceRepository.findByBatchAndDate(batchId, normalizedDate, filter);
};

const getStudentAttendanceSummary = async (requester, studentId) => {


    await assertCanAccessStudent(requester, studentId);   // 👈 NAYI LINE

    
 const filter = getTenantFilter(requester);
  const { total, present } = await attendanceRepository.countByStudent(studentId, filter);
  const percentage = total === 0 ? 0 : Math.round((present / total) * 100);

  const records = await attendanceRepository.findByStudent(studentId, filter);

  return { total, present, percentage, records };
};

const getBatchAttendanceReport = async (requester, batchId, startDate, endDate) => {
 const filter = getTenantFilter(requester);
 
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