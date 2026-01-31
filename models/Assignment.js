const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topic: { type: String, required: true },
  description: String,
  semester: String,
  submissionDate: { type: String, required: true }, // "2023-11-20"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Assignment', assignmentSchema);