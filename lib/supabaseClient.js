import { createClient } from '@supabase/supabase-js';

// Server-side client using the service role key — only ever import this
// from API routes (server), never from a client component.
export function getSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}
