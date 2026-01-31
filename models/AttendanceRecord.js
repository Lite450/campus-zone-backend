const mongoose = require('mongoose');

const attendanceRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
  checkInTime: { type: Date, default: Date.now },
  location: {
    lat: Number,
    lng: Number
  }
});

// Compound Index: Ensures a user can only have ONE record per Date
attendanceRecordSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('AttendanceRecord', attendanceRecordSchema);