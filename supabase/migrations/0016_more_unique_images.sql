-- All Vegan — tiếp tục giảm trùng ảnh giữa các món (0012 còn nhiều món dùng
-- chung 1 ảnh vì không tìm được ảnh khớp riêng). Đợt này tách thêm 6 món ra
-- ảnh riêng, đã xem trực tiếp từng ảnh trước khi chọn. Một số nhóm món vẫn
-- còn dùng chung ảnh — không tìm được ảnh chay phù hợp & không lẫn ảnh thịt/
-- hải sản trong kho ảnh miễn phí bản quyền, cần ảnh thật của quán để thay tiếp.
-- Chạy SAU 0015_detailed_descriptions.sql.

update menu_items set image = 'https://upload.wikimedia.org/wikipedia/commons/5/51/Vietnamese_fried_spring_rolls_in_Ho_Chi_Minh_City%2C_Vietnam.jpg' where id = '142'; -- nem chay hà thành
update menu_items set image = 'https://live.staticflickr.com/3012/2590039966_9b3da545db_b.jpg' where id = '160'; -- buffet tối (bàn tráng miệng)
update menu_items set image = 'https://live.staticflickr.com/2561/3885631853_19ce462b2b_b.jpg' where id = '143'; -- chả nấm thì là
update menu_items set image = 'https://live.staticflickr.com/2666/3899679365_a1a47dfbd0_b.jpg' where id = '141'; -- nem hoa quả chiên giòn
update menu_items set image = 'https://live.staticflickr.com/4143/4772255115_b0908b3ea8_b.jpg' where id = '148'; -- bún riêu chay
update menu_items set image = 'https://live.staticflickr.com/2523/4091977889_b668d78072_b.jpg' where id = '158'; -- cơm chiên nấm hạt điều
