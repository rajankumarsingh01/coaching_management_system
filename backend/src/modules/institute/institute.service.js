const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');
const instituteRepository = require('./institute.repository');
const userRepository = require('../user/user.repository');
const auditLogService = require('../auditLog/auditLog.service');
const { ROLES } = require('../../config/constants');

const notificationService = require('../notification/notification.service');   // 👈 NEW


const SALT_ROUNDS = 10;

// Only super_admin calls this — creates a new tenant (institute) + its admin (owner) account
const createInstituteWithAdmin = async (payload, superAdminId) => {
  const { instituteName, instituteCode, adminName, adminEmail, adminPassword } = payload;

  const existingInstitute = await instituteRepository.findByCode(instituteCode);
  if (existingInstitute) {
    throw new ApiError(409, 'An institute with this code already exists');
  }

  const existingAdmin = await userRepository.findByEmail(adminEmail);
  if (existingAdmin) {
    throw new ApiError(409, 'A user with this email already exists');
  }

  const institute = await instituteRepository.create({
    name: instituteName,
    code: instituteCode,
    createdBy: superAdminId,
  });

  const hashedPassword = await bcrypt.hash(adminPassword, SALT_ROUNDS);

  const admin = await userRepository.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: ROLES.ADMIN,
    instituteId: institute._id,
  });

  await auditLogService.logAccess({
    userId: superAdminId,
    role: ROLES.SUPER_ADMIN,
    action: 'CREATE_INSTITUTE',
    targetInstituteId: institute._id,
    details: `Created institute "${institute.name}" with admin ${admin.email}`,
  });

  return {
    institute: { id: institute._id, name: institute.name, code: institute.code },
    admin: { id: admin._id, name: admin.name, email: admin.email },
  };
};

// Only super_admin calls this — cross-tenant read, must be audit logged
const getAllInstitutes = async (superAdminId) => {
  const institutes = await instituteRepository.findAll();

  await auditLogService.logAccess({
    userId: superAdminId,
    role: ROLES.SUPER_ADMIN,
    action: 'VIEW_ALL_INSTITUTES',
    targetInstituteId: null,
    details: `Viewed list of all ${institutes.length} institutes`,
  });

  return institutes;
};

// Only super_admin calls this — kill-switch on. Har request pe authMiddleware
// isActive check karega, isliye yeh block turant effective ho jaata hai.
const blockInstitute = async (instituteId, superAdminId) => {
  const institute = await instituteRepository.findById(instituteId);
  if (!institute) {
    throw new ApiError(404, 'Institute not found');
  }

  const updated = await instituteRepository.updateById(instituteId, { isActive: false });

  await auditLogService.logAccess({
    userId: superAdminId,
    role: ROLES.SUPER_ADMIN,
    action: 'BLOCK_INSTITUTE',
    targetInstituteId: instituteId,
    details: `Blocked institute "${institute.name}" (${institute.code})`,
  });

  return { id: updated._id, name: updated.name, isActive: updated.isActive };
};

// Only super_admin calls this — sab kuch automatically normal ho jaata hai,
// koi extra frontend/session code nahi chahiye
const unblockInstitute = async (instituteId, superAdminId) => {
  const institute = await instituteRepository.findById(instituteId);
  if (!institute) {
    throw new ApiError(404, 'Institute not found');
  }

  const updated = await instituteRepository.updateById(instituteId, { isActive: true });

  await auditLogService.logAccess({
    userId: superAdminId,
    role: ROLES.SUPER_ADMIN,
    action: 'UNBLOCK_INSTITUTE',
    targetInstituteId: instituteId,
    details: `Unblocked institute "${institute.name}" (${institute.code})`,
  });

  return { id: updated._id, name: updated.name, isActive: updated.isActive };
};

// Only super_admin calls this — us institute ke sirf ADMIN-role users ko
// "trial khatam ho raha hai" notification bhejta hai (existing sendToUsers reuse)
const sendTrialReminder = async (instituteId, superAdminId) => {
  const institute = await instituteRepository.findById(instituteId);
  if (!institute) {
    throw new ApiError(404, 'Institute not found');
  }

  const admins = await userRepository.findAll({ instituteId, role: ROLES.ADMIN });
  if (admins.length === 0) {
    throw new ApiError(404, 'No admin users found for this institute to notify');
  }

  const adminIds = admins.map((a) => a._id);

  await notificationService.sendToUsers(adminIds, {
    title: 'Trial Ending Soon',
    body: `Your institute "${institute.name}"'s trial is ending soon. Please upgrade to continue uninterrupted access.`,
    data: { type: 'TRIAL_REMINDER', instituteId: institute._id.toString() },
  });

  await auditLogService.logAccess({
    userId: superAdminId,
    role: ROLES.SUPER_ADMIN,
    action: 'SEND_TRIAL_REMINDER',
    targetInstituteId: instituteId,
    details: `Sent trial reminder to ${admins.length} admin(s) of institute "${institute.name}"`,
  });

  return { notifiedAdmins: admins.length };
};


module.exports = {
  createInstituteWithAdmin,
  getAllInstitutes,
  blockInstitute,
  unblockInstitute,
  sendTrialReminder,
};