const mongoose = require('mongoose');

const ATTENDANCE_STATUS = Object.freeze({
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
});

const attendanceSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: Object.values(ATTENDANCE_STATUS), required: true },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // teacher who marked it
  },
  { timestamps: true }
);

// One attendance record per student per batch per day — prevents duplicate marking
attendanceSchema.index({ studentId: 1, batchId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
module.exports.ATTENDANCE_STATUS = ATTENDANCE_STATUS;