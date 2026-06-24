-- All Vegan — "Gấp sao chờ món": lấy cảm hứng từ trò gấp sao giấy khi xếp hàng
-- chờ ở Haidilao (mỗi sao gấp được đổi một khoản giảm giá nhỏ). Ở đây mỗi lượt
-- bấm "gấp" cộng điểm ngay, và đạt mốc 10/20 sao trong ngày thì được tặng thêm
-- voucher giảm giá nhanh (hết hạn sau 3 ngày) để dùng thử ngay cho đơn tiếp theo.
-- Chạy SAU 0012_fix_menu_images_v2.sql.

create table star_folds (
  user_id uuid not null references profiles(id) on delete cascade,
  fold_date date not null default current_date,
  stars_folded integer not null default 0,
  primary key (user_id, fold_date)
);

alter table star_folds enable row level security;
create policy "own star folds read" on star_folds for select using (auth.uid() = user_id);

-- voucher_templates.points_cost = 1 ở đây chỉ là cờ đánh dấu "voucher được tặng riêng
-- cho người chơi" để validate_and_consume_voucher() bắt buộc kiểm tra user_vouchers
-- (giống cơ chế đổi điểm), không phải giá điểm thật — fold_star() tặng thẳng, không trừ điểm.
insert into voucher_templates (code, name, discount, discount_type, min_order, points_cost, validity_days, active) values
('SAO10', 'Quà gấp sao — Giảm 5.000đ', 5000, 'fixed', 0, 1, 3, true),
('SAO20', 'Quà gấp sao — Giảm 15.000đ', 15000, 'fixed', 0, 1, 3, true)
on conflict (code) do nothing;

-- ============ get_stars_folded_today ============
create function get_stars_folded_today() returns integer
language sql security definer set search_path = public as $$
  select coalesce(
    (select stars_folded from star_folds where user_id = auth.uid() and fold_date = current_date),
    0
  );
$$;

-- ============ fold_star ============
-- Mỗi lần gọi = gấp 1 sao: cộng điểm ngay, tối đa 20 sao/ngày/người.
-- Đạt đúng mốc 10 hoặc 20 (lần đầu trong ngày) thì tặng thêm 1 voucher dùng nhanh.
create function fold_star() returns table(
  stars_folded integer,
  points_awarded integer,
  daily_limit integer,
  milestone_voucher_code text,
  milestone_voucher_name text
)
language plpgsql security definer set search_path = public as $$
declare
  v_daily_limit constant integer := 20;
  v_points_per_star constant integer := 3;
  v_used integer;
  v_voucher_code text := null;
  v_voucher_name text := null;
begin
  insert into star_folds (user_id, fold_date, stars_folded)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, fold_date) do update
    set stars_folded = star_folds.stars_folded + 1
    where star_folds.stars_folded < v_daily_limit
  returning star_folds.stars_folded into v_used;

  if v_used is null then
    raise exception 'Bạn đã gấp đủ % sao hôm nay, mai quay lại nhé!', v_daily_limit;
  end if;

  update profiles set points = points + v_points_per_star where id = auth.uid();
  perform recalculate_tier(auth.uid());

  if v_used = 10 then
    v_voucher_code := 'SAO10';
  elsif v_used = v_daily_limit then
    v_voucher_code := 'SAO20';
  end if;

  if v_voucher_code is not null then
    select name into v_voucher_name from voucher_templates where code = v_voucher_code;
    insert into user_vouchers (user_id, code, expiry) values (auth.uid(), v_voucher_code, current_date + 3);
  end if;

  return query select v_used, v_points_per_star, v_daily_limit, v_voucher_code, v_voucher_name;
end;
$$;
