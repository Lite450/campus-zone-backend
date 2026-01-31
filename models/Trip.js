const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['STARTED', 'COMPLETED'], default: 'STARTED' },
    predictions: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        predictedArrivalTime: { type: Date },
        distance: { type: Number }, // In meters
        duration: { type: Number }  // In seconds
    }],
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);
