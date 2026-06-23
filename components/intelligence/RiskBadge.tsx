import type { RiskSeverity } from "@/lib/portal/v59/risk/risk.intelligence";

const STYLES: Record<RiskSeverity, string> = {
  low: "bg-zinc-900 text-zinc-400 border-zinc-700",
  medium: "bg-amber-950 text-amber-300 border-amber-800",
  high: "bg-orange-950 text-orange-300 border-orange-800",
  critical: "bg-red-950 text-red-300 border-red-800",
};

export function RiskBadge({ severity, label }: { severity: RiskSeverity | string; label?: string }) {
  const key = (severity in STYLES ? severity : "medium") as RiskSeverity;
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${STYLES[key]}`}>
      {label ?? severity}
    </span>
  );
}
