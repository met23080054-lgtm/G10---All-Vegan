"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Star } from "lucide-react";
import { getUser } from "@/lib/store";
import type { User } from "@/lib/store";
import VeggieCatchGame from "@/components/VeggieCatchGame";
import { useLang } from "@/context/LanguageContext";

export default function GamePage() {
  const router = useRouter();
  const { t } = useLang();
  const [user, setUser] = useState<User | null>(null);

  const refreshUser = () => getUser().then(setUser);

  useEffect(() => {
    refreshUser();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-white shadow-sm">
        <div className="flex items-center gap-3 px-4 pt-12 pb-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1">{t("game.title")}</h1>
          <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5">
            <Star size={14} className="text-amber-500" fill="currentColor" />
            <span className="text-sm font-bold text-amber-700">{user.points.toLocaleString("vi-VN")}</span>
          </div>
        </div>
      </div>

      <div className="px-4 py-5">
        <VeggieCatchGame onPointsAwarded={refreshUser} />
      </div>
    </div>
  );
}
