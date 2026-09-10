import { createClient } from "@supabase/supabase-js";

// These values are intentionally public. Supabase publishable keys are designed
// to be exposed in browser applications and are still constrained by RLS.
const FALLBACK_SUPABASE_URL = "https://hbipqluaftabdgkdbnqc.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_hKsIK3Z9lq1SLLNtyfwawA_EFkETJXV";

export function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || FALLBACK_SUPABASE_PUBLISHABLE_KEY;

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
