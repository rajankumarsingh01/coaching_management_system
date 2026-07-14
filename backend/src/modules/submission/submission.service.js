const ApiError = require('../../utils/ApiError');
const submissionRepository = require('./submission.repository');
const homeworkRepository = require('../homework/homework.repository');
const { uploadBufferToCloudinary } = require('../../utils/cloudinaryUpload');
const { ROLES } = require('../../config/constants');
const gamificationService = require('../gamification/gamification.service');
const submissionRepositoryForCount = require('./submission.repository');
const { getTenantFilter } = require('../../utils/tenantFilter');

const submitHomework = async (requester, homeworkId, file) => {
  if (!file) throw new ApiError(400, 'A file is required');

  const existing = await submissionRepository.findByHomeworkAndStudent(homeworkId, requester.id);
  if (existing) throw new ApiError(400, 'You have already submitted this homework');

 const filter = getTenantFilter(requester);
  const homework = await homeworkRepository.findByIdScoped(homeworkId, filter);
  if (!homework) throw new ApiError(404, 'Homework not found');

  const result = await uploadBufferToCloudinary(file.buffer, 'coaching-app/submissions');

  const isLate = new Date() > new Date(homework.dueDate);

  const submission = await submissionRepository.create({
    homeworkId,
    studentId: requester.id,
    instituteId: homework.instituteId,
    attachmentUrl: result.secure_url,
    attachmentPublicId: result.public_id,
    isLate,
  });

  // Gamification hooks — fire-and-forget
  gamificationService.recordActivity(requester.id, homework.instituteId).catch(() => {});
  if (!isLate) {
    submissionRepositoryForCount
      .findByStudent(requester.id, { instituteId: homework.instituteId })
      .then((allSubmissions) => {
        const onTimeCount = allSubmissions.filter((s) => !s.isLate).length;
        gamificationService.checkHomeworkHeroBadge(requester.id, homework.instituteId, onTimeCount).catch(() => {});
      })
      .catch(() => {});
  }

  return submission;
};

const getHomeworkSubmissions = async (requester, homeworkId) => {
 const filter = getTenantFilter(requester);
  return submissionRepository.findByHomework(homeworkId, filter);
};

const getMySubmissions = async (requester) => {
 const filter = getTenantFilter(requester);
  return submissionRepository.findByStudent(requester.id, filter);
};

module.exports = { submitHomework, getHomeworkSubmissions, getMySubmissions };