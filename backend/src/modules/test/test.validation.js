const { z } = require('zod');

const createTestSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    batchId: z.string().min(1, 'batchId is required'),
    durationMinutes: z.number().positive('Duration must be greater than 0'),
  }),
});

const addQuestionSchema = z.object({
  body: z.object({
    questionText: z.string().min(3, 'Question text is required'),
    optionA: z.string().min(1),
    optionB: z.string().min(1),
    optionC: z.string().min(1),
    optionD: z.string().min(1),
    correctAnswer: z.enum(['A', 'B', 'C', 'D']),
    topic: z.string().optional(),
  }),
});

// Used internally to validate each row of a bulk Excel/CSV upload
const bulkQuestionRowSchema = z.object({
  Question: z.string().min(3, 'Question text is required'),
  'Option A': z.string().min(1, 'Option A is required'),
  'Option B': z.string().min(1, 'Option B is required'),
  'Option C': z.string().min(1, 'Option C is required'),
  'Option D': z.string().min(1, 'Option D is required'),
  'Correct Answer': z.enum(['A', 'B', 'C', 'D'], {
    errorMap: () => ({ message: 'Correct Answer must be A, B, C, or D' }),
  }),
  Topic: z.string().optional(),
});

const generateQuestionsSchema = z.object({
  body: z.object({
    topic: z.string().min(2, 'Topic is required'),
    count: z.number().int().min(1).max(10),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  }),
});

const addGeneratedQuestionsSchema = z.object({
  body: z.object({
    questions: z
      .array(
        z.object({
          questionText: z.string().min(3),
          optionA: z.string().min(1),
          optionB: z.string().min(1),
          optionC: z.string().min(1),
          optionD: z.string().min(1),
          correctAnswer: z.enum(['A', 'B', 'C', 'D']),
          topic: z.string().optional(),
        })
      )
      .min(1, 'At least one question is required'),
  }),
});

module.exports = { createTestSchema, addQuestionSchema, bulkQuestionRowSchema, generateQuestionsSchema, addGeneratedQuestionsSchema };

