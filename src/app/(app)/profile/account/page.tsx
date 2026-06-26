"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, User, Phone, Mail, Clock, MapPin, Check, Globe, Pencil, X } from "lucide-react";
import { getUser, saveDefaultDeliveryInfo } from "@/lib/store";
import type { User as UserType } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";
import { useLang } from "@/context/LanguageContext";
import type { Lang } from "@/lib/translations";

export default function AccountPage() {
  const router = useRouter();
  const { t, lang, setLang } = useLang();
  const [user, setUser] = useState<UserType | null>(null);
  const [address, setAddress] = useState("");
  const [savingAddress, setSavingAddress] = useState(false);
  const [savedJustNow, setSavedJustNow] = useState(false);

  // Edit states
  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [phoneValue, setPhoneValue] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setAddress(u?.defaultAddress ?? "");
      setNameValue(u?.name ?? "");
      setPhoneValue(u?.phone ?? "");
    });
  }, []);

  if (!user) return null;

  const handleSaveAddress = async () => {
    setSavingAddress(true);
    await saveDefaultDeliveryInfo(address, user.phone);
    setSavingAddress(false);
    setSavedJustNow(true);
    setTimeout(() => setSavedJustNow(false), 2000);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    setSavingProfile(true);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      await supabase.from("profiles").update({ name: nameValue.trim() }).eq("id", auth.user.id);
      setUser((u) => u ? { ...u, name: nameValue.trim() } : u);
    }
    setSavingProfile(false);
    setEditingName(false);
  };

  const handleSavePhone = async () => {
    if (!phoneValue.trim()) return;
    setSavingProfile(true);
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (auth.user) {
      await supabase.from("profiles").update({ phone: phoneValue.trim() }).eq("id", auth.user.id);
      setUser((u) => u ? { ...u, phone: phoneValue.trim() } : u);
    }
    setSavingProfile(false);
    setEditingPhone(false);
  };

  const languages: { value: Lang; label: string }[] = [
    { value: "vi", label: t("account.vietnamese") },
    { value: "en", label: t("account.english") },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 pt-12 pb-4 px-5">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">{t("account.title")}</h1>
        </div>
      </div>

      <div className="px-5 py-5 space-y-3">
        {/* Editable info */}
        <div className="card divide-y divide-gray-100">
          {/* Name */}
          <div className="p-4">
            {editingName ? (
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="flex-1 text-sm border border-primary-300 rounded-lg px-2 py-1 outline-none"
                  autoFocus
                />
                <button onClick={handleSaveName} disabled={savingProfile} className="text-primary-600">
                  <Check size={18} />
                </button>
                <button onClick={() => { setEditingName(false); setNameValue(user.name); }}>
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{t("account.fullName")}</p>
                  <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                </div>
                <button onClick={() => setEditingName(true)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <Pencil size={14} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="p-4">
            {editingPhone ? (
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  value={phoneValue}
                  onChange={(e) => setPhoneValue(e.target.value)}
                  type="tel"
                  className="flex-1 text-sm border border-primary-300 rounded-lg px-2 py-1 outline-none"
                  autoFocus
                />
                <button onClick={handleSavePhone} disabled={savingProfile} className="text-primary-600">
                  <Check size={18} />
                </button>
                <button onClick={() => { setEditingPhone(false); setPhoneValue(user.phone); }}>
                  <X size={16} className="text-gray-400" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={16} className="text-gray-500" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400">{t("account.phone")}</p>
                  <p className="font-medium text-gray-800 text-sm">{user.phone || "Chưa cập nhật"}</p>
                </div>
                <button onClick={() => setEditingPhone(true)} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                  <Pencil size={14} className="text-gray-400" />
                </button>
              </div>
            )}
          </div>

          {/* Email – read-only */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{t("account.email")}</p>
              <p className="font-medium text-gray-800 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Join date – read-only */}
          <div className="flex items-center gap-4 p-4">
            <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock size={16} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-400">{t("account.joinDate")}</p>
              <p className="font-medium text-gray-800 text-sm">
                {new Date(user.joinDate).toLocaleDateString(lang === "en" ? "en-GB" : "vi-VN")}
              </p>
            </div>
          </div>
        </div>

        {/* Default address */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={15} className="text-primary-600" />
            <p className="font-semibold text-gray-800">{t("account.savedAddress")}</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">{t("account.savedAddressHint")}</p>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t("account.addressPlaceholder")}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none h-16"
          />
          <button
            onClick={handleSaveAddress}
            disabled={savingAddress}
            className="btn-primary w-full mt-3 py-2.5 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {savedJustNow ? <><Check size={14} /> {t("account.saved")}</> : savingAddress ? t("account.saving") : t("account.saveAddress")}
          </button>
        </div>

        {/* Language */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe size={15} className="text-primary-600" />
            <p className="font-semibold text-gray-800">{t("account.language")}</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">{t("account.languageHint")}</p>
          <div className="flex gap-2">
            {languages.map(({ value, label }) => (
              <button
                key={value}
                onClick={() => setLang(value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                  lang === value
                    ? "bg-primary-600 text-white border-primary-600"
                    : "bg-white text-gray-600 border-gray-200 hover:border-primary-300"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={async () => {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push("/login");
            router.refresh();
          }}
          className="card w-full p-4 flex items-center justify-between text-red-500"
        >
          <span className="font-semibold text-sm">{t("account.signOut")}</span>
          <ChevronLeft size={16} className="rotate-180" />
        </button>
      </div>
    </div>
  );
}
