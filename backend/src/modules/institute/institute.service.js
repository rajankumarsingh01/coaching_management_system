const bcrypt = require('bcrypt');
const ApiError = require('../../utils/ApiError');
const instituteRepository = require('./institute.repository');
const userRepository = require('../user/user.repository');
const auditLogService = require('../auditLog/auditLog.service');
const { ROLES } = require('../../config/constants');

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

module.exports = { createInstituteWithAdmin, getAllInstitutes };