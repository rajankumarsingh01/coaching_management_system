const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    dueDate: { type: Date, required: true },
    attachmentUrl: { type: String, default: '' },
    attachmentPublicId: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Homework', homeworkSchema);