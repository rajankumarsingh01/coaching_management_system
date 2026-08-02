const { z } = require('zod');

const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password is required'),
  }),
});

const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// NEW
const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

// NEW
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
  }),
});

// NEW
const resetPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email'),
    otp: z.string().length(6, 'Code must be 6 digits'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
};