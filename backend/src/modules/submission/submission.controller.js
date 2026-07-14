const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const submissionService = require('./submission.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const submitHomework = catchAsync(async (req, res) => {
  const submission = await submissionService.submitHomework(getRequester(req), req.params.homeworkId, req.file);
  res.status(201).json(new ApiResponse(201, submission, 'Homework submitted successfully'));
});

const getHomeworkSubmissions = catchAsync(async (req, res) => {
  const submissions = await submissionService.getHomeworkSubmissions(getRequester(req), req.params.homeworkId);
  res.status(200).json(new ApiResponse(200, submissions, 'Submissions fetched successfully'));
});

const getMySubmissions = catchAsync(async (req, res) => {
  const submissions = await submissionService.getMySubmissions(getRequester(req));
  res.status(200).json(new ApiResponse(200, submissions, 'Your submissions fetched successfully'));
});

module.exports = { submitHomework, getHomeworkSubmissions, getMySubmissions };