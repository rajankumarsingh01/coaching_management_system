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
  return users.map((u) => ({ id: u._id, name: u.name, email: u.email }));
};

// parent viewing their own linked children
const getMyChildren = async (parentId) => {
  const children = await userRepository.findAll({ role: ROLES.STUDENT, parentId });
  return children.map((c) => ({ id: c._id, name: c.name, email: c.email }));
};

module.exports = { registerUser, getUserProfile, getUsersByRole, getMyChildren };