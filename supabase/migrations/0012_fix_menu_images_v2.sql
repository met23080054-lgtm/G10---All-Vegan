-- All Vegan — thay toàn bộ ảnh minh hoạ món bằng ảnh đã được xem trực tiếp để
-- kiểm tra (không chỉ check HTTP 200 như 0009). Ảnh cũ ở nhiều món thực ra là
-- ảnh thịt/hải sản (bò, tôm, giăm bông, burger...) không phù hợp nhà hàng chay.
-- Ảnh mới lấy từ Openverse (Flickr/Wikimedia Commons, license cho phép dùng
-- thương mại: by, by-sa, by-nd, cc0, pdm) — vẫn là ảnh tạm, thay khi có ảnh
-- chụp thật của quán. Chạy SAU 0011_weekday_vouchers.sql.

-- Khai vị — salad
update menu_items set image = 'https://live.staticflickr.com/5292/5473790679_04610a557b_b.jpg' where id = '101'; -- seaweed salad
update menu_items set image = 'https://live.staticflickr.com/3841/14385353064_58e2f63e9d_b.jpg' where id = '102'; -- mixed fruit bowl
update menu_items set image = 'https://upload.wikimedia.org/wikipedia/commons/0/0a/Som_tam_thai.JPG' where id = '103'; -- green papaya/mango salad
update menu_items set image = 'https://live.staticflickr.com/4320/35953699092_e0abc3becb_b.jpg' where id = '104'; -- lotus stem salad

-- Khai vị — súp/cháo
update menu_items set image = 'https://live.staticflickr.com/8343/8182668947_f6a56a9828_b.jpg' where id = '105'; -- pumpkin soup
update menu_items set image = 'https://live.staticflickr.com/3313/3666856580_219d855e20_b.jpg' where id = '106'; -- snow fungus & longan soup
update menu_items set image = 'https://live.staticflickr.com/8542/8695430376_b2965014e2_b.jpg' where id in ('107','108','109'); -- creamy mushroom soup / congee placeholder

-- Mẹt cuốn
update menu_items set image = 'https://upload.wikimedia.org/wikipedia/commons/d/d2/Plat_de_nems.jpg' where id in ('110','117','141','142','159','160'); -- vietnamese roll/wrap platter, buffet placeholder
update menu_items set image = 'https://live.staticflickr.com/2852/10235777053_048a73f22f_b.jpg' where id in ('111','119','130','131','133','137','143','145'); -- grilled mushroom (reused for grilled/mushroom-snack dishes)
update menu_items set image = 'https://live.staticflickr.com/45/128001320_b263bdf827_b.jpg' where id = '112'; -- stir-fried mushroom & tofu lettuce cups

-- Lẩu
update menu_items set image = 'https://live.staticflickr.com/8233/8586109722_3ceaab89d9_b.jpg' where id in ('113','116'); -- thai vegetarian hot pot
update menu_items set image = 'https://live.staticflickr.com/2534/3742419151_1f82dc743b.jpg' where id = '114'; -- tomato vegetable soup
update menu_items set image = 'https://live.staticflickr.com/2033/2433522728_172abbca7d_b.jpg' where id = '115'; -- tom yum hot pot

-- Món chính
update menu_items set image = 'https://live.staticflickr.com/2678/4355111012_55267fab59_b.jpg' where id in ('118','132'); -- braised seitan (vegan "pork belly" / "duck")
update menu_items set image = 'https://live.staticflickr.com/2769/4016218968_79c20dbdd9_b.jpg' where id = '120'; -- creamy mushroom pasta
update menu_items set image = 'https://live.staticflickr.com/2164/2331676388_f5501d483b_b.jpg' where id = '121'; -- vegan bolognese pasta
update menu_items set image = 'https://live.staticflickr.com/4032/4436867307_f50da7144f_b.jpg' where id = '122'; -- japchae glass noodles
update menu_items set image = 'https://live.staticflickr.com/6027/5874136002_67bd12914e_b.jpg' where id in ('123','146'); -- stir-fried mushroom/wood-ear with green pepper
update menu_items set image = 'https://live.staticflickr.com/2106/2268560276_ef078caa43_b.jpg' where id = '124'; -- sichuan-style tofu
update menu_items set image = 'https://live.staticflickr.com/1418/786238129_029558907b_b.jpg' where id = '125'; -- korean spicy tofu stew
update menu_items set image = 'https://live.staticflickr.com/8894/18431243358_11f1148550_b.jpg' where id = '126'; -- tofu in mushroom gravy
update menu_items set image = 'https://live.staticflickr.com/2924/33221248504_5c2a2a92ac_b.jpg' where id = '127'; -- curry steamed bun

-- Best seller
update menu_items set image = 'https://live.staticflickr.com/4085/4837078209_a54697140c_b.jpg' where id = '128'; -- cha ca la vong style (turmeric, dill, scallion)
update menu_items set image = 'https://live.staticflickr.com/2362/2499912105_0d07ed2fc9_b.jpg' where id in ('129','151'); -- herbal soup

-- Món ăn chơi
update menu_items set image = 'https://live.staticflickr.com/5704/30536297690_fc0ccc7e0b_b.jpg' where id = '138'; -- king oyster mushroom
update menu_items set image = 'https://live.staticflickr.com/7462/27550863043_5841dc367a_b.jpg' where id in ('139','140'); -- fried lotus root / crispy fried snack

-- Rau xanh
update menu_items set image = 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Crudites_Platter.JPG' where id = '147'; -- vegetable platter with dipping sauce

-- Canh
update menu_items set image = 'https://live.staticflickr.com/2785/4389731194_8e2fc16b53_b.jpg' where id in ('152','153','154'); -- vegetable sour/tom-yum-style soup

-- No nê
update menu_items set image = 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80' where id = '155'; -- plain rice — reuse fried-rice photo (no clean meat-free "plain rice" photo found)
update menu_items set image = 'https://live.staticflickr.com/3684/13477904703_d094a284ee_b.jpg' where id = '156'; -- brown rice bowl
