"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Star, Package, Truck, User } from "lucide-react";
import { getUser, getTierInfo } from "@/lib/store";
import type { User as UserType } from "@/lib/store";
import { useLang } from "@/context/LanguageContext";

export default function MorePage() {
  const router = useRouter();
  const { t } = useLang();
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    getUser().then(setUser);
  }, []);

  if (!user) return null;
  const tierInfo = getTierInfo(user.tier);

  const menuItems = [
    { href: "/profile/orders", icon: Package, label: t("profile.orderHistory"), description: t("profile.orderHistoryDesc") },
    { href: "/delivery/history", icon: Truck, label: t("profile.deliveryHistory"), description: t("profile.deliveryHistoryDesc") },
    { href: "/profile/account", icon: User, label: t("profile.account"), description: t("profile.accountDesc") },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 pt-12 pb-6 px-4">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">{t("profile.more")}</h1>
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
              {t("common.member")} {t(`tier.${user.tier}`)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { label: t("profile.loyaltyPoints"), value: user.points.toLocaleString("vi-VN") + " đ" },
            { label: t("common.orders"), value: user.ordersCount },
            { label: t("profile.totalSpent"), value: (user.totalSpent / 1000000).toFixed(1) + "M" },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/10 rounded-xl p-3 text-center text-white">
              <p className="font-bold text-base">{value}</p>
              <p className="text-xs text-white/60 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="card divide-y divide-gray-100">
          {menuItems.map(({ href, icon: Icon, label, description }) => (
            <Link key={href} href={href} className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 bg-primary-50 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-800 text-sm">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
