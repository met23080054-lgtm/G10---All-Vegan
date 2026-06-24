"use client";

import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, ShoppingCart, Plus, Minus, X, Star,
  ChevronLeft, ArrowRight, CheckCircle, Leaf, Trash2
} from "lucide-react";
import { categories } from "@/data/menu";
import type { MenuItem } from "@/data/menu";
import { getMenuItems } from "@/lib/data";
import { getCart, saveCart, formatPrice } from "@/lib/store";
import type { CartItem } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

function MenuContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showCart, setShowCart] = useState(false);
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway">("dine-in");
  const [tableNumber, setTableNumber] = useState("1");
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [pointsToEarnState, setPointsToEarnState] = useState(0);
  const [placing, setPlacing] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCart(getCart());
    getMenuItems().then(setMenuItems);
    const itemId = searchParams.get("item");
    if (itemId) {
      setTimeout(() => {
        const el = document.getElementById(`item-${itemId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    }
  }, [searchParams]);

  const filtered = menuItems.filter((item) => {
    const matchCategory = activeCategory === "all" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

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
      const updated = prev
        .map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0);
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

  const getQty = (id: string) => cart.find((c) => c.id === id)?.quantity ?? 0;
  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const subtotal = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const total = subtotal - appliedDiscount;
  const pointsToEarn = Math.floor(total / 1000);

  const applyVoucher = async () => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("validate_and_consume_voucher", {
      p_code: voucherCode,
      p_subtotal: subtotal,
      p_delivery_fee: 0,
      p_commit: false,
    });
    if (error) {
      alert(error.message || "Mã giảm giá không hợp lệ hoặc đơn hàng chưa đủ điều kiện.");
      return;
    }
    setAppliedDiscount(data ?? 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0 || placing) return;
    setPlacing(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("place_order", {
      p_items: cart.map((c) => ({ id: c.id, quantity: c.quantity })),
      p_type: orderType,
      p_table_number: orderType === "dine-in" ? tableNumber : null,
      p_voucher_code: voucherCode || null,
    });
    setPlacing(false);
    if (error) {
      alert(error.message || "Không thể đặt món, vui lòng thử lại.");
      return;
    }
    setPointsToEarnState(data?.points_earned ?? pointsToEarn);
    saveCart([]);
    setCart([]);
    setVoucherCode("");
    setAppliedDiscount(0);
    setShowCart(false);
    setShowOrderSuccess(true);
    setTimeout(() => setShowOrderSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1">Thực đơn</h1>
          <button
            onClick={() => setShowCart(true)}
            className="relative w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center"
          >
            <ShoppingCart size={18} className="text-white" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2.5">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Tìm món ăn..."
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto px-4 pb-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={clsx(
                "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all",
                activeCategory === cat.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items */}
      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Leaf size={40} className="mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy món phù hợp</p>
          </div>
        )}
        {filtered.map((item) => {
          const qty = getQty(item.id);
          return (
            <div key={item.id} id={`item-${item.id}`} className="card flex gap-3 p-3">
              <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="96px" />
                {item.popular && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] bg-orange-500 text-white font-bold px-1.5 py-0.5 rounded-full">🔥</span>
                )}
                {item.new && (
                  <span className="absolute top-1.5 left-1.5 text-[9px] bg-primary-600 text-white font-bold px-1.5 py-0.5 rounded-full">Mới</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{item.description}</p>
                <div className="flex items-center gap-1 mt-1">
                  {item.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="text-[10px] bg-primary-50 text-primary-700 px-1.5 py-0.5 rounded-full font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <p className="font-bold text-primary-600">{formatPrice(item.price)}</p>
                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(item)}
                      className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                    >
                      <Plus size={16} className="text-white" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-7 h-7 border-2 border-primary-600 rounded-full flex items-center justify-center"
                      >
                        <Minus size={13} className="text-primary-600" />
                      </button>
                      <span className="text-sm font-bold text-gray-800 w-4 text-center">{qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center"
                      >
                        <Plus size={13} className="text-white" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating cart bar */}
      {totalItems > 0 && !showCart && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-primary-600 text-white rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-xl shadow-primary-600/30"
          >
            <div className="flex items-center gap-2">
              <span className="bg-white/20 rounded-full w-6 h-6 text-sm font-bold flex items-center justify-center">
                {totalItems}
              </span>
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
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowCart(false)} />
          <div ref={cartRef} className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-gray-100 flex-shrink-0">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Giỏ hàng</h2>
                <button onClick={() => setShowCart(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
              {/* Order type */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Hình thức</p>
                <div className="grid grid-cols-2 gap-2">
                  {(["dine-in", "takeaway"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setOrderType(type)}
                      className={clsx(
                        "py-2 rounded-xl text-sm font-semibold border-2 transition-all",
                        orderType === type
                          ? "border-primary-600 bg-primary-50 text-primary-700"
                          : "border-gray-200 text-gray-500"
                      )}
                    >
                      {type === "dine-in" ? "🍽 Tại bàn" : "🥡 Mang về"}
                    </button>
                  ))}
                </div>
                {orderType === "dine-in" && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm text-gray-600 shrink-0">Số bàn:</label>
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-primary-400"
                      placeholder="Nhập số bàn"
                    />
                  </div>
                )}
              </div>

              {/* Cart items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-700">Món đã chọn ({totalItems})</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="flex items-center gap-1 text-xs text-primary-600 font-semibold"
                  >
                    <Plus size={13} /> Thêm món khác
                  </button>
                </div>
                {cart.length === 0 && (
                  <p className="text-sm text-gray-400 py-3 text-center">Chưa có món nào trong giỏ</p>
                )}
                <div className="space-y-3">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                        <p className="text-xs text-primary-600 font-semibold">{formatPrice(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center">
                          <Plus size={12} className="text-white" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-gray-800 w-16 text-right">{formatPrice(item.price * item.quantity)}</p>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="w-7 h-7 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 flex-shrink-0"
                        aria-label="Xoá món"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Voucher */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Mã giảm giá</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã voucher"
                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-primary-400 uppercase"
                  />
                  <button onClick={applyVoucher} className="bg-primary-600 text-white px-4 rounded-xl text-sm font-semibold">
                    Áp dụng
                  </button>
                </div>
                {appliedDiscount > 0 && (
                  <p className="text-xs text-green-600 font-semibold mt-1.5 flex items-center gap-1">
                    <CheckCircle size={12} /> Tiết kiệm {formatPrice(appliedDiscount)}
                  </p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Giảm giá</span>
                    <span>-{formatPrice(appliedDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
                  <span>Tổng cộng</span>
                  <span className="text-primary-600">{formatPrice(total)}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  <Star size={12} fill="currentColor" />
                  <span>Bạn sẽ nhận được <strong>~{pointsToEarn} điểm</strong> từ đơn này</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex-shrink-0">
              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <CheckCircle size={18} />
                {placing ? "Đang đặt..." : `Đặt ngay · ${formatPrice(total)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order success toast */}
      {showOrderSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl px-5 py-4 w-80 flex items-center gap-3 border border-primary-100">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Đặt món thành công!</p>
            <p className="text-xs text-gray-500">Cộng {pointsToEarnState} điểm vào tài khoản</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MenuContent />
    </Suspense>
  );
}
