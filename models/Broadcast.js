const mongoose = require('mongoose');

const broadcastSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  message: String,
  targetAudience: String, // 'all', 'student', 'teacher', 'class-ID'
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Broadcast', broadcastSchema);