import { NextRequest, NextResponse } from "next/server";
import { createMomoPayment } from "@/lib/momo";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json();
  if (!orderId) {
    return NextResponse.json({ error: "Thiếu orderId" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("id, total, payment_method")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return NextResponse.json({ error: "Đơn hàng không tồn tại" }, { status: 404 });
  }
  if (order.payment_method !== "momo") {
    return NextResponse.json({ error: "Đơn này không thanh toán qua MoMo" }, { status: 400 });
  }

  const origin = req.nextUrl.origin;
  const result = await createMomoPayment({
    orderId: order.id,
    amount: order.total,
    orderInfo: `Thanh toan don hang ${order.id} All Vegan`,
    redirectUrl: `${origin}/api/momo/return`,
    ipnUrl: `${origin}/api/momo/ipn`,
  });

  if (result.resultCode !== 0 || !result.payUrl) {
    return NextResponse.json({ error: result.message || "Không tạo được yêu cầu thanh toán MoMo" }, { status: 400 });
  }

  return NextResponse.json({ payUrl: result.payUrl });
}
