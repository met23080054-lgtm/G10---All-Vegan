import { NextRequest, NextResponse } from "next/server";
import { verifyMomoCallback } from "@/lib/momo";
import { createAdminClient } from "@/lib/supabase/admin";

// MoMo gọi server-to-server vào đây để xác nhận kết quả thanh toán — đáng tin hơn
// redirectUrl (vì không qua trình duyệt của khách), nhưng chỉ hoạt động khi app đã
// deploy public (MoMo không gọi được vào localhost lúc dev).
export async function POST(req: NextRequest) {
  const body = await req.json();
  const valid = verifyMomoCallback(body);

  if (valid && body.orderId) {
    const supabase = createAdminClient();
    await supabase
      .from("orders")
      .update({ payment_status: body.resultCode === 0 ? "paid" : "failed" })
      .eq("id", body.orderId);
  }

  return NextResponse.json({ message: "OK" });
}
