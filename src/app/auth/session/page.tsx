"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Suspense } from "react";
import { Leaf, RefreshCw } from "lucide-react";

function SessionBridge() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Đang xác nhận đăng nhập...");
  const [failed, setFailed] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const tried = useRef(false);

  const next = searchParams.get("next") ?? "/";

  useEffect(() => {
    if (tried.current) return;
    tried.current = true;

    let attempts = 0;

    const check = async () => {
      attempts++;
      setStatus(`Đang kiểm tra phiên... (${attempts}/8)`);

      // Create fresh client every attempt — avoids cached empty-session state
      const supabase = createClient();

      // 1. Try getSession (reads from cookies, no network)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStatus("Đăng nhập thành công, đang chuyển trang...");
        router.replace(next);
        return;
      }

      // 2. Fallback: getUser (network call, more authoritative)
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        setStatus("Đăng nhập thành công, đang chuyển trang...");
        router.replace(next);
        return;
      }

      if (attempts < 8) {
        setTimeout(check, 600);
      } else {
        setFailed(true);
        setErrMsg(error?.message || "Không tìm thấy phiên sau nhiều lần thử.");
      }
    };

    // Initial delay: let browser finish storing Set-Cookie from redirect
    setTimeout(check, 400);
  }, [router, next]);

  const retry = () => {
    tried.current = false;
    setFailed(false);
    setErrMsg("");
    setStatus("Đang thử lại...");
    // Small delay then re-run effect
    setTimeout(() => { tried.current = false; }, 100);
    window.location.reload();
  };

  if (failed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center gap-4 bg-[#FBF7F2]">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
          <Leaf size={28} className="text-red-500" />
        </div>
        <p className="text-gray-800 font-bold text-lg">Đăng nhập không thành công</p>
        {errMsg && (
          <p className="text-xs text-gray-400 bg-gray-100 rounded-xl px-4 py-2 max-w-xs break-all">
            {errMsg}
          </p>
        )}
        <p className="text-sm text-gray-500">
          Trình duyệt có thể đã chặn cookie xác thực. Thử mở link trong Chrome hoặc Safari.
        </p>
        <div className="flex flex-col gap-2 w-full max-w-xs">
          <button
            onClick={retry}
            className="flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl text-sm"
          >
            <RefreshCw size={16} /> Thử lại
          </button>
          <a
            href="/login"
            className="text-center text-sm text-gray-500 py-2 underline"
          >
            Quay lại đăng nhập
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#FBF7F2]">
      <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-gray-400">{status}</p>
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
