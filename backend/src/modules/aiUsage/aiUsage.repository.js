const AiUsage = require('./aiUsage.model');

const countTodayByUserAndType = (userId, type) => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return AiUsage.countDocuments({ userId, type, createdAt: { $gte: start, $lte: end } });
};

const create = (data) => AiUsage.create(data);

module.exports = { countTodayByUserAndType, create };