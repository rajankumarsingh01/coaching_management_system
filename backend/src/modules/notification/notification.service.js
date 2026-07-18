const axios = require('axios');
const User = require('../user/user.model');
const logger = require('../../utils/logger');
const { emitToUser, emitToUsers } = require('../../socket/socket');
const { sendEmail } = require('../../utils/emailService');   // NEW

const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

const registerPushToken = async (userId, expoPushToken) => {
  await User.findByIdAndUpdate(userId, { expoPushToken });
};

// UPDATED — ab email bhi (best-effort) push ke saath-saath jaati hai.
// User ke paas expoPushToken na ho (Expo Go, ya app never opened) tab
// bhi email zaroor pahunchegi.
const sendToUser = async (userId, { title, body, data = {} }) => {
  emitToUser(userId, 'notification:new', { title, body, data, createdAt: new Date() });

  const user = await User.findById(userId).select('expoPushToken email');
  if (!user) return;

  sendEmail({ to: user.email, subject: title, body }).catch(() => {});

  if (!user.expoPushToken) return;
  await sendExpoNotification([{ to: user.expoPushToken, title, body, data }]);
};

// UPDATED — email sabko jaati hai (chahe push token ho ya na ho), push
// sirf unhe jinke paas token registered hai.
const sendToUsers = async (userIds, { title, body, data = {} }) => {
  emitToUsers(userIds, 'notification:new', { title, body, data, createdAt: new Date() });

  const users = await User.find({ _id: { $in: userIds } }).select('expoPushToken email');
  if (users.length === 0) return;

  users.forEach((u) => {
    sendEmail({ to: u.email, subject: title, body }).catch(() => {});
  });

  const pushable = users.filter((u) => u.expoPushToken);
  if (pushable.length === 0) return;

  const messages = pushable.map((u) => ({ to: u.expoPushToken, title, body, data }));
  await sendExpoNotification(messages);
};

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