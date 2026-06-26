"use client";

import type { ReactNode } from "react";
import { X, ChevronRight } from "lucide-react";
import Link from "next/link";

export interface NotificationItem {
  id: string;
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
}

interface Props {
  notifications: NotificationItem[];
  onClose: () => void;
}

export default function NotificationPanel({ notifications, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 max-w-md mx-auto bg-white rounded-b-3xl max-h-[80vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <h3 className="text-lg font-bold">Thông báo</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={18} />
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">Không có thông báo mới</p>
          ) : (
            notifications.map((n) => {
              const inner = (
                <div className="flex items-start gap-3 px-5 py-3.5 w-full">
                  <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0 text-primary-600">
                    {n.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.description}</p>
                  </div>
                  {n.href && <ChevronRight size={16} className="text-gray-300 flex-shrink-0 mt-1" />}
                </div>
              );

              return n.href ? (
                <Link key={n.id} href={n.href} onClick={onClose} className="block hover:bg-gray-50 transition-colors">
                  {inner}
                </Link>
              ) : (
                <div key={n.id}>{inner}</div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
