const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const batchService = require('./batch.service');

const getRequester = (req) => ({ id: req.user.id, role: req.user.role, instituteId: req.user.instituteId });

const createBatch = catchAsync(async (req, res) => {
  const batch = await batchService.createBatch(getRequester(req), req.body);
  res.status(201).json(new ApiResponse(201, batch, 'Batch created successfully'));
});

const getAllBatches = catchAsync(async (req, res) => {
  const batches = await batchService.getAllBatches(getRequester(req));
  res.status(200).json(new ApiResponse(200, batches, 'Batches fetched successfully'));
});

const getBatchById = catchAsync(async (req, res) => {
  const batch = await batchService.getBatchById(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, batch, 'Batch fetched successfully'));
});

const updateBatch = catchAsync(async (req, res) => {
  const batch = await batchService.updateBatch(getRequester(req), req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, batch, 'Batch updated successfully'));
});

const deleteBatch = catchAsync(async (req, res) => {
  await batchService.deleteBatch(getRequester(req), req.params.id);
  res.status(200).json(new ApiResponse(200, null, 'Batch deactivated successfully'));
});

const assignStudent = catchAsync(async (req, res) => {
  const batch = await batchService.assignStudent(getRequester(req), req.params.id, req.body.userId);
  res.status(200).json(new ApiResponse(200, batch, 'Student assigned to batch successfully'));
});

const assignTeacher = catchAsync(async (req, res) => {
  const batch = await batchService.assignTeacher(getRequester(req), req.params.id, req.body.userId);
  res.status(200).json(new ApiResponse(200, batch, 'Teacher assigned to batch successfully'));
});

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  assignStudent,
  assignTeacher,
};


























/*
|--------------------------------------------------------------------------
| Controller Layer
|--------------------------------------------------------------------------
|
| Controller ka kaam:
|
| 1. Client se request receive karna.
| 2. Request ka required data nikalna.
|    - req.body
|    - req.params
|    - req.query
|    - req.user
| 3. Service Layer ko call karna.
| 4. Service se response lekar client ko bhejna.
|
| Controller me kabhi bhi:
| ✘ Database Query nahi likhte.
| ✘ Business Logic nahi likhte.
| ✘ Permission Logic nahi likhte.
|
| Ye sab Service Layer ki responsibility hoti hai.
|
| Flow:
|
| Client
|    ↓
| Route
|    ↓
| Controller
|    ↓
| Service
|    ↓
| Repository
|    ↓
| MongoDB
|
*/

/*
|--------------------------------------------------------------------------
| getRequester()
|--------------------------------------------------------------------------
|
| authMiddleware request ke andar req.user attach karta hai.
|
| Example:
|
| req.user = {
|   id: "123",
|   role: "admin",
|   instituteId: "AAA"
| }
|
| Har controller function me baar-baar ye object likhne ki
| zarurat na pade isliye helper function banaya gaya hai.
|
| getRequester(req)
|
| Return:
|
| {
|   id,
|   role,
|   instituteId
| }
|
| Is object ko Service Layer me bheja jata hai.
|
| Service isi information se:
| ✔ Authorization karti hai.
| ✔ Tenant Scoping karti hai.
| ✔ Business Logic execute karti hai.
|
*/
// const getRequester = (req) => ({
//   id: req.user.id,
//   role: req.user.role,
//   instituteId: req.user.instituteId,
// });

/*
|--------------------------------------------------------------------------
| IMPORTANT JavaScript Concept (Arguments vs Parameters)
|--------------------------------------------------------------------------
|
| Function call me NAME match nahi hota.
| POSITION (order) match hoti hai.
|
| Example:
|
| function add(a, b) {}
|
| add(10, 20)
|
| a = 10
| b = 20
|
| Yaha 'a' aur 'b' naam important nahi hai.
|
| Isi tarah:
|
| Controller:
|
| batchService.createBatch(
|     getRequester(req),
|     req.body
| );
|
| Service:
|
| const createBatch = async (requester, data) => {}
|
| JavaScript internally aise match karti hai:
|
| requester = getRequester(req)
| data = req.body
|
| Agar Service me naam badal dein:
|
| const createBatch = async (abc, xyz) => {}
|
| Tab bhi:
|
| abc = getRequester(req)
| xyz = req.body
|
| Isliye function parameter ka NAME matter nahi karta.
| Sirf argument ki POSITION matter karti hai.
|
*/



// createBatch example (Without Service & Repository)


// const Batch = require('./batch.model');
// const ApiError = require('../../utils/ApiError');
// const ApiResponse = require('../../utils/ApiResponse');
// const catchAsync = require('../../utils/catchAsync');

// const createBatch = catchAsync(async (req, res) => {

//   // ============================
//   // Logged-in User ki information
//   // ============================
//   const requester = {
//     id: req.user.id,
//     role: req.user.role,
//     instituteId: req.user.instituteId,
//   };

//   // ============================
//   // Request Body se data lena
//   // ============================
//   const { name, subject } = req.body;

//   // ============================
//   // Validation / Business Logic
//   // ============================
//   if (!requester.instituteId) {
//     throw new ApiError(400, 'Requesting user has no institute context');
//   }

//   // ============================
//   // Direct Database Query
//   // ============================
//   const batch = await Batch.create({
//     name,
//     subject: subject || '',
//     instituteId: requester.instituteId,
//   });

//   // ============================
//   // Response
//   // ============================
//   res.status(201).json(
//     new ApiResponse(
//       201,
//       batch,
//       'Batch created successfully'
//     )
//   );

// });

// module.exports = { createBatch };