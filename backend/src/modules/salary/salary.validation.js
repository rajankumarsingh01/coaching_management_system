const { z } = require('zod');

const createSalarySchema = z.object({
  body: z.object({
    teacherId: z.string().min(1, 'teacherId is required'),
    month: z.number().int().min(1, 'month must be between 1 and 12').max(12, 'month must be between 1 and 12'),
    year: z.number().int().min(2000, 'year is invalid'),
    baseSalary: z.number().nonnegative('baseSalary must be 0 or greater'),
    remarks: z.string().optional(),
  }),
});

const advanceSchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    amount: z.number().positive('amount must be greater than 0'),
    remarks: z.string().optional(),
  }),
});

const paySchema = z.object({
  params: z.object({ id: z.string() }),
  body: z.object({
    amount: z.number().positive('amount must be greater than 0').optional(),
    remarks: z.string().optional(),
  }),
});

module.exports = { createSalarySchema, advanceSchema, paySchema };
