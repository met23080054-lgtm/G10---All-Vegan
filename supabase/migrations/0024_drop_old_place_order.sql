-- Xoá phiên bản cũ của place_order (không có p_payment_method) để tránh
-- lỗi "could not choose the best candidate function" khi Supabase có 2 overload.
-- Phiên bản mới (có p_payment_method) đã được tạo trong 0020_payment_method.sql.

drop function if exists public.place_order(
  p_items jsonb,
  p_type text,
  p_address text,
  p_table_number text,
  p_voucher_code text,
  p_store_lat double precision,
  p_store_lng double precision,
  p_delivery_lat double precision,
  p_delivery_lng double precision,
  p_estimated_minutes integer
);
