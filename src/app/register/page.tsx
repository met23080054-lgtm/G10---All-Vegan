"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Leaf, Mail, Lock, User, Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useLang } from "@/context/LanguageContext";
import type { Lang } from "@/lib/translations";

function LangToggle() {
  const { lang, setLang } = useLang();
  const options: { value: Lang; label: string }[] = [
    { value: "vi", label: "VI" },
    { value: "en", label: "EN" },
  ];
  return (
    <div className="flex gap-1 bg-white/70 backdrop-blur rounded-full p-1 shadow-sm border border-gray-100">
      {options.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => setLang(value)}
          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
            lang === value
              ? "bg-primary-600 text-white shadow"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, phone } },
    });
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    sessionStorage.setItem("av_just_logged_in", "1");
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[#FBF7F2] py-10 relative">
      <div className="absolute top-12 right-6">
        <LangToggle />
      </div>

      <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-4">
        <Leaf size={32} className="text-white" />
      </div>
      <h1 className="text-2xl font-black text-gray-800 mb-1">{t("register.title")}</h1>
      <p className="text-gray-400 text-sm mb-6">{t("register.subtitle")}</p>

      <form onSubmit={handleSubmit} className="card w-full p-5 space-y-4">
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t("register.name")}</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <User size={16} className="text-gray-400" />
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("register.namePlaceholder")}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t("register.phone")}</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <Phone size={16} className="text-gray-400" />
            <input
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912 345 678"
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>
        <div>
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t("register.email")}</label>
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
          <label className="text-sm font-semibold text-gray-700 mb-1.5 block">{t("register.password")}</label>
          <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5">
            <Lock size={16} className="text-gray-400" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("register.passwordHint")}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? t("register.loading") : t("register.submit")}
        </button>

        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-400">{t("register.or")}</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <GoogleSignInButton />
      </form>

      <p className="text-sm text-gray-500 mt-5">
        {t("register.hasAccount")}{" "}
        <Link href="/login" className="text-primary-600 font-semibold">
          {t("register.loginLink")}
        </Link>
      </p>
    </div>
  );
}
