-- ============================================================
-- PLZ-057 — Driver App RLS Policies
-- ============================================================

-- ── Enable RLS on drivers ─────────────────────────────────
alter table drivers enable row level security;

-- Drivers can read their own record (by user_id)
create policy "drivers_select_own"
  on drivers for select
  using (user_id = auth.uid());

-- Service role (admin) can insert/update drivers (used during registration)
-- The app uses service client for driver registration — no anon INSERT needed.

-- Drivers can update their own availability and document URLs
create policy "drivers_update_own"
  on drivers for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ── Deliveries: driver can read their own ─────────────────
-- Already has RLS from the merchant app. Add driver policies:

create policy "deliveries_driver_select"
  on deliveries for select
  using (
    driver_id in (
      select id from drivers where user_id = auth.uid()
    )
  );

create policy "deliveries_driver_update"
  on deliveries for update
  using (
    driver_id in (
      select id from drivers where user_id = auth.uid()
    )
  )
  with check (
    driver_id in (
      select id from drivers where user_id = auth.uid()
    )
  );

-- ── Orders: driver can read orders they are delivering ────
create policy "orders_driver_select"
  on orders for select
  using (
    id in (
      select order_id from deliveries
      where driver_id in (
        select id from drivers where user_id = auth.uid()
      )
    )
  );

-- ── Supabase Storage: driver-documents bucket ─────────────
-- Run in Supabase Dashboard → Storage → Policies (or via service client setup):
--
-- Bucket: driver-documents (private)
-- Policy: authenticated drivers can upload to their own folder
--   insert: bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text
-- Policy: authenticated drivers can read their own files
--   select: bucket_id = 'driver-documents' AND (storage.foldername(name))[1] = auth.uid()::text
--
-- SQL equivalent (run once):
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', false)
on conflict (id) do nothing;

create policy "driver_docs_insert"
  on storage.objects for insert
  with check (
    bucket_id = 'driver-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "driver_docs_select"
  on storage.objects for select
  using (
    bucket_id = 'driver-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
