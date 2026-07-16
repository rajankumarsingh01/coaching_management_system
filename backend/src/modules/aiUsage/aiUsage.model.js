const mongoose = require('mongoose');

// Har AI call ka ek log row — chahe doubt-solving ho ya question-generation.
// Isi se daily count nikalta hai, koi alag counter/cron reset ki zarurat nahi —
// bas "aaj" ki date range se count kar lo.
const aiUsageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    type: { type: String, enum: ['doubt', 'question_generation'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AiUsage', aiUsageSchema);