"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Star, Send, CheckCircle, Camera, ThumbsUp } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { getOrders, formatPrice } from "@/lib/store";
import type { Order } from "@/lib/store";
import clsx from "clsx";

const CATEGORIES_BY_TYPE: Record<Order["type"], { id: string; label: string }[]> = {
  delivery: [
    { id: "food", label: "Chất lượng món ăn" },
    { id: "delivery", label: "Tốc độ giao hàng" },
    { id: "packaging", label: "Đóng gói cẩn thận" },
    { id: "price", label: "Giá cả hợp lý" },
  ],
  "dine-in": [
    { id: "food", label: "Chất lượng món ăn" },
    { id: "service", label: "Thái độ phục vụ" },
    { id: "speed", label: "Tốc độ phục vụ" },
    { id: "space", label: "Không gian quán" },
    { id: "price", label: "Giá cả hợp lý" },
  ],
  takeaway: [
    { id: "food", label: "Chất lượng món ăn" },
    { id: "service", label: "Thái độ phục vụ" },
    { id: "speed", label: "Tốc độ chuẩn bị" },
    { id: "price", label: "Giá cả hợp lý" },
  ],
};

const QUICK_FEEDBACK = [
  "Món ăn rất ngon!",
  "Nhân viên thân thiện",
  "Giao hàng nhanh",
  "Không gian đẹp",
  "Giá cả hợp lý",
  "Sẽ quay lại",
];

