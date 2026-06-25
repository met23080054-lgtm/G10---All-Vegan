"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Trophy, RefreshCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/context/LanguageContext";
import clsx from "clsx";

const ROUND_SECONDS = 60;
const GOOD_EMOJI = ["🥦", "🥕", "🍅", "🌽", "🥑", "🍄", "🥒", "🍆"];
const BAD_EMOJI = ["🍔", "🍗", "🍤", "🥓", "🌭"];
const GOOD_POINTS = 10;
const BAD_POINTS = -15;

// Toạ độ tính theo px, khớp với chiều cao h-[440px] của khu vực chơi.
const FALL_FROM = -40;
const FALL_TO = 480;
const BASKET_Y = 400;
const CATCH_WINDOW = 70;
const BASKET_HALF_WIDTH = 36;

// Difficulty thresholds (seconds elapsed)
const SPEED_FAST_AT = 20;   // after 20s elapsed → level 2
const SPEED_HIGH_AT = 40;   // after 40s elapsed → level 3
const SPEED_MULT_FAST = 1.35;
const SPEED_MULT_HIGH = 1.7;

interface FallingItem {
  id: number;
  emoji: string;
  bad: boolean;
  leftPercent: number;
  duration: number; // ms
  startTime: number;
  resolved: boolean;
}

interface FloatText {
  id: number;
  left: number; // percent
  top: number; // percent
  text: string;
  bad: boolean;
}

