"use client";

import { createClient } from "@/lib/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  note?: string;
}

export interface User {
  name: string;
  phone: string;
  email: string;
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  totalSpent: number;
  joinDate: string;
  ordersCount: number;
  defaultAddress?: string;
}

export type PaymentMethod = "cash" | "momo" | "vnpay" | "zalopay" | "bank_transfer";

export interface Order {
  id: string;
  date: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  status: "pending" | "confirmed" | "preparing" | "delivering" | "completed" | "cancelled";
  type: "dine-in" | "takeaway" | "delivery";
  address?: string;
  pointsEarned: number;
  invoiceId?: string;
  storeLat?: number;
  storeLng?: number;
  deliveryLat?: number;
  deliveryLng?: number;
  estimatedMinutes?: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "paid" | "failed";
}

export interface Voucher {
  id: string;
  code: string;
  name: string;
  discount: number;
  type: "percent" | "fixed";
  minOrder: number;
  expiry: string;
  used: boolean;
  pointsCost?: number;
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", auth.user.id)
    .single();
  if (error || !data) return null;

  return {
    name: data.name,
    phone: data.phone,
    email: data.email,
    points: data.points,
    tier: data.tier,
    totalSpent: data.total_spent,
    joinDate: data.join_date,
    ordersCount: data.orders_count,
    defaultAddress: data.default_address ?? undefined,
  };
}

export async function saveDefaultDeliveryInfo(address: string, phone: string): Promise<void> {
  const supabase = createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return;
  await supabase.from("profiles").update({ default_address: address, phone }).eq("id", auth.user.id);
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("av_cart");
  return stored ? JSON.parse(stored) : [];
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("av_cart", JSON.stringify(cart));
}

export async function getOrders(): Promise<Order[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });
  if (error || !data) return [];

  return data.map((o) => ({
    id: o.id,
    date: new Date(o.created_at).toLocaleString("vi-VN"),
    createdAt: o.created_at,
    items: (o.order_items ?? []).map((i: { menu_item_id: string; name: string; price: number; quantity: number; note: string | null }) => ({
      id: i.menu_item_id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
      image: "",
      note: i.note ?? undefined,
    })),
    total: o.total,
    status: o.status,
    type: o.order_type,
    address: o.address ?? undefined,
    pointsEarned: o.points_earned,
    invoiceId: o.invoice_id ?? undefined,
    storeLat: o.store_lat ?? undefined,
    storeLng: o.store_lng ?? undefined,
    deliveryLat: o.delivery_lat ?? undefined,
    deliveryLng: o.delivery_lng ?? undefined,
    estimatedMinutes: o.estimated_minutes ?? undefined,
    paymentMethod: o.payment_method,
    paymentStatus: o.payment_status,
  }));
}

export async function getActiveDelivery(): Promise<Order | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_type", "delivery")
    .eq("status", "delivering")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    date: new Date(data.created_at).toLocaleString("vi-VN"),
    createdAt: data.created_at,
    items: (data.order_items ?? []).map((i: { menu_item_id: string; name: string; price: number; quantity: number; note: string | null }) => ({
      id: i.menu_item_id, name: i.name, price: i.price, quantity: i.quantity, image: "", note: i.note ?? undefined,
    })),
    total: data.total,
    status: data.status,
    type: data.order_type,
    address: data.address ?? undefined,
    pointsEarned: data.points_earned,
    storeLat: data.store_lat ?? undefined,
    storeLng: data.store_lng ?? undefined,
    deliveryLat: data.delivery_lat ?? undefined,
    deliveryLng: data.delivery_lng ?? undefined,
    estimatedMinutes: data.estimated_minutes ?? undefined,
    paymentMethod: data.payment_method,
    paymentStatus: data.payment_status,
  };
}

export async function markDeliveryCompletedIfExpired(orderId: string): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("mark_delivery_completed", { p_order_id: orderId });
}

export async function getVouchers(): Promise<Voucher[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_vouchers")
    .select("*, voucher_templates(*)")
    .order("redeemed_at", { ascending: false });
  if (error || !data) return [];

  return data.map((v) => ({
    id: String(v.id),
    code: v.code,
    name: v.voucher_templates.name,
    discount: v.voucher_templates.discount,
    type: v.voucher_templates.discount_type,
    minOrder: v.voucher_templates.min_order,
    expiry: v.expiry,
    used: v.used,
    pointsCost: v.voucher_templates.points_cost || undefined,
  }));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

export function getTierInfo(tier: User["tier"]) {
  const tiers = {
    bronze:   { label: "Đồng",     color: "text-amber-700",  bg: "bg-amber-100",  border: "border-amber-400",  minPoints: 0,     maxPoints: 2999,  nextTier: "Bạc",      nextTierId: "silver"   as const },
    silver:   { label: "Bạc",      color: "text-gray-600",   bg: "bg-gray-100",   border: "border-gray-400",   minPoints: 3000,  maxPoints: 9999,  nextTier: "Vàng",     nextTierId: "gold"     as const },
    gold:     { label: "Vàng",     color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-400", minPoints: 10000, maxPoints: 24999, nextTier: "Bạch Kim", nextTierId: "platinum" as const },
    platinum: { label: "Bạch Kim", color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-400", minPoints: 25000, maxPoints: 99999, nextTier: null,       nextTierId: null },
  };
  return tiers[tier];
}

export function getOrderStatusLabel(status: Order["status"]): { label: string; color: string } {
  const map = {
    pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-700" },
    confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-700" },
    preparing: { label: "Đang chuẩn bị", color: "bg-orange-100 text-orange-700" },
    delivering: { label: "Đang giao hàng", color: "bg-indigo-100 text-indigo-700" },
    completed: { label: "Hoàn thành", color: "bg-green-100 text-green-700" },
    cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-700" },
  };
  return map[status];
}

export function getPaymentMethodLabel(method: PaymentMethod): { label: string; color: string } {
  const map = {
    cash: { label: "Tiền mặt", color: "bg-green-100 text-green-700" },
    momo: { label: "MoMo", color: "bg-pink-100 text-pink-700" },
    vnpay: { label: "VNPay", color: "bg-blue-100 text-blue-700" },
    zalopay: { label: "ZaloPay", color: "bg-sky-100 text-sky-700" },
    bank_transfer: { label: "Chuyển khoản", color: "bg-purple-100 text-purple-700" },
  };
  return map[method];
}
