const Fee = require('./fee.model');

const create = (data) => Fee.create(data);

const findByIdScoped = (id, filter = {}) => Fee.findOne({ _id: id, ...filter });

const findById = (id) => Fee.findById(id);

const findByStudent = (studentId, filter = {}) =>
  Fee.find({ studentId, ...filter }).populate('batchId', 'name').sort({ dueDate: -1 });

const findByBatch = (batchId, filter = {}) =>
  Fee.find({ batchId, ...filter }).populate('studentId', 'name email').sort({ dueDate: 1 });

const findAllForInstitute = (filter = {}) =>
  Fee.find(filter).populate('studentId', 'name email').populate('batchId', 'name');

const updateStatus = (id, updates) => Fee.findByIdAndUpdate(id, updates, { new: true });

const findByRazorpayOrderId = (orderId) => Fee.findOne({ razorpayOrderId: orderId });

const markOverdue = (filter = {}) =>
  Fee.updateMany(
    { status: 'pending', dueDate: { $lt: new Date() }, ...filter },
    { $set: { status: 'due' } }
  );

module.exports = {
  create,
  findByIdScoped,
  findById,
  findByStudent,
  findByBatch,
  findAllForInstitute,
  updateStatus,
  findByRazorpayOrderId,
  markOverdue,
};