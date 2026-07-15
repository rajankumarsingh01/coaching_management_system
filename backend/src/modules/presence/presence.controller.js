const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const presenceService = require('./presence.service');

const getOnlineSummary = catchAsync(async (req, res) => {
  const summary = await presenceService.getOnlineSummary(req.user.instituteId);
  res.status(200).json(new ApiResponse(200, summary, 'Online users summary fetched successfully'));
});

module.exports = { getOnlineSummary };