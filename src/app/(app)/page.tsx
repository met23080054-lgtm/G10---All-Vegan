"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Bell, ChevronRight, Zap, ShoppingBag, Truck,
  Star, Gamepad2, Clock, Gift, BadgeCheck, Leaf
} from "lucide-react";
import { getUser, formatPrice, getTierInfo } from "@/lib/store";
import { getMenuItems } from "@/lib/data";
import type { User } from "@/lib/store";
import type { MenuItem } from "@/data/menu";

const banners = [
  {
    id: 1,
    title: "Ẩm thực thuần chay",
    subtitle: "Tươi ngon · Bổ dưỡng · Tự nhiên",
    badge: "All Vegan",
    gradient: "from-primary-700 to-primary-500",
    emoji: "🌿",
  },
  {
    id: 2,
    title: "Ưu đãi thành viên",
    subtitle: "Tích điểm mỗi đơn, đổi ngay quà hấp dẫn",
    badge: "Loyalty",
    gradient: "from-emerald-700 to-teal-500",
    emoji: "⭐",
  },
  {
    id: 3,
    title: "Giao hàng tận nơi",
    subtitle: "30 phút · Phí ship chỉ từ 15.000đ",
    badge: "Delivery",
    gradient: "from-green-700 to-lime-500",
    emoji: "🛵",
  },
];

const quickActions = [
  { href: "/menu", label: "Đặt món", icon: ShoppingBag, color: "bg-primary-50 text-primary-600" },
  { href: "/delivery", label: "Giao hàng", icon: Truck, color: "bg-blue-50 text-blue-600" },
  { href: "/loyalty", label: "Điểm thưởng", icon: Star, color: "bg-yellow-50 text-yellow-600" },
  { href: "/game", label: "Trò chơi", icon: Gamepad2, color: "bg-purple-50 text-purple-600" },
  { href: "/feedback", label: "Đánh giá", icon: BadgeCheck, color: "bg-pink-50 text-pink-600" },
  { href: "/stores", label: "Chi nhánh", icon: MapPin, color: "bg-orange-50 text-orange-600" },
];

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    getUser().then(setUser);
    getMenuItems().then(setMenuItems);
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const tierInfo = user ? getTierInfo(user.tier) : null;
  const popularItems = menuItems.filter((m) => m.popular).slice(0, 4);
  const newItems = menuItems.filter((m) => m.new).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
              <MapPin size={12} className="text-primary-500" />
              <span>Hoàn Kiếm, Hà Nội</span>
            </div>
            <p className="text-gray-500 text-sm">
              Xin chào, <span className="font-bold text-gray-800">{user?.name?.split(" ").pop() ?? "bạn"} 👋</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/loyalty" className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${tierInfo?.bg ?? "bg-gray-100"} ${tierInfo?.color ?? "text-gray-600"} border ${tierInfo?.border ?? "border-gray-300"}`}>
              <Leaf size={12} />
              {tierInfo?.label ?? "Đồng"} · {user?.points?.toLocaleString("vi-VN") ?? 0}đ
            </Link>
            <button className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative">
              <Bell size={18} className="text-gray-600" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Banner carousel */}
        <div className="relative h-40 rounded-2xl overflow-hidden">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 bg-gradient-to-r ${b.gradient} transition-opacity duration-700 ${i === currentBanner ? "opacity-100" : "opacity-0"}`}
            >
              <div className="p-5 h-full flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {b.badge}
                  </span>
                  <h2 className="text-2xl font-extrabold text-white mt-2">{b.title}</h2>
                  <p className="text-white/80 text-sm mt-1">{b.subtitle}</p>
                </div>
                <Link
                  href={b.id === 1 ? "/menu" : b.id === 2 ? "/loyalty" : "/delivery"}
                  className="inline-flex items-center gap-1 text-white text-sm font-semibold"
                >
                  Khám phá ngay <ChevronRight size={16} />
                </Link>
              </div>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-30">{b.emoji}</div>
            </div>
          ))}
          <div className="absolute bottom-3 right-4 flex gap-1.5">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentBanner(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentBanner ? "w-6 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        </div>

        {/* Loyalty snapshot */}
        {user && (
          <Link href="/loyalty" className="block card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tierInfo?.bg} ${tierInfo?.border} border-2`}>
                  <Star size={20} className={tierInfo?.color} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Thành viên {tierInfo?.label}</p>
                  <p className="text-xl font-extrabold text-gray-800">{user.points.toLocaleString("vi-VN")} điểm</p>
                  {tierInfo?.nextTier && (
                    <p className="text-[11px] text-gray-400">
                      Còn {(tierInfo.maxPoints - user.points + 1).toLocaleString("vi-VN")} điểm lên {tierInfo.nextTier}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary-600">
                  <Gift size={14} />
                  <span className="text-xs font-semibold">Đổi quà</span>
                </div>
                <ChevronRight size={18} className="text-gray-300 ml-auto mt-1" />
              </div>
            </div>
            {tierInfo?.nextTier && (
              <div className="mt-3">
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-primary-300 rounded-full transition-all"
                    style={{ width: `${Math.min(100, ((user.points - tierInfo.minPoints) / (tierInfo.maxPoints - tierInfo.minPoints)) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </Link>
        )}

        {/* Quick actions */}
        <div>
          <h2 className="section-title mb-3">Tiện ích</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map(({ href, label, icon: Icon, color }) => (
              <Link key={href} href={href} className="card p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
                  <Icon size={22} />
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Today's specials */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h2 className="section-title">Bán chạy hôm nay</h2>
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                <Zap size={10} /> Hot
              </span>
            </div>
            <Link href="/menu" className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              Xem thêm <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {popularItems.map((item) => (
              <Link key={item.id} href={`/menu?item=${item.id}`} className="card flex-shrink-0 w-44">
                <div className="relative h-28 bg-gray-100">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="176px"
                  />
                  <span className="absolute top-2 left-2 text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full">
                    🔥 Hot
                  </span>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold text-gray-800 line-clamp-2">{item.name}</p>
                  <p className="text-primary-600 font-bold text-sm mt-1">{formatPrice(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* New items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="section-title">Mới nhất</h2>
            <Link href="/menu" className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              Xem thêm <ChevronRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {newItems.map((item) => (
              <Link key={item.id} href={`/menu?item=${item.id}`} className="card flex items-center gap-3 p-3 hover:shadow-md transition-shadow">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] bg-primary-100 text-primary-700 font-bold px-1.5 py-0.5 rounded-full">Mới</span>
                  </div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{item.name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{item.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-primary-600 font-bold text-sm">{formatPrice(item.price)}</p>
                  <div className="flex items-center gap-0.5 text-yellow-500 mt-0.5">
                    <Star size={11} fill="currentColor" />
                    <span className="text-[10px] text-gray-500">4.8</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* App exclusive banner */}
        <div className="card bg-gradient-to-r from-primary-600 to-emerald-500 p-4 text-white">
          <div className="flex items-center gap-2 mb-1">
            <Gift size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Ưu đãi App độc quyền</span>
          </div>
          <p className="font-bold text-lg">Giảm 20% đơn đầu tiên</p>
          <p className="text-sm text-white/80 mt-0.5">Dùng mã <strong>WELCOME20</strong> khi đặt qua App</p>
          <Link href="/loyalty" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all">
            Xem voucher của tôi <ChevronRight size={14} />
          </Link>
        </div>

        {/* Operating hours */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Giờ hoạt động</p>
              <p className="text-sm text-gray-500">07:00 – 22:00 · Tất cả các ngày</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-semibold">Đang mở cửa</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
