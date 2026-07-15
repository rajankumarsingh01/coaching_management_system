const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const batchService = require('./batch.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createBatch = catchAsync(async (req, res) => {
  const batch = await batchService.createBatch(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, batch, 'Batch created successfully'));
});

const getAllBatches = catchAsync(async (req, res) => {
  const batches = await batchService.getAllBatches(getRequester(req));
  res.status(200).json(new ApiResponse(200, batches, 'Batches fetched successfully'));
});

const getBatchById = catchAsync(async (req, res) => {
  const batch = await batchService.getBatchById(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, batch, 'Batch fetched successfully'));
});

const updateBatch = catchAsync(async (req, res) => {
  const batch = await batchService.updateBatch(getRequester(req), req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, batch, 'Batch updated successfully'));
});

const deleteBatch = catchAsync(async (req, res) => {
  await batchService.deleteBatch(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Batch deactivated successfully'));
});

const assignStudent = catchAsync(async (req, res) => {
  const batch = await batchService.assignStudent(getRequester(req), req.params.id, req.body.userId);
  res.status(200).json(new ApiResponse(200, batch, 'Student assigned to batch successfully'));
});

const assignTeacher = catchAsync(async (req, res) => {
  const batch = await batchService.assignTeacher(getRequester(req), req.params.id, req.body.userId);
  res.status(200).json(new ApiResponse(200, batch, 'Teacher assigned to batch successfully'));
});

const assignTeacherToAllBatches = catchAsync(async (req, res) => {
  const result = await batchService.assignTeacherToAllBatches(getRequester(req), req.body.userId);
  res.status(200).json(new ApiResponse(200, result, 'Teacher assigned to all batches successfully'));
});

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  assignStudent,
  assignTeacher,
  assignTeacherToAllBatches,
};


