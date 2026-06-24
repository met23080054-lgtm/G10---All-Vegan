"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Star, Gift, Copy, CheckCircle,
  Trophy, Zap, Crown, Shield, Lock, Leaf
} from "lucide-react";
import { getUser, getVouchers, getTierInfo, formatPrice } from "@/lib/store";
import type { User, Voucher } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const TIERS = [
  { id: "bronze", label: "Đồng", icon: Shield, color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-400", min: 0, max: 999, perks: ["Tích 1 điểm/1.000đ", "Voucher sinh nhật"] },
  { id: "silver", label: "Bạc", icon: Star, color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-400", min: 1000, max: 2999, perks: ["Tích 1,5 điểm/1.000đ", "Giảm 15% mỗi tháng", "Voucher sinh nhật kép"] },
  { id: "gold", label: "Vàng", icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-400", min: 3000, max: 5999, perks: ["Tích 2 điểm/1.000đ", "Ưu tiên đặt bàn", "Free ship không giới hạn"] },
  { id: "platinum", label: "Bạch Kim", icon: Crown, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-400", min: 6000, max: 99999, perks: ["Tích 3 điểm/1.000đ", "Phục vụ VIP", "Món mới ưu tiên thử"] },
];

const REWARD_EMOJIS: Record<string, string> = {
  REWARD30K: "🎫",
  REWARD50K: "🎟️",
  REWARDTEA: "🍵",
  REWARDSHIP: "🛵",
  REWARD15PCT: "💯",
  REWARDCOMBO: "🎁",
};

interface Reward {
  code: string;
  name: string;
  points: number;
}

export default function LoyaltyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "vouchers" | "tiers">("overview");
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const refresh = () => {
    getUser().then(setUser);
    getVouchers().then(setVouchers);
  };

  useEffect(() => {
    refresh();
    const supabase = createClient();
    supabase
      .from("voucher_templates")
      .select("code, name, points_cost")
      .gt("points_cost", 0)
      .order("points_cost")
      .then(({ data }) => {
        if (data) setRewards(data.map((d) => ({ code: d.code, name: d.name, points: d.points_cost })));
      });
  }, []);

  const tierInfo = user ? getTierInfo(user.tier) : null;
  const currentTier = TIERS.find((t) => t.id === (user?.tier ?? "bronze")) ?? TIERS[0];
  const TierIcon = currentTier.icon;

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const redeemReward = async (reward: Reward) => {
    if (!user || user.points < reward.points || redeeming) return;
    setRedeeming(reward.code);
    const supabase = createClient();
    const { error } = await supabase.rpc("redeem_loyalty_reward", { p_reward_code: reward.code });
    setRedeeming(null);
    if (error) {
      alert(error.message || "Không thể đổi quà, vui lòng thử lại.");
      return;
    }
    refresh();
    setRedeemSuccess(reward.name);
    setTimeout(() => setRedeemSuccess(null), 3000);
  };

  const activeVouchers = vouchers.filter((v) => !v.used);
  const usedVouchers = vouchers.filter((v) => v.used);

  if (!user) return null;

  const progress = Math.min(100, ((user.points - currentTier.min) / (currentTier.max - currentTier.min)) * 100);
  const nextTier = TIERS.find((t) => t.min > currentTier.min);

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-12 pb-6 px-4">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">Điểm thưởng & Ưu đãi</h1>
        </div>

        {/* Points card */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Số điểm hiện có</p>
              <div className="flex items-end gap-1">
                <p className="text-5xl font-black">{user.points.toLocaleString("vi-VN")}</p>
                <p className="text-white/70 text-sm mb-1.5">điểm</p>
              </div>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentTier.bg} ${currentTier.border} border-2`}>
              <TierIcon size={28} className={currentTier.color} fill={currentTier.id === "gold" ? "currentColor" : "none"} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20`}>
              🏆 Thành viên {currentTier.label}
            </span>
            {nextTier && (
              <span className="text-xs text-white/70">
                → {nextTier.max - user.points + 1 > 0 ? `Còn ${(nextTier.min - user.points).toLocaleString("vi-VN")} điểm lên ${nextTier.label}` : `Đủ điều kiện ${nextTier.label}`}
              </span>
            )}
          </div>

          <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-3">
            <div
              className="h-full bg-white rounded-full transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/60 mt-1">
            <span>{currentTier.min.toLocaleString()} điểm</span>
            <span>{currentTier.max.toLocaleString()} điểm</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: "Đơn hàng", value: user.ordersCount },
            { label: "Đã chi", value: formatPrice(user.totalSpent).replace("₫", "đ") },
            { label: "Voucher", value: activeVouchers.length },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center text-white">
              <p className="font-bold text-base">{value}</p>
              <p className="text-xs text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="flex">
          {(["overview", "vouchers", "tiers"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "flex-1 py-3 text-sm font-semibold transition-all border-b-2",
                activeTab === tab
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500"
              )}
            >
              {tab === "overview" ? "Đổi quà" : tab === "vouchers" ? `Voucher (${activeVouchers.length})` : "Hạng thành viên"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-4">
        {/* Overview - Redeem */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary-600" />
              <p className="text-sm text-gray-600">1 điểm = 1.000đ chi tiêu · Tích điểm từng đơn</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rewards.map((reward) => {
                const canRedeem = user.points >= reward.points;
                return (
                  <div key={reward.code} className={clsx("card p-4 flex flex-col items-center gap-2 text-center", !canRedeem && "opacity-60")}>
                    <span className="text-3xl">{REWARD_EMOJIS[reward.code] ?? "🎁"}</span>
                    <p className="text-sm font-semibold text-gray-800">{reward.name}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                      <Star size={11} fill="currentColor" />
                      {reward.points.toLocaleString()} điểm
                    </div>
                    <button
                      onClick={() => canRedeem && redeemReward(reward)}
                      disabled={redeeming === reward.code}
                      className={clsx(
                        "w-full py-2 rounded-xl text-xs font-bold transition-all",
                        canRedeem
                          ? "bg-primary-600 text-white"
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {redeeming === reward.code ? "Đang đổi..." : canRedeem ? "Đổi ngay" : (
                        <span className="flex items-center justify-center gap-1">
                          <Lock size={11} /> Thiếu {(reward.points - user.points).toLocaleString()} điểm
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Vouchers */}
        {activeTab === "vouchers" && (
          <div className="space-y-4">
            {activeVouchers.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Gift size={40} className="mx-auto mb-3 opacity-30" />
                <p>Chưa có voucher nào</p>
                <p className="text-xs mt-1">Tích điểm và đổi quà ở tab "Đổi quà"</p>
              </div>
            )}
            {activeVouchers.map((v) => (
              <div key={v.id} className="card overflow-visible">
                <div className="flex">
                  <div className="w-2 bg-primary-600 rounded-l-2xl flex-shrink-0" />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{v.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          Đơn tối thiểu {v.minOrder > 0 ? formatPrice(v.minOrder) : "không giới hạn"}
                        </p>
                        <p className="text-xs text-gray-400">HSD: {v.expiry}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-primary-600">
                          {v.type === "percent" ? `${v.discount}%` : formatPrice(v.discount)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-dashed border-gray-200">
                      <code className="flex-1 bg-[#FBF7F2] rounded-lg px-3 py-1.5 text-sm font-mono text-gray-700">
                        {v.code}
                      </code>
                      <button
                        onClick={() => copyCode(v.code)}
                        className="flex items-center gap-1.5 bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        {copiedCode === v.code ? <CheckCircle size={13} /> : <Copy size={13} />}
                        {copiedCode === v.code ? "Đã sao" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {usedVouchers.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">Đã dùng</p>
                {usedVouchers.map((v) => (
                  <div key={v.id} className="card opacity-50 overflow-hidden">
                    <div className="flex">
                      <div className="w-2 bg-gray-300 flex-shrink-0" />
                      <div className="flex-1 p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-500 line-through">{v.name}</p>
                            <p className="text-xs text-gray-400">{v.code}</p>
                          </div>
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">Đã dùng</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Tier details */}
        {activeTab === "tiers" && (
          <div className="space-y-3">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const isActive = tier.id === user.tier;
              const isAchieved = user.points >= tier.min;
              return (
                <div key={tier.id} className={clsx("card p-4", isActive && "ring-2 ring-primary-500")}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center border-2", tier.bg, tier.border)}>
                      <Icon size={22} className={tier.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold text-base ${tier.color}`}>{tier.label}</p>
                        {isActive && (
                          <span className="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">Hạng hiện tại</span>
                        )}
                        {!isAchieved && (
                          <Lock size={12} className="text-gray-400" />
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        {tier.min.toLocaleString()} – {tier.max < 99999 ? tier.max.toLocaleString() : "∞"} điểm
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {tier.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2 text-xs text-gray-600">
                        <Leaf size={12} className="text-primary-500 flex-shrink-0" />
                        {perk}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Redeem success toast */}
      {redeemSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl px-5 py-4 w-80 flex items-center gap-3 border border-primary-100">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">Đổi quà thành công!</p>
            <p className="text-xs text-gray-500">Voucher "{redeemSuccess}" đã vào túi bạn</p>
          </div>
        </div>
      )}
    </div>
  );
}
