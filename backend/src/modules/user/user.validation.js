const { z } = require('zod');
const { ROLES } = require('../../config/constants');

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

const updateUserSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
  body: z
    .object({
      name: z.string().min(2, 'Name must be at least 2 characters').optional(),
      email: z.string().email('Invalid email').optional(),
      batchIds: z.array(z.string()).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided to update',
    }),
});

module.exports = { registerSchema, updateUserSchema };