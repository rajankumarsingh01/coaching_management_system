const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true, trim: true },
    optionA: { type: String, required: true },
    optionB: { type: String, required: true },
    optionC: { type: String, required: true },
    optionD: { type: String, required: true },
    correctAnswer: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    topic: { type: String, default: 'General', trim: true },
  },
  { _id: true }
);

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    durationMinutes: { type: Number, required: true, min: 1 },
    questions: [questionSchema],
    isPublished: { type: Boolean, default: false }, // students can only see/attempt published tests
  },
  { timestamps: true }
);

module.exports = mongoose.model('Test', testSchema);