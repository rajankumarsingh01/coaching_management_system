const { z } = require('zod');

const submitTestSchema = z.object({
  body: z.object({
    answers: z
      .array(
        z.object({
          questionId: z.string().min(1),
          selectedAnswer: z.enum(['A', 'B', 'C', 'D']).nullable(),
        })
      )
      .min(1, 'At least one answer is required'),
  }),
});

module.exports = { submitTestSchema };