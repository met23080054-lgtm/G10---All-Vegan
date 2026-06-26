-- Ngăn voucher giảm vượt quá tổng đơn (không để total âm)
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
  v_max_discount integer;
begin
  if p_code is null or p_code = '' then
    return 0;
  end if;

  select * into v_template from voucher_templates where code = p_code and active;
  if v_template is null then
    raise exception 'Mã giảm giá không hợp lệ';
  end if;

  if p_subtotal < v_template.min_order then
    raise exception 'Đơn hàng chưa đủ điều kiện. Cần đặt tối thiểu %đ để dùng mã này.',
      to_char(v_template.min_order, 'FM999,999,999');
  end if;

  -- voucher đổi bằng điểm phải có user_vouchers riêng, còn chưa dùng, chưa hết hạn
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

  -- Giới hạn giảm không vượt quá tổng đơn (tránh total âm)
  v_max_discount := p_subtotal + p_delivery_fee;
  v_discount := least(v_discount, v_max_discount);

  if p_commit then
    if v_user_voucher_id is not null then
      update user_vouchers set used = true, used_order_id = p_order_id where id = v_user_voucher_id;
    end if;
  end if;

  return v_discount;
end;
$$;
