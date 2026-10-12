import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co'
);

// Fallback dummy values to prevent runtime throw during initialization if unconfigured
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://mock.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'mock-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
