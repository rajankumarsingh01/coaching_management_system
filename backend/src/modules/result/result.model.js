const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    selectedAnswer: { type: String, enum: ['A', 'B', 'C', 'D', null], default: null },
    isCorrect: { type: Boolean, required: true },
    topic: { type: String, default: 'General' },
  },
  { _id: false }
);

const resultSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    testId: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    answers: [answerSchema],
    score: { type: Number, required: true }, // number of correct answers
    totalQuestions: { type: Number, required: true },
    percentage: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One attempt per student per test — prevents re-submission
resultSchema.index({ studentId: 1, testId: 1 }, { unique: true });

module.exports = mongoose.model('Result', resultSchema);