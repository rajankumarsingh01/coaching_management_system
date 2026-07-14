const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const gamificationService = require('./gamification.service');

const getMyProfile = catchAsync(async (req, res) => {
  const profile = await gamificationService.getStudentGamificationProfile(req.user.id, req.user.instituteId);
  res.status(200).json(new ApiResponse(200, profile, 'Gamification profile fetched successfully'));
});

module.exports = { getMyProfile };