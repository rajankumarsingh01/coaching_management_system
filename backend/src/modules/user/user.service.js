const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');
const userRepository = require('./user.repository');
const cloudinary = require('../../config/cloudinary.config');                     // NEW
const { uploadBufferToCloudinary } = require('../../utils/cloudinaryUpload');     // NEW
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

// UPDATED — ab batchIds (name/subject) aur parentId (name/email) populate
// karte hain, aur avatarUrl bhi return karte hain. Isi endpoint (GET /users/me)
// se student ka apna profile screen — profile pic, batch, parent info — sab data leta hai.
const getUserProfile = async (userId) => {
  const user = await userRepository
    .findById(userId)
    .populate('batchIds', 'name subject')
    .populate('parentId', 'name email');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    avatarUrl: user.avatarUrl,
    batches: (user.batchIds || []).map((b) => ({ id: b._id, name: b.name, subject: b.subject })),
    parent: user.parentId ? { name: user.parentId.name, email: user.parentId.email } : null,
  };
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
  return users.map((u) => ({ id: u._id, name: u.name, email: u.email, isActive: u.isActive }));
};

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

const updateUser = async (requester, targetUserId, updates) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const target = await userRepository.findByIdScoped(targetUserId, filter);
  if (!target) throw new ApiError(404, 'User not found');

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

const deactivateUser = async (requester, targetUserId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const target = await userRepository.findByIdScoped(targetUserId, filter);
  if (!target) throw new ApiError(404, 'User not found');

  if (target.role === ROLES.ADMIN || target.role === ROLES.SUPER_ADMIN) {
    throw new ApiError(403, 'Cannot deactivate an admin account through this endpoint');
  }

  await userRepository.updateById(targetUserId, { isActive: false });
};

const reactivateUser = async (requester, targetUserId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const target = await userRepository.findByIdScoped(targetUserId, filter);
  if (!target) throw new ApiError(404, 'User not found');

  await userRepository.updateById(targetUserId, { isActive: true });
};

// NEW — self-service profile picture upload. Requester khud apni hi photo
// upload/replace kar sakta hai (koi role restriction nahi — admin/teacher/
// student/parent sab apna avatar set kar sakte hain). Purani photo (agar
// thi) pehle Cloudinary se destroy hoti hai taaki replace karne par
// storage me purani copy pade na rahe.
const uploadAvatar = async (requester, file) => {
  if (!file) {
    throw new ApiError(400, 'No image file provided');
  }
  if (!file.mimetype.startsWith('image/')) {
    throw new ApiError(400, 'Only image files (jpg/png) are allowed for profile picture');
  }

  const user = await userRepository.findById(requester.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
  }

  const result = await uploadBufferToCloudinary(file.buffer, 'coaching-app/avatars');

  const updated = await userRepository.updateById(requester.id, {
    avatarUrl: result.secure_url,
    avatarPublicId: result.public_id,
  });

  return { avatarUrl: updated.avatarUrl };
};

// NEW — profile picture remove karta hai — DB field clear + Cloudinary se
// bhi image permanently delete (storage clean rakhne ke liye).
const deleteAvatar = async (requester) => {
  const user = await userRepository.findById(requester.id);
  if (!user) throw new ApiError(404, 'User not found');

  if (user.avatarPublicId) {
    await cloudinary.uploader.destroy(user.avatarPublicId).catch(() => {});
  }

  await userRepository.updateById(requester.id, { avatarUrl: null, avatarPublicId: null });
};

module.exports = {
  registerUser,
  getUserProfile,
  getUsersByRole,
  getMyChildren,
  getUserById,
  updateUser,
  deactivateUser,
  reactivateUser,
  uploadAvatar,   // 👈 new export
  deleteAvatar,   // 👈 new export
};