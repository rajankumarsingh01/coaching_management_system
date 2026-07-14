const gamificationRepository = require('./gamification.repository');
const { BADGE_TYPES, BADGE_LABELS } = require('./badge.model');
const notificationService = require('../notification/notification.service');

const isSameDay = (d1, d2) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const isYesterday = (lastDate, today) => {
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  return isSameDay(lastDate, yesterday);
};

// Called whenever a student does a "streak-counting" action (e.g. attempts a
// test, submits homework, or opens the app on a given day) — increments the
// streak if this is a new calendar day, resets it if a day was missed.
const recordActivity = async (studentId, instituteId) => {
  const streak = await gamificationRepository.findOrCreateStreak(studentId, instituteId);
  const today = new Date();

  if (streak.lastActiveDate && isSameDay(new Date(streak.lastActiveDate), today)) {
    // already recorded today — no change
    return streak;
  }

  let newCurrentStreak;
  if (streak.lastActiveDate && isYesterday(new Date(streak.lastActiveDate), today)) {
    newCurrentStreak = streak.currentStreak + 1;
  } else {
    newCurrentStreak = 1; // missed a day (or first ever activity) — restart
  }

  const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

  const updated = await gamificationRepository.updateStreak(studentId, {
    currentStreak: newCurrentStreak,
    longestStreak: newLongestStreak,
    lastActiveDate: today,
  });

  // Check streak-based badge milestones
  if (newCurrentStreak === 7) {
    await awardBadgeAndNotify(studentId, instituteId, BADGE_TYPES.STREAK_7);
  }
  if (newCurrentStreak === 30) {
    await awardBadgeAndNotify(studentId, instituteId, BADGE_TYPES.STREAK_30);
  }

  return updated;
};

const awardBadgeAndNotify = async (studentId, instituteId, type) => {
  const badge = await gamificationRepository.awardBadge(studentId, instituteId, type);
  if (badge) {
    const label = BADGE_LABELS[type];
    notificationService
      .sendToUser(studentId, {
        title: 'New Badge Earned! 🎉',
        body: `You earned the "${label.label}" badge ${label.icon}`,
        data: { type: 'badge', badgeType: type },
      })
      .catch(() => {});
  }
};

// Called after a test result is submitted (score >= 90%)
const checkTestMasterBadge = async (studentId, instituteId, percentage) => {
  if (percentage >= 90) {
    await awardBadgeAndNotify(studentId, instituteId, BADGE_TYPES.TEST_MASTER);
  }
};

// Called after an on-time homework submission — checks if this is the 10th one
const checkHomeworkHeroBadge = async (studentId, instituteId, onTimeSubmissionCount) => {
  if (onTimeSubmissionCount >= 10) {
    await awardBadgeAndNotify(studentId, instituteId, BADGE_TYPES.HOMEWORK_HERO);
  }
};

const getStudentGamificationProfile = async (studentId, instituteId) => {
  const streak = await gamificationRepository.findOrCreateStreak(studentId, instituteId);
  const badges = await gamificationRepository.findBadgesByStudent(studentId);

  const badgesWithLabels = badges.map((b) => ({
    type: b.type,
    label: BADGE_LABELS[b.type]?.label || b.type,
    icon: BADGE_LABELS[b.type]?.icon || '🏅',
    earnedAt: b.earnedAt,
  }));

  return {
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    lastActiveDate: streak.lastActiveDate,
    badges: badgesWithLabels,
  };
};

module.exports = {
  recordActivity,
  checkTestMasterBadge,
  checkHomeworkHeroBadge,
  getStudentGamificationProfile,
};