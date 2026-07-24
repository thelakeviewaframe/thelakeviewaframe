# Lakeview A-Frame -- Direct Booking Site

A self-hosted direct booking site: property page, availability calendar, Stripe payments, and two-way calendar sync with Airbnb/VRBO via iCal.

No monthly SaaS fee (Lodgify/Houfy replaced) -- you pay only for the domain (~$10-15/yr) and, if you outgrow the free tiers below, small usage-based costs.

## What's included

`app/page.jsx` is the property landing page (photos, description, amenities, booking widget). `components/Calendar.jsx` and `BookingCard.jsx` are the availability calendar and booking form. `app/api/checkout` creates a Stripe Checkout session per booking request (card authorized, not charged). `app/api/webhook` soft-blocks the dates and emails you an approve/decline link. `app/api/booking/respond` is the link in that email; it approves (captures payment) or declines (releases the hold). `app/api/ical/export` is the .ics feed you give Airbnb/VRBO so direct bookings block their calendars. `app/api/ical/sync` pulls Airbnb and VRBO's .ics feeds so their bookings block your site. `supabase/schema.sql` holds the two tables (`bookings`, `blocked_dates`) this all runs on.

## Request-to-book flow

Every booking is a request, not an instant confirmation. The guest submits the form and pays on Stripe's checkout page, and their card is authorized (held), not charged (`capture_method: 'manual'`). The webhook then marks the booking `pending_review` and soft-blocks those nights (source `'pending'`) so no one else can request the same dates while you decide. You get an email (via Resend) with Approve and Decline buttons, no login needed, just click. Approve captures the charge, marks the booking `confirmed`, and emails the guest a confirmation. Decline releases the card hold (guest is never charged), deletes the soft-block so the dates open back up, and emails the guest. There's no auto-expiry -- a request stays `pending_review` (and its dates held) until you act, however long that takes.

This needs one more free service on top of Stripe/Supabase.

### Set up Resend (free tier: 3,000 emails/month) -- sends the approval emails

Create a free account at https://resend.com and verify your email. Then go to API Keys, create an API key, and copy it into `RESEND_API_KEY`. For real guest emails (not just to yourself), add your domain under Domains, follow its DNS steps, then set `RESEND_FROM_EMAIL` to an address on it (e.g. `bookings@thelakeviewaframe.com`). Until you do that, leave `RESEND_FROM_EMAIL` unset -- Resend's shared test sender still works, but only for emails sent to the address you signed up with, so guest confirmation/decline emails won't arrive yet. Finally, set `HOST_EMAIL` to the address that should receive new booking requests.

## 1. Set up Supabase (free) -- this is your database

Go to https://supabase.com, create a free account and a new project. In Project Settings > API, copy the "Project URL" and the "service_role" key (not the anon key -- this app writes data, so it needs the service role key). Then in SQL Editor > New query, paste the contents of `supabase/schema.sql` and run it.

## 2. Set up Stripe (free to start, ~2.9% + 30 cents per charge -- same as any processor)

Create an account at https://dashboard.stripe.com/register. Use test mode first (toggle top-right); under Developers > API keys, copy the "Secret key" (`sk_test_...`) and "Publishable key" (`pk_test_...`). Don't set up the webhook yet -- you need your live URL first (see the Vercel step below). Stripe requires identity/business verification before you can accept real (live) payments -- you'll do that inside the Stripe dashboard once you're ready to switch from test to live keys.

## 3. Get your Airbnb + VRBO iCal export URLs

For Airbnb: Listing > Availability > Sync calendars > "Export calendar" -- copy that URL. For VRBO: Listing > Calendar > "Import/export calendars" > Export -- copy that URL. These go in `AIRBNB_ICAL_URL` and `VRBO_ICAL_URL` below.

## 4. Deploy to Vercel (free)

Push this folder to a GitHub repo (or drag-and-drop deploy at https://vercel.com/new), then import the repo at https://vercel.com/new. Before the first deploy, add Environment Variables (Project Settings > Environment Variables) -- copy every key from `.env.example` and fill in real values. Deploy; Vercel gives you a `https://your-project.vercel.app` URL immediately -- use that to finish setup below, then point your real domain at it (step 5). Next, go back to Stripe > Developers > Webhooks > Add endpoint, with URL `https://your-project.vercel.app/api/webhook` and event `checkout.session.completed`; copy the "Signing secret" (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in Vercel's env vars, then redeploy. Finally, give Airbnb/VRBO your export feed, `https://your-project.vercel.app/api/ical/export`, adding it as an "import calendar" in each platform's calendar sync settings.

## 5. Connect your cheapdomains.com domain

Buy the domain at cheapdomains.com if you haven't already. In Vercel, go to Project > Settings > Domains and add `www.yourdomain.com` (and the bare `yourdomain.com`, which Vercel will offer to redirect to `www`). Vercel shows you exactly which DNS records to add (usually an `A` record for the root domain and a `CNAME` for `www`); in cheapdomains.com's dashboard, find DNS management for your domain and add those records -- propagation is usually under an hour, sometimes up to 24h. Once it's live, update `NEXT_PUBLIC_SITE_URL` in Vercel's env vars to your real domain and redeploy (Stripe's success/cancel redirects use this).

## 6. Swap in your real content

Open `app/page.jsx` -- the `PROPERTY` object at the top has your name, location, description, amenities, and photo paths. Drop real photos in `public/photos/` and update the filenames to match. Update `NIGHTLY_RATE_USD`, `CLEANING_FEE_USD`, and `DEPOSIT_PERCENT` (100 = pay in full at booking; e.g. 25 = 25% deposit, balance collected however you currently handle it -- this starter doesn't automate a second charge for the balance) in your env vars.

## Faster iCal sync (optional, still free)

Vercel's free (Hobby) plan only allows cron jobs to run once a day, so `vercel.json` is set to sync Airbnb/VRBO once daily -- meaning a booking made on one of those platforms could take up to ~24h to block on your site. To sync more often for free, create a free account at https://cron-job.org (or EasyCron) and have it call `https://yourdomain.com/api/ical/sync` with header `Authorization: Bearer <your CRON_SECRET>` every 15-30 minutes. Delete the `crons` block in `vercel.json` if you do this, to avoid double-syncing.

## Known tradeoffs vs. a paid platform (Lodgify/Hospitable/etc.)

There's no true real-time OTA sync -- nobody outside Airbnb/VRBO's approved software partners gets that, even paid platforms rely on the same iCal mechanism under the hood, so this starter's sync frequency is the same order of magnitude as what you'd get elsewhere on a similar budget. You're the one maintaining it: if Airbnb changes their iCal format or Stripe changes an API, that's on you (or whoever you hire) to fix -- a paid platform absorbs that maintenance for its monthly fee. There's no AI guest messaging, dynamic pricing, or cleaner notifications -- you already have PriceLabs and ResortClean for those, so this only replaces the "direct booking website" piece. Deposit-only bookings don't auto-charge the balance: if you set `DEPOSIT_PERCENT` below 100, this starter collects the deposit at booking but doesn't automatically charge the remainder before check-in -- you'd need to manually charge the saved card (via Stripe's dashboard) or extend the webhook code to schedule that.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Then open http://localhost:3000.
