import { createClient } from "@supabase/supabase-js";

// These values are intentionally public. Supabase publishable keys are designed
// for public application code and remain constrained by Row Level Security.
const SUPABASE_URL = "https://hbipqluaftabdgkdbnqc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_hKsIK3Z9lq1SLLNtyfwawA_EFkETJXV";

export function createPublicSupabaseClient() {
  return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
