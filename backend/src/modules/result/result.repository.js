const Result = require('./result.model');

const create = (data) => Result.create(data);

const findByStudentAndTest = (studentId, testId) => Result.findOne({ studentId, testId });

const findByTest = (testId, filter = {}) =>
  Result.find({ testId, ...filter }).populate('studentId', 'name email').sort({ score: -1 });

const findByStudent = (studentId, filter = {}) =>
  Result.find({ studentId, ...filter }).populate('testId', 'title').sort({ createdAt: -1 });

module.exports = { create, findByStudentAndTest, findByTest, findByStudent };