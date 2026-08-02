const mongoose = require('mongoose');
const { ROLES } = require('../../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', default: null },
    batchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    refreshToken: { type: String, select: false, default: null },
    isActive: { type: Boolean, default: true },
    expoPushToken: { type: String, default: null },
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
    // NEW — forgot-password OTP flow. Raw OTP kabhi DB me store nahi hota,
    // sirf uska SHA-256 hash — taaki DB leak hone par bhi OTP reuse na ho sake.
    resetPasswordOtpHash: { type: String, select: false, default: null },
    resetPasswordExpires: { type: Date, select: false, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);