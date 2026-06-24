"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Trophy, RefreshCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

const ROUND_SECONDS = 60;
const GOOD_EMOJI = ["🥦", "🥕", "🍅", "🌽", "🥑", "🍄", "🥒", "🍆"];
const BAD_EMOJI = ["🍔", "🍗", "🍤", "🥓", "🌭"];
const GOOD_POINTS = 10;
const BAD_POINTS = -15;

interface FallingItem {
  id: number;
  emoji: string;
  bad: boolean;
  left: number;
  duration: number;
}

interface FloatText {
  id: number;
  left: number;
  top: number;
  text: string;
  bad: boolean;
}

export default function VeggieCatchGame({ onPointsAwarded }: { onPointsAwarded?: (points: number) => void }) {
  const [phase, setPhase] = useState<"idle" | "playing" | "result">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [playsLeft, setPlaysLeft] = useState(5);
  const [loaded, setLoaded] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const itemId = useRef(0);
  const floatId = useRef(0);
  const scoreRef = useRef(0);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.rpc("get_veggie_catch_plays_left").then(({ data }) => {
      if (typeof data === "number") setPlaysLeft(data);
      setLoaded(true);
    });
  }, []);

  useEffect(() => () => {
    if (spawnTimer.current) clearInterval(spawnTimer.current);
    if (tickTimer.current) clearInterval(tickTimer.current);
  }, []);

  const spawnItem = () => {
    const bad = Math.random() < 0.22;
    const emoji = bad
      ? BAD_EMOJI[Math.floor(Math.random() * BAD_EMOJI.length)]
      : GOOD_EMOJI[Math.floor(Math.random() * GOOD_EMOJI.length)];
    const id = itemId.current++;
    const left = 8 + Math.random() * 80;
    const duration = 2.6 - Math.random() * 1.1;
    setItems((prev) => [...prev, { id, emoji, bad, left, duration }]);
  };

  const removeItem = (id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const addFloat = (left: number, top: number, text: string, bad: boolean) => {
    const id = floatId.current++;
    setFloats((prev) => [...prev, { id, left, top, text, bad }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 700);
  };

  const catchItem = (item: FallingItem, e: React.MouseEvent | React.TouchEvent) => {
    removeItem(item.id);
    const delta = item.bad ? BAD_POINTS : GOOD_POINTS;
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScore(scoreRef.current);
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const parentRect = target.closest(".veggie-game-area")?.getBoundingClientRect();
    if (parentRect) {
      const left = ((rect.left + rect.width / 2 - parentRect.left) / parentRect.width) * 100;
      const top = ((rect.top - parentRect.top) / parentRect.height) * 100;
      addFloat(left, top, delta > 0 ? `+${delta}` : `${delta}`, item.bad);
    }
  };

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    setItems([]);
    setFloats([]);
    setPhase("playing");

    spawnTimer.current = setInterval(spawnItem, 550);
    tickTimer.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (spawnTimer.current) clearInterval(spawnTimer.current);
          if (tickTimer.current) clearInterval(tickTimer.current);
          endGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const endGame = () => {
    setItems([]);
    setPhase("result");
    setSubmitting(true);
    const supabase = createClient();
    supabase.rpc("submit_veggie_catch_score", { p_score: scoreRef.current }).then(({ data, error }) => {
      setSubmitting(false);
      if (error) return;
      const result = Array.isArray(data) ? data[0] : data;
      setPointsAwarded(result.points_awarded);
      setPlaysLeft(result.plays_left);
      onPointsAwarded?.(result.points_awarded);
    });
  };

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
        <p className="font-bold text-gray-800">Bắt rau củ chay</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Chạm vào rau củ 🥦🥕🍅 đang rơi để ăn điểm, tránh chạm nhầm đồ mặn 🍔🍗🍤 — kẻo bị trừ điểm!
          Mỗi ngày chơi tối đa 5 lượt, mỗi lượt 60 giây.
        </p>
      </div>

      <div className="card p-4 relative overflow-hidden veggie-game-area h-[440px]">
        {phase === "playing" && (
          <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between text-sm font-bold">
            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary-700 shadow">
              ⭐ {score}
            </span>
            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-gray-700 shadow">
              ⏱ {timeLeft}s
            </span>
          </div>
        )}

        {phase === "playing" &&
          items.map((item) => (
            <button
              key={item.id}
              onClick={(e) => catchItem(item, e)}
              onTouchStart={(e) => catchItem(item, e)}
              className="absolute text-4xl fall-down select-none"
              style={{ left: `${item.left}%`, animationDuration: `${item.duration}s` }}
              onAnimationEnd={() => removeItem(item.id)}
              aria-label={item.bad ? "đồ mặn" : "rau củ"}
            >
              {item.emoji}
            </button>
          ))}

        {floats.map((f) => (
          <span
            key={f.id}
            className={clsx(
              "absolute text-sm font-extrabold pointer-events-none float-up-fade z-30",
              f.bad ? "text-red-500" : "text-primary-600"
            )}
            style={{ left: `${f.left}%`, top: `${f.top}%` }}
          >
            {f.text}
          </span>
        ))}

        {phase === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-gradient-to-b from-primary-50 to-white">
            <div className="text-6xl">🥦🍅🥕</div>
            {playsLeft > 0 ? (
              <button onClick={startGame} className="btn-primary px-8 py-3 text-base font-bold flex items-center gap-2">
                <Play size={18} /> Bắt đầu chơi
              </button>
            ) : (
              <p className="text-sm text-gray-500 font-semibold">Hết lượt chơi hôm nay rồi!</p>
            )}
            <p className="text-xs text-gray-400">Còn {playsLeft} lượt chơi hôm nay</p>
          </div>
        )}

        {phase === "result" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-primary-50 to-white text-center px-6">
            {submitting ? (
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trophy size={44} className="text-amber-400" />
                <p className="text-3xl font-black text-gray-800">{score} điểm</p>
                <p className="text-sm text-primary-600 font-bold">+{pointsAwarded} điểm thưởng đã cộng!</p>
                {playsLeft > 0 ? (
                  <button onClick={startGame} className="btn-primary px-6 py-2.5 text-sm font-bold flex items-center gap-2 mt-2">
                    <RefreshCcw size={15} /> Chơi lại ({playsLeft} lượt)
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">Hết lượt chơi hôm nay, mai quay lại nhé!</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
