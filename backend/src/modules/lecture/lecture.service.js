const ApiError = require('../../utils/ApiError');
const lectureRepository = require('./lecture.repository');
const batchRepository = require('../batch/batch.repository');
const { ROLES } = require('../../config/constants');

const toIdString = (entry) => String(entry?._id ?? entry);

const createLecture = async (requester, { title, youtubeUrl, batchId }) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const batch = await batchRepository.findByIdScoped(batchId, filter);
  if (!batch) throw new ApiError(404, 'Batch not found');

  if (requester.role === ROLES.TEACHER) {
    const isAssigned = batch.teacherIds.some((entry) => toIdString(entry) === String(requester.id));
    if (!isAssigned) throw new ApiError(403, 'You are not assigned to this batch');
  }

  const lecture = await lectureRepository.create({
    title,
    youtubeUrl,
    batchId,
    instituteId: batch.instituteId,
    uploadedBy: requester.id,
  });

  return lecture;
};

const getBatchLectures = async (requester, batchId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  return lectureRepository.findByBatch(batchId, filter);
};

const deleteLecture = async (requester, lectureId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  const lecture = await lectureRepository.findByIdScoped(lectureId, filter);
  if (!lecture) throw new ApiError(404, 'Lecture not found');
  await lectureRepository.deleteById(lectureId);
};

module.exports = { createLecture, getBatchLectures, deleteLecture };