-- All Vegan — đánh giá riêng từng món ăn trong đơn (ngoài đánh giá tổng thể theo category).
-- Chạy SAU 0009_fix_menu_images.sql.

alter table reviews add column if not exists item_ratings jsonb not null default '{}';

create or replace function submit_review(
  p_order_id text,
  p_overall smallint,
  p_category_ratings jsonb,
  p_comment text,
  p_quick_tags text[],
  p_item_ratings jsonb default '{}'
) returns reviews
language plpgsql security definer set search_path = public as $$
declare
  v_name text;
  v_new_review reviews;
  v_points integer := 50;
begin
  select name into v_name from profiles where id = auth.uid();

  insert into reviews (user_id, reviewer_name, order_id, overall_rating, category_ratings, comment, quick_tags, item_ratings, points_awarded)
  values (auth.uid(), v_name, p_order_id, p_overall, p_category_ratings, p_comment, p_quick_tags, p_item_ratings, v_points)
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
