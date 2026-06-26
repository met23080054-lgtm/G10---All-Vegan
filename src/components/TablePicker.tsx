"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import clsx from "clsx";

interface Props {
  value: string;
  onChange: (table: string) => void;
}

const FLOOR = "Tầng 2 – Buffet";
const SECTIONS = [
  { label: "Khu A (bàn 1–8)", tables: [1, 2, 3, 4, 5, 6, 7, 8] },
  { label: "Khu B (bàn 9–15)", tables: [9, 10, 11, 12, 13, 14, 15] },
];

export default function TablePicker({ value, onChange }: Props) {
  const [occupied, setOccupied] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("orders")
      .select("table_number")
      .eq("order_type", "dine-in")
      .not("status", "in", '("completed","cancelled")')
      .not("table_number", "is", null)
      .then(({ data }) => {
        if (data) setOccupied(new Set(data.map((r) => r.table_number as string)));
      });
  }, []);

  return (
    <div className="mt-3 space-y-3">
      <div className="flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-3 py-2">
        <span className="text-base">🏢</span>
        <div>
          <p className="text-xs font-bold text-primary-700">{FLOOR}</p>
          <p className="text-[11px] text-primary-500">Tất cả bàn đều thuộc tầng 2</p>
        </div>
      </div>

      {SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="text-xs font-semibold text-gray-500 mb-1.5">{section.label}</p>
          <div className="grid grid-cols-8 gap-1.5">
            {section.tables.map((n) => {
              const key = String(n);
              const isOccupied = occupied.has(key);
              const isSelected = value === key;
              return (
                <button
                  key={n}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => onChange(key)}
                  className={clsx(
                    "aspect-square rounded-lg text-xs font-bold flex items-center justify-center border-2 transition-all",
                    isOccupied
                      ? "bg-red-50 border-red-200 text-red-300 cursor-not-allowed"
                      : isSelected
                      ? "bg-primary-600 border-primary-600 text-white shadow"
                      : "bg-green-50 border-green-200 text-green-700 hover:border-primary-400"
                  )}
                  title={isOccupied ? `Bàn ${n} đang có khách` : `Bàn ${n}`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3 text-xs text-gray-500 pt-1">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-100 border border-green-300 inline-block" />
          Trống
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-50 border border-red-200 inline-block" />
          Có khách
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-primary-600 inline-block" />
          Đang chọn
        </span>
      </div>

      {value && (
        <p className="text-xs text-primary-700 font-semibold">
          Bàn đã chọn: <strong>Bàn {value}</strong>
          {occupied.has(value) ? " ⚠️ Bàn này đang có khách!" : ""}
        </p>
      )}
    </div>
  );
}
