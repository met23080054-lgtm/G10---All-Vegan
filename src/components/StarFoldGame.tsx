"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Trophy, Gift } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const DEFAULT_DAILY_LIMIT = 20;
const MILESTONES = [
  { at: 10, label: "Giảm 5.000đ" },
  { at: 20, label: "Giảm 15.000đ" },
];

interface Particle {
  id: number;
  left: number;
}

interface FoldStarResult {
  stars_folded: number;
  points_awarded: number;
  daily_limit: number;
  milestone_voucher_code: string | null;
  milestone_voucher_name: string | null;
}

export default function StarFoldGame({
  onReward,
}: {
  onReward: (message: string, points: number) => void;
}) {
  const [stars, setStars] = useState(0);
  const [dailyLimit, setDailyLimit] = useState(DEFAULT_DAILY_LIMIT);
  const [loaded, setLoaded] = useState(false);
  const [popping, setPopping] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleId = useRef(0);
  const inFlight = useRef(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_stars_folded_today").then(({ data }) => {
      if (typeof data === "number") setStars(data);
      setLoaded(true);
    });
  }, []);

  const handleTap = () => {
    if (stars + inFlight.current >= dailyLimit) return;

    inFlight.current += 1;
    setStars((s) => s + 1);
    setPopping(true);
    setTimeout(() => setPopping(false), 320);

    const id = particleId.current++;
    setParticles((prev) => [...prev, { id, left: 42 + Math.random() * 16 }]);
    setTimeout(() => setParticles((prev) => prev.filter((p) => p.id !== id)), 800);

    const supabase = createClient();
    supabase.rpc("fold_star").then(({ data, error }) => {
      inFlight.current -= 1;
      if (error) {
        setStars((s) => Math.max(0, s - 1));
        return;
      }
      const result = (Array.isArray(data) ? data[0] : data) as FoldStarResult;
      setStars(result.stars_folded);
      setDailyLimit(result.daily_limit);
      if (result.milestone_voucher_code) {
        onReward(
          `🎁 Mốc ${result.stars_folded} sao! Nhận voucher "${result.milestone_voucher_name}"`,
          result.points_awarded
        );
      } else {
        onReward(`+${result.points_awarded} điểm`, result.points_awarded);
      }
    });
  };

  const nextMilestone = MILESTONES.find((m) => m.at > stars);
  const full = stars >= dailyLimit;

  if (!loaded) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="card p-4">
        <p className="font-bold text-gray-800">Gấp sao chờ món</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Lấy cảm hứng từ trò gấp sao khi xếp hàng chờ — mỗi sao gấp được cộng điểm ngay,
          đạt mốc 10 &amp; 20 sao trong ngày được tặng thêm voucher giảm giá dùng nhanh.
        </p>
      </div>

      <div className="card p-6 flex flex-col items-center gap-5">
        <div className="relative">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute -top-2 text-xs font-bold text-amber-500 float-up-fade pointer-events-none"
              style={{ left: `${p.left}%` }}
            >
              +3
            </span>
          ))}
          <button
            onClick={handleTap}
            disabled={full}
            aria-label="Gấp sao"
            className={clsx(
              "w-36 h-36 rounded-full flex items-center justify-center shadow-xl transition-transform",
              full
                ? "bg-gray-100 cursor-not-allowed"
                : "bg-gradient-to-br from-amber-300 to-amber-500 active:scale-95 shadow-amber-400/40",
              popping && "star-pop"
            )}
          >
            <Star
              size={64}
              className={full ? "text-gray-300" : "text-white"}
              fill={full ? "none" : "currentColor"}
            />
          </button>
        </div>

        <button
          onClick={handleTap}
          disabled={full}
          className={clsx(
            "btn-primary px-8 py-3 text-base font-bold",
            full && "opacity-60 cursor-not-allowed"
          )}
        >
          {full ? "Đã gấp đủ hôm nay" : "Chạm để gấp sao"}
        </button>

        <div className="w-full">
          <div className="flex items-center justify-between mb-1.5 text-sm">
            <span className="font-semibold text-gray-700">{stars}/{dailyLimit} sao hôm nay</span>
            {nextMilestone && (
              <span className="text-xs text-amber-600 font-semibold">
                Còn {nextMilestone.at - stars} sao tới {nextMilestone.label}
              </span>
            )}
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${(stars / dailyLimit) * 100}%` }}
            />
            {MILESTONES.map((m) => (
              <div
                key={m.at}
                className="absolute top-0 bottom-0 w-0.5 bg-white/80"
                style={{ left: `${(m.at / dailyLimit) * 100}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {full ? (
        <div className="card p-5 text-center">
          <Trophy size={36} className="mx-auto text-amber-400 mb-2" />
          <p className="font-bold text-gray-700">Hẹn gặp lại vào ngày mai!</p>
          <p className="text-xs text-gray-400 mt-1">Mỗi ngày được gấp tối đa {dailyLimit} sao</p>
        </div>
      ) : (
        <div className="card p-4">
          <p className="font-semibold text-gray-800 mb-3 flex items-center gap-1.5">
            <Gift size={15} className="text-amber-500" /> Mốc thưởng trong ngày
          </p>
          <div className="space-y-2">
            {MILESTONES.map((m) => (
              <div key={m.at} className="flex items-center gap-3">
                <div
                  className={clsx(
                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
                    stars >= m.at ? "bg-amber-500 text-white" : "bg-amber-50 text-amber-600"
                  )}
                >
                  {m.at}
                </div>
                <span className="text-sm text-gray-700 flex-1">{m.label}</span>
                {stars >= m.at && <span className="text-xs text-primary-600 font-semibold">Đã nhận</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
