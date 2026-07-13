const Razorpay = require('razorpay');
const env = require('./env');

const razorpayInstance = new Razorpay({
  key_id: env.razorpay.keyId,
  key_secret: env.razorpay.keySecret,
});

module.exports = razorpayInstance;