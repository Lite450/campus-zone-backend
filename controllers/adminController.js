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

    if (!title || !message || !targetAudience) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // 1. Save to DB
    await Broadcast.create({ 
      senderId: senderId || "000000000000000000000000", 
      title, 
      message, 
      targetAudience 
    });

    // 2. Build Query
    let query = { isApproved: true };
    if (targetAudience !== 'all') {
      query.role = targetAudience;
    }
    
    // Fetch users and extract unique emails
    const users = await User.find(query).select('email');
    
    // Use Set to remove duplicates and filter out empty values
    const uniqueEmails = [...new Set(users.map(u => u.email).filter(e => e && e.includes('@')))];

    // 3. Background Email Sending
    if (uniqueEmails.length > 0) {
        // We pass the unique list to the service
        emailService.sendBroadcastEmail(uniqueEmails, title, message)
            .catch(err => console.error("Email Service Error:", err));
    }

    // 4. Socket Emit (Remains the same)
    const io = req.app.get('socketio');
    const payload = { title, message, from: 'Admin', date: new Date() };

    if (targetAudience === 'all') {
      io.emit('broadcast-alert', payload);
    } else {
      io.to(`role-${targetAudience}`).emit('broadcast-alert', payload);
    }

    res.status(200).json({ 
        message: `Broadcast sent to ${uniqueEmails.length} recipients via App & Email.` 
    });

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