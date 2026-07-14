const mongoose = require('mongoose');

const BADGE_TYPES = Object.freeze({
  STREAK_7: 'streak_7',
  STREAK_30: 'streak_30',
  TEST_MASTER: 'test_master', // scored 90%+ on any test
  HOMEWORK_HERO: 'homework_hero', // submitted 10 homeworks on time
  PERFECT_ATTENDANCE: 'perfect_attendance', // 100% attendance in a month
});

const BADGE_LABELS = Object.freeze({
  [BADGE_TYPES.STREAK_7]: { label: '7-Day Streak', icon: '🔥' },
  [BADGE_TYPES.STREAK_30]: { label: '30-Day Streak', icon: '⚡' },
  [BADGE_TYPES.TEST_MASTER]: { label: 'Test Master', icon: '🏆' },
  [BADGE_TYPES.HOMEWORK_HERO]: { label: 'Homework Hero', icon: '📚' },
  [BADGE_TYPES.PERFECT_ATTENDANCE]: { label: 'Perfect Attendance', icon: '🎯' },
});

const badgeSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    type: { type: String, enum: Object.values(BADGE_TYPES), required: true },
    earnedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// A student can only earn each badge once
badgeSchema.index({ studentId: 1, type: 1 }, { unique: true });

module.exports = mongoose.model('Badge', badgeSchema);
module.exports.BADGE_TYPES = BADGE_TYPES;
module.exports.BADGE_LABELS = BADGE_LABELS;