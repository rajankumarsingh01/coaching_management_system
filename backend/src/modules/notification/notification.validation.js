const { z } = require('zod');

const registerTokenSchema = z.object({
  body: z.object({
    expoPushToken: z.string().min(1, 'expoPushToken is required'),
  }),
});

module.exports = { registerTokenSchema };