"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronLeft, MapPin, Clock, Truck, Plus, Minus, CheckCircle,
  ShoppingCart, Star, ChevronRight, X, ArrowRight
} from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { getMenuItems } from "@/lib/data";
import { getCart, saveCart, formatPrice, getUser } from "@/lib/store";
import type { CartItem } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const DELIVERY_FEE_TIERS = [
  { min: 0, max: 150000, fee: 30000 },
  { min: 150000, max: 300000, fee: 15000 },
  { min: 300000, max: Infinity, fee: 0 },
];

export default function DeliveryPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [step, setStep] = useState<"menu" | "checkout" | "success">("menu");
  const [estimatedTime] = useState(25 + Math.floor(Math.random() * 15));
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [placing, setPlacing] = useState(false);

  useEffect(() => {
    setCart(getCart());
    getMenuItems().then(setMenuItems);
    getUser().then((user) => { if (user) setPhone(user.phone); });
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

  const getQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const deliveryFee = DELIVERY_FEE_TIERS.find((t) => subtotal >= t.min && subtotal < t.max)?.fee ?? 15000;
  const total = subtotal + deliveryFee - discount;
  const pointsToEarn = Math.floor(total / 1000);

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

  const placeOrder = async () => {
    if (!address.trim()) { alert("Vui lòng nhập địa chỉ giao hàng"); return; }
    if (placing) return;
    setPlacing(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("place_order", {
      p_items: cart.map((c) => ({ id: c.id, quantity: c.quantity })),
      p_type: "delivery",
      p_address: address,
      p_voucher_code: voucherCode || null,
    });
    setPlacing(false);
    if (error) {
      alert(error.message || "Không thể đặt hàng, vui lòng thử lại.");
      return;
    }
    saveCart([]);
    setCart([]);
    setVoucherCode("");
    setDiscount(0);
    setStep("success");
  };

  if (step === "success") {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6 text-center">
        <div className="text-7xl mb-6">🛵</div>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Đặt hàng thành công!</h2>
        <p className="text-gray-500 text-sm mb-6">Đơn hàng của bạn đang được chuẩn bị</p>
        <div className="card w-full p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
              <Clock size={22} className="text-primary-600" />
            </div>
            <div className="text-left">
              <p className="font-bold text-gray-800">Dự kiến giao trong</p>
              <p className="text-2xl font-black text-primary-600">{estimatedTime} phút</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {["Đơn xác nhận", "Đang nấu", "Shipper đã nhận", "Đang giao đến bạn"].map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <div className={clsx("w-6 h-6 rounded-full flex items-center justify-center", i <= 1 ? "bg-primary-600" : "bg-gray-200")}>
                  {i <= 1 ? <CheckCircle size={14} className="text-white" /> : <span className="w-2 h-2 rounded-full bg-white" />}
                </div>
                <span className={clsx("text-sm", i <= 1 ? "text-gray-800 font-medium" : "text-gray-400")}>{s}</span>
              </div>
            ))}
          </div>
        </div>
        <button onClick={() => router.push("/")} className="btn-primary px-8 py-3 w-full">
          Về trang chủ
        </button>
        <button onClick={() => { setStep("menu"); }} className="mt-3 text-sm text-gray-400">
          Đặt thêm đơn khác
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <button onClick={() => setShowCart(true)} className="relative w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
            <ShoppingCart size={18} className="text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Delivery info bar */}
        <div className="px-4 pb-3">
          <div className="bg-primary-50 rounded-xl p-3 flex items-center gap-2">
            <MapPin size={14} className="text-primary-600 flex-shrink-0" />
            <input
              type="text"
              placeholder="Nhập địa chỉ giao hàng..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
          </div>
          {/* Fee info */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
            {DELIVERY_FEE_TIERS.map((tier, i) => (
              <span key={i} className={clsx("px-2 py-0.5 rounded-full", subtotal >= tier.min && subtotal < tier.max ? "bg-primary-600 text-white font-semibold" : "bg-gray-100")}>
                {tier.fee === 0 ? "Miễn ship" : formatPrice(tier.fee) + " ship"}
              </span>
            ))}
          </div>
        </div>
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
      {totalItems > 0 && !showCart && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40">
          <button onClick={() => setShowCart(true)} className="w-full bg-primary-600 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl shadow-primary-600/30">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center">{totalItems}</span>
              <span className="font-semibold">Xem giỏ hàng</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold">{formatPrice(subtotal)}</span>
              <ArrowRight size={16} />
            </div>
          </button>
        </div>
      )}

      {/* Cart sheet */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white z-10 px-5 pt-5 pb-3 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Đơn giao hàng</h2>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="px-5 py-4 space-y-4">
              {/* Address */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Địa chỉ giao hàng</p>
                <input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ đầy đủ..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Số điện thoại</p>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-1.5">Ghi chú</p>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Dị ứng, ghi chú đặc biệt..."
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none h-16"
                />
              </div>

              {/* Items */}
              <div className="space-y-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 text-sm">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-primary-600 text-xs">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border rounded-full flex items-center justify-center"><Minus size={12} /></button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center"><Plus size={12} className="text-white" /></button>
                    </div>
                    <p className="text-sm font-bold w-20 text-right">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              {/* Voucher */}
              <div className="flex gap-2">
                <input
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                  placeholder="Mã giảm giá"
                  className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 uppercase"
                />
                <button onClick={applyVoucher} className="bg-primary-600 text-white px-4 rounded-xl text-sm font-semibold">
                  Áp dụng
                </button>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
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

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Truck size={18} /> {placing ? "Đang đặt..." : `Đặt giao hàng · ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
