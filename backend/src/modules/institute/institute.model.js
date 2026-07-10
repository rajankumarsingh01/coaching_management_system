const mongoose = require('mongoose');
const { SUBSCRIPTION_STATUS } = require('../../config/constants');

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
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // super_admin who created it
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Institute', instituteSchema);