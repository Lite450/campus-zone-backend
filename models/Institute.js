const mongoose = require('mongoose');

const instituteSchema = new mongoose.Schema({
  name: { type: String, default: "Main Campus" },
  
  // Link to the Admin who set this location
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  geofenceRadius: { type: Number, default: 0.5 }, // in Kilometers
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Institute', instituteSchema);