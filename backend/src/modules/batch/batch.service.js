const ApiError = require('../../utils/ApiError');
const batchRepository = require('./batch.repository');
const userRepository = require('../user/user.repository');
const { ROLES } = require('../../config/constants');
const { getTenantFilter } = require('../../utils/tenantFilter');
// requester = { id, role, instituteId }
const createBatch = async (requester, { name, subject }) => {
  if (!requester.instituteId) {
    throw new ApiError(400, 'Requesting user has no institute context');
  }

  const batch = await batchRepository.create({
    name,
    subject: subject || '',
    instituteId: requester.instituteId,
  });

  return batch;
};

const getAllBatches = async (requester) => {
  const filter = getTenantFilter(requester);

  if (requester.role === ROLES.STUDENT) {
    filter.studentIds = requester.id;
  } else if (requester.role === ROLES.TEACHER) {
    filter.teacherIds = requester.id;
  }
  // ADMIN / SUPER_ADMIN — no extra scoping, they manage all batches.

  return batchRepository.findAll(filter);
};

const getBatchById = async (requester, batchId) => {
  const filter = getTenantFilter(requester);
  const batch = await batchRepository.findByIdScoped(batchId, filter);
  if (!batch) {
    throw new ApiError(404, 'Batch not found');
  }
  return batch;
};

const updateBatch = async (requester, batchId, updates) => {
  // ensures the batch belongs to the requester's institute before allowing update
  await getBatchById(requester, batchId);
  const updated = await batchRepository.updateById(batchId, updates);
  return updated;
};

const deleteBatch = async (requester, batchId) => {
  await getBatchById(requester, batchId);
  const deleted = await batchRepository.deleteById(batchId);
  return deleted;
};

const assignStudent = async (requester, batchId, studentId) => {
  const batch = await getBatchById(requester, batchId);

  const student = await userRepository.findById(studentId);
  if (!student || student.role !== ROLES.STUDENT) {
    throw new ApiError(400, 'Provided userId is not a valid student');
  }
  if (String(student.instituteId) !== String(batch.instituteId)) {
    throw new ApiError(403, 'Student does not belong to the same institute as this batch');
  }

  const updated = await batchRepository.addStudent(batchId, studentId);

  // keep the reverse reference in sync
  if (!student.batchIds.some((id) => String(id) === String(batchId))) {
    student.batchIds.push(batchId);
    await student.save();
  }

  return updated;
};

const assignTeacher = async (requester, batchId, teacherId) => {
  const batch = await getBatchById(requester, batchId);

  const teacher = await userRepository.findById(teacherId);
  if (!teacher || teacher.role !== ROLES.TEACHER) {
    throw new ApiError(400, 'Provided userId is not a valid teacher');
  }
  if (String(teacher.instituteId) !== String(batch.instituteId)) {
    throw new ApiError(403, 'Teacher does not belong to the same institute as this batch');
  }

  const updated = await batchRepository.addTeacher(batchId, teacherId);

  if (!teacher.batchIds.some((id) => String(id) === String(batchId))) {
    teacher.batchIds.push(batchId);
    await teacher.save();
  }

  return updated;
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  assignStudent,
  assignTeacher,
};

















