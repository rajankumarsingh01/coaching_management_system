const ApiError = require('./ApiError');
const userRepository = require('../modules/user/user.repository');
const batchRepository = require('../modules/batch/batch.repository');
const { ROLES } = require('../config/constants');

const toIdString = (entry) => String(entry?._id ?? entry);

/**
 * Verifies a STUDENT/PARENT requester is actually allowed to view data for
 * `studentId` — a student can only see their own data, a parent only their
 * own linked child's data. ADMIN/TEACHER/SUPER_ADMIN are unaffected (their
 * access is already governed by instituteId-scoping at the query level).
 *
 * Fixes: previously, roleMiddleware only checked "is this role allowed to
 * call this endpoint at all" — not "is this the specific student/batch this
 * person is entitled to see" — which let any parent view any other family's
 * child's data just by changing the :studentId in the URL.
 */
const assertCanAccessStudent = async (requester, studentId) => {
  if (requester.role === ROLES.STUDENT) {
    if (String(requester.id) !== String(studentId)) {
      throw new ApiError(403, 'You can only view your own data');
    }
    return;
  }

  if (requester.role === ROLES.PARENT) {
    const student = await userRepository.findById(studentId);
    if (!student || student.role !== ROLES.STUDENT || String(student.parentId) !== String(requester.id)) {
      throw new ApiError(403, "You can only view your own child's data");
    }
    return;
  }

  // ADMIN / TEACHER / SUPER_ADMIN — no additional check here.
};

/**
 * Same idea, for batch-scoped endpoints (homework, notes, lectures,
 * leaderboard). A student must belong to the batch; a parent must have at
 * least one child in the batch.
 */
const assertCanAccessBatch = async (requester, batchId) => {
  if (requester.role === ROLES.STUDENT) {
    const batch = await batchRepository.findById(batchId);
    if (!batch) throw new ApiError(404, 'Batch not found');
    const isMember = batch.studentIds.some((s) => toIdString(s) === String(requester.id));
    if (!isMember) throw new ApiError(403, 'You are not part of this batch');
    return;
  }

  if (requester.role === ROLES.PARENT) {
    const batch = await batchRepository.findById(batchId);
    if (!batch) throw new ApiError(404, 'Batch not found');

    const children = await userRepository.findAll({ role: ROLES.STUDENT, parentId: requester.id });
    const childIds = new Set(children.map((c) => String(c._id)));
    const hasChildInBatch = batch.studentIds.some((s) => childIds.has(toIdString(s)));
    if (!hasChildInBatch) throw new ApiError(403, 'You do not have a child in this batch');
    return;
  }

  // ADMIN / TEACHER / SUPER_ADMIN — no additional check here.
};

module.exports = { assertCanAccessStudent, assertCanAccessBatch };