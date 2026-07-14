const Fee = require('./fee.model');
const notificationService = require('../notification/notification.service');
const logger = require('../../utils/logger');

// Sends a push notification to every student with a 'due' (overdue) or
// soon-due 'pending' fee. Designed to be triggered by an external cron
// (e.g. Render Cron Job hitting a protected endpoint) rather than an
// in-process setInterval, since Render's free tier can sleep/restart.
const sendFeeDueReminders = async () => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const feesToRemind = await Fee.find({
    status: { $in: ['pending', 'due'] },
    dueDate: { $lte: threeDaysFromNow },
  }).populate('studentId', '_id');

  let sentCount = 0;
  for (const fee of feesToRemind) {
    if (!fee.studentId) continue;
    await notificationService.sendToUser(fee.studentId._id, {
      title: 'Fee Payment Reminder',
      body: `₹${fee.amount} is ${fee.status === 'due' ? 'overdue' : 'due soon'} — pay now to avoid late fees`,
      data: { type: 'fee', feeId: String(fee._id) },
    });
    sentCount += 1;
  }

  logger.info(`Fee reminders sent: ${sentCount}`);
  return { sentCount };
};

module.exports = { sendFeeDueReminders };