const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  busNumber: { type: String, required: true },
  passengers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] 
});

module.exports = mongoose.model('Bus', busSchema);