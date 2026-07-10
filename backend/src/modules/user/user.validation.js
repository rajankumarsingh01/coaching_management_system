const { z } = require('zod');
const { ROLES } = require('../../config/constants');

// instituteId is deliberately NOT accepted from the request body — it is always
// derived server-side from req.user.instituteId (the admin creating the user),
// so a tenant admin can never plant a user into another institute.
const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]),
    parentId: z.string().optional(),
    batchIds: z.array(z.string()).optional(),
  }),
});

module.exports = { registerSchema };