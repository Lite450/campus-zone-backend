const mongoose = require('mongoose');

const liveBusLocationSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Current Coordinates
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    heading: { type: Number, default: 0 }, // Direction (0-360)
    speed: { type: Number, default: 0 }
  },

  // Last time we heard from the driver
  lastUpdated: { type: Date, default: Date.now }
});

// Auto-delete if no update for 24 hours (Safety cleanup)
liveBusLocationSchema.index({ lastUpdated: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('LiveBusLocation', liveBusLocationSchema);