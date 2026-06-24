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

Vào **Authentication → URL Configuration**, thêm `http://localhost:3000/**` (nhớ dấu `**` ở cuối — wildcard, thiếu sẽ làm đăng nhập Google bị bật lại về trang login mà không báo lỗi) vào **Redirect URLs** (và URL Vercel `/**` sau khi deploy).

## 4. Chạy SQL migration

Vào **SQL Editor**, copy-paste và **Run** lần lượt theo đúng thứ tự (file sau phụ thuộc file trước):

1. `migrations/0001_schema.sql` — tạo bảng
2. `migrations/0002_rls.sql` — bật Row Level Security
3. `migrations/0003_functions.sql` — tạo các hàm xử lý nghiệp vụ (đặt hàng, đổi quà, vòng quay, quiz, đánh giá)
4. `migrations/0004_seed.sql` — nạp dữ liệu mẫu (12 món ăn, 3 chi nhánh, voucher, câu hỏi quiz)
5. `migrations/0005_delivery_tracking.sql` — thêm cột toạ độ cho đơn giao hàng (phục vụ bản đồ theo dõi hành trình)

Sau khi chạy xong, vào **Table Editor** kiểm tra: `menu_items` có 12 dòng, `stores` có 3 dòng.

## 4b. Bật đăng nhập Google (tuỳ chọn)

**Bước 1 — Tạo OAuth credentials trên Google Cloud Console:**
1. Vào [console.cloud.google.com](https://console.cloud.google.com), tạo project mới (hoặc dùng project có sẵn).
2. Vào **APIs & Services → OAuth consent screen**: chọn **External**, điền tên app ("All Vegan"), email hỗ trợ, bấm Save (để ở chế độ Testing là được, không cần submit verify cho bài tập trường).
3. Vào **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Ở **Authorized redirect URIs**, thêm đúng URL callback của Supabase (Project Settings → API để lấy đúng Project URL):
   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```
6. Bấm Create, copy **Client ID** và **Client Secret**.

**Bước 2 — Dán vào Supabase:**
1. Vào Authentication → Providers (dashboard project của bạn).
2. Tìm **Google**, bật toggle enable.
3. Dán Client ID + Client Secret vừa copy, bấm Save.

**Bước 3 — Thêm domain redirect:**
Vào **Authentication → URL Configuration**, thêm `http://localhost:3000/**` (có dấu `**` ở cuối — wildcard, bắt buộc để `/auth/callback` được chấp nhận) và URL Vercel `/**` vào Redirect URLs.

Sau khi xong, nút "Tiếp tục với Google" ở trang `/login` và `/register` sẽ hoạt động.

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
