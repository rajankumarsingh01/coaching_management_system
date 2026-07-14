const User = require('./user.model');

const create = (data) => User.create(data);

const findByEmail = (email, withPassword = false) => {
  const query = User.findOne({ email });
  if (withPassword) query.select('+password');
  return query;
};

const findById = (id, withRefreshToken = false) => {
  const query = User.findById(id);
  if (withRefreshToken) query.select('+refreshToken');
  return query;
};

// NEW — scoped lookup, so an admin can never touch a user outside their institute
const findByIdScoped = (id, filter = {}) => User.findOne({ _id: id, ...filter });

// NEW
const updateById = (id, data) => User.findByIdAndUpdate(id, data, { new: true });

const updateRefreshToken = (id, refreshToken) =>
  User.findByIdAndUpdate(id, { refreshToken }, { new: true });

const findAll = (filter = {}) => User.find(filter);

module.exports = {
  create,
  findByEmail,
  findById,
  findByIdScoped,   // 👈 new export
  updateById,        // 👈 new export
  updateRefreshToken,
  findAll,
};