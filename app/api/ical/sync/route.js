—import ical from 'node-ical';
import { getSupabaseServer } from '../../../../lib/supabaseClient';

export const dynamic = 'force-dynamic';

// GET /api/ical/sync
// Pulls the Airbnb + VRBO .ics feeds and writes blocked dates into Supabase.
// Called by Vercel Cron once a day on the free plan (see vercel.json).
//
// IMPORTANT: once-a-day sync means a booking made on Airbnb/VRBO could take
// up to ~24h to show as blocked on your own site. To sync more often without
// paying for Vercel Pro, point a free external cron service (cron-job.org,
// EasyCron) at this same URL every 15-30 min — see README "Faster sync" section.
export async function GET(request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = getSupabaseServer();
  const sources = [
    { url: process.env.AIRBNB_ICAL_URL, name: 'airbnb' },
    { url: process.env.VRBO_ICAL_URL, name: 'vrbo' },
  ].filter((s) => !!s.url);

  const results = {};

  for (const source of sources) {
    try {
      const events = await ical.async.fromURL(source.url);
      const dates = new Set();

      for (const key in events) {
        const ev = events[key];
        if (ev.type !== 'VEVENT' || !ev.start || !ev.end) continue;

        // Walk every night between start (check-in) and end (check-out)
        const d = new Date(Date.UTC(ev.start.getUTCFullYear(), ev.start.getUTCMonth(), ev.start.getUTCDate()));
        const end = new Date(Date.UTC(ev.end.getUTCFullYear(), ev.end.getUTCMonth(), ev.end.getUTCDate()));
        while (d < end) {
          dates.add(d.toISOString().slice(0, 10));
          d.setUTCDate(d.getUTCDate() + 1);
        }
      }

      // Replace this source's rows wholesale with the fresh set.
      await supabase.from('blocked_dates').delete().eq('source', source.name);
      const rows = Array.from(dates).map((date) => ({ date, source: source.name }));
      if (rows.length) {
        await supabase.from('blocked_dates').insert(rows);
      }
      results[source.name] = { ok: true, blockedNights: rows.length };
    } catch (err) {
      results[source.name] = { ok: false, error: err.message };
    }
  }

  return Response.json({ syncedAt: new Date().toISOString(), results });
}
