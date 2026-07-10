const ApiError = require('../../utils/ApiError');
const batchRepository = require('./batch.repository');
const userRepository = require('../user/user.repository');
const { ROLES } = require('../../config/constants');

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
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
  return batchRepository.findAll(filter);
};

const getBatchById = async (requester, batchId) => {
  const filter = requester.role === ROLES.SUPER_ADMIN ? {} : { instituteId: requester.instituteId };
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



















// const ApiError = require('../../utils/ApiError');
// const batchRepository = require('./batch.repository');
// const userRepository = require('../user/user.repository');
// const { ROLES } = require('../../config/constants');

// /*
// |--------------------------------------------------------------------------
// | Service Layer (Business Logic Layer)
// |--------------------------------------------------------------------------
// |
// | Flow:
// |
// | Client
// |    ↓
// | Controller
// |    ↓
// | Service (Business Logic)
// |    ↓
// | Repository (Database Queries)
// |    ↓
// | MongoDB
// |
// | Service Layer ka kaam:
// | ✔ Business Logic likhna.
// | ✔ Permission check karna.
// | ✔ Role check karna.
// | ✔ Tenant (Institute) scoping karna.
// | ✔ Multiple repositories ko coordinate karna.
// | ✔ Errors throw karna.
// |
// | Service kabhi bhi directly req/res use nahi karti.
// | Controller sirf required data Service ko pass karta hai.
// |
// */

// /*
// |--------------------------------------------------------------------------
// | requester (Logged-in User)
// |--------------------------------------------------------------------------
// |
// | requester koi JavaScript keyword nahi hai.
// | Ye sirf ek normal object hai jo Controller banata hai.
// |
// | Example:
// |
// | const requester = {
// |   id: req.user.id,
// |   role: req.user.role,
// |   instituteId: req.user.instituteId,
// | };
// |
// | Ye object authMiddleware ke baad req.user se aata hai.
// |
// | JWT Payload
// |      ↓
// | authMiddleware
// |      ↓
// | req.user
// |      ↓
// | requester
// |      ↓
// | Service
// |
// | requester ka use:
// | ✔ Kis user ne request bheji?
// | ✔ User ka role kya hai?
// | ✔ User kis institute ka hai?
// |
// | Isi information ke basis par Service business decisions leti hai.
// |
// */

// /*
// |--------------------------------------------------------------------------
// | Why Filter is Used?
// |--------------------------------------------------------------------------
// |
// | Is project me Multi-Tenant Architecture use ho rahi hai.
// |
// | Example:
// |
// | Platform
// | ├── Institute A
// | ├── Institute B
// | └── Institute C
// |
// | Har institute apna data hi dekh sakta hai.
// |
// | Agar Admin Institute A ka hai,
// | to usko sirf Institute A ke batches hi dikhne chahiye.
// |
// | Isliye filter banaya jata hai.
// |
// | Admin:
// |
// | filter = {
// |   instituteId: requester.instituteId
// | }
// |
// | Super Admin:
// |
// | filter = {}
// |
// | {} ka matlab:
// | → MongoDB me koi condition nahi.
// | → Sab records return karo.
// |
// | Repository ko nahi pata hota kaun login hai.
// | Repository sirf diya hua filter MongoDB ko pass karti hai.
// |
// | Business decision (filter kya hoga?)
// | hamesha Service Layer leti hai.
// |
// */

// /*
// |--------------------------------------------------------------------------
// | Agar Filter Use Na Kare To?
// |--------------------------------------------------------------------------
// |
// | Repository:
// |
// | Batch.find({})
// |
// | Result:
// |
// | ❌ Institute A ka Admin,
// | Institute B aur C ka data bhi dekh lega.
// |
// | ❌ Kisi dusre institute ka batch update/delete bhi kar sakta hai.
// |
// | Ye bahut bada security issue hai.
// |
// | Isliye har read/update/delete operation se pehle
// | institute filter lagaya jata hai.
// |

// assign student flow

// Admin

// ↓

// assignStudent()

// ↓

// Batch verify

// ↓

// Student verify

// ↓

// Role verify

// ↓

// Institute verify

// ↓

// Batch.studentIds update

// ↓

// Student.batchIds update

// ↓

// Return Updated Batch
// */