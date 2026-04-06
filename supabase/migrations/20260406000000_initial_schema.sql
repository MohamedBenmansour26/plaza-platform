-- ============================================================
-- Plaza Platform — Initial Schema
-- Migration: 20260406000000_initial_schema
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

create type payment_method as enum ('cod', 'card_terminal', 'card');
create type payment_status  as enum ('pending', 'paid', 'failed');
create type order_status    as enum ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled');
create type delivery_type   as enum ('same_city', 'inter_city');
create type delivery_status as enum ('pending', 'dispatched', 'completed', 'failed');

-- ============================================================
-- TABLE: merchants
-- One merchant per auth user at MVP.
-- ============================================================

create table merchants (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  store_name   text not null,
  store_slug   text not null unique,
  description  text,
  logo_url     text,
  created_at   timestamptz not null default now(),

  constraint merchants_user_id_unique unique (user_id)
);

create index merchants_user_id_idx on merchants (user_id);
create index merchants_store_slug_idx on merchants (store_slug);

-- ============================================================
-- TABLE: products
-- ============================================================

create table products (
  id              uuid primary key default gen_random_uuid(),
  merchant_id     uuid not null references merchants (id) on delete cascade,
  name_fr         text not null,
  name_ar         text not null,
  description_fr  text,
  description_ar  text,
  price           integer not null check (price >= 0),   -- centimes MAD
  stock           integer not null default 0 check (stock >= 0),
  image_url       text,
  is_active       boolean not null default true,
  created_at      timestamptz not null default now()
);

create index products_merchant_id_idx on products (merchant_id);
create index products_is_active_idx   on products (is_active);

-- ============================================================
-- TABLE: orders
-- ============================================================

create table orders (
  id               uuid primary key default gen_random_uuid(),
  merchant_id      uuid not null references merchants (id) on delete restrict,
  customer_name    text not null,
  customer_phone   text not null,
  customer_address text not null,
  total_amount     integer not null check (total_amount >= 0),  -- centimes MAD
  payment_method   payment_method not null,
  payment_status   payment_status not null default 'pending',
  status           order_status not null default 'pending',
  created_at       timestamptz not null default now()
);

create index orders_merchant_id_idx on orders (merchant_id);
create index orders_status_idx      on orders (status);
create index orders_created_at_idx  on orders (created_at desc);

-- ============================================================
-- TABLE: order_items
-- ============================================================

create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references orders (id) on delete cascade,
  product_id  uuid not null references products (id) on delete restrict,
  quantity    integer not null check (quantity > 0),
  unit_price  integer not null check (unit_price >= 0)  -- centimes MAD, snapshot at order time
);

create index order_items_order_id_idx   on order_items (order_id);
create index order_items_product_id_idx on order_items (product_id);

-- ============================================================
-- TABLE: deliveries
-- Delivery fee: 2900 centimes (29 MAD) same_city
--               3900 centimes (39 MAD) inter_city
-- ============================================================

create table deliveries (
  id             uuid primary key default gen_random_uuid(),
  order_id       uuid not null references orders (id) on delete restrict,
  merchant_id    uuid not null references merchants (id) on delete restrict,
  delivery_type  delivery_type not null,
  fee            integer not null check (fee in (2900, 3900)),  -- centimes MAD
  status         delivery_status not null default 'pending',
  created_at     timestamptz not null default now(),

  constraint deliveries_order_id_unique unique (order_id)
);

create index deliveries_merchant_id_idx on deliveries (merchant_id);
create index deliveries_status_idx      on deliveries (status);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table merchants   enable row level security;
alter table products    enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;
alter table deliveries  enable row level security;

-- -------------------------------------------------------
-- merchants: owner can read/write their own row only
-- -------------------------------------------------------

create policy "merchants: owner select"
  on merchants for select
  using (user_id = auth.uid());

create policy "merchants: owner insert"
  on merchants for insert
  with check (user_id = auth.uid());

create policy "merchants: owner update"
  on merchants for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "merchants: owner delete"
  on merchants for delete
  using (user_id = auth.uid());

-- -------------------------------------------------------
-- products: owner can CRUD, public can SELECT active products
-- -------------------------------------------------------

create policy "products: public select active"
  on products for select
  using (
    is_active = true
    or exists (
      select 1 from merchants
      where merchants.id = products.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "products: owner insert"
  on products for insert
  with check (
    exists (
      select 1 from merchants
      where merchants.id = products.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "products: owner update"
  on products for update
  using (
    exists (
      select 1 from merchants
      where merchants.id = products.merchant_id
        and merchants.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from merchants
      where merchants.id = products.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "products: owner delete"
  on products for delete
  using (
    exists (
      select 1 from merchants
      where merchants.id = products.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- orders: owner can read/write, public (anon) can INSERT
-- -------------------------------------------------------

create policy "orders: owner select"
  on orders for select
  using (
    exists (
      select 1 from merchants
      where merchants.id = orders.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "orders: public insert"
  on orders for insert
  with check (true);

create policy "orders: owner update"
  on orders for update
  using (
    exists (
      select 1 from merchants
      where merchants.id = orders.merchant_id
        and merchants.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from merchants
      where merchants.id = orders.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "orders: owner delete"
  on orders for delete
  using (
    exists (
      select 1 from merchants
      where merchants.id = orders.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- order_items: same as orders (owner read/write, public INSERT)
-- -------------------------------------------------------

create policy "order_items: owner select"
  on order_items for select
  using (
    exists (
      select 1 from orders
      join merchants on merchants.id = orders.merchant_id
      where orders.id = order_items.order_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "order_items: public insert"
  on order_items for insert
  with check (true);

create policy "order_items: owner update"
  on order_items for update
  using (
    exists (
      select 1 from orders
      join merchants on merchants.id = orders.merchant_id
      where orders.id = order_items.order_id
        and merchants.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from orders
      join merchants on merchants.id = orders.merchant_id
      where orders.id = order_items.order_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "order_items: owner delete"
  on order_items for delete
  using (
    exists (
      select 1 from orders
      join merchants on merchants.id = orders.merchant_id
      where orders.id = order_items.order_id
        and merchants.user_id = auth.uid()
    )
  );

-- -------------------------------------------------------
-- deliveries: owner can read/write only
-- -------------------------------------------------------

create policy "deliveries: owner select"
  on deliveries for select
  using (
    exists (
      select 1 from merchants
      where merchants.id = deliveries.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "deliveries: owner insert"
  on deliveries for insert
  with check (
    exists (
      select 1 from merchants
      where merchants.id = deliveries.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "deliveries: owner update"
  on deliveries for update
  using (
    exists (
      select 1 from merchants
      where merchants.id = deliveries.merchant_id
        and merchants.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from merchants
      where merchants.id = deliveries.merchant_id
        and merchants.user_id = auth.uid()
    )
  );

create policy "deliveries: owner delete"
  on deliveries for delete
  using (
    exists (
      select 1 from merchants
      where merchants.id = deliveries.merchant_id
        and merchants.user_id = auth.uid()
    )
  );
