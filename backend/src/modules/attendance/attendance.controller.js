const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const attendanceService = require('./attendance.service');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../config/constants');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const markAttendance = catchAsync(async (req, res) => {
  const records = await attendanceService.markAttendance(getRequester(req), req.body);
  res.status(200).json(new ApiResponse(200, records, 'Attendance marked successfully'));
});

const getBatchAttendanceForDate = catchAsync(async (req, res) => {
  const { batchId } = req.params;
  const { date } = req.query;
  if (!date) throw new ApiError(400, 'date query param is required');

  const records = await attendanceService.getBatchAttendanceForDate(getRequester(req), batchId, date);
  res.status(200).json(new ApiResponse(200, records, 'Attendance fetched successfully'));
});

const getMyAttendance = catchAsync(async (req, res) => {
  // student viewing their own attendance
  const summary = await attendanceService.getStudentAttendanceSummary(getRequester(req), req.user.id);
  res.status(200).json(new ApiResponse(200, summary, 'Attendance summary fetched successfully'));
});

const getStudentAttendance = catchAsync(async (req, res) => {
  // admin/teacher/parent viewing a specific student's attendance
  const { studentId } = req.params;
  const summary = await attendanceService.getStudentAttendanceSummary(getRequester(req), studentId);
  res.status(200).json(new ApiResponse(200, summary, 'Attendance summary fetched successfully'));
});

const getBatchReport = catchAsync(async (req, res) => {
  const { batchId } = req.params;
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) throw new ApiError(400, 'startDate and endDate query params are required');

  const report = await attendanceService.getBatchAttendanceReport(getRequester(req), batchId, startDate, endDate);
  res.status(200).json(new ApiResponse(200, report, 'Attendance report fetched successfully'));
});

module.exports = {
  markAttendance,
  getBatchAttendanceForDate,
  getMyAttendance,
  getStudentAttendance,
  getBatchReport,
};







/*
===============================================================================
📌 ATTENDANCE CONTROLLER
===============================================================================

🎯 Responsibility (Controller ka kaam)

Controller kabhi business logic ya database ka kaam nahi karta.

Controller ke sirf 3 kaam hote hain:

1️⃣ Request se data lena
   - req.body
   - req.params
   - req.query
   - req.user

2️⃣ Service ko call karna
   - saari validation
   - business logic
   - database operation
   Service layer handle karti hai.

3️⃣ Standard response bhejna
   - ApiResponse
   - status code
   - message

Flow

Client
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
MongoDB
   │
   ▼
Repository
   │
   ▼
Service
   │
   ▼
Controller
   │
   ▼
Frontend


===============================================================================
📌 getRequester(req)
===============================================================================

Ye helper function sirf req.user se useful information nikalta hai.

const getRequester = (req) => ({
    id: req.user.id,
    role: req.user.role,
    instituteId: req.user.instituteId
});

Ab har function me baar-baar

{
   id:req.user.id,
   role:req.user.role,
   instituteId:req.user.instituteId
}

likhne ki zarurat nahi padti.

Sirf

getRequester(req)

pass kar dete hain.

NOTE:
Variable/function ka NAME matter nahi karta.

Ye bhi likh sakte ho

const xyz = (req) => ({
   id:req.user.id,
   role:req.user.role,
   instituteId:req.user.instituteId
});

Aur service me

batchService.createBatch(xyz(req), req.body)

Bilkul same kaam karega.

JavaScript me position aur value pass hona matter karta hai,
naam (requester/getRequester/userInfo/xyz) nahi.


===============================================================================
📌 req.body vs req.params vs req.query
===============================================================================

req.body

POST /attendance

{
   batchId,
   date,
   records
}

--------------------------------------

req.params

GET /attendance/batch/123

req.params.id

123

--------------------------------------

req.query

GET /attendance/batch/123?date=2026-07-11

req.query.date

2026-07-11


===============================================================================
📌 markAttendance() ka Flow
===============================================================================

1. Client attendance bhejta hai

↓

2. Controller
   - req.body leta hai
   - requester banata hai

↓

3. attendanceService.markAttendance()

↓

4. Service validation karti hai

↓

5. Repository MongoDB me save/update karti hai

↓

6. Latest attendance return hoti hai

↓

7. Controller ApiResponse bhej deta hai


===============================================================================
📌 Agar Service aur Repository NAHI hoti to?
===============================================================================

Tab controller hi sab kuch karta.

Example:

const markAttendance = async (req, res, next) => {
  try {

    // requester banana
    const requester = {
      id: req.user.id,
      role: req.user.role,
      instituteId: req.user.instituteId,
    };

    // request body
    const { batchId, date, records } = req.body;

    // validation
    if (!batchId || !date || !records) {
      throw new ApiError(400, 'Required fields missing');
    }

    // Batch find karna
    const batch = await Batch.findById(batchId);

    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }

    // Teacher assigned hai ya nahi
    if (
      requester.role === ROLES.TEACHER &&
      !batch.teacherIds.some(
        (id) => String(id) === String(requester.id)
      )
    ) {
      throw new ApiError(403, 'Teacher not assigned');
    }

    // Attendance payload banana

    const payload = records.map((r) => ({
      studentId: r.studentId,
      batchId,
      instituteId: batch.instituteId,
      date,
      status: r.status,
      markedBy: requester.id,
    }));

    // Database update

    await Attendance.bulkWrite(...);

    // Latest data fetch

    const attendance = await Attendance.find({
      batchId,
      date,
    }).populate('studentId');

    // Response

    res.status(200).json(
      new ApiResponse(
        200,
        attendance,
        'Attendance marked successfully'
      )
    );

  } catch (err) {
    next(err);
  }
};


===============================================================================
📌 Problem agar Service + Repository na ho
===============================================================================

❌ Controller bahut bada ho jayega.

❌ Business Logic aur Database code mix ho jayega.

❌ Same code baar-baar likhna padega.

❌ Testing mushkil ho jayegi.

❌ Code maintain karna difficult ho jayega.

Isi liye Production projects me architecture hota hai:

Controller
   ↓
Service
   ↓
Repository
   ↓
Database

Ye code ko clean, reusable aur scalable banata hai.
===============================================================================
*/