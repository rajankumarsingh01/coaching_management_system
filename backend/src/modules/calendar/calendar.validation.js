const { z } = require('zod');

const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    date: z.string().min(1, 'date is required'),
    type: z.enum(['test', 'holiday', 'event']).optional(),
    batchId: z.string().optional(), // omit for institute-wide events
    description: z.string().optional(),
  }),
});

module.exports = { createEventSchema };