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

module.exports = { create, findByStudentAndTest, findByTest, findByStudent, deleteByTest };