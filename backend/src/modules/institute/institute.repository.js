const Institute = require('./institute.model');

const create = (data) => Institute.create(data);

const findAll = () => Institute.find();

const findById = (id) => Institute.findById(id);

const findByCode = (code) => Institute.findOne({ code });

// NEW — block/unblock ke liye generic update helper
const updateById = (id, data) => Institute.findByIdAndUpdate(id, data, { new: true });

module.exports = { create, findAll, findById, findByCode, updateById };