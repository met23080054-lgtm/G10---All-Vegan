-- All Vegan — seed data (menu, stores, voucher templates, quiz, prizes)
-- Chạy SAU 0003_functions.sql.

insert into menu_items (id, name, name_en, category, price, description, image, tags, popular, is_new) values
('1', 'Cơm Chay Thập Cẩm', 'Mixed Vegan Rice', 'com', 65000, 'Cơm trắng dẻo thơm với đậu hũ chiên giòn, rau củ xào, nấm mặn và chả chay đặc biệt', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Bán chạy','Đầy đủ dinh dưỡng'], true, false),
('2', 'Phở Chay Đặc Biệt', 'Special Vegan Pho', 'bun', 75000, 'Phở nước dùng hầm từ rau củ 8 tiếng, thêm đậu hũ non, nấm đông cô và rau thơm tươi', 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400&q=80', array['Đặc biệt','Thanh đạm'], true, false),
('3', 'Bún Bò Chay', 'Vegan Bun Bo', 'bun', 70000, 'Bún bò chay với nước lèo đậm đà từ sả, ớt, mắm chay — thịt bò chay giàu đạm thực vật', 'https://images.unsplash.com/photo-1569562211093-4ed0d0758f12?w=400&q=80', array['Cay nhẹ','Protein cao'], false, false),
('4', 'Bánh Mì Chay Đặc Biệt', 'Special Vegan Banh Mi', 'banh', 45000, 'Bánh mì giòn nhân chả lụa chay, pate chay, dưa leo, rau mùi và tương ớt', 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400&q=80', array['Nhanh gọn','Bán chạy'], true, false),
('5', 'Gỏi Cuốn Chay (4 cuốn)', 'Fresh Spring Rolls (x4)', 'banh', 55000, 'Gỏi cuốn tươi mát với bún tươi, rau thơm, đậu hũ chiên và chấm nước tương đặc biệt', 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&q=80', array['Thanh mát','Ít calo'], false, false),
('6', 'Đậu Hũ Chiên Xả Ớt', 'Fried Tofu with Lemongrass', 'mon-phu', 40000, 'Đậu hũ chiên vàng giòn bên ngoài, mềm bên trong, xào cùng sả ớt thơm nồng', 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80', array['Cay','Giòn ngon'], false, false),
('7', 'Nấm Nướng Muối Ớt', 'Grilled Mushroom with Chili Salt', 'mon-phu', 55000, 'Nấm bào ngư nướng than, ướp muối ớt chanh, ăn kèm rau thơm và tương chấm', 'https://images.unsplash.com/photo-1607305387299-a3d9611cd469?w=400&q=80', array['Nướng than','Đặc sắc'], false, true),
('8', 'Trà Đào Cam Sả', 'Peach Orange Lemongrass Tea', 'nuoc', 35000, 'Trà đào kết hợp cam tươi và sả, thanh mát tự nhiên không đường hóa học', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80', array['Thanh mát','Tự nhiên'], true, false),
('9', 'Nước Ép Xanh Detox', 'Green Detox Juice', 'nuoc', 45000, 'Hỗn hợp cần tây, dưa chuột, táo xanh và gừng tươi — bổ dưỡng, thanh lọc cơ thể', 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&q=80', array['Detox','Healthy'], false, true),
('10', 'Chè Hạt Sen Nhãn', 'Lotus Seed & Longan Dessert', 'trang-miem', 40000, 'Chè hạt sen hầm mềm, nhãn tươi ngọt thanh, nước đường thanh nhẹ thơm lá dứa', 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80', array['Ngọt thanh','Truyền thống'], false, false),
('11', 'Bánh Cuốn Chay', 'Steamed Rice Roll', 'banh', 60000, 'Bánh cuốn nóng hổi nhân nấm mèo, mộc nhĩ, chan nước mắm chay thơm nhẹ', 'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80', array['Nóng hổi','Truyền thống'], false, false),
('12', 'Cơm Chiên Dương Châu Chay', 'Vegan Fried Rice', 'com', 70000, 'Cơm chiên dương châu chay với trứng, ngô, đậu Hà Lan, cà rốt và hành lá', 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&q=80', array['Thơm ngon','No lâu'], true, false);

insert into stores (id, name, address, district, phone, hours, lat, lng, map_url, features) values
('1', 'All Vegan – Hoàn Kiếm', '15 Hàng Bài, Hoàn Kiếm, Hà Nội', 'Hoàn Kiếm', '024 3825 1199', '07:00 – 21:30', 21.0285, 105.8542, 'https://maps.google.com/?q=15+Hang+Bai+Hoan+Kiem+Ha+Noi', array['Wifi miễn phí','Đặt bàn trước','Chỗ ngồi ngoài trời','Giao hàng']),
('2', 'All Vegan – Đống Đa', '78 Tây Sơn, Đống Đa, Hà Nội', 'Đống Đa', '024 3512 4488', '07:00 – 22:00', 21.0179, 105.8412, 'https://maps.google.com/?q=78+Tay+Son+Dong+Da+Ha+Noi', array['Wifi miễn phí','Đặt bàn trước','Phòng VIP','Giao hàng','Bãi xe máy']),
('3', 'All Vegan – Cầu Giấy', '230 Cầu Giấy, Cầu Giấy, Hà Nội', 'Cầu Giấy', '024 3791 6677', '06:30 – 21:00', 21.0358, 105.7958, 'https://maps.google.com/?q=230+Cau+Giay+Ha+Noi', array['Wifi miễn phí','Giao hàng','Bãi xe ô tô','Phục vụ sự kiện']);

-- voucher promo (nhập tay mã, không tốn điểm)
insert into voucher_templates (code, name, discount, discount_type, min_order, points_cost, validity_days, fixed_expiry, active) values
('WELCOME20', 'Giảm 20% đơn đầu tiên', 20, 'percent', 100000, 0, null, '2026-12-31', true),
('APP50K', 'Giảm 50.000đ khi đặt qua App', 50000, 'fixed', 200000, 0, null, '2026-12-31', true),
('FREESHIP', 'Miễn phí giao hàng', 0, 'fixed', 150000, 0, null, '2026-12-31', true),
('SILVER15', 'Ưu đãi thành viên Bạc 15%', 15, 'percent', 80000, 0, null, '2026-12-31', true);

-- reward đổi bằng điểm (loyalty)
insert into voucher_templates (code, name, discount, discount_type, min_order, points_cost, validity_days, active) values
('REWARD30K', 'Giảm 30.000đ', 30000, 'fixed', 0, 300, 30, true),
('REWARD50K', 'Giảm 50.000đ', 50000, 'fixed', 0, 500, 30, true),
('REWARDTEA', 'Free 1 ly trà', 35000, 'fixed', 0, 200, 30, true),
('REWARDSHIP', 'Free ship 1 đơn', 30000, 'fixed', 0, 250, 30, true),
('REWARD15PCT', 'Giảm 15%', 15, 'percent', 0, 700, 30, true),
('REWARDCOMBO', 'Combo deal đặc biệt', 100000, 'fixed', 0, 1200, 30, true);

insert into quiz_questions (question, options, correct_index, points) values
('Thuần chay (Vegan) khác gì Ăn chay thông thường?', array['Không dùng bất kỳ sản phẩm động vật nào','Chỉ không ăn thịt đỏ','Không ăn hải sản','Không uống sữa'], 0, 50),
('Loại nấm nào giàu protein nhất?', array['Nấm sò','Nấm đông cô','Nấm chân dài','Nấm linh chi'], 1, 50),
('All Vegan có bao nhiêu chi nhánh tại Hà Nội?', array['1','2','3','4'], 2, 100),
('Đậu hũ (tofu) được làm từ gì?', array['Đậu xanh','Đậu đỏ','Đậu nành','Đậu Hà Lan'], 2, 50),
('Vitamin B12 phổ biến nhất trong thực phẩm nào dưới đây?', array['Cải bó xôi','Hạt chia','Rong biển','Ngũ cốc tăng cường B12'], 3, 75);
