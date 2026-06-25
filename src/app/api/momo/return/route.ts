import { NextRequest, NextResponse } from "next/server";
import { verifyMomoCallback } from "@/lib/momo";
import { createAdminClient } from "@/lib/supabase/admin";

// MoMo chuyển trình duyệt của khách về đây sau khi thanh toán (redirectUrl).
// Đây là cách xác nhận hoạt động được cả khi chạy local (IPN server-to-server thì không,
// vì máy MoMo không gọi được vào localhost) — đủ để test/demo đồ án.
export async function GET(req: NextRequest) {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const orderId = params.orderId;
  const valid = verifyMomoCallback(params);

  if (valid && orderId) {
    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({ payment_status: params.resultCode === "0" ? "paid" : "failed" })
      .eq("id", orderId);
  }

  const status = valid && params.resultCode === "0" ? "success" : "failed";
  return NextResponse.redirect(
    `${req.nextUrl.origin}/delivery/history?payment=${status}&order=${encodeURIComponent(orderId ?? "")}`
  );
}
