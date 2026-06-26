"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { X, Plus, Minus, Leaf, ChevronLeft, ChevronRight } from "lucide-react";
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
  const images = item.images?.length ? item.images : [item.image];
  const [activeIdx, setActiveIdx] = useState(0);
  const touchStartX = useRef(0);

  const prev = () => setActiveIdx((i) => Math.max(0, i - 1));
  const next = () => setActiveIdx((i) => Math.min(images.length - 1, i + 1));

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) next();
    else if (diff < -45) prev();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-auto bg-white rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden">

        {/* Image carousel */}
        <div
          className="relative h-64 flex-shrink-0 bg-gray-100 overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="absolute inset-0 transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(${(i - activeIdx) * 100}%)` }}
            >
              <Image
                src={src}
                alt={`${item.name} – góc ${i + 1}`}
                fill
                className="object-cover"
                sizes="448px"
                priority={i === 0}
              />
            </div>
          ))}

          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center z-10"
            aria-label="Đóng"
          >
            <X size={18} className="text-white" />
          </button>

          {/* Tags */}
          {item.popular && (
            <span className="absolute top-4 left-4 text-[11px] bg-orange-500 text-white font-bold px-2.5 py-1 rounded-full z-10">
              🔥 Bán chạy
            </span>
          )}
          {item.new && !item.popular && (
            <span className="absolute top-4 left-4 text-[11px] bg-primary-600 text-white font-bold px-2.5 py-1 rounded-full z-10">
              Mới
            </span>
          )}

          {/* Only show controls when there are multiple images */}
          {images.length > 1 && (
            <>
              {/* Counter badge */}
              <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
                {activeIdx + 1} / {images.length}
              </span>

              {/* Dot indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className="h-1.5 rounded-full transition-all duration-200"
                    style={{ width: i === activeIdx ? "1.25rem" : "0.375rem", background: i === activeIdx ? "white" : "rgba(255,255,255,0.55)" }}
                    aria-label={`Ảnh ${i + 1}`}
                  />
                ))}
              </div>

              {/* Arrow buttons */}
              {activeIdx > 0 && (
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <ChevronLeft size={18} className="text-white" />
                </button>
              )}
              {activeIdx < images.length - 1 && (
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center z-10"
                >
                  <ChevronRight size={18} className="text-white" />
                </button>
              )}
            </>
          )}
        </div>

        {/* Info */}
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

        {/* Bottom action */}
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
