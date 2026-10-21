import { createClient } from '@supabase/supabase-js';

// Configuration variables for Supabase connection (can be replaced with your credentials)
const SUPABASE_URL = "https://upfahloqsyfywqmuhphv.supabase.co/rest/v1/";
const SUPABASE_PUBLIC_KEY = "sb_publishable_92xqwQsQjNVuAOKcRJTFyw_gnMfXYHO";

// Normalize URL to handle base domain even if /rest/v1/ is provided
const normalizedUrl = SUPABASE_URL ? SUPABASE_URL.replace(/\/rest\/v1\/?$/, '') : '';

export const supabase = createClient(normalizedUrl || SUPABASE_URL, SUPABASE_PUBLIC_KEY);

export default supabase;
