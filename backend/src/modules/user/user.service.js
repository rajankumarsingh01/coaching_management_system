const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');
const userRepository = require('./user.repository');

const SALT_ROUNDS = 10;

// requester = { id, role, instituteId } — comes from req.user (the logged-in admin)
const registerUser = async (requester, { name, email, password, role, parentId, batchIds }) => {
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  if (!requester.instituteId) {
    throw new ApiError(400, 'Requesting user has no institute context');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
    instituteId: requester.instituteId, // always the admin's own institute — never client-supplied
    parentId: parentId || null,
    batchIds: batchIds || [],
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    instituteId: user.instituteId,
  };
};

const getUserProfile = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }
  return user;
};

module.exports = { registerUser, getUserProfile };