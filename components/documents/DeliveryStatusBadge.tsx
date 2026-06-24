import type { DeliveryStatus } from "@/lib/portal/v58/delivery/delivery.types";

const STYLES: Record<DeliveryStatus, string> = {
  pending: "bg-amber-950 text-amber-300 border-amber-800",
  ready: "bg-sky-950 text-sky-300 border-sky-800",
  delivered: "bg-emerald-950 text-emerald-300 border-emerald-800",
  archived: "bg-zinc-900 text-zinc-400 border-zinc-700",
};

const LABELS: Record<DeliveryStatus, string> = {
  pending: "待生成",
  ready: "可下载",
  delivered: "已交付",
  archived: "已归档",
};

export function DeliveryStatusBadge({ status }: { status: DeliveryStatus | string }) {
  const key = (status in STYLES ? status : "ready") as DeliveryStatus;
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[key]}`}
    >
      {LABELS[key]}
    </span>
  );
}
