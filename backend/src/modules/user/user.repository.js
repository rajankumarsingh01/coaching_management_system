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

const updateRefreshToken = (id, refreshToken) =>
  User.findByIdAndUpdate(id, { refreshToken }, { new: true });

const findAll = (filter = {}) => User.find(filter);

module.exports = {
  create,
  findByEmail,
  findById,
  updateRefreshToken,
  findAll,
};