const ApiError = require('../../utils/ApiError');
const attendanceRepository = require('./attendance.repository');
const batchRepository = require('../batch/batch.repository');
const { ROLES } = require('../../config/constants');

const normalizeDate = (dateStr) => {
  const d = new Date(dateStr);
  d.setUTCHours(0, 0, 0, 0);
  return d;
};

// batch.teacherIds/studentIds may come back either as raw ObjectIds or as
// populated objects ({_id, name, email}) depending on which repository method
// was used — this normalizes either shape down to a plain string id.
const toIdString = (entry) => String(entry?._id ?? entry);

// requester = { id, role, instituteId }
const markAttendance = async (requester, { batchId, date, records }) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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

  return attendanceRepository.findByBatchAndDate(batchId, normalizedDate, filter);
};

const getBatchAttendanceForDate = async (requester, batchId, date) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const normalizedDate = normalizeDate(date);
  return attendanceRepository.findByBatchAndDate(batchId, normalizedDate, filter);
};

const getStudentAttendanceSummary = async (requester, studentId) => {
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







// const ApiError = require('../../utils/ApiError');
// const attendanceRepository = require('./attendance.repository');
// const batchRepository = require('../batch/batch.repository');
// const { ROLES } = require('../../config/constants');

// /*
// |--------------------------------------------------------------------------
// | normalizeDate()
// |--------------------------------------------------------------------------
// | Purpose:
// | MongoDB Date object me Time bhi store hota hai.
// |
// | Example:
// | Frontend -> "2026-07-12"
// |
// | JavaScript internally bana deta hai:
// | 2026-07-12T10:30:45.000Z
// |
// | Agar baad me isi date ko dusre time ke saath search kiya:
// | 2026-07-12T05:15:10.000Z
// |
// | Dono same date hone ke baad bhi equal nahi honge.
// |
// | Isliye time ko hamesha 00:00:00 UTC bana dete hain.
// | Taaki database me comparison sirf date ke basis par ho.
// |--------------------------------------------------------------------------
// */
// const normalizeDate = (dateStr) => {
//   const d = new Date(dateStr);

//   // Reset time to 00:00:00 UTC
//   d.setUTCHours(0, 0, 0, 0);

//   return d;
// };

// /*
// |--------------------------------------------------------------------------
// | markAttendance()
// |--------------------------------------------------------------------------
// | Purpose:
// | Batch ki attendance mark/update karna.
// |
// | Business Rules:
// |
// | ✔ Batch exist hona chahiye.
// | ✔ Batch requester ke institute ka hona chahiye.
// | ✔ Teacher sirf apne assigned batch ki attendance bhar sakta hai.
// | ✔ Attendance sirf batch ke students ki mark ho sakti hai.
// | ✔ Duplicate attendance create nahi hogi (Repository bulkUpsert karega).
// |--------------------------------------------------------------------------
// */
// const markAttendance = async (requester, { batchId, date, records }) => {

//   /*
//   ------------------------------------------------------------------------
//   | Institute Security Filter
//   |
//   | Super Admin:
//   |      {}
//   |      -> Sare institutes dekh sakta hai.
//   |
//   | Normal User:
//   |      { instituteId: requester.instituteId }
//   |      -> Sirf apne institute ka data.
//   ------------------------------------------------------------------------
//   */
//   const filter =
//     requester.role === ROLES.SUPER_ADMIN
//       ? {}
//       : { instituteId: requester.instituteId };

//   /*
//   ------------------------------------------------------------------------
//   | Batch verify karo.
//   |
//   | findByIdScoped internally:
//   |
//   | Batch.findOne({
//   |     _id: batchId,
//   |     ...filter
//   | })
//   |
//   | Agar batch kisi dusre institute ka hua,
//   | to null return hoga.
//   ------------------------------------------------------------------------
//   */
//   const batch = await batchRepository.findByIdScoped(batchId, filter);

//   if (!batch) {
//     throw new ApiError(404, 'Batch not found');
//   }

//   /*
//   ------------------------------------------------------------------------
//   | Teacher Authorization
//   |
//   | Teacher sirf wahi batch manage kar sakta hai
//   | jisme uska id teacherIds array me present ho.
//   |
//   | Admin aur Super Admin ke liye ye check skip hota hai.
//   ------------------------------------------------------------------------
//   */
//   if (requester.role === ROLES.TEACHER) {

//     // some() true return karega agar teacher batch me assigned hai.
//     const isAssigned = batch.teacherIds.some(
//       (id) => String(id) === String(requester.id)
//     );

//     if (!isAssigned) {
//       throw new ApiError(403, 'You are not assigned to this batch');
//     }
//   }

//   /*
//   ------------------------------------------------------------------------
//   | Date Normalize
//   |
//   | Example:
//   |
//   | 2026-07-12T15:22:10
//   |
//   | becomes
//   |
//   | 2026-07-12T00:00:00
//   ------------------------------------------------------------------------
//   */
//   const normalizedDate = normalizeDate(date);

//   /*
//   ------------------------------------------------------------------------
//   | Batch ke sare valid student ids ka Set banao.
//   |
//   | Set use karne ka reason:
//   |
//   | has()
//   |
//   | bahut fast lookup deta hai.
//   |
//   | Example:
//   |
//   | Set {
//   |   "101",
//   |   "102",
//   |   "103"
//   | }
//   ------------------------------------------------------------------------
//   */
//   const validStudentIds = new Set(
//     batch.studentIds.map((id) => String(id))
//   );

//   /*
//   ------------------------------------------------------------------------
//   | Check karo ki frontend ne koi aisa student to nahi bheja
//   | jo batch ka part hi nahi hai.
//   |
//   | Agar ek bhi invalid student mila,
//   | request reject.
//   ------------------------------------------------------------------------
//   */
//   const invalidRecord = records.find(
//     (r) => !validStudentIds.has(r.studentId)
//   );

//   if (invalidRecord) {
//     throw new ApiError(
//       400,
//       `Student ${invalidRecord.studentId} does not belong to this batch`
//     );
//   }

//   /*
//   ------------------------------------------------------------------------
//   | Repository ko complete payload chahiye.
//   |
//   | Frontend bhejta hai:
//   |
//   | {
//   |   studentId,
//   |   status
//   | }
//   |
//   | Database ko chahiye:
//   |
//   | studentId
//   | batchId
//   | instituteId
//   | date
//   | status
//   | markedBy
//   |
//   | map() har object ko complete attendance object bana deta hai.
//   ------------------------------------------------------------------------
//   */
//   const payload = records.map((r) => ({
//     studentId: r.studentId,
//     batchId,
//     instituteId: batch.instituteId,
//     date: normalizedDate,
//     status: r.status,

//     // kis user ne attendance mark ki
//     markedBy: requester.id,
//   }));

//   /*
//   ------------------------------------------------------------------------
//   | bulkUpsert()
//   |
//   | Existing attendance ->
//   |      Update
//   |
//   | Nahi mili ->
//   |      Insert
//   |
//   | Isliye duplicate attendance kabhi create nahi hoti.
//   ------------------------------------------------------------------------
//   */
//   await attendanceRepository.bulkUpsert(payload);

//   /*
//   ------------------------------------------------------------------------
//   | Save hone ke baad updated attendance frontend ko bhej do.
//   ------------------------------------------------------------------------
//   */
//   return attendanceRepository.findByBatchAndDate(
//     batchId,
//     normalizedDate,
//     filter
//   );
// };

// /*
// |--------------------------------------------------------------------------
// | getBatchAttendanceForDate()
// |--------------------------------------------------------------------------
// | Particular batch ki kisi ek date ki attendance return karta hai.
// |--------------------------------------------------------------------------
// */
// const getBatchAttendanceForDate = async (
//   requester,
//   batchId,
//   date
// ) => {

//   const filter =
//     requester.role === ROLES.SUPER_ADMIN
//       ? {}
//       : { instituteId: requester.instituteId };

//   const normalizedDate = normalizeDate(date);

//   return attendanceRepository.findByBatchAndDate(
//     batchId,
//     normalizedDate,
//     filter
//   );
// };

// /*
// |--------------------------------------------------------------------------
// | getStudentAttendanceSummary()
// |--------------------------------------------------------------------------
// | Kisi student ki attendance summary nikalta hai.
// |
// | Output:
// |
// | {
// |   total,
// |   present,
// |   percentage,
// |   records
// | }
// |--------------------------------------------------------------------------
// */
// const getStudentAttendanceSummary = async (
//   requester,
//   studentId
// ) => {

//   /*
//   | Institute Level Security
//   */
//   const filter =
//     requester.role === ROLES.SUPER_ADMIN
//       ? {}
//       : { instituteId: requester.instituteId };

//   /*
//   | Count:
//   |
//   | total attendance
//   | present attendance
//   */
//   const { total, present } =
//     await attendanceRepository.countByStudent(
//       studentId,
//       filter
//     );

//   /*
//   | Attendance Percentage
//   |
//   | total = 20
//   | present = 18
//   |
//   | => 90%
//   */
//   const percentage =
//     total === 0
//       ? 0
//       : Math.round((present / total) * 100);

//   /*
//   | Complete attendance history
//   */
//   const records =
//     await attendanceRepository.findByStudent(
//       studentId,
//       filter
//     );

//   return {
//     total,
//     present,
//     percentage,
//     records,
//   };
// };

// /*
// |--------------------------------------------------------------------------
// | getBatchAttendanceReport()
// |--------------------------------------------------------------------------
// | Date Range Report
// |
// | Example:
// |
// | 1 July
// | to
// | 31 July
// |
// | Complete attendance report return karega.
// |--------------------------------------------------------------------------
// */
// const getBatchAttendanceReport = async (
//   requester,
//   batchId,
//   startDate,
//   endDate
// ) => {

//   const filter =
//     requester.role === ROLES.SUPER_ADMIN
//       ? {}
//       : { instituteId: requester.instituteId };

//   const start = normalizeDate(startDate);
//   const end = normalizeDate(endDate);

//   return attendanceRepository.findByBatchDateRange(
//     batchId,
//     start,
//     end,
//     filter
//   );
// };

// module.exports = {
//   markAttendance,
//   getBatchAttendanceForDate,
//   getStudentAttendanceSummary,
//   getBatchAttendanceReport,
// };