// teacherController.js — Rewritten with Supabase
const supabase = require('../config/supabaseAdmin');

exports.sendClassBroadcast = async (req, res) => {
  try {
    const { teacherId, message } = req.body;

    // 1. Verify sender is a teacher
    const { data: teachers } = await supabase
      .from('app_users')
      .select('id, name, role')
      .eq('id', teacherId)
      .limit(1);

    if (!teachers || teachers.length === 0 || teachers[0].role !== 'teacher') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const teacher = teachers[0];

    // 2. Save broadcast to Supabase
    await supabase.from('broadcasts').insert([{
      title: `Message from ${teacher.name}`,
      message,
      target_role: 'student',
      sent_by: teacherId,
    }]);

    // 3. Emit via Socket
    const io = req.app.get('socketio');
    if (io) io.to(`class-${teacherId}`).emit('notification', { from: teacher.name, message });

    res.status(200).json({ message: 'Sent to your students' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};