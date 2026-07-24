import { getSupabaseServer } from '../../../lib/supabaseClient';

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
