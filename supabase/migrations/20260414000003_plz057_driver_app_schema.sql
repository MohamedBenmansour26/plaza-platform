-- ============================================================
-- PLZ-057 — Driver App Schema
-- Extends drivers table with auth + onboarding columns.
-- Extends deliveries table with confirmation + issue columns.
-- ============================================================

-- ── drivers: auth columns ──────────────────────────────────
alter table drivers
  add column if not exists user_id       uuid references auth.users (id) on delete set null,
  add column if not exists otp_attempts  integer not null default 0,
  add column if not exists locked_until  timestamptz,
  add column if not exists phone_verified boolean not null default false;

-- ── drivers: onboarding columns ───────────────────────────
alter table drivers
  add column if not exists vehicle_type        text check (vehicle_type in ('moto','velo','voiture','autre')),
  add column if not exists license_photo_url   text,
  add column if not exists insurance_url       text,
  add column if not exists id_front_url        text,
  add column if not exists id_back_url         text,
  add column if not exists onboarding_status   text not null default 'pending_onboarding'
    check (onboarding_status in ('pending_onboarding','pending_validation','active','suspended'));

create unique index if not exists drivers_user_id_idx on drivers (user_id)
  where user_id is not null;

create index if not exists drivers_phone_idx on drivers (phone);
create index if not exists drivers_onboarding_status_idx on drivers (onboarding_status);

-- ── deliveries: confirmation + issue columns ───────────────
alter table deliveries
  add column if not exists collection_photo_url text,
  add column if not exists delivery_photo_url   text,
  add column if not exists cod_confirmed        boolean not null default false,
  add column if not exists issue_type           text
    check (issue_type in ('client_absent','client_refuse','wrong_address','damaged','payment_issue','other')),
  add column if not exists issue_notes          text,
  add column if not exists issue_photo_url      text;
