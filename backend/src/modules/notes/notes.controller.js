const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const notesService = require('./notes.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const uploadNotes = catchAsync(async (req, res) => {
  const notes = await notesService.uploadNotes(getRequester(req), req.body, req.file);
  res.status(201).json(new ApiResponse(201, notes, 'Notes uploaded successfully'));
});

const getBatchNotes = catchAsync(async (req, res) => {
  const notes = await notesService.getBatchNotes(getRequester(req), req.params.batchId);
  res.status(200).json(new ApiResponse(200, notes, 'Notes fetched successfully'));
});

const deleteNotes = catchAsync(async (req, res) => {
  await notesService.deleteNotes(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Notes deleted successfully'));
});

module.exports = { uploadNotes, getBatchNotes, deleteNotes };