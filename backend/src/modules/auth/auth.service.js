const bcrypt = require('bcrypt');
const crypto = require('crypto');
const ApiError = require('../../utils/ApiError');
const userRepository = require('../user/user.repository');
const instituteRepository = require('../institute/institute.repository');
const { ROLES } = require('../../config/constants');
const { sendEmail } = require('../../utils/emailService');
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require('../../utils/token');

const SALT_ROUNDS = 10;
const OTP_EXPIRY_MINUTES = 10;

const hashOtp = (otp) => crypto.createHash('sha256').update(otp).digest('hex');

const login = async (email, password) => {
  const user = await userRepository.findByEmail(email, true);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact your institute admin.');
  }

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
      avatarUrl: user.avatarUrl,
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

  if (!user.isActive) {
    throw new ApiError(403, 'This account has been deactivated. Contact your institute admin.');
  }

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

// NEW — logged-in user apna password khud badalta hai, current password
// verify karne ke baad. Success pe refreshToken bhi clear kar dete hain
// taaki dusri saari devices/sessions se force logout ho jaye — security
// best practice jab password change hota hai.
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await userRepository.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.refreshToken = null;
  await user.save();
};

// NEW — email pe 6-digit OTP bhejta hai. Jaan-boojhkar user exist kare ya
// na kare, dono cases me same success response deta hai (controller me) —
// warna is endpoint se attacker pata laga sakta hai ki koi email registered
// hai ya nahi (user enumeration attack).
const forgotPassword = async (email) => {
  const user = await userRepository.findByEmail(email);
  if (!user) return; // silently no-op — controller still returns generic success

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const otpHash = hashOtp(otp);
  const expires = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await userRepository.updateById(user._id, {
    resetPasswordOtpHash: otpHash,
    resetPasswordExpires: expires,
  });

  await sendEmail({
    to: user.email,
    subject: 'Your password reset code',
    body: `Your password reset code is <strong style="font-size:20px;letter-spacing:2px;">${otp}</strong>. It expires in ${OTP_EXPIRY_MINUTES} minutes. If you didn't request this, you can safely ignore this email.`,
  });
};

// NEW — OTP verify karke naya password set karta hai
const resetPassword = async (email, otp, newPassword) => {
  const user = await userRepository.findByEmail(email).select('+resetPasswordOtpHash +resetPasswordExpires');

  if (!user || !user.resetPasswordOtpHash || !user.resetPasswordExpires) {
    throw new ApiError(400, 'Invalid or expired reset code');
  }

  if (user.resetPasswordExpires.getTime() < Date.now()) {
    throw new ApiError(400, 'Reset code has expired. Please request a new one.');
  }

  if (hashOtp(otp) !== user.resetPasswordOtpHash) {
    throw new ApiError(400, 'Invalid or expired reset code');
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.resetPasswordOtpHash = null;
  user.resetPasswordExpires = null;
  user.refreshToken = null;
  await user.save();
};

module.exports = {
  login,
  refreshAccessToken,
  logout,
  changePassword,   // 👈 new export
  forgotPassword,   // 👈 new export
  resetPassword,    // 👈 new export
};