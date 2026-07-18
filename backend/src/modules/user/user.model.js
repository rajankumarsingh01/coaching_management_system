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
    // NEW — profile picture (Cloudinary). avatarPublicId store karte hain
    // taaki purani image replace/remove hote waqt Cloudinary se bhi destroy() kar sakein.
    avatarUrl: { type: String, default: null },
    avatarPublicId: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);