-- All Vegan — Row Level Security
-- Chạy SAU 0001_schema.sql.

alter table profiles enable row level security;
alter table menu_items enable row level security;
alter table stores enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table voucher_templates enable row level security;
alter table user_vouchers enable row level security;
alter table reviews enable row level security;
alter table game_spins enable row level security;
alter table quiz_questions enable row level security;

-- profiles: chỉ đọc/sửa hàng của chính mình. Không có policy insert/delete cho client
-- (hàng profiles được tạo bởi trigger on_auth_user_created khi signup).
create policy "own profile read" on profiles for select using (auth.uid() = id);
create policy "own profile update" on profiles for update using (auth.uid() = id);

-- menu_items / stores: public read, không ai (trừ SQL Editor với quyền admin) ghi được.
create policy "menu public read" on menu_items for select using (true);
create policy "stores public read" on stores for select using (true);

-- orders / order_items: chỉ đọc hàng của chính mình.
-- Không có policy insert/update -> mọi việc tạo/sửa đơn đi qua RPC place_order() (SECURITY DEFINER).
create policy "own orders read" on orders for select using (auth.uid() = user_id);
create policy "own order_items read" on order_items for select using (
  exists (select 1 from orders o where o.id = order_items.order_id and o.user_id = auth.uid())
);

-- voucher_templates: public read (để client validate code tức thì), không ai ghi được qua client.
create policy "voucher templates public read" on voucher_templates for select using (true);

-- user_vouchers: chỉ đọc hàng của chính mình. Ghi qua RPC redeem_loyalty_reward / validate_and_consume_voucher.
create policy "own vouchers read" on user_vouchers for select using (auth.uid() = user_id);

-- reviews: public read (hiển thị đánh giá người khác), nhưng chỉ tự insert cho chính mình.
-- Không có policy update/delete -> review bất biến sau khi gửi.
create policy "reviews public read" on reviews for select using (true);
create policy "own review insert" on reviews for insert with check (auth.uid() = user_id);

-- game_spins: chỉ đọc hàng của chính mình. Ghi qua RPC spin_wheel().
create policy "own spins read" on game_spins for select using (auth.uid() = user_id);

-- quiz_questions (bảng gốc): KHÔNG có policy nào -> mặc định chặn hoàn toàn select/insert/update/delete
-- cho mọi role kể cả authenticated. Chỉ expose qua view quiz_questions_public (không có correct_index).
grant select on quiz_questions_public to authenticated;
