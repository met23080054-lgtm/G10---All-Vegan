-- All Vegan — thay toàn bộ mini-game cũ (vòng quay / quiz / gấp sao) bằng MỘT
-- game duy nhất: "Bắt rau củ chay" — rau củ rơi từ trên xuống, chạm để bắt lấy
-- điểm, lỡ tay chạm vào đồ mặn (thịt/hải sản) thì bị trừ điểm. Vui, nhanh, dễ
-- chơi trong lúc chờ món. Các bảng/RPC game cũ (game_spins, star_folds,
-- quiz_questions...) không xoá để không mất dữ liệu lịch sử, nhưng app không
-- gọi tới nữa.
-- Chạy SAU 0013_star_fold_game.sql.

create table veggie_catch_plays (
  user_id uuid not null references profiles(id) on delete cascade,
  play_date date not null default current_date,
  plays_used integer not null default 0,
  primary key (user_id, play_date)
);

alter table veggie_catch_plays enable row level security;
create policy "own veggie catch plays read" on veggie_catch_plays for select using (auth.uid() = user_id);

-- ============ get_veggie_catch_plays_left ============
create function get_veggie_catch_plays_left() returns integer
language sql security definer set search_path = public as $$
  select 5 - coalesce(
    (select plays_used from veggie_catch_plays where user_id = auth.uid() and play_date = current_date),
    0
  );
$$;

-- ============ submit_veggie_catch_score ============
-- p_score: điểm client tính được trong 1 lượt chơi (60 giây). Chặn gian lận bằng cách
-- giới hạn điểm thưởng tối đa quy đổi mỗi lượt (100 điểm), không tin số điểm thô client gửi.
create function submit_veggie_catch_score(p_score integer) returns table(
  points_awarded integer,
  plays_left integer
)
language plpgsql security definer set search_path = public as $$
declare
  v_daily_limit constant integer := 5;
  v_used integer;
  v_points integer;
begin
  insert into veggie_catch_plays (user_id, play_date, plays_used)
  values (auth.uid(), current_date, 1)
  on conflict (user_id, play_date) do update
    set plays_used = veggie_catch_plays.plays_used + 1
    where veggie_catch_plays.plays_used < v_daily_limit
  returning plays_used into v_used;

  if v_used is null then
    raise exception 'Bạn đã chơi hết % lượt hôm nay, mai quay lại nhé!', v_daily_limit;
  end if;

  v_points := least(100, greatest(0, floor(greatest(p_score, 0) / 10.0)::integer));

  if v_points > 0 then
    update profiles set points = points + v_points where id = auth.uid();
    perform recalculate_tier(auth.uid());
  end if;

  return query select v_points, (v_daily_limit - v_used);
end;
$$;
