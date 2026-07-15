const axios = require('axios');
const User = require('../user/user.model');
const logger = require('../../utils/logger');
const { emitToUser, emitToUsers } = require('../../socket/socket');

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

const registerPushToken = async (userId, expoPushToken) => {
  await User.findByIdAndUpdate(userId, { expoPushToken });
};

// Sends a push notification to a single user (looked up by userId).
// Ab saath me realtime socket event bhi bhejta hai — jab user ka app/dashboard
// khula hua ho to notification instant dikhega, push ke bharose nahi rehna padega.
const sendToUser = async (userId, { title, body, data = {} }) => {
  // Realtime emit — chahe push token ho ya na ho, agar user online hai to turant milega
  emitToUser(userId, 'notification:new', { title, body, data, createdAt: new Date() });

  const user = await User.findById(userId).select('expoPushToken');
  if (!user || !user.expoPushToken) return; // silently skip — user hasn't registered a device

  await sendExpoNotification([{ to: user.expoPushToken, title, body, data }]);
};

// Sends the same notification to multiple users at once (e.g. all students in a batch)
const sendToUsers = async (userIds, { title, body, data = {} }) => {
  emitToUsers(userIds, 'notification:new', { title, body, data, createdAt: new Date() });

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
    logger.error(`Expo push notification failed: ${err.message}`);
  }
};

module.exports = { registerPushToken, sendToUser, sendToUsers };