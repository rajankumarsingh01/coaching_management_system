const { z } = require('zod');

const createInstituteSchema = z.object({
  body: z.object({
    instituteName: z.string().min(2, 'Institute name must be at least 2 characters'),
    instituteCode: z.string().min(2, 'Institute code must be at least 2 characters'),
    adminName: z.string().min(2, 'Admin name must be at least 2 characters'),
    adminEmail: z.string().email('Invalid admin email'),
    adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

module.exports = { createInstituteSchema };