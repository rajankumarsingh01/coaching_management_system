const Batch = require('./batch.model');

const create = (data) => Batch.create(data);

const findById = (id) => Batch.findById(id);

// filter always includes instituteId scoping (or {} for super_admin) passed in from the service layer
const findAll = (filter = {}) => Batch.find(filter).populate('teacherIds', 'name email').populate('studentIds', 'name email');

const findByIdScoped = (id, filter = {}) => Batch.findOne({ _id: id, ...filter });

const updateById = (id, data) => Batch.findByIdAndUpdate(id, data, { new: true });

const deleteById = (id) => Batch.findByIdAndUpdate(id, { isActive: false }, { new: true });

const addStudent = (batchId, studentId) =>
  Batch.findByIdAndUpdate(batchId, { $addToSet: { studentIds: studentId } }, { new: true });

const addTeacher = (batchId, teacherId) =>
  Batch.findByIdAndUpdate(batchId, { $addToSet: { teacherIds: teacherId } }, { new: true });

module.exports = {
  create,
  findById,
  findAll,
  findByIdScoped,
  updateById,
  deleteById,
  addStudent,
  addTeacher,
};



















// const Batch = require('./batch.model');

// /*
// |--------------------------------------------------------------------------
// | Repository Layer
// |--------------------------------------------------------------------------
// |
// | Repository ka sirf ek hi kaam hota hai:
// | 👉 Database (MongoDB) se baat karna.
// |
// | Ye file:
// | ✔ Data Create karti hai.
// | ✔ Data Read karti hai.
// | ✔ Data Update karti hai.
// | ✔ Data Delete (Soft Delete) karti hai.
// |
// | Is file me kabhi bhi:
// | ❌ Validation nahi hogi.
// | ❌ Business Logic nahi hoga.
// | ❌ Role Check nahi hoga.
// | ❌ Authentication nahi hogi.
// |
// | Ye sab Service Layer ka kaam hai.
// |
// | Flow:
// |
// | Controller
// |      ↓
// | Service
// |      ↓
// | Repository
// |      ↓
// | MongoDB
// |
// */

// /*
// |--------------------------------------------------------------------------
// | Create Batch
// |--------------------------------------------------------------------------
// |
// | 'data' function ka parameter hai.
// | Ye Repository khud nahi banati.
// |
// | Service Layer jab create() call karti hai tab jo object bhejti hai,
// | wahi object 'data' me receive hota hai.
// |
// | Example:
// |
// | batchRepository.create({
// |    name: "JEE Morning",
// |    subject: "Physics",
// |    instituteId: "123"
// | })
// |
// | Yaha 'data' ki value hogi:
// |
// | {
// |   name: "JEE Morning",
// |   subject: "Physics",
// |   instituteId: "123"
// | }
// |
// | Batch.create() Mongoose ka built-in function hai jo document ko
// | MongoDB me save karta hai.
// |
// */
// const create = (data) => Batch.create(data);

// /*
// |--------------------------------------------------------------------------
// | Find Batch By ID
// |--------------------------------------------------------------------------
// |
// | MongoDB se _id ke basis par ek batch return karta hai.
// |
// */
// const findById = (id) => Batch.findById(id);

// /*
// |--------------------------------------------------------------------------
// | Find All Batches
// |--------------------------------------------------------------------------
// |
// | filter = MongoDB Query Condition
// |
// | Example:
// |
// | {}
// | → Sab batches return honge.
// |
// | { instituteId: "123" }
// | → Sirf institute 123 ke batches return honge.
// |
// | filter Service Layer se aata hai.
// | Repository sirf us filter ko MongoDB ko pass karti hai.
// |
// | populate() ka kaam:
// |
// | teacherIds me sirf ObjectId hota hai.
// |
// | Example:
// | teacherIds: ["6873abc..."]
// |
// | populate() ke baad:
// |
// | teacherIds: [
// |   {
// |     name: "Rajan",
// |     email: "abc@gmail.com"
// |   }
// | ]
// |
// | Matlab ObjectId ki jagah actual document ka selected data mil jata hai.
// |
// */
// const findAll = (filter = {}) =>
//   Batch.find(filter)
//     .populate('teacherIds', 'name email')
//     .populate('studentIds', 'name email');

// /*
// |--------------------------------------------------------------------------
// | Find Batch By ID With Scope
// |--------------------------------------------------------------------------
// |
// | Ye tab use hota hai jab sirf specific institute ka batch hi access
// | karna ho.
// |
// | Example:
// |
// | Batch.findOne({
// |    _id: batchId,
// |    instituteId: req.user.instituteId
// | })
// |
// | Agar batch kisi dusre institute ka hua to null return hoga.
// |
// */
// const findByIdScoped = (id, filter = {}) =>
//   Batch.findOne({ _id: id, ...filter });

// /*
// |--------------------------------------------------------------------------
// | Update Batch
// |--------------------------------------------------------------------------
// |
// | batchId ke basis par batch update karta hai.
// |
// | new:true
// | → Updated document return karega.
// |
// | Agar new:true nahi likhenge to old document return hoga.
// |
// */
// const updateById = (id, data) =>
//   Batch.findByIdAndUpdate(id, data, { new: true });

// /*
// |--------------------------------------------------------------------------
// | Soft Delete Batch
// |--------------------------------------------------------------------------
// |
// | Batch database se delete nahi hota.
// |
// | Sirf:
// | isActive = false
// |
// | Isko Soft Delete kehte hain.
// |
// */
// const deleteById = (id) =>
//   Batch.findByIdAndUpdate(id, { isActive: false }, { new: true });

// /*
// |--------------------------------------------------------------------------
// | Add Student Into Batch
// |--------------------------------------------------------------------------
// |
// | Parameters:
// |
// | batchId   → Kis batch me student add karna hai.
// | studentId → Kis student ko add karna hai.
// |
// | $addToSet MongoDB operator hai.
// |
// | Difference:
// |
// | $push
// | → Duplicate allow karta hai.
// |
// | $addToSet
// | → Duplicate allow nahi karta.
// |
// | Example:
// |
// | studentIds = [101,102]
// |
// | addStudent(batchId,103)
// |
// | Result:
// |
// | [101,102,103]
// |
// | Agar 103 dobara bheja:
// |
// | Result:
// |
// | [101,102,103]
// |
// | Duplicate add nahi hoga.
// |
// */
// const addStudent = (batchId, studentId) =>
//   Batch.findByIdAndUpdate(
//     batchId,
//     { $addToSet: { studentIds: studentId } },
//     { new: true }
//   );

// /*
// |--------------------------------------------------------------------------
// | Add Teacher Into Batch
// |--------------------------------------------------------------------------
// |
// | Ye addStudent() jaisa hi kaam karta hai.
// |
// | Sirf difference itna hai ki teacherIds array update hoti hai.
// |
// */
// const addTeacher = (batchId, teacherId) =>
//   Batch.findByIdAndUpdate(
//     batchId,
//     { $addToSet: { teacherIds: teacherId } },
//     { new: true }
//   );

// module.exports = {
//   create,
//   findById,
//   findAll,
//   findByIdScoped,
//   updateById,
//   deleteById,
//   addStudent,
//   addTeacher,
// };