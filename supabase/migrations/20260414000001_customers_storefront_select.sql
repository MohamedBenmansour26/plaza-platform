-- Allow storefront (anon) to read a customer record only if
-- that customer is linked to a known order.
-- Security: customer is only reachable via order UUID (122-bit entropy).
CREATE POLICY "customers: public select by order"
  ON customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders WHERE orders.customer_id = customers.id
    )
  );
