"use client";

import { createClient } from "@/lib/supabase/client";
import type { MenuItem } from "@/data/menu";
import type { Store } from "@/data/stores";

let _menuCache: MenuItem[] | null = null;
let _storeCache: Store[] | null = null;

export async function getMenuItems(): Promise<MenuItem[]> {
  if (_menuCache) return _menuCache;
  const supabase = createClient();
  const { data, error } = await supabase.from("menu_items").select("*").eq("active", true).order("id");
  if (error || !data) return [];
  _menuCache = data.map((m) => ({
    id: m.id,
    name: m.name,
    nameEn: m.name_en,
    category: m.category,
    price: m.price,
    description: m.description,
    image: m.image,
    tags: m.tags,
    popular: m.popular,
    new: m.is_new,
  }));
  return _menuCache;
}

export async function getStores(): Promise<Store[]> {
  if (_storeCache) return _storeCache;
  const supabase = createClient();
  const { data, error } = await supabase.from("stores").select("*").order("id");
  if (error || !data) return [];
  _storeCache = data.map((s) => ({
    id: s.id,
    name: s.name,
    address: s.address,
    district: s.district,
    phone: s.phone,
    hours: s.hours,
    lat: s.lat,
    lng: s.lng,
    mapUrl: s.map_url,
    features: s.features,
  }));
  return _storeCache;
}
