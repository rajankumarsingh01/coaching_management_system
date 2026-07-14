const CalendarEvent = require('./calendar.model');

const create = (data) => CalendarEvent.create(data);

const findByIdScoped = (id, filter = {}) => CalendarEvent.findOne({ _id: id, ...filter });

// Returns events that are either institute-wide (batchId: null) or scoped to the given batch(es)
const findForUser = (filter, batchIds = []) =>
  CalendarEvent.find({
    ...filter,
    $or: [{ batchId: null }, { batchId: { $in: batchIds } }],
  }).sort({ date: 1 });

const findAllForInstitute = (filter = {}) => CalendarEvent.find(filter).sort({ date: 1 });

const deleteById = (id) => CalendarEvent.findByIdAndDelete(id);

module.exports = { create, findByIdScoped, findForUser, findAllForInstitute, deleteById };