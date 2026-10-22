import { createClient } from '@supabase/supabase-js';

// Configuration variables for Supabase connection (can be replaced with your credentials or Vercel env)
const RAW_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || "https://upfahloqsyfywqmuhphv.supabase.co/rest/v1/";
const RAW_KEY = (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLIC_KEY)) || "sb_publishable_92xqwQsQjNVuAOKcRJTFyw_gnMfXYHO";

// Normalize URL: trim whitespace, strip trailing slashes, and strip /rest/v1 if included
const cleanUrl = (RAW_URL || '').trim().replace(/\/+$/, '').replace(/\/rest\/v1\/?$/, '');
const cleanKey = (RAW_KEY || '').trim();

export const supabase = createClient(cleanUrl, cleanKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export default supabase;

