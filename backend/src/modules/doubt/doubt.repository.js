const Doubt = require('./doubt.model');

const create = (data) => Doubt.create(data);

const findByStudent = (studentId) =>
  Doubt.find({ studentId }).sort({ createdAt: -1 }).limit(30);

module.exports = { create, findByStudent };