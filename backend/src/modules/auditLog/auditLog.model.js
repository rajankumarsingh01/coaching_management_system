const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    action: { type: String, required: true }, // e.g. CREATE_INSTITUTE, VIEW_ALL_INSTITUTES, VIEW_INSTITUTE_FEES
    targetInstituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', default: null },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);