"use client";

import Image from "next/image";
import { X, Plus, Minus, Leaf } from "lucide-react";
import { formatPrice } from "@/lib/store";
import type { MenuItem } from "@/data/menu";

export default function MenuItemModal({
  item,
  quantity,
  onClose,
  onAdd,
  onUpdateQty,
}: {
  item: MenuItem;
  quantity: number;
  onClose: () => void;
  onAdd: (item: MenuItem) => void;
  onUpdateQty: (id: string, delta: number) => void;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="relative h-64 flex-shrink-0 bg-gray-100">
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="448px" priority />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center"
            aria-label="Đóng"
          >
            <X size={18} className="text-white" />
          </button>
          {item.popular && (
            <span className="absolute top-4 left-4 text-[11px] bg-orange-500 text-white font-bold px-2.5 py-1 rounded-full">🔥 Bán chạy</span>
          )}
          {item.new && (
            <span className="absolute top-4 left-4 text-[11px] bg-primary-600 text-white font-bold px-2.5 py-1 rounded-full">Mới</span>
          )}
        </div>

        <div className="px-5 py-4 overflow-y-auto flex-1 min-h-0 space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{item.nameEn}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {item.tags.map((tag) => (
              <span key={tag} className="text-xs bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>

          <p className="text-2xl font-extrabold text-primary-600">{formatPrice(item.price)}</p>

          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Leaf size={14} className="text-primary-500" />
              <p className="font-semibold text-gray-800 text-sm">Mô tả & nguyên liệu</p>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>
        </div>

        <div className="px-5 pt-4 pb-safe-4 border-t border-gray-100 flex-shrink-0 flex items-center gap-3">
          {quantity === 0 ? (
            <button
              onClick={() => onAdd(item)}
              className="btn-primary flex-1 py-3.5 text-base flex items-center justify-center gap-2"
            >
              <Plus size={18} /> Thêm vào giỏ
            </button>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onUpdateQty(item.id, -1)}
                  className="w-10 h-10 border-2 border-primary-600 rounded-full flex items-center justify-center"
                >
                  <Minus size={16} className="text-primary-600" />
                </button>
                <span className="text-lg font-bold text-gray-800 w-6 text-center">{quantity}</span>
                <button
                  onClick={() => onUpdateQty(item.id, 1)}
                  className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center"
                >
                  <Plus size={16} className="text-white" />
                </button>
              </div>
              <p className="font-bold text-gray-800">{formatPrice(item.price * quantity)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