export default function VeggieCatchGame({ onPointsAwarded }: { onPointsAwarded?: (points: number) => void }) {
  const { t } = useLang();
  const [phase, setPhase] = useState<"idle" | "playing" | "result">("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [renderItems, setRenderItems] = useState<FallingItem[]>([]);
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [playsLeft, setPlaysLeft] = useState(5);
  const [loaded, setLoaded] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Vị trí rơi của từng món được cập nhật trực tiếp lên DOM (transform) mỗi
  // khung hình qua rAF, không qua setState — tránh React re-render 60 lần/giây.
  const itemsRef = useRef<FallingItem[]>([]);
  const itemElRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const itemId = useRef(0);
  const floatId = useRef(0);
  const scoreRef = useRef(0);
  const spawnTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const areaRef = useRef<HTMLDivElement>(null);
  const basketRef = useRef<HTMLDivElement>(null);
  const basketOffsetRef = useRef(0);
  const containerWidthRef = useRef(300);
  const draggingRef = useRef(false);
  // Kept in sync with timeLeft state so spawnItem can read without stale closures
  const timeLeftRef = useRef(ROUND_SECONDS);

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
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const syncRender = () => setRenderItems([...itemsRef.current]);

  const spawnItem = () => {
    const bad = Math.random() < 0.22;
    const emoji = bad
      ? BAD_EMOJI[Math.floor(Math.random() * BAD_EMOJI.length)]
      : GOOD_EMOJI[Math.floor(Math.random() * GOOD_EMOJI.length)];
    const id = itemId.current++;
    const leftPercent = 10 + Math.random() * 80;
    const elapsed = ROUND_SECONDS - timeLeftRef.current;
    const speedMult = elapsed >= SPEED_HIGH_AT ? SPEED_MULT_HIGH : elapsed >= SPEED_FAST_AT ? SPEED_MULT_FAST : 1.0;
    const duration = (2600 - Math.random() * 1100) / speedMult;
    itemsRef.current.push({ id, emoji, bad, leftPercent, duration, startTime: performance.now(), resolved: false });
    syncRender();
  };

  const addFloat = (leftPercent: number, topPercent: number, text: string, bad: boolean) => {
    const id = floatId.current++;
    setFloats((prev) => [...prev, { id, left: leftPercent, top: topPercent, text, bad }]);
    setTimeout(() => setFloats((prev) => prev.filter((f) => f.id !== id)), 700);
  };

  const resolveItem = (item: FallingItem, caught: boolean) => {
    item.resolved = true;
    itemsRef.current = itemsRef.current.filter((i) => i.id !== item.id);
    syncRender();
    if (!caught) return;
    const delta = item.bad ? BAD_POINTS : GOOD_POINTS;
    scoreRef.current = Math.max(0, scoreRef.current + delta);
    setScore(scoreRef.current);
    addFloat(item.leftPercent, 84, delta > 0 ? `+${delta}` : `${delta}`, item.bad);
  };

  const gameLoop = () => {
    const now = performance.now();
    const basketCenterPx = containerWidthRef.current / 2 + basketOffsetRef.current;
    for (const item of itemsRef.current) {
      if (item.resolved) continue;
      const elapsed = now - item.startTime;
      const progress = Math.min(1.05, elapsed / item.duration);
      const y = FALL_FROM + progress * (FALL_TO - FALL_FROM);
      const el = itemElRefs.current.get(item.id);
      if (el) el.style.transform = `translate(-50%, ${y}px)`;

      if (y >= BASKET_Y - CATCH_WINDOW / 2 && y <= BASKET_Y + CATCH_WINDOW / 2) {
        const itemPx = (item.leftPercent / 100) * containerWidthRef.current;
        if (Math.abs(itemPx - basketCenterPx) <= BASKET_HALF_WIDTH) {
          resolveItem(item, true);
          continue;
        }
      }
      if (y >= FALL_TO) {
        resolveItem(item, false);
      }
    }
    rafRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    scoreRef.current = 0;
    setScore(0);
    setTimeLeft(ROUND_SECONDS);
    timeLeftRef.current = ROUND_SECONDS;
    itemsRef.current = [];
    setRenderItems([]);
    setFloats([]);
    basketOffsetRef.current = 0;
    if (areaRef.current) containerWidthRef.current = areaRef.current.clientWidth;
    if (basketRef.current) basketRef.current.style.transform = "translate(-50%, 0)";
    setPhase("playing");

    spawnTimer.current = setInterval(spawnItem, 550);
    tickTimer.current = setInterval(() => {
      setTimeLeft((t) => {
        const newT = t - 1;
        timeLeftRef.current = newT;
        if (newT <= 0) {
          if (spawnTimer.current) clearInterval(spawnTimer.current);
          if (tickTimer.current) clearInterval(tickTimer.current);
          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          endGame();
          return 0;
        }
        return newT;
      });
    }, 1000);
    rafRef.current = requestAnimationFrame(gameLoop);
  };

  const endGame = () => {
    itemsRef.current = [];
    setRenderItems([]);
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

  const moveBasketTo = (clientX: number) => {
    if (!areaRef.current || !basketRef.current) return;
    const rect = areaRef.current.getBoundingClientRect();
    containerWidthRef.current = rect.width;
    const x = Math.min(rect.width - BASKET_HALF_WIDTH, Math.max(BASKET_HALF_WIDTH, clientX - rect.left));
    const offset = x - rect.width / 2;
    basketOffsetRef.current = offset;
    basketRef.current.style.transform = `translate(calc(-50% + ${offset}px), 0)`;
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (phase !== "playing") return;
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    moveBasketTo(e.clientX);
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    moveBasketTo(e.clientX);
  };
  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const elapsed = ROUND_SECONDS - timeLeft;
  const speedLevel = elapsed >= SPEED_HIGH_AT ? 3 : elapsed >= SPEED_FAST_AT ? 2 : 1;

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
        <p className="font-bold text-gray-800">{t("game.catchVeggies")}</p>
        <p className="text-xs text-gray-400 mt-0.5">{t("game.instructions")}</p>
      </div>

      <div
        ref={areaRef}
        className="card p-4 relative overflow-hidden veggie-game-area h-[440px] touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {phase === "playing" && (
          <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between text-sm font-bold pointer-events-none">
            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-primary-700 shadow">
              ⭐ {score}
            </span>
            <span
              className={clsx(
                "backdrop-blur px-3 py-1 rounded-full shadow text-xs font-bold",
                speedLevel === 3
                  ? "bg-red-100/90 text-red-600"
                  : speedLevel === 2
                  ? "bg-orange-100/90 text-orange-600"
                  : "bg-white/90 text-gray-700"
              )}
            >
              {t(`game.speed.${speedLevel}`)}
            </span>
            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-gray-700 shadow">
              ⏱ {timeLeft}s
            </span>
          </div>
        )}

        {phase === "playing" &&
          renderItems.map((item) => (
            <div
              key={item.id}
              ref={(el) => {
                if (el) itemElRefs.current.set(item.id, el);
                else itemElRefs.current.delete(item.id);
              }}
              className="absolute top-0 text-4xl select-none pointer-events-none"
              style={{ left: `${item.leftPercent}%`, transform: `translate(-50%, ${FALL_FROM}px)` }}
              aria-hidden
            >
              {item.emoji}
            </div>
          ))}

        {phase === "playing" && (
          <div
            ref={basketRef}
            className="absolute text-5xl select-none pointer-events-none"
            style={{ left: "50%", bottom: 8, transform: "translate(-50%, 0)" }}
            aria-hidden
          >
            🧺
          </div>
        )}

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
            <div className="text-6xl">🧺</div>
            {playsLeft > 0 ? (
              <button onClick={startGame} className="btn-primary px-8 py-3 text-base font-bold flex items-center gap-2">
                <Play size={18} /> {t("game.play")}
              </button>
            ) : (
              <p className="text-sm text-gray-500 font-semibold">{t("game.noPlaysLeft")}</p>
            )}
            <p className="text-xs text-gray-400">{t("game.playsLeftToday", { n: playsLeft })}</p>
          </div>
        )}

        {phase === "result" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-b from-primary-50 to-white text-center px-6">
            {submitting ? (
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Trophy size={44} className="text-amber-400" />
                <p className="text-3xl font-black text-gray-800">{score} {t("common.points")}</p>
                <p className="text-sm text-primary-600 font-bold">{t("game.bonusEarned", { n: pointsAwarded })}</p>
                {playsLeft > 0 ? (
                  <button onClick={startGame} className="btn-primary px-6 py-2.5 text-sm font-bold flex items-center gap-2 mt-2">
                    <RefreshCcw size={15} /> {t("game.playAgain", { n: playsLeft })}
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 mt-2">{t("game.comeBackTomorrow")}</p>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
