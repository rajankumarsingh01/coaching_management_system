const { z } = require('zod');

const createFeeSchema = z.object({
  body: z.object({
    studentId: z.string().min(1, 'studentId is required'),
    batchId: z.string().min(1, 'batchId is required'),
    amount: z.number().positive('amount must be greater than 0'),
    dueDate: z.string().min(1, 'dueDate is required'),
    remarks: z.string().optional(),
  }),
});

const markPaidSchema = z.object({
  body: z.object({
    remarks: z.string().optional(),
  }),
});

const verifyPaymentSchema = z.object({
  body: z.object({
    feeId: z.string().min(1, 'feeId is required'),
    razorpay_order_id: z.string().min(1),
    razorpay_payment_id: z.string().min(1),
    razorpay_signature: z.string().min(1),
  }),
});

module.exports = { createFeeSchema, markPaidSchema, verifyPaymentSchema };