const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const homeworkService = require('./homework.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createHomework = catchAsync(async (req, res) => {
  const homework = await homeworkService.createHomework(getRequester(req), req.body, req.file);
  res.status(201).json(new ApiResponse(201, homework, 'Homework created successfully'));
});

const getBatchHomework = catchAsync(async (req, res) => {
  const homework = await homeworkService.getBatchHomework(getRequester(req), req.params.batchId);
  res.status(200).json(new ApiResponse(200, homework, 'Homework fetched successfully'));
});

const deleteHomework = catchAsync(async (req, res) => {
  await homeworkService.deleteHomework(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Homework deleted successfully'));
});

module.exports = { createHomework, getBatchHomework, deleteHomework };