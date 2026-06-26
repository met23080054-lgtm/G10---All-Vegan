-- Cải thiện ảnh món ăn: mỗi nhóm món có 3 ảnh riêng biệt, phù hợp hơn với tên món
-- Ảnh 1 = primary (giữ nguyên), Ảnh 2 = góc khác, Ảnh 3 = cận cảnh chi tiết

-- ============================================================
-- KHAI VỊ — Salad & gỏi (100–104)
-- Dùng ảnh salad đĩa lớn + rau thơm cận cảnh
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1327218/pexels-photo-1327218.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('100','101','102','103','104');

-- ============================================================
-- KHAI VỊ — Súp & cháo (105–109)
-- Dùng ảnh bát súp nóng + cháo với rau phủ
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1907642/pexels-photo-1907642.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4518673/pexels-photo-4518673.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('105','106','107','108','109');

-- ============================================================
-- MẸT CUỐN — gỏi cuốn, cuốn diếp (110–112)
-- Dùng ảnh cuốn tươi bày mẹt + nước chấm cận cảnh
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1199117/pexels-photo-1199117.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4342497/pexels-photo-4342497.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('110','111','112');

-- ============================================================
-- LẨU (113–117)
-- Dùng ảnh nồi lẩu bốc khói + bàn đặt nguyên liệu
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/3987283/pexels-photo-3987283.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2695983/pexels-photo-2695983.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('113','114','115','116','117');

-- ============================================================
-- MÓN CHÍNH — nấm & tàu hũ ky (118–119, 123, 129–132)
-- Dùng ảnh nấm xào/nướng + tàu hũ ky chiên
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('118','119','123','129','130','131','132');

-- MÓN CHÍNH — chả lá lốt (133) — ảnh riêng đã fix từ 0027, giữ nguyên
-- (không update để giữ lại ảnh chả lá lốt đặc trưng)

-- ============================================================
-- MÓN CHÍNH — đậu hũ (124–128)
-- Dùng ảnh đậu hũ chiên/sốt + tofu cắt miếng cận cảnh
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3737156/pexels-photo-3737156.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('124','125','126','127','128');

-- ============================================================
-- MÓN CHÍNH — mì Ý & miến (120–122)
-- Dùng ảnh mì cuộn đĩa + cận cảnh sốt
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/769969/pexels-photo-769969.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('120','121','122');

-- ============================================================
-- PIZZA (134–136)
-- Dùng ảnh pizza cắt lát góc 45° + cận cảnh topping
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1146760/pexels-photo-1146760.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('134','135','136');

-- ============================================================
-- ĂN CHƠI — món chiên/snack (137–145)
-- Dùng ảnh chả giò vàng giòn + đĩa bày cạnh nước chấm
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/5779627/pexels-photo-5779627.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4518672/pexels-photo-4518672.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('137','138','139','140','141','142','143','144','145');

-- ============================================================
-- RAU XANH (146–147)
-- Dùng ảnh rau xào chảo + rau sống tươi tắn
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('146','147');

-- ============================================================
-- MÓN NƯỚC — bún & mì (148–151)
-- Dùng ảnh tô bún góc nghiêng + cận cảnh nước dùng & rau
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/2313686/pexels-photo-2313686.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/247685/pexels-photo-247685.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('148','149','150','151');

-- ============================================================
-- CANH (152–154)
-- Dùng ảnh tô canh bốc khói + cận cảnh rau củ trong canh
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/2695983/pexels-photo-2695983.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4518673/pexels-photo-4518673.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('152','153','154');

-- ============================================================
-- NO NÊ — cơm (155–158)
-- Dùng ảnh đĩa cơm đầy đủ + cận cảnh hạt cơm nấu chín
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1435735/pexels-photo-1435735.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('155','156','157','158');

-- ============================================================
-- BUFFET (159–160) — giữ nguyên từ 0027
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/3987283/pexels-photo-3987283.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('159','160');
