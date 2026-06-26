-- Fix lỗi FK violation khi dùng voucher:
-- Trong place_order cũ, validate_and_consume_voucher được gọi với p_commit=true
-- và used_order_id=v_order_id TRƯỚC khi order được insert vào bảng orders.
-- FK "user_vouchers_used_order_id_fkey" => orders.id thất bại vì order chưa tồn tại.
--
-- Fix: Tách thành 2 bước:
--   Bước 1: validate_and_consume_voucher(p_commit=false) => chỉ tính discount + lock row
--   Bước 2: INSERT order
--   Bước 3: UPDATE user_vouchers trực tiếp (order đã tồn tại, FK thoả mãn)

create or replace function place_order(
  p_items jsonb,
  p_type text,
  p_address text default null,
  p_table_number text default null,
  p_voucher_code text default null,
  p_store_lat double precision default null,
  p_store_lng double precision default null,
  p_delivery_lat double precision default null,
  p_delivery_lng double precision default null,
  p_estimated_minutes integer default null,
  p_payment_method text default 'cash'
) returns orders
language plpgsql security definer set search_path = public as $$
declare
  v_subtotal integer := 0;
  v_delivery_fee integer := 0;
  v_discount integer := 0;
  v_total integer;
  v_points integer;
  v_order_id text;
  v_status text;
  v_tier text;
  v_item jsonb;
  v_menu_item menu_items;
  v_qty integer;
  v_new_order orders;
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Giỏ hàng trống';
  end if;

  if p_payment_method not in ('cash', 'momo', 'vnpay', 'zalopay', 'bank_transfer') then
    raise exception 'Phương thức thanh toán không hợp lệ';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_menu_item from menu_items where id = v_item->>'id';
    if v_menu_item is null then
      raise exception 'Món % không tồn tại', v_item->>'id';
    end if;
    v_qty := (v_item->>'quantity')::integer;
    v_subtotal := v_subtotal + v_menu_item.price * v_qty;
  end loop;

  if p_type = 'delivery' then
    v_delivery_fee := case
      when v_subtotal <= 150000 then 30000
      when v_subtotal < 300000 then 15000
      else 0
    end;
    v_status := 'delivering';
  else
    v_status := 'confirmed';
  end if;

  v_order_id := 'ORD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('order_seq')::text, 3, '0');

  -- Bước 1: Validate voucher + lấy discount (KHÔNG commit, chỉ preview + lock row)
  if p_voucher_code is not null and p_voucher_code <> '' then
    v_discount := validate_and_consume_voucher(p_voucher_code, v_subtotal, v_delivery_fee, false, null);
  end if;

  v_total := v_subtotal + v_delivery_fee - v_discount;

  select tier into v_tier from profiles where id = auth.uid();
  v_points := floor(v_total / 1000.0 * tier_multiplier(v_tier));

  -- Bước 2: INSERT order trước (để FK used_order_id có thể trỏ vào)
  insert into orders (
    id, user_id, total, status, order_type, address, table_number, points_earned, voucher_code,
    store_lat, store_lng, delivery_lat, delivery_lng, estimated_minutes, payment_method
  )
  values (
    v_order_id, auth.uid(), v_total, v_status, p_type, p_address, p_table_number, v_points, p_voucher_code,
    p_store_lat, p_store_lng, p_delivery_lat, p_delivery_lng, p_estimated_minutes, p_payment_method
  )
  returning * into v_new_order;

  -- Bước 3: Sau khi order tồn tại, mới đánh dấu voucher đã dùng (FK thoả mãn)
  if p_voucher_code is not null and p_voucher_code <> '' then
    update user_vouchers
    set used = true, used_order_id = v_order_id
    where user_id = auth.uid()
      and code = p_voucher_code
      and not used
      and expiry >= current_date;
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_menu_item from menu_items where id = v_item->>'id';
    v_qty := (v_item->>'quantity')::integer;
    insert into order_items (order_id, menu_item_id, name, price, quantity, note)
    values (v_order_id, v_menu_item.id, v_menu_item.name, v_menu_item.price, v_qty, v_item->>'note');
  end loop;

  update profiles set
    points = points + v_points,
    orders_count = orders_count + 1,
    total_spent = total_spent + v_total
  where id = auth.uid();

  perform recalculate_tier(auth.uid());

  return v_new_order;
end;
$$;
