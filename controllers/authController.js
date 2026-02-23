// authController.js — Rewritten with Supabase (replaces all Mongoose calls)
const supabase = require('../config/supabaseAdmin');

// ============================================================
// REGISTER — App user registers, status: pending (needs approval)
// ============================================================
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, lat, lng, classTeacherId } = req.body;

    // 1. Check email already exists
    const { data: existing } = await supabase
      .from('app_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1);

    if (existing && existing.length > 0) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // 2. Admins auto-approved, everyone else waits
    const isApproved = role === 'admin';
    const teacherRequestStatus = (role === 'student' && classTeacherId) ? 'pending' : 'none';

    // 3. Insert into Supabase
    const { error } = await supabase
      .from('app_users')
      .insert([{
        name,
        email: email.toLowerCase().trim(),
        password,           // plain text for now (same as original)
        role,
        is_approved: isApproved,
        class_teacher_id: classTeacherId || null,
        teacher_request_status: teacherRequestStatus,
        home_lat: lat || 0,
        home_lng: lng || 0,
      }]);

    if (error) throw new Error(error.message);

    res.status(201).json({ message: 'Registration Successful.' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// LOGIN — App user login
// ============================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: users, error } = await supabase
      .from('app_users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .eq('password', password)
      .limit(1);

    if (error) throw new Error(error.message);

    if (!users || users.length === 0) {
      return res.status(400).json({ message: 'Invalid Credentials' });
    }

    const user = users[0];

    if (!user.is_approved) {
      return res.status(403).json({ message: 'Account pending approval.' });
    }

    res.status(200).json({
      message: 'Login Success',
      userId: user.id,
      role: user.role,
      name: user.name,
      classTeacherId: user.class_teacher_id,
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// APPROVE USER — Admin approves a pending user
// ============================================================
exports.approveUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const { error } = await supabase
      .from('app_users')
      .update({ is_approved: true })
      .eq('id', userId);

    if (error) throw new Error(error.message);

    res.status(200).json({ message: 'User Approved' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// REJECT USER — Admin rejects (deletes) a pending user
// ============================================================
exports.rejectUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const { data: deleted, error } = await supabase
      .from('app_users')
      .delete()
      .eq('id', userId)
      .select();

    if (error) throw new Error(error.message);
    if (!deleted || deleted.length === 0) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ message: 'User request rejected and account deleted.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// GET PENDING USERS — Admin sees users awaiting approval
// ============================================================
exports.getPendingUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('app_users')
      .select('id, name, email, role, teacher_request_status, created_at')
      .eq('is_approved', false)
      .neq('role', 'student')
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    res.status(200).json(users || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// DEFAULT ADMIN LOGIN — Hardcoded super admin (unchanged logic)
// ============================================================
exports.defaultAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@campussoon.com';
    const defaultPass = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === defaultEmail && password === defaultPass) {
      return res.status(200).json({
        message: 'Super Admin Login Successful',
        userId: '00000000-0000-0000-0000-000000000000',
        name: 'Super Admin',
        role: 'admin',
        isApproved: true,
      });
    }

    return res.status(401).json({ message: 'Invalid Admin Credentials' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ============================================================
// GET USERS BY ROLE — Get all approved users of a specific role
// ============================================================
exports.getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const validRoles = ['student', 'teacher', 'driver', 'non-faculty', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid Role' });
    }

    const { data: users, error } = await supabase
      .from('app_users')
      .select('id, name, email, role, class_teacher_id, created_at')
      .eq('role', role)
      .eq('is_approved', true)
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);

    res.status(200).json({ count: users.length, role, users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};