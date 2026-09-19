const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const parentReportService = require('./parentReport.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const getStudentParentReport = catchAsync(async (req, res) => {
  const data = await parentReportService.getStudentParentReport(getRequester(req), req.params.studentId);
  res.status(200).json(new ApiResponse(200, data, 'Parent report generated successfully'));
});

module.exports = { getStudentParentReport };