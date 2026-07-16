const { z } = require('zod');

const askDoubtSchema = z.object({
  body: z.object({
    question: z.string().min(3, 'Please type your question'),
    subject: z.string().optional(),
  }),
});

module.exports = { askDoubtSchema };