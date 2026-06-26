-- Cập nhật địa chỉ chi nhánh duy nhất All Vegan
update stores set
  name    = 'All Vegan – Láng Hạ',
  address = 'Tầng 2, Số 9 ngõ 59 Láng Hạ, Đống Đa, Hà Nội',
  district = 'Đống Đa',
  map_url  = 'https://maps.app.goo.gl/NJbkTMnZ6LrJwxFF9'
where id = (select id from stores order by id limit 1);

-- Xoá chi nhánh thừa nếu có
delete from stores
where id not in (select id from stores order by id limit 1);

-- Vô hiệu hoá voucher liên quan đến game gấp sao (không còn tồn tại)
update voucher_templates set active = false
where code ilike '%STAR%'
   or code ilike '%FOLD%'
   or code ilike '%GAP%'
   or name ilike '%gấp sao%'
   or name ilike '%xếp sao%';
