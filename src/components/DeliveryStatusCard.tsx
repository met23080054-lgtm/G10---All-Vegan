"use client";

import { useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import clsx from "clsx";
import DeliveryTrackingMap from "@/components/DeliveryTrackingMap";
import { DELIVERY_STAGES, getDeliveryStageIndex } from "@/lib/deliveryStatus";

interface Props {
  createdAt: string;
  estimatedMinutes: number | null | undefined;
  storeLat: number | null | undefined;
  storeLng: number | null | undefined;
  deliveryLat: number | null | undefined;
  deliveryLng: number | null | undefined;
}

export default function DeliveryStatusCard({
  createdAt, estimatedMinutes, storeLat, storeLng, deliveryLat, deliveryLng,
}: Props) {
  const [progress, setProgress] = useState(0.02);

  useEffect(() => {
    if (!estimatedMinutes) return;
    const compute = () => {
      const elapsedMs = Date.now() - new Date(createdAt).getTime();
      const totalMs = estimatedMinutes * 60000;
      setProgress(Math.min(0.95, Math.max(0.02, elapsedMs / totalMs)));
    };
    compute();
    const interval = setInterval(compute, 5000);
    return () => clearInterval(interval);
  }, [createdAt, estimatedMinutes]);

  const stageIndex = getDeliveryStageIndex(progress);
  const hasCoords = storeLat != null && storeLng != null && deliveryLat != null && deliveryLng != null;
  const showMap = stageIndex === DELIVERY_STAGES.length - 1 && hasCoords;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {DELIVERY_STAGES.map((stage, i) => (
          <div key={stage.key} className="flex items-center gap-3">
            <div className={clsx(
              "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
              i <= stageIndex ? "bg-primary-600" : "bg-gray-200"
            )}>
              {i <= stageIndex ? <CheckCircle size={14} className="text-white" /> : <span className="w-2 h-2 rounded-full bg-white" />}
            </div>
            <span className={clsx("text-sm", i <= stageIndex ? "text-gray-800 font-medium" : "text-gray-400")}>
              {stage.label}
            </span>
          </div>
        ))}
      </div>

      {showMap && (
        <div>
          <DeliveryTrackingMap
            originLat={storeLat!}
            originLng={storeLng!}
            destLat={deliveryLat!}
            destLng={deliveryLng!}
            progress={progress}
          />
          <p className="text-xs text-gray-400 mt-2">🛵 Vị trí giao hàng mô phỏng theo thời gian thực</p>
        </div>
      )}
    </div>
  );
}
