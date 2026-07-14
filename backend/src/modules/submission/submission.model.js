const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    homeworkId: { type: mongoose.Schema.Types.ObjectId, ref: 'Homework', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    attachmentUrl: { type: String, required: true },
    attachmentPublicId: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
    isLate: { type: Boolean, default: false },
    remarks: { type: String, default: '' }, // teacher feedback, optional
  },
  { timestamps: true }
);

// One submission per student per homework
submissionSchema.index({ homeworkId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', submissionSchema);