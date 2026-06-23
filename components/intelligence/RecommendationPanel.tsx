import Link from "next/link";
import type { Recommendation } from "@/lib/portal/v59/recommendations/recommendation.engine";
import { RiskBadge } from "./RiskBadge";

type RecommendationPanelProps = {
  recommendations: Recommendation[];
  title?: string;
};

export function RecommendationPanel({
  recommendations,
  title = "Recommended Actions",
}: RecommendationPanelProps) {
  if (recommendations.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-950/50 p-6 text-center text-sm text-zinc-500">
        暂无推荐操作 — 交付状态良好
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      <ul className="mt-4 space-y-3">
        {recommendations.map((rec) => (
          <li
            key={rec.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-zinc-800 px-4 py-3"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-white">{rec.label}</span>
                <RiskBadge
                  severity={rec.priority === "high" ? "high" : rec.priority === "medium" ? "medium" : "low"}
                  label={rec.priority}
                />
              </div>
              <p className="mt-1 text-xs text-zinc-500">{rec.reason}</p>
            </div>
            <Link
              href={rec.href}
              className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-semibold text-white hover:bg-violet-500"
            >
              执行
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
