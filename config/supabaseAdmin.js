// config/supabaseAdmin.js — Backend Supabase client (service role)
// Uses SERVICE KEY — never exposed to frontend
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

module.exports = supabase;
