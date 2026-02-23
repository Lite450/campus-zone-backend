// adminController.js - Rewritten with Supabase
const supabase = require('../config/supabaseAdmin');
const emailService = require('../utils/emailService');

exports.setInstituteLocation = async (req, res) => {
    try {
          const { lat, lng, radius, adminId } = req.body;
          const { error } = await supabase
            .from('institutes')
            .upsert({ admin_id: adminId, lat, lng, geofence_radius: radius || 0.5, updated_at: new Date().toISOString() }, { onConflict: 'admin_id' });
          if (error) throw new Error(error.message);
          res.status(200).json({ message: "Institute Location Updated Successfully" });
    } catch (error) {
          res.status(500).json({ error: error.message });
    }
};

exports.sendBroadcast = async (req, res) => {
    try {
          const { senderId, title, message, targetAudience } = req.body;
          if (!title || !message || !targetAudience) {
                  return res.status(400).json({ message: "All fields are required." });
          }

      await supabase.from('broadcasts').insert([{ sender_id: senderId || null, title, message, target_audience: targetAudience, created_at: new Date().toISOString() }]);

      let query = supabase.from('app_users').select('email').eq('is_approved', true);
          if (targetAudience !== 'all') query = query.eq('role', targetAudience);
          const { data: users, error: usersError } = await query;
          if (usersError) throw new Error(usersError.message);

      const emailList = (users || []).map(u => u.email).filter(e => e);
          let emailStatus = "No users found to email";
          if (emailList.length > 0) {
                  try {
                            const info = await emailService.sendBroadcastEmail(emailList, title, message);
                            emailStatus = info ? `Broadcast transmitted to ${emailList.length} users.` : "Broadcast triggered.";
                  } catch (err) {
                            emailStatus = `Broadcast recorded, email failed: ${err.message}`;
                  }
          }

      const io = req.app.get('socketio');
          const payload = { title, message, from: 'Admin', date: new Date() };
          if (targetAudience === 'all') { io.emit('broadcast-alert', payload); }
          else { io.to(`role-${targetAudience}`).emit('broadcast-alert', payload); }

      res.status(200).json({ message: emailStatus });
    } catch (error) {
          res.status(500).json({ error: error.message });
    }
};

exports.getInstituteByAdmin = async (req, res) => {
    try {
          const { adminId } = req.params;
          const { data: institute, error } = await supabase.from('institutes').select('*').eq('admin_id', adminId).limit(1).maybeSingle();
          if (error || !institute) return res.status(404).json({ message: "No Institute found for this Admin ID" });
          res.status(200).json(institute);
    } catch (error) {
          res.status(500).json({ error: error.message });
    }
};
