import { createClient } from '@supabase/supabase-js';

// dotenv is loaded by index.ts via 'dotenv/config' before this module is used.
// Do NOT call dotenv.config() here — it creates ordering conflicts in ESM.

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl) {
  console.error('❌ SUPABASE_URL is not set in server/.env');
}
if (!supabaseKey) {
  console.error('❌ Neither SUPABASE_SERVICE_ROLE_KEY nor SUPABASE_ANON_KEY is set in server/.env');
} else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn('⚠️  SUPABASE_SERVICE_ROLE_KEY not set — falling back to anon key. RLS will block admin queries.');
}

/**
 * Server-side Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY when available to bypass RLS.
 * Falls back to SUPABASE_ANON_KEY for local dev without a service key.
 */
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
