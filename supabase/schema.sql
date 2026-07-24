-- Run this in Supabase: Project > SQL Editor > New Query > paste > Run

-- One row per night that is unavailable, from any source.
create table if not exists blocked_dates (
  id bigint generated always as identity primary key,
  date date not null,
  source text not null,            -- 'airbnb' | 'vrbo' | 'direct'
  booking_id bigint,                -- links to bookings.id when source = 'direct'
  created_at timestamptz default now(),
  unique (date, source)
);

-- One row per direct booking made through your own site.
create table if not exists bookings (
  id bigint generated always as identity primary key,
  guest_name text not null,
  guest_email text not null,
  check_in date not null,
  check_out date not null,
  nights int not null,
  amount_total_cents int not null,
  amount_paid_cents int not null default 0,
  stripe_session_id text unique,
  status text not null default 'pending', -- 'pending' | 'paid' | 'cancelled'
  created_at timestamptz default now()
);

create index if not exists idx_blocked_dates_date on blocked_dates (date);
create index if not exists idx_bookings_dates on bookings (check_in, check_out);
