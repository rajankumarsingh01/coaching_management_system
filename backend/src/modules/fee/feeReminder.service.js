const Fee = require('./fee.model');
const notificationService = require('../notification/notification.service');
const logger = require('../../utils/logger');
const { getTenantFilter } = require('../../utils/tenantFilter');

// Sends a push notification to every student with a 'due' (overdue) or
// soon-due 'pending' fee. Designed to be triggered by an external cron
// (e.g. Render Cron Job hitting a protected endpoint) rather than an
// in-process setInterval, since Render's free tier can sleep/restart.
//
// `requester` is optional: super_admin (or a cron job with no requester)
// gets an empty tenant filter -> platform-wide reminders. An institute
// admin gets scoped to their own instituteId via getTenantFilter, so they
// can only nudge their own students.
const sendFeeDueReminders = async (requester) => {
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

  const tenantFilter = requester ? getTenantFilter(requester) : {};

  const feesToRemind = await Fee.find({
    ...tenantFilter,
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