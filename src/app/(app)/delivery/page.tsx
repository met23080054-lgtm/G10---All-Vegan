"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft, MapPin, Clock, Truck, Plus, Minus,
  ShoppingCart, Star, AlertCircle, Trash2, Phone, StickyNote, History,
  Banknote, Wallet, CreditCard, Smartphone, Landmark, QrCode
} from "lucide-react";
import type { MenuItem } from "@/data/menu";
import type { Store } from "@/data/stores";
import { getMenuItems, getStores } from "@/lib/data";
import { getCart, saveCart, formatPrice, getUser, saveDefaultDeliveryInfo } from "@/lib/store";
import type { CartItem, PaymentMethod } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { geocodeAddress, nearestStore } from "@/lib/geocode";
import DeliveryStatusCard from "@/components/DeliveryStatusCard";
import clsx from "clsx";

const DELIVERY_FEE_TIERS = [
  { min: 0, max: 150000, fee: 30000 },
  { min: 150000, max: 300000, fee: 15000 },
  { min: 300000, max: Infinity, fee: 0 },
];

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: typeof Banknote; color: string; bg: string; border: string }[] = [
  { id: "cash", label: "Tiền mặt", icon: Banknote, color: "text-green-700", bg: "bg-green-50", border: "border-green-500" },
  { id: "momo", label: "MoMo", icon: Wallet, color: "text-pink-700", bg: "bg-pink-50", border: "border-pink-500" },
  { id: "vnpay", label: "VNPay", icon: CreditCard, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-500" },
  { id: "zalopay", label: "ZaloPay", icon: Smartphone, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-500" },
  { id: "bank_transfer", label: "Chuyển khoản", icon: Landmark, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-500" },
];

const PHONE_REGEX = /^(0|\+84)(3[2-9]|5[5689]|7[06-9]|8[1-9]|9[0-46-9])[0-9]{7}$/;

function isValidPhone(value: string): boolean {
  return PHONE_REGEX.test(value.replace(/[\s.-]/g, ""));
}

function isValidAddress(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length >= 10 && /\d/.test(trimmed);
}

interface PlacedOrder {
  created_at: string;
  estimated_minutes: number | null;
  store_lat: number | null;
  store_lng: number | null;
  delivery_lat: number | null;
  delivery_lng: number | null;
  payment_method: PaymentMethod;
}

export default function DeliveryPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [step, setStep] = useState<"menu" | "checkout" | "success">("menu");
  const [estimatedTime] = useState(25 + Math.floor(Math.random() * 15));
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<PlacedOrder | null>(null);
  const [touched, setTouched] = useState<{ address?: boolean; phone?: boolean }>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [showPaymentSim, setShowPaymentSim] = useState(false);

  const addressError = touched.address && !isValidAddress(address)
    ? "Địa chỉ cần ít nhất 10 ký tự và có số nhà/đường" : "";
  const phoneError = touched.phone && !isValidPhone(phone)
    ? "Số điện thoại không đúng định dạng (vd: 0912345678)" : "";

  useEffect(() => {
    setCart(getCart());
    getMenuItems().then(setMenuItems);
    getStores().then(setStores);
    getUser().then((user) => {
      if (!user) return;
      setPhone(user.phone);
      if (user.defaultAddress) setAddress(user.defaultAddress);
    });
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      const updated = existing
        ? prev.map((c) => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c)
        : [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, image: item.image }];
      saveCart(updated);
      return updated;
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0);
      saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveCart(updated);
      return updated;
    });
  };

  const updateNote = (id: string, note: string) => {
    setCart((prev) => {
      const updated = prev.map((c) => c.id === id ? { ...c, note } : c);
      saveCart(updated);
      return updated;
    });
  };

  const getQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const deliveryFee = DELIVERY_FEE_TIERS.find((t) => subtotal >= t.min && subtotal < t.max)?.fee ?? 15000;
  const total = subtotal + deliveryFee - discount;
  const pointsToEarn = Math.floor(total / 1000);
  const suggestions = menuItems
    .filter((m) => !cart.some((c) => c.id === m.id))
    .sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0))
    .slice(0, 6);

  const applyVoucher = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("validate_and_consume_voucher", {
      p_code: voucherCode,
      p_subtotal: subtotal,
      p_delivery_fee: deliveryFee,
      p_commit: false,
    });
    if (error) {
      alert(error.message || "Mã không hợp lệ!");
      return;
    }
    setDiscount(data ?? 0);
  };

  const submitOrder = async () => {
    if (placing) return;
    setPlacing(true);

    try {
      const geo = await geocodeAddress(address);
      const origin = geo ? nearestStore(stores, geo) : stores[0] ?? null;
      const minutes = 25 + Math.floor(Math.random() * 15);

      const supabase = createClient();
      const { data, error } = await supabase.rpc("place_order", {
        p_items: cart.map((c) => ({ id: c.id, quantity: c.quantity, note: c.note || null })),
        p_type: "delivery",
        p_address: address,
        p_voucher_code: voucherCode || null,
        p_store_lat: origin?.lat ?? null,
        p_store_lng: origin?.lng ?? null,
        p_delivery_lat: geo?.lat ?? null,
        p_delivery_lng: geo?.lng ?? null,
        p_estimated_minutes: minutes,
        p_payment_method: paymentMethod,
      });
      if (error) {
        setPlacing(false);
        alert(error.message || "Không thể đặt hàng, vui lòng thử lại.");
        return;
      }

      setPlacing(false);
      setShowPaymentSim(false);
      saveDefaultDeliveryInfo(address, phone);
      setPlacedOrder(data);
      saveCart([]);
      setCart([]);
      setVoucherCode("");
      setDiscount(0);
      setStep("success");
    } catch {
      setPlacing(false);
      alert("Đã có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  const placeOrder = async () => {
    setTouched({ address: true, phone: true });
    if (cart.length === 0) { alert("Giỏ hàng trống, vui lòng thêm món"); return; }
    if (!isValidAddress(address)) { alert("Vui lòng nhập địa chỉ giao hàng đầy đủ (tối thiểu 10 ký tự, có số nhà/đường)"); return; }
    if (!isValidPhone(phone)) { alert("Số điện thoại không đúng định dạng. Vui lòng kiểm tra lại."); return; }

    if (paymentMethod === "cash") {
      await submitOrder();
    } else {
      setShowPaymentSim(true);
    }
  };

  if (step === "success" && placedOrder) {
    return (
      <div className="min-h-screen bg-[#FBF7F2] flex flex-col items-center justify-center px-6 text-center py-10">
        <div className="text-7xl mb-6">🛵</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 text-sm mb-6">Đơn hàng của bạn đang được chuẩn bị</p>
        <div className="card w-full p-5 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Clock size={22} className="text-primary-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800">Dự kiến giao trong</p>
              <p className="text-2xl font-black text-primary-600">{placedOrder.estimated_minutes ?? estimatedTime} phút</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-3 py-2.5 mb-4">
            {(() => {
              const m = PAYMENT_METHODS.find((pm) => pm.id === placedOrder.payment_method);
              const Icon = m?.icon ?? Banknote;
              return (
                <>
                  <Icon size={16} className={m?.color ?? "text-gray-500"} />
                  <span>Thanh toán: <strong>{m?.label ?? "Tiền mặt"}</strong></span>
                </>
              );
            })()}
          </div>

          <DeliveryStatusCard
            createdAt={placedOrder.created_at}
            estimatedMinutes={placedOrder.estimated_minutes}
            storeLat={placedOrder.store_lat}
            storeLng={placedOrder.store_lng}
            deliveryLat={placedOrder.delivery_lat}
            deliveryLng={placedOrder.delivery_lng}
          />
        </div>
        <button onClick={() => router.push("/")} className="btn-primary px-8 py-3 w-full">
          Về trang chủ
        </button>
        <button onClick={() => { setStep("menu"); setPlacedOrder(null); setTouched({}); }} className="mt-3 text-sm text-gray-400">
          Đặt thêm đơn khác
        </button>
      </div>
    );
  }

  if (step === "checkout") {
    return (
      <div className="min-h-screen bg-[#FBF7F2] pb-28">
        <div className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center gap-3 px-4 pt-12 pb-3">
            <button onClick={() => setStep("menu")} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold flex-1">Đơn giao hàng</h1>
          </div>
        </div>

        <div className="px-4 py-4 space-y-5">
          {/* Delivery info */}
          <div className="card p-4 space-y-3">
            <p className="font-bold text-gray-800">Thông tin giao hàng</p>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin size={13} className="text-primary-600" />
                <p className="text-sm font-semibold text-gray-700">Địa chỉ giao hàng</p>
              </div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, address: true }))}
                placeholder="Số nhà, đường, phường/xã..."
                className={clsx(
                  "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none",
                  addressError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary-400"
                )}
              />
              {addressError && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={12} /> {addressError}</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Phone size={13} className="text-primary-600" />
                <p className="text-sm font-semibold text-gray-700">Số điện thoại</p>
              </div>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
                placeholder="0912 345 678"
                className={clsx(
                  "w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none",
                  phoneError ? "border-red-300 focus:border-red-400" : "border-gray-200 focus:border-primary-400"
                )}
              />
              {phoneError && (
                <p className="flex items-center gap-1 text-xs text-red-500 mt-1"><AlertCircle size={12} /> {phoneError}</p>
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <StickyNote size={13} className="text-primary-600" />
                <p className="text-sm font-semibold text-gray-700">Ghi chú</p>
              </div>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Dị ứng, ghi chú đặc biệt..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none h-16"
              />
            </div>
            <p className="text-xs text-gray-400">Thông tin này sẽ được lưu làm mặc định cho lần đặt sau.</p>
          </div>

          {/* Món đã chọn */}
          <div className="card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-bold text-gray-800">Món đã chọn ({totalItems})</p>
              <button onClick={() => setStep("menu")} className="flex items-center gap-1 text-xs text-primary-600 font-semibold">
                <Plus size={13} /> Chọn thêm món
              </button>
            </div>
            {cart.length === 0 ? (
              <p className="text-sm text-gray-400 py-3 text-center">Chưa có món nào trong giỏ</p>
            ) : (
              <div className="space-y-3">
                {cart.map((item) => (
                  <div key={item.id} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 text-sm min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <p className="text-primary-600 text-xs">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border rounded-full flex items-center justify-center"><Minus size={12} /></button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center"><Plus size={12} className="text-white" /></button>
                      </div>
                      <p className="text-sm font-bold w-16 text-right">{formatPrice(item.price * item.quantity)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 flex-shrink-0"
                        aria-label="Xoá món"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input
                      value={item.note ?? ""}
                      onChange={(e) => updateNote(item.id, e.target.value)}
                      placeholder="Ghi chú món (vd: thêm cay, không hành...)"
                      className="w-full text-xs border border-gray-100 bg-gray-50 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary-300 focus:bg-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Gợi ý thêm món */}
          {suggestions.length > 0 && (
            <div>
              <p className="font-bold text-gray-800 mb-2">Gọi thêm món? 🌿</p>
              <div className="overflow-x-auto flex gap-2.5 pb-1 -mx-4 px-4 scrollbar-hide">
                {suggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="flex-shrink-0 w-32 card p-2.5 text-left"
                  >
                    <div className="relative w-full h-20 rounded-lg overflow-hidden bg-gray-100 mb-1.5">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="128px" />
                    </div>
                    <p className="text-xs font-semibold text-gray-800 line-clamp-1">{item.name}</p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-primary-600 font-bold">{formatPrice(item.price)}</p>
                      <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <Plus size={12} className="text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Voucher */}
          <div className="flex gap-2">
            <input
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
              placeholder="Mã giảm giá"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 uppercase bg-white"
            />
            <button onClick={applyVoucher} className="bg-primary-600 text-white px-4 rounded-xl text-sm font-semibold">
              Áp dụng
            </button>
          </div>

          {/* Payment method */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Phương thức thanh toán</p>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id)}
                  className={clsx(
                    "flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all",
                    paymentMethod === m.id ? `${m.border} ${m.bg}` : "border-gray-200 bg-white"
                  )}
                >
                  <m.icon size={20} className={paymentMethod === m.id ? m.color : "text-gray-400"} />
                  <span className={clsx("text-xs font-semibold", paymentMethod === m.id ? m.color : "text-gray-600")}>
                    {m.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Fee info + Summary */}
          <div className="card p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              {DELIVERY_FEE_TIERS.map((tier, i) => (
                <span key={i} className={clsx("px-2 py-0.5 rounded-full", subtotal >= tier.min && subtotal < tier.max ? "bg-primary-600 text-white font-semibold" : "bg-gray-100")}>
                  {tier.fee === 0 ? "Miễn ship" : formatPrice(tier.fee) + " ship"}
                </span>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tạm tính</span><span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Phí giao hàng</span>
              <span className={deliveryFee === 0 ? "text-green-600 font-semibold" : ""}>{deliveryFee === 0 ? "Miễn phí" : formatPrice(deliveryFee)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Giảm giá</span><span>-{formatPrice(discount)}</span>
              </div>
            )}
            <div className="border-t pt-2 flex justify-between font-bold">
              <span>Tổng cộng</span>
              <span className="text-primary-600">{formatPrice(total)}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
              <Star size={12} fill="currentColor" />
              <span>Nhận <strong>~{pointsToEarn} điểm</strong> từ đơn này</span>
            </div>
          </div>
        </div>

        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40">
          <button
            onClick={placeOrder}
            disabled={placing}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60 shadow-xl shadow-primary-900/20"
          >
            <Truck size={18} /> {placing ? "Đang đặt..." : `Đặt giao hàng · ${formatPrice(total)}`}
          </button>
        </div>

        {/* Simulated e-wallet/bank payment confirmation */}
        {showPaymentSim && (
          <div className="fixed inset-0 z-[70] flex items-end">
            <div className="absolute inset-0 bg-black/40" onClick={() => !placing && setShowPaymentSim(false)} />
            <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl p-6 text-center">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <p className="font-bold text-lg mb-1">
                Thanh toán qua {PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}
              </p>
              <p className="text-sm text-gray-400 mb-5">
                Quét mã QR hoặc mở app để thanh toán {formatPrice(total)}
              </p>
              <div className="w-40 h-40 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-5">
                <QrCode size={72} className="text-gray-300" />
              </div>
              <button
                onClick={submitOrder}
                disabled={placing}
                className="btn-primary w-full py-3.5 text-base disabled:opacity-60"
              >
                {placing ? "Đang xử lý..." : "Tôi đã thanh toán"}
              </button>
              <button
                onClick={() => setShowPaymentSim(false)}
                disabled={placing}
                className="w-full mt-2 py-2.5 text-sm text-gray-500 font-medium"
              >
                Huỷ
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold">Giao hàng tận nơi</h1>
            <div className="flex items-center gap-1 text-xs text-primary-600 font-medium">
              <Truck size={11} /> Giao hàng {estimatedTime}–{estimatedTime + 10} phút
            </div>
          </div>
          <button onClick={() => router.push("/delivery/history")} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center" aria-label="Lịch sử giao hàng">
            <History size={17} className="text-gray-600" />
          </button>
          <button onClick={() => setStep("checkout")} className="relative w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <ShoppingCart size={18} className="text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
        {address && (
          <div className="px-4 pb-3">
            <div className="bg-primary-50 rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-gray-600">
              <MapPin size={13} className="text-primary-600 flex-shrink-0" />
              <span className="truncate">{address}</span>
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="px-4 py-4 space-y-3">
        <h2 className="section-title">Chọn món</h2>
        {menuItems.map((item) => {
          const qty = getQty(item.id);
          return (
            <div key={item.id} className="card flex gap-3 p-3">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold text-primary-600 text-sm">{formatPrice(item.price)}</p>
                  {qty === 0 ? (
                    <button onClick={() => addToCart(item)} className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                      <Plus size={16} className="text-white" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-bold w-4 text-center">{qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                        <Plus size={12} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Float cart */}
      {totalItems > 0 && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40">
          <button onClick={() => setStep("checkout")} className="w-full bg-primary-600 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl shadow-primary-900/20">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center">{totalItems}</span>
              <span className="font-semibold">Xem đơn hàng</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
