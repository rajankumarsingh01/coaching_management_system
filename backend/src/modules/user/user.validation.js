const { z } = require('zod');
const { ROLES } = require('../../config/constants');

const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    role: z.enum([ROLES.TEACHER, ROLES.STUDENT, ROLES.PARENT]),
    parentId: z.string().optional(), // only meaningful when role === student
    batchIds: z.array(z.string()).optional(),
  }),
});

module.exports = { registerSchema };