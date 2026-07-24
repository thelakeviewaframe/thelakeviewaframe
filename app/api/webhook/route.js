import Stripe from 'stripe';
import { getSupabaseServer } from '../../../lib/supabaseClient';
import { sendEmail } from '../../../lib/email';

export const dynamic = 'force-dynamic';

// POST /api/webhook -- Stripe calls this directly (not the browser).
// Register this URL in Stripe Dashboard > Developers > Webhooks, listening
// for "checkout.session.completed". At this point the guest's card has been
// AUTHORIZED (held) but not charged -- see capture_method: 'manual' in
// app/api/checkout/route.js. The booking sits as 'pending_review' with its
// dates soft-blocked until the host approves or declines via the emailed
// link (app/api/booking/respond/route.js).
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
                            status: 'pending_review',
                            stripe_payment_intent_id: session.payment_intent,
                })
                .eq('id', bookingId)
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

                if (process.env.HOST_EMAIL) {
                            await sendEmail({
                                          to: process.env.HOST_EMAIL,
                                          subject: `New booking request: ${booking.check_in} to ${booking.check_out}`,
                                          html: `
                                                        <p>New request from ${booking.guest_name} (${booking.guest_email})</p>
                                                                      <p>${booking.check_in} &rarr; ${booking.check_out} (${booking.nights} night(s)) -- $${amount}</p>
                                                                                    <p>Card is authorized, not charged yet. Choose one:</p>
                                                                                                  <p>
                                                                                                                  <a href="${approveUrl}" style="display:inline-block;padding:10px 20px;background:#2e7d32;color:#fff;text-decoration:none;border-radius:4px;margin-right:10px;">Approve</a>
                                                                                                                                  <a href="${declineUrl}" style="display:inline-block;padding:10px 20px;background:#c62828;color:#fff;text-decoration:none;border-radius:4px;">Decline</a>
                                                                                                                                                </p>
                                                                                                                                                              <p>This request has no expiration -- the dates stay held until you act.</p>
                                                                                                                                                                          `,
                            });
                }
          }
      }
  }

  return Response.json({ received: true });
}
