-- ============================================================
-- PLZ-090a: product images jsonb + backfill
-- ============================================================
-- Foundation for multi-image product gallery (PLZ-090b storefront,
-- PLZ-090c merchant upload). Backfill-safe, idempotent, no UI impact.
--
-- image_url column is intentionally preserved as a safety net and
-- will be dropped in a follow-up migration after one full release
-- cycle of production verification.
-- ============================================================

-- 1. Add images jsonb column with empty-array default.
alter table public.products
  add column if not exists images jsonb not null default '[]'::jsonb;

-- 2. Backfill: for every product with a non-empty image_url, populate
--    images with [{"url": <image_url>, "alt": ""}]. The
--    jsonb_array_length guard makes this safe to re-run.
update public.products
set images = jsonb_build_array(jsonb_build_object('url', image_url, 'alt', ''))
where (image_url is not null and image_url <> '')
  and (images is null or jsonb_array_length(images) = 0);

-- 3. Shape + soft-cap constraint (idempotent via DO block).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'products_images_shape'
  ) then
    alter table public.products
      add constraint products_images_shape check (
        jsonb_typeof(images) = 'array'
        and jsonb_array_length(images) <= 8
      );
  end if;
end $$;
