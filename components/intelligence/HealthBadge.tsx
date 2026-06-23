import type { HealthLevel } from "@/lib/portal/v59/scoring/health.engine";

const STYLES: Record<HealthLevel, string> = {
  healthy: "bg-emerald-950 text-emerald-300 border-emerald-800",
  warning: "bg-amber-950 text-amber-300 border-amber-800",
  critical: "bg-red-950 text-red-300 border-red-800",
};

const LABELS: Record<HealthLevel, string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
};

export function HealthBadge({ level, score }: { level: HealthLevel | string; score?: number }) {
  const key = (level in STYLES ? level : "warning") as HealthLevel;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[key]}`}
    >
      {LABELS[key]}
      {score !== undefined ? <span className="opacity-80">· {score}%</span> : null}
    </span>
  );
}
