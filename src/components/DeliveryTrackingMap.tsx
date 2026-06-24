"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";
import type { Map as LeafletMap, Marker as LeafletMarker } from "leaflet";

interface Props {
  originLat: number;
  originLng: number;
  destLat: number;
  destLng: number;
  progress: number;
}

function interpolate(originLat: number, originLng: number, destLat: number, destLng: number, t: number): [number, number] {
  return [originLat + (destLat - originLat) * t, originLng + (destLng - originLng) * t];
}

export default function DeliveryTrackingMap({ originLat, originLng, destLat, destLng, progress }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const bikeMarkerRef = useRef<LeafletMarker | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, { zoomControl: false, attributionControl: true });
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      const bounds = L.latLngBounds([[originLat, originLng], [destLat, destLng]]);
      map.fitBounds(bounds, { padding: [32, 32] });

      L.polyline([[originLat, originLng], [destLat, destLng]], {
        color: "#16a34a",
        weight: 3,
        dashArray: "6 8",
      }).addTo(map);

      const emojiIcon = (emoji: string) => L.divIcon({
        html: `<div style="font-size:22px;line-height:28px;text-align:center;">${emoji}</div>`,
        className: "",
        iconSize: [28, 28],
      });

      L.marker([originLat, originLng], { icon: emojiIcon("🏠") }).addTo(map);
      L.marker([destLat, destLng], { icon: emojiIcon("📍") }).addTo(map);

      bikeMarkerRef.current = L.marker(
        interpolate(originLat, originLng, destLat, destLng, progress),
        { icon: emojiIcon("🛵") }
      ).addTo(map);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      bikeMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    bikeMarkerRef.current?.setLatLng(interpolate(originLat, originLng, destLat, destLng, progress));
  }, [originLat, originLng, destLat, destLng, progress]);

  return <div ref={containerRef} className="w-full h-56 rounded-xl overflow-hidden" />;
}
