-- All Vegan — business logic functions (RPC)
-- Chạy SAU 0002_rls.sql.

-- ============ trigger: tự tạo profiles khi signup ============
create function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles (id, name, phone, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Khách All Vegan'),
    coalesce(new.raw_user_meta_data->>'phone', ''),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============ recalculate_tier ============
-- Chỉ nâng tier theo điểm hiện có, không tự hạ (gọi sau khi điểm TĂNG, không gọi khi trừ điểm đổi quà).
create function recalculate_tier(p_user_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_points integer;
  v_new_tier text;
begin
  select points into v_points from profiles where id = p_user_id;
  v_new_tier := case
    when v_points >= 6000 then 'platinum'
    when v_points >= 3000 then 'gold'
    when v_points >= 1000 then 'silver'
    else 'bronze'
  end;
  update profiles set tier = v_new_tier where id = p_user_id and tier <> v_new_tier;
end;
$$;

-- ============ tier point multiplier (helper, dùng nội bộ) ============
create function tier_multiplier(p_tier text) returns numeric
language sql immutable as $$
  select case p_tier
    when 'platinum' then 3
    when 'gold' then 2
    when 'silver' then 1.5
    else 1
  end;
$$;

-- ============ validate_and_consume_voucher ============
-- p_commit = false: chỉ validate + trả về số tiền giảm (preview khi user bấm "Áp dụng").
-- p_commit = true: validate + đánh dấu used (gọi trong transaction của place_order).
create function validate_and_consume_voucher(
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

  -- voucher đổi bằng điểm (points_cost > 0) phải có user_vouchers riêng, còn chưa dùng, chưa hết hạn
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

-- ============ place_order ============
-- p_items: jsonb array dạng [{"id": "1", "quantity": 2}, ...]
create function place_order(
  p_items jsonb,
  p_type text,
  p_address text default null,
  p_table_number text default null,
  p_voucher_code text default null
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

  -- tính subtotal từ giá thật trong menu_items, không tin giá client gửi
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

  if p_voucher_code is not null and p_voucher_code <> '' then
    v_discount := validate_and_consume_voucher(p_voucher_code, v_subtotal, v_delivery_fee, true, v_order_id);
  end if;

  v_total := v_subtotal + v_delivery_fee - v_discount;

  select tier into v_tier from profiles where id = auth.uid();
  v_points := floor(v_total / 1000.0 * tier_multiplier(v_tier));

  insert into orders (id, user_id, total, status, order_type, address, table_number, points_earned, voucher_code)
  values (v_order_id, auth.uid(), v_total, v_status, p_type, p_address, p_table_number, v_points, p_voucher_code)
  returning * into v_new_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_menu_item from menu_items where id = v_item->>'id';
    v_qty := (v_item->>'quantity')::integer;
    insert into order_items (order_id, menu_item_id, name, price, quantity)
    values (v_order_id, v_menu_item.id, v_menu_item.name, v_menu_item.price, v_qty);
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

-- ============ redeem_loyalty_reward ============
create function redeem_loyalty_reward(p_reward_code text) returns user_vouchers
language plpgsql security definer set search_path = public as $$
declare
  v_template voucher_templates;
  v_new_voucher user_vouchers;
  v_updated integer;
begin
  select * into v_template from voucher_templates where code = p_reward_code and active and points_cost > 0;
  if v_template is null then
    raise exception 'Phần thưởng không hợp lệ';
  end if;

  update profiles set points = points - v_template.points_cost
    where id = auth.uid() and points >= v_template.points_cost;
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    raise exception 'Không đủ điểm để đổi quà này';
  end if;

  insert into user_vouchers (user_id, code, expiry)
  values (auth.uid(), p_reward_code, current_date + coalesce(v_template.validity_days, 30))
  returning * into v_new_voucher;

  return v_new_voucher;
end;
$$;

-- ============ get_spins_left ============
create function get_spins_left() returns integer
language sql security definer set search_path = public as $$
  select 3 - coalesce(
    (select spins_used from game_spins where user_id = auth.uid() and spin_date = current_date),
    0
  );
$$;

-- ============ spin_wheel ============
create function spin_wheel() returns table(points integer, label text)
language plpgsql security definer set search_path = public as $$
declare
  v_used integer;
  v_rand double precision;
  v_cumulative double precision := 0;
  v_prizes jsonb := '[
    {"label": "50 điểm", "points": 50, "probability": 0.25},
    {"label": "100 điểm", "points": 100, "probability": 0.20},
    {"label": "200 điểm", "points": 200, "probability": 0.15},
    {"label": "Chúc bạn may mắn", "points": 0, "probability": 0.15},
    {"label": "30 điểm", "points": 30, "probability": 0.10},
    {"label": "500 điểm", "points": 500, "probability": 0.05},
    {"label": "150 điểm", "points": 150, "probability": 0.10}
  ]'::jsonb;
  v_prize jsonb;
  v_points integer := 0;
  v_label text := '';
begin
  insert into game_spins (user_id, spin_date, spins_used)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, spin_date) do update
    set spins_used = game_spins.spins_used + 1
    where game_spins.spins_used < 3
  returning spins_used into v_used;

  if v_used is null then
    raise exception 'Bạn đã hết lượt quay hôm nay';
  end if;

  v_rand := random();
  for v_prize in select * from jsonb_array_elements(v_prizes) loop
    v_cumulative := v_cumulative + (v_prize->>'probability')::double precision;
    if v_rand < v_cumulative then
      v_points := (v_prize->>'points')::integer;
      v_label := v_prize->>'label';
      exit;
    end if;
  end loop;

  if v_points > 0 then
    update profiles set points = points + v_points where id = auth.uid();
    perform recalculate_tier(auth.uid());
  end if;

  return query select v_points, v_label;
end;
$$;

-- ============ submit_quiz_answer ============
-- correct_index chỉ trả về SAU khi đã ghi nhận câu trả lời của user, nên không thể dùng
-- response để đoán đáp án trước khi trả lời (chỉ lộ ra khi đã submit xong).
create function submit_quiz_answer(p_question_id bigint, p_selected_index smallint)
returns table(correct boolean, points_awarded integer, correct_index smallint)
language plpgsql security definer set search_path = public as $$
declare
  v_question quiz_questions;
  v_correct boolean;
  v_awarded integer := 0;
begin
  select * into v_question from quiz_questions where id = p_question_id;
  if v_question is null then
    raise exception 'Câu hỏi không tồn tại';
  end if;

  v_correct := (p_selected_index = v_question.correct_index);
  if v_correct then
    v_awarded := v_question.points;
    update profiles set points = points + v_awarded where id = auth.uid();
    perform recalculate_tier(auth.uid());
  end if;

  return query select v_correct, v_awarded, v_question.correct_index;
end;
$$;

-- ============ submit_review ============
create function submit_review(
  p_order_id text,
  p_overall smallint,
  p_category_ratings jsonb,
  p_comment text,
  p_quick_tags text[]
) returns reviews
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_new_review reviews;
  v_points integer := 50;
begin
  select name into v_name from profiles where id = auth.uid();

  insert into reviews (user_id, reviewer_name, order_id, overall_rating, category_ratings, comment, quick_tags, points_awarded)
  values (auth.uid(), v_name, p_order_id, p_overall, p_category_ratings, p_comment, p_quick_tags, v_points)
  on conflict (user_id, order_id) do nothing
  returning * into v_new_review;

  if v_new_review is null then
    raise exception 'Bạn đã đánh giá đơn hàng này rồi';
  end if;

  update profiles set points = points + v_points where id = auth.uid();
  perform recalculate_tier(auth.uid());

  return v_new_review;
end;
$$;
