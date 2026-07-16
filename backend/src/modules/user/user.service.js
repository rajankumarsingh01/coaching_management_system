const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');
const userRepository = require('./user.repository');
const { ROLES } = require('../../config/constants');

const SALT_ROUNDS = 10;

const registerUser = async (requester, { name, email, password, role, parentId, batchIds }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  if (!requester.instituteId) {
    throw new ApiError(400, 'Requesting user has no institute context');
  }

  // if a parentId is supplied (only relevant when role === student), verify it's a real
  // parent within the same institute — prevents linking to a random/foreign user
  if (parentId) {
    const parent = await userRepository.findById(parentId);
    if (!parent || parent.role !== ROLES.PARENT) {
      throw new ApiError(400, 'Provided parentId is not a valid parent account');
    }
    if (String(parent.instituteId) !== String(requester.instituteId)) {
      throw new ApiError(403, 'Parent does not belong to the same institute');
    }
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
    instituteId: requester.instituteId,
    parentId: parentId || null,
    batchIds: batchIds || [],
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    instituteId: user.instituteId,
    parentId: user.parentId,
  };
};

const getUserProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

const getUsersByRole = async (requester, role) => {
  const validRoles = [ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, 'Invalid role filter');
  }

  const filter =
    requester.role === ROLES.SUPER_ADMIN
      ? { role }
      : { role, instituteId: requester.instituteId };

  const users = await userRepository.findAll(filter);
  // isActive included — mobile Users tab list needs it to show Active/Inactive
  // badges without an extra GET /users/:id call per row.
  return users.map((u) => ({ id: u._id, name: u.name, email: u.email, isActive: u.isActive }));
};

// parent viewing their own linked children
// parent viewing their own linked children — batchIds populated so the
// frontend knows which batch(es) to fetch homework/tests for
const getMyChildren = async (parentId) => {
  const children = await userRepository
    .findAll({ role: ROLES.STUDENT, parentId })
    .populate('batchIds', 'name subject');
  return children.map((c) => ({
    id: c._id,
    name: c.name,
    email: c.email,
    batches: c.batchIds.map((b) => ({ id: b._id, name: b.name, subject: b.subject })),
  }));
};

// NEW — admin viewing a single user's full profile (e.g. before editing)
const getUserById = async (requester, targetUserId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const user = await userRepository.findByIdScoped(targetUserId, filter);
  if (!user) throw new ApiError(404, 'User not found');

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    batchIds: user.batchIds,
    parentId: user.parentId,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

// NEW
const updateUser = async (requester, targetUserId, updates) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const target = await userRepository.findByIdScoped(targetUserId, filter);
  if (!target) throw new ApiError(404, 'User not found');

  // Prevent privilege escalation / accidental admin-account edits — this
  // endpoint is for managing Teacher/Student/Parent accounts only.
  if (target.role === ROLES.ADMIN || target.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, 'Cannot modify an admin account through this endpoint');
  }

  if (updates.email && updates.email !== target.email) {
    const existing = await userRepository.findByEmail(updates.email);
    if (existing) throw new ApiError(409, 'A user with this email already exists');
  }

  const updated = await userRepository.updateById(targetUserId, updates);
  return {
    id: updated._id,
    name: updated.name,
    email: updated.email,
    role: updated.role,
    batchIds: updated.batchIds,
    isActive: updated.isActive,
  };
};

// NEW — soft delete (sets isActive: false, never removes the document —
// attendance/fee/homework/result records reference this user, and hard-
// deleting would orphan that history). This plugs directly into the
// isActive check already added to auth.service.js's login flow.
const deactivateUser = async (requester, targetUserId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const target = await userRepository.findByIdScoped(targetUserId, filter);
  if (!target) throw new ApiError(404, 'User not found');

  if (target.role === ROLES.ADMIN || target.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, 'Cannot deactivate an admin account through this endpoint');
  }

  await userRepository.updateById(targetUserId, { isActive: false });
};

// NEW — undo a deactivation
const reactivateUser = async (requester, targetUserId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const target = await userRepository.findByIdScoped(targetUserId, filter);
  if (!target) throw new ApiError(404, 'User not found');

  await userRepository.updateById(targetUserId, { isActive: true });
};

module.exports = {
  registerUser,
  getUserProfile,
  getUsersByRole,
  getMyChildren,
  getUserById,      // 👈 new export
  updateUser,        // 👈 new export
  deactivateUser,    // 👈 new export
  reactivateUser,    // 👈 new export
};