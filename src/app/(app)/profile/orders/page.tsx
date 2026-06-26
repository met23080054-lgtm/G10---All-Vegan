"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Clock, Star, FileText, Download, Package } from "lucide-react";
import { getOrders, formatPrice, getOrderStatusLabel } from "@/lib/store";
import type { Order } from "@/lib/store";
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
    <div className="fixed inset-0 z-[60] flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl pt-5 px-5 pb-safe-5">
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
        <h3 className="text-lg font-bold mb-4">Hóa đơn điện tử</h3>
        <div className="bg-[#FBF7F2] rounded-xl p-4 font-mono text-xs space-y-1 text-gray-700">
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

const TABS = [
  { id: "ongoing", label: "Đang thực hiện", statuses: ["pending", "confirmed", "preparing"] },
  { id: "completed", label: "Đã hoàn tất", statuses: ["completed"] },
  { id: "cancelled", label: "Đã hủy", statuses: ["cancelled"] },
] as const;

export default function DineInOrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]["id"]>("ongoing");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    getOrders().then((all) => setOrders(all.filter((o) => o.type !== "delivery")));
  }, []);

  const currentTab = TABS.find((t) => t.id === activeTab)!;
  const filtered = orders.filter((o) => (currentTab.statuses as readonly string[]).includes(o.status));

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 pt-12 pb-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1">Lịch sử đơn hàng</h1>
        </div>
        <div className="flex border-b border-gray-100">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex-1 py-3 text-sm font-semibold border-b-2 transition-all",
                activeTab === tab.id ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có đơn nào trong mục này</p>
          </div>
        )}
        {filtered.map((order) => {
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
                {order.status === "completed" && (
                  <div className="flex items-center gap-2">
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
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedOrder && (
        <EInvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      )}
    </div>
  );
}
