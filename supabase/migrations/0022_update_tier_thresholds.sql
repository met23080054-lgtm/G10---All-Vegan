-- Update tier thresholds: Bronze 0-2999, Silver 3000-9999, Gold 10000-24999, Platinum 25000+
create or replace function recalculate_tier(p_user_id uuid) returns void
language plpgsql security definer as $$
declare
  v_points integer;
  v_new_tier text;
begin
  select points into v_points from profiles where id = p_user_id;
  v_new_tier := case
    when v_points >= 25000 then 'platinum'
    when v_points >= 10000 then 'gold'
    when v_points >= 3000  then 'silver'
    else 'bronze'
  end;
  update profiles set tier = v_new_tier where id = p_user_id and tier <> v_new_tier;
end;
$$;

-- Re-evaluate tiers for all existing users under the new thresholds
do $$
declare
  uid uuid;
begin
  for uid in select id from profiles loop
    perform recalculate_tier(uid);
  end loop;
end;
$$;
