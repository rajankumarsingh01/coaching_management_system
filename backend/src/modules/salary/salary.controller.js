const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const salaryService = require('./salary.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createSalaryRecord = catchAsync(async (req, res) => {
  const salary = await salaryService.createSalaryRecord(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, salary, 'Salary record created successfully'));
});

const getAllSalaries = catchAsync(async (req, res) => {
  const salaries = await salaryService.getAllSalaries(getRequester(req), req.query);
  res.status(200).json(new ApiResponse(200, salaries, 'Salary records fetched successfully'));
});

const getSalaryOverview = catchAsync(async (req, res) => {
  const overview = await salaryService.getSalaryOverview(getRequester(req), req.query);
  res.status(200).json(new ApiResponse(200, overview, 'Salary overview fetched successfully'));
});

const getMySalaryHistory = catchAsync(async (req, res) => {
  const history = await salaryService.getMySalaryHistory(getRequester(req));
  res.status(200).json(new ApiResponse(200, history, 'Your salary history fetched successfully'));
});

const getTeacherSalaryHistory = catchAsync(async (req, res) => {
  const history = await salaryService.getTeacherSalaryHistory(getRequester(req), req.params.teacherId);
  res.status(200).json(new ApiResponse(200, history, 'Teacher salary history fetched successfully'));
});

const addAdvance = catchAsync(async (req, res) => {
  const salary = await salaryService.addAdvance(getRequester(req), req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, salary, 'Advance recorded successfully'));
});

const paySalary = catchAsync(async (req, res) => {
  const salary = await salaryService.paySalary(getRequester(req), req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, salary, 'Salary payment recorded successfully'));
});

module.exports = {
  createSalaryRecord,
  getAllSalaries,
  getSalaryOverview,
  getMySalaryHistory,
  getTeacherSalaryHistory,
  addAdvance,
  paySalary,
};
