"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, User, Phone, Mail, Clock,
  MapPin, FileText, Star, Download, CheckCircle, Package
} from "lucide-react";
import { getUser, getOrders, formatPrice, getOrderStatusLabel, getTierInfo } from "@/lib/store";
import type { User as UserType, Order } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

function EInvoiceModal({ order, onClose }: { order: Order; onClose: () => void }) {
  const handleDownload = () => {
    const content = `
HÓA ĐƠN ĐIỆN TỬ / E-INVOICE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Nhà hàng: ALL VEGAN
Mã số thuế: 0123456789
Địa chỉ: 15 Hàng Bài, Hoàn Kiếm, HN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Mã hóa đơn: ${order.invoiceId ?? "INV-" + order.id}
Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}
Mã đơn: ${order.id}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CHI TIẾT ĐƠN HÀNG:
${order.items.map((i) => `${i.name} x${i.quantity}  ${formatPrice(i.price * i.quantity)}`).join("\n")}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TỔNG CỘNG: ${formatPrice(order.total)}
(Đã bao gồm VAT 10%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Cảm ơn quý khách!
All Vegan – Thuần chay · Tươi ngon · Bổ dưỡng
    `.trim();
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${order.invoiceId ?? "invoice"}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl p-5">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold mb-4">Hóa đơn điện tử</h3>
        <div className="bg-gray-50 rounded-xl p-4 font-mono text-xs space-y-1 text-gray-700">
          <p className="font-bold text-center text-sm mb-2">ALL VEGAN</p>
          <p>Mã HĐ: {order.invoiceId ?? "INV-" + order.id}</p>
          <p>Ngày: {new Date().toLocaleDateString("vi-VN")}</p>
          <p>Mã đơn: {order.id}</p>
          <div className="border-t border-gray-200 my-2" />
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span>{item.name} x{item.quantity}</span>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 my-2" />
          <div className="flex justify-between font-bold">
            <span>Tổng cộng</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          <p className="text-center text-gray-400 mt-2">(Đã bao gồm VAT 10%)</p>
        </div>
        <button
          onClick={handleDownload}
          className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
        >
          <Download size={16} /> Tải hóa đơn
        </button>
        <button onClick={onClose} className="w-full mt-2 py-2.5 text-sm text-gray-500 font-medium">
          Đóng
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<"orders" | "info">("orders");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getUser().then(setUser);
    getOrders().then(setOrders);
  }, []);

  if (!user) return null;
  const tierInfo = getTierInfo(user.tier);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 pt-12 pb-6 px-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">Tài khoản</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{user.name}</p>
            <p className="text-white/60 text-sm">{user.phone}</p>
            <div className={`inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full text-xs font-bold ${tierInfo.bg} ${tierInfo.color} border ${tierInfo.border}`}>
              <Star size={10} fill="currentColor" />
              Thành viên {tierInfo.label}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: "Điểm tích lũy", value: user.points.toLocaleString("vi-VN") + " đ" },
            { label: "Đơn hàng", value: user.ordersCount },
            { label: "Tổng chi tiêu", value: (user.totalSpent / 1000000).toFixed(1) + "M" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center text-white">
              <p className="font-bold text-base">{value}</p>
              <p className="text-xs text-white/60 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex">
          {(["orders", "info"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "flex-1 py-3 text-sm font-semibold border-b-2 transition-all",
                activeTab === tab ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"
              )}
            >
              {tab === "orders" ? "Lịch sử đơn hàng" : "Thông tin cá nhân"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {activeTab === "orders" && (
          <div className="space-y-3">
            {orders.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Package size={40} className="mx-auto mb-3 opacity-30" />
                <p>Chưa có đơn hàng nào</p>
              </div>
            )}
            {orders.map((order) => {
              const statusInfo = getOrderStatusLabel(order.status);
              return (
                <div key={order.id} className="card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{order.id}</p>
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock size={11} /> {order.date}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} x{item.quantity}</span>
                        <span className="text-gray-700 font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800">{formatPrice(order.total)}</p>
                      {order.pointsEarned > 0 && (
                        <div className="flex items-center gap-1 text-xs text-amber-600 mt-0.5">
                          <Star size={10} fill="currentColor" />
                          +{order.pointsEarned} điểm
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {order.status === "completed" && (
                        <>
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="text-xs border border-gray-200 px-3 py-1.5 rounded-lg font-medium text-gray-600 flex items-center gap-1"
                          >
                            <FileText size={12} /> Hóa đơn
                          </button>
                          <button
                            onClick={() => router.push("/feedback?orderId=" + order.id)}
                            className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                          >
                            <Star size={12} /> Đánh giá
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {order.type === "delivery" && order.address && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
                      <MapPin size={11} /> {order.address}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "info" && (
          <div className="space-y-3">
            <div className="card divide-y divide-gray-100">
              {[
                { icon: User, label: "Họ và tên", value: user.name },
                { icon: Phone, label: "Số điện thoại", value: user.phone },
                { icon: Mail, label: "Email", value: user.email },
                { icon: Clock, label: "Ngày tham gia", value: new Date(user.joinDate).toLocaleDateString("vi-VN") },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-4 p-4">
                  <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="font-medium text-gray-800 text-sm">{value}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              ))}
            </div>

            <div className="card p-4">
              <p className="font-semibold text-gray-800 mb-3">Cài đặt thông báo</p>
              {["Thông báo khuyến mãi", "Cập nhật đơn hàng", "Tin tức từ All Vegan"].map((setting) => (
                <div key={setting} className="flex items-center justify-between py-2.5 border-b last:border-0 border-gray-100">
                  <p className="text-sm text-gray-700">{setting}</p>
                  <div className="w-11 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={async () => {
                const supabase = createClient();
                await supabase.auth.signOut();
                router.push("/login");
                router.refresh();
              }}
              className="card w-full p-4 flex items-center justify-between text-red-500"
            >
              <span className="font-semibold text-sm">Đăng xuất</span>
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {selectedOrder && (
        <EInvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
