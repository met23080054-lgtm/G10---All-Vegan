export const DELIVERY_STAGES = [
  { key: "placed", label: "Đã đặt đơn thành công", threshold: 0 },
  { key: "cooking", label: "Bếp đang chuẩn bị món", threshold: 0.15 },
  { key: "finding_driver", label: "Đang tìm tài xế", threshold: 0.45 },
  { key: "delivering", label: "Đang giao đến bạn", threshold: 0.65 },
] as const;

export function getDeliveryStageIndex(progress: number): number {
  let idx = 0;
  DELIVERY_STAGES.forEach((s, i) => {
    if (progress >= s.threshold) idx = i;
  });
  return idx;
}

export function isFinalDeliveryStage(progress: number): boolean {
  return getDeliveryStageIndex(progress) === DELIVERY_STAGES.length - 1;
}
