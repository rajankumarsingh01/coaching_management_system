const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const resultService = require('./result.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const submitTest = catchAsync(async (req, res) => {
  const result = await resultService.submitTest(getRequester(req), req.params.testId, req.body.answers);
  res.status(201).json(new ApiResponse(201, result, 'Test submitted successfully'));
});

const getTestResults = catchAsync(async (req, res) => {
  const results = await resultService.getTestResults(getRequester(req), req.params.testId);
  res.status(200).json(new ApiResponse(200, results, 'Results fetched successfully'));
});

const getMyResults = catchAsync(async (req, res) => {
  const results = await resultService.getMyResults(getRequester(req));
  res.status(200).json(new ApiResponse(200, results, 'Your results fetched successfully'));
});

const getLeaderboard = catchAsync(async (req, res) => {
  const leaderboard = await resultService.getLeaderboard(getRequester(req), req.params.batchId);
  res.status(200).json(new ApiResponse(200, leaderboard, 'Leaderboard fetched successfully'));
});

const getMyWeakTopics = catchAsync(async (req, res) => {
  const data = await resultService.getWeakTopics(getRequester(req), req.user.id);
  res.status(200).json(new ApiResponse(200, data, 'Weak topics fetched successfully'));
});

module.exports = { submitTest, getTestResults, getMyResults, getLeaderboard, getMyWeakTopics };