interface ReviewRow {
  id: number;
  reviewer_name: string;
  overall_rating: number;
  comment: string | null;
  created_at: string;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Vừa xong";
  if (mins < 60) return `${mins} phút trước`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

function FeedbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [itemRatings, setItemRatings] = useState<Record<string, number>>({});
  const [overallRating, setOverallRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [quickTags, setQuickTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<"write" | "read">("write");
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [order, setOrder] = useState<Order | null>(null);

  const orderId = searchParams.get("orderId");
  const categories = CATEGORIES_BY_TYPE[order?.type ?? "dine-in"];

  const refreshReviews = () => {
    const supabase = createClient();
    supabase
      .from("reviews")
      .select("id, reviewer_name, overall_rating, comment, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (data) setReviews(data);
      });
  };

  useEffect(() => {
    refreshReviews();
    if (orderId) {
      getOrders().then((orders) => {
        setOrder(orders.find((o) => o.id === orderId) ?? null);
      });
    }
  }, [orderId]);

  const toggleTag = (tag: string) => {
    setQuickTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
  };

  const submit = async () => {
    if (overallRating === 0) { alert("Vui lòng chọn số sao đánh giá!"); return; }
    if (!orderId) { alert("Thiếu mã đơn hàng để đánh giá."); return; }
    if (submitting) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("submit_review", {
      p_order_id: orderId,
      p_overall: overallRating,
      p_category_ratings: ratings,
      p_comment: comment || null,
      p_quick_tags: quickTags,
      p_item_ratings: itemRatings,
    });
    setSubmitting(false);
    if (error) {
      alert(error.message || "Không thể gửi đánh giá, vui lòng thử lại.");
      return;
    }
    setSubmitted(true);
    refreshReviews();
    setTimeout(() => {
      setSubmitted(false);
      setOverallRating(0);
      setRatings({});
      setItemRatings({});
      setComment("");
      setQuickTags([]);
    }, 4000);
  };

  const ratingLabels = ["", "Rất tệ", "Không hài lòng", "Bình thường", "Hài lòng", "Tuyệt vời!"];
  const ratingColors = ["", "text-red-500", "text-orange-500", "text-yellow-500", "text-blue-500", "text-primary-600"];

  const averageRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.overall_rating, 0) / reviews.length).toFixed(1)
    : "0.0";
  const distribution = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.overall_rating === star).length;
    return { star, percent: reviews.length ? Math.round((count / reviews.length) * 100) : 0 };
  });

  return (
    <div className="min-h-screen bg-[#FBF7F2]">
      <div className="bg-white shadow-sm sticky top-0 z-20">
        <div className="flex items-center gap-3 px-4 pt-12 pb-4">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-lg font-bold flex-1">Đánh giá & Phản hồi</h1>
        </div>
        <div className="flex border-b border-gray-100">
          {(["write", "read"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "flex-1 py-3 text-sm font-semibold border-b-2 transition-all",
                activeTab === tab ? "border-primary-600 text-primary-600" : "border-transparent text-gray-500"
              )}
            >
              {tab === "write" ? "✍️ Viết đánh giá" : "💬 Xem đánh giá"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "write" && (
        <div className="px-4 py-5 space-y-5">
          {!orderId && (
            <div className="card p-5 text-center">
              <div className="text-5xl mb-3">🧾</div>
              <p className="font-bold text-gray-800 mb-1">Bạn chưa có đơn hàng</p>
              <p className="text-sm text-gray-500 mb-4">
                Vui lòng đặt món hoặc đặt giao hàng trước, sau đó đánh giá từ trang lịch sử đơn hàng.
              </p>
              <Link href="/delivery" className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2">
                Đặt hàng ngay
              </Link>
            </div>
          )}
          {orderId && (
            <div className="card p-3 flex items-center gap-2 text-sm text-primary-700 bg-primary-50 border-primary-200 border">
              <CheckCircle size={16} />
              Đánh giá cho đơn hàng #{orderId}
              {order && (
                <span className="text-xs text-primary-500 ml-auto">
                  {order.type === "delivery" ? "Giao hàng" : order.type === "dine-in" ? "Tại quán" : "Mang về"}
                </span>
              )}
            </div>
          )}

          {/* Overall rating - only show when have order */}
          {!orderId && null}
          <div className={orderId ? "" : "hidden"}>
          <div className="card p-5 text-center">
            <p className="font-bold text-gray-800 mb-1">Trải nghiệm tổng thể</p>
            <p className="text-sm text-gray-400 mb-4">Cảm nhận của bạn về All Vegan?</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setOverallRating(star)}
                  className="transition-transform hover:scale-110 active:scale-90"
                >
                  <Star
                    size={40}
                    className={clsx(
                      "transition-colors",
                      star <= (hoverRating || overallRating) ? "text-yellow-400" : "text-gray-200"
                    )}
                    fill={star <= (hoverRating || overallRating) ? "currentColor" : "none"}
                  />
                </button>
              ))}
            </div>
            {(overallRating > 0 || hoverRating > 0) && (
              <p className={`font-bold text-lg ${ratingColors[hoverRating || overallRating]}`}>
                {ratingLabels[hoverRating || overallRating]}
              </p>
            )}
          </div>

          {/* Per-item ratings */}
          {order && order.items.length > 0 && (
            <div className="card p-4">
              <p className="font-bold text-gray-800 mb-1">Đánh giá từng món</p>
              <p className="text-xs text-gray-400 mb-3">Món nào ngon, món nào chưa ổn?</p>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-700 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{formatPrice(item.price)}</p>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button key={s} onClick={() => setItemRatings((prev) => ({ ...prev, [item.id]: s }))}>
                          <Star
                            size={16}
                            className={s <= (itemRatings[item.id] ?? 0) ? "text-yellow-400" : "text-gray-200"}
                            fill={s <= (itemRatings[item.id] ?? 0) ? "currentColor" : "none"}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category ratings */}
          <div className="card p-4">
            <p className="font-bold text-gray-800 mb-3">Đánh giá chi tiết</p>
            <div className="space-y-4">
              {categories.map((cat) => (
                <div key={cat.id}>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm text-gray-700">{cat.label}</p>
                    {ratings[cat.id] > 0 && (
                      <span className="text-xs text-yellow-500 font-semibold">{ratings[cat.id]}/5</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        onClick={() => setRatings((prev) => ({ ...prev, [cat.id]: s }))}
                        className="flex-1"
                      >
                        <Star
                          size={20}
                          className={s <= (ratings[cat.id] ?? 0) ? "text-yellow-400" : "text-gray-200"}
                          fill={s <= (ratings[cat.id] ?? 0) ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick feedback tags */}
          <div className="card p-4">
            <p className="font-bold text-gray-800 mb-3">Điều bạn thích?</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_FEEDBACK.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    quickTags.includes(tag)
                      ? "bg-primary-600 border-primary-600 text-white"
                      : "border-gray-200 text-gray-600 bg-white"
                  )}
                >
                  {quickTags.includes(tag) ? "✓ " : ""}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="card p-4">
            <p className="font-bold text-gray-800 mb-3">Chia sẻ thêm ý kiến</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Nhà hàng có thể cải thiện điều gì? Bạn thích nhất điều gì?..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary-400 resize-none h-28"
            />
            <div className="flex items-center gap-2 mt-2">
              <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg px-3 py-1.5">
                <Camera size={13} /> Thêm ảnh
              </button>
              <span className="text-xs text-gray-300">{comment.length}/500</span>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Send size={18} /> {submitting ? "Đang gửi..." : "Gửi đánh giá"}
          </button>
          </div>
        </div>
      )}

      {activeTab === "read" && (
        <div className="px-4 py-5 space-y-4">
          {/* Summary */}
          <div className="card p-5">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <p className="text-5xl font-black text-gray-800">{averageRating}</p>
                <div className="flex justify-center mt-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} size={14} className="text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-1">{reviews.length.toLocaleString("vi-VN")} đánh giá</p>
              </div>
              <div className="flex-1 space-y-1.5">
                {distribution.map(({ star, percent }) => (
                  <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-3 text-right">{star}</span>
                    <Star size={10} className="text-yellow-400" fill="currentColor" />
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                    <span className="w-6 text-right">{percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div className="space-y-3">
            {reviews.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-8">Chưa có đánh giá nào</p>
            )}
            {reviews.slice(0, 20).map((review) => (
              <div key={review.id} className="card p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {review.reviewer_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-gray-800 text-sm">{review.reviewer_name}</p>
                      <span className="text-xs text-gray-400">{formatRelativeTime(review.created_at)}</span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, s) => (
                        <Star key={s} size={12} className={s < review.overall_rating ? "text-yellow-400" : "text-gray-200"} fill="currentColor" />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
                    <button className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                      <ThumbsUp size={12} /> Hữu ích
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {submitted && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-3xl p-8 mx-6 text-center shadow-2xl">
            <div className="text-6xl mb-4">🙏</div>
            <h3 className="text-xl font-black text-gray-800 mb-2">Cảm ơn bạn!</h3>
            <p className="text-gray-500 text-sm">Đánh giá của bạn giúp chúng tôi phục vụ tốt hơn</p>
            <div className="flex items-center justify-center gap-2 mt-4 bg-amber-50 rounded-xl p-3">
              <Star size={16} className="text-amber-500" fill="currentColor" />
              <p className="text-sm font-semibold text-amber-700">+50 điểm thưởng đã được cộng!</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <FeedbackContent />
    </Suspense>
  );
}
