const ApiError = require('../../utils/ApiError');
const aiUsageRepository = require('./aiUsage.repository');

// Har AI feature call se pehle isse check karo — limit cross ho gayi to yahi
// se ApiError(429) throw ho jaayega, feature ka service function aage nahi badhega.
const checkAndRecordUsage = async (userId, instituteId, type, dailyLimit) => {
  const usedToday = await aiUsageRepository.countTodayByUserAndType(userId, type);
  if (usedToday >= dailyLimit) {
    throw new ApiError(
      429,
      `Aaj ke liye aapki AI limit khatam ho gayi (${dailyLimit}/din). Kal phir try karna.`
    );
  }
  await aiUsageRepository.create({ userId, instituteId, type });
  return { remaining: dailyLimit - usedToday - 1 };
};

module.exports = { checkAndRecordUsage };