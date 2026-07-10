// const User = require('./user.model');

// const create = (data) => User.create(data);

// const findByEmail = (email, withPassword = false) => {
//   const query = User.findOne({ email });
//   if (withPassword) query.select('+password');
//   return query;
// };

// const findById = (id, withRefreshToken = false) => {
//   const query = User.findById(id);
//   if (withRefreshToken) query.select('+refreshToken');
//   return query;
// };

// const updateRefreshToken = (id, refreshToken) =>
//   User.findByIdAndUpdate(id, { refreshToken }, { new: true });

// const findAll = (filter = {}) => User.find(filter);

// module.exports = {
//   create,
//   findByEmail,
//   findById,
//   updateRefreshToken,
//   findAll,
// };








const User = require('./user.model');

// Create a new user document in MongoDB
const create = (data) => User.create(data);

// Find user by email
// By default password is NOT returned because password field has select:false
// Pass withPassword=true when password is needed (e.g. Login)
const findByEmail = (email, withPassword = false) => {
  const query = User.findOne({ email });

  // Explicitly include password in the result
  if (withPassword) query.select('+password');

  return query;
};

// Find user by MongoDB ObjectId
// By default refreshToken is NOT returned because refreshToken has select:false
// Pass withRefreshToken=true when verifying refresh token
const findById = (id, withRefreshToken = false) => {
  const query = User.findById(id);

  // Explicitly include refreshToken in the result
  if (withRefreshToken) query.select('+refreshToken');

  return query;
};

// Save or remove user's refresh token
// Login  -> store generated refresh token
// Logout -> set refreshToken to null
// { new: true } returns the updated document instead of the old one
const updateRefreshToken = (id, refreshToken) =>
  User.findByIdAndUpdate(
    id,
    { refreshToken },
    { new: true }
  );

// Get all users
// Optional filter can be passed
// Example:
// findAll()                     -> All users
// findAll({ role: 'teacher' })  -> Only teachers
// findAll({ instituteId })      -> Users of one institute
const findAll = (filter = {}) => User.find(filter);

module.exports = {
  create,
  findByEmail,
  findById,
  updateRefreshToken,
  findAll,
};
