const mongoose = require('mongoose');

const EVENT_TYPES = Object.freeze({
  TEST: 'test',
  HOLIDAY: 'holiday',
  EVENT: 'event',
});

const calendarEventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    type: { type: String, enum: Object.values(EVENT_TYPES), default: EVENT_TYPES.EVENT },
    batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null }, // null = institute-wide event
    instituteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Institute', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
module.exports.EVENT_TYPES = EVENT_TYPES;