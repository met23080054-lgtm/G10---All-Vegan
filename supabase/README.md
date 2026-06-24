# Setup Supabase cho All Vegan

## 1. Tạo project

1. Vào [supabase.com](https://supabase.com), tạo account, bấm **New Project**.
2. Chọn region **Southeast Asia (Singapore)**, đặt tên project (ví dụ `all-vegan`), tạo mật khẩu DB (lưu lại).
3. Đợi project tạo xong (~2 phút).

## 2. Lấy API keys

Vào **Project Settings → API**, copy:
- `Project URL`
- `anon public` key

Dán vào file `.env.local` ở thư mục gốc project:
```
NEXT_PUBLIC_SUPABASE_URL=<Project URL>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

## 3. Tắt xác nhận email (để demo nhanh)

Vào **Authentication → Providers → Email**, tắt **Confirm email**. Nếu không tắt, mỗi user đăng ký sẽ phải bấm link xác nhận trong email trước khi đăng nhập được.

Vào **Authentication → URL Configuration**, thêm `http://localhost:3000` vào **Redirect URLs** (và URL Vercel sau khi deploy).

## 4. Chạy SQL migration

Vào **SQL Editor**, copy-paste và **Run** lần lượt 4 file theo đúng thứ tự (file sau phụ thuộc file trước):

1. `migrations/0001_schema.sql` — tạo bảng
2. `migrations/0002_rls.sql` — bật Row Level Security
3. `migrations/0003_functions.sql` — tạo các hàm xử lý nghiệp vụ (đặt hàng, đổi quà, vòng quay, quiz, đánh giá)
4. `migrations/0004_seed.sql` — nạp dữ liệu mẫu (12 món ăn, 3 chi nhánh, voucher, câu hỏi quiz)

Sau khi chạy xong, vào **Table Editor** kiểm tra: `menu_items` có 12 dòng, `stores` có 3 dòng.

## 5. Chạy app

```
npm install
npm run dev
```

Mở `http://localhost:3000`, sẽ tự chuyển đến `/register` để tạo tài khoản đầu tiên.

## 6. Khi deploy lên Vercel

Vào **Project Settings → Environment Variables** trên Vercel, thêm 2 biến giống `.env.local`. Đồng thời quay lại Supabase **Authentication → URL Configuration**, thêm URL Vercel vào Redirect URLs.

## Nếu cần làm lại từ đầu

Nếu chỉnh sửa migration và muốn chạy lại trên project mới: tạo project Supabase mới, lặp lại bước 2–4. Không cần xoá thủ công vì project mới luôn sạch.
