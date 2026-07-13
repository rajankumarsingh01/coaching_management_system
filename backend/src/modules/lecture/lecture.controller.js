const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const lectureService = require('./lecture.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createLecture = catchAsync(async (req, res) => {
  const lecture = await lectureService.createLecture(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, lecture, 'Lecture added successfully'));
});

const getBatchLectures = catchAsync(async (req, res) => {
  const lectures = await lectureService.getBatchLectures(getRequester(req), req.params.batchId);
  res.status(200).json(new ApiResponse(200, lectures, 'Lectures fetched successfully'));
});

const deleteLecture = catchAsync(async (req, res) => {
  await lectureService.deleteLecture(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Lecture deleted successfully'));
});

module.exports = { createLecture, getBatchLectures, deleteLecture };