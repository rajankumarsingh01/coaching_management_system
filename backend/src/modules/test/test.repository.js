const Test = require('./test.model');

const create = (data) => Test.create(data);

const findByIdScoped = (id, filter = {}) => Test.findOne({ _id: id, ...filter });

const findByBatch = (batchId, filter = {}) =>
  Test.find({ batchId, ...filter }).select('-questions.correctAnswer').sort({ createdAt: -1 });

// teacher/admin view — includes correct answers
const findByBatchFull = (batchId, filter = {}) => Test.find({ batchId, ...filter }).sort({ createdAt: -1 });

const addQuestions = (testId, questions) =>
  Test.findByIdAndUpdate(testId, { $push: { questions: { $each: questions } } }, { new: true });

const publish = (testId) => Test.findByIdAndUpdate(testId, { isPublished: true }, { new: true });

const deleteById = (id) => Test.findByIdAndDelete(id);

module.exports = { create, findByIdScoped, findByBatch, findByBatchFull, addQuestions, publish, deleteById };