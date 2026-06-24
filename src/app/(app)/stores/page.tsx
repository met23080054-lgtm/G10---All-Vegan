"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, MapPin, Phone, Clock, Navigation, CheckCircle,
  Wifi, Truck, ParkingCircle, Star, ChevronDown, ChevronUp, ExternalLink
} from "lucide-react";
import { getStores } from "@/lib/data";
import type { Store } from "@/data/stores";
import clsx from "clsx";

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

export default function StoresPage() {
  const router = useRouter();
  const [stores, setStores] = useState<Store[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);

  useEffect(() => {
    getStores().then((data) => {
      setStores(data);
      if (data.length > 0) {
        setExpanded(data[0].id);
        setActiveStoreId(data[0].id);
      }
    });
  }, []);

  const activeStore = stores.find((s) => s.id === activeStoreId) ?? stores[0];

  const handleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
    setActiveStoreId(id);
  };

  if (!activeStore) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
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

      {/* Map placeholder */}
      <div className="relative h-56 bg-gradient-to-br from-green-100 to-emerald-50 overflow-hidden">
        {/* Simulated map UI */}
        <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 opacity-10">
          {Array.from({ length: 36 }).map((_, i) => (
            <div key={i} className="border border-green-400" />
          ))}
        </div>
        {/* Street lines */}
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white/60" />
          <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-white/60" />
          <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-white/60" />
          <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-white/60" />
        </div>
        {/* Store pins */}
        {stores.map((store, i) => {
          const positions = [
            { top: "35%", left: "55%" },
            { top: "60%", left: "38%" },
            { top: "25%", left: "22%" },
          ];
          const pos = positions[i] ?? { top: "50%", left: "50%" };
          return (
            <button
              key={store.id}
              onClick={() => handleExpand(store.id)}
              className={clsx(
                "absolute -translate-x-1/2 -translate-y-full flex flex-col items-center transition-all",
                activeStore.id === store.id ? "scale-110 z-10" : "scale-90 opacity-70"
              )}
              style={pos}
            >
              <div className={clsx(
                "w-9 h-9 rounded-full flex items-center justify-center shadow-lg border-2 border-white",
                activeStore.id === store.id ? "bg-primary-600" : "bg-[#FBF7F2]0"
              )}>
                <MapPin size={16} className="text-white" />
              </div>
              <div className={clsx(
                "text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 whitespace-nowrap shadow",
                activeStore.id === store.id ? "bg-primary-600 text-white" : "bg-white text-gray-700"
              )}>
                {store.district}
              </div>
            </button>
          );
        })}

        {/* Map attribution */}
        <div className="absolute bottom-2 right-2 bg-white/80 rounded px-2 py-0.5 text-[10px] text-gray-500 flex items-center gap-1">
          <MapPin size={10} className="text-primary-600" /> Hà Nội
        </div>

        {/* Open in Google Maps */}
        <a
          href={activeStore.mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white rounded-lg shadow px-3 py-1.5 text-xs font-semibold text-primary-700"
        >
          <ExternalLink size={12} /> Mở Google Maps
        </a>
      </div>

      {/* Store list */}
      <div className="px-4 py-4 space-y-3">
        {stores.map((store) => (
          <div key={store.id} className="card overflow-hidden">
            <button
              onClick={() => handleExpand(store.id)}
              className="w-full p-4 flex items-center gap-3 text-left"
            >
              <div className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                activeStore.id === store.id ? "bg-primary-600" : "bg-gray-100"
              )}>
                <MapPin size={18} className={activeStore.id === store.id ? "text-white" : "text-gray-500"} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 text-sm">{store.name}</p>
                <p className="text-xs text-gray-400 truncate">{store.address}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-xs text-green-600 font-medium">Mở cửa</span>
                </div>
                {expanded === store.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </div>
            </button>

            {expanded === store.id && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                <div className="space-y-2.5 mb-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <MapPin size={15} className="text-primary-500 flex-shrink-0" />
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
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {store.features.map((f) => (
                    <span key={f} className="flex items-center gap-1 text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                      {FEATURE_ICONS[f] ?? <CheckCircle size={11} />}
                      {f}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={store.mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 border-2 border-primary-600 text-primary-600 rounded-xl py-2.5 text-sm font-semibold"
                  >
                    <Navigation size={15} /> Chỉ đường
                  </a>
                  <a
                    href={`tel:${store.phone}`}
                    className="flex items-center justify-center gap-1.5 bg-primary-600 text-white rounded-xl py-2.5 text-sm font-semibold"
                  >
                    <Phone size={15} /> Gọi ngay
                  </a>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info section */}
      <div className="px-4 pb-6">
        <div className="card p-4 bg-primary-50 border-primary-100 border">
          <p className="font-bold text-primary-800 mb-2">📍 Tìm chi nhánh gần bạn</p>
          <p className="text-sm text-primary-700">Mở Google Maps để tìm đường đến chi nhánh All Vegan gần nhất. Chúng tôi sẵn sàng phục vụ bạn!</p>
          <a
            href="https://maps.google.com/?q=All+Vegan+Ha+Noi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-primary-700 bg-white rounded-lg px-3 py-2"
          >
            <ExternalLink size={14} /> Xem tất cả trên Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
