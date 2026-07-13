const { z } = require('zod');

const uploadNotesSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    batchId: z.string().min(1, 'batchId is required'),
  }),
});

module.exports = { uploadNotesSchema };