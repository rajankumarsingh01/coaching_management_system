// const ApiError = require('../../utils/ApiError');
// const notesRepository = require('./notes.repository');
// const batchRepository = require('../batch/batch.repository');
// const cloudinary = require('../../config/cloudinary.config');
// const { uploadBufferToCloudinary } = require('../../utils/cloudinaryUpload');
// const { ROLES } = require('../../config/constants');
// const { assertCanAccessBatch } = require('../../utils/ownershipGuard');
// const { getTenantFilter } = require('../../utils/tenantFilter');
// const toIdString = (entry) => String(entry?._id ?? entry);

// const MIME_TO_TYPE = {
//   'application/pdf': 'pdf',
//   'image/jpeg': 'jpg',
//   'image/png': 'png',
// };

// // requester = { id, role, instituteId }, file = multer memory file object
// const uploadNotes = async (requester, { title, batchId }, file) => {
//   if (!file) throw new ApiError(400, 'A file is required');

//   const filter = getTenantFilter(requester);

//   const batch = await batchRepository.findByIdScoped(batchId, filter);
//   if (!batch) throw new ApiError(404, 'Batch not found');

//   if (requester.role === ROLES.TEACHER) {
//     const isAssigned = batch.teacherIds.some((entry) => toIdString(entry) === String(requester.id));
//     if (!isAssigned) throw new ApiError(403, 'You are not assigned to this batch');
//   }

//   const result = await uploadBufferToCloudinary(file.buffer, 'coaching-app/notes');

//   const notes = await notesRepository.create({
//     title,
//     batchId,
//     instituteId: batch.instituteId,
//     uploadedBy: requester.id,
//     fileUrl: result.secure_url,
//     filePublicId: result.public_id,
//     fileType: MIME_TO_TYPE[file.mimetype],
//   });

//   return notes;
// };

// const getBatchNotes = async (requester, batchId) => {
//     await assertCanAccessBatch(requester, batchId);   // 👈 NAYI LINE
    
//   const filter = getTenantFilter(requester);

//   return notesRepository.findByBatch(batchId, filter);
// };

// const deleteNotes = async (requester, notesId) => {
//  const filter = getTenantFilter(requester);
 
//   const notes = await notesRepository.findByIdScoped(notesId, filter);
//   if (!notes) throw new ApiError(404, 'Notes not found');

//   await cloudinary.uploader.destroy(notes.filePublicId);
//   await notesRepository.deleteById(notesId);
// };

// module.exports = { uploadNotes, getBatchNotes, deleteNotes };



const ApiError = require('../../utils/ApiError');
const notesRepository = require('./notes.repository');
const batchRepository = require('../batch/batch.repository');
const cloudinary = require('../../config/cloudinary.config');
const { uploadBufferToCloudinary } = require('../../utils/cloudinaryUpload');
const { ROLES } = require('../../config/constants');
const { assertCanAccessBatch } = require('../../utils/ownershipGuard');
const { getTenantFilter } = require('../../utils/tenantFilter');
const agenticService = require('../../config/agenticService.config');
const toIdString = (entry) => String(entry?._id ?? entry);

const MIME_TO_TYPE = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
};

const uploadNotes = async (requester, { title, batchId }, file) => {
  if (!file) throw new ApiError(400, 'A file is required');

  const filter = getTenantFilter(requester);

  const batch = await batchRepository.findByIdScoped(batchId, filter);
  if (!batch) throw new ApiError(404, 'Batch not found');

  if (requester.role === ROLES.TEACHER) {
    const isAssigned = batch.teacherIds.some((entry) => toIdString(entry) === String(requester.id));
    if (!isAssigned) throw new ApiError(403, 'You are not assigned to this batch');
  }

  const result = await uploadBufferToCloudinary(file.buffer, 'coaching-app/notes');
  const fileType = MIME_TO_TYPE[file.mimetype];

  const notes = await notesRepository.create({
    title,
    batchId,
    instituteId: batch.instituteId,
    uploadedBy: requester.id,
    fileUrl: result.secure_url,
    filePublicId: result.public_id,
    fileType,
  });

  // NEW — sirf PDF ke liye RAG ingestion trigger karo (scanned images abhi
  // scope mein nahi hain). Fire-and-forget — baaki gamification/notification
  // hooks jaisa hi pattern, upload response ko block nahi karna.
  if (fileType === 'pdf') {
    agenticService
      .ingestNote({
        noteId: notes._id,
        fileUrl: notes.fileUrl,
        instituteId: notes.instituteId,
        batchId: notes.batchId,
        title: notes.title,
      })
      .catch((err) => console.error('NOTE INGESTION ERROR:', err.response?.data || err.message));
  }

  return notes;
};

const getBatchNotes = async (requester, batchId) => {
  await assertCanAccessBatch(requester, batchId);
  const filter = getTenantFilter(requester);
  return notesRepository.findByBatch(batchId, filter);
};

const deleteNotes = async (requester, notesId) => {
  const filter = getTenantFilter(requester);

  const notes = await notesRepository.findByIdScoped(notesId, filter);
  if (!notes) throw new ApiError(404, 'Notes not found');

  await cloudinary.uploader.destroy(notes.filePublicId);
  await notesRepository.deleteById(notesId);

  // NEW — vector chunks bhi clean karo, warna stale data reh jayega.
  agenticService
    .deleteNoteChunks(notesId)
    .catch((err) => console.error('NOTE CHUNK DELETE ERROR:', err.response?.data || err.message));
};

module.exports = { uploadNotes, getBatchNotes, deleteNotes };