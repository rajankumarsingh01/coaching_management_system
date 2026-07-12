const Attendance = require('./attendance.model');

const bulkUpsert = async (records) => {
  // records: [{ studentId, batchId, instituteId, date, status, markedBy }]
  const ops = records.map((r) => ({
    updateOne: {
      filter: { studentId: r.studentId, batchId: r.batchId, date: r.date },
      update: { $set: r },
      upsert: true,
    },
  }));
  return Attendance.bulkWrite(ops);
};

const findByBatchAndDate = (batchId, date, filter = {}) =>
  Attendance.find({ batchId, date, ...filter }).populate('studentId', 'name email');

const findByStudent = (studentId, filter = {}) =>
  Attendance.find({ studentId, ...filter }).sort({ date: -1 });

const countByStudent = async (studentId, filter = {}) => {
  const total = await Attendance.countDocuments({ studentId, ...filter });
  const present = await Attendance.countDocuments({
    studentId,
    status: { $in: ['present', 'late'] },
    ...filter,
  });
  return { total, present };
};

const findByBatchDateRange = (batchId, startDate, endDate, filter = {}) =>
  Attendance.find({
    batchId,
    date: { $gte: startDate, $lte: endDate },
    ...filter,
  }).populate('studentId', 'name email');

module.exports = {
  bulkUpsert,
  findByBatchAndDate,
  findByStudent,
  countByStudent,
  findByBatchDateRange,
};






/*
|--------------------------------------------------------------------------
| Attendance Repository
|--------------------------------------------------------------------------
|
| Repository Layer ki responsibility sirf Database se baat karna hai.
|
| ✔ Insert Attendance
| ✔ Update Attendance
| ✔ Find Attendance
| ✔ Count Attendance
| ✔ Date Range Search
|
| Repository me kabhi:
| ✘ Business Logic nahi likhte.
| ✘ Permission Check nahi karte.
| ✘ Role Check nahi karte.
|
| Ye sab Service Layer ka kaam hota hai.
|
| Attendance Repository me mainly MongoDB Operators use hue hain:
|
| bulkWrite()  -> Multiple records ek query me save/update karna.
| upsert       -> Record ho to Update, nahi ho to Insert.
| $set         -> Field ki value update karna.
| $in          -> Multiple values me match karna.
| $gte         -> Greater Than or Equal (>=).
| $lte         -> Less Than or Equal (<=).
| countDocuments() -> Matching documents ki total count nikalna.
|
| Is repository ka purpose:
| Database operations ko ek jagah rakhna taaki Service Layer clean rahe.
|
*/