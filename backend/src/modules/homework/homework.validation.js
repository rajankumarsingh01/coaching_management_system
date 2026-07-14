const { z } = require('zod');

const createHomeworkSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().optional(),
    batchId: z.string().min(1, 'batchId is required'),
    dueDate: z.string().min(1, 'dueDate is required'),
  }),
});

module.exports = { createHomeworkSchema };