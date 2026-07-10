const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subject: { type: String, trim: true, default: '' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Batch', batchSchema);