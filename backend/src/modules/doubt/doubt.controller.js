const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const doubtService = require('./doubt.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const askDoubt = catchAsync(async (req, res) => {
  const doubt = await doubtService.askDoubt(getRequester(req), req.body, req.file);
  res.status(201).json(new ApiResponse(201, doubt, 'Doubt answered successfully'));
});

const getMyDoubts = catchAsync(async (req, res) => {
  const doubts = await doubtService.getMyDoubts(getRequester(req));
  res.status(200).json(new ApiResponse(200, doubts, 'Doubt history fetched successfully'));
});

module.exports = { askDoubt, getMyDoubts };