const User = require('../models/User');
const Broadcast = require('../models/Broadcast');

exports.sendClassBroadcast = async (req, res) => {
  const { teacherId, message } = req.body;

  // 1. Verify Sender is a Teacher
  const teacher = await User.findById(teacherId);
  if (teacher.role !== 'teacher') return res.status(403).json({ message: "Not authorized" });

  // 2. Find all students belonging to this teacher
  // (We don't need to fetch them all, just need to notify them)
  
  // Save history
  await Broadcast.create({ senderId: teacherId, message, targetAudience: 'my-class' });

  // 3. Emit via Socket to students who follow this teacher
  // Assuming students join a room named "class-{teacherId}" on frontend
  const io = req.app.get('socketio');
  io.to(`class-${teacherId}`).emit('notification', { from: teacher.name, message });

  res.status(200).json({ message: "Sent to your students" });
};