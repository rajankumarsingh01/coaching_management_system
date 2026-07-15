const Batch = require('./batch.model');

const create = (data) => Batch.create(data);

const findById = (id) => Batch.findById(id);

const findAll = (filter = {}) =>
  Batch.find(filter).populate('teacherIds', 'name email').populate('studentIds', 'name email');

// Fixed: was missing .populate() — mobile "Mark Attendance" and admin-web
// "Batch Detail" screens both rely on this returning full student/teacher
// objects (name, email), not just raw ObjectIds.
const findByIdScoped = (id, filter = {}) =>
  Batch.findOne({ _id: id, ...filter })
    .populate('teacherIds', 'name email')
    .populate('studentIds', 'name email');

const updateById = (id, data) => Batch.findByIdAndUpdate(id, data, { new: true });

const deleteById = (id) => Batch.findByIdAndUpdate(id, { isActive: false }, { new: true });

const addStudent = (batchId, studentId) =>
  Batch.findByIdAndUpdate(batchId, { $addToSet: { studentIds: studentId } }, { new: true });

const addTeacher = (batchId, teacherId) =>
  Batch.findByIdAndUpdate(batchId, { $addToSet: { teacherIds: teacherId } }, { new: true });

// Institute ke saare active batches me ek hi baar me teacherId add kar deta hai —
// "assign teacher to all batches" feature ke liye. $addToSet duplicate nahi banata,
// isliye ye safe hai chahe teacher pehle se kuch batches me ho.
const addTeacherToAllBatches = (instituteId, teacherId) =>
  Batch.updateMany({ instituteId, isActive: true }, { $addToSet: { teacherIds: teacherId } });

// Sirf _id + name — light-weight list, teacher.batchIds sync karne aur response
// dikhane ke liye kaafi hai, poora populate karne ki zarurat nahi.
const findActiveByInstitute = (instituteId) =>
  Batch.find({ instituteId, isActive: true }).select('_id name subject');

module.exports = {
  create,
  findById,
  findAll,
  findByIdScoped,
  updateById,
  deleteById,
  addStudent,
  addTeacher,
  addTeacherToAllBatches,
  findActiveByInstitute,
};

