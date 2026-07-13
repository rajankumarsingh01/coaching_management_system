const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true }, // Cloudinary secure_url
    filePublicId: { type: String, required: true }, // Cloudinary public_id, for deletion later
    fileType: { type: String, enum: ['pdf', 'jpg', 'png'], required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notes', notesSchema);