import Stripe from 'stripe';
import { getSupabaseServer } from '../../../lib/supabaseClient';
import { sendEmail } from '../../../lib/email';

export const dynamic = 'force-dynamic';

// POST /api/webhook -- Stripe calls this directly (not the browser).
// Register this URL in Stripe Dashboard > Webhooks, listening for
// "checkout.session.completed", with "Events from" set to YOUR ACCOUNT
// (not Connected accounts). At this point the guest's card has been
// AUTHORIZED (held) but not charged -- see capture_method: 'manual' in
// app/api/checkout/route.js. The booking sits as 'pending_review' with its
// dates soft-blocked until the host approves or declines via the emailed link
// (app/api/booking/respond/route.js).
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

      // The .eq('status', 'pending') guard makes this safe to run twice.
      // Stripe retries a webhook if it doesn't get a fast 200, and without
      // this guard a retry would email the host a duplicate request.
      const { data: booking } = await supabase
        .from('bookings')
        .update({
          status: 'pending_review',
          stripe_payment_intent_id: session.payment_intent,
        })
        .eq('id', bookingId)
        .eq('status', 'pending')
        .select()
        .single();

      if (booking) {
        const dates = [];
        const d = new Date(booking.check_in + 'T00:00:00Z');
        const end = new Date(booking.check_out + 'T00:00:00Z');
        while (d < end) {
          dates.push({ date: d.toISOString().slice(0, 10), source: 'pending', booking_id: booking.id });
          d.setUTCDate(d.getUTCDate() + 1);
        }
        if (dates.length) {
          await supabase.from('blocked_dates').upsert(dates, { onConflict: 'date,source' });
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
        const approveUrl = `${siteUrl}/api/booking/respond?token=${booking.review_token}&action=approve`;
        const declineUrl = `${siteUrl}/api/booking/respond?token=${booking.review_token}&action=decline`;
        const amount = (booking.amount_total_cents / 100).toFixed(2);

        // HOST_EMAIL can hold several addresses separated by commas, e.g.
        // "jkrealestate221@gmail.com, karen@example.com" -- everyone listed
        // gets the request, so it never sits unanswered because one inbox
        // wasn't opened that day.
        const hostEmails = (process.env.HOST_EMAIL || '')
          .split(',')
          .map((e) => e.trim())
          .filter(Boolean);

        if (hostEmails.length) {
          await sendEmail({
            to: hostEmails,
            subject: `New booking request: ${booking.check_in} to ${booking.check_out}`,
            html: `
              <p>New request from ${booking.guest_name} (${booking.guest_email})</p>
              <p>${booking.check_in} &rarr; ${booking.check_out} (${booking.nights} night(s)) -- $${amount}</p>
              <p>The card is authorized, not charged yet. Choose one:</p>
              <p>
                <a href="${approveUrl}" style="display:inline-block;padding:10px 20px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:4px;margin-right:10px;">Approve</a>
                <a href="${declineUrl}" style="display:inline-block;padding:10px 20px;background:#c62828;color:#fff;text-decoration:none;border-radius:4px;">Decline</a>
              </p>
              <p><strong>Please respond within 24 hours.</strong> The guest was told they'd
              hear back that fast. Stripe releases the card hold on its own after about
              7 days, and once that happens the payment can no longer be captured.</p>
            `,
          });
        }
      }
    }
  }

  return Response.json({ received: true });
}
