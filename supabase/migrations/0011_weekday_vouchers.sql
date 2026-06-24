-- All Vegan — voucher chỉ áp dụng vào đúng (các) ngày trong tuần được chỉ định
-- (dow: 0=CN, 1=Thứ 2, ..., 6=Thứ 7). null/rỗng = áp dụng mọi ngày.
-- Chạy SAU 0010_item_ratings.sql.

alter table voucher_templates add column if not exists valid_weekdays int[];

create or replace function validate_and_consume_voucher(
  p_code text,
  p_subtotal integer,
  p_delivery_fee integer default 0,
  p_commit boolean default false,
  p_order_id text default null
) returns integer
language plpgsql security definer set search_path = public as $$
declare
  v_template voucher_templates;
  v_user_voucher_id bigint;
  v_discount integer;
  v_today_dow integer;
  v_weekday_names text[] := array['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
begin
  if p_code is null or p_code = '' then
    return 0;
  end if;

  select * into v_template from voucher_templates where code = p_code and active;
  if v_template is null then
    raise exception 'Mã giảm giá không hợp lệ';
  end if;

  if p_subtotal < v_template.min_order then
    raise exception 'Đơn hàng chưa đủ điều kiện áp dụng mã này';
  end if;

  if v_template.valid_weekdays is not null and array_length(v_template.valid_weekdays, 1) > 0 then
    v_today_dow := extract(dow from now())::integer;
    if not (v_today_dow = any(v_template.valid_weekdays)) then
      raise exception 'Mã % chỉ áp dụng vào %', p_code,
        array_to_string((select array_agg(v_weekday_names[d + 1]) from unnest(v_template.valid_weekdays) d), ', ');
    end if;
  end if;

  if v_template.points_cost > 0 then
    select id into v_user_voucher_id from user_vouchers
      where user_id = auth.uid() and code = p_code and not used and expiry >= current_date
      order by redeemed_at desc limit 1
      for update;
    if v_user_voucher_id is null then
      raise exception 'Bạn không có voucher này hoặc đã dùng/hết hạn';
    end if;
  elsif v_template.fixed_expiry is not null and v_template.fixed_expiry < current_date then
    raise exception 'Mã giảm giá đã hết hạn';
  end if;

  v_discount := case
    when v_template.code = 'FREESHIP' then p_delivery_fee
    when v_template.discount_type = 'percent' then round(p_subtotal * v_template.discount / 100.0)
    else v_template.discount
  end;

  if p_commit then
    if v_user_voucher_id is not null then
      update user_vouchers set used = true, used_order_id = p_order_id where id = v_user_voucher_id;
    end if;
  end if;

  return v_discount;
end;
$$;

-- Voucher mẫu minh hoạ banner trang chủ
insert into voucher_templates (code, name, discount, discount_type, min_order, points_cost, fixed_expiry, active, valid_weekdays) values
('TUESDAY10', 'Giảm 10% mỗi Thứ 3', 10, 'percent', 50000, 0, '2026-12-31', true, array[2]),
('TANG20K', 'Tặng 20.000đ cho đơn từ 150k', 20000, 'fixed', 150000, 0, '2026-12-31', true, null)
on conflict (code) do nothing;
