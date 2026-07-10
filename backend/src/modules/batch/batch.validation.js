const { z } = require('zod');

const createBatchSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Batch name must be at least 2 characters'),
    subject: z.string().optional(),
  }),
});

const updateBatchSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Batch name must be at least 2 characters').optional(),
    subject: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

const assignUserSchema = z.object({
  body: z.object({
    userId: z.string().min(1, 'userId is required'),
  }),
});

module.exports = { createBatchSchema, updateBatchSchema, assignUserSchema };
















// const { z } = require('zod');

// /*
// |--------------------------------------------------------------------------
// | Create Batch Validation
// |--------------------------------------------------------------------------
// |
// | Ye schema "Create Batch" API ke request body ko validate karta hai.
// |
// | Expected Body:
// |
// | {
// |   "name": "JEE Morning",
// |   "subject": "Physics"
// | }
// |
// | Rules:
// | ✔ name required hai.
// | ✔ name String hona chahiye.
// | ✔ name minimum 2 characters ka hona chahiye.
// | ✔ subject optional hai.
// | ✔ subject diya jaye to String hona chahiye.
// |
// */
// const createBatchSchema = z.object({
//   body: z.object({
//     name: z.string().min(2, 'Batch name must be at least 2 characters'),
//     subject: z.string().optional(),
//   }),
// });

// /*
// |--------------------------------------------------------------------------
// | Update Batch Validation
// |--------------------------------------------------------------------------
// |
// | Ye schema "Update Batch" API ke liye use hota hai.
// |
// | Create aur Update me difference:
// |
// | Create:
// | → name required hota hai.
// |
// | Update:
// | → Sirf wahi fields bhejni hoti hain jo update karni hain.
// |
// | Example:
// |
// | {
// |   "subject": "Chemistry"
// | }
// |
// | Ye bhi valid hai.
// |
// | Rules:
// | ✔ name optional hai.
// | ✔ subject optional hai.
// | ✔ isActive optional Boolean hai.
// |
// */
// const updateBatchSchema = z.object({
//   body: z.object({
//     name: z.string().min(2, 'Batch name must be at least 2 characters').optional(),
//     subject: z.string().optional(),
//     isActive: z.boolean().optional(),
//   }),
// });

// /*
// |--------------------------------------------------------------------------
// | Assign User Validation
// |--------------------------------------------------------------------------
// |
// | Ye schema tab use hota hai jab kisi Student ya Teacher ko
// | kisi Batch me assign kiya jata hai.
// |
// | Example API:
// |
// | POST /batch/:batchId/add-student
// |
// | URL:
// |   /batch/123/add-student
// |            ↑
// |         batchId
// |
// | Request Body:
// |
// | {
// |   "userId": "6873abcd..."
// | }
// |
// | batchId URL (req.params) se aata hai.
// | userId Request Body (req.body) se aata hai.
// |
// | Validation sirf itna check karti hai:
// | ✔ userId field present hai.
// | ✔ userId String hai.
// | ✔ Empty String ("") nahi hai.
// |
// | IMPORTANT:
// | Ye schema sirf request ka format check karta hai.
// |
// | Ye check NAHI karta:
// | ❌ user database me exist karta hai ya nahi.
// | ❌ user Teacher hai ya Student.
// | ❌ user pehle se batch me assigned hai ya nahi.
// |
// | Ye sab checks Service Layer me hote hain.
// |
// */
// const assignUserSchema = z.object({
//   body: z.object({
//     userId: z.string().min(1, 'userId is required'),
//   }),
// });

// module.exports = {
//   createBatchSchema,
//   updateBatchSchema,
//   assignUserSchema,
// };