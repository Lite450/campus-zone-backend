const User = require('../models/User');
const Institute = require('../models/Institute');
const Broadcast = require('../models/Broadcast');
const emailService = require('../utils/emailService');
// Set Institute Location
exports.setInstituteLocation = async (req, res) => {
  try {
    const { lat, lng, radius, adminId } = req.body; 

    // FILTER by adminId. 
    // If an institute with this adminId exists -> UPDATE it.
    // If not -> CREATE it.
    const institute = await Institute.findOneAndUpdate(
      { adminId: adminId }, // <--- The Change: Look for this specific Admin's institute
      { 
        location: { lat, lng }, 
        geofenceRadius: radius || 0.5,
        adminId: adminId,
        lastUpdated: Date.now()
      }, 
      { upsert: true, new: true }
    );
    
    res.status(200).json({ 
      message: "Institute Location Updated Successfully", 
      institute: institute 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send Broadcast (Admin)
exports.sendBroadcast = async (req, res) => {
  try {
    const { senderId, title, message, targetAudience } = req.body;

    // 1. Save to DB
    await Broadcast.create({ senderId, title, message, targetAudience });

    // 2. Fetch Email Recipients
    let query = {};
    if (targetAudience !== 'all') {
      // Map audience to role (student, teacher, driver, non-faculty)
      query.role = targetAudience;
    }
    
    // Get emails only
    const users = await User.find(query).select('email');
    const emailList = users.map(u => u.email).filter(e => e); // Remove nulls

    // 3. Send Emails
    if (emailList.length > 0) {
      // Using bcc in logic (or loop) - Here passing array to 'to'
      // For privacy in production, use 'bcc', but for now 'to' works
      await emailService.sendBroadcastEmail(emailList, title, message);
    }

    // 4. Socket Emit (Existing logic)
    const io = req.app.get('socketio');
    if (targetAudience === 'all') {
      io.emit('broadcast-alert', { title, message, from: 'Admin' });
    } else {
      io.to(`role-${targetAudience}`).emit('broadcast-alert', { title, message, from: 'Admin' });
    }

    res.status(200).json({ message: `Broadcast sent to ${emailList.length} users via Email & App` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getInstituteByAdmin = async (req, res) => {
  try {
    const { adminId } = req.params; // Get ID from URL parameter

    const institute = await Institute.findOne({ adminId: adminId });

    if (!institute) {
      return res.status(404).json({ message: "No Institute found for this Admin ID" });
    }

    res.status(200).json(institute);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};