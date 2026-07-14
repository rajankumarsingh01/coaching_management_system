const ApiError = require('../../utils/ApiError');
const resultRepository = require('./result.repository');
const testRepository = require('../test/test.repository');
const { ROLES } = require('../../config/constants');
const gamificationService = require('../gamification/gamification.service');
const { assertCanAccessBatch } = require('../../utils/ownershipGuard');
const { getTenantFilter } = require('../../utils/tenantFilter');


const submitTest = async (requester, testId, answers) => {
  const existing = await resultRepository.findByStudentAndTest(requester.id, testId);
  if (existing) {
    throw new ApiError(400, 'You have already submitted this test');
  }

const filter = getTenantFilter(requester);
  const test = await testRepository.findByIdScoped(testId, { ...filter, isPublished: true });
  if (!test) throw new ApiError(404, 'Test not found or not published');

  const answerMap = new Map(answers.map((a) => [a.questionId, a.selectedAnswer]));

  let score = 0;
  const gradedAnswers = test.questions.map((q) => {
    const selected = answerMap.get(String(q._id)) ?? null;
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) score += 1;
    return { questionId: q._id, selectedAnswer: selected, isCorrect, topic: q.topic };
  });

  const totalQuestions = test.questions.length;
  const percentage = totalQuestions === 0 ? 0 : Math.round((score / totalQuestions) * 100);

  const result = await resultRepository.create({
    studentId: requester.id,
    testId,
    batchId: test.batchId,
    instituteId: test.instituteId,
    answers: gradedAnswers,
    score,
    totalQuestions,
    percentage,
  });

  // Gamification hooks — fire-and-forget, never block the response
  gamificationService.recordActivity(requester.id, test.instituteId).catch(() => {});
  gamificationService.checkTestMasterBadge(requester.id, test.instituteId, percentage).catch(() => {});

  return result;
};

const getTestResults = async (requester, testId) => {
 const filter = getTenantFilter(requester);
  return resultRepository.findByTest(testId, filter);
};

const getMyResults = async (requester) => {
const filter = getTenantFilter(requester);
  return resultRepository.findByStudent(requester.id, filter);
};

// Batch-wise leaderboard — ranks students by average percentage across all their results in this batch
const getLeaderboard = async (requester, batchId) => {
  await assertCanAccessBatch(requester, batchId);   // 👈 NAYI LINE

  
  const filter = getTenantFilter(requester);
  const Result = require('./result.model');

  const results = await Result.find({ batchId, ...filter }).populate('studentId', 'name email');

  const byStudent = {};
  results.forEach((r) => {
    const id = String(r.studentId._id);
    if (!byStudent[id]) {
      byStudent[id] = { name: r.studentId.name, totalPercentage: 0, testsCount: 0 };
    }
    byStudent[id].totalPercentage += r.percentage;
    byStudent[id].testsCount += 1;
  });

  const leaderboard = Object.values(byStudent)
    .map((s) => ({ ...s, averagePercentage: Math.round(s.totalPercentage / s.testsCount) }))
    .sort((a, b) => b.averagePercentage - a.averagePercentage);

  return leaderboard;
};

// Weak Topic Detector — aggregates topic-wise correctness across all of a student's results
const getWeakTopics = async (requester, studentId) => {
  const filter = getTenantFilter(requester);
  const results = await resultRepository.findByStudent(studentId, filter);

  const topicStats = {};
  results.forEach((result) => {
    result.answers.forEach((a) => {
      if (!topicStats[a.topic]) {
        topicStats[a.topic] = { correct: 0, total: 0 };
      }
      topicStats[a.topic].total += 1;
      if (a.isCorrect) topicStats[a.topic].correct += 1;
    });
  });

  const topics = Object.entries(topicStats).map(([topic, stats]) => ({
    topic,
    correct: stats.correct,
    total: stats.total,
    percentage: Math.round((stats.correct / stats.total) * 100),
  }));

  // weak = below 50% accuracy, sorted worst-first
  const weakTopics = topics.filter((t) => t.percentage < 50).sort((a, b) => a.percentage - b.percentage);

  return { allTopics: topics, weakTopics };
};

module.exports = { submitTest, getTestResults, getMyResults, getLeaderboard, getWeakTopics };