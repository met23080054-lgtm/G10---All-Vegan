"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, MapPin, Phone, Clock, Navigation, CheckCircle,
  Wifi, Truck, ParkingCircle, Star, ExternalLink
} from "lucide-react";
import { getStores } from "@/lib/data";
import type { Store } from "@/data/stores";

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "Wifi miễn phí": <Wifi size={12} />,
  "Giao hàng": <Truck size={12} />,
  "Bãi xe máy": <ParkingCircle size={12} />,
  "Bãi xe ô tô": <ParkingCircle size={12} />,
  "Đặt bàn trước": <CheckCircle size={12} />,
  "Phòng VIP": <Star size={12} />,
  "Chỗ ngồi ngoài trời": <MapPin size={12} />,
  "Phục vụ sự kiện": <Star size={12} />,
};

const EMBED_URL = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14897.41998896311!2d105.79892595541993!3d21.018477099999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab001fff58cd%3A0xbe58b9c624b647d5!2zQWxsIHZlZ2FuIGJ1ZmZlciBs4bqpdSByYXUgbuG6pW0!5e0!3m2!1svi!2s!4v1782445671509!5m2!1svi!2s";

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    getStores().then(setStores);
  }, []);

  const store = stores[0];

  return (
    <div className="min-h-screen bg-[#FBF7F2] pb-24">
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 pt-12 pb-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1">Chi nhánh All Vegan</h1>
          <span className="text-xs bg-primary-100 text-primary-700 font-bold px-2 py-1 rounded-full">
            {stores.length} chi nhánh
          </span>
        </div>
      </div>

      {/* Google Maps embed */}
      <div className="relative w-full" style={{ height: 260 }}>
        <iframe
          src={EMBED_URL}
          width="100%"
          height="260"
          style={{ border: 0, display: "block" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title="Bản đồ All Vegan"
        />
        {store && (
          <a
            href={store.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white rounded-lg shadow-md px-3 py-1.5 text-xs font-semibold text-primary-700"
          >
            <ExternalLink size={12} /> Mở Google Maps
          </a>
        )}
      </div>

      {/* Store detail */}
      {store && (
        <div className="px-4 py-4 space-y-4">
          <div className="card overflow-hidden">
            <div className="bg-primary-600 px-4 py-3 flex items-center gap-2">
              <MapPin size={16} className="text-white" />
              <p className="font-bold text-white">{store.name}</p>
              <span className="ml-auto flex items-center gap-1 text-xs text-white/80">
                <span className="w-2 h-2 bg-green-400 rounded-full" /> Đang mở cửa
              </span>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-start gap-3 text-sm text-gray-600">
                <MapPin size={15} className="text-primary-500 flex-shrink-0 mt-0.5" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Phone size={15} className="text-primary-500 flex-shrink-0" />
                <a href={`tel:${store.phone}`} className="text-primary-600 font-medium">{store.phone}</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Clock size={15} className="text-primary-500 flex-shrink-0" />
                <span>{store.hours}</span>
              </div>
            </div>

            {/* Features */}
            <div className="px-4 pb-4 flex flex-wrap gap-1.5">
              {store.features.map((f) => (
                <span key={f} className="flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                  {FEATURE_ICONS[f] ?? <CheckCircle size={11} />}
                  {f}
                </span>
              ))}
            </div>

            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <a
                href={store.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 border-2 border-primary-600 text-primary-600 rounded-xl py-3 text-sm font-semibold"
              >
                <Navigation size={15} /> Chỉ đường
              </a>
              <a
                href={`tel:${store.phone}`}
                className="flex items-center justify-center gap-1.5 bg-primary-600 text-white rounded-xl py-3 text-sm font-semibold"
              >
                <Phone size={15} /> Gọi ngay
              </a>
            </div>
          </div>

          <div className="card p-4 bg-primary-50 border-primary-100 border">
            <p className="font-bold text-primary-800 mb-1">🌿 All Vegan – Ẩm thực thuần chay</p>
            <p className="text-sm text-primary-700">Buffet lẩu rau nấm thuần chay. Không gian thoáng mát, phù hợp gia đình và nhóm bạn.</p>
          </div>
        </div>
      )}

      {!store && (
        <div className="flex items-center justify-center h-40">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
