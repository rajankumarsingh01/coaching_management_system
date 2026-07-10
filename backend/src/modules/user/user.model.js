const mongoose = require('mongoose');
const { ROLES } = require('../../config/constants');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(ROLES), required: true },
    // null for super_admin only — every other role belongs to exactly one institute (tenant)
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', default: null },
    batchIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }],
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    refreshToken: { type: String, select: false, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);