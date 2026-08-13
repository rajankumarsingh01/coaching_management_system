const mongoose = require('mongoose');

const doubtSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    subject: { type: String, default: '' },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doubt', doubtSchema);