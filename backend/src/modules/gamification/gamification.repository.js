const Streak = require('./streak.model');
const Badge = require('./badge.model');

const findOrCreateStreak = async (studentId, instituteId) => {
  let streak = await Streak.findOne({ studentId });
  if (!streak) {
    streak = await Streak.create({ studentId, instituteId, currentStreak: 0, longestStreak: 0 });
  }
  return streak;
};

const updateStreak = (studentId, updates) =>
  Streak.findOneAndUpdate({ studentId }, updates, { new: true, upsert: true });

const findBadgesByStudent = (studentId) => Badge.find({ studentId }).sort({ earnedAt: -1 });

const hasBadge = async (studentId, type) => {
  const existing = await Badge.findOne({ studentId, type });
  return !!existing;
};

const awardBadge = async (studentId, instituteId, type) => {
  try {
    return await Badge.create({ studentId, instituteId, type });
  } catch (err) {
    // duplicate key (already has this badge) — safe to ignore
    if (err.code === 11000) return null;
    throw err;
  }
};

module.exports = { findOrCreateStreak, updateStreak, findBadgesByStudent, hasBadge, awardBadge };