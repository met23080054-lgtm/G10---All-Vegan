-- Thêm điều kiện đơn tối thiểu cho các reward template
-- Chạy sau 0030 để cập nhật min_order cho các row đã tồn tại

UPDATE voucher_templates SET min_order = 80000  WHERE code = 'REWARDTEA';
UPDATE voucher_templates SET min_order = 100000 WHERE code = 'REWARDSHIP';
UPDATE voucher_templates SET min_order = 120000 WHERE code = 'REWARD30K';
UPDATE voucher_templates SET min_order = 200000 WHERE code = 'REWARD50K';
UPDATE voucher_templates SET min_order = 150000 WHERE code = 'REWARD15PCT';
UPDATE voucher_templates SET min_order = 300000 WHERE code = 'REWARDCOMBO';
