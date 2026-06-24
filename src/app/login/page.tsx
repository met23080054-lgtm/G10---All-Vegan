"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("Email hoặc mật khẩu không đúng.");
      return;
    }
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gray-50">
      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
        <Leaf size={32} className="text-white" />
      </div>
      <h1 className="text-2xl font-black text-gray-800 mb-1">All Vegan</h1>
      <p className="text-gray-400 text-sm mb-6">Đăng nhập để tiếp tục</p>

      <form onSubmit={handleSubmit} className="card w-full p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Email</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <Mail size={16} className="text-gray-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@email.com"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Mật khẩu</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <Lock size={16} className="text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-5">
        Chưa có tài khoản?{" "}
        <Link href="/register" className="text-primary-600 font-semibold">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
