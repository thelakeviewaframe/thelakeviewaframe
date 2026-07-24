# Lakeview A-Frame — Direct Booking Site

A self-hosted direct booking site: property page, availability calendar,
Stripe payments, and two-way calendar sync with Airbnb/VRBO via iCal.

No monthly SaaS fee (Lodgify/Houfy replaced) — you pay only for the domain
(~$10-15/yr) and, if you outgrow the free tiers below, small usage-based costs.

## What's included

- `app/page.jsx` — the property landing page (photos, description, amenities, booking widget)
- `components/Calendar.jsx` + `BookingCard.jsx` — availability calendar + booking form
- `app/api/checkout` — creates a Stripe Checkout session per booking request
- `app/api/webhook` — confirms payment and blocks the dates (source of truth)
- `app/api/ical/export` — the .ics feed you give Airbnb/VRBO so direct bookings block their calendars
- `app/api/ical/sync` — pulls Airbnb + VRBO's .ics feeds so their bookings block your site
- `supabase/schema.sql` — the two tables (`bookings`, `blocked_dates`) this all runs on

## 1. Set up Supabase (free) — this is your database

1. Go to https://supabase.com, create a free account and a new project.
2. Project Settings > API — copy the "Project URL" and the "service_role" key
   (not the anon key — this app writes data, so it needs the service role key).
3. SQL Editor > New query — paste the contents of `supabase/schema.sql` and run it.

## 2. Set up Stripe (free to start, ~2.9% + 30¢ per charge — same as any processor)

1. Create an account at https://dashboard.stripe.com/register.
2. Use **test mode** first (toggle top-right). Developers > API keys — copy the
   "Secret key" (`sk_test_...`) and "Publishable key" (`pk_test_...`).
3. Don't set up the webhook yet — you need your live URL first (step 4 below).
4. Stripe requires identity/business verification before you can accept real
   (live) payments — you'll do that inside the Stripe dashboard once you're
   ready to switch from test to live keys.

## 3. Get your Airbnb + VRBO iCal export URLs

- **Airbnb**: Listing > Availability > Sync calendars > "Export calendar" — copy that URL.
- **VRBO**: Listing > Calendar > "Import/export calendars" > Export — copy that URL.

These go in `AIRBNB_ICAL_URL` / `VRBO_ICAL_URL` below.

## 4. Deploy to Vercel (free)

1. Push this folder to a GitHub repo (or drag-and-drop deploy at https://vercel.com/new).
2. Import the repo at https://vercel.com/new.
3. Before the first deploy, add these Environment Variables (Project Settings > Environment Variables) — copy every key from `.env.example` and fill in real values.
4. Deploy. Vercel gives you a `https://your-project.vercel.app` URL immediately — use that to finish setup below, then point your real domain at it (step 6).
5. Go back to Stripe > Developers > Webhooks > Add endpoint:
   URL = `https://your-project.vercel.app/api/webhook`, event = `checkout.session.completed`.
   Copy the "Signing secret" (`whsec_...`) into `STRIPE_WEBHOOK_SECRET` in Vercel's env vars, then redeploy.
6. Give Airbnb/VRBO your export feed: `https://your-project.vercel.app/api/ical/export`
   (add it as an "import calendar" in each platform's calendar sync settings).

## 5. Connect your cheapdomains.com domain

1. Buy the domain at cheapdomains.com if you haven't already.
2. In Vercel: Project > Settings > Domains > add `www.yourdomain.com` (and the bare
   `yourdomain.com`, which Vercel will offer to redirect to `www`).
3. Vercel shows you exactly which DNS records to add (usually an `A` record for
   the root domain and a `CNAME` for `www`).
4. In cheapdomains.com's dashboard, find DNS management for your domain and add
   those records. Propagation is usually under an hour, sometimes up to 24h.
5. Once it's live, update `NEXT_PUBLIC_SITE_URL` in Vercel's env vars to your
   real domain and redeploy (Stripe's success/cancel redirects use this).

## 6. Swap in your real content

Open `app/page.jsx` — the `PROPERTY` object at the top has your name, location,
description, amenities, and photo paths. Drop real photos in `public/photos/`
and update the filenames to match. Update `NIGHTLY_RATE_USD`, `CLEANING_FEE_USD`,
and `DEPOSIT_PERCENT` (100 = pay in full at booking; e.g. 25 = 25% deposit,
balance collected however you currently handle it — this starter doesn't
automate a second charge for the balance) in your env vars.

## Faster iCal sync (optional, still free)

Vercel's free (Hobby) plan only allows cron jobs to run once a day, so
`vercel.json` is set to sync Airbnb/VRBO once daily — meaning a booking made
on one of those platforms could take up to ~24h to block on your site.

To sync more often for free: create a free account at https://cron-job.org
(or EasyCron) and have it call
`https://yourdomain.com/api/ical/sync` with header
`Authorization: Bearer <your CRON_SECRET>` every 15-30 minutes. Delete the
`crons` block in `vercel.json` if you do this, to avoid double-syncing.

## Known tradeoffs vs. a paid platform (Lodgify/Hospitable/etc.)

- **No true real-time OTA sync.** Nobody outside Airbnb/VRBO's approved
  software partners gets that — even paid platforms rely on the same iCal
  mechanism under the hood. This starter's sync frequency is the same order
  of magnitude as what you'd get elsewhere on a similar budget.
- **You're the one maintaining it.** If Airbnb changes their iCal format or
  Stripe changes an API, that's on you (or whoever you hire) to fix — a paid
  platform absorbs that maintenance for its monthly fee.
- **No AI guest messaging, dynamic pricing, or cleaner notifications** — you
  already have PriceLabs and ResortClean for those, so this only replaces
  the "direct booking website" piece.
- **Deposit-only bookings don't auto-charge the balance.** If you set
  `DEPOSIT_PERCENT` below 100, this starter collects the deposit at booking
  but doesn't automatically charge the remainder before check-in — you'd need
  to manually charge the saved card (via Stripe's dashboard) or extend the
  webhook code to schedule that.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Then open http://localhost:3000.
