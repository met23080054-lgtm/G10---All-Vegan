"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import { Leaf } from "lucide-react";

function SessionBridge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [failed, setFailed] = useState(false);
  const tried = useRef(false);

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;

    const next = searchParams.get("next") ?? "/";
    const supabase = createClient();
    let attempts = 0;

    const check = async () => {
      attempts++;
      // getSession reads directly from cookie — no network call, works immediately
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace(next);
        return;
      }
      if (attempts < 8) {
        // Retry up to ~4s — gives browser time to propagate cookies
        setTimeout(check, 500);
      } else {
        setFailed(true);
      }
    };

    // Small initial delay so browser finishes storing cookies from the redirect
    setTimeout(check, 300);
  }, [router, searchParams]);

  if (failed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4 bg-[#FBF7F2]">
        <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
          <Leaf size={28} className="text-primary-600" />
        </div>
        <p className="text-gray-700 font-semibold">Không xác nhận được phiên đăng nhập</p>
        <p className="text-sm text-gray-400">Có thể do trình duyệt chặn cookie hoặc phiên đã hết hạn.</p>
        <a
          href="/login"
          className="mt-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl text-sm"
        >
          Thử đăng nhập lại
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FBF7F2]">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">Đang xác nhận đăng nhập...</p>
    </div>
  );
}

export default function AuthSessionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SessionBridge />
    </Suspense>
  );
}
