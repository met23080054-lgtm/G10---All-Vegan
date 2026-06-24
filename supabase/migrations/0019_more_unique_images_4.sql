-- All Vegan — tách ảnh trùng đợt 4 (sau 0018). Còn lại đúng 1 món (id=133,
-- chả lá lốt) vẫn dùng chung ảnh với nhóm nấm nướng (id=111) — đã thử hơn
-- chục từ khoá khác nhau nhưng không tìm được ảnh nào trong kho ảnh miễn phí
-- thể hiện món lá lốt cuốn mà không phải là bản gốc có thịt bò.
-- Chạy SAU 0018_more_unique_images_3.sql.

update menu_items set image = 'https://live.staticflickr.com/6139/5966002706_08e88e7eb2_b.jpg' where id = '131'; -- nấm nướng bánh hỏi mỡ hành
update menu_items set image = 'https://live.staticflickr.com/6176/6257510767_59b96a49b1_b.jpg' where id = '137'; -- bánh đa xúc nấm
