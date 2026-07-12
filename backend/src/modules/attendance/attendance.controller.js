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