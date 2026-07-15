const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');
const userRepository = require('../user/user.repository');
const instituteRepository = require('../institute/institute.repository');   // 👈 NEW
const { ROLES } = require('../../config/constants');                        // 👈 NEW
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/token');




const login = async (email, password) => {
  const user = await userRepository.findByEmail(email, true);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Admin can deactivate a user (e.g. student left, teacher no longer
  // employed) without deleting their account/history. This check was
  // missing — the model already had isActive, but login never read it,
  // so a deactivated user could still log in normally.
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact your institute admin.');
  }

  // NEW — blocked institute ka koi bhi non-super_admin user login nahi kar payega,
  // generic invalid-credentials error ki jagah clear message milega.
  if (user.role !== ROLES.SUPER_ADMIN) {
    const institute = await instituteRepository.findById(user.instituteId).select('isActive');
    if (!institute || institute.isActive === false) {
      throw new ApiError(403, "Your institute's access has been suspended. Please contact support.", [], 'INSTITUTE_SUSPENDED');
    }
  }

  const payload = {
    id: user._id,
    role: user.role,
    instituteId: user.instituteId,
    batchIds: user.batchIds,
  };
  // ...baaki code same rahega
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await userRepository.updateRefreshToken(user._id, refreshToken);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      instituteId: user.instituteId,
    },
  };
};



const refreshAccessToken = async (token) => {
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired refresh token');
  }

  const user = await userRepository.findById(decoded.id, true);
  if (!user || user.refreshToken !== token) {
    throw new ApiError(401, 'Refresh token does not match');
  }


  // Same isActive check as login — a deactivated user's existing refresh
  // token shouldn't silently keep minting new access tokens.
  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact your institute admin.');
  }

  // NEW — same institute-block check yahan bhi, warna blocked institute ka
  // user apna existing refresh token use karke naya access token bana sakta hai
  if (user.role !== ROLES.SUPER_ADMIN) {
    const institute = await instituteRepository.findById(user.instituteId).select('isActive');
    if (!institute || institute.isActive === false) {
     throw new ApiError(403, "Your institute's access has been suspended. Please contact support.", [], 'INSTITUTE_SUSPENDED');
    }
  }

  const payload = {
    id: user._id,
    role: user.role,
    instituteId: user.instituteId,
    batchIds: user.batchIds,
  };
  const accessToken = generateAccessToken(payload);

  return { accessToken };
};

const logout = async (userId) => {
  await userRepository.updateRefreshToken(userId, null);
};

module.exports = { login, refreshAccessToken, logout };