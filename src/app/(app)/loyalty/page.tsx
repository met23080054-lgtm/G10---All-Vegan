"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, Star, Gift, Copy, CheckCircle,
  Trophy, Zap, Crown, Shield, Lock, Leaf, Calendar, Percent, X as XIcon
} from "lucide-react";
import { getUser, getVouchers, formatPrice } from "@/lib/store";
import type { User, Voucher } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/context/LanguageContext";
import clsx from "clsx";

const TIERS = [
  {
    id: "bronze", icon: Shield, color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-400",
    min: 0, max: 2999,
    perkKeys: ["tier.bronze.perk1", "tier.bronze.perk2"],
  },
  {
    id: "silver", icon: Star, color: "text-gray-600", bg: "bg-gray-100", border: "border-gray-400",
    min: 3000, max: 9999,
    perkKeys: ["tier.silver.perk1", "tier.silver.perk2", "tier.silver.perk3"],
  },
  {
    id: "gold", icon: Trophy, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-400",
    min: 10000, max: 24999,
    perkKeys: ["tier.gold.perk1", "tier.gold.perk2", "tier.gold.perk3"],
  },
  {
    id: "platinum", icon: Crown, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-400",
    min: 25000, max: 99999,
    perkKeys: ["tier.platinum.perk1", "tier.platinum.perk2", "tier.platinum.perk3"],
  },
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
  discount: number;
  discountType: "fixed" | "percent";
  minOrder: number;
  validityDays: number;
}

interface PromoCode {
  code: string;
  name: string;
  discount: number;
  discountType: "fixed" | "percent";
  minOrder: number;
  fixedExpiry: string | null;
}

export default function LoyaltyPage() {
  const router = useRouter();
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "vouchers" | "tiers">("overview");
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "vouchers" || tab === "tiers" || tab === "overview") {
      setActiveTab(tab as "overview" | "vouchers" | "tiers");
    }
  }, []);

  const refresh = () => {
    getUser().then(setUser);
    getVouchers().then(setVouchers);
  };

  useEffect(() => {
    refresh();
    const supabase = createClient();
    supabase
      .from("voucher_templates")
      .select("code, name, discount, discount_type, min_order, points_cost, validity_days, fixed_expiry")
      .eq("active", true)
      .order("points_cost")
      .then(({ data }) => {
        if (!data) return;
        setRewards(data.filter((d) => d.points_cost > 0).map((d) => ({
          code: d.code,
          name: d.name,
          points: d.points_cost,
          discount: d.discount,
          discountType: d.discount_type as "fixed" | "percent",
          minOrder: d.min_order ?? 0,
          validityDays: d.validity_days ?? 30,
        })));
        setPromoCodes(data.filter((d) => d.points_cost === 0).map((d) => ({
          code: d.code,
          name: d.name,
          discount: d.discount,
          discountType: d.discount_type as "fixed" | "percent",
          minOrder: d.min_order ?? 0,
          fixedExpiry: d.fixed_expiry ?? null,
        })));
      });
  }, []);

  const currentTier = TIERS.find((t) => t.id === (user?.tier ?? "bronze")) ?? TIERS[0];
  const TierIcon = currentTier.icon;

  const copyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const redeemReward = async (reward: Reward) => {
    if (!user || user.points < reward.points || redeeming) return;
    setRedeeming(reward.code);
    const supabase = createClient();
    const { error } = await supabase.rpc("redeem_loyalty_reward", { p_reward_code: reward.code });
    setRedeeming(null);
    if (error) {
      alert(error.message || t("loyalty.redeemError"));
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
  const nextTier = TIERS.find((tier) => tier.min > currentTier.min);

  const tierName = t(`tier.${currentTier.id}`);
  const nextTierName = nextTier ? t(`tier.${nextTier.id}`) : null;

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-700 to-primary-500 pt-12 pb-6 px-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">{t("loyalty.title")}</h1>
        </div>

        {/* Points card */}
        <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">{t("loyalty.currentPoints")}</p>
              <div className="flex items-end gap-1">
                <p className="text-5xl font-black">{user.points.toLocaleString("vi-VN")}</p>
                <p className="text-white/70 text-sm mb-1.5">{t("loyalty.points")}</p>
              </div>
            </div>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${currentTier.bg} ${currentTier.border} border-2`}>
              <TierIcon size={28} className={currentTier.color} fill={currentTier.id === "gold" ? "currentColor" : "none"} />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/20">
              🏆 {t("loyalty.memberTier", { tier: tierName })}
            </span>
            {nextTier && nextTierName && (
              <span className="text-xs text-white/70">
                → {nextTier.min - user.points > 0
                  ? t("loyalty.pointsToReach", { n: (nextTier.min - user.points).toLocaleString("vi-VN"), tier: nextTierName })
                  : t("loyalty.qualified", { tier: nextTierName })}
              </span>
            )}
          </div>

          <div className="h-2 bg-white/20 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${progress}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-white/60 mt-1">
            <span>{currentTier.min.toLocaleString()} {t("loyalty.points")}</span>
            <span>{currentTier.max.toLocaleString()} {t("loyalty.points")}</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[
            { label: t("loyalty.orders"), value: user.ordersCount },
            { label: t("loyalty.spent"), value: formatPrice(user.totalSpent).replace("₫", "đ") },
            { label: t("loyalty.voucher"), value: activeVouchers.length },
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
                activeTab === tab ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"
              )}
            >
              {tab === "overview"
                ? t("loyalty.tabRedeem")
                : tab === "vouchers"
                ? t("loyalty.tabVouchers", { n: activeVouchers.length })
                : t("loyalty.tabTiers")}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 py-5">
        {/* Overview - Redeem */}
        {activeTab === "overview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-primary-600" />
              <p className="text-sm text-gray-600">{t("loyalty.pointsRule")}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {rewards.map((reward) => {
                const canRedeem = user.points >= reward.points;
                return (
                  <button
                    key={reward.code}
                    onClick={() => setSelectedReward(reward)}
                    className={clsx("card p-4 flex flex-col items-center gap-2 text-center text-left w-full", !canRedeem && "opacity-60")}
                  >
                    <span className="text-3xl">{REWARD_EMOJIS[reward.code] ?? "🎁"}</span>
                    <p className="text-sm font-semibold text-gray-800">{reward.name}</p>
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-semibold">
                      <Star size={11} fill="currentColor" />
                      {reward.points.toLocaleString()} {t("loyalty.points")}
                    </div>
                    <div className={clsx(
                      "w-full py-1.5 rounded-xl text-xs font-bold",
                      canRedeem ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {canRedeem ? t("loyalty.redeemNow") : (
                        <span className="flex items-center justify-center gap-1">
                          <Lock size={11} /> {t("loyalty.needMore", { n: (reward.points - user.points).toLocaleString() })}
                        </span>
                      )}
                    </div>
                  </button>
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
                <p>{t("loyalty.noVouchers")}</p>
                <p className="text-xs mt-1">{t("loyalty.noVouchersHint")}</p>
              </div>
            )}
            {activeVouchers.map((v) => (
              <button key={v.id} onClick={() => setSelectedVoucher(v)} className="card overflow-visible w-full text-left">
                <div className="flex">
                  <div className="w-2 bg-primary-600 rounded-l-2xl flex-shrink-0" />
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-bold text-gray-800">{v.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {v.minOrder > 0 ? t("loyalty.minOrder", { price: formatPrice(v.minOrder) }) : t("loyalty.noMinOrder")}
                        </p>
                        <p className="text-xs text-gray-400">{t("loyalty.expiry", { date: v.expiry })}</p>
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
                        onClick={() => copyCode(v.id, v.code)}
                        className="flex items-center gap-1.5 bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      >
                        {copiedId === v.id ? <CheckCircle size={13} /> : <Copy size={13} />}
                        {copiedId === v.id ? t("loyalty.copied") : t("loyalty.copy")}
                      </button>
                    </div>
                  </div>
                </div>
              </button>
            ))}

            {usedVouchers.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-2">{t("loyalty.usedSection")}</p>
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
                          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">{t("loyalty.usedLabel")}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {/* Public promo codes */}
            {promoCodes.length > 0 && (
              <>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4">🎟️ Mã khuyến mãi đang có</p>
                <div className="space-y-3">
                  {promoCodes.map((p) => {
                    const discountLabel = p.discountType === "percent" ? `Giảm ${p.discount}%` : `Giảm ${formatPrice(p.discount)}`;
                    return (
                      <div key={p.code} className="card overflow-hidden">
                        <div className="flex">
                          <div className="w-2 bg-amber-500 rounded-l-2xl flex-shrink-0" />
                          <div className="flex-1 p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0 pr-2">
                                <p className="font-bold text-gray-800">{p.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {p.minOrder > 0 ? `Đơn tối thiểu ${formatPrice(p.minOrder)}` : "Không yêu cầu đơn tối thiểu"}
                                </p>
                                {p.fixedExpiry && (
                                  <p className="text-xs text-red-400 mt-0.5">Hết hạn {p.fixedExpiry}</p>
                                )}
                              </div>
                              <p className="text-lg font-black text-amber-600 flex-shrink-0">{discountLabel}</p>
                            </div>
                            <div className="flex items-center gap-2 pt-2 border-t border-dashed border-gray-200">
                              <code className="flex-1 bg-[#FBF7F2] rounded-lg px-3 py-1.5 text-sm font-mono font-bold text-gray-700 tracking-wider">
                                {p.code}
                              </code>
                              <button
                                onClick={() => { navigator.clipboard.writeText(p.code).catch(() => {}); setCopiedId(p.code); setTimeout(() => setCopiedId(null), 2000); }}
                                className="flex items-center gap-1.5 bg-amber-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                              >
                                {copiedId === p.code ? <CheckCircle size={13} /> : <Copy size={13} />}
                                {copiedId === p.code ? "Đã sao chép" : "Sao chép"}
                              </button>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                              📋 Áp dụng khi đặt giao hàng hoặc tại quán. Một lần sử dụng/đơn. Không kết hợp ưu đãi.
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
              const label = t(`tier.${tier.id}`);
              return (
                <div key={tier.id} className={clsx("card p-4", isActive && "ring-2 ring-primary-500")}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center border-2", tier.bg, tier.border)}>
                      <Icon size={22} className={tier.color} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`font-bold text-base ${tier.color}`}>{label}</p>
                        {isActive && (
                          <span className="text-[10px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold">
                            {t("loyalty.currentTierBadge")}
                          </span>
                        )}
                        {!isAchieved && <Lock size={12} className="text-gray-400" />}
                      </div>
                      <p className="text-xs text-gray-400">
                        {tier.min.toLocaleString()} – {tier.max < 99999 ? tier.max.toLocaleString() : "∞"} {t("loyalty.points")}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {tier.perkKeys.map((key) => (
                      <div key={key} className="flex items-center gap-2 text-xs text-gray-600">
                        <Leaf size={12} className="text-primary-500 flex-shrink-0" />
                        {t(key)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reward detail modal ── */}
      {selectedReward && (
        <div className="fixed inset-0 z-[70] flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedReward(null)} />
          <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-t-3xl overflow-hidden">
            {/* Title bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="w-7" />
              <h3 className="text-base font-bold text-gray-800">Chi tiết phần thưởng</h3>
              <button onClick={() => setSelectedReward(null)} className="w-7 h-7 flex items-center justify-center text-gray-400">
                <XIcon size={20} />
              </button>
            </div>
            <div className="px-6 pt-5 pb-5">
            <div className="flex flex-col items-center gap-1 mb-5">
              <span className="text-5xl mb-1">{REWARD_EMOJIS[selectedReward.code] ?? "🎁"}</span>
              <h3 className="text-lg font-extrabold text-gray-800 text-center">{selectedReward.name}</h3>
              <p className="text-2xl font-black text-primary-600">
                {selectedReward.discountType === "percent" ? `${selectedReward.discount}%` : formatPrice(selectedReward.discount)}
              </p>
            </div>

            {/* Points summary row */}
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Điểm cần</p>
                <p className="text-base font-black text-amber-600">{selectedReward.points.toLocaleString()}</p>
              </div>
              <div className="w-px h-8 bg-amber-200" />
              <div className="text-center flex-1">
                <p className="text-xs text-gray-500 mb-0.5">Điểm hiện có</p>
                <p className={clsx("text-base font-black", user.points >= selectedReward.points ? "text-primary-600" : "text-red-500")}>
                  {user.points.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Terms */}
            <div className="mb-5">
              <p className="font-bold text-gray-800 mb-3">Điều khoản sử dụng</p>
              <ul className="space-y-2.5">
                {[
                  `Đổi ${selectedReward.points.toLocaleString()} điểm tích lũy để nhận voucher`,
                  selectedReward.minOrder > 0
                    ? `Đơn hàng tối thiểu ${formatPrice(selectedReward.minOrder)} khi dùng voucher`
                    : "Không yêu cầu giá trị đơn tối thiểu",
                  `Voucher có hiệu lực ${selectedReward.validityDays} ngày kể từ ngày đổi`,
                  "Áp dụng cho đơn giao hàng và đặt món tại quán",
                  "Mỗi voucher chỉ dùng được một lần duy nhất",
                  "Không kết hợp với các chương trình khuyến mãi khác",
                ].map((term, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                    {term}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => {
                setSelectedReward(null);
                if (user.points >= selectedReward.points) redeemReward(selectedReward);
              }}
              disabled={user.points < selectedReward.points || redeeming === selectedReward.code}
              className={clsx(
                "w-full py-4 rounded-2xl font-bold text-base transition-all pb-safe-6",
                user.points >= selectedReward.points
                  ? "bg-primary-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              {redeeming === selectedReward.code ? "Đang đổi..." : user.points >= selectedReward.points
                ? `Đổi ngay — ${selectedReward.points.toLocaleString()} điểm`
                : `Cần thêm ${(selectedReward.points - user.points).toLocaleString()} điểm`}
            </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Voucher detail modal ── */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-[70] flex items-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSelectedVoucher(null)} />
          <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-t-3xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Title bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="w-7" />
              <h3 className="text-base font-bold text-gray-800">Chi tiết quà tặng</h3>
              <button onClick={() => setSelectedVoucher(null)} className="w-7 h-7 flex items-center justify-center text-gray-400">
                <XIcon size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {/* Header info */}
              <div className="px-5 pt-5 pb-4">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Percent size={20} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-base leading-snug">{selectedVoucher.code}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{selectedVoucher.name}</p>
                  </div>
                </div>

                {/* Expiry */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Calendar size={15} className="text-gray-400 flex-shrink-0" />
                  <span>Sử dụng đến <strong className="text-gray-700">{selectedVoucher.expiry}</strong></span>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 px-3 py-1 rounded-full">
                    {selectedVoucher.type === "percent" ? `Giảm ${selectedVoucher.discount}%` : `Giảm ${formatPrice(selectedVoucher.discount)}`}
                  </span>
                  {selectedVoucher.minOrder > 0 && (
                    <span className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full">
                      Đơn từ {formatPrice(selectedVoucher.minOrder)}
                    </span>
                  )}
                  <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
                    Dùng tại quán & giao hàng
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="h-2 bg-gray-50" />

              {/* Terms */}
              <div className="px-5 py-5">
                <p className="font-bold text-gray-800 mb-3">Điều khoản sử dụng</p>
                <ul className="space-y-2.5">
                  {[
                    `Mức giảm: ${selectedVoucher.type === "percent" ? `${selectedVoucher.discount}% tổng đơn hàng` : formatPrice(selectedVoucher.discount) + " trên tổng đơn"}`,
                    selectedVoucher.minOrder > 0
                      ? `Đơn hàng tối thiểu ${formatPrice(selectedVoucher.minOrder)} mới được áp dụng`
                      : "Không yêu cầu giá trị đơn tối thiểu",
                    "Voucher chỉ dùng được một lần duy nhất",
                    "Áp dụng cho đơn giao hàng và đặt món tại quán",
                    "Không kết hợp với các chương trình khuyến mãi khác",
                    `Voucher hết hạn vào ngày ${selectedVoucher.expiry}`,
                  ].map((term, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                      {term}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Code copy */}
              <div className="px-5 pb-5">
                <div className="flex items-center gap-2 bg-[#FBF7F2] border border-dashed border-gray-300 rounded-xl px-4 py-3">
                  <code className="flex-1 text-sm font-mono font-bold text-gray-800 tracking-widest">{selectedVoucher.code}</code>
                  <button
                    onClick={() => copyCode(selectedVoucher.id, selectedVoucher.code)}
                    className="flex items-center gap-1.5 bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex-shrink-0"
                  >
                    {copiedId === selectedVoucher.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                    {copiedId === selectedVoucher.id ? "Đã sao chép" : "Sao chép"}
                  </button>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="px-5 pt-3 pb-safe-6 border-t border-gray-100 flex-shrink-0">
              <Link
                href="/delivery"
                onClick={() => setSelectedVoucher(null)}
                className="flex items-center justify-center w-full py-4 bg-primary-700 text-white rounded-2xl font-bold text-base"
              >
                Đặt hàng ngay
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Redeem success toast */}
      {redeemSuccess && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl px-5 py-4 w-80 flex items-center gap-3 border border-primary-100">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            <CheckCircle size={20} className="text-primary-600" />
          </div>
          <div>
            <p className="font-bold text-gray-800">{t("loyalty.redeemSuccess")}</p>
            <p className="text-xs text-gray-500">{t("loyalty.voucherInBag", { name: redeemSuccess })}</p>
          </div>
        </div>
      )}
    </div>
  );
}
