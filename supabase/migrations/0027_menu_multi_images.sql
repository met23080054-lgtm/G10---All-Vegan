-- Thêm cột images[] (3 ảnh/món: tổng thể, cận cảnh, góc khác)
-- Sửa ảnh sai của id=133 (chả lá lốt dùng nhầm ảnh nấm nướng id=111)
-- Cập nhật mô tả chi tiết hơn cho buffet và một số món

ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';

-- ============================================================
-- KHAI VỊ — Salad & gỏi (100–104)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('100','101','102','103','104');

-- KHAI VỊ — Súp & cháo (105–109)
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/2695983/pexels-photo-2695983.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('105','106','107','108','109');

-- ============================================================
-- MẸT CUỐN (110–112)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/5779627/pexels-photo-5779627.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/4342497/pexels-photo-4342497.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('110','111','112');

-- ============================================================
-- LẨU (113–117)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/3987283/pexels-photo-3987283.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2695983/pexels-photo-2695983.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('113','114','115','116','117');

-- ============================================================
-- MÓN CHÍNH — nấm & tàu hũ ky (118–119, 129–133)
-- Sửa ảnh id=133 (chả lá lốt bị nhầm sang ảnh nấm nướng)
-- ============================================================
UPDATE menu_items SET
  image  = 'https://images.pexels.com/photos/6249494/pexels-photo-6249494.jpeg?auto=compress&cs=tinysrgb&w=800',
  images = ARRAY[
    'https://images.pexels.com/photos/6249494/pexels-photo-6249494.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3987283/pexels-photo-3987283.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=800'
  ]
WHERE id = '133';

UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/3987283/pexels-photo-3987283.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/674574/pexels-photo-674574.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('118','119','123','129','130','131','132');

-- MÓN CHÍNH — đậu hũ (124–128)
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('124','125','126','127','128');

-- MÓN CHÍNH — mì Ý & miến (120–122)
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('120','121','122');

-- ============================================================
-- PIZZA (134–136)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/825661/pexels-photo-825661.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('134','135','136');

-- ============================================================
-- ĂN CHƠI — snacks (137–145)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('137','138','139','140','141','142','143','144','145');

-- ============================================================
-- RAU XANH (146–147)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('146','147');

-- ============================================================
-- MÓN NƯỚC — bún & mì (148–151)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/247685/pexels-photo-247685.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/2695983/pexels-photo-2695983.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('148','149','150','151');

-- ============================================================
-- CANH (152–154)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/2695983/pexels-photo-2695983.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640773/pexels-photo-1640773.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('152','153','154');

-- ============================================================
-- NO NÊ — cơm (155–158)
-- ============================================================
UPDATE menu_items SET images = ARRAY[image,
  'https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1640775/pexels-photo-1640775.jpeg?auto=compress&cs=tinysrgb&w=800'
] WHERE id IN ('155','156','157','158');

-- ============================================================
-- BUFFET (159–160) — ảnh + mô tả mới
-- ============================================================
UPDATE menu_items SET
  images = ARRAY[image,
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  description = 'Buffet trưa All Vegan tầng 2 với hơn 20 món chay luân phiên theo ngày: gỏi cuốn, súp kem nấm, mì Ý sốt nấm, cơm chiên, đậu hũ kho, rau củ xào, canh và tráng miệng trái cây tươi. Ăn không giới hạn trong 90 phút, phù hợp nhóm 2–6 người.'
WHERE id = '159';

UPDATE menu_items SET
  images = ARRAY[image,
    'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/3987283/pexels-photo-3987283.jpeg?auto=compress&cs=tinysrgb&w=800'
  ],
  description = 'Buffet tối All Vegan tầng 2 phong phú hơn bữa trưa: thêm các món nướng (nấm, đậu hũ ky, rau củ), lẩu nấm thanh tự chọn và một vài món pizza chay. Tráng miệng có chè, trái cây và bánh ngọt chay. Ăn không giới hạn trong 2 giờ.'
WHERE id = '160';
