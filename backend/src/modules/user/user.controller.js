const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const userService = require('./user.service');

const register = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const user = await userService.registerUser(requester, req.body);
  res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
});

const getMe = catchAsync(async (req, res) => {
  const user = await userService.getUserProfile(req.user.id);
  res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

const getUsersByRole = catchAsync(async (req, res) => {
  const { role } = req.query;
  if (!role) throw new ApiError(400, 'role query param is required');

  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const users = await userService.getUsersByRole(requester, role);
  res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

const getMyChildren = catchAsync(async (req, res) => {
  const children = await userService.getMyChildren(req.user.id);
  res.status(200).json(new ApiResponse(200, children, 'Children fetched successfully'));
});

const getUserById = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const user = await userService.getUserById(requester, req.params.id);
  res.status(200).json(new ApiResponse(200, user, 'User fetched successfully'));
});

const updateUser = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const user = await userService.updateUser(requester, req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, user, 'User updated successfully'));
});

const deactivateUser = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  await userService.deactivateUser(requester, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User deactivated successfully'));
});

const reactivateUser = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  await userService.reactivateUser(requester, req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'User reactivated successfully'));
});

// NEW — self profile picture upload (req.file multer se, field name "avatar")
const uploadAvatar = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  const result = await userService.uploadAvatar(requester, req.file);
  res.status(200).json(new ApiResponse(200, result, 'Profile picture updated successfully'));
});

// NEW — self profile picture delete
const deleteAvatar = catchAsync(async (req, res) => {
  const requester = { id: req.user.id, role: req.user.role, instituteId: req.user.instituteId };
  await userService.deleteAvatar(requester);
  res.status(200).json(new ApiResponse(200, null, 'Profile picture removed successfully'));
});

module.exports = {
  register,
  getMe,
  getUsersByRole,
  getMyChildren,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  uploadAvatar,   // 👈 new export
  deleteAvatar,   // 👈 new export
};