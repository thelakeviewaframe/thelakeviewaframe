import { getSupabaseServer } from '../../../../lib/supabaseClient';
import { buildIcsFeed } from '../../../../lib/ics';

export const dynamic = 'force-dynamic';

// GET /api/ical/export
// Give this URL to Airbnb (Sync calendars > Import calendar) and to VRBO
// (Calendar > Import calendars) so direct bookings block your OTA calendars.
//
// IMPORTANT: only bookings the host has actually acted on belong in this feed.
//   'pending'        -> checkout started but never finished. Must NOT be
//                       exported, or an abandoned cart blocks real dates.
//   'pending_review' -> card authorized, waiting on host approve/decline.
//                       Exported, so the dates are held while you decide.
//   'confirmed'      -> approved and charged. Exported.
//   'declined'       -> host said no. Must NOT be exported.
const EXPORTED_STATUSES = ['pending_review', 'confirmed'];

export async function GET() {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from('bookings')
    .select('id, check_in, check_out, status')
    .in('status', EXPORTED_STATUSES);

  if (error) {
    return new Response(`Error building feed: ${error.message}`, { status: 500 });
  }

  const feed = buildIcsFeed(data || [], {
    propertyName: process.env.NEXT_PUBLIC_PROPERTY_NAME || 'Direct Booking Site',
  });

  return new Response(feed, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="direct-bookings.ics"',
      'Cache-Control': 'public, max-age=300',
    },
  });
}
