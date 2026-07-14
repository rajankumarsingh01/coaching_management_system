const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const notificationService = require('./notification.service');

const registerToken = catchAsync(async (req, res) => {
  await notificationService.registerPushToken(req.user.id, req.body.expoPushToken);
  res.status(200).json(new ApiResponse(200, null, 'Push token registered successfully'));
});

module.exports = { registerToken };