const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const instituteService = require('./institute.service');

const createInstitute = catchAsync(async (req, res) => {
  const result = await instituteService.createInstituteWithAdmin(req.body, req.user.id);
  res.status(201).json(new ApiResponse(201, result, 'Institute and admin created successfully'));
});

const getAllInstitutes = catchAsync(async (req, res) => {
  const institutes = await instituteService.getAllInstitutes(req.user.id);
  res.status(200).json(new ApiResponse(200, institutes, 'Institutes fetched successfully'));
});

// NEW
const blockInstitute = catchAsync(async (req, res) => {
  const result = await instituteService.blockInstitute(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Institute blocked successfully'));
});

// NEW
const unblockInstitute = catchAsync(async (req, res) => {
  const result = await instituteService.unblockInstitute(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Institute unblocked successfully'));
});

// NEW
const sendTrialReminder = catchAsync(async (req, res) => {
  const result = await instituteService.sendTrialReminder(req.params.id, req.user.id);
  res.status(200).json(new ApiResponse(200, result, 'Trial reminder sent successfully'));
});

module.exports = {
  createInstitute,
  getAllInstitutes,
  blockInstitute,
  unblockInstitute,
  sendTrialReminder,
};