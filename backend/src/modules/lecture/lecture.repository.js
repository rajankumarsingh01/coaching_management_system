const Lecture = require('./lecture.model');

const create = (data) => Lecture.create(data);

const findByBatch = (batchId, filter = {}) =>
  Lecture.find({ batchId, ...filter }).populate('uploadedBy', 'name').sort({ createdAt: -1 });

const findByIdScoped = (id, filter = {}) => Lecture.findOne({ _id: id, ...filter });

const deleteById = (id) => Lecture.findByIdAndDelete(id);

module.exports = { create, findByBatch, findByIdScoped, deleteById };