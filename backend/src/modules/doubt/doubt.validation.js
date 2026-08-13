const { z } = require('zod');

const askDoubtSchema = z.object({
  body: z.object({
    // Text-only doubt: question required (checked in service). Photo doubt: question
    // becomes an optional caption, so it must stay optional at the schema level here.
    question: z.string().optional(),
    subject: z.string().optional(),
  }),
});

module.exports = { askDoubtSchema };