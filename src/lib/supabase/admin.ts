import { createClient } from "@supabase/supabase-js";

// Chỉ dùng trong API routes (server) — service role key bỏ qua RLS, không bao giờ
// được import vào code chạy ở client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
