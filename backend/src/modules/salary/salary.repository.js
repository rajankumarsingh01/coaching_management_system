const Salary = require('./salary.model');

const create = (data) => Salary.create(data);

const findById = (id) => Salary.findById(id);

const findByIdScoped = (id, filter = {}) => Salary.findOne({ _id: id, ...filter });

// Admin ka "all salaries" list view — optional month/year/teacherId filters ke saath
const findAll = (filter = {}) =>
  Salary.find(filter)
    .populate('teacherId', 'name email')
    .sort({ year: -1, month: -1 });

// Ek teacher ka poora salary history (sabse naya mahina sabse upar)
const findByTeacher = (teacherId, filter = {}) =>
  Salary.find({ teacherId, ...filter }).sort({ year: -1, month: -1 });

const updateById = (id, data) => Salary.findByIdAndUpdate(id, data, { new: true });

module.exports = {
  create,
  findById,
  findByIdScoped,
  findAll,
  findByTeacher,
  updateById,
};
