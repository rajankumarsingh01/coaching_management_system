const mongoose = require('mongoose');

const FEE_STATUS = Object.freeze({
  PAID: 'paid',
  PENDING: 'pending',
  DUE: 'due',
});

const feeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    amount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(FEE_STATUS), default: FEE_STATUS.PENDING },
    dueDate: { type: Date, required: true },
    paidDate: { type: Date, default: null },
    remarks: { type: String, default: '' },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    paymentMethod: { type: String, enum: ['manual', 'razorpay'], default: 'manual' },
    razorpayOrderId: { type: String, default: null },
    razorpayPaymentId: { type: String, default: null },
    razorpaySignature: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Fee', feeSchema);
module.exports.FEE_STATUS = FEE_STATUS;