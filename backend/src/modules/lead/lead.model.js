const mongoose = require('mongoose');
const { LEAD_STATUS } = require('../../config/constants');

const noteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true, default: '' },
    source: {
      type: String,
      enum: ['walk_in', 'referral', 'social_media', 'website', 'other'],
      default: 'other',
    },
    interestedSubject: { type: String, trim: true, default: '' },
    interestedBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.NEW,
    },
    followUpDate: { type: Date, default: null },
    notes: [noteSchema],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    // Jab lead enroll ho jaye aur uska actual student account bana diya jaye,
    // yahan link kar diya jaata hai — trace karne ke liye ki yeh lead se aaya student hai.
    convertedStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);