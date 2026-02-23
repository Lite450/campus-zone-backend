require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const supabase = require('./config/supabaseAdmin');
const apiRoutes = require('./routes/apiRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Middleware
app.use(express.json());
app.use(cors());
app.set('socketio', io);

// API Routes
app.use('/api', apiRoutes);
app.use('/api', require('./routes/testEmailRoute'));
app.use('/api', require('./routes/debugRoute'));

// ============================================
// 🔌 REAL-TIME SOCKET ENGINE
// ============================================
io.on('connection', (socket) => {
  console.log(`✅ User Connected: ${socket.id}`);

  // 1. JOIN ROOMS
  socket.on('join-app', (data) => {
    const { role, driverId, classTeacherId } = data;
    if (role) socket.join(`role-${role}`);
    if (classTeacherId) socket.join(`class-${classTeacherId}`);
    if (driverId) socket.join(`trip-${driverId}`);
    console.log(`Socket joined rooms for role: ${role}`);
  });

  // 2. LIVE BUS TRACKING
  socket.on('driver-location-update', async (data) => {
    const { driverId, lat, lng, heading, speed } = data;

    // Broadcast to passengers and admin map
    io.to(`trip-${driverId}`).emit('live-bus-update', { driverId, lat, lng, heading, speed });
    io.emit('admin-map-update', { driverId, lat, lng });

    // Persist last known location to Supabase
    try {
      await supabase
        .from('live_bus_location')
        .upsert({
          driver_id: driverId,
          lat, lng, heading, speed,
          last_updated: new Date().toISOString(),
        }, { onConflict: 'driver_id' });
    } catch (err) {
      console.error("❌ Location Save Error:", err.message);
    }
  });

  // 3. SOS ALERT
  socket.on('sos-alert', async (data) => {
    const { driverId, message, lat, lng } = data;
    const alertData = { driverId, type: 'SOS', message, location: { lat, lng }, time: new Date() };

    io.emit('admin-alert', alertData);
    io.to(`trip-${driverId}`).emit('sos-broadcast', alertData);

    try {
      await supabase.from('sos_alerts').insert([{
        driver_id: driverId, message, lat, lng, is_resolved: false
      }]);
    } catch (err) {
      console.error("❌ SOS Save Error:", err.message);
    }
  });

  socket.on('disconnect', () => console.log('❌ User Disconnected'));
});

const PORT = process.env.PORT || 5000;
if (require.main === module) {
  server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} — Powered by Supabase`));
}

module.exports = app;