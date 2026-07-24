import { getSupabaseServer } from '../../../lib/supabaseClient';

// Tell Next.js not to try to run this at build time (it needs Supabase env
// vars that only exist once you've set them in Vercel) — only run it when a
// real visitor's browser requests it.
export const dynamic = 'force-dynamic';

// GET /api/availability -> { blockedDates: ["2026-08-01", ...] }
// Used by the calendar component to grey out unavailable nights.
export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase.from('blocked_dates').select('date');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const blockedDates = Array.from(new Set((data || []).map((r) => r.date)));
  return Response.json({ blockedDates });
}
