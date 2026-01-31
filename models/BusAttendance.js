const mongoose = require('mongoose');

const busAttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: "YYYY-MM-DD"
  
  // Status for this specific day
  status: { 
    type: String, 
    enum: ['coming', 'absent'], 
    required: true 
  },

  // Optional: Track which driver/bus they are assigned to at this moment
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  updatedAt: { type: Date, default: Date.now }
});

// Compound Index: A user can only have ONE status per Date
busAttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('BusAttendance', busAttendanceSchema);