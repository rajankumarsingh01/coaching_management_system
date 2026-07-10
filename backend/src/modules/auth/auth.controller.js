const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const authService = require('./auth.service');

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);
  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await authService.refreshAccessToken(token);
  res.status(200).json(new ApiResponse(200, result, 'Access token refreshed'));
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.user.id);
  res.status(200).json(new ApiResponse(200, null, 'Logout successful'));
});

module.exports = { login, refreshToken, logout };