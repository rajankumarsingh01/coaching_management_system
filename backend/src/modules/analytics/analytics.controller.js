const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const analyticsService = require('./analytics.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const getDashboardOverview = catchAsync(async (req, res) => {
  const data = await analyticsService.getDashboardOverview(getRequester(req));
  res.status(200).json(new ApiResponse(200, data, 'Dashboard analytics fetched successfully'));
});

const getBatchWiseBreakdown = catchAsync(async (req, res) => {
  const data = await analyticsService.getBatchWiseBreakdown(getRequester(req));
  res.status(200).json(new ApiResponse(200, data, 'Batch-wise breakdown fetched successfully'));
});

module.exports = { getDashboardOverview, getBatchWiseBreakdown };