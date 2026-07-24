import Stripe from 'stripe';
import { getSupabaseServer } from '../../../lib/supabaseClient';

// POST /api/webhook — Stripe calls this directly (not the browser).
// Register this URL in Stripe Dashboard > Developers > Webhooks, listening
// for "checkout.session.completed". This is the ONLY place a booking becomes
// real and dates get blocked, so a closed browser tab never loses a payment.
export async function POST(request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers.get('stripe-signature');
  const rawBody = await request.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const bookingId = session.metadata?.booking_id;
    if (bookingId) {
      const supabase = getSupabaseServer();

      const { data: booking } = await supabase
        .from('bookings')
        .update({
          status: 'paid',
          amount_paid_cents: session.amount_total,
        })
        .eq('id', bookingId)
        .select()
        .single();

      if (booking) {
        // Block every night of the stay so /api/availability and the
        // exported .ics feed (Airbnb/VRBO import) reflect it immediately.
        const dates = [];
        const d = new Date(booking.check_in + 'T00:00:00Z');
        const end = new Date(booking.check_out + 'T00:00:00Z');
        while (d < end) {
          dates.push({ date: d.toISOString().slice(0, 10), source: 'direct', booking_id: booking.id });
          d.setUTCDate(d.getUTCDate() + 1);
        }
        if (dates.length) {
          await supabase.from('blocked_dates').upsert(dates, { onConflict: 'date,source' });
        }
      }
    }
  }

  return Response.json({ received: true });
}

// Note: Next.js App Router route handlers (this file) already give you the
// raw, unparsed body via request.text() — unlike the old Pages Router, no
// extra config is needed to get the raw bytes Stripe's signature check requires.
