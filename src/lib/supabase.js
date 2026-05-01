import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const SUPABASE_ENABLED = Boolean(url && anonKey);

if (!SUPABASE_ENABLED && import.meta.env.DEV) {
  console.warn(
    '[supabase] VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY ausentes — auth desabilitada.'
  );
}

export const supabase = SUPABASE_ENABLED
  ? createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;
