"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star, Zap, Trophy, RefreshCcw, CheckCircle } from "lucide-react";
import { getUser } from "@/lib/store";
import type { User } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

// Nhãn/màu để vẽ vòng quay — kết quả thật (điểm + giải nào trúng) do server quyết định qua RPC spin_wheel().
const SPIN_PRIZES = [
  { label: "50 điểm", color: "#16a34a" },
  { label: "100 điểm", color: "#22c55e" },
  { label: "200 điểm", color: "#4ade80" },
  { label: "Chúc bạn may mắn", color: "#d1fae5" },
  { label: "30 điểm", color: "#86efac" },
  { label: "500 điểm", color: "#f97316" },
  { label: "150 điểm", color: "#15803d" },
];
const SPIN_PROBABILITIES = [0.25, 0.20, 0.15, 0.15, 0.10, 0.05, 0.10];

const SEGMENT_ANGLE = 360 / SPIN_PRIZES.length;

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  points: number;
}

function SpinWheel({ onSpin }: { onSpin: () => Promise<{ points: number; label: string } | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const animRef = useRef<number | null>(null);

  const drawWheel = (ctx: CanvasRenderingContext2D, rot: number) => {
    const cx = 140, cy = 140, r = 130;
    ctx.clearRect(0, 0, 280, 280);
    SPIN_PRIZES.forEach((prize, i) => {
      const start = ((i * SEGMENT_ANGLE - 90) * Math.PI) / 180 + (rot * Math.PI) / 180;
      const end = start + (SEGMENT_ANGLE * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + (SEGMENT_ANGLE * Math.PI) / 180 / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = prize.label.includes("500") ? "#555" : "#fff";
      ctx.font = `bold ${prize.label.includes("500") ? 13 : 12}px 'Be Vietnam Pro', sans-serif`;
      ctx.fillText(prize.label, r - 12, 5);
      ctx.restore();
    });

    // Center circle
    ctx.beginPath();
    ctx.arc(cx, cy, 24, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#16a34a";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("SPIN", cx, cy);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (ctx) drawWheel(ctx, rotation);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rotation]);

  const spin = async () => {
    if (spinning) return;
    setSpinning(true);

    const result = await onSpin();
    if (!result) {
      setSpinning(false);
      return;
    }

    const prizeIndex = Math.max(0, SPIN_PRIZES.findIndex((p) => p.label === result.label));
    const extraRotations = 5 + Math.floor(Math.random() * 3);
    const targetAngle = -(prizeIndex * SEGMENT_ANGLE) - SEGMENT_ANGLE / 2;
    const totalRotation = rotation + 360 * extraRotations + targetAngle - (rotation % 360);
    const duration = 4000;
    const start = performance.now();
    const startRot = rotation;

    const animate = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const current = startRot + (totalRotation - startRot) * eased;
      setRotation(current);

      if (t < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[20px] border-l-transparent border-r-transparent border-t-red-500" />
        </div>
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-full shadow-2xl cursor-pointer"
          onClick={spin}
        />
      </div>
      <button
        onClick={spin}
        disabled={spinning}
        className={clsx(
          "btn-primary px-8 py-3 text-base font-bold flex items-center gap-2",
          spinning && "opacity-70 cursor-not-allowed"
        )}
      >
        <Zap size={18} />
        {spinning ? "Đang quay..." : "Quay thưởng"}
      </button>
    </div>
  );
}

function QuizGame({ onPointsEarned }: { onPointsEarned: (pts: number) => void }) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [answered, setAnswered] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("quiz_questions_public")
      .select("*")
      .order("id")
      .then(({ data }) => {
        if (data) setQuestions(data as QuizQuestion[]);
      });
  }, []);

  const q = questions[current];

  const handleAnswer = async (idx: number) => {
    if (answered || !q) return;
    setAnswered(true);
    setSelected(idx);

    const supabase = createClient();
    const { data, error } = await supabase.rpc("submit_quiz_answer", {
      p_question_id: q.id,
      p_selected_index: idx,
    });
    if (error) {
      setAnswered(false);
      setSelected(null);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    setCorrectIndex(result.correct_index);
    if (result.correct) {
      setScore((s) => s + result.points_awarded);
      setCorrectCount((c) => c + 1);
    }

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent((c) => c + 1);
        setSelected(null);
        setCorrectIndex(null);
        setAnswered(false);
      } else {
        setFinished(true);
        onPointsEarned(score + (result.correct ? result.points_awarded : 0));
      }
    }, 900);
  };

  const reset = () => {
    setCurrent(0);
    setSelected(null);
    setCorrectIndex(null);
    setScore(0);
    setCorrectCount(0);
    setFinished(false);
    setAnswered(false);
  };

  if (questions.length === 0) {
    return (
      <div className="flex justify-center py-10">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (finished) {
    return (
      <div className="text-center py-8 space-y-4">
        <div className="text-6xl">🎉</div>
        <h3 className="text-2xl font-black text-gray-800">Kết quả</h3>
        <div className="bg-primary-50 rounded-2xl p-6">
          <p className="text-4xl font-black text-primary-600">+{score}</p>
          <p className="text-gray-500 text-sm mt-1">điểm đã được cộng</p>
        </div>
        <p className="text-gray-600 text-sm">Đúng {correctCount}/{questions.length} câu</p>
        <button onClick={reset} className="btn-primary px-8 py-3 flex items-center gap-2 mx-auto">
          <RefreshCcw size={16} /> Chơi lại
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 h-2 rounded-full">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((current) / questions.length) * 100}%` }}
          />
        </div>
        <span className="text-xs text-gray-500 shrink-0">{current + 1}/{questions.length}</span>
      </div>

      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-full">
            +{q.points} điểm
          </span>
        </div>
        <p className="font-bold text-gray-800 text-base">{q.question}</p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {q.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            disabled={answered}
            className={clsx(
              "p-3.5 rounded-xl text-sm font-semibold text-left border-2 transition-all",
              !answered && "border-gray-200 bg-white hover:border-primary-400 hover:bg-primary-50",
              answered && correctIndex === i && "border-primary-600 bg-primary-50 text-primary-700",
              answered && i === selected && i !== correctIndex && "border-red-500 bg-red-50 text-red-700",
              answered && i !== selected && i !== correctIndex && "border-gray-200 bg-gray-50 opacity-60"
            )}
          >
            <span className="font-bold mr-2 text-gray-400">{String.fromCharCode(65 + i)}.</span>
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GamePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeGame, setActiveGame] = useState<"spin" | "quiz">("spin");
  const [toast, setToast] = useState<{ message: string; points: number } | null>(null);
  const [spinsLeft, setSpinsLeft] = useState(3);

  const refreshUser = () => getUser().then(setUser);

  useEffect(() => {
    refreshUser();
    const supabase = createClient();
    supabase.rpc("get_spins_left").then(({ data }) => {
      if (typeof data === "number") setSpinsLeft(data);
    });
  }, []);

  const showToast = (message: string, points: number) => {
    setToast({ message, points });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSpin = async (): Promise<{ points: number; label: string } | null> => {
    const supabase = createClient();
    const { data, error } = await supabase.rpc("spin_wheel");
    if (error) {
      showToast(error.message || "Bạn đã hết lượt quay hôm nay!", 0);
      return null;
    }
    const result = Array.isArray(data) ? data[0] : data;
    setSpinsLeft((prev) => Math.max(0, prev - 1));
    refreshUser();
    showToast(result.label, result.points);
    return result;
  };

  const handleQuizPoints = (pts: number) => {
    refreshUser();
    showToast(`Quiz: +${pts} điểm`, pts);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-12 pb-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1">Trò chơi & Tích điểm</h1>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-bold text-amber-700">{user.points.toLocaleString("vi-VN")}</span>
          </div>
        </div>

        {/* Game selector */}
        <div className="flex gap-3 px-4 pb-4">
          {(["spin", "quiz"] as const).map((g) => (
            <button
              key={g}
              onClick={() => setActiveGame(g)}
              className={clsx(
                "flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all",
                activeGame === g
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-gray-200 text-gray-600"
              )}
            >
              {g === "spin" ? "🎡 Vòng quay may mắn" : "🧠 Hỏi đáp dinh dưỡng"}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5">
        {activeGame === "spin" && (
          <div className="space-y-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-gray-800">Vòng quay hàng ngày</p>
                <div className="flex items-center gap-1.5 text-sm text-primary-600 font-semibold">
                  <Zap size={14} />
                  Còn {spinsLeft} lượt
                </div>
              </div>
              <p className="text-xs text-gray-400">Mỗi ngày tặng miễn phí 3 lượt. Thêm lượt khi đặt món!</p>
            </div>

            {spinsLeft > 0 ? (
              <SpinWheel onSpin={handleSpin} />
            ) : (
              <div className="card p-8 text-center">
                <Trophy size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="font-bold text-gray-600">Hết lượt quay hôm nay!</p>
                <p className="text-sm text-gray-400 mt-1">Đặt đơn để nhận thêm lượt, hoặc quay lại vào ngày mai</p>
                <button onClick={() => router.push("/menu")} className="btn-primary mt-4 px-6">
                  Đặt món ngay
                </button>
              </div>
            )}

            {/* Prize table */}
            <div className="card p-4">
              <p className="font-semibold text-gray-800 mb-3">Bảng giải thưởng</p>
              <div className="space-y-2">
                {SPIN_PRIZES.map((p, i) => (
                  <div key={p.label} className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-sm flex-shrink-0" style={{ background: p.color }} />
                    <span className="text-sm text-gray-700 flex-1">{p.label}</span>
                    <span className="text-xs text-gray-400">{Math.round(SPIN_PROBABILITIES[i] * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeGame === "quiz" && (
          <div className="space-y-4">
            <div className="card p-4">
              <p className="font-bold text-gray-800">Hỏi đáp dinh dưỡng chay</p>
              <p className="text-xs text-gray-400 mt-0.5">Trả lời đúng để nhận điểm thưởng ngay!</p>
            </div>
            <QuizGame onPointsEarned={handleQuizPoints} />
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-white rounded-2xl shadow-xl px-5 py-4 w-80 flex items-center gap-3 border border-primary-100">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
            {toast.points > 0 ? <CheckCircle size={20} className="text-primary-600" /> : <span className="text-lg">😅</span>}
          </div>
          <div>
            <p className="font-bold text-gray-800">{toast.message}</p>
            {toast.points > 0 ? (
              <p className="text-xs text-primary-600 font-semibold">+{toast.points} điểm đã được cộng!</p>
            ) : (
              <p className="text-xs text-gray-400">Chúc bạn may mắn lần sau!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
