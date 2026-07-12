const { z } = require('zod');

const markAttendanceSchema = z.object({
  body: z.object({
    batchId: z.string().min(1, 'batchId is required'),
    date: z.string().min(1, 'date is required'), // ISO date string, e.g. "2026-07-11"
    records: z
      .array(
        z.object({
          studentId: z.string().min(1),
          status: z.enum(['present', 'absent', 'late']),
        })
      )
      .min(1, 'At least one attendance record is required'),
  }),
});

module.exports = { markAttendanceSchema };




