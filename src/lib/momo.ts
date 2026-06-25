import crypto from "crypto";

// Chỉ chạy ở server (API routes) — secretKey không bao giờ được lộ ra client.
const PARTNER_CODE = process.env.MOMO_PARTNER_CODE!;
const ACCESS_KEY = process.env.MOMO_ACCESS_KEY!;
const SECRET_KEY = process.env.MOMO_SECRET_KEY!;
const ENDPOINT = process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create";

function sign(rawSignature: string): string {
  return crypto.createHmac("sha256", SECRET_KEY).update(rawSignature).digest("hex");
}

interface CreatePaymentArgs {
  orderId: string;
  amount: number;
  orderInfo: string;
  redirectUrl: string;
  ipnUrl: string;
}

interface MomoCreateResponse {
  payUrl?: string;
  deeplink?: string;
  qrCodeUrl?: string;
  resultCode: number;
  message: string;
}

export async function createMomoPayment(args: CreatePaymentArgs): Promise<MomoCreateResponse> {
  const { orderId, amount, orderInfo, redirectUrl, ipnUrl } = args;
  const requestId = `${orderId}-${Date.now()}`;
  const requestType = "captureWallet";
  const extraData = "";

  // Thứ tự field trong raw signature phải đúng theo tài liệu MoMo (alphabet) — sai thứ tự
  // hoặc thiếu field sẽ làm chữ ký không khớp và MoMo từ chối request.
  const rawSignature =
    `accessKey=${ACCESS_KEY}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}` +
    `&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${PARTNER_CODE}` +
    `&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;

  const signature = sign(rawSignature);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      partnerCode: PARTNER_CODE,
      partnerName: "All Vegan",
      storeId: "AllVeganStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl,
      lang: "vi",
      extraData,
      requestType,
      signature,
    }),
  });

  return res.json();
}

// Dùng để xác minh dữ liệu MoMo gửi về (redirect hoặc IPN) đúng là từ MoMo, không bị giả mạo.
// accessKey dùng giá trị của chính mình (cấu hình sẵn), không lấy từ params MoMo gửi về.
export function verifyMomoCallback(params: Record<string, string>): boolean {
  const { signature } = params;
  if (!signature) return false;

  const orderedKeys = [
    "amount", "extraData", "message", "orderId", "orderInfo",
    "orderType", "partnerCode", "payType", "requestId", "responseTime",
    "resultCode", "transId",
  ];
  const rawSignature =
    `accessKey=${ACCESS_KEY}&` + orderedKeys.map((k) => `${k}=${params[k] ?? ""}`).join("&");
  const expected = sign(rawSignature);
  return expected === signature;
}
