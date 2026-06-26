"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Package, Clock, MapPin, Truck, X, Star, Wallet, CheckCircle, AlertCircle } from "lucide-react";
import { getOrders, formatPrice, getOrderStatusLabel, getPaymentMethodLabel, markDeliveryCompletedIfExpired } from "@/lib/store";
import type { Order } from "@/lib/store";
import DeliveryStatusCard from "@/components/DeliveryStatusCard";

function isExpired(order: Order): boolean {
  if (!order.estimatedMinutes) return false;
  const elapsedMs = Date.now() - new Date(order.createdAt).getTime();
  return elapsedMs >= order.estimatedMinutes * 60000;
}

function DeliveryHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);
  const [momoToast, setMomoToast] = useState<"success" | "failed" | null>(null);

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success" || payment === "failed") {
      setMomoToast(payment);
      window.history.replaceState({}, "", "/delivery/history");
      setTimeout(() => setMomoToast(null), 4000);
    }
  }, [searchParams]);

  useEffect(() => {
    getOrders().then(async (all) => {
      const deliveryOrders = all.filter((o) => o.type === "delivery");
      const expiredStillDelivering = deliveryOrders.filter((o) => o.status === "delivering" && isExpired(o));
      if (expiredStillDelivering.length > 0) {
        await Promise.all(expiredStillDelivering.map((o) => markDeliveryCompletedIfExpired(o.id)));
        const refreshed = await getOrders();
        setOrders(refreshed.filter((o) => o.type === "delivery"));
      } else {
        setOrders(deliveryOrders);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-white shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3 px-4 pt-12 pb-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1">Lịch sử giao hàng</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p>Chưa có đơn giao hàng nào</p>
            <button onClick={() => router.push("/delivery")} className="btn-primary mt-4 px-6">
              Đặt giao hàng ngay
            </button>
          </div>
        )}

        {orders.map((order) => {
          const statusInfo = getOrderStatusLabel(order.status);
          const isActive = order.status === "delivering";
          return (
            <div key={order.id} className="card p-4">
              <div className="flex items-center justify-between mb-2">
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

              {order.address && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-2">
                  <MapPin size={11} /> <span className="truncate">{order.address}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                <Wallet size={11} />
                <span>{getPaymentMethodLabel(order.paymentMethod).label}</span>
                {order.paymentStatus === "pending" && (
                  <span className="text-[10px] font-semibold bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-full">
                    Chờ xác nhận thanh toán
                  </span>
                )}
                {order.paymentStatus === "failed" && (
                  <span className="text-[10px] font-semibold bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">
                    Thanh toán thất bại
                  </span>
                )}
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
                <p className="font-bold text-gray-800">{formatPrice(order.total)}</p>
                <div className="flex items-center gap-2">
                  {isActive && (
                    <button
                      onClick={() => setTrackedOrder(order)}
                      className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                    >
                      <Truck size={12} /> Theo dõi
                    </button>
                  )}
                  {order.status === "completed" && (
                    <button
                      onClick={() => router.push("/feedback?orderId=" + order.id)}
                      className="text-xs bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1"
                    >
                      <Star size={12} /> Đánh giá
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {trackedOrder && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setTrackedOrder(null)} />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl pt-5 px-5 pb-safe-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold">Hành trình đơn {trackedOrder.id}</h3>
              <button onClick={() => setTrackedOrder(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{trackedOrder.address}</p>
            <DeliveryStatusCard
              createdAt={trackedOrder.createdAt}
              estimatedMinutes={trackedOrder.estimatedMinutes}
              storeLat={trackedOrder.storeLat}
              storeLng={trackedOrder.storeLng}
              deliveryLat={trackedOrder.deliveryLat}
              deliveryLng={trackedOrder.deliveryLng}
            />
          </div>
        </div>
      )}

      {momoToast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl px-5 py-4 w-80 flex items-center gap-3 border border-primary-100">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            {momoToast === "success" ? (
              <CheckCircle size={20} className="text-primary-600" />
            ) : (
              <AlertCircle size={20} className="text-red-500" />
            )}
          </div>
          <div>
            <p className="font-bold text-gray-800">
              {momoToast === "success" ? "Thanh toán MoMo thành công!" : "Thanh toán MoMo thất bại"}
            </p>
            <p className="text-xs text-gray-500">
              {momoToast === "success" ? "Đơn hàng của bạn đã được xác nhận" : "Vui lòng thử lại hoặc chọn phương thức khác"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DeliveryHistoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <DeliveryHistoryContent />
    </Suspense>
  );
}
