const mongoose = require('mongoose');
const Result = require('./result.model');

const create = (data) => Result.create(data);

const findByStudentAndTest = (studentId, testId) => Result.findOne({ studentId, testId });

const findByTest = (testId, filter = {}) =>
  Result.find({ testId, ...filter }).populate('studentId', 'name email').sort({ score: -1 });

const findByStudent = (studentId, filter = {}) =>
  Result.find({ studentId, ...filter }).populate('testId', 'title').sort({ createdAt: -1 });

// Used when a Test is deleted — cleans up orphaned Result records so
// students' /results/me never has to deal with a null-populated testId.
const deleteByTest = (testId) => Result.deleteMany({ testId });


const getBatchTopicStats = (batchId, filter = {}) =>
  Result.aggregate([
    { $match: { batchId: new mongoose.Types.ObjectId(batchId), ...filter } },
    { $unwind: '$answers' },
    {
      $group: {
        _id: '$answers.topic',
        total: { $sum: 1 },
        correct: { $sum: { $cond: ['$answers.isCorrect', 1, 0] } },
      },
    },
  ]);

module.exports = {
  create,
  findByStudentAndTest,
  findByTest,
  findByStudent,
  deleteByTest,
  getBatchTopicStats, // 👈 new
};