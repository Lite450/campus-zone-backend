const mongoose = require('mongoose');

const examScheduleSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: { type: String, required: true }, // e.g., "Sem-1", "Sem-2"
  exams: [{
    subject: String,
    date: String, // "2023-12-10"
    startTime: String, // "10:00 AM"
    endTime: String    // "01:00 PM"
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamSchedule', examScheduleSchema);