type HealthStatusProps = {
  status: "healthy" | "degraded" | "down";
  score?: number;
};

const STYLES = {
  healthy: "bg-emerald-950 text-emerald-300 border-emerald-800",
  degraded: "bg-amber-950 text-amber-300 border-amber-800",
  down: "bg-red-950 text-red-300 border-red-800",
};

export function HealthStatusBadge({ status, score }: HealthStatusProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase ${STYLES[status]}`}>
      {status}
      {score !== undefined ? ` · ${score}%` : ""}
    </span>
  );
}
