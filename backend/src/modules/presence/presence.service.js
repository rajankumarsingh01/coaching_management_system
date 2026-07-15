const { getPresenceSummary } = require('../../socket/socket');
const User = require('../user/user.model');

const getOnlineSummary = async (instituteId) => {
  const summary = getPresenceSummary(instituteId);

  // Sirf abhi online userIds ke liye name/role fetch — poore institute ka
  // data nahi mangwaya, sirf jo count me already hai
  const users = summary.userIds.length
    ? await User.find({ _id: { $in: summary.userIds } }).select('name role')
    : [];

  return {
    total: summary.total,
    byRole: summary.byRole,
    users: users.map((u) => ({ id: String(u._id), name: u.name, role: u.role })),
  };
};

module.exports = { getOnlineSummary };