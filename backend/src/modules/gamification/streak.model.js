const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null }, // last date the student did a streak-counting action
  },
  { timestamps: true }
);

module.exports = mongoose.model('Streak', streakSchema);