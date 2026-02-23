// config/supabaseAdmin.js - Backend Supabase client (service role)
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://acibrfsgnknwzpnzgfmg.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjaWJyZnNnbmtud3pwbnpnZm1nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTgyMjUxMSwiZXhwIjoyMDg3Mzk4NTExfQ.IIqka2xvKxddhOWM0symo4AZmac_p6tEkO_rP1mvz_o';

console.log('[Supabase] URL:', SUPABASE_URL ? 'Loaded' : 'MISSING');
console.log('[Supabase] Key:', SUPABASE_SERVICE_KEY ? 'Loaded' : 'MISSING');

const supabase = createClient(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
    );

module.exports = supabase;
