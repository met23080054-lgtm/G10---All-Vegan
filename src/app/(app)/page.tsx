"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin, Bell, ChevronRight, Zap, ShoppingBag, Truck,
  Star, Gamepad2, Clock, Gift, BadgeCheck, Leaf, X, LogIn, Ticket, Megaphone
} from "lucide-react";
import { getUser, getActiveDelivery, getVouchers, formatPrice, getTierInfo } from "@/lib/store";
import { getMenuItems } from "@/lib/data";
import type { User, Order } from "@/lib/store";
import type { MenuItem } from "@/data/menu";
import DeliveryStatusCard from "@/components/DeliveryStatusCard";
import NotificationPanel, { type NotificationItem } from "@/components/NotificationPanel";
import { createClient } from "@/lib/supabase/client";
import { DELIVERY_STAGES, getDeliveryStageIndex } from "@/lib/deliveryStatus";
import { useLang } from "@/context/LanguageContext";
import clsx from "clsx";

interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  gradient: string;
  emoji?: string;
  image?: string;
  href: string;
}

const PROMO_IMAGES = [
  "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&q=80",
  "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80",
];

export default function HomePage() {
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [activeDelivery, setActiveDelivery] = useState<Order | null>(null);
  const [showTracking, setShowTracking] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [promoBannerData, setPromoBannerData] = useState<
    { code: string; name: string; min_order: number }[]
  >([]);

  const baseBanners: Banner[] = [
    {
      id: "brand",
      title: t("home.bannerBrandTitle"),
      subtitle: t("home.bannerBrandSubtitle"),
      badge: "All Vegan",
      gradient: "from-primary-700 to-primary-500",
      emoji: "🌿",
      href: "/menu",
    },
    {
      id: "loyalty",
      title: t("home.bannerLoyaltyTitle"),
      subtitle: t("home.bannerLoyaltySubtitle"),
      badge: "Loyalty",
      gradient: "from-emerald-700 to-teal-500",
      emoji: "⭐",
      href: "/loyalty",
    },
  ];

  const quickActions = [
    { href: "/menu", label: t("action.order"), icon: ShoppingBag, color: "bg-primary-50 text-primary-600" },
    { href: "/delivery", label: t("action.delivery"), icon: Truck, color: "bg-blue-50 text-blue-600" },
    { href: "/loyalty", label: t("action.rewards"), icon: Star, color: "bg-yellow-50 text-yellow-600" },
    { href: "/game", label: t("action.game"), icon: Gamepad2, color: "bg-purple-50 text-purple-600" },
    { href: "/feedback", label: t("action.feedback"), icon: BadgeCheck, color: "bg-pink-50 text-pink-600" },
    { href: "/stores", label: t("action.branches"), icon: MapPin, color: "bg-orange-50 text-orange-600" },
  ];

  // Rebuild banners when language changes or promo data arrives
  useEffect(() => {
    const promoBanners: Banner[] = promoBannerData.map((p, i) => ({
      id: `promo-${p.code}`,
      title: p.name,
      subtitle: t("home.promoCode", { code: p.code }) + (p.min_order > 0 ? t("home.promoMinOrder", { amount: p.min_order.toLocaleString("vi-VN") }) : ""),
      badge: t("home.promoLabel"),
      gradient: "from-orange-700 to-amber-500",
      image: PROMO_IMAGES[i % PROMO_IMAGES.length],
      href: "/menu",
    }));
    setBanners([...baseBanners, ...promoBanners]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promoBannerData, t]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "success") {
      sessionStorage.setItem("av_just_logged_in", "1");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      getUser(),
      getMenuItems(),
      getActiveDelivery(),
      supabase
        .from("voucher_templates")
        .select("code, name, discount, discount_type, min_order")
        .eq("active", true)
        .eq("points_cost", 0),
    ]).then(([userData, menuData, delivery, { data: promos }]) => {
      setUser(userData);
      setMenuItems(menuData);
      setActiveDelivery(delivery);
      if (promos) setPromoBannerData(promos);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % Math.max(1, banners.length));
    }, 3500);
    return () => clearInterval(interval);
  }, [banners.length]);

  useEffect(() => {
    const buildNotifications = async () => {
      const items: NotificationItem[] = [];

      if (typeof window !== "undefined" && sessionStorage.getItem("av_just_logged_in")) {
        items.push({
          id: "login-success",
          icon: <LogIn size={16} />,
          title: t("home.loginSuccess"),
          description: t("home.welcomeBack"),
        });
        sessionStorage.removeItem("av_just_logged_in");
      }

      if (activeDelivery) {
        const elapsedMs = Date.now() - new Date(activeDelivery.createdAt).getTime();
        const totalMs = (activeDelivery.estimatedMinutes ?? 30) * 60000;
        const progress = Math.min(0.95, Math.max(0.02, elapsedMs / totalMs));
        const stageLabel = DELIVERY_STAGES[getDeliveryStageIndex(progress)].label;
        items.push({
          id: `order-${activeDelivery.id}`,
          icon: <Truck size={16} />,
          title: t("home.orderStatus", { id: activeDelivery.id, status: stageLabel }),
          description: activeDelivery.address ?? t("home.orderProcessing"),
        });
      }

      const vouchers = await getVouchers();
      vouchers.filter((v) => !v.used).forEach((v) => {
        items.push({
          id: `voucher-${v.id}`,
          icon: <Ticket size={16} />,
          title: `Voucher "${v.name}" ${t("home.voucherExpiring")}`,
          description: `Mã ${v.code} · Hết hạn ${v.expiry}`,
        });
      });

      promoBannerData.forEach((p) => {
        items.push({
          id: `promo-${p.code}`,
          icon: <Megaphone size={16} />,
          title: `${t("home.promo")} ${p.name}`,
          description: t("home.promoCode", { code: p.code }) + (p.min_order > 0 ? t("home.promoMinOrder", { amount: p.min_order.toLocaleString("vi-VN") }) : ""),
        });
      });

      setNotifications(items);
    };
    buildNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDelivery, promoBannerData]);

  const tierInfo = user ? getTierInfo(user.tier) : null;
  const popularItems = menuItems.filter((m) => m.popular).slice(0, 4);
  const newItems = menuItems.filter((m) => m.new).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Header */}
      <div className="bg-white px-4 pt-12 pb-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-0.5">
              <MapPin size={12} className="text-primary-500" />
              <span>{t("home.location")}</span>
            </div>
            <p className="text-gray-500 text-sm">
              {t("home.greeting")} <span className="font-bold text-gray-800">{user?.name?.split(" ").pop() ?? t("home.you")} 👋</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/loyalty" className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold ${tierInfo?.bg ?? "bg-gray-100"} ${tierInfo?.color ?? "text-gray-600"} border ${tierInfo?.border ?? "border-gray-300"}`}>
              <Leaf size={12} />
              {user ? t(`tier.${user.tier}`) : "—"} · {user?.points?.toLocaleString("vi-VN") ?? 0}đ
            </Link>
            <button
              onClick={() => setShowNotifications(true)}
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center relative"
            >
              <Bell size={18} className="text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className={clsx("px-4 py-4 space-y-5", activeDelivery && "pb-28")}>
        {/* Banner carousel */}
        <div className="relative h-40 rounded-2xl overflow-hidden">
          {banners.map((b, i) => (
            <div
              key={b.id}
              className={`absolute inset-0 flex transition-opacity duration-700 ${i === currentBanner ? "opacity-100" : "opacity-0"}`}
            >
              <div className={`flex-1 min-w-0 bg-gradient-to-br ${b.gradient} p-4 flex flex-col justify-between`}>
                <div>
                  <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full uppercase tracking-wide">
                    {b.badge}
                  </span>
                  <h2 className="text-xl font-extrabold text-white mt-2 leading-tight">{b.title}</h2>
                  <p className="text-white/80 text-xs mt-1 line-clamp-2">{b.subtitle}</p>
                </div>
                <Link href={b.href} className="inline-flex items-center gap-1 text-white text-sm font-semibold">
                  {t("home.explore")} <ChevronRight size={16} />
                </Link>
              </div>
              <div className={`relative w-28 flex-shrink-0 bg-gradient-to-br ${b.gradient}`}>
                {b.image ? (
                  <Image src={b.image} alt={b.title} fill className="object-cover" sizes="112px" />
                ) : b.emoji ? (
                  <div className="absolute inset-0 flex items-center justify-center text-6xl">{b.emoji}</div>
                ) : null}
              </div>
            </div>
          ))}
          <div className="absolute bottom-2 inset-x-0 flex items-center justify-center gap-1.5">
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
        {user && tierInfo && (
          <Link href="/loyalty" className="block card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tierInfo.bg} ${tierInfo.border} border-2`}>
                  <Star size={20} className={tierInfo.color} fill="currentColor" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{t("common.member")} {t(`tier.${user.tier}`)}</p>
                  <p className="text-xl font-extrabold text-gray-800">{user.points.toLocaleString("vi-VN")} {t("common.points")}</p>
                  {tierInfo.nextTierId && (
                    <p className="text-[11px] text-gray-400">
                      {t("home.pointsToNext", {
                        n: (tierInfo.maxPoints - user.points + 1).toLocaleString("vi-VN"),
                        tier: t(`tier.${tierInfo.nextTierId}`),
                      })}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-1 text-primary-600">
                  <Gift size={14} />
                  <span className="text-xs font-semibold">{t("home.redeemGifts")}</span>
                </div>
                <ChevronRight size={18} className="text-gray-300 ml-auto mt-1" />
              </div>
            </div>
            {tierInfo.nextTierId && (
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
          <h2 className="section-title mb-3">{t("home.utilities")}</h2>
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
              <h2 className="section-title">{t("home.popular")}</h2>
              <span className="flex items-center gap-1 text-[10px] font-semibold bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                <Zap size={10} /> {t("home.hot")}
              </span>
            </div>
            <Link href="/menu" className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              {t("home.seeMore")} <ChevronRight size={14} />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide">
            {popularItems.map((item) => (
              <Link key={item.id} href={`/menu?item=${item.id}`} className="card flex-shrink-0 w-44">
                <div className="relative h-28 bg-gray-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="176px" />
                  <span className="absolute top-2 left-2 text-[10px] bg-orange-500 text-white font-bold px-2 py-0.5 rounded-full">
                    🔥 {t("home.hot")}
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
            <h2 className="section-title">{t("home.newest")}</h2>
            <Link href="/menu" className="text-xs text-primary-600 font-semibold flex items-center gap-0.5">
              {t("home.seeMore")} <ChevronRight size={14} />
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
                    <span className="text-[10px] bg-primary-100 text-primary-700 font-bold px-1.5 py-0.5 rounded-full">{t("home.new")}</span>
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
            <span className="text-xs font-bold uppercase tracking-wide">{t("home.exclusiveOffer")}</span>
          </div>
          <p className="font-bold text-lg">{t("home.discount20")}</p>
          <p className="text-sm text-white/80 mt-0.5">{t("home.welcomeCode")}</p>
          <Link href="/loyalty" className="inline-flex items-center gap-1 mt-3 text-sm font-semibold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-all">
            {t("home.viewVouchers")} <ChevronRight size={14} />
          </Link>
        </div>

        {/* Operating hours */}
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <Clock size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">{t("home.operatingHours")}</p>
              <p className="text-sm text-gray-500">{t("home.hours")}</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs text-green-600 font-semibold">{t("home.open")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active delivery tracking */}
      {activeDelivery && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md z-40">
          <button
            onClick={() => setShowTracking(true)}
            className="w-full card p-4 flex items-center gap-3 text-left bg-gradient-to-r from-primary-600 to-primary-500 relative overflow-hidden shadow-xl shadow-primary-900/30"
          >
            <span className="absolute top-2.5 right-3 flex items-center gap-1 text-[10px] font-bold text-white/90 uppercase tracking-wide">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
              </span>
              Live
            </span>
            <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 text-2xl animate-bounce">
              🛵
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm">
                {t("common.orders")} {activeDelivery.id} {t("home.orderDelivering")}
              </p>
              <p className="text-white/80 text-xs truncate">{activeDelivery.address}</p>
            </div>
            <div className="text-white text-xs font-semibold flex items-center gap-0.5 flex-shrink-0">
              {t("home.tracking")} <ChevronRight size={14} />
            </div>
          </button>
        </div>
      )}

      {showNotifications && (
        <NotificationPanel notifications={notifications} onClose={() => setShowNotifications(false)} />
      )}

      {showTracking && activeDelivery && (
        <div className="fixed inset-0 z-[60] flex items-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTracking(false)} />
          <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold">{t("home.journey", { id: activeDelivery.id })}</h3>
              <button onClick={() => setShowTracking(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{activeDelivery.address}</p>
            <DeliveryStatusCard
              createdAt={activeDelivery.createdAt}
              estimatedMinutes={activeDelivery.estimatedMinutes}
              storeLat={activeDelivery.storeLat}
              storeLng={activeDelivery.storeLng}
              deliveryLat={activeDelivery.deliveryLat}
              deliveryLng={activeDelivery.deliveryLng}
            />
          </div>
        </div>
      )}
    </div>
  );
}
