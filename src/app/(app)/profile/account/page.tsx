"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, User, Phone, Mail, Clock, MapPin, Check } from "lucide-react";
import { getUser, saveDefaultDeliveryInfo } from "@/lib/store";
import type { User as UserType } from "@/lib/store";
import { createClient } from "@/lib/supabase/client";

export default function AccountPage() {
  const router = useRouter();
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

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-gradient-to-br from-gray-800 to-gray-700 pt-12 pb-4 px-4">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft size={20} className="text-white" />
          </button>
          <h1 className="text-lg font-bold text-white flex-1">Tài khoản</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-3">
        <div className="card divide-y divide-gray-100">
          {[
            { icon: User, label: "Họ và tên", value: user.name },
            { icon: Phone, label: "Số điện thoại", value: user.phone },
            { icon: Mail, label: "Email", value: user.email },
            { icon: Clock, label: "Ngày tham gia", value: new Date(user.joinDate).toLocaleDateString("vi-VN") },
          ].map(({ icon: Icon, label, value }) => (
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
            <p className="font-semibold text-gray-800">Địa chỉ giao hàng đã lưu</p>
          </div>
          <p className="text-xs text-gray-400 mb-3">Dùng để tự điền khi đặt giao hàng lần sau</p>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Chưa có địa chỉ nào được lưu..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none h-16"
          />
          <button
            onClick={handleSaveAddress}
            disabled={savingAddress}
            className="btn-primary w-full mt-3 py-2.5 text-sm flex items-center justify-center gap-1.5 disabled:opacity-60"
          >
            {savedJustNow ? <><Check size={14} /> Đã lưu</> : savingAddress ? "Đang lưu..." : "Lưu địa chỉ"}
          </button>
        </div>

        <div className="card p-4">
          <p className="font-semibold text-gray-800 mb-3">Cài đặt thông báo</p>
          {["Thông báo khuyến mãi", "Cập nhật đơn hàng", "Tin tức từ All Vegan"].map((setting) => (
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
          <span className="font-semibold text-sm">Đăng xuất</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
