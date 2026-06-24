-- All Vegan — lưu địa chỉ giao hàng mặc định để lần đặt sau không cần nhập lại.
-- Chạy SAU 0005_delivery_tracking.sql.

alter table profiles add column if not exists default_address text;
