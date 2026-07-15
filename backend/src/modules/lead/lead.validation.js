const { z } = require('zod');
const { LEAD_STATUS } = require('../../config/constants');

const createLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string().min(6, 'Enter a valid phone number'),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    source: z.enum(['walk_in', 'referral', 'social_media', 'website', 'other']).optional(),
    interestedSubject: z.string().optional(),
    interestedBatchId: z.string().optional(),
    followUpDate: z.string().optional(), // ISO date string
  }),
});

const updateLeadSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(6).optional(),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    source: z.enum(['walk_in', 'referral', 'social_media', 'website', 'other']).optional(),
    interestedSubject: z.string().optional(),
    interestedBatchId: z.string().optional(),
    followUpDate: z.string().optional(),
    assignedTo: z.string().optional(),
  }),
});

const changeStatusSchema = z.object({
  body: z.object({
    status: z.enum(Object.values(LEAD_STATUS)),
  }),
});

const addNoteSchema = z.object({
  body: z.object({
    text: z.string().min(1, 'Note text is required'),
  }),
});

module.exports = { createLeadSchema, updateLeadSchema, changeStatusSchema, addNoteSchema };