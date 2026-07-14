const Submission = require('./submission.model');

const create = (data) => Submission.create(data);

const findByHomeworkAndStudent = (homeworkId, studentId) => Submission.findOne({ homeworkId, studentId });

const findByHomework = (homeworkId, filter = {}) =>
  Submission.find({ homeworkId, ...filter }).populate('studentId', 'name email').sort({ submittedAt: -1 });

const findByStudent = (studentId, filter = {}) =>
  Submission.find({ studentId, ...filter }).populate('homeworkId', 'title dueDate').sort({ submittedAt: -1 });

module.exports = { create, findByHomeworkAndStudent, findByHomework, findByStudent };