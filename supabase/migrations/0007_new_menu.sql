-- All Vegan — thay toàn bộ thực đơn theo menu thật của nhà hàng (12 món demo cũ bị ẩn,
-- không xoá vì order_items cũ đang tham chiếu tới chúng).
-- Chạy SAU 0006_default_address.sql.

alter table menu_items add column if not exists active boolean not null default true;

update menu_items set active = false; -- ẩn 12 món demo cũ khỏi giao diện đặt món

-- Ảnh tạm dùng lại ảnh stock có sẵn (chưa có ảnh thật từng món) — thay sau khi có ảnh thật.
insert into menu_items (id, name, name_en, category, price, description, image, tags, popular, is_new, active) values
-- Món khai vị
('100', 'Salad rau mix hạt / sốt bơ thảo mộc', 'Mixed Salad with Herb Avocado Sauce', 'khai-vi', 88000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Khai vị'], false, true, true),
('101', 'Salad rong nho / sốt mè rang', 'Seaweed Grape Salad with Roasted Sesame Sauce', 'khai-vi', 88000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Khai vị'], false, true, true),
('102', 'Salad hoa quả 4 mùa / sốt chanh leo', 'Seasonal Fruit Salad with Passion Fruit Sauce', 'khai-vi', 88000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Khai vị'], false, true, true),
('103', 'Gỏi xoài thái chua cay', 'Spicy Mango Salad', 'khai-vi', 58000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Khai vị'], false, false, true),
('104', 'Gỏi ngó sen', 'Lotus Stem Salad', 'khai-vi', 68000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Khai vị'], false, false, true),
('105', 'Súp bí đỏ hạt điều', 'Pumpkin Cashew Soup', 'khai-vi', 48000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Khai vị'], false, false, true),
('106', 'Súp bạch tuyết', 'White Snow Soup', 'khai-vi', 48000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Khai vị'], false, false, true),
('107', 'Súp kem nấm dừa sấy giòn', 'Creamy Mushroom Soup with Crispy Coconut', 'khai-vi', 58000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Khai vị'], false, false, true),
('108', 'Cháo nấm thực dưỡng', 'Macrobiotic Mushroom Congee', 'khai-vi', 48000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Khai vị'], false, false, true),
('109', 'Cháo sườn mỡ hành', 'Pork Rib-Style Congee with Scallion Oil', 'khai-vi', 48000, 'Khai vị chay nhẹ nhàng, thanh đạm', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Khai vị'], false, false, true),
-- Mẹt cuốn
('110', 'Mẹt cuốn thập cẩm', 'Mixed Wrap Platter', 'met-cuon', 89000, 'Mẹt cuốn đầy đủ, ăn kèm rau sống và nước chấm đặc biệt', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Mẹt cuốn'], true, false, true),
('111', 'Mẹt cuốn nấm nướng', 'Grilled Mushroom Wrap Platter', 'met-cuon', 89000, 'Mẹt cuốn đầy đủ, ăn kèm rau sống và nước chấm đặc biệt', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Mẹt cuốn'], false, false, true),
('112', 'Mẹt cuốn heo quay chay', 'Vegan Roast Pork Wrap Platter', 'met-cuon', 89000, 'Mẹt cuốn đầy đủ, ăn kèm rau sống và nước chấm đặc biệt', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=80', array['Mẹt cuốn'], false, false, true),
-- Món lẩu
('113', 'Lẩu tính', 'Tinh Hot Pot', 'lau', 89000, 'Lẩu chay nóng hổi, đậm đà hương vị', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Lẩu'], true, false, true),
('114', 'Lẩu riêu', 'Crab-Style Hot Pot', 'lau', 89000, 'Lẩu chay nóng hổi, đậm đà hương vị', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Lẩu'], false, false, true),
('115', 'Lẩu thái', 'Thai Hot Pot', 'lau', 89000, 'Lẩu chay nóng hổi, đậm đà hương vị', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Lẩu'], false, false, true),
('116', 'Lẩu nấm dưỡng sinh', 'Wellness Mushroom Hot Pot', 'lau', 89000, 'Lẩu chay nóng hổi, đậm đà hương vị', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Lẩu'], false, false, true),
('117', 'Combo lẩu cuốn', 'Hot Pot + Wrap Combo', 'lau', 139000, 'Lẩu chay nóng hổi, đậm đà hương vị', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Lẩu', 'Combo'], true, false, true),
-- Món chính
('118', 'Ba chỉ rang riềng', 'Vegan Pork Belly with Galangal', 'chinh', 108000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('119', 'Nấm thính bắc bộ', 'Northern-Style Roasted Rice Mushroom', 'chinh', 68000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('120', 'Mỳ ý sốt kem nấm', 'Spaghetti with Creamy Mushroom Sauce', 'chinh', 68000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('121', 'Mỳ ý sốt spaghetti bằm chay', 'Spaghetti with Vegan Minced Sauce', 'chinh', 68000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('122', 'Miến trộn hàn quốc', 'Korean-Style Glass Noodle Salad', 'chinh', 58000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('123', 'Nấm kho tiêu xanh', 'Mushroom Braised with Green Pepper', 'chinh', 68000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('124', 'Đậu sốt tứ xuyên', 'Tofu in Sichuan Sauce', 'chinh', 58000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('125', 'Đậu sốt cay hàn quốc', 'Tofu in Korean Spicy Sauce', 'chinh', 58000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('126', 'Đậu non sốt nấm hương tây bắc', 'Silken Tofu with Northwest Shiitake Sauce', 'chinh', 78000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Món chính'], false, false, true),
('127', 'Bánh bao cari nhật', 'Japanese Curry Steamed Bun', 'chinh', 78000, 'Món chính chay đậm vị, giàu dinh dưỡng', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80', array['Món chính'], false, true, true),
-- Món best seller
('128', 'Chả ngư lã vọng', 'Vegan "Cha Ca La Vong"', 'best-seller', 128000, 'Món chay được yêu thích nhất tại nhà hàng', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Best seller'], true, false, true),
('129', 'Nấm hầu tần thuốc bắc', 'Lion''s Mane Mushroom with Herbal Broth', 'best-seller', 128000, 'Món chay được yêu thích nhất tại nhà hàng', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Best seller'], true, false, true),
('130', 'Nấm nướng lá mắc mật', 'Grilled Mushroom with Wild Lime Leaves', 'best-seller', 98000, 'Món chay được yêu thích nhất tại nhà hàng', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Best seller'], true, false, true),
('131', 'Nấm nướng bánh hỏi mỡ hành', 'Grilled Mushroom with Rice Noodle & Scallion Oil', 'best-seller', 108000, 'Món chay được yêu thích nhất tại nhà hàng', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Best seller'], true, false, true),
('132', 'Vịt nướng Bakking', 'Vegan Peking-Style Roast Duck', 'best-seller', 98000, 'Món chay được yêu thích nhất tại nhà hàng', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Best seller'], true, false, true),
('133', 'Chả lá lốt hương vị quê', 'Vegan Betel Leaf Wrapped Patty', 'best-seller', 88000, 'Món chay được yêu thích nhất tại nhà hàng', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Best seller'], true, false, true),
-- Pizza
('134', 'Pizza thập cẩm size 18', 'Mixed Pizza (18cm)', 'pizza', 98000, 'Pizza chay đế giòn, phô mai béo ngậy', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', array['Pizza'], false, true, true),
('135', 'Pizza kem nấm size 18', 'Creamy Mushroom Pizza (18cm)', 'pizza', 98000, 'Pizza chay đế giòn, phô mai béo ngậy', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', array['Pizza'], false, true, true),
('136', 'Pizza bằm chay size 18', 'Vegan Minced Pizza (18cm)', 'pizza', 98000, 'Pizza chay đế giòn, phô mai béo ngậy', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', array['Pizza'], false, true, true),
-- Món ăn chơi
('137', 'Bánh đa xúc nấm', 'Rice Cracker Scoop with Mushroom', 'an-choi', 68000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Ăn chơi'], false, false, true),
('138', 'Nấm đùi gà rang muối', 'Salt-Roasted King Oyster Mushroom', 'an-choi', 58000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Ăn chơi'], false, false, true),
('139', 'Củ sen chiên lắc phomai', 'Fried Lotus Root with Cheese Powder', 'an-choi', 58000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Ăn chơi'], false, false, true),
('140', 'Đậu chiên giòn lắc xí muội', 'Crispy Fried Tofu with Plum Powder', 'an-choi', 48000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Ăn chơi'], false, false, true),
('141', 'Nem hoa quả chiên giòn', 'Crispy Fried Fruit Spring Roll', 'an-choi', 78000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Ăn chơi'], false, false, true),
('142', 'Nem chay hà thành', 'Hanoi-Style Vegan Spring Roll', 'an-choi', 68000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Ăn chơi'], false, false, true),
('143', 'Chả nấm thì là', 'Mushroom & Dill Patty', 'an-choi', 58000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Ăn chơi'], false, false, true),
('144', 'Khoai tây chiên lắc phomai', 'Fried Potato with Cheese Powder', 'an-choi', 58000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Ăn chơi'], false, false, true),
('145', 'Bánh xèo nhật', 'Japanese Okonomiyaki', 'an-choi', 48000, 'Món ăn chơi giòn rụm, hợp khẩu vị mọi người', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80', array['Ăn chơi'], false, false, true),
-- Món xanh xanh
('146', 'Rau xào theo mùa', 'Seasonal Stir-Fried Vegetables', 'xanh', 38000, 'Rau củ chay thanh mát, tốt cho sức khoẻ', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Rau'], false, false, true),
('147', 'Củ quả luộc chấm kho quẹt', 'Boiled Vegetables with Caramelized Dipping Sauce', 'xanh', 48000, 'Rau củ chay thanh mát, tốt cho sức khoẻ', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Rau'], false, false, true),
-- Món nước trôi
('148', 'Bún riêu chay truyền thống', 'Traditional Vegan Crab Noodle Soup', 'nuoc-troi', 48000, 'Món nước chay đậm đà, nóng hổi', 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400&q=80', array['Món nước'], false, false, true),
('149', 'Bún măng vịt chay', 'Vegan Duck & Bamboo Shoot Noodle Soup', 'nuoc-troi', 58000, 'Món nước chay đậm đà, nóng hổi', 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400&q=80', array['Món nước'], false, false, true),
('150', 'Bún ốc chay', 'Vegan Snail Noodle Soup', 'nuoc-troi', 48000, 'Món nước chay đậm đà, nóng hổi', 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400&q=80', array['Món nước'], false, false, true),
('151', 'Mỳ tần nổ thuốc bắc', 'Herbal Stewed Noodle Soup', 'nuoc-troi', 58000, 'Món nước chay đậm đà, nóng hổi', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Món nước'], false, false, true),
-- Món canh canh
('152', 'Canh chua Huế', 'Hue-Style Sour Soup', 'canh', 38000, 'Canh chay thanh ngọt, nấu từ rau củ tươi', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Canh'], false, false, true),
('153', 'Canh rong biển đậu hũ non', 'Seaweed & Silken Tofu Soup', 'canh', 48000, 'Canh chay thanh ngọt, nấu từ rau củ tươi', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Canh'], false, false, true),
('154', 'Canh măng mọc chay', 'Vegan Bamboo Shoot & Meatball Soup', 'canh', 48000, 'Canh chay thanh ngọt, nấu từ rau củ tươi', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Canh'], false, false, true),
-- Món no nê
('155', 'Cơm gạo trắng', 'White Rice', 'no-ne', 28000, 'Món no bụng, phù hợp dùng kèm các món khác', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['No nê'], false, false, true),
('156', 'Cơm gạo lứt', 'Brown Rice', 'no-ne', 38000, 'Món no bụng, phù hợp dùng kèm các món khác', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['No nê'], false, false, true),
('157', 'Cơm chiên tính không', 'Tinh Khong Fried Rice', 'no-ne', 58000, 'Món no bụng, phù hợp dùng kèm các món khác', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', array['No nê'], false, false, true),
('158', 'Cơm chiên nấm hạt điều', 'Mushroom & Cashew Fried Rice', 'no-ne', 58000, 'Món no bụng, phù hợp dùng kèm các món khác', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', array['No nê'], false, false, true),
-- Buffet (giá mẫu — nhà hàng cập nhật lại số thật)
('159', 'Buffet trưa', 'Lunch Buffet', 'buffet', 199000, 'Buffet chay đa dạng, ăn không giới hạn trong thời gian quy định — GIÁ MẪU, cần cập nhật lại', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Buffet'], true, true, true),
('160', 'Buffet tối', 'Dinner Buffet', 'buffet', 249000, 'Buffet chay đa dạng, ăn không giới hạn trong thời gian quy định — GIÁ MẪU, cần cập nhật lại', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Buffet'], true, true, true);
