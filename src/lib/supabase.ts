import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iyyamojgxvxvztmgidea.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5eWFtb2pneHZ4dnp0bWdpZGVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIxMjQ3OTAsImV4cCI6MjA5NzcwMDc5MH0.7ORlNfct9E8ObGyOPyx8W74TvtxAkSnV8hDDt_d5nag';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
