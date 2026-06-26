-- Đảm bảo các reward template chuẩn tồn tại và active=true
-- Xử lý trường hợp chạy lại an toàn (ON CONFLICT DO UPDATE)

INSERT INTO voucher_templates (code, name, discount, discount_type, min_order, points_cost, validity_days, active)
VALUES
  ('REWARDTEA',   'Tặng 1 ly trà xanh',              35000,  'fixed',   80000,   1000,  30, true),
  ('REWARDSHIP',  'Miễn phí giao hàng',               30000,  'fixed',   100000,  1500,  30, true),
  ('REWARD30K',   'Giảm 30.000đ đơn tiếp theo',       30000,  'fixed',   120000,  2500,  30, true),
  ('REWARD50K',   'Giảm 50.000đ đơn tiếp theo',       50000,  'fixed',   200000,  4000,  30, true),
  ('REWARD15PCT', 'Ưu đãi 15% tổng đơn hàng',         15,     'percent', 150000,  6000,  30, true),
  ('REWARDCOMBO', 'Combo ưu đãi trị giá 100.000đ',    100000, 'fixed',   300000,  10000, 30, true)
ON CONFLICT (code) DO UPDATE SET
  name          = EXCLUDED.name,
  discount      = EXCLUDED.discount,
  discount_type = EXCLUDED.discount_type,
  min_order     = EXCLUDED.min_order,
  points_cost   = EXCLUDED.points_cost,
  validity_days = EXCLUDED.validity_days,
  active        = true;

-- Vô hiệu hoá các template không hợp lệ (points_cost quá thấp hoặc tên sai)
UPDATE voucher_templates
SET active = false
WHERE points_cost > 0
  AND points_cost < 100
  AND code NOT IN ('REWARDTEA','REWARDSHIP','REWARD30K','REWARD50K','REWARD15PCT','REWARDCOMBO');
