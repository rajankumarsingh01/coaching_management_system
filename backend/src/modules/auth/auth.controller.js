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

// NEW
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json(new ApiResponse(200, null, 'Password changed successfully'));
});

// NEW — hamesha ek hi generic message, chahe email exist kare ya na kare
const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  await authService.forgotPassword(email);
  res.status(200).json(
    new ApiResponse(200, null, 'If an account with this email exists, a reset code has been sent')
  );
});

// NEW
const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  await authService.resetPassword(email, otp, newPassword);
  res.status(200).json(new ApiResponse(200, null, 'Password reset successfully. Please login with your new password.'));
});

module.exports = { login, refreshToken, logout, changePassword, forgotPassword, resetPassword };