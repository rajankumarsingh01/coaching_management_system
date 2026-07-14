const axios = require('axios');
const User = require('../user/user.model');
const logger = require('../../utils/logger');

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

const registerPushToken = async (userId, expoPushToken) => {
  await User.findByIdAndUpdate(userId, { expoPushToken });
};

// Sends a push notification to a single user (looked up by userId).
// institute displayName is used in the title where available, per Update 11.
const sendToUser = async (userId, { title, body, data = {} }) => {
  const user = await User.findById(userId).select('expoPushToken');
  if (!user || !user.expoPushToken) return; // silently skip — user hasn't registered a device

  await sendExpoNotification([{ to: user.expoPushToken, title, body, data }]);
};

// Sends the same notification to multiple users at once (e.g. all students in a batch)
const sendToUsers = async (userIds, { title, body, data = {} }) => {
  const users = await User.find({ _id: { $in: userIds }, expoPushToken: { $ne: null } }).select(
    'expoPushToken'
  );
  if (users.length === 0) return;

  const messages = users.map((u) => ({ to: u.expoPushToken, title, body, data }));
  await sendExpoNotification(messages);
};

// Low-level call to Expo's push API — batches of up to 100 messages per Expo's limits
const sendExpoNotification = async (messages) => {
  try {
    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await axios.post(EXPO_PUSH_API, chunk, {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      });
    }
  } catch (err) {
    // Push failures should never break the calling feature (e.g. test creation) —
    // log and move on.
    logger.error(`Expo push notification failed: ${err.message}`);
  }
};

module.exports = { registerPushToken, sendToUser, sendToUsers };