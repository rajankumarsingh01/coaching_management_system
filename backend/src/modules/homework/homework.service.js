const ApiError = require('../../utils/ApiError');
const homeworkRepository = require('./homework.repository');
const batchRepository = require('../batch/batch.repository');
const cloudinary = require('../../config/cloudinary.config');
const { uploadBufferToCloudinary } = require('../../utils/cloudinaryUpload');
const { ROLES } = require('../../config/constants');
const notificationService = require('../notification/notification.service');
const { assertCanAccessBatch } = require('../../utils/ownershipGuard');
const { getTenantFilter } = require('../../utils/tenantFilter');
const { emitToBatch } = require('../../socket/socket');
const toIdString = (entry) => String(entry?._id ?? entry);

const createHomework = async (requester, { title, description, batchId, dueDate }, file) => {
  const filter = getTenantFilter(requester);
  const batch = await batchRepository.findByIdScoped(batchId, filter);
  if (!batch) throw new ApiError(404, 'Batch not found');

  if (requester.role === ROLES.TEACHER) {
    const isAssigned = batch.teacherIds.some((entry) => toIdString(entry) === String(requester.id));
    if (!isAssigned) throw new ApiError(403, 'You are not assigned to this batch');
  }

  let attachmentUrl = '';
  let attachmentPublicId = '';
  if (file) {
    const result = await uploadBufferToCloudinary(file.buffer, 'coaching-app/homework');
    attachmentUrl = result.secure_url;
    attachmentPublicId = result.public_id;
  }

  const homework = await homeworkRepository.create({
    title,
    description: description || '',
    batchId,
    instituteId: batch.instituteId,
    createdBy: requester.id,
    dueDate: new Date(dueDate),
    attachmentUrl,
    attachmentPublicId,
  });

  // Notify students — fire-and-forget, never blocks the response
  if (batch.studentIds.length > 0) {
    notificationService
      .sendToUsers(batch.studentIds, {
        title: 'New Homework Assigned',
        body: `${title} — due ${new Date(dueDate).toLocaleDateString()}`,
        data: { type: 'homework', homeworkId: String(homework._id) },
      })
      .catch(() => {});
  }

  // Structured realtime event — batch room ke students ki homework-list
  // screen isi se turant refresh ho sakti hai
  emitToBatch(String(batchId), 'homework:new', {
    homeworkId: String(homework._id),
    title: homework.title,
    batchId: String(batchId),
    dueDate: homework.dueDate,
  });

  return homework;
};

const getBatchHomework = async (requester, batchId) => {

   await assertCanAccessBatch(requester, batchId);   // 👈 NAYI LINE
   
  const filter = getTenantFilter(requester);
  return homeworkRepository.findByBatch(batchId, filter);
};

const deleteHomework = async (requester, homeworkId) => {
  const filter = getTenantFilter(requester);
  const homework = await homeworkRepository.findByIdScoped(homeworkId, filter);
  if (!homework) throw new ApiError(404, 'Homework not found');

  if (homework.attachmentPublicId) {
    await cloudinary.uploader.destroy(homework.attachmentPublicId).catch(() => {});
  }
  await homeworkRepository.deleteById(homeworkId);
};

module.exports = { createHomework, getBatchHomework, deleteHomework };