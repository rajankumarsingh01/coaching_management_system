const Notes = require('./notes.model');

const create = (data) => Notes.create(data);

const findByBatch = (batchId, filter = {}) =>
  Notes.find({ batchId, ...filter }).populate('uploadedBy', 'name').sort({ createdAt: -1 });

const findByIdScoped = (id, filter = {}) => Notes.findOne({ _id: id, ...filter });

const deleteById = (id) => Notes.findByIdAndDelete(id);

module.exports = { create, findByBatch, findByIdScoped, deleteById };