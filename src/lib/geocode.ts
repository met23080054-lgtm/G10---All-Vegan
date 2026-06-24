import type { Store } from "@/data/stores";

export interface LatLng {
  lat: number;
  lng: number;
}

export async function geocodeAddress(address: string): Promise<LatLng | null> {
  const query = encodeURIComponent(`${address}, Hà Nội, Việt Nam`);
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "Accept-Language": "vi" } }
    );
    const data = await res.json();
    if (!data?.[0]) return null;
    return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  } catch {
    return null;
  }
}

export function nearestStore(stores: Store[], point: LatLng): Store | null {
  if (stores.length === 0) return null;
  return stores.reduce((closest, s) => {
    const d = Math.hypot(s.lat - point.lat, s.lng - point.lng);
    const dClosest = Math.hypot(closest.lat - point.lat, closest.lng - point.lng);
    return d < dClosest ? s : closest;
  });
}
