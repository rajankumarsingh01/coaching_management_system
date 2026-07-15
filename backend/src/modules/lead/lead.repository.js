const Lead = require('./lead.model');

const create = (data) => Lead.create(data);

const findById = (id) => Lead.findById(id);

const findByIdScoped = (id, filter = {}) =>
  Lead.findOne({ _id: id, ...filter })
    .populate('assignedTo', 'name email')
    .populate('interestedBatchId', 'name subject')
    .populate('convertedStudentId', 'name email');

const findAll = (filter = {}) =>
  Lead.find(filter)
    .populate('assignedTo', 'name email')
    .populate('interestedBatchId', 'name subject')
    .sort({ createdAt: -1 });

const updateById = (id, data) => Lead.findByIdAndUpdate(id, data, { new: true });

const addNote = (id, note) =>
  Lead.findByIdAndUpdate(id, { $push: { notes: note } }, { new: true });

const deleteById = (id) => Lead.findByIdAndUpdate(id, { isActive: false }, { new: true });

// Follow-up reminder view ke liye — jinka followUpDate aaj ya usse pehle hai
// aur jo abhi tak enrolled/lost nahi hue (active pipeline me hain)
const findFollowUpsDue = (filter = {}) =>
  Lead.find({
    ...filter,
    followUpDate: { $lte: new Date() },
    status: { $nin: ['enrolled', 'lost'] },
    isActive: true,
  })
    .populate('assignedTo', 'name email')
    .sort({ followUpDate: 1 });

module.exports = {
  create,
  findById,
  findByIdScoped,
  findAll,
  updateById,
  addNote,
  deleteById,
  findFollowUpsDue,
};