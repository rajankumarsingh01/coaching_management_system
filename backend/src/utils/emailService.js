// src/utils/emailService.js
//
// Best-effort email sender — Resend ke through. Ye kabhi bhi throw nahi
// karta, sirf log karta hai, taaki email fail hone se koi bhi asli feature
// (fee reminder, homework assign, push notification) na tootey. Agar
// RESEND_API_KEY set nahi hai to silently skip ho jaata hai.
const { Resend } = require('resend');
const env = require('../config/env');
const logger = require('./logger');

const resend = env.resend.apiKey ? new Resend(env.resend.apiKey) : null;

const sendEmail = async ({ to, subject, body }) => {
  if (!resend) {
    logger.debug('RESEND_API_KEY not configured — skipping email');
    return;
  }
  if (!to) return;

  try {
    await resend.emails.send({
      from: env.resend.fromEmail,
      to,
      subject,
      html: `<div style="font-family: sans-serif; font-size: 15px; color: #0F172A; line-height: 1.6; padding: 16px;">
        <p>${body}</p>
      </div>`,
    });
  } catch (err) {
    logger.error(`Resend email failed for ${to}: ${err.message}`);
  }
};

module.exports = { sendEmail };