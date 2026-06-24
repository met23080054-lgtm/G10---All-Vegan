-- All Vegan — cập nhật ảnh minh hoạ phù hợp hơn theo từng nhóm món
-- (đã kiểm tra từng URL trả về 200 trước khi đưa vào). Vẫn là ảnh stock,
-- không phải ảnh thật của nhà hàng — thay sau khi có ảnh chụp thật.
-- Chạy SAU 0008_item_notes_and_completion.sql.

-- Khai vị — salad
update menu_items set image = 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80' where id in ('100','103');
update menu_items set image = 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&q=80' where id in ('101','104');
update menu_items set image = 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=400&q=80' where id = '102';
-- Khai vị — súp/cháo
update menu_items set image = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' where id in ('105','106');
update menu_items set image = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' where id in ('107','108');
update menu_items set image = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80' where id = '109';

-- Mẹt cuốn
update menu_items set image = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' where id = '110';
update menu_items set image = 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80' where id = '111';
update menu_items set image = 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&q=80' where id = '112';

-- Lẩu
update menu_items set image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80' where id in ('113','115','117');
update menu_items set image = 'https://images.unsplash.com/photo-1583224964978-2257b960c3d3?w=400&q=80' where id in ('114','116');

-- Món chính
update menu_items set image = 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&q=80' where id = '118';
update menu_items set image = 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80' where id = '119';
update menu_items set image = 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400&q=80' where id in ('120','121');
update menu_items set image = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80' where id = '122';
update menu_items set image = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80' where id = '123';
update menu_items set image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' where id in ('124','125','126');
update menu_items set image = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' where id = '127';

-- Best seller
update menu_items set image = 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&q=80' where id in ('128','131');
update menu_items set image = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' where id = '129';
update menu_items set image = 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80' where id = '130';
update menu_items set image = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&q=80' where id = '132';
update menu_items set image = 'https://images.unsplash.com/photo-1432139509613-5c4255815697?w=400&q=80' where id = '133';

-- Pizza — 3 ảnh khác nhau
update menu_items set image = 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80' where id = '134';
update menu_items set image = 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&q=80' where id = '135';
update menu_items set image = 'https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=400&q=80' where id = '136';

-- Món ăn chơi
update menu_items set image = 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?w=400&q=80' where id in ('137','143');
update menu_items set image = 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80' where id = '138';
update menu_items set image = 'https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=400&q=80' where id in ('139','144');
update menu_items set image = 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80' where id = '140';
update menu_items set image = 'https://images.unsplash.com/photo-1576021182211-9ea8dced3690?w=400&q=80' where id in ('141','142');
update menu_items set image = 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=400&q=80' where id = '145';

-- Rau xanh
update menu_items set image = 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&q=80' where id in ('146','147');

-- Món nước
update menu_items set image = 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400&q=80' where id in ('148','150');
update menu_items set image = 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80' where id = '149';
update menu_items set image = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' where id = '151';

-- Canh
update menu_items set image = 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80' where id in ('152','153');
update menu_items set image = 'https://images.unsplash.com/photo-1547592180-85f173990554?w=400&q=80' where id = '154';

-- No nê
update menu_items set image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80' where id in ('155','156');
update menu_items set image = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80' where id in ('157','158');

-- Buffet
update menu_items set image = 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80' where id = '159';
update menu_items set image = 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80' where id = '160';
