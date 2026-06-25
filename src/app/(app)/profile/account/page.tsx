"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, User, Phone, Mail, Clock, MapPin, Check, Globe } from "lucide-react";
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

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setAddress(u?.defaultAddress ?? "");
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

  const infoRows = [
    { icon: User, label: t("account.fullName"), value: user.name },
    { icon: Phone, label: t("account.phone"), value: user.phone },
    { icon: Mail, label: t("account.email"), value: user.email },
    {
      icon: Clock,
      label: t("account.joinDate"),
      value: new Date(user.joinDate).toLocaleDateString(lang === "en" ? "en-GB" : "vi-VN"),
    },
  ];

  const notificationSettings = [
    t("account.promoNotification"),
    t("account.orderNotification"),
    t("account.newsNotification"),
  ];

  const languages: { value: Lang; label: string }[] = [
    { value: "vi", label: t("account.vietnamese") },
    { value: "en", label: t("account.english") },
  ];

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 pt-12 pb-4 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">{t("account.title")}</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="card divide-y divide-gray-100">
          {infoRows.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-4">
              <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Icon size={16} className="text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400">{label}</p>
                <p className="font-medium text-gray-800 text-sm">{value}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </div>
          ))}
        </div>

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

        {/* Language switcher */}
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

        <div className="card p-4">
          <p className="font-semibold text-gray-800 mb-3">{t("account.notificationSettings")}</p>
          {notificationSettings.map((setting) => (
            <div key={setting} className="flex items-center justify-between py-2.5 border-b last:border-0 border-gray-100">
              <p className="text-sm text-gray-700">{setting}</p>
              <div className="w-11 h-6 bg-primary-600 rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
              </div>
            </div>
          ))}
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
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
