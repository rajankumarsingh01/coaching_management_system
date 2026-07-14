const mongoose = require('mongoose');
const { SUBSCRIPTION_STATUS } = require('../../config/constants');

const brandingSchema = new mongoose.Schema(
  {
    displayName: { type: String, default: '' },
    tagline: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    logoPublicId: { type: String, default: '' },
    bannerImageUrl: { type: String, default: '' },
    bannerPublicId: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    primaryColor: { type: String, default: '#2563EB' },
    secondaryColor: { type: String, default: '#1E40AF' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    contactAddress: { type: String, default: '' },
    socialLinks: {
      website: { type: String, default: '' },
      instagram: { type: String, default: '' },
      facebook: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
    aboutText: { type: String, default: '' },
  },
  { _id: false }
);

const instituteSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    subscriptionStatus: {
      type: String,
      enum: Object.values(SUBSCRIPTION_STATUS),
      default: SUBSCRIPTION_STATUS.TRIAL,
    },
    billingStatus: { type: String, default: 'pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    branding: { type: brandingSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Institute', instituteSchema);