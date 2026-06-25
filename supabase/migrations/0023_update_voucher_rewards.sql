-- Rename reward vouchers and raise their points_cost in line with new tier thresholds.
-- Old tiers: Bronze 0-999, Silver 1000-2999, Gold 3000-5999, Platinum 6000+
-- New tiers: Bronze 0-2999, Silver 3000-9999, Gold 10000-24999, Platinum 25000+
-- Points costs scaled ~3-8x accordingly.

update voucher_templates set
  name = 'Tặng 1 ly trà xanh',
  points_cost = 1000
where code = 'REWARDTEA';

update voucher_templates set
  name = 'Miễn phí giao hàng',
  points_cost = 1500
where code = 'REWARDSHIP';

update voucher_templates set
  name = 'Giảm 30.000đ đơn tiếp theo',
  points_cost = 2500
where code = 'REWARD30K';

update voucher_templates set
  name = 'Giảm 50.000đ đơn tiếp theo',
  points_cost = 4000
where code = 'REWARD50K';

update voucher_templates set
  name = 'Ưu đãi 15% tổng đơn hàng',
  points_cost = 6000
where code = 'REWARD15PCT';

update voucher_templates set
  name = 'Combo ưu đãi trị giá 100.000đ',
  points_cost = 10000
where code = 'REWARDCOMBO';
