const mongoose = require('mongoose');

const sosAlertSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // The reason: "Accident", "Engine Failure", "Medical Emergency", etc.
  reason: { type: String, required: true }, 
  
  // Exact location where SOS was pressed
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  
  resolved: { type: Boolean, default: false }, // For Admin to mark as handled later
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SOSAlert', sosAlertSchema);