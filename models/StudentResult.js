const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Who graded it
  semester: { type: String, required: true },
  subject: { type: String, required: true },
  marksObtained: { type: Number, required: true },
  totalMarks: { type: Number, default: 100 },
  examType: { type: String, default: 'Final' } // Mid-term, Unit Test, Final
});

module.exports = mongoose.model('StudentResult', resultSchema);