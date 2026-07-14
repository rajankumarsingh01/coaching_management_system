const Homework = require('./homework.model');

const create = (data) => Homework.create(data);

const findByIdScoped = (id, filter = {}) => Homework.findOne({ _id: id, ...filter });

const findByBatch = (batchId, filter = {}) =>
  Homework.find({ batchId, ...filter }).populate('createdBy', 'name').sort({ dueDate: -1 });

const deleteById = (id) => Homework.findByIdAndDelete(id);

module.exports = { create, findByIdScoped, findByBatch, deleteById };