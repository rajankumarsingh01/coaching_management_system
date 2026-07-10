const Institute = require('./institute.model');

const create = (data) => Institute.create(data);

const findAll = () => Institute.find();

const findById = (id) => Institute.findById(id);

const findByCode = (code) => Institute.findOne({ code });

module.exports = { create, findAll, findById, findByCode